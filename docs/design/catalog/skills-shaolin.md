# 门派武学图鉴 · 少林（skills-shaolin）

> **版本**：v1.2（AR-01 扩充；全局审计）；经脉系统落地、绝招数量调整（2026-09-27）；M4 返修（解锁层 7/9/10、同门绝招独立路线）；图鉴一致性审计、天中 / 地中绝招数统一、外放标记、绝招路线叙事化（2026-09-28）。
> **归属（基准 §18）**：`design/catalog/skills-*.md`——门派武学图鉴。本文定义少林派（嵩山少林）、南少林及其旁支武学；门派制度、Buff、阵法、套装与书界投放只登记接口。
> **上游**：`docs/decisions/author-requirements.md` AR-01/02/07/08/14；`docs/decisions/author-decisions.md` P06/P09/P32/P47/P49；`docs/00-canon.md` v1.2（§2–§4、§6–§7、§12–§13、§16、§18、§20）；`docs/decisions/rulings-v1.md` C12/C14/C17/C22/C23；`design/03`、`design/05`、`design/21` v2.0。
> **引用而不重定义**：属性与技艺 ID 见 `design/03`；武学字段、招式预算、层数、内功与学习门槛见 `design/05`；战斗经脉运行、招式路线、调息、护体内劲与经脉速度见 `design/21`；Buff 目录见 `design/06`；套装规则与最终效果见 `design/07`；阵法与合击见 `design/09`；门派制度见 `design/12` 与 `design/17`；经脉、穴位、冲穴、周天与九转见 `design/15`；资源、月钱与营生见 `design/16`；时代地图见 `design/11`。`sk_yijinjing`、`sk_longzhaoshou`、`sk_luohanquan`、`sk_tieshazhang` 的完整数据以 `design/05` 为准，本文只给摘要与需同步接口。
> **标注约定**：**（原创扩展）**＝原著没有；**（待考）**＝须按三联／广州修订版逐字核对且写明书名、人物或情节；**（待核实）**＝版本、API 等技术事实尚未确认；**（待实测）**＝须真机或真账号验证；**【建议值】**＝依赖归属文档、本文先给可用值并在 §8 登记。

---

## 0. 阅读指引与速查
### 绝招显式路线索引（镜像正文卡，非覆写层；2026-09-28）

本索引镜像正文卡，非覆写层；与正文不一致即为错误，并以正文为准。每记绝招使用独立稳定路线与显式穴位序列。

<!-- skill-catalog-audit:start -->
| 品阶 | 武学 | MoveDef（正文卡镜像） | 路线 ID | steps（acupointRef/segmentCt/riskBp） |
|---|---|---|---|---|
| 12 天上 | `sk_yijinjing` | `mv_yijinjing_weituo` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_yijinjing_weituo}` | `mfr_yijinjing_weituo` | `MeridianRouteDef{moveRef:mv_yijinjing_weituo; ultimate:true; purpose:defense}`；`ap_shouyangming_shousanli/75/100→ap_chongmai_qichong/75/110→ap_zutaiyin_diji/75/120→ap_dumai_zhiyang/75/130→ap_zutaiyang_chengshan/75/140→ap_zushaoyang_guangming/75/150→ap_zushaoyin_taixi/75/160→ap_shoujueyin_neiguan/75/170→ap_dumai_shendao/75/180→ap_renmai_guanyuan/75/190` |
| 12 天上 | `sk_yijinjing` | `mv_yijinjing_daozhuai` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_yijinjing_daozhuai}` | `mfr_yijinjing_daozhuai` | `MeridianRouteDef{moveRef:mv_yijinjing_daozhuai; ultimate:true; purpose:defense}`；`ap_shoutaiyin_chize/80/100→ap_shoutaiyin_yunmen/80/120→ap_yinqiao_zhaohai/80/140→ap_yinwei_zhubin/80/160→ap_zujueyin_yinlian/80/180→ap_zushaoyin_shufu/80/200→ap_zutaiyin_diji/80/220→ap_renmai_chengjiang/80/240→ap_renmai_shimen/80/260→ap_shoujueyin_laogong/80/280` |
| 12 天上 | `sk_yijinjing` | `mv_yijinjing_huangu` `MoveDef{unlock:10; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_yijinjing_huangu}` | `mfr_yijinjing_huangu` | `MeridianRouteDef{moveRef:mv_yijinjing_huangu; ultimate:true; purpose:defense}`；`ap_renmai_qihai/75/100→ap_chongmai_henggu/75/110→ap_zutaiyin_diji/75/120→ap_shoujueyin_daling/75/130→ap_zushaoyin_rangu/75/140→ap_shoushaoyin_shenmen/75/150→ap_shouyangming_quchi/75/160→ap_zutaiyang_weizhong/75/170→ap_renmai_danzhong/75/180→ap_dumai_baihui/75/190` |
| 10 天下 | `sk_jingangbuhuai` | `mv_jingangbuhuai_hanshan` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_jingangbuhuai_hanshan}` | `mfr_jingangbuhuai_hanshan` | `MeridianRouteDef{moveRef:mv_jingangbuhuai_hanshan; ultimate:true; purpose:defense}`；`ap_shouyangming_shousanli/75/100→ap_renmai_qihai/75/110→ap_shoushaoyin_shenmen/75/120→ap_zuyangming_fenglong/75/130→ap_shoutaiyang_wangu/75/140→ap_zushaoyin_taixi/75/150→ap_shouyangming_quchi/75/160→ap_dumai_baihui/75/170→ap_dumai_shendao/75/180→ap_renmai_guanyuan/75/190` |
| 10 天下 | `sk_jingangbuhuai` | `mv_jingangbuhuai_jinshen` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_jingangbuhuai_jinshen}` | `mfr_jingangbuhuai_jinshen` | `MeridianRouteDef{moveRef:mv_jingangbuhuai_jinshen; ultimate:true; purpose:defense}`；`ap_zushaoyin_yingu/80/100→ap_zutaiyin_taibai/80/120→ap_renmai_huiyin/80/140→ap_renmai_zhongji/80/160→ap_shoujueyin_tianchi/80/180→ap_shoushaoyin_shaochong/80/200→ap_shoutaiyin_kongzui/80/220→ap_shoutaiyin_zhongfu/80/240→ap_yinwei_daheng/80/260→ap_zujueyin_dadun/80/280` |
| 10 天下 | `sk_shizihou` | `mv_shizihou_juyin` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_shizihou_juyin}` | `mfr_shizihou_juyin` | `MeridianRouteDef{moveRef:mv_shizihou_juyin; ultimate:true; purpose:defense}`；`ap_dumai_zhiyang/75/100→ap_shouyangming_quchi/75/110→ap_zujueyin_ligou/75/120→ap_zushaoyang_guangming/75/130→ap_zutaiyin_yinlingquan/75/140→ap_yangwei_jinmen/75/150→ap_zutaiyang_weizhong/75/160→ap_renmai_danzhong/75/170→ap_dumai_shendao/75/180→ap_renmai_guanyuan/75/190` |
| 10 天下 | `sk_shizihou` | `mv_shizihou_shizihou` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_shizihou_shizihou}` | `mfr_shizihou_shizihou` | `MeridianRouteDef{moveRef:mv_shizihou_shizihou; ultimate:true; purpose:defense}`；`ap_renmai_guanyuan/80/100→ap_renmai_yinjiao/80/120→ap_shoujueyin_quze/80/140→ap_shoushaoyin_qingling/80/160→ap_shoutaiyin_chize/80/180→ap_shoutaiyin_yunmen/80/200→ap_yinqiao_zhaohai/80/220→ap_yinwei_zhubin/80/240→ap_zujueyin_yinlian/80/260→ap_zushaoyin_shufu/80/280` |
| 7 地下 | `sk_tiebushan` | `mv_tiebushan_gangqi` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_tiebushan_gangqi}` | `mfr_tiebushan_gangqi` | `MeridianRouteDef{moveRef:mv_tiebushan_gangqi; ultimate:true; purpose:defense}`；`ap_zutaiyin_gongsun/90/100→ap_renmai_danzhong/90/120→ap_renmai_shuifen/90/140→ap_shoujueyin_neiguan/90/160→ap_shoushaoyin_lingdao/90/180→ap_shoushaoyin_yinxi/90/200→ap_shoutaiyin_yuji/90/220→ap_yinqiao_sanyinjiao/90/240` |
| 8 地中 | `sk_jinzhongzhao` | `mv_jinzhongzhao_bupo` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_jinzhongzhao_bupo}` | `mfr_jinzhongzhao_bupo` | `MeridianRouteDef{moveRef:mv_jinzhongzhao_bupo; ultimate:true; purpose:defense}`；`ap_yinqiao_lougu/90/100→ap_yinwei_qimen/90/120→ap_zujueyin_xiguan/90/140→ap_zushaoyin_lingxu/90/160→ap_zutaiyin_dabao/90/180→ap_zutaiyin_yinbai/90/200→ap_renmai_qugu/90/220→ap_shoujueyin_daling/90/240` |
| 8 地中 | `sk_shaolinjiuyang` | `mv_shaolinjiuyang_zhoutian` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_shaolinjiuyang_zhoutian}` | `mfr_shaolinjiuyang_zhoutian` | `MeridianRouteDef{moveRef:mv_shaolinjiuyang_zhoutian; ultimate:true; purpose:defense}`；`ap_yinwei_zhubin/90/100→ap_zujueyin_yinlian/90/120→ap_zushaoyin_shufu/90/140→ap_zutaiyin_diji/90/160→ap_renmai_chengjiang/90/180→ap_renmai_shimen/90/200→ap_shoujueyin_laogong/90/220→ap_shoushaoyin_jiquan/90/240` |
| 9 地上 | `sk_xisuijing` | `mv_xisuijing_huanmai` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_xisuijing_huanmai}` | `mfr_xisuijing_huanmai` | `MeridianRouteDef{moveRef:mv_xisuijing_huanmai; ultimate:true; purpose:defense}`；`ap_dumai_zhiyang/75/100→ap_shouyangming_shousanli/75/110→ap_shoushaoyin_shenmen/75/120→ap_shoushaoyin_shaohai/75/130→ap_shoushaoyang_waiguan/75/140→ap_zushaoyang_guangming/75/150→ap_dumai_shendao/75/160→ap_renmai_guanyuan/75/170` |
| 9 地上 | `sk_xisuijing` | `mv_xisuijing_huanyuan` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_xisuijing_huanyuan}` | `mfr_xisuijing_huanyuan` | `MeridianRouteDef{moveRef:mv_xisuijing_huanyuan; ultimate:true; purpose:defense}`；`ap_yangwei_toulinqi/90/100→ap_zushaoyang_yangbai/90/120→ap_zutaiyang_weizhong/90/140→ap_zuyangming_sibai/90/160→ap_dumai_shenzhu/90/180→ap_shoushaoyang_waiguan/90/200→ap_shoutaiyang_tianzong/90/220→ap_shouyangming_quchi/90/240` |
| 7 地下 | `sk_dajingangquan` | `mv_dajingangquan_yinu` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_dajingangquan_yinu}` | `mfr_dajingangquan_yinu` | `MeridianRouteDef{moveRef:mv_dajingangquan_yinu; ultimate:true; purpose:attack}`；`ap_dumai_mingmen/75/100→ap_dumai_zhiyang/75/110→ap_zujueyin_ligou/75/120→ap_zutaiyin_yinlingquan/75/130→ap_zujueyin_taichong/75/140→ap_shoushaoyin_shaohai/75/150→ap_shouyangming_quchi/75/160→ap_shouyangming_shousanli/75/170→ap_shouyangming_hegu/75/180` |
| 7 地下 | `sk_dajingangzhang` | `mv_dajingangzhang_dali` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_dajingangzhang_dali}` | `mfr_dajingangzhang_dali` | `MeridianRouteDef{moveRef:mv_dajingangzhang_dali; ultimate:true; purpose:attack}`；`ap_shoujueyin_tianchi/90/100→ap_shoushaoyin_shaochong/90/120→ap_shoutaiyin_kongzui/90/140→ap_shoutaiyin_zhongfu/90/160→ap_yinwei_daheng/90/180→ap_zujueyin_dadun/90/200→ap_zujueyin_zhongdu/90/220→ap_zushaoyin_shuiquan/90/240` |
| 8 地中 | `sk_boruozhang` | `mv_boruozhang_boluomi` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_boruozhang_boluomi}` | `mfr_boruozhang_boluomi` | `MeridianRouteDef{moveRef:mv_boruozhang_boluomi; ultimate:true; purpose:defense}`；`ap_shoutaiyang_xiaohai/90/100→ap_shouyangming_sanjian/90/120→ap_yangqiao_jianyu/90/140→ap_yangwei_benshen/90/160→ap_yangwei_yangjiao/90/180→ap_zushaoyang_yangbai/90/200→ap_zutaiyang_shenshu/90/220→ap_zuyangming_jiache/90/240` |
| 8 地中 | `sk_weituochu` | `mv_weituochu_dachu` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_weituochu_dachu}` | `mfr_weituochu_dachu` | `MeridianRouteDef{moveRef:mv_weituochu_dachu; ultimate:true; purpose:attack}`；`ap_renmai_guanyuan/75/100→ap_renmai_qihai/75/110→ap_dumai_zhiyang/75/120→ap_zujueyin_taichong/75/130→ap_shouyangming_quchi/75/140→ap_shouyangming_pianli/75/150→ap_shouyangming_shousanli/75/160→ap_shouyangming_hegu/75/170` |
| 9 地上 | `sk_xumishanzhang` | `mv_xumishanzhang_jiezi` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_xumishanzhang_jiezi}` | `mfr_xumishanzhang_jiezi` | `MeridianRouteDef{moveRef:mv_xumishanzhang_jiezi; ultimate:true; purpose:defense}`；`ap_dumai_zhiyang/75/100→ap_zutaiyin_diji/75/110→ap_zutaiyang_weizhong/75/120→ap_zuyangming_fenglong/75/130→ap_shoushaoyang_waiguan/75/140→ap_shoushaoyin_shenmen/75/150→ap_shoujueyin_neiguan/75/160→ap_shoujueyin_laogong/75/170` |
| 9 地上 | `sk_xumishanzhang` | `mv_xumishanzhang_yading` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_xumishanzhang_yading}` | `mfr_xumishanzhang_yading` | `MeridianRouteDef{moveRef:mv_xumishanzhang_yading; ultimate:true; purpose:defense}`；`ap_zutaiyin_dadu/90/100→ap_zutaiyin_yinlingquan/90/120→ap_renmai_shenque/90/140→ap_shoujueyin_jianshi/90/160→ap_shoujueyin_zhongchong/90/180→ap_shoushaoyin_shenmen/90/200→ap_shoutaiyin_tianfu/90/220→ap_yinqiao_lieque/90/240` |
| 9 地上 | `sk_qianshourulaizhang` | `mv_qianshourulaizhang_jieyin` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_qianshourulaizhang_jieyin}` | `mfr_qianshourulaizhang_jieyin` | `MeridianRouteDef{moveRef:mv_qianshourulaizhang_jieyin; ultimate:true; purpose:defense}`；`ap_shouyangming_quchi/75/100→ap_dumai_zhiyang/75/110→ap_zuyangming_zusanli/75/120→ap_zushaoyin_taixi/75/130→ap_shoutaiyin_taiyuan/75/140→ap_zushaoyang_yanglingquan/75/150→ap_shoujueyin_neiguan/75/160→ap_shoujueyin_laogong/75/170` |
| 9 地上 | `sk_qianshourulaizhang` | `mv_qianshourulaizhang_wanfo` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_qianshourulaizhang_wanfo}` | `mfr_qianshourulaizhang_wanfo` | `MeridianRouteDef{moveRef:mv_qianshourulaizhang_wanfo; ultimate:true; purpose:defense}`；`ap_shouyangming_quchi/90/100→ap_yangqiao_fuyang/90/120→ap_yangqiao_shenmai/90/140→ap_yangwei_yamen/90/160→ap_zushaoyang_xuanzhong/90/180→ap_zutaiyang_kunlun/90/200→ap_zuyangming_fenglong/90/220→ap_zuyangming_zusanli/90/240` |
| 7 地下 | `sk_mohezhi` | `mv_mohezhi_wuliang` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_mohezhi_wuliang}` | `mfr_mohezhi_wuliang` | `MeridianRouteDef{moveRef:mv_mohezhi_wuliang; ultimate:true; purpose:attack}`；`ap_shoushaoyin_lingdao/90/100→ap_shoushaoyin_yinxi/90/120→ap_shoutaiyin_yuji/90/140→ap_yinqiao_sanyinjiao/90/160→ap_yinwei_tiantu/90/180→ap_zujueyin_xingjian/90/200→ap_shouyangming_hegu/90/220→ap_shouyangming_shangyang/90/240` |
| 7 地下 | `sk_duoluoyezhi` | `mv_duoluoyezhi_mantian` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_duoluoyezhi_mantian}` | `mfr_duoluoyezhi_mantian` | `MeridianRouteDef{moveRef:mv_duoluoyezhi_mantian; ultimate:true; purpose:attack}`；`ap_zuyangming_sibai/90/100→ap_dumai_shangxing/90/120→ap_dumai_zhiyang/90/140→ap_shoushaoyang_yifeng/90/160→ap_shoutaiyang_tinggong/90/180→ap_shouyangming_pianli/90/200→ap_shoujueyin_neiguan/90/220→ap_shoujueyin_zhongchong/90/240` |
| 8 地中 | `sk_dalijingangzhi` | `mv_dalijingangzhi_suigu` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_dalijingangzhi_suigu}` | `mfr_dalijingangzhi_suigu` | `MeridianRouteDef{moveRef:mv_dalijingangzhi_suigu; ultimate:true; purpose:attack}`；`ap_shouyangming_shousanli/75/100→ap_dumai_zhiyang/75/110→ap_shoushaoyin_shaohai/75/120→ap_zushaoyin_rangu/75/130→ap_zuyangming_fenglong/75/140→ap_zujueyin_taichong/75/150→ap_shouyangming_quchi/75/160→ap_shouyangming_shangyang/75/170` |
| 8 地中 | `sk_yizhichan` | `mv_yizhichan_qiankun` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_yizhichan_qiankun}` | `mfr_yizhichan_qiankun` | `MeridianRouteDef{moveRef:mv_yizhichan_qiankun; ultimate:true; purpose:attack}`；`ap_dumai_yinjiao/90/100→ap_shoushaoyang_yemen/90/120→ap_shoutaiyang_tianzong/90/140→ap_shouyangming_hegu/90/160→ap_shouyangming_yingxiang/90/180→ap_yangqiao_naoshu/90/200→ap_yangwei_tianliao/90/220→ap_zushaoyang_tongziliao/90/240` |
| 9 地上 | `sk_nianhuazhi` | `mv_nianhuazhi_wuxing` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_nianhuazhi_wuxing}` | `mfr_nianhuazhi_wuxing` | `MeridianRouteDef{moveRef:mv_nianhuazhi_wuxing; ultimate:true; purpose:attack}`；`ap_shouyangming_shousanli/75/100→ap_dumai_zhiyang/75/110→ap_shoutaiyin_taiyuan/75/120→ap_shoushaoyin_shenmen/75/130→ap_shoutaiyin_chize/75/140→ap_zushaoyin_taixi/75/150→ap_shoujueyin_neiguan/75/160→ap_shoushaoyin_shaochong/75/170` |
| 9 地上 | `sk_nianhuazhi` | `mv_nianhuazhi_jiaye` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_nianhuazhi_jiaye}` | `mfr_nianhuazhi_jiaye` | `MeridianRouteDef{moveRef:mv_nianhuazhi_jiaye; ultimate:true; purpose:attack}`；`ap_shouyangming_quchi/75/100→ap_zujueyin_ligou/75/110→ap_shoutaiyang_wangu/75/120→ap_shoutaiyin_taiyuan/75/130→ap_zushaoyin_rangu/75/140→ap_shoushaoyin_shenmen/75/150→ap_shoujueyin_neiguan/75/160→ap_shoujueyin_zhongchong/75/170` |
| 9 地上 | `sk_wuxiangjiezhi` | `mv_wuxiangjiezhi_wuxiangjie` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_wuxiangjiezhi_wuxiangjie}` | `mfr_wuxiangjiezhi_wuxiangjie` | `MeridianRouteDef{moveRef:mv_wuxiangjiezhi_wuxiangjie; ultimate:true; purpose:attack}`；`ap_dumai_zhiyang/75/100→ap_shouyangming_shousanli/75/110→ap_zutaiyang_weizhong/75/120→ap_zujueyin_taichong/75/130→ap_zutaiyang_chengshan/75/140→ap_shoujueyin_ximen/75/150→ap_shoujueyin_neiguan/75/160→ap_shoutaiyin_shaoshang/75/170` |
| 9 地上 | `sk_wuxiangjiezhi` | `mv_wuxiangjiezhi_jiejin` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_wuxiangjiezhi_jiejin}` | `mfr_wuxiangjiezhi_jiejin` | `MeridianRouteDef{moveRef:mv_wuxiangjiezhi_jiejin; ultimate:true; purpose:attack}`；`ap_shouyangming_quchi/75/100→ap_dumai_mingmen/75/110→ap_zushaoyang_guangming/75/120→ap_zuyangming_fenglong/75/130→ap_zutaiyin_diji/75/140→ap_zutaiyang_weizhong/75/150→ap_shoujueyin_neiguan/75/160→ap_shoushaoyang_guanchong/75/170` |
| 7 地下 | `sk_ruyingsuixingtui` | `mv_ruyingsuixingtui_yingzong` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_ruyingsuixingtui_yingzong}` | `mfr_ruyingsuixingtui_yingzong` | `MeridianRouteDef{moveRef:mv_ruyingsuixingtui_yingzong; ultimate:true; purpose:movement}`；`ap_shoushaoyin_shaochong/90/100→ap_shoutaiyin_kongzui/90/120→ap_shoutaiyin_zhongfu/90/140→ap_yinwei_daheng/90/160→ap_zujueyin_dadun/90/180→ap_zujueyin_zhongdu/90/200→ap_zushaoyin_shuiquan/90/220→ap_zutaiyin_gongsun/90/240` |
| 8 地中 | `sk_longzhaoshou` | `mv_longzhaoshou_daoxu` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_longzhaoshou_daoxu}` | `mfr_longzhaoshou_daoxu` | `MeridianRouteDef{moveRef:mv_longzhaoshou_daoxu; ultimate:true; purpose:defense}`；`ap_dumai_zhiyang/75/100→ap_dumai_mingmen/75/110→ap_shoutaiyin_chize/75/120→ap_shoutaiyang_wangu/75/130→ap_zushaoyin_rangu/75/140→ap_zutaiyang_chengshan/75/150→ap_shoushaoyang_waiguan/75/160→ap_shoushaoyang_yangchi/75/170` |
| 8 地中 | `sk_longzhaoshou` | `mv_longzhaoshou_sanshiliu` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_longzhaoshou_sanshiliu}` | `mfr_longzhaoshou_sanshiliu` | `MeridianRouteDef{moveRef:mv_longzhaoshou_sanshiliu; ultimate:true; purpose:defense}`；`ap_shoushaoyin_jiquan/90/100→ap_shoushaoyin_tongli/90/120→ap_shoutaiyin_xiabai/90/140→ap_yinqiao_lougu/90/160→ap_yinwei_qimen/90/180→ap_zujueyin_xiguan/90/200→ap_zushaoyin_lingxu/90/220→ap_zutaiyin_dabao/90/240` |
| 8 地中 | `sk_fumozhangfa` | `mv_fumozhangfa_xiangmo` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_fumozhangfa_xiangmo}` | `mfr_fumozhangfa_xiangmo` | `MeridianRouteDef{moveRef:mv_fumozhangfa_xiangmo; ultimate:true; purpose:attack}`；`ap_renmai_guanyuan/75/100→ap_renmai_qihai/75/110→ap_shoushaoyin_shaohai/75/120→ap_zushaoyang_guangming/75/130→ap_zuyangming_zusanli/75/140→ap_zutaiyang_weizhong/75/150→ap_shoushaoyang_waiguan/75/160→ap_shoushaoyang_yangchi/75/170` |
| 9 地上 | `sk_ranmudaofa` | `mv_ranmudaofa_liaoyuan` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_ranmudaofa_liaoyuan}` | `mfr_ranmudaofa_liaoyuan` | `MeridianRouteDef{moveRef:mv_ranmudaofa_liaoyuan; ultimate:true; purpose:attack}`；`ap_shouyangming_quchi/75/100→ap_renmai_qihai/75/110→ap_zuyangming_fenglong/75/120→ap_zushaoyin_taixi/75/130→ap_shoushaoyin_shenmen/75/140→ap_dumai_shendao/75/150→ap_shoushaoyang_waiguan/75/160→ap_shoushaoyang_yangchi/75/170` |
| 9 地上 | `sk_ranmudaofa` | `mv_ranmudaofa_yehuo` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_ranmudaofa_yehuo}` | `mfr_ranmudaofa_yehuo` | `MeridianRouteDef{moveRef:mv_ranmudaofa_yehuo; ultimate:true; purpose:attack}`；`ap_shoushaoyin_shaohai/90/100→ap_shoutaiyin_xiabai/90/120→ap_yinqiao_zhaohai/90/140→ap_zujueyin_ligou/90/160→ap_zushaoyin_fuliu/90/180→ap_zutaiyin_dadu/90/200→ap_renmai_danzhong/90/220→ap_renmai_zhongji/90/240` |
| 7 地下 | `sk_damojianfa` | `mv_damojianfa_jianxing` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_damojianfa_jianxing}` | `mfr_damojianfa_jianxing` | `MeridianRouteDef{moveRef:mv_damojianfa_jianxing; ultimate:true; purpose:movement}`；`ap_shouyangming_quchi/75/100→ap_shoushaoyang_waiguan/75/110→ap_zujueyin_ligou/75/120→ap_shoutaiyang_wangu/75/130→ap_zushaoyang_guangming/75/140→ap_daimai_weidao/75/150→ap_yangqiao_shenmai/75/160→ap_zushaoyin_yongquan/75/170` |
| 8 地中 | `sk_jiashafumogong` | `mv_jiashafumogong_fumo` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_jiashafumogong_fumo}` | `mfr_jiashafumogong_fumo` | `MeridianRouteDef{moveRef:mv_jiashafumogong_fumo; ultimate:true; purpose:defense}`；`ap_dumai_yaoshu/90/100→ap_shoushaoyang_waiguan/90/120→ap_shoutaiyang_qiangu/90/140→ap_shoutaiyang_yanglao/90/160→ap_shouyangming_shousanli/90/180→ap_yangqiao_juliao/90/200→ap_yangwei_jianjing/90/220→ap_zushaoyang_guangming/90/240` |
| 9 地上 | `sk_yiweidujiang` | `mv_yiweidujiang_suibo` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_yiweidujiang_suibo}` | `mfr_yiweidujiang_suibo` | `MeridianRouteDef{moveRef:mv_yiweidujiang_suibo; ultimate:true; purpose:movement}`；`ap_shouyangming_shousanli/75/100→ap_dumai_mingmen/75/110→ap_shoutaiyin_chize/75/120→ap_zutaiyin_yinlingquan/75/130→ap_shoushaoyin_shaohai/75/140→ap_zushaoyang_guangming/75/150→ap_daimai_weidao/75/160→ap_yangqiao_shenmai/75/170→ap_zushaoyin_yongquan/75/180` |
| 9 地上 | `sk_yiweidujiang` | `mv_yiweidujiang_feidu` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_yiweidujiang_feidu}` | `mfr_yiweidujiang_feidu` | `MeridianRouteDef{moveRef:mv_yiweidujiang_feidu; ultimate:true; purpose:movement}`；`ap_shouyangming_erjian/90/100→ap_shouyangming_yangxi/90/120→ap_yangqiao_juliao_wei/90/140→ap_yangwei_jinmen/90/160→ap_zushaoyang_riyue/90/180→ap_zutaiyang_chengshan/90/200→ap_zutaiyang_xinshu/90/220→ap_zuyangming_renying/90/240` |
| 9 地上 | `sk_jingangfumoquan` | `mv_jingangfumoquan_chanxin` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_jingangfumoquan_chanxin}` | `mfr_jingangfumoquan_chanxin` | `MeridianRouteDef{moveRef:mv_jingangfumoquan_chanxin; ultimate:true; purpose:defense}`；`ap_renmai_guanyuan/75/100→ap_shoutaiyang_wangu/75/110→ap_zujueyin_taichong/75/120→ap_zushaoyang_guangming/75/130→ap_shoutaiyin_taiyuan/75/140→ap_shouyangming_quchi/75/150→ap_shouyangming_shousanli/75/160→ap_shouyangming_hegu/75/170` |
| 9 地上 | `sk_jingangfumoquan` | `mv_jingangfumoquan_fumo` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_jingangfumoquan_fumo}` | `mfr_jingangfumoquan_fumo` | `MeridianRouteDef{moveRef:mv_jingangfumoquan_fumo; ultimate:true; purpose:defense}`；`ap_zutaiyin_yinbai/90/100→ap_renmai_qugu/90/120→ap_shoujueyin_daling/90/140→ap_shoujueyin_ximen/90/160→ap_shoushaoyin_shaohai/90/180→ap_shoutaiyin_taiyuan/90/200→ap_yinqiao_jingming/90/220→ap_yinwei_fushe/90/240` |
| 7 地下 | `sk_huheshuangxingquan` | `mv_huheshuangxingquan_shuangxing` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_huheshuangxingquan_shuangxing}` | `mfr_huheshuangxingquan_shuangxing` | `MeridianRouteDef{moveRef:mv_huheshuangxingquan_shuangxing; ultimate:true; purpose:movement}`；`ap_zujueyin_ququan/90/100→ap_zushaoyin_dazhong/90/120→ap_zushaoyin_yingu/90/140→ap_zutaiyin_taibai/90/160→ap_renmai_huiyin/90/180→ap_renmai_zhongji/90/200→ap_shoujueyin_tianchi/90/220→ap_shoushaoyin_shaochong/90/240` |
| 8 地中 | `sk_huanyinzhi` | `mv_huanyinzhi_wuxiang` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_huanyinzhi_wuxiang}` | `mfr_huanyinzhi_wuxiang` | `MeridianRouteDef{moveRef:mv_huanyinzhi_wuxiang; ultimate:true; purpose:movement}`；`ap_shoutaiyin_kongzui/90/100→ap_shoutaiyin_zhongfu/90/120→ap_yinwei_daheng/90/140→ap_zujueyin_dadun/90/160→ap_zujueyin_zhongdu/90/180→ap_zushaoyin_shuiquan/90/200→ap_zutaiyin_gongsun/90/220→ap_renmai_danzhong/90/240` |
| 6 玄上 | `sk_tongrenhenglian` | `mv_tongrenhenglian_tongrenxiang` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_tongrenhenglian_tongrenxiang}` | `mfr_tongrenhenglian_tongrenxiang` | `MeridianRouteDef{moveRef:mv_tongrenhenglian_tongrenxiang; ultimate:true; purpose:attack}`；`ap_shoutaiyin_chize/100/100→ap_shoutaiyin_yunmen/100/120→ap_yinqiao_zhaohai/100/140→ap_yinwei_zhubin/100/160→ap_zujueyin_yinlian/100/180→ap_zushaoyin_shufu/100/200` |
| 6 玄上 | `sk_dacidabeiqianyeshou` | `mv_dacidabeiqianyeshou_due` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_dacidabeiqianyeshou_due}` | `mfr_dacidabeiqianyeshou_due` | `MeridianRouteDef{moveRef:mv_dacidabeiqianyeshou_due; ultimate:true; purpose:attack}`；`ap_shoushaoyang_sizhukong/100/100→ap_shoushaoyang_zhongzhu/100/120→ap_shoushaoyin_shenmen/100/140→ap_shoutaiyang_tinggong/100/160→ap_shoutaiyin_shaoshang/100/180→ap_shouyangming_erjian/100/200` |
| 6 玄上 | `sk_xinyiba` | `mv_xinyiba_heyi` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_xinyiba_heyi}` | `mfr_xinyiba_heyi` | `MeridianRouteDef{moveRef:mv_xinyiba_heyi; ultimate:true; purpose:attack}`；`ap_zushaoyin_yongquan/100/100→ap_zutaiyin_xuehai/100/120→ap_renmai_qihai/100/140→ap_renmai_zhongwan/100/160→ap_shoujueyin_tianquan/100/180→ap_shoushaoyin_shaofu/100/200` |
| 6 玄上 | `sk_cibeidao` | `mv_cibeidao_duhua` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_cibeidao_duhua}` | `mfr_cibeidao_duhua` | `MeridianRouteDef{moveRef:mv_cibeidao_duhua; ultimate:true; purpose:attack}`；`ap_daimai_weidao/100/100→ap_dumai_mingmen/100/120→ap_dumai_yinjiao/100/140→ap_renmai_qihai/100/160→ap_renmai_zhongwan/100/180→ap_shoujueyin_tianquan/100/200` |
| 6 玄上 | `sk_xiangmochu` | `mv_xiangmochu_pojia` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_xiangmochu_pojia}` | `mfr_xiangmochu_pojia` | `MeridianRouteDef{moveRef:mv_xiangmochu_pojia; ultimate:true; purpose:attack}`；`ap_shoujueyin_neiguan/100/100→ap_shoushaoyin_lingdao/100/120→ap_shoushaoyin_yinxi/100/140→ap_shoutaiyin_yuji/100/160→ap_yinqiao_sanyinjiao/100/180→ap_yinwei_tiantu/100/200` |
| 6 玄上 | `sk_fumosuofa` | `mv_fumosuofa_huanyuan` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_fumosuofa_huanyuan}` | `mfr_fumosuofa_huanyuan` | `MeridianRouteDef{moveRef:mv_fumosuofa_huanyuan; ultimate:true; purpose:attack}`；`ap_zujueyin_xingjian/100/100→ap_zushaoyin_rangu/100/120→ap_zutaiyin_dadu/100/140→ap_zutaiyin_yinlingquan/100/160→ap_renmai_shenque/100/180→ap_shoujueyin_jianshi/100/200` |
| 6 玄上 | `sk_jingangnianzhu` | `mv_jingangnianzhu_huixuan` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_jingangnianzhu_huixuan}` | `mfr_jingangnianzhu_huixuan` | `MeridianRouteDef{moveRef:mv_jingangnianzhu_huixuan; ultimate:true; purpose:attack}`；`ap_daimai_jingmen/100/100→ap_dumai_jizhong/100/120→ap_dumai_yaoyangguan/100/140→ap_renmai_huiyin/100/160→ap_renmai_zhongji/100/180→ap_shoujueyin_tianchi/100/200` |
| 6 玄上 | `sk_luohanzhen` | `mv_luohanzhen_shibaluohan` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_luohanzhen_shibaluohan}` | `mfr_luohanzhen_shibaluohan` | `MeridianRouteDef{moveRef:mv_luohanzhen_shibaluohan; ultimate:true; purpose:defense}`；`ap_dumai_mingmen/75/100→ap_dumai_zhiyang/75/110→ap_shoushaoyin_shenmen/75/120→ap_shoushaoyin_shaohai/75/130→ap_shoushaoyang_waiguan/75/140→ap_zuyangming_zusanli/75/150→ap_dumai_shendao/75/160→ap_renmai_guanyuan/75/170` |
| 6 玄上 | `sk_jingangnuhou` | `mv_jingangnuhou_zhenshe` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_jingangnuhou_zhenshe}` | `mfr_jingangnuhou_zhenshe` | `MeridianRouteDef{moveRef:mv_jingangnuhou_zhenshe; ultimate:true; purpose:attack}`；`ap_shoujueyin_tianchi/100/100→ap_shoushaoyin_shaochong/100/120→ap_shoutaiyin_kongzui/100/140→ap_shoutaiyin_zhongfu/100/160→ap_yinwei_daheng/100/180→ap_zujueyin_dadun/100/200` |
| 6 玄上 | `sk_wulangbaguagun` | `mv_wulangbaguagun_pozhen` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_wulangbaguagun_pozhen}` | `mfr_wulangbaguagun_pozhen` | `MeridianRouteDef{moveRef:mv_wulangbaguagun_pozhen; ultimate:true; purpose:attack}`；`ap_zutaiyin_dadu/100/100→ap_zutaiyin_yinlingquan/100/120→ap_renmai_shenque/100/140→ap_shoujueyin_jianshi/100/160→ap_shoujueyin_zhongchong/100/180→ap_shoushaoyin_shenmen/100/200` |
<!-- skill-catalog-audit:end -->


| 章节 | 内容 |
|---|---|
| §0.1 | 本组门派与传承一览 |
| §0.2 | `reqs`、职级与来源写法 |
| §0.3 | 内功 `nature` 速查 |
| §0.4 | T01 五级职级接口 |
| §1 | 少林派 `sect_shaolin`：简介、职级、门派特殊规则、武学总表、天级卡、地阶卡、玄阶紧凑卡、黄阶一行总表 |
| §2 | 南少林 `sect_nanshaolin`（书剑） |
| §3 | 旁支：西域金刚门、叛僧成昆（幻阴指）、五台山清凉寺；敌人专用武学 |
| §4 | 套装候选（门派套装 ×7、人物传承套装 ×4；含用户示例 `set_shaolin_jingang`） |
| §5 | 统计（门派 × 12 品阶、类别、原生书界）、预算口径、境界覆盖与可习得池比例 |
| §5.7 | AR-14 经脉运行绑定：路线模板、高阶逐招、轻功、内功调息与护体档 |
| §6 | 本文新增术语与 ID |
| §7 | 数据校验规则与测试用例 |
| §8 | 待决事项 / 依赖 |

**配表通用约定**（下文各表不再重复）：

| 项 | 约定 |
|---|---|
| 耗内基准（× `MPREF`） | 黄 5% / 玄 6% / 地 7% / 天 8%；绝招 = 基准 + 2%（05 §4.8） |
| 招式预算 | `power = AF × (1+Σadj) × K_delivery × K_parry − Σcost_buff − Σcost_disp`；核算列写法：`AF×(1+adj)×K − 代价`，如 `1+0.12(cd1)+0.05(耗内+1%)−0.03(破甲30%)` |
| Buff 代价 | 眩晕/定身 0.25×率；点穴/封内/封经脉/缴械 0.20–0.25×率；内伤/破甲/流血/减速/灼烧/寒气/骨伤/蹒跚 0.10×率；自身增益 0.10–0.20（05 §4.2 建议值） |
| 附带 Buff | 一律 `grade: inherit`（= 本武学 `effGrade`，06 §3.1）；"率"为基础施加率，最终还要过效果命中/抵抗（04） |
| 收招 | 未写即 1000；架势类 800–850 |
| 招式栏 | 黄/玄 3、地 4、天 5（05 §4.9） |
| 被动 ID | `ps_<武学拼音>_<拼音>`；层数按 `layerEff` 判定 |
| 同源组 | 七十二绝技一律 `lineageGroups: [lg_shaolin72]`（02 §5.4）；少林九阳功另入 `lg_jiuyang` |
| 学习途径 ID | 秘籍 `it_miji_<拼音>`、残页 `it_canye_<拼音>`（05 P-4 建议规则）；NPC 与任务为占位 ID（`q_NN_*_8x`），由书界文档替换 |
| 天级观摩 | 按作者决定 P09 默认 `observable: false`；例外须逐门登记依据，本文三门天级均无观摩学习例外 |

### 0.1 本组门派与传承一览

| 门派 / 传承 ID | 名称 | 出现书界 | 正邪 | 驻地 | 代表人物 | 武学风格 | 内力性质倾向 | 可否加入 |
|---|---|---|---|---|---|---|---|---|
| `sect_shaolin` | 少林派（嵩山少林寺） | 天龙、射雕、神雕、倚天（含楔子）、笑傲、侠客、鹿鼎、书剑；其他书界状态见 `design/17` §3.1 | 正 | 河南登封嵩山少室山；五台山清凉寺仅作关联传授点（原创扩展），不并作独立门派 | 天龙：玄慈、玄寂、玄难、玄悲、玄苦、扫地僧；倚天楔子：天鸣、无色、无相、觉远；倚天：空闻、空智、空性、空见、渡厄/渡劫/渡难；笑傲：方证、方生；侠客：妙谛；鹿鼎：晦聪、澄观；书剑人物接口见 `design/17` §5.1 | 外门刚猛硬功＋七十二绝技＋佛门内功；长于守御、拿穴、护体与慈悲制服 | 外门偏阳；上乘内修含 `harmony` | 可；书剑为 `O`，但该书界实际授艺主要由组织分立的 `sect_nanshaolin` 承载；俗家与剃度两轨见 §0.4 |
| `sect_nanshaolin` | 南少林 | 书剑；其他时代状态见 `design/17` §3.1 | 正（书剑反清线） | 福建泉州／莆田定位仍待 `design/11` 地理考据，不在本文定址 | 天虹禅师、于万亭相关人物关系（待考 K-03：核《书剑恩仇录》南少林追查身世段落中的称谓、关系与寺址） | 短打、棍术与南派拳种；本文多数条目为历史武术借鉴后的原创扩展 | 阳 | 可；T01 五级，L4 可走“洪门护法”俗家支路 |
| —（`lineage: 火工头陀 → 西域金刚门 → 阿二、阿三`） | 西域金刚门旁支 | 倚天 | 邪（汝阳王府一方） | 西域（待考 K-09：核《倚天屠龙记》赵敏部属叙述中的具体地域与传承层级） | 阿二、阿三；火工头陀一脉 | 少林外门指力旁出，以大力金刚指为代表 | 阳 | 否；裁定禁用 `sect_jingangmen`，只用自由文本 `lineage` 表达旁支 |
| —（`lineage: 成昆（圆真）`） | 成昆（圆真）叛支 | 倚天 | 邪 | 少林寺内潜伏 | 成昆（混元霹雳手） | 阴毒指力：幻阴指 | 阴 | 否；幻阴指可经邪道奇遇习得（§3.2） |

### 0.2 `reqs`、职级与来源写法

- 正式门派条件写作 `sect {id: sect_shaolin, rank: 1..5}`；文中 `L1..L5` 是展示称谓，数据字段仍存整数 `rank`。
- 正式武学前置写作 `prereq: [{skill: sk_xxx, layer: N}]`；二选一写作 `prereq: [{anyOf: [{skill: sk_a, layer: N}, {skill: sk_b, layer: M}]}]`。外层为 AND、`anyOf` 内为 OR（`rulings-v1` §4）。
- 技艺门槛只写入 `reqs.skills`，合法键为 `med/poi/antidote/forge/alchemy/formation/music/art/chess/speech`。来源的 `reqsOverride` 按顶层字段替换；`null` 删除字段，`[]` 清空前置；未出现字段继承基础值。基础若显式列 `hard`，删除某条件时同步剔除对应硬路径，替换同名顶层条件则继续沿用该硬路径（`rulings-v1` §4.3）。
- 总表“拜(Ln)”表示该来源要求 T01 的 Ln 授艺资格；奇遇、秘籍、观摩仍以各卡 `learnSources` 的覆写为准。

### 0.3 内功 `nature` 速查（AR-02）

| `nature` | 本文内功（12 门） | 玩法接口 |
|---|---|---|
| `harmony` | 易筋经、洗髓经、达摩心经 | 无阴阳相性惩罚、相性增益减半；完整规则见 `design/05` §5 |
| `yang` | 金刚不坏体、金钟罩、少林九阳功、铁布衫、铜人横练、童子功、少林心法、少林桩功、铁线功 | 阳性内功；冲穴速率与经脉适性仅由 `design/15` 计算 |
| `yin` | 无 | 本文当前没有阴性内功，不为配额虚构条目 |

> 本表只登记 `nature` 接口，不定义穴道、经脉、周天或九转收益；这些内容见 `design/15`。

### 0.4 T01 五级职级接口（AR-07/08）

`sect_shaolin` 与 `sect_nanshaolin` 均采用 `design/17` §1.2 的 T01 禅宗模板；少林俗家、剃度两轨在 L3 汇合，南少林另允许 L4“洪门护法”俗家支路。月钱与资源档位只引用 `design/16` 的 `stipendTier/resourceTier = 1..5`，本文不定义金额或产出。

| 级 | T01 称谓 | 本文授艺边界 |
|---|---|---|
| L1 | 俗家弟子 / 沙弥 | 黄阶基础拳棍、心法与步法 |
| L2 | 剃度弟子 / 入室僧 | 黄阶全开、玄下禅功与兵器 |
| L3 | 亲传弟子 / 闭关僧 | 玄阶全开、地下绝技候选 |
| L4 | 首座 / 长老 | 地阶与院堂秘传；天级只开放专属任务资格 |
| L5 | 方丈 / 住持 | 镇寺目录访问权；仍须满足属性、前置、剧情等条件 |

> **库存边界（AR-01 / C3）**：扩充前为 70 个唯一武学 ID，天／地／玄／黄 `3/26/27/14`。`design/05` §14.5 在全目录 `1,138` 门总闸下给本册的受控目标为 `3/26/27/18=74`，故本轮只新增黄中 1、黄上 3；不新增天、地、玄，不删除或改阶既有武学。单册名义目标 `3/9/27/27` 因既有地阶库存不可删而不能机械追齐，以受控配额为准。

## 1. 少林派 `sect_shaolin`

### 1.1 门派简介：时代变迁与各书界强弱

少林是跨越多个书界的持续性门派之一（时代开放矩阵见 `design/17` §3.1），并非全作唯一。本文用“各时代实际投放的七十二绝技数量递减”表现传承与玩法供给变化；这只是本作的投放曲线（原创扩展），不把它写成原著对寺藏总量的断言。至康熙朝，般若堂首座澄观熟知多门少林武功的法门，却欠缺临敌经验；韦小宝正是借其不谙实战而周旋（原著《鹿鼎记》）。

| 书界 | 境界 | 少林状况（原著/改编） | 本书界少林可学武学（门数：天/地/玄/黄；其中七十二绝技） | 关键人物 · 事件钩子 |
|---|---|---|---|---|
| 天龙（约 1093–1094） | 高 | 鼎盛：玄字辈诸高僧；藏经阁七十二绝技为萧远山、慕容博、鸠摩智觊觎；扫地僧论绝技须以佛法化解（原著） | 44（1/19/13/11）；绝技 19 | 玄慈、扫地僧、虚竹；聚贤庄、少室山大会；鸠摩智以小无相功冒用绝技 |
| 射雕（约 1217–1227；楔子 1199；待考 K-02：核《射雕英雄传》郭啸天、杨铁心开篇及主线年序） | 高 | 背景存在：嵩山在金国治下，少林不入主线（原创扩展：可探索区域） | 9（1/0/1/7）；绝技 0 | 依基准保留易筋经完整学习线；来源由 `chapters/02` 配置并标原创扩展 |
| 神雕（1237–1259） | 高 | 背景存在；无色禅师在小说末段与杨过、张君宝等相逢 | 9（0/0/2/7）；绝技 0 | 只开放有限入门，不新增易筋经完整学习线；华山之巅衔接倚天楔子 |
| 倚天（楔子 1262；1336–1363） | 高 | 楔子：觉远诵九阳真经，无色记得一部分成少林九阳功；正篇：空见以金刚不坏体受谢逊十三拳而殁；成昆化名圆真潜伏；屠狮大会、金刚伏魔圈 | **23（3/6/8/6）**；绝技 3；按 C14 白名单收敛 | 空闻、空智、空性（龙爪手）、渡厄三僧、谢逊（狮子吼） |
| 笑傲（明中叶，年代不详） | 中 | 方证为武林泰斗；少林三战（方证千手如来掌对任我行）；方证欲以易筋经为令狐冲化解异种真气 | 39（1/7/17/14）；绝技 7 | 方证、方生；易筋经本土印证（02 E5）；新增三门黄阶由山门基础授艺承载（原创扩展） |
| 侠客（明，年代不详） | 中 | 少林掌门妙谛应邀赴侠客岛；本文不由此推断寺中“无大宗师” | 25（0/5/9/11）；绝技 4 | 洗髓经首现（原创扩展定级）；新增三门黄阶由山门基础授艺承载（原创扩展） |
| 鹿鼎（1669–1690） | 低 | 晦聪方丈、般若堂澄观；十八罗汉护送韦小宝；清凉寺行痴（顺治）出家 | 39（0/5/20/14）；绝技 4 | 澄观"纸上谈兵"（原创扩展解读）；韦小宝出家少林、任清凉寺住持（原著）；新增三门黄阶为入门旁路（原创扩展） |
| 书剑（1753–1759） | 中 | `sect_shaolin` 按 `design/17` §3.1 为 `O`；组织仍开放，实际授艺池主要由独立的南少林承载 | 27（0/3/11/13）；绝技 2 | 天虹禅师与南少林线；三门嵩山基础艺经南少林共享，另增南少林桥手（均为原创扩展） |

> 各书界可学池只统计本文少林武学；书界整体武学池由各书界文档汇总（05 §14.4）。按作者决定 P49，射雕、神雕均以背景与有限入门为主；射雕依基准保留易筋经完整学习线，神雕不新增该完整学习线。

### 1.2 门派职级与身份规则

本派采用 §0.4 的 T01 L1–L5；香客、挂单僧只是非门派访问状态，不占 `rank`。具体贡献阈值、晋升任务、叛出、月钱和资源分别归 `design/12`、`design/16`；本文只把职级作为授艺门槛。

- **出家与俗家**（原创扩展，作者决定 P32）：从 L2 起可选剃度；出家者少林武学修炼 `+10%`（计入 `bonusMult`），关闭情缘线；可还俗，还俗后移除该 `+10%`。俗家、剃度两轨在 L3 汇合，是否出家不替代武学自身门槛。
- **书眠**：门派身份不跨书界（基准 §3）；“少林残篇 ≥ 3 门”只提供下一少林书界的入门任务加速（原创扩展），不能直接授予 L1 或跳过时代开放、入门任务。

### 1.3 门派特殊规则

#### 1.3.1 七十二绝技·戾气（原著设定，数值化为原创扩展）

原著依据：《天龙八部》少室山藏经阁中，扫地僧说明少林绝技凌厉、须以慈悲佛法化解，萧远山与慕容博偷学多门绝技后内伤难愈即其例。本文不引用未经逐字核定的原句或回目号。

| 规则 | 值 |
|---|---|
| 计数 | 装配中带 `special.liqi: true` 的武学（本文 21 门七十二绝技）数 N |
| 佛法根基 | 装配任一：易筋经、洗髓经、达摩心经、少林九阳功（内功，任意栏位）或 般若心经（杂学）；或套装 `legacy-set:shaolin_banruo` 3 件 / `set_saodiseng` 2 件 |
| 戾气判定 | N ≥ 3 且无佛法根基：每场战斗开始判定一次，`p = 0.04 × (N − 2) × (1 − wil/150)`，命中获得 `bf_neixiwenluan`（走火 1 级，品阶取所装绝技 `effGrade` 最高者） |
| 修炼 | 同条件下闭关修炼任一绝技，心魔概率 ×1.5（05 §8.3） |
| 性质 | 这是**装配组合规则**（与 05 §5.4 阴阳相冲同类），不是单门武学的代价，故不计入 05 §14.6"代价型 ≤ 5%" |
| 归属 | 走火触发源表属 05 §10.2，本条以提案形式登记（§8.3 BP-4） |

#### 1.3.2 慈悲：制服而不杀（原创扩展）

带被动"慈悲/戒杀"的少林武学（般若掌、千手如来掌、戒刀法、慈悲刀、大慈大悲千叶手）击倒**非 Boss、非野兽**目标时改为"制服"：目标不死、退出战斗，可在战后劝降、盘问或放走（结果与品德、声望的关系归 design/12）。玩家可在设置中对单场关闭；关闭后恢复通常击倒/击杀结算，品德后果仍由 `design/12` 判定。

#### 1.3.3 横练与罩门

铜人横练、铁布衫、金钟罩为"内功·护体"类横练（理由见 §1.6.1 注）。铁布衫、金钟罩装配即伴生 `bf_zhaomen`（06 §8.9，罩门），铜人横练伴生玄阶罩门；**金刚不坏体**无罩门，并能压制同装配横练的罩门（§1.5.2）。这是"横练越深越怕被识破"的武侠通行设定（原创扩展）。

### 1.4 少林武学总表（嵩山少林，65 门；南少林见 §2，旁支幻阴指见 §3）

> "获取"缩写：拜=拜师（`master`，括号内为职级 L1–L5）、籍=秘籍（`manual`）、页=残页（`pages`）、观=观摩（`observe`，上限 6 重）、遇=奇遇（`qiyu`）、谜=解谜、合=合击领悟。"绝"=七十二绝技（`lg_shaolin72`，`special.liqi`）。

| ID | 名称 | 大类/子类 | 品阶 | 性质 | wOut/wIn | 原生书界 | 获取方式 | 出处 |
|---|---|---|---|---|---|---|---|---|
| `sk_yijinjing` | 易筋经 | 内功/心法 | 12 天上 | `harmony` | 0/1 | 天龙、射雕、倚天、笑傲 | 拜(L5)；遇（天龙“无心插柳”）；笑傲方证传经=印证 | 原著（05 §13.3） |
| `sk_jingangbuhuai` | 金刚不坏体 | 内功/心法（护体） | 10 天下 | `yang` | 0/1 | 倚天 | 拜(L5)渡厄；遇“空见遗泽” | 原著 |
| `sk_shizihou` | 狮子吼 | 杂学/音功 | 10 天下 | 阳 | 0/1 | 倚天 | 拜(L5)；谢逊版由倚天组配置 | 原著 |
| `sk_xisuijing` | 洗髓经 | 内功/心法 | 9 地上 | `harmony` | 0/1 | 侠客、鹿鼎 | 拜(L4)；籍（鹿鼎藏经阁） | 民间传说名目；本作原创纳入并定级 |
| `sk_jinzhongzhao` | 金钟罩 | 内功/心法（横练） | 8 地中 | `yang` | 0/1 | 天龙、笑傲 | 拜(L4)罗汉堂；籍（笑傲） | 绝；民间名目，原创纳入 |
| `sk_shaolinjiuyang` | 少林九阳功 | 内功/心法 | 8 地中 | `yang` | 0/1 | 倚天 | 拜(L4)；遇（楔子闻经） | 原著（无色所记九阳真经） |
| `sk_tiebushan` | 铁布衫 | 内功/心法（横练） | 7 地下 | `yang` | 0/1 | 天龙、鹿鼎、书剑 | 拜(L4)；籍（鹿鼎） | 绝；民间名目，原创纳入 |
| `sk_tongrenhenglian` | 铜人横练 | 内功/心法（横练） | 6 玄上 | `yang` | 0/1 | 天龙、倚天、笑傲、鹿鼎 | 拜(L3)＋“铜人巷”事件 | 原创扩展（用户示例套装成员） |
| `sk_damoxinjing` | 达摩心经 | 内功/心法 | 5 玄中 | `harmony` | 0/1 | 天龙、神雕、侠客 | 拜(L3)达摩院；籍 | 原创扩展 |
| `sk_tongzigong` | 童子功 | 内功/心法 | 4 玄下 | `yang` | 0/1 | 笑傲、鹿鼎、书剑 | 拜(L2)；籍 | 民间名目，原创纳入 |
| `sk_shaolinxinfa` | 少林心法 | 内功/心法 | 2 黄中 | `yang` | 0/1 | 天龙、射雕、神雕、倚天、笑傲、侠客、鹿鼎、书剑 | 拜(L1)；籍 | 原创扩展（入门） |
| `sk_shaolinzhuanggong` | 少林桩功 | 内功/心法 | 1 黄下 | `yang` | 0/1 | 同上 | 拜(L1)；观 | 原创扩展（入门） |
| `sk_xumishanzhang` | 须弥山掌 | 拳脚/拳掌 | 9 地上 | 阳 | 0.50/0.50 | 天龙 | 拜(L5)；遇（藏经阁） | 绝（待考 K-01：核《天龙八部》是否出现该名目及施用人物） |
| `sk_qianshourulaizhang` | 千手如来掌 | 拳脚/拳掌 | 9 地上 | 调和 | 0.40/0.60 | 笑傲 | 拜(L5)方证；观（三战） | 原著（方证） |
| `sk_boruozhang` | 般若掌 | 拳脚/拳掌 | 8 地中 | 调和 | 0.45/0.55 | 天龙、倚天、鹿鼎 | 拜(L4)般若堂；鹿鼎澄观 | 绝（原著） |
| `sk_weituochu` | 韦陀杵 | 拳脚/拳掌 | 8 地中 | 阳 | 0.60/0.40 | 天龙 | 拜(L4)戒律院 | 绝（原著：玄悲“大韦陀杵”） |
| `sk_dajingangquan` | 大金刚拳 | 拳脚/拳掌 | 7 地下 | 阳 | 0.65/0.35 | 天龙 | 拜(L4)；页 | 绝（待考 K-01：核《天龙八部》少林绝技名录） |
| `sk_dajingangzhang` | 大金刚掌 | 拳脚/拳掌 | 7 地下 | 阳 | 0.55/0.45 | 天龙、笑傲、侠客 | 拜(L4)；籍（侠客） | 绝（待考 K-01：核《天龙八部》是否作“大金刚掌”或“大力金刚掌”，并核施用人物） |
| `sk_dacidabeiqianyeshou` | 大慈大悲千叶手 | 拳脚/拳掌 | 6 玄上 | 调和 | 0.60/0.40 | 鹿鼎 | 拜：海大富（宫中）／罗汉堂(L3) | 原著《鹿鼎记》（待考 K-07：核用名与少林归属） |
| `sk_xinyiba` | 心意把 | 拳脚/拳掌 | 6 玄上 | 阳 | 0.70/0.30 | 笑傲、侠客、鹿鼎 | 拜(L3)；籍 | 民间嵩山少林名目，原创纳入 |
| `sk_tieshazhang` | 铁砂掌 | 拳脚/拳掌 | 5 玄中 | 阳 | 0.75/0.25 | 天龙、倚天、笑傲、鹿鼎 | 拜(L3)；籍；页；观 | 原创扩展（05 §2.8） |
| `sk_shuaibeishou` | 摔碑手 | 拳脚/拳掌 | 4 玄下 | 阳 | 0.75/0.25 | 天龙、笑傲、侠客、鹿鼎 | 拜(L2)；页 | 民间名目，原创纳入 |
| `sk_fuhuquan` | 伏虎拳 | 拳脚/拳掌 | 3 黄上 | 阳 | 0.85/0.15 | 天龙、射雕、神雕、侠客、鹿鼎 | 拜(L1)；籍；观 | 原创扩展（同名传统拳术不作小说事实） |
| `sk_shaolinchangquan` | 少林长拳 | 拳脚/拳掌 | 3 黄上 | 中性 | 0.85/0.15 | 笑傲、侠客、鹿鼎、书剑 | 拜(L1)；书剑经南少林共享 | **（原创扩展）**；区别通行武馆的“长拳入门” |
| `sk_weituozhang` | 韦陀掌 | 拳脚/拳掌 | 2 黄中 | 阳 | 0.75/0.25 | 天龙、射雕、笑傲、侠客、鹿鼎 | 拜(L1)；观 | 原著入门功夫（待考 K-06：核《天龙八部》虚竹所习名目） |
| `sk_luohanquan` | 罗汉拳 | 拳脚/拳掌 | 1 黄下 | 阳 | 0.90/0.10 | 天龙、神雕、倚天、笑傲、鹿鼎 | 拜(L1)；籍；页；观 | 05 §13.8 |
| `sk_nianhuazhi` | 拈花指 | 拳脚/指法 | 9 地上 | 调和 | 0.30/0.70 | 天龙、鹿鼎 | 拜(L5)；鹿鼎澄观(L4) | 绝（原著） |
| `sk_wuxiangjiezhi` | 无相劫指 | 拳脚/指法 | 9 地上 | 调和 | 0.25/0.75 | 天龙 | 拜(L5)；观（鸠摩智） | 绝（原著） |
| `sk_dalijingangzhi` | 大力金刚指 | 拳脚/指法 | 8 地中 | 阳 | 0.65/0.35 | 天龙、倚天 | 拜(L4)达摩院；观（阿三） | 绝（原著《倚天屠龙记》） |
| `sk_yizhichan` | 一指禅 | 拳脚/指法 | 8 地中 | 调和 | 0.30/0.70 | 天龙、笑傲、侠客、书剑 | 拜(L4)；书剑南少林 | 绝（待考 K-01：核《天龙八部》《侠客行》《书剑恩仇录》是否出现该名目及施用人物） |
| `sk_mohezhi` | 摩诃指 | 拳脚/指法 | 7 地下 | 阳 | 0.50/0.50 | 天龙、侠客 | 拜(L4)达摩院 | 绝（待考 K-01：核《天龙八部》少林绝技名录） |
| `sk_duoluoyezhi` | 多罗叶指 | 拳脚/指法 | 7 地下 | 调和 | 0.40/0.60 | 天龙 | 拜(L4)达摩院 | 绝（原著） |
| `sk_jingangzhi` | 金刚指 | 拳脚/指法 | 4 玄下 | 阳 | 0.60/0.40 | 天龙、倚天、笑傲、侠客、鹿鼎、书剑 | 拜(L2)；籍 | 原创扩展（指力入门） |
| `sk_ruyingsuixingtui` | 如影随形腿 | 拳脚/腿法 | 7 地下 | 阳 | 0.70/0.30 | 天龙、笑傲、侠客 | 拜(L4)；籍（侠客） | 绝（待考 K-01：核《天龙八部》《笑傲江湖》《侠客行》是否出现该名目及施用人物） |
| `sk_tiesaozhou` | 铁扫帚 | 拳脚/腿法 | 5 玄中 | 阳 | 0.80/0.20 | 天龙、鹿鼎、书剑 | 拜(L3)；页 | 民间七十二艺名目，原创纳入 |
| `sk_tantui` | 少林弹腿 | 拳脚/腿法 | 2 黄中 | 中性 | 0.90/0.10 | 笑傲、侠客、鹿鼎、书剑 | 拜(L1)；观 | 民间名目，原创纳入 |
| `sk_longzhaoshou` | 龙爪手（金刚龙爪手） | 拳脚/擒拿 | 8 地中 | 阳 | 0.70/0.30 | 天龙、倚天、笑傲 | 拜(L4)般若堂；观（空性）；籍 | 绝（原著《倚天屠龙记》；05 §13.7） |
| `sk_yingzhuagong` | 鹰爪功 | 拳脚/擒拿 | 5 玄中 | 阳 | 0.75/0.25 | 倚天、笑傲、鹿鼎、书剑 | 拜(L3)；页 | 民间名目，原创纳入 |
| `sk_shaolinqinna` | 少林擒拿手 | 拳脚/擒拿 | 3 黄上 | 阳 | 0.85/0.15 | 天龙、射雕、神雕、倚天、笑傲、侠客、鹿鼎 | 拜(L1)；籍 | 原创扩展（05 引用为龙爪手前置） |
| `sk_fumozhangfa` | 伏魔杖法 | 兵器/棍杖 | 8 地中 | 阳 | 0.60/0.40 | 天龙、鹿鼎 | 拜(L4)；鹿鼎十八罗汉 | 绝（待考 K-01：核《天龙八部》《鹿鼎记》是否出现该名目及施用人物） |
| `sk_yachagun` | 夜叉棍法 | 兵器/棍杖 | 5 玄中 | 阳 | 0.75/0.25 | 天龙、鹿鼎 | 拜(L3)；页 | 民间少林大小夜叉棍，原创纳入 |
| `sk_yinshougun` | 阴手棍 | 兵器/棍杖 | 4 玄下 | 中性 | 0.80/0.20 | 笑傲、侠客、鹿鼎 | 拜(L2)；籍 | 史实名目（明·程宗猷《少林棍法阐宗》），原创纳入 |
| `sk_shaolingunfa` | 少林棍法 | 兵器/棍杖 | 2 黄中 | 中性 | 0.85/0.15 | 天龙、射雕、神雕、倚天、笑傲、侠客、鹿鼎、书剑 | 拜(L1)；籍；观 | 原创扩展（入门） |
| `sk_shaolinhushangun` | 少林护山棍 | 兵器/棍杖 | 3 黄上 | 中性 | 0.85/0.15 | 笑傲、侠客、鹿鼎、书剑 | 拜(L1)；书剑经南少林共享 | **（原创扩展）** |
| `sk_ranmudaofa` | 燃木刀法 | 兵器/刀 | 9 地上 | 阳 | 0.40/0.60 | 天龙 | 拜(L5)；观（鸠摩智） | 绝（原著） |
| `sk_cibeidao` | 慈悲刀 | 兵器/刀 | 6 玄上 | 调和 | 0.60/0.40 | 天龙、笑傲、侠客 | 拜(L3) | 原创扩展 |
| `sk_jiedaofa` | 戒刀法 | 兵器/刀 | 3 黄上 | 中性 | 0.85/0.15 | 天龙、笑傲、鹿鼎、书剑 | 拜(L1)；观 | 原创扩展 |
| `sk_damojianfa` | 达摩剑法 | 兵器/剑 | 7 地下 | 调和 | 0.55/0.45 | 笑傲 | 拜(L4)达摩院 | 绝（待考 K-01：核《笑傲江湖》是否出现该名目及施用人物） |
| `sk_fumojian` | 伏魔剑法 | 兵器/剑 | 5 玄中 | 阳 | 0.70/0.30 | 笑傲、侠客 | 拜(L3)；页 | 原创扩展（同名传统剑法不作小说事实） |
| `sk_luohanjian` | 罗汉剑法 | 兵器/剑 | 3 黄上 | 中性 | 0.85/0.15 | 天龙、笑傲 | 拜(L1) | 原创扩展 |
| `sk_jiashafumogong` | 袈裟伏魔功 | 兵器/奇门（袈裟） | 8 地中 | 调和 | 0.40/0.60 | 天龙 | 拜(L4)；观（鸠摩智） | 绝（原著） |
| `sk_xiangmochu` | 韦陀降魔杵 | 兵器/奇门（杵） | 6 玄上 | 阳 | 0.75/0.25 | 天龙、鹿鼎 | 拜(L3) | 原创扩展 |
| `sk_fumosuofa` | 伏魔索法 | 兵器/鞭索 | 6 玄上 | 阳 | 0.60/0.40 | 倚天、笑傲、鹿鼎 | 拜(L3)；倚天渡厄三僧 | 原创扩展（取三渡黑索之意） |
| `sk_yiweidujiang` | 一苇渡江 | 轻功 | 9 地上 | 中性 | — | 天龙 | 遇（达摩洞面壁）；拜(L5) | 绝；典出达摩渡江传说，原创扩展定级 |
| `sk_bihuyouqiang` | 壁虎游墙功 | 轻功 | 5 玄中 | 中性 | — | 天龙、倚天、笑傲、鹿鼎 | 拜(L3)；籍 | 民间七十二艺名目，原创纳入 |
| `sk_meihuazhuang` | 梅花桩 | 轻功 | 4 玄下 | 中性 | — | 笑傲、侠客、鹿鼎、书剑 | 拜(L2) | 民间名目，原创纳入 |
| `sk_luohanbu` | 罗汉步 | 轻功 | 2 黄中 | 中性 | — | 全部少林书界＋书剑 | 拜(L1) | 原创扩展（入门） |
| `sk_chanmenshenfa` | 禅门身法 | 轻功 | 2 黄中 | 调和 | — | 笑傲、侠客、鹿鼎、书剑 | 拜(L1)；书剑经南少林共享 | **（原创扩展）** |
| `sk_jingangnianzhu` | 金刚念珠 | 暗器 | 6 玄上 | 中性 | 0.85/0.15 | 笑傲、鹿鼎 | 拜(L3) | 原创扩展 |
| `sk_putizi` | 菩提子 | 暗器 | 3 黄上 | 中性 | 0.90/0.10 | 天龙、笑傲、鹿鼎、书剑 | 拜(L1)；观 | 原创扩展 |
| `sk_jingangfumoquan` | 金刚伏魔圈 | 杂学/阵法（合击） | 9 地上 | 阳 | 0.30/0.70 | 倚天 | 拜(L5)渡厄；合 | 原著（渡厄三僧） |
| `sk_luohanzhen` | 罗汉阵 | 杂学/阵法（合击） | 6 玄上 | 阳 | 0.60/0.40 | 天龙、鹿鼎 | 拜(L3)；合 | 原创扩展（待考 K-11：核《天龙八部》《鹿鼎记》是否出现同名阵法） |
| `sk_jingangnuhou` | 金刚怒吼 | 杂学/音功 | 6 玄上 | 阳 | 0/1 | 天龙、倚天、笑傲、鹿鼎 | 拜(L3) | 原创扩展（06 已引用） |
| `sk_shaolinshangke` | 少林伤科 | 杂学/医 | 5 玄中 | — | — | 笑傲、鹿鼎、书剑 | 拜(L3)药局；籍 | 原创扩展（少林伤科传统） |
| `sk_boruoxinjing` | 般若心经 | 杂学/心神 | 4 玄下 | — | — | 全部少林书界＋书剑 | 拜(L2)；籍 | 原创扩展（佛法根基） |

### 1.5 天级条目卡（3 门，与基准 §13 完全一致）

#### 1.5.1 易筋经 `sk_yijinjing`（天上 12 · 内功 · 天龙/射雕/倚天/笑傲）——摘要卡，定义以 05 §13.3 为准

- **简述**：少林至高内功，达摩所传（原著）。天龙中游坦之误打误撞以梵文经书练成；笑傲中方证欲以之为令狐冲化解异种真气（原著）。原著没有射雕、倚天玩家受授情节；本文相应学习途径均为原创扩展。
- **基本**：`harmony`；wOut/wIn 0/1；`inner.contribution {mpMaxPct 56, hpMaxPct 40, attrs {con 10, str 4, wil 8}, mpRegen 3.0, stats {resInjury 20}}`（IP 155）；`bridge: true`；`seclusionCap: 10`；moveSlots 5。
- **reqs**：`attrs {wil 70}`、`morality {min 20}`、`sect {id: sect_shaolin, rank: 5}`、`hard: [sect, morality]`。
- **层数要点**：1 易筋｜3 洗髓、伐毛洗髓｜5 化异种真气｜7 倒拽九牛尾（第一绝招）、金刚不坏之基｜8 百病不侵｜9 韦陀献杵（第二绝招）｜10 易筋换骨（第三绝招）、易筋大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 / 效果 | 招架 |
|---|---|---|---|---|---|---|---|---|---|---|
| 洗髓 | `mv_yijinjing_xisui` | 3 | `aoe_self` | 0 | — | 10% | 4 | 900 | 驱散自身 poison/injury/seal/cold/heat 全部（≤本品阶）；回复 10% 气血；可移除走火 1–2 级 | — |
| 韦陀献杵（绝） | `mv_yijinjing_weituo` | 9 | `aoe_self` | 0 | — | 10% | — | 1200 | `ultimate:true`；气势 100；`bf_weituo` 2 回合（Z4 +25%、resCC +30） | —；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |
| 倒拽九牛尾（绝） | `mv_yijinjing_daozhuai` | 7 | `aoe_pull` n2 | 1–3 | 2.20 | 10% | — | 1200 | `ultimate:true`；气势 100；拉拽 2 格 | 可；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |
| 易筋换骨（绝） | `mv_yijinjing_huangu` | 10 | `aoe_allies` r2 | 0 | — | 10% | — | 1200 | `ultimate:true`；气势 100；自身驱散全部减益、回复 35% 气血与 50% 内力、`bf_wudi` 1 回合；友方各驱散 2 个减益 | —；`MoveDef{unlock:10; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |

- **被动**：`ps_yijinjing_yijin`（1，resInjury +10→30pp）、`_famao`（3，每回合驱散 1 个 ≤ 品阶−2 的中毒/内伤）、`_huayi`（5，每回合 `bf_yizhongzhenqi` −2→−5 层，`auxMode: full`）、`_jingang`（7，气血 < 30% 时 `bf_hutizhenqi` 15%，每战 1 次）、`_baibing`（8，免疫 ≤ 品阶的 `bf_neixiwenluan`/`bf_jingmainixing`，resMind +20）、`_dacheng`（10，修炼 +15%、辅运比例 +0.10）。
- **本文补充（待 05 同步，§8.3）**：
  1. `learnSources` 补足原生书界：射雕 `{type: master, chapter: ch02_shediao, ref: "少林·当代方丈岗位槽", maxLayer: 10, note: "金国治下嵩山少林完整线（原创扩展；须 T01 L5）"}`；倚天 `{type: master, chapter: ch04_yitian, ref: npc_kongwen, maxLayer: 10, note: "屠狮大会后空闻方丈（原创扩展；须 T01 L5）"}`。05 现仅列天龙×2、笑傲×1。
  2. 按 C22，正式 `setTags` 应为 `[set_shaolin_jingang, set_shaolin_damo, set_saodiseng, set_fangzheng]`；05 现仅列第一项，须同步。
  3. 作为本文"七十二绝技·戾气"的**佛法根基**（§1.3.1）。
- **conflicts**：`sk_xixing` counter（化异种真气）；`sk_qishangquan` counter（≥ 5 重不伤己）；`sk_xisuijing` synergy（§1.6.4）。

#### 1.5.2 金刚不坏体 `sk_jingangbuhuai`（天下 10 · 内功（护体） · 倚天）

- **简述**：《倚天屠龙记》中空见神僧以金刚不坏体承受谢逊七伤拳、意在劝其止杀；最后因开口应答而护体有隙，受拳圆寂（原著）。本作定位：**护体终点**——横练一脉（铜人横练→铁布衫→金钟罩）之极，无罩门。
- **基本**：`yang`；wOut/wIn 0/1（撼山招式覆写）；`inner.contribution {mpMaxPct 30, hpMaxPct 32, attrs {con 12, str 5, wil 5}, mpRegen 2.4, stats {defOut 10, resCC 10}}`（IP 30+32+44+12 = 118 ✓；mp −29%、hp +28%、属性 +22%、回内 −20%，均在 ±30% 内）；`seclusionCap 8`；`auxUsableMoves [mv_jingangbuhuai_hushen]`；moveSlots 5（内功例外：普通招式 4）。
- **reqs**：`attrs {con 60, wil 55}`、`aptitude {apInner 55}`、`morality {min 20}`、`prereq [{skill: sk_jinzhongzhao, layer: 7}]`、`sect {id: sect_shaolin, rank: 5}`、`hard: [sect, prereq, morality]`。
- **层数要点**：1 金刚守势、金刚身｜3 受拳不还｜4 不坏｜5 金刚护身｜6 无罩门｜7 不坏金身（第一绝招）｜8 金疮不染｜9 金刚撼山（第二绝招）｜10 金刚大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 Buff | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 金刚守势 | `mv_jingangbuhuai_shoushi` | 1 | `aoe_self` | 0 | — | 6% | 2 | 800 | `bf_shoushi` 3（自身；06 所列"少林金刚守势"） | — | 架势 |
| 受拳不还 | `mv_jingangbuhuai_shouquan` | 3 | `aoe_self` | 0 | — | 7% | 3 | 800 | `bf_xieli` 1 + `bf_fanzhen` 1（自身）；本回合放弃攻击 | — | 架势（原著"十三拳不还手"致敬） |
| 金刚护身 | `mv_jingangbuhuai_hushen` | 5 | `aoe_self` | 0 | — | 10% | 4 | 900 | `bf_hutizhenqi`（`shieldPctHpMax 0.20`）3；驱散自身 1 个 `cc` | — | 护盾 ≈ 治疗 18%×1.2 ≈ 21.6%，取 20% |
| 金刚撼山（绝） | `mv_jingangbuhuai_hanshan` | 9 | `aoe_single` | 1 | 2.90 | 10% | — | 1200 | `ultimate:true`；气势 100；击退 1；`bf_xuanyun` 30% 1 | 可 | `3.00−0.05−0.25×0.30=2.875≈2.90`；wOut/wIn 覆写 0.60/0.40；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |
| 不坏金身（绝） | `mv_jingangbuhuai_jinshen` | 7 | `aoe_around`（嘲讽） | 0 | — | 10% | — | 1200 | `ultimate:true`；气势 100；自身 `bf_wudi` 1 + `bf_mian_kong` 2；周身六邻格敌人 `bf_chaofeng` 1 | — | 06 所列"金刚不坏体绝招"来源；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |

- **被动**：
  - `ps_jingangbuhuai_jingangshen` 金刚身（1，stat，Z4 +4%→+12%，`scope: unit`，`auxMode: scaled`）
  - `ps_jingangbuhuai_buhuai` 不坏（4，mechanic，主运时常驻 `bf_jingang`：单次伤害 ≤ hpMax × 20%（天下），`auxMode: none`）
  - `ps_jingangbuhuai_wuzhaomen` 无罩门（6，mechanic，同装配的横练内功不产生 `bf_zhaomen`，`auxMode: full`）
  - `ps_jingangbuhuai_jinchuang` 金疮不染（8，trigger `battleStart`，`bf_mian_liuxue` 全场）
  - `ps_jingangbuhuai_dacheng` 金刚大成（10，mechanic，`bf_jingang` 上限按天中 18% 计；免疫 ≤ 品阶的 `cc.knock`）
- **setTags**：`[]`。**conflicts**：`{with: sk_shizihou, type: clash, note: 开口泄气}`。
- **特殊规则·开口泄气**（原著情节的机制化，原创扩展）：施放任何 `sonic` 标签招式（狮子吼、金刚怒吼）后，"不坏"（`bf_jingang`）失效至自身下次行动开始。
- **获取**：`{master, ch04_yitian, npc_duee, maxLayer 10, note: 闯过金刚伏魔圈后渡厄授（原创扩展）}`；`{qiyu, ch04_yitian, q_04_qiyu_81, maxLayer 8, reqsOverride {sect: null}, note: "空见遗泽"——空见圆寂处遗留心法（原创扩展）}`。`observable: false`。

#### 1.5.3 狮子吼 `sk_shizihou`（天下 10 · 杂学·音功 · 倚天；少林版，谢逊版同 ID）

- **简述**：倚天中谢逊于王盘山岛以狮子吼震倒群豪，事先令张翠山、殷素素塞耳（原著）。基准 §13 记为少林/谢逊；本条为少林传承，**谢逊途径由倚天组 `skills-yitian.md` 与 `chapters/04` 以同一 ID 配置**，本文只登记接口。
- **基本**：`yang`；wOut/wIn 0/1；资质 `apInner`（05 §2.3），强度辅以 `music`；`layerStats {effHit [3,10], resMind [2,10]}`（20）；moveSlots 5；所有招式 `tags [sonic]`、`hTol 99`、`delivery ranged`、不可招架。
- **reqs**：`attrs {con 55, wil 60}`、`aptitude {apInner 55}`、`prereq [{skill: sk_jingangnuhou, layer: 5}]`、`sect {id: sect_shaolin, rank: 5}`、`hard: [sect, prereq]`。
- **层数要点**：1 狮吼震、音劲｜3 慑魂｜4 收发由心｜5 破阵吼｜6 当头棒喝、狮王神威｜7 狮子吼（第一绝招）｜8 震散护体｜9 聚音成线（第二绝招）｜10 狮吼大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 友伤 | 附带 Buff | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 狮吼震 | `mv_shizihou_zhenhou` | 1 | `aoe_around` | 0 | 0.65 | 10% | 2 | all | `bf_zhenshe` 50% 1；`bf_xieqi` 30% 2 | N=6、AF=0.75；0.75×(1+0.24+0.10)×0.85×0.85−0.05−0.03≈0.65 |
| 慑魂 | `mv_shizihou_shehun` | 3 | `aoe_ring` r2 | 0 | 0.52 | 10% | 3 | all | `bf_kongju` 25% 1 | 0.55×1.46×0.7225−0.0625 |
| 破阵吼 | `mv_shizihou_pozhen` | 5 | `aoe_cone {r:3,angle:60,dirCount:6}` | 1 | 0.60 | 9% | 3 | all | 驱散目标 1 个 `stance`（06 §8.8） | N=7、AF=0.70；0.70×1.41×0.7225−0.10=0.61 |
| 当头棒喝 | `mv_shizihou_hexing` | 6 | `aoe_allies` r3 | 0 | — | 8% | 3 | allies | 友方各驱散 1 个 `mind`（≤ 品阶；原创扩展） | 支援 |
| 聚音成线（绝） | `mv_shizihou_juyin` | 9 | `aoe_single` | 1–5 | 2.05 | 10% | — | none | `ultimate:true`；气势 100；`recovery:1200`；`bf_zhenshe` 100% 1 | `3.00×0.85×0.85−0.10=2.0675≈2.05`；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |
| 狮子吼（绝） | `mv_shizihou_shizihou` | 7 | `aoe_field` side all | — | 0.50 | 10% | — | all | `ultimate:true`；气势 100；`recovery:1200`；`bf_xieqi` 100% 2；`bf_zhenshe` 100% 1；`bf_kongju` 30% 1 | 3.0×0.35×0.7225−0.10−0.10−0.075；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |

- **被动**：`ps_shizihou_yinjin` 音劲（1，stat，Z2 无视内劲防御 5%→15%）；`ps_shizihou_shoufa` 收发由心（4，mechanic，友方受本武学伤害与减益 ×(1 − 0.30→1.00)，10 重时不伤同伴）；`ps_shizihou_shenwei` 狮王神威（6，trigger `battleStart`，3 格内敌人 `bf_chihuan`，每战 1 次）；`ps_shizihou_zhensan` 震散护体（8，effect，本武学对护体真气伤害 ×1.5）；`ps_shizihou_dacheng` 狮吼大成（10，mechanic，无视"塞耳"类防护，design/10）。
- **conflicts**：`{with: sk_jingangbuhuai, type: clash, note: 开口泄气}`。**setTags**：`[set_mingjiao_sida_fawang]`；该标签仅在 `npc_xiexun` 来源计入“四大法王”主题，少林授艺来源不计该主题（C22；套装定义见 `skills-yitian` §7）。
- **获取**：`{master, ch04_yitian, npc_kongzhi, maxLayer 10, note: 屠狮大会后（原创扩展）}`；`{master, ch04_yitian, npc_xiexun, reqsOverride {sect: null, prereq: [], hard: []}, note: 由倚天组/chapters/04 配置}`。`observable: false`。
- **反制**："塞耳"物品/定力 ≥ 80 免疫附带的心神类（05 §4.6；数值归 06/10）。

### 1.6 地阶条目卡（嵩山少林 24 门）

> 卡片字段：简述｜基本（性质、比例、`layerStats` 或内功贡献、招式栏）｜reqs｜层数要点｜招式表｜被动｜setTags / conflicts / 特殊｜获取。凡七十二绝技均带 `lineageGroups [lg_shaolin72]`、`special.liqi: true`、`special.fusible: true`、`observable: true`（观摩上限 6 重），不再逐卡重复。地阶耗内基准 7%。卡内未写的项取默认：收招 1000（架势 800）、附带 Buff `grade: inherit`、`conflicts: []`、`setTags: []`、`weaponReq: null`（拳脚/内功/杂学）。

#### 1.6.1 横练与佛门内功（4 门）

> **横练为何归"内功·护体"**：① 基准 §13 已把金刚不坏体定为"内功（护体）"，横练一脉与之同源；② 横练是"运气"功夫（硬气功），靠内息贯注皮肉筋骨，数值上以气血、根骨、外防为主，适合走 05 §5.5 内功贡献（IP 预算内把 `mpMaxPct` 压低 30%、`hpMaxPct` 抬高 30%）；③ 归内功才计入核心携带类别（基准 §3 规则 1），用户示例"金刚套装"在 1/1/1 的低武书界才有讨论意义。代价：横练会挤占内功栏（主运 1 + 辅运 2），与易筋经等主修心法形成取舍。

##### 铁布衫 `sk_tiebushan`（地下 7 · 内功·横练 · 天龙/鹿鼎/书剑 · 七十二绝技，原创纳入）

- **简述**：外门横练，以气贯皮、周身如披铁衫，刀剑难入而有罩门（民间名目；06 已列为"少林横练"，本文定级地下）。
- **基本**：`yang`；`inner.contribution {mpMaxPct 18.5, hpMaxPct 20.5, attrs {con 7, str 5}, mpRegen 1.8, stats {defOut 8, tough 7}}`（IP 18.5+20.5+24+9 = 72 ✓）；moveSlots 4。
- **reqs**：`attrs {con 40, str 35}`、`aptitude {apInner 35}`、`prereq [{skill: sk_tongrenhenglian, layer: 5}]`、`sect {id: sect_shaolin, rank: 3}`、`hard: [sect, prereq]`。
- **层数要点**：1 硬接、铁背靠、布衫、罩门｜4 千斤坠｜5 韧劲｜6 铁牛冲｜7 罡气护身（绝）｜10 布衫大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 Buff | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 硬接 | `mv_tiebushan_yingjie` | 1 | `aoe_self` | 0 | — | 5% | 2 | 800 | `bf_waifang_sheng` 2（自身） | — | 架势 |
| 铁背靠 | `mv_tiebushan_tiebei` | 1 | `aoe_single` | 1 | 1.05 | 7% | 1 | 1000 | 击退 1 | 可 | 1+0.12−0.05；wOut/wIn 覆写 0.80/0.20 |
| 千斤坠 | `mv_tiebushan_qianjinzhui` | 4 | `aoe_self` | 0 | — | 5% | 3 | 800 | `bf_wenzhong` 3（自身；06 所列"千斤坠"） | — | 架势 |
| 铁牛冲 | `mv_tiebushan_tieniu` | 6 | `aoe_dash` n2 | 1–2 | 1.20 | 8% | 2 | 1000 | — | 可 | 1+0.24+0.05−0.10 |
| 罡气护身（绝） | `mv_tiebushan_gangqi` | 7 | `aoe_self` | 0 | — | 9% | — | 1200 | `ultimate:true`；`rageCost:100`；`bf_hutizhenqi`（0.20）3 + `bf_fanzhen` 3 + `bf_mian_liuxue` 3 | — | 自身绝招；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

- **被动**：`ps_tiebushan_bushan` 布衫（1，stat，Z4：近战来袭 −3%→−8%，`auxMode: scaled`）；`ps_tiebushan_zhaomen` 罩门（1，mechanic，装配即伴生 `bf_zhaomen`）；`ps_tiebushan_renjin` 韧劲（5，trigger `onHurt` 近战，`bf_renjin` 2，每回合 1 次）；`ps_tiebushan_dacheng` 布衫大成（10，mechanic，罩门固定于背后，识破需 `lore ≥ 70`）。
- **setTags**：`[]`。
- **获取**：`{master, ch01_tianlong, 少林·罗汉堂授艺岗位槽, 10}`；`{manual, ch08_luding, it_miji_tiebushan, 10}`；`{master, ch12_shujian, 南少林·罗汉堂授艺岗位槽, 10, reqsOverride {sect: {id: sect_nanshaolin, rank: 4}, prereq: [{skill: sk_tiexiangong, layer: 5}]}}`（书剑无铜人横练传承，改以铁线功为前置）。倚天来源按 C14 撤下，只保留 NPC 见闻，不形成可学记录。

##### 金钟罩 `sk_jinzhongzhao`（地中 8 · 内功·横练 · 天龙/笑傲 · 七十二绝技，原创纳入）

- **简述**：横练中乘，罡气外罩如钟，受击发声反震（民间名目；06 列为反震 `bf_fanzhen` 来源之一）。
- **基本**：`yang`；`inner.contribution {mpMaxPct 21, hpMaxPct 23, attrs {con 8, str 4, wil 2}, mpRegen 2.2, stats {defOut 10, defIn 5}}`（IP 21+23+28+11 = 83 ✓）；moveSlots 4。
- **reqs**：`attrs {con 45, str 40, wil 40}`、`aptitude {apInner 45}`、`prereq [{skill: sk_tiebushan, layer: 5}]`、`sect {id: sect_shaolin, rank: 4}`、`hard: [sect, prereq]`。
- **层数要点**：1 金钟护体、钟鸣、罩、罩门｜4 金钟反震｜5 钟声回响｜6 洪钟大吕｜7 金钟不破（第一绝招）｜10 金钟大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 Buff | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 金钟护体 | `mv_jinzhongzhao_huti` | 1 | `aoe_self` | 0 | — | 9% | 3 | 900 | `bf_hutizhenqi`（0.15）3 | — | 护盾 |
| 钟鸣 | `mv_jinzhongzhao_zhongming` | 1 | `aoe_around` | 0 | 0.95 | 8% | 2 | 1000 | `bf_xuanyun` 15% 1 | 可 | N=6、AF=0.75；0.75×(1+0.24+0.05)−0.0375=0.93≈0.95；wOut/wIn 覆写 0.30/0.70 |
| 金钟反震 | `mv_jinzhongzhao_fanzhen` | 4 | `aoe_self` | 0 | — | 7% | 3 | 800 | `bf_fanzhen` 2（自身） | — | 架势 |
| 洪钟大吕 | `mv_jinzhongzhao_hongzhong` | 6 | `aoe_wave` d1 w3 | 1 | 0.75 | 9% | 2 | 1000 | `ultimate:false`；击退 1 | 可 | 普通招：`0.70×1.34×0.85−0.05=0.747≈0.75`；`MoveDef{unlock:6; ultimate:false; mpCost:9%; cd:2; recovery:1000}` |
| 金钟不破（绝） | `mv_jinzhongzhao_bupo` | 7 | `aoe_allies` r1 | 0 | — | 9% | — | 1200 | `ultimate:true`；气势 100；自身 `bf_hutizhenqi`（0.25）3 + `bf_mian_kong` 1；相邻友方 `bf_hutizhenqi`（`shieldPctCasterHpMax 0.10`）3 | — | 自身/友方绝招；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

- **被动**：`ps_jinzhongzhao_zhao` 罩（1，stat，Z4 −4%→−10%，`scaled`）；`ps_jinzhongzhao_zhaomen` 罩门（1，伴生 `bf_zhaomen`）；`ps_jinzhongzhao_huixiang` 钟声回响（5，trigger `onHurt` 近战 20%，`bf_fanzhen` 1，每回合 1 次）；`ps_jinzhongzhao_dacheng` 金钟大成（10，mechanic，罩门受击加成 +50% → +25%；`shieldMax` +5% hpMax）。
- **setTags**：`[set_fangzheng]`。
- **获取**：`{master, ch01_tianlong, 少林·罗汉堂授艺岗位槽, 10}`；`{manual, ch05_xiaoao, it_miji_jinzhongzhao, 10, reqsOverride {prereq: [{skill: sk_tongrenhenglian, layer: 7}]}, note: 笑傲无铁布衫传承，改以铜人横练为前置}`。倚天不列可学来源（C14）。

##### 少林九阳功 `sk_shaolinjiuyang`（地中 8 · 内功 · 倚天 · 原著）

- **简述**：《倚天屠龙记》楔子中，觉远临终背诵九阳经文，张君宝、郭襄、无色禅师各有所记，后来形成武当、峨眉、少林三派九阳功（原著）。同源组 `lg_jiuyang`（02 §5.4）。
- **基本**：`yang`；`inner.contribution {mpMaxPct 32, hpMaxPct 18, attrs {con 5, str 3, wil 3}, mpRegen 2.2, stats {resCold 10, resInjury 5}}`（IP 32+18+22+11 = 83 ✓）；`auxUsableMoves [mv_shaolinjiuyang_liaoshang]`；moveSlots 4。
- **reqs**：`attrs {con 45}`、`aptitude {apInner 45}`、`sect {id: sect_shaolin, rank: 4}`、`hard: [sect]`。
- **层数要点**：1 九阳护体、他强由他强（残）｜3 纯阳劲｜5 九阳疗伤、寒毒难侵｜7 九阳周天（第一绝招）｜8 三派同源｜10 九阳余绪。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 / 效果 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 九阳护体 | `mv_shaolinjiuyang_huti` | 1 | `aoe_self` | 0 | — | 10% | 3 | 900 | `ultimate:false`；`bf_hutizhenqi`（0.12）3；驱散自身 1 个 `cold` | — | 普通护盾；`MoveDef{unlock:1; ultimate:false; mpCost:10%; cd:3; recovery:900}` |
| 纯阳劲 | `mv_shaolinjiuyang_chunyang` | 3 | `aoe_single` | 1–2 | 1.10 | 8% | 2 | 1000 | — | 可 | (1+0.24+0.05)×0.85 |
| 九阳疗伤 | `mv_shaolinjiuyang_liaoshang` | 5 | `aoe_single`（友） | 0–1 | — | 7% | 2 | 1000 | 回复 18% 气血；驱散 1 个 `injury`/`cold` | — | 标准治疗 |
| 九阳周天（绝） | `mv_shaolinjiuyang_zhoutian` | 7 | `aoe_self` | 0 | — | 9% | — | 1200 | `ultimate:true`；气势 100；回复 25% 气血；`bf_huichun` 3；驱散全部 `cold` | — | 自身绝招；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

- **被动**：`ps_shaolinjiuyang_taqiang` 他强由他强（残）（1，stat，Z4 −3%→−8%，攻方攻击合计高于自身时）；`ps_shaolinjiuyang_hannan` 寒毒难侵（5，mechanic，免疫品阶 ≤ 本功 `effGrade`−2 的 `cold`，`auxMode: full`）；`ps_shaolinjiuyang_tongyuan` 三派同源（8，mechanic，同装配任一 `lg_jiuyang` 成员时 `mpRegen` +0.5pp，属 05 §9.2 synergy ≤ 8%）；`ps_shaolinjiuyang_dacheng` 九阳余绪（10，mechanic，七伤拳自伤叠加减半）。
- **setTags**：`[]`。**conflicts**：`{with: sk_qishangquan, type: counter, note: 10 重起七伤减半}`。
- **获取**：`{master, ch04_yitian, npc_kongwen, 10}`；`{qiyu, ch04_yitian, q_04_qiyu_82, maxLayer 5, reqsOverride {sect: null}, note: 楔子 1262 随郭襄游少林、闻觉远诵经（原创扩展：玩家在场）}`。

##### 洗髓经 `sk_xisuijing`（地上 9 · 内功 · 侠客/鹿鼎 · 原创扩展定级）

- **简述**：民间传说常把《易筋》《洗髓》二经并称；本作据此原创扩展为易筋经的姊妹篇，重“伐毛洗髓、澄心定性”，但不把它写成金庸原著事实。本作定为**明清少林的最高内功**（非天级：基准 §13 未收，不得升天），满足 02 §2.8“鹿鼎原生最高内功为地阶（catalog 定）”。
- **基本**：`harmony`（≥ 7，自动桥接）；`inner.contribution {mpMaxPct 34, hpMaxPct 22, attrs {con 5, wis 4, wil 4}, mpRegen 2.5, stats {resMind 8, resInjury 7}}`（IP 34+22+26+12.5 = 94.5 ✓）；moveSlots 4。
- **reqs**：`attrs {wil 50, wis 45}`、`aptitude {apInner 45}`、`morality {min 10}`、`sect {id: sect_shaolin, rank: 4}`、`hard: [sect, morality]`。
- **层数要点**：1 伐毛、清净｜3 澄心｜4 化异｜5 换脉｜6 化戾｜7 洗髓还原（绝）｜10 洗髓大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 / 效果 | 招架 |
|---|---|---|---|---|---|---|---|---|---|---|
| 伐毛 | `mv_xisuijing_famao` | 1 | `aoe_self` | 0 | — | 8% | 3 | 900 | 驱散自身 2 个 `poison`/`injury`（≤ 品阶） | — |
| 澄心 | `mv_xisuijing_chengxin` | 3 | `aoe_allies` r2 | 0 | — | 9% | 3 | 1000 | 友方各驱散 1 个 `mind`；`bf_dingxin` 3 | — |
| 换脉（绝） | `mv_xisuijing_huanmai` | 9 | `aoe_self` | 0 | — | 9% | — | 1200 | `ultimate:true`；气势 100；移除 ≤ 品阶的走火 1–2 级；回复 10% 气血 | —；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 洗髓还原（绝） | `mv_xisuijing_huanyuan` | 7 | `aoe_allies` r2 | 0 | — | 9% | — | 1200 | `ultimate:true`；气势 100；友方各驱散 2 个减益并回复 15% 气血；自身 `bf_mian_xin` 2 | —；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

- **被动**：`ps_xisuijing_qingjing` 清净（1，effect，回合开始回复 hpMax 0.5%→1.5%，`scaled`）；`ps_xisuijing_huayi` 化异（4，effect，每回合 `bf_yizhongzhenqi` −1→−3 层，`auxMode: full`）；`ps_xisuijing_huali` 化戾（6，mechanic，视为佛法根基；七十二绝技修炼 +10%）；`ps_xisuijing_dacheng` 洗髓大成（10，mechanic，免疫 ≤ 品阶的 `bf_neixiwenluan`；顿悟概率 +0.5%）。
- **setTags**：`[set_shaolin_damo]`。**conflicts**：`{with: sk_yijinjing, type: synergy, note: 易洗双修，同装配时二者辅运比例 +0.05}`。
- **获取**：`{master, ch06_xiake, 少林·代掌寺务长老岗位槽, 10, note: 妙谛赴侠客岛后（原创扩展）}`；`{master, ch08_luding, npc_huicong, 10}`；`{manual, ch08_luding, it_miji_xisuijing, 8, note: 藏经阁；韦小宝线可"借阅"（原创扩展）}`。`observable: false`（内功心法不可观摩）。

#### 1.6.2 拳掌·七十二绝技（6 门）

##### 大金刚拳 `sk_dajingangquan`（地下 7 · 拳脚·拳 · 天龙）

- **简述**：少林外门拳法之刚猛者，拳如金刚捣杵；本作将传统少林名目纳入七十二绝技，招名与玩法均为原创扩展。
- **基本**：`yang` · 0.65/0.35 · `layerStats {parry [2,6], defOut [2,9]}`（15）· moveSlots 4。
- **reqs**：`attrs {str 40, con 35, wis 40}`、`aptitude {apFist 40}`、`prereq [{skill: sk_fuhuquan, layer: 5}]`、`sect {id: sect_shaolin, rank: 4}`、`hard: [sect, prereq]`。
- **层数要点**：1 金刚开山、金刚镇魔、刚劲｜3 怒目金刚｜4 怒目（被动）｜5 金刚捣杵｜7 金刚一怒（绝）｜10 大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 Buff | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 金刚开山 | `mv_dajingangquan_kaishan` | 1 | `aoe_single` | 1 | 1.14 | 8% | 1 | 1000 | `bf_pojia` 30% 2 | 可 | 1+0.12+0.05−0.03 |
| 金刚镇魔 | `mv_dajingangquan_zhenmo` | 1 | `aoe_single` | 1 | 0.95 | 7% | 0 | 1000 | 击退 1 | 可 | 1−0.05 |
| 怒目金刚 | `mv_dajingangquan_numu` | 3 | `aoe_cone {angle:120,r:1,dirCount:6}` | 1 | 1.10 | 8% | 2 | 1000 | — | 可 | N=3、AF=0.85；0.85×1.29=1.10 |
| 金刚捣杵 | `mv_dajingangquan_daochu` | 5 | `aoe_single` | 1 | 1.36 | 9% | 2 | 1100 | `bf_xuanyun` 20% 1 | 可 | 1+0.24+0.10+0.07−0.05 |
| 金刚一怒（绝） | `mv_dajingangquan_yinu` | 7 | `aoe_cone {r:2,angle:60,dirCount:6}` | 1 | 2.30（3 段） | 9% | — | 1200 | `ultimate:true`；`rageCost:100`；`bf_xuanyun` 30% 1 | 可 | N=4、AF=0.80；3.0×0.80−0.075=2.325≈2.30；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

- **被动**：`ps_dajingangquan_gangjin` 刚劲（1，Z2 无视外防 4%→12%）；`ps_dajingangquan_numu` 怒目（4，trigger `onHurt`，`bf_waigong_sheng` 2，每回合 1 次）；`ps_dajingangquan_dacheng` 大成（10，Z3 本武学 +8%）。
- **获取**：`{master, ch01_tianlong, 少林·罗汉堂授艺岗位槽, 10}`；`{pages, it_canye_dajingangquan, pagesTotal 6}`。倚天不掉落可拼成完整秘籍的残页（C14）。

##### 大金刚掌 `sk_dajingangzhang`（地下 7 · 拳脚·掌 · 天龙/笑傲/侠客；别名"大力金刚掌"）

- **简述**：掌力沉雄、专震内腑；“大金刚掌／大力金刚掌”的小说用名仍待 K-01 核定，06 以“大力金刚掌”列为内伤来源，本文暂以 `sk_dajingangzhang` 收录。**拳掌进阶链**：罗汉拳（黄下）→ 铁砂掌（玄中）→ 大金刚掌（地下）→ 须弥山掌 / 千手如来掌（地上）。
- **基本**：`yang` · 0.55/0.45 · `layerStats {defOut [2,8], crit [1,6]}`（14）· moveSlots 4。
- **reqs**：`attrs {str 40, con 40, wis 40}`、`aptitude {apFist 40}`、`prereq [{skill: sk_tieshazhang, layer: 5}]`、`sect {id: sect_shaolin, rank: 4}`、`hard: [sect, prereq]`。
- **层数要点**：1 托天式、摩云掌、掌力沉雄｜4 裂石｜5 震伤｜6 大力摧山｜7 大力金刚（绝）｜10 大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 Buff | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 托天式 | `mv_dajingangzhang_tuotian` | 1 | `aoe_single` | 1 | 0.97 | 7% | 0 | 1000 | `bf_neishang` 25% 1 层 | 可 | 1−0.025 |
| 摩云掌 | `mv_dajingangzhang_moyun` | 1 | `aoe_single` | 1–2 | 0.99 | 8% | 1 | 1000 | — | 可 | 1.17×0.85（掌风，ranged） |
| 裂石 | `mv_dajingangzhang_lieshi` | 4 | `aoe_single` | 1 | 1.36 | 9% | 2 | 1100 | `bf_pojia` 50% 2 | 可 | 1.41−0.05 |
| 大力摧山 | `mv_dajingangzhang_cuishan` | 6 | `aoe_line` n2 | 1–2 | 1.05 | 8% | 2 | 1000 | 击退 1 | 可 | 0.85×1.29−0.05 |
| 大力金刚（绝） | `mv_dajingangzhang_dali` | 7 | `aoe_single` | 1 | 2.80 | 9% | — | 1200 | `ultimate:true`；`rageCost:100`；`bf_neishang` 100% 2 层；`bf_xuanyun` 30% 1 | 可 | 3.0−0.10−0.075；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

- **AR-16 外放字段**：`mv_dajingangzhang_moyun` → `MoveDef{projection:true; range:{min:1,max:2}; aoe:{tpl:aoe_single}; projectionSpreadSteps:[{tpl:aoe_single},{tpl:aoe_single},{tpl:aoe_single}]; meridianRouteRef:mfr_dajingangzhang_moyun}`；本招全部伤害段 `DamageKind='projected'`。其余本门均为贴身掌击或近身推山，已审不标。

- **被动**：`ps_dajingangzhang_chenxiong` 掌力沉雄（1，Z2 4%→10%）；`ps_dajingangzhang_zhenshang` 震伤（5，trigger `onHit` 20%，`bf_neishang` 1 层）；`ps_dajingangzhang_dacheng` 大成（10，对带 `bf_neishang` 的目标 Z3 +8%）。
- **获取**：`{master, ch01_tianlong, 少林·罗汉堂授艺岗位槽, 10}`；`{master, ch05_xiaoao, 少林·罗汉堂授艺岗位槽, 10}`；`{manual, ch06_xiake, it_miji_dajingangzhang, 10}`。

##### 般若掌 `sk_boruozhang`（地中 8 · 拳脚·掌 · 天龙/倚天/鹿鼎 · 原著）

- **简述**：少林七十二绝技之一；《天龙八部》有般若掌名目，《鹿鼎记》澄观为般若堂首座。本文“般若智光、破执去妄”的掌意及疗愈效果均为原创扩展，定位为**攻守兼修、能疗能制服**的佛门掌法。
- **基本**：`harmony` · 0.45/0.55 · `layerStats {parry [3,9], defIn [1,6]}`（15）· moveSlots 4。
- **reqs**：`attrs {str 40, wis 45}`、`aptitude {apFist 45}`、`prereq [{skill: sk_weituozhang, layer: 7}]`、`sect {id: sect_shaolin, rank: 4}`、`hard: [sect, prereq]`。倚天本土来源按 C17 使用 `reqsOverride {prereq: [{skill: sk_tieshazhang, layer: 5}]}`，避免依赖该书界白名单外的韦陀掌。
- **层数要点**：1 如是、空相、无住｜4 照见五蕴｜5 慈悲｜6 度一切苦厄｜7 般若波罗蜜（第一绝招）｜10 大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 / 效果 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 如是 | `mv_boruozhang_rushi` | 1 | `aoe_single` | 1 | 1.00 | 7% | 0 | 1000 | — | 可 | 基准 |
| 空相 | `mv_boruozhang_kongxiang` | 1 | `aoe_line` n3 | 1–3 | 0.80 | 8% | 1 | 1000 | — | 可 | 0.80×1.17×0.85 |
| 照见五蕴 | `mv_boruozhang_zhaojian` | 4 | `aoe_single` | 1 | 1.20 | 9% | 2 | 1000 | `ultimate:false`；`bf_sangong` 40% 2；驱散目标 1 个 `guard` | 可 | 普通招：`1.34−0.10×0.40−0.10=1.20`；`MoveDef{unlock:4; ultimate:false; mpCost:9%; cd:2; recovery:1000}` |
| 度一切苦厄 | `mv_boruozhang_duyi` | 6 | `aoe_single`（友） | 0–1 | — | 7% | 2 | 1000 | 回复 18% 气血；驱散 1 个 `injury` | — | 标准治疗 |
| 般若波罗蜜（绝） | `mv_boruozhang_boluomi` | 7 | `aoe_disk {r:1}` | 1–3 | 1.50 | 9% | — | 1200 | `ultimate:true`；气势 100；`bf_sangong` 50% 2 | 可 | 3.0×0.60×0.85−0.05=1.48（手调 +0.02）；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

- **被动**：`ps_boruozhang_wuzhu` 无住（1，trigger `onParry`，`bf_xieli` 1，每回合 1 次）；`ps_boruozhang_cibei` 慈悲（5，mechanic，击倒改"制服"，§1.3.2）；`ps_boruozhang_dacheng` 大成（10，本武学治疗 +20%，伤害 Z3 +6%）。
- **AR-16 审计**：`mv_boruozhang_kongxiang`、`mv_boruozhang_boluomi` 虽为远程掌招，但现文只写掌意和几何，未明确“离体掌力”，均暂记待考；其余为接触攻击、治疗或架势，不标。
- **setTags**：`[]`。
- **获取**：`{master, ch01_tianlong, 少林·般若堂授艺岗位槽, 10}`；`{master, ch04_yitian, 少林·般若堂授艺岗位槽, 10, reqsOverride {prereq: [{skill: sk_tieshazhang, layer: 5}]}}`；`{master, ch08_luding, npc_chengguan, 10}`。

##### 韦陀杵 `sk_weituochu`（地中 8 · 拳脚·拳 · 天龙 · 原著；别名"大韦陀杵"）

- **简述**：《天龙八部》中“大韦陀杵”是玄悲大师的成名绝技；玄悲遇害后，少林因“以彼之道，还施彼身”而疑姑苏慕容，后知乃慕容博所为（原著）。
- **基本**：`yang` · 0.60/0.40 · `layerStats {defOut [2,7], crit [2,8]}`（15）· moveSlots 4。
- **reqs**：`attrs {str 45, con 40, wis 40}`、`aptitude {apFist 45}`、`prereq [{skill: sk_weituozhang, layer: 7}]`、`sect {id: sect_shaolin, rank: 4}`、`hard: [sect, prereq]`。
- **层数要点**：1 降魔杵、护法、金刚力｜4 镇岳｜5 护法（被动）｜7 韦陀伏魔、大韦陀杵（第一绝招）｜10 大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 Buff | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 降魔杵 | `mv_weituochu_xiangmo` | 1 | `aoe_single` | 1 | 1.15 | 8% | 1 | 1000 | `bf_neishang` 20% 1 层 | 可 | 1.17−0.02 |
| 护法 | `mv_weituochu_hufa` | 1 | `aoe_self` | 0 | — | 5% | 2 | 800 | `bf_shoushi` 2 | — | 架势 |
| 镇岳 | `mv_weituochu_zhenyue` | 4 | `aoe_leap`（无溅射） | 1–3 | 1.10 | 9% | 2 | 1000 | — | 可 | 0.90×1.34−0.10 |
| 大韦陀杵（绝） | `mv_weituochu_dachu` | 7 | `aoe_single` | 1 | 2.90 | 9% | — | 1200 | `ultimate:true`；气势 100；`bf_neishang` 100% 2 层 | 可 | `3.00−0.10=2.90`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 韦陀伏魔 | `mv_weituochu_fumo` | 7 | `aoe_leap {splash:{tpl:aoe_disk,r:1}}` | 1–3 | 1.05（溅射 ×0.5） | 9% | 2 | 1000 | `ultimate:false`；`bf_xuanyun` 30% 1 | 可 | 普通招落点 N=7、AF=0.70：`0.90×1.34−0.25×0.30=1.131≈1.10`，按跃击机动再手调 −0.05 为 1.05；`MoveDef{unlock:7; ultimate:false; mpCost:9%; cd:2; recovery:1000}` |

- **被动**：`ps_weituochu_jingangli` 金刚力（1，Z2 5%→12%）；`ps_weituochu_hufa` 护法（5，trigger `onKill`，`bf_ruiyi` 2）；`ps_weituochu_dacheng` 大成（10，大韦陀杵冷却 −1）。
- **获取**：`{master, ch01_tianlong, 少林·戒律院授艺岗位槽, 10, note: 戒律院（玄悲一脉）}`。倚天不列可学来源（C14）。

##### 须弥山掌 `sk_xumishanzhang`（地上 9 · 拳脚·掌 · 天龙）

- **简述**：掌势如须弥压顶，少林掌法中最沉重者；名目是否见《天龙八部》及其施用人物待 K-01 核定，本文效果为原创扩展。只在天龙藏经阁鼎盛时可学。
- **基本**：`yang` · 0.50/0.50 · `layerStats {defOut [2,7], resCC [2,8]}`（15）· moveSlots 4。
- **reqs**：`attrs {str 50, con 45, wis 45}`、`aptitude {apFist 50}`、`prereq [{skill: sk_dajingangzhang, layer: 5}]`、`sect {id: sect_shaolin, rank: 5}`、`hard: [sect, prereq]`。
- **层数要点**：1 压山、沉掌、沉重｜4 八风不动｜5 如山｜7 须弥压顶（第一绝招）｜9 芥子纳须弥（第二绝招）｜10 大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 Buff | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 压山 | `mv_xumishanzhang_yashan` | 1 | `aoe_disk {r:1}` | 1 | 0.80 | 9% | 2 | 1000 | — | 可 | 0.60×1.34 |
| 沉掌 | `mv_xumishanzhang_chenzhang` | 1 | `aoe_single` | 1 | 1.20 | 8% | 1 | 1100 | `bf_chihuan` 50% | 可 | 1+0.12+0.05+0.07−0.05=1.19 |
| 八风不动 | `mv_xumishanzhang_bafeng` | 4 | `aoe_self` | 0 | — | 6% | 3 | 800 | `bf_wenzhong` 2 + `bf_jiangu` 2 | — | 架势 |
| 芥子纳须弥（绝） | `mv_xumishanzhang_jiezi` | 9 | `aoe_single` | 1 | 2.90 | 9% | — | 1200 | `ultimate:true`；气势 100；`bf_dingshen` 40% 1 | 可 | `3.00−0.25×0.40=2.90`；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 须弥压顶（绝） | `mv_xumishanzhang_yading` | 7 | `aoe_disk {r:1}` | 1–2 | 1.70 | 9% | — | 1200 | `ultimate:true`；`rageCost:100`；`bf_xuanyun` 40% 1 | 可 | 3.0×0.60−0.10；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

- **被动**：`ps_xumishanzhang_chenzhong` 沉重（1，Z2 5%→14%）；`ps_xumishanzhang_rushan` 如山（5，mechanic，装配时免疫 ≤ 品阶的 `cc.knock`）；`ps_xumishanzhang_dacheng` 大成（10，对定身/眩晕目标 Z3 +15%）。
- **AR-16 审计**：`mv_xumishanzhang_yading` 有 1–2 格范围但仅描述“压顶”，未明确掌力离体，暂记待考；其余伤害均按贴身沉掌处理，不标。
- **setTags**：`[set_saodiseng]`。
- **获取**：`{master, ch01_tianlong, npc_xuanci, 10, note: 玄慈许可}`；`{qiyu, ch01_tianlong, q_01_qiyu_81, 10, note: 少室山大会后藏经阁扫地僧指点（原创扩展）}`。

##### 千手如来掌 `sk_qianshourulaizhang`（地上 9 · 拳脚·掌 · 笑傲 · 原著）

- **简述**：《笑傲江湖》少林三战中，方证大师以千手如来掌对任我行，掌影繁复、守中有攻（原著）。这是笑傲书界唯一的少林地上拳掌。
- **基本**：`harmony` · 0.40/0.60 · `layerStats {combo [2,8], parry [2,7]}`（15）· moveSlots 4。
- **reqs**：`attrs {agi 45, wis 50}`、`aptitude {apFist 50}`、`morality {min 20}`、`prereq [{skill: sk_dajingangzhang, layer: 5}]`、`sect {id: sect_shaolin, rank: 5}`、`hard: [sect, prereq, morality]`。
- **层数要点**：1 千手、掌影、千变｜5 慈悲｜6 如来｜7 万佛朝宗（第一绝招）｜9 接引（第二绝招）｜10 大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 Buff | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 千手 | `mv_qianshourulaizhang_qianshou` | 1 | `aoe_multi` n6 r1 | 1 | 1.00（6 段） | 8% | 1 | 1000 | — | 可 | 0.85×1.17 |
| 掌影 | `mv_qianshourulaizhang_zhangying` | 1 | `aoe_single` | 1 | 1.05 | 7% | 0 | 900 | `bf_polu` 30% 2 | 可 | 1+0.07−0.03 |
| 接引（绝） | `mv_qianshourulaizhang_jieyin` | 9 | `aoe_pull` n2 | 1–3 | 2.30 | 9% | — | 1200 | `ultimate:true`；气势 100；拉拽 2 | 可 | `3.00×0.95×0.85−0.10=2.3225≈2.30`；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 如来 | `mv_qianshourulaizhang_rulai` | 6 | `aoe_self` | 0 | — | 6% | 3 | 800 | `bf_houfa` 2 | — | 架势 |
| 万佛朝宗（绝） | `mv_qianshourulaizhang_wanfo` | 7 | `aoe_cone {r:3,angle:60,dirCount:6}` | 1 | 2.00（9 段） | 9% | — | 1200 | `ultimate:true`；`rageCost:100`；`bf_polu` 100% 2 | 可 | N=7、AF=0.70；3.0×0.70−0.10=2.00；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

- **被动**：`ps_qianshourulaizhang_qianbian` 千变（1，trigger：连续两次使用本武学不同招式，第二招 Z3 +5%）；`ps_qianshourulaizhang_cibei` 慈悲（5，制服）；`ps_qianshourulaizhang_dacheng` 大成（10，"千手"段数 +2（总倍率不变），全招冷却 −1）。
- **setTags**：`[set_fangzheng]`。
- **获取**：`{master, ch05_xiaoao, npc_fangzheng, 10}`；`{observe, ch05_xiaoao, npc_fangzheng, maxLayer 6, reqsOverride {sect: null}, note: 少林三战观战，该战观摩 ×10（剧情事件）}`。

#### 1.6.3 指法·七十二绝技（6 门）

> 指法进阶链：金刚指（玄下）→ 摩诃指 / 多罗叶指 / 大力金刚指（地下–地中）→ 一指禅（地中）→ 拈花指 / 无相劫指（地上）。指力远程招式按 `ranged`（×0.85）计价；"点穴"一律为 06 的 `bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)`（`seal.point`，硬控组）。

##### 摩诃指 `sk_mohezhi`（地下 7 · 拳脚·指 · 天龙/侠客）

- **简述**：少林指法之大开大阖者；“摩诃指”是否见《天龙八部》及施用人物待 K-01 核定，招名与效果为原创扩展。
- **基本**：`yang` · 0.50/0.50 · `layerStats {seal [2,8], hit [1,7]}`（15）· moveSlots 4。
- **reqs**：`attrs {agi 35, wis 40}`、`aptitude {apFinger 40}`、`prereq [{skill: sk_jingangzhi, layer: 5}]`、`sect {id: sect_shaolin, rank: 4}`、`hard: [sect, prereq]`。
- **层数要点**：1 摩诃大指、点穴、指力｜4 摩诃破气、认穴｜6 连指｜7 摩诃无量（绝）｜10 大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 附带 Buff | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 摩诃大指 | `mv_mohezhi_dazhi` | 1 | `aoe_single` | 1–3 | 0.99 | 8% | 1 | — | 可 | 1.17×0.85 |
| 点穴 | `mv_mohezhi_dianxue` | 1 | `aoe_single` | 1 | 1.10 | 8% | 1 | `bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)` 30% 1 | 可 | 1.17−0.06 |
| 摩诃破气 | `mv_mohezhi_poqi` | 4 | `aoe_single` | 1–3 | 1.10 | 9% | 2 | `bf_sangong` 40% 2 | 可 | 1.34×0.85−0.04 |
| 连指 | `mv_mohezhi_lianzhi` | 6 | `aoe_single` | 1 | 1.30（3 段） | 9% | 2 | `bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)` 20% 1 | 可 | 1.34−0.04 |
| 摩诃无量（绝） | `mv_mohezhi_wuliang` | 7 | `aoe_chain` n3 | 1–3 | 1.95 | 9% | — | `ultimate:true`；`rageCost:100`；`recovery:1200`；`bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)` 50% 1 | 可 | 3.0×0.80×0.85−0.10=1.94；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

- **AR-16 外放字段**：三招全部伤害段均为 `DamageKind='projected'`；点穴、连指为接触指法，不标。
  - `mv_mohezhi_dazhi`：`MoveDef{projection:true; range:{min:1,max:3}; aoe:{tpl:aoe_single}; projectionSpreadSteps:[{tpl:aoe_single},{tpl:aoe_single},{tpl:aoe_single}]; meridianRouteRef:mfr_mohezhi_dazhi}`。
  - `mv_mohezhi_poqi`：`MoveDef{projection:true; range:{min:1,max:3}; aoe:{tpl:aoe_single}; projectionSpreadSteps:[{tpl:aoe_single},{tpl:aoe_single},{tpl:aoe_single}]; meridianRouteRef:mfr_mohezhi_poqi}`。
  - `mv_mohezhi_wuliang`：`MoveDef{projection:true; range:{min:1,max:3}; aoe:{tpl:aoe_chain,n:3}; projectionSpreadSteps:[{tpl:aoe_chain,n:3},{tpl:aoe_chain,n:4},{tpl:aoe_chain,n:5}]; meridianRouteRef:mfr_mohezhi_wuliang}`。

- **被动**：`ps_mohezhi_zhili` 指力（1，Z0 破招 +3→+9）；`ps_mohezhi_renxue` 认穴（4，trigger `battleStart`，`bf_renxue` 3）；`ps_mohezhi_dacheng` 大成（10，本武学点穴持续 +1）。
- **获取**：`{master, ch01_tianlong, 少林·达摩院授艺岗位槽, 10}`；`{master, ch06_xiake, 少林·达摩院授艺岗位槽, 10}`。

##### 多罗叶指 `sk_duoluoyezhi`（地下 7 · 拳脚·指 · 天龙 · 原著）

- **简述**：天龙所列少林绝技（鸠摩智曾冒用，原著）。"多罗"即贝多罗叶（写经之叶），指力如落叶纷飞，擅长群点（效果原创扩展）。
- **基本**：`harmony` · 0.40/0.60 · `layerStats {hit [2,8], seal [1,7]}`（15）· moveSlots 4。
- **reqs**：`attrs {agi 40, wis 40}`、`aptitude {apFinger 40}`、`prereq [{skill: sk_jingangzhi, layer: 5}]`、`sect {id: sect_shaolin, rank: 4}`、`hard: [sect, prereq]`。
- **层数要点**：1 叶落、贝叶、叶脉｜4 经叶、精准｜6 乱叶｜7 漫天贝叶（绝）｜10 大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 附带 Buff | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 叶落 | `mv_duoluoyezhi_yeluo` | 1 | `aoe_multi` n3 r1 | 1–3 | 1.00（3 段） | 8% | 1 | — | 可 | 0.85×1.17（乱击已含远程） |
| 贝叶 | `mv_duoluoyezhi_beiye` | 1 | `aoe_single` | 1–3 | 0.82 | 7% | 0 | `bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)` 15% 1 | 可 | 0.85−0.03 |
| 经叶 | `mv_duoluoyezhi_jingye` | 4 | `aoe_spokes {r:1}` | 1–3 | 0.75 | 8% | 2 | `bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)` 15% 1 | 可 | N=7、AF=0.70；0.70×1.29×0.85−0.03=0.74≈0.75 |
| 乱叶 | `mv_duoluoyezhi_luanye` | 6 | `aoe_chain` n3 | 1–3 | 0.90 | 9% | 2 | — | 可 | 0.80×1.34×0.85 |
| 漫天贝叶（绝） | `mv_duoluoyezhi_mantian` | 7 | `aoe_disk` r2 | 1–3 | 1.20 | 9% | — | `ultimate:true`；`rageCost:100`；`recovery:1200`；`bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)` 30% 1 | 可 | 3.0×0.50×0.85−0.06；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

- **AR-16 外放字段**：五招均为离体指力，全部伤害段 `DamageKind='projected'`，并各引用同名 `mfr_*`。`mv_duoluoyezhi_yeluo`：`MoveDef{projection:true; range:{min:1,max:3}; aoe:{tpl:aoe_multi,n:3,r:1}; projectionSpreadSteps:[{tpl:aoe_multi,n:3,r:1},{tpl:aoe_multi,n:4,r:2},{tpl:aoe_multi,n:5,r:3}]; meridianRouteRef:mfr_duoluoyezhi_yeluo}`；`mv_duoluoyezhi_beiye`：`MoveDef{projection:true; range:{min:1,max:3}; aoe:{tpl:aoe_single}; projectionSpreadSteps:[{tpl:aoe_single},{tpl:aoe_single},{tpl:aoe_single}]; meridianRouteRef:mfr_duoluoyezhi_beiye}`。
- `mv_duoluoyezhi_jingye`：`MoveDef{projection:true; range:{min:1,max:3}; aoe:{tpl:aoe_spokes,r:1}; projectionSpreadSteps:[{tpl:aoe_spokes,r:1},{tpl:aoe_spokes,r:2},{tpl:aoe_spokes,r:3}]; meridianRouteRef:mfr_duoluoyezhi_jingye}`；`mv_duoluoyezhi_luanye`：`MoveDef{projection:true; range:{min:1,max:3}; aoe:{tpl:aoe_chain,n:3}; projectionSpreadSteps:[{tpl:aoe_chain,n:3},{tpl:aoe_chain,n:4},{tpl:aoe_chain,n:5}]; meridianRouteRef:mfr_duoluoyezhi_luanye}`；`mv_duoluoyezhi_mantian`：`MoveDef{projection:true; range:{min:1,max:3}; aoe:{tpl:aoe_disk,r:2}; projectionSpreadSteps:[{tpl:aoe_disk,r:2},{tpl:aoe_disk,r:3},{tpl:aoe_disk,r:4}]; meridianRouteRef:mfr_duoluoyezhi_mantian}`。

- **被动**：`ps_duoluoyezhi_yemai` 叶脉（1，同一目标被本武学多段/多招命中时，第二段起点穴率 +10%）；`ps_duoluoyezhi_jingzhun` 精准（4，trigger `battleStart`，`bf_jingzhun` 3）；`ps_duoluoyezhi_dacheng` 大成（10，本武学射程 +1）。
- **setTags**：`[set_mizong_mingwang]`（鸠摩智跨组人物套装，C22）。
- **获取**：`{master, ch01_tianlong, 少林·达摩院授艺岗位槽, 10}`；`{observe, ch01_tianlong, npc_jiumozhi, 6, reqsOverride {sect: null, prereq: []}}`。

##### 大力金刚指 `sk_dalijingangzhi`（地中 8 · 拳脚·指 · 天龙/倚天 · 原著）

- **简述**：《倚天屠龙记》中西域金刚门阿三以大力金刚指重创俞岱岩四肢，张三丰等由伤势认出少林金刚指力一路；金刚门源自火工头陀一脉（原著）。具体师承层级统一留在 K-09 核对。06 `bf_gushang`（骨伤）即以此为典。
- **基本**：`yang` · 0.65/0.35 · `layerStats {seal [2,8], crit [1,7]}`（15）· moveSlots 4。
- **reqs**：`attrs {str 45, agi 35, wis 40}`、`aptitude {apFinger 45}`、`prereq [{skill: sk_jingangzhi, layer: 5}]`、`sect {id: sect_shaolin, rank: 4}`、`hard: [sect, prereq]`。
- **层数要点**：1 捏骨、扎穴、刚指｜4 错骨｜5 伤筋｜6 金指穿石｜7 金刚碎骨（第一绝招）｜10 大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 附带 Buff | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 捏骨 | `mv_dalijingangzhi_niegu` | 1 | `aoe_single` | 1 | 1.14 | 8% | 1 | `bf_gushang` 30% | 可 | 1.17−0.03 |
| 扎穴 | `mv_dalijingangzhi_zhaxue` | 1 | `aoe_single` | 1 | 0.95 | 7% | 0 | `bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)` 20% 1 | 可 | 1−0.04 |
| 错骨 | `mv_dalijingangzhi_cuogu` | 4 | `aoe_single` | 1 | 1.20 | 9% | 2 | `ultimate:false`；`recovery:1000`；`bf_gushang` 60%；`bf_jiaoxie` 25%（目标持械） | 可 | 普通招：`1.34−0.10×0.60−0.25×0.25=1.2175≈1.20`；`MoveDef{unlock:4; ultimate:false; mpCost:9%; cd:2; recovery:1000}` |
| 金指穿石 | `mv_dalijingangzhi_chuanshi` | 6 | `aoe_pierce` | 1–2 | 1.00 | 9% | 2 | — | 可 | 0.90×1.34×0.85=1.03（−0.03） |
| 金刚碎骨（绝） | `mv_dalijingangzhi_suigu` | 7 | `aoe_single` | 1 | 2.80 | 9% | — | `ultimate:true`；`rageCost:100`；`recovery:1200`；`bf_gushang` 100%；`bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)` 50% 1 | 可 | 3.0−0.10−0.10；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

- **AR-16 审计**：本门其余招式均为接触擒拿 / 点穴，不标；`mv_dalijingangzhi_chuanshi` 虽有 1–2 格贯穿表现，但正文未说明伤害由离体指力造成，按 M5b §7.3 暂记**待考**，不写 `projection:true`。

- **被动**：`ps_dalijingangzhi_gangzhi` 刚指（1，Z2 4%→12%）；`ps_dalijingangzhi_shangjin` 伤筋（5，trigger `onHit` 15%，`bf_gushang`）；`ps_dalijingangzhi_dacheng` 大成（10，对带 `bf_gushang` 的目标 Z3 +12%）。
- **特殊**：倚天剧情钩子（原创扩展）——在武当派 NPC 面前施展会触发"俞三侠旧伤"对白，武当好感 −10（design/12）。
- **获取**：`{master, ch01_tianlong, 少林·达摩院授艺岗位槽, 10}`；`{master, ch04_yitian, 少林·达摩院授艺岗位槽, 10}`；`{observe, ch04_yitian, npc_asan, 6, reqsOverride {sect: null, prereq: []}, note: 与金刚门阿三交手}`。

##### 一指禅 `sk_yizhichan`（地中 8 · 拳脚·指 · 天龙/笑傲/侠客/书剑）

- **简述**：以一指贯注周身功力，少林指法的根本功夫；是否见于相关金庸小说及施用人物待 K-01 核定。南少林亦传是本作原创扩展。
- **基本**：`harmony` · 0.30/0.70 · `layerStats {seal [3,10], pierce [1,5]}`（15）· moveSlots 4。
- **reqs**：`attrs {wis 45, wil 40}`、`aptitude {apFinger 45}`、`prereq [{skill: sk_jingangzhi, layer: 7}]`、`sect {id: sect_shaolin, rank: 4}`、`hard: [sect, prereq]`。
- **层数要点**：1 一指、禅定、贯注｜4 灌顶｜5 解穴｜6 指力外放｜7 一指定乾坤（第一绝招）｜10 大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 附带 / 效果 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 一指 | `mv_yizhichan_yizhi` | 1 | `aoe_single` | 1–3 | 0.95 | 8% | 1 | `bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)` 20% 1 | 可 | 1.17×0.85−0.04 |
| 禅定 | `mv_yizhichan_chanding` | 1 | `aoe_self` | 0 | — | 5% | 2 | `bf_jingzhun` 3（自身） | — | 架势（收招 800） |
| 灌顶 | `mv_yizhichan_guanding` | 4 | `aoe_single` | 1 | 1.25 | 9% | 2 | `ultimate:false`；`recovery:1000`；`bf_xueweishoufeng(level:8,acupointRef:sourcePrimary)` 50% 2 | 可 | 普通招：`1.34−0.20×0.50=1.24≈1.25`；`MoveDef{unlock:4; ultimate:false; mpCost:9%; cd:2; recovery:1000}` |
| 解穴 | `mv_yizhichan_jiexue` | 5 | `aoe_single`（友） | 0–1 | — | 6% | 2 | 驱散目标全部 `seal`（06 §7.1"解穴"） | — | 支援 |
| 一指定乾坤（绝） | `mv_yizhichan_qiankun` | 7 | `aoe_single` | 1–3 | 2.35 | 9% | — | `ultimate:true`；`rageCost:100`；`recovery:1200`；`bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)` 100% 2 | 可 | 3.0×0.85−0.20；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

- **AR-16 外放字段**：正文已明示六重“指力外放”，两招全部伤害段 `DamageKind='projected'`；灌顶须接触、解穴为支援，均不标。
  - `mv_yizhichan_yizhi`：`MoveDef{projection:true; range:{min:1,max:3}; aoe:{tpl:aoe_single}; projectionSpreadSteps:[{tpl:aoe_single},{tpl:aoe_single},{tpl:aoe_single}]; meridianRouteRef:mfr_yizhichan_yizhi}`。
  - `mv_yizhichan_qiankun`：`MoveDef{projection:true; range:{min:1,max:3}; aoe:{tpl:aoe_single}; projectionSpreadSteps:[{tpl:aoe_single},{tpl:aoe_single},{tpl:aoe_single}]; meridianRouteRef:mfr_yizhichan_qiankun}`。

- **被动**：`ps_yizhichan_guanzhu` 贯注（1，单体招式 Z3 +3%→+9%）；`ps_yizhichan_waifang` 指力外放（6，本武学远程招式射程 +1）；`ps_yizhichan_dacheng` 大成（10，"一指"冷却 0）。
- **setTags**：`[set_fangzheng]`。
- **获取**：`{master, ch01_tianlong, 少林·达摩院授艺岗位槽, 10}`；`{master, ch05_xiaoao, npc_fangsheng, 10}`；`{manual, ch06_xiake, it_miji_yizhichan, 8}`；`{master, ch12_shujian, npc_tianhong, 10, reqsOverride {sect: {id: sect_nanshaolin, rank: 4}}}`。

##### 拈花指 `sk_nianhuazhi`（地上 9 · 拳脚·指 · 天龙/鹿鼎 · 原著）

- **简述**：取“世尊拈花、迦叶微笑”之意，指力阴柔无形；《天龙八部》中拈花指是少林绝技之一。扫地僧相关论述的逐字表述，以及《鹿鼎记》澄观是否明确通晓此技，留待 K-05 核定。
- **基本**：`harmony` · 0.30/0.70 · `layerStats {seal [3,10], crit [1,5]}`（15）· moveSlots 4。
- **reqs**：`attrs {wis 50, agi 45}`、`aptitude {apFinger 50}`、`prereq [{skill: sk_yizhichan, layer: 5}]`、`sect {id: sect_shaolin, rank: 5}`、`hard: [sect, prereq]`。
- **层数要点**：1 拈花、微笑、无相｜4 阴柔｜6 散花｜7 迦叶一笑（第一绝招）、禅机｜9 无形（第二绝招）｜10 大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 附带 Buff | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 拈花 | `mv_nianhuazhi_nianhua` | 1 | `aoe_single` | 1–3 | 0.95 | 8% | 1 | `bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)` 25% 1 | 可 | 1.17×0.85−0.05 |
| 微笑 | `mv_nianhuazhi_weixiao` | 1 | `aoe_self` | 0 | — | 5% | 2 | `bf_yuanzhuan` 2（自身） | — | 架势（收招 800） |
| 无形（绝） | `mv_nianhuazhi_wuxing` | 9 | `aoe_single` | 1–3 | 2.15 | 9% | — | `ultimate:true`；气势 100；`recovery:1200` | **否** | `3.00×0.85×0.85=2.1675≈2.15`；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 散花 | `mv_nianhuazhi_sanhua` | 6 | `aoe_spokes` r1 | 1–3 | 0.70 | 9% | 2 | `bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)` 20% 1 | 可 | 0.65×1.34×0.85−0.04 |
| 迦叶一笑（绝） | `mv_nianhuazhi_jiaye` | 7 | `aoe_single` | 1–3 | 1.95 | 9% | — | `ultimate:true`；`rageCost:100`；`recovery:1200`；`bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)` 100% 1 | **否** | 3.0×0.85×0.85−0.20=1.97；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

- **AR-16 外放字段**：本门四个伤害招均承接“阴柔无形”的离体指力，全部伤害段 `DamageKind='projected'`；微笑是纯架势，不标。
  - `mv_nianhuazhi_nianhua`：`MoveDef{projection:true; range:{min:1,max:3}; aoe:{tpl:aoe_single}; projectionSpreadSteps:[{tpl:aoe_single},{tpl:aoe_single},{tpl:aoe_single}]; meridianRouteRef:mfr_nianhuazhi_nianhua}`。
  - `mv_nianhuazhi_wuxing`：`MoveDef{projection:true; range:{min:1,max:3}; aoe:{tpl:aoe_single}; projectionSpreadSteps:[{tpl:aoe_single},{tpl:aoe_single},{tpl:aoe_single}]; meridianRouteRef:mfr_nianhuazhi_wuxing}`。
  - `mv_nianhuazhi_sanhua`：`MoveDef{projection:true; range:{min:1,max:3}; aoe:{tpl:aoe_spokes,r:1}; projectionSpreadSteps:[{tpl:aoe_spokes,r:1},{tpl:aoe_spokes,r:2},{tpl:aoe_spokes,r:3}]; meridianRouteRef:mfr_nianhuazhi_sanhua}`。
  - `mv_nianhuazhi_jiaye`：`MoveDef{projection:true; range:{min:1,max:3}; aoe:{tpl:aoe_single}; projectionSpreadSteps:[{tpl:aoe_single},{tpl:aoe_single},{tpl:aoe_single}]; meridianRouteRef:mfr_nianhuazhi_jiaye}`。

- **被动**：`ps_nianhuazhi_wuxiang` 无相（1，stat，效果命中 +3→+10）；`ps_nianhuazhi_yinrou` 阴柔（4，Z2 无视内劲防御 4%→10%）；`ps_nianhuazhi_chanji` 禅机（7，trigger `onCrit`，`bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)` 1，每回合 1 次）；`ps_nianhuazhi_dacheng` 大成（10，"拈花"冷却 0）。
- **setTags**：`[set_saodiseng]`。
- **获取**：`{master, ch01_tianlong, npc_xuanci, 10}`；`{master, ch08_luding, npc_chengguan, 10, reqsOverride {sect: {id: sect_shaolin, rank: 4}, prereq: [{skill: sk_jingangzhi, layer: 7}]}, note: 澄观"纸上谈兵"式传授，须先与之喂招 1 场（原创扩展）}`。

##### 无相劫指 `sk_wuxiangjiezhi`（地上 9 · 拳脚·指 · 天龙 · 原著）

- **简述**：指力无形无相、发时不见其势。《天龙八部》中鸠摩智以小无相功为根基，施展包括无相劫指在内的少林绝技（原著）。
- **基本**：`harmony` · 0.25/0.75 · `layerStats {pierce [3,10], crit [1,5]}`（15）· moveSlots 4。
- **reqs**：`attrs {wis 50, wil 45}`、`aptitude {apFinger 50}`、`prereq [{skill: sk_mohezhi, layer: 5}]`、`sect {id: sect_shaolin, rank: 5}`、`hard: [sect, prereq]`。
- **层数要点**：1 无相、劫火、无迹｜4 空劫｜5 劫｜7 劫尽（第一绝招）｜9 无相劫（第二绝招）｜10 大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 附带 Buff | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 无相 | `mv_wuxiangjiezhi_wuxiang` | 1 | `aoe_single` | 1–4 | 0.85 | 8% | 1 | — | **否** | 1.17×0.85×0.85 |
| 劫火 | `mv_wuxiangjiezhi_jiehuo` | 1 | `aoe_single` | 1–3 | 1.10 | 9% | 2 | `bf_neishang` 30% 1 层 | 可 | 1.34×0.85−0.03 |
| 空劫 | `mv_wuxiangjiezhi_kongjie` | 4 | `aoe_line` n4 | 1–4 | 0.85 | 9% | 2 | — | 可 | 0.75×1.34×0.85 |
| 无相劫（绝） | `mv_wuxiangjiezhi_wuxiangjie` | 9 | `aoe_single` | 1–3 | 2.05 | 9% | — | `ultimate:true`；气势 100；`recovery:1200`；`bf_sangong` 100% 2 | **否** | `3.00×0.85×0.85−0.10=2.0675≈2.05`；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 劫尽（绝） | `mv_wuxiangjiezhi_jiejin` | 7 | `aoe_disk {r:1}` | 1–3 | 1.20 | 9% | — | `ultimate:true`；`rageCost:100`；`recovery:1200`；`bf_sangong` 100% 2 | **否** | 3.0×0.60×0.7225−0.10；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

- **AR-16 外放字段**：本门五招均是正文明确的无形离体指力，全部伤害段 `DamageKind='projected'`。
  - `mv_wuxiangjiezhi_wuxiang`：`MoveDef{projection:true; range:{min:1,max:4}; aoe:{tpl:aoe_single}; projectionSpreadSteps:[{tpl:aoe_single},{tpl:aoe_single},{tpl:aoe_single}]; meridianRouteRef:mfr_wuxiangjiezhi_wuxiang}`。
  - `mv_wuxiangjiezhi_jiehuo`：`MoveDef{projection:true; range:{min:1,max:3}; aoe:{tpl:aoe_single}; projectionSpreadSteps:[{tpl:aoe_single},{tpl:aoe_single},{tpl:aoe_single}]; meridianRouteRef:mfr_wuxiangjiezhi_jiehuo}`。
  - `mv_wuxiangjiezhi_kongjie`：`MoveDef{projection:true; range:{min:1,max:4}; aoe:{tpl:aoe_line,n:4}; projectionSpreadSteps:[{tpl:aoe_line,n:4},{tpl:aoe_line,n:5},{tpl:aoe_line,n:6}]; meridianRouteRef:mfr_wuxiangjiezhi_kongjie}`。
  - `mv_wuxiangjiezhi_wuxiangjie`：`MoveDef{projection:true; range:{min:1,max:3}; aoe:{tpl:aoe_single}; projectionSpreadSteps:[{tpl:aoe_single},{tpl:aoe_single},{tpl:aoe_single}]; meridianRouteRef:mfr_wuxiangjiezhi_wuxiangjie}`。
  - `mv_wuxiangjiezhi_jiejin`：`MoveDef{projection:true; range:{min:1,max:3}; aoe:{tpl:aoe_disk,r:1}; projectionSpreadSteps:[{tpl:aoe_disk,r:1},{tpl:aoe_disk,r:2},{tpl:aoe_disk,r:3}]; meridianRouteRef:mfr_wuxiangjiezhi_jiejin}`。

- **被动**：`ps_wuxiangjiezhi_wuji` 无迹（1，mechanic，本武学招式不显示范围预警，05 §11.1"见识"亦不生效）；`ps_wuxiangjiezhi_jie` 劫（5，Z2 无视内劲防御 5%→12%）；`ps_wuxiangjiezhi_dacheng` 大成（10，每战首次出手获得 `bf_bizhong` ×1）。
- **特殊·小无相功催动**（原著鸠摩智）：主运 `sk_xiaowuxiang` 时，本武学不计入"戾气"计数，且观摩习得上限由 6 重提高到 8 重。
- **setTags**：`[set_mizong_mingwang]`（鸠摩智跨组人物套装，C22）。
- **获取**：`{master, ch01_tianlong, npc_xuanci, 10}`；`{observe, ch01_tianlong, npc_jiumozhi, 6（主运小无相功时 8）, reqsOverride {sect: null, prereq: []}}`。

#### 1.6.4 腿法·擒拿（2 门）

##### 如影随形腿 `sk_ruyingsuixingtui`（地下 7 · 拳脚·腿 · 天龙/笑傲/侠客）

- **简述**：腿影如随形之影，敌退我进、紧缠不舍；该名目是否见于相关金庸小说及施用人物待 K-01 核定，效果为原创扩展。腿法持械不降效（05 §6.3），是棍僧、刀僧的副手拳脚首选。
- **基本**：`yang` · 0.70/0.30 · `layerStats {eva [2,8], counter [1,7]}`（15）· moveSlots 4。
- **reqs**：`attrs {agi 45, str 35, wis 40}`、`aptitude {apLeg 40}`、`prereq [{skill: sk_tiesaozhou, layer: 5}]`、`sect {id: sect_shaolin, rank: 4}`、`hard: [sect, prereq]`。
- **层数要点**：1 如影、随形、追影｜4 连环踢、追击｜6 绕影｜7 影踪无定（绝）｜10 大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 附带 Buff | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 如影 | `mv_ruyingsuixingtui_ruying` | 1 | `aoe_dash` n3 | 1–3 | 1.05 | 8% | 1 | — | 可 | 1.17−0.10=1.07 |
| 随形 | `mv_ruyingsuixingtui_suixing` | 1 | `aoe_self` | 0 | — | 5% | 2 | `bf_jieji` 2（自身） | — | 架势（收招 800） |
| 连环踢 | `mv_ruyingsuixingtui_lianhuan` | 4 | `aoe_single` | 1 | 1.30（3 段） | 9% | 2 | `bf_panshan` 30% 2 | 可 | 1.34−0.03 |
| 绕影 | `mv_ruyingsuixingtui_raoying` | 6 | `aoe_behind` r2 | 1–2 | 1.00 | 8% | 2 | — | 可 | 0.90×1.29−0.15 |
| 影踪无定（绝） | `mv_ruyingsuixingtui_yingzong` | 7 | `aoe_single` | 1 | 2.85（5 段） | 9% | — | `ultimate:true`；`rageCost:100`；`recovery:1200`；`bf_panshan` 100% 2；`bf_xuanyun` 20% 1 | 可 | 3.0−0.10−0.05；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

- **被动**：`ps_ruyingsuixingtui_zhuiying` 追影（1，mechanic，被本武学命中的目标离开相邻格时自身立即跟进 1 格，每回合 1 次）；`ps_ruyingsuixingtui_zhuiji` 追击（4，trigger `battleStart`，`bf_zhuiji` 3）；`ps_ruyingsuixingtui_dacheng` 大成（10，出招后可用完剩余移动力）。
- **获取**：`{master, ch01_tianlong, 少林·罗汉堂授艺岗位槽, 10}`；`{master, ch05_xiaoao, 少林·罗汉堂授艺岗位槽, 10, reqsOverride {prereq: [{skill: sk_tantui, layer: 7}]}}`；`{manual, ch06_xiake, it_miji_ruyingsuixingtui, 8, reqsOverride {prereq: [{skill: sk_tantui, layer: 7}]}}`（笑傲/侠客无铁扫帚传承，改以少林弹腿为前置）。

##### 龙爪手 `sk_longzhaoshou`（地中 8 · 拳脚·擒拿 · 天龙/倚天/笑傲；别名"金刚龙爪手"）——摘要卡，定义以 05 §13.7 为准

- **简述**：少林七十二绝技；倚天光明顶空性以龙爪手对张无忌，张无忌观而学之、以同一路龙爪手胜之（原著）。**即用户示例"少林金刚套装"中的"金刚龙爪手"——同一武学，`alias` 已收"金刚龙爪手"，不另立 ID。**
- **基本**：`yang` · 0.70/0.30 · `layerStats {seal [3,10], crit [1,5]}` · reqs：`attrs {str 45}`、`aptitude {apGrapple 45}`、`prereq [{skill: sk_shaolinqinna, layer: 5}]`（本文 §1.7 定义）、`sect {id: sect_shaolin, rank: 4}`。
- **招式**（原著定数 8 式，超出地阶 4–7 招规范，按原著例外）：捕风式（1，0.95，点穴 20%）、捉影式（2，拉拽 1，0.95）、抚琴式（3，1.10×2 段，缴械 25%）、鼓瑟式（4，横扫 0.85，点穴 15%）、批亢式（5，1.20，暴击 +15）、**龙爪三十六路**（7，第一绝招 2.70×6 段，点穴 100% 2 + 缴械 50%，`ultimate:true/rageCost:100/recovery:1200`）、抱残式（8，架势反击并定身）、**捣虚式**（9，第二绝招 2.75，驱散架势、无视 20% 外防，`ultimate:true/rageCost:100/recovery:1200`）、守缺式（9，架势，引用 `bf_shouque`）。第二绝招核算：`3.00−0.10（驱散）−0.15（无视外防）=2.75`；完整定义须同步 `design/05` §13.7（见 §8.3）。
- **被动**：拿穴（1）、分筋错骨（5）、金刚指力（8）、龙爪大成（10，对被封穴目标不可招架）。
- **本文登记**：① 守缺式所用 `bf_shouque` 已由 06 §8.11 收录（数值以 05 为准）；② 擒拿进阶链：少林擒拿手（黄上）→ 鹰爪功（玄中，可选）→ 龙爪手（地中）；③ `setTags [set_shaolin_jingang]`（05 原定），本文不增补。

#### 1.6.5 兵器（4 门）

##### 伏魔杖法 `sk_fumozhangfa`（地中 8 · 兵器·棍杖 · 天龙/鹿鼎）

- **简述**：禅杖、齐眉棍皆可施展的少林镇寺杖法；该名目是否见于《天龙八部》《鹿鼎记》及施用人物待 K-01 核定，招名与效果为原创扩展。**棍杖进阶链**：少林棍法（黄中）→ 阴手棍（玄下）/ 夜叉棍法（玄中）→ 伏魔杖法（地中）。
- **基本**：`yang` · 0.60/0.40 · `weaponReq {category: staff}` · `layerStats {parry [3,10], defOut [1,5]}`（15）· moveSlots 4。
- **reqs**：`attrs {str 45, con 40, wis 40}`、`aptitude {apStaff 45}`、`prereq [{skill: sk_yachagun, layer: 5}]`、`sect {id: sect_shaolin, rank: 4}`、`hard: [sect, prereq]`。
- **层数要点**：1 伏魔、横扫群魔、拒敌｜4 镇杖、拆招｜6 举鼎｜7 降魔禅杖（第一绝招）｜10 大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 Buff | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 伏魔 | `mv_fumozhangfa_fumo` | 1 | `aoe_single` | 1–2 | 1.25 | 8% | 1 | 1100 | — | 可 | 1+0.12+0.05+0.07=1.24 |
| 横扫群魔 | `mv_fumozhangfa_hengsao` | 1 | `aoe_cone {angle:120,r:1,dirCount:6}` | 1 | 0.95 | 8% | 1 | 1000 | 击退 1 | 可 | N=3、AF=0.85；0.85×1.17−0.05=0.94，取 0.95 |
| 镇杖 | `mv_fumozhangfa_zhenzhang` | 4 | `aoe_around` | 0 | 0.98 | 9% | 2 | 1000 | `bf_chihuan` 30% | 可 | N=6、AF=0.75；0.75×1.34−0.03=0.975≈0.98 |
| 举鼎 | `mv_fumozhangfa_juding` | 6 | `aoe_leap {splash:{tpl:aoe_disk,r:1}}` | 1–3 | 1.10 | 9% | 2 | 1000 | `ultimate:false` | 可 | 普通招：主目标 `0.90×1.34−0.10=1.106≈1.10`，溅射仍按模板另乘 0.5；`MoveDef{unlock:6; ultimate:false; mpCost:9%; cd:2; recovery:1000}` |
| 降魔禅杖（绝） | `mv_fumozhangfa_xiangmo` | 7 | `aoe_cone {r:3,angle:60,dirCount:6}` | 1–2 | 2.00（3 段） | 9% | — | 1200 | `ultimate:true`；`rageCost:100`；`bf_xuanyun` 30% 1 | 可 | N=7、AF=0.70；3.0×0.70−0.075=2.025≈2.00；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

- **被动**：`ps_fumozhangfa_judi` 拒敌（1，trigger `enemyEnterAdjacent` 20%→40%，以"伏魔"×0.5 截击，每回合 1 次）；`ps_fumozhangfa_chaizhao` 拆招（4，装配时常驻 `bf_pogun`，单项来源 ×0.6；06 §8.6"少林棍僧拆招心得"）；`ps_fumozhangfa_dacheng` 大成（10，"伏魔"冷却 0）。
- **setTags**：`[]`。
- **获取**：`{master, ch01_tianlong, 少林·罗汉堂授艺岗位槽, 10}`；`{master, ch08_luding, 少林·十八罗汉授艺岗位槽, 10}`。倚天不列可学来源（C14）。

##### 燃木刀法 `sk_ranmudaofa`（地上 9 · 兵器·刀 · 天龙 · 原著）

- **简述**：《天龙八部》中鸠摩智以小无相功为根基冒用燃木刀法，展示刀锋未及木材而木先焦燃的功力（原著；不作逐字引文）。本作把它机制化为刀带灼热内劲。**刀法进阶链**：戒刀法（黄上）→ 慈悲刀（玄上）→ 燃木刀法（地上）。
- **基本**：`yang` · 0.40/0.60 · `weaponReq {category: blade}` · `layerStats {crit [2,8], hit [1,7]}`（15）· moveSlots 4；招式 `tags [fire]`。
- **reqs**：`attrs {str 45, wis 50}`、`aptitude {apBlade 50}`、`prereq [{skill: sk_cibeidao, layer: 5}]`、`sect {id: sect_shaolin, rank: 5}`、`hard: [sect, prereq]`。
- **层数要点**：1 燃木、离焰、炽热｜4 焚香、刀劲｜7 业火燃木（第一绝招）｜9 刀气燎原（第二绝招）｜10 大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 附带 Buff | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 燃木 | `mv_ranmudaofa_ranmu` | 1 | `aoe_single` | 1 | 1.15 | 8% | 1 | `bf_zhuoshao` 30% 2 | 可 | 1.17−0.03 |
| 离焰 | `mv_ranmudaofa_liyan` | 1 | `aoe_cone {angle:120,r:1,dirCount:6}` | 1 | 0.98 | 8% | 1 | `bf_zhuoshao` 20% 2 | 可 | N=3、AF=0.85；0.85×1.17−0.02=0.97，取 0.98 |
| 焚香 | `mv_ranmudaofa_fenxiang` | 4 | `aoe_line` n3 | 1–3 | 0.88 | 9% | 2 | `bf_zhuoshao` 30% 2 | 可 | 0.80×1.34×0.85−0.03 |
| 刀气燎原（绝） | `mv_ranmudaofa_liaoyuan` | 9 | `aoe_cone {r:3,angle:60,dirCount:6}` | 1 | 2.00 | 9% | — | `ultimate:true`；气势 100；`recovery:1200`；`bf_zhuoshao` 100% 2；`terrainFx` 点燃草地（08） | 可 | `3.00×0.70−0.10=2.00`；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 业火燃木（绝） | `mv_ranmudaofa_yehuo` | 7 | `aoe_single` | 1 | 2.90 | 9% | — | `ultimate:true`；`rageCost:100`；`recovery:1200`；`bf_zhuoshao` 100% 2 | 可 | 3.0−0.10；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

- **AR-16 外放字段**：`mv_ranmudaofa_liaoyuan` → `MoveDef{projection:true; range:{min:1,max:1}; aoe:{tpl:aoe_cone,r:3,angle:60,dirCount:6}; projectionSpreadSteps:[{tpl:aoe_cone,r:3,angle:60,dirCount:6},{tpl:aoe_cone,r:4,angle:60,dirCount:6},{tpl:aoe_cone,r:5,angle:60,dirCount:6}]; meridianRouteRef:mfr_ranmudaofa_liaoyuan}`；全部伤害段 `DamageKind='projected'`。`mv_ranmudaofa_fenxiang` 虽为远线，但正文未明确离体刀气，暂列待考；其余均为兵刃接触挥击。

- **被动**：`ps_ranmudaofa_chire` 炽热（1，对带 `bf_zhuoshao` 的目标 Z3 +4%→+10%）；`ps_ranmudaofa_daojin` 刀劲（4，Z2 4%→10%）；`ps_ranmudaofa_dacheng` 大成（10，本武学灼烧持续 +1）。
- **setTags**：`[set_mizong_mingwang]`（鸠摩智跨组人物套装，C22）。
- **conflicts**：`{with: sk_huoyandao, type: synergy, note: 以火焰刀内劲催动（天龙鸠摩智）——同装配时本武学 Z3 +5%}`。
- **获取**：`{master, ch01_tianlong, npc_xuanci, 10}`；`{observe, ch01_tianlong, npc_jiumozhi, 6, reqsOverride {sect: null, prereq: []}}`。

##### 达摩剑法 `sk_damojianfa`（地下 7 · 兵器·剑 · 笑傲）

- **简述**：达摩院所传剑法，剑意取“面壁”“一苇”“只履西归”诸典；“达摩剑法”是否见于《笑傲江湖》及施用人物待 K-01 核定，招名与效果为原创扩展。少林非剑派，此为寺中唯一地阶剑法。**剑法进阶链**：罗汉剑法（黄上）→ 伏魔剑法（玄中）→ 达摩剑法（地下）。
- **基本**：`harmony` · 0.55/0.45 · `weaponReq {category: sword}` · `layerStats {parry [3,9], hit [1,6]}`（15）· moveSlots 4。
- **reqs**：`attrs {agi 40, wis 40}`、`aptitude {apSword 40}`、`prereq [{skill: sk_fumojian, layer: 5}]`、`sect {id: sect_shaolin, rank: 4}`、`hard: [sect, prereq]`。
- **层数要点**：1 面壁、直指人心、禅剑｜4 一苇、静中生慧｜6 只履西归｜7 见性成佛（绝）｜10 大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 附带 / 位移 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 面壁 | `mv_damojianfa_mianbi` | 1 | `aoe_self` | 0 | — | 5% | 2 | `bf_jingshi`（自身，静势） | — | 架势（收招 800） |
| 直指人心 | `mv_damojianfa_zhizhi` | 1 | `aoe_single` | 1 | 1.15 | 8% | 1 | `bf_polu` 20% 2 | 可 | 1.17−0.02 |
| 一苇 | `mv_damojianfa_yiwei` | 4 | `aoe_dash` n4 | 1–4 | 1.20 | 8% | 2 | 突进 | 可 | 1.29−0.10=1.19 |
| 只履西归 | `mv_damojianfa_zhilv` | 6 | `aoe_single` | 1 | 1.20 | 8% | 2 | 出招后后撤 2 | 可 | 1.29−0.10=1.19 |
| 见性成佛（绝） | `mv_damojianfa_jianxing` | 7 | `aoe_line` n4 | 1–4 | 2.15 | 9% | — | `ultimate:true`；`rageCost:100`；`recovery:1200`；`bf_polu` 100% 2 | 可 | 3.0×0.75−0.10；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

- **被动**：`ps_damojianfa_chanjian` 禅剑（1，trigger `onParry`，`bf_xieli` 1）；`ps_damojianfa_jingzhong` 静中生慧（4，静势 ≥ 2 层时本武学 Z3 +8%）；`ps_damojianfa_dacheng` 大成（10，"面壁"冷却 0）。
- **setTags**：`[set_shaolin_damo]`。
- **获取**：`{master, ch05_xiaoao, 少林·达摩院授艺岗位槽, 10}`。倚天不列可学来源（C14）。

##### 袈裟伏魔功 `sk_jiashafumogong`（地中 8 · 兵器·奇门（袈裟） · 天龙 · 原著）

- **简述**：《天龙八部》中袈裟伏魔功列入少林绝技，鸠摩智亦以小无相功为根基施展（原著）；本文将其配成可持袈裟类奇门兵器的卷缠与护身体系。
- **基本**：`harmony` · 0.40/0.60 · `weaponReq {category: exotic, kinds: [misc], tags: [jiasha]}`（袈裟类奇门兵器 `eq_jiasha_*` 由 design/10 定义；缺 `jiasha` 标签时"卷""罩"失去附带效果，05 §6.2）· `layerStats {parry [3,9], eva [1,6]}`（15）· moveSlots 4。
- **reqs**：`attrs {wis 45, agi 40}`、`aptitude {apExotic 45}`、`prereq [{skill: sk_damoxinjing, layer: 5}]`、`sect {id: sect_shaolin, rank: 4}`、`hard: [sect, prereq]`。
- **层数要点**：1 卷、拂、柔中带刚｜4 罩、袖里乾坤｜5 拂暗器｜7 袈裟伏魔（第一绝招）｜10 大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 附带 Buff | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 卷 | `mv_jiashafumogong_juan` | 1 | `aoe_pull` n1 | 1–2 | 0.95 | 8% | 1 | `bf_shouqin(level:4,holdRange:1)` 20% 2 | 可 | 0.95×1.17−0.10−0.05 |
| 拂 | `mv_jiashafumogong_fu` | 1 | `aoe_cone {angle:120,r:1,dirCount:6}` | 1 | 1.00 | 8% | 1 | — | 可 | N=3、AF=0.85；0.85×1.17=0.99，取 1.00 |
| 罩 | `mv_jiashafumogong_zhao` | 4 | `aoe_disk {r:1}` | 1–2 | 0.77 | 9% | 2 | `ultimate:false`；`recovery:1000`；`bf_muxuan` 30% 2 | 可 | 普通招：`0.60×1.34−0.10×0.30=0.774≈0.77`；`MoveDef{unlock:4; ultimate:false; mpCost:9%; cd:2; recovery:1000}` |
| 拂暗器 | `mv_jiashafumogong_fuqi` | 5 | `aoe_self` | 0 | — | 6% | 3 | `bf_poanqi` 2（06 已收录） | — | 架势 |
| 袈裟伏魔（绝） | `mv_jiashafumogong_fumo` | 7 | `aoe_around` | 0 | 2.10 | 9% | — | `ultimate:true`；`rageCost:100`；`recovery:1200`；`bf_shouqin(level:4,holdRange:1)` 50% 2 | 可 | N=6、AF=0.75；3.0×0.75−0.125=2.125≈2.10；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

- **被动**：`ps_jiashafumogong_rougang` 柔中带刚（1，Z2 4%→10%）；`ps_jiashafumogong_xiuli` 袖里乾坤（4，trigger 来袭 `projectile` 20%→40% 拂落，每回合 1 次）；`ps_jiashafumogong_dacheng` 大成（10，"卷"对持械目标附带 `bf_jiaoxie` 20%）。
- **setTags**：`[set_mizong_mingwang]`（鸠摩智跨组人物套装，C22）。
- **获取**：`{master, ch01_tianlong, 少林·达摩院授艺岗位槽, 10}`；`{observe, ch01_tianlong, npc_jiumozhi, 6, reqsOverride {sect: null, prereq: []}}`。

#### 1.6.6 轻功与阵法（2 门）

##### 一苇渡江 `sk_yiweidujiang`（地上 9 · 轻功 · 天龙 · 原创扩展定级）

- **简述**：典出达摩折苇渡江的传说；基准 §11 以"一苇渡江"描述五阶·凌虚轻功。本作将其定为少林最高轻功（地上），列入七十二绝技（原创纳入）。只在高武书界原生，与 03 §4.5.2"中武最高原生轻功地中"的假设一致。
- **基本**：`neutral`；`QS(9) = 120`（10 重时 `Q_skill` 120，03 §4.5）；`layerStats {eva [3,10], tough [1,5]}`（15）；轻功非核心、不可携带。
- **reqs**：`attrs {agi 50, wil 45}`、`aptitude {apLight 50}`、`prereq [{skill: sk_bihuyouqiang, layer: 5}]`、`sect {id: sect_shaolin, rank: 4}`、`hard: [sect, prereq]`。
- **层数要点**：1 一苇、身轻｜4 踏苇｜5 踏水｜7 飞渡（第一绝招）｜9 随波（第二绝招）｜10 大成。

| 招式 | ID | 层 | 类型 | 耗内 | 冷却 | 效果 |
|---|---|---|---|---|---|---|
| 一苇 | `mv_yiweidujiang_yiwei` | 1 | utility `aoe_self` | 5% | 2 | 本回合移动可越过深水 `tr_shenshui` ≤ 2 格（4 重 3、7 重 4）；`bf_jixing` 1 |
| 踏苇 | `mv_yiweidujiang_tawei` | 4 | utility（自身 `leap` r3，无伤害） | 6% | 3 | 跃至 3 格内合法落点；`bf_piaohu` 2 |
| 随波（绝） | `mv_yiweidujiang_suibo` | 9 | stance，`ultimate:true`、`rageCost:100`、`recovery:1200` | 9% | — | 气势 100；`bf_youshi` 3；本回合越水与高差移动耗点 −1（原创扩展）；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 飞渡（绝） | `mv_yiweidujiang_feidu` | 7 | utility，`ultimate:true`、`rageCost:100`、`recovery:1200` | 9% | — | 气势 100；`bf_zaidong` ×1（立即再行动一次；"一苇渡江，瞬息千里"）；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

- **被动**：`ps_yiweidujiang_shenqing` 身轻（1，按 QS 提供轻功值）；`ps_yiweidujiang_tashui` 踏水（5，mechanic，战斗中可在深水格停留 1 回合，第 2 回合须离开）；`ps_yiweidujiang_dacheng` 大成（10，`qinggong` flat +10；专精角色可达 qg5，03 §4.5.2 倚天行）。
- **获取**：`{qiyu, ch01_tianlong, q_01_qiyu_82, 10, reqsOverride {sect: null}, note: 少室山达摩洞面壁（原创扩展，需 wil ≥ 60）}`。`setTags [set_shaolin_damo]`；倚天不列可学来源（C14）。

##### 金刚伏魔圈 `sk_jingangfumoquan`（地上 9 · 杂学·阵法（合击） · 倚天 · 原著）

- **简述**：《倚天屠龙记》后段，渡厄、渡劫、渡难三僧坐于少室山后峰三株古松间，各持长索结“金刚伏魔圈”守护囚禁谢逊之处；张无忌曾与杨逍、周芷若等分别配合闯圈（原著）。
- **阵法规则以 09 §6.8.3 为准**（`special.formation`）：三角三点阵型、三名成员**坐关**（不能移动，免疫击退/牵引/换位）、圈域 = 三角凸包、“伏魔”（圈域内敌人每回合 `bf_fengqinggong`）、“索网”（持长索时圈域内皆在射程）、“三力一心”（受伤 50% 平分给另两人）及专属破法。正式 ID 为 `sk_jingangfumoquan`；C12 已解决旧名迁移，09 当前生产引用也已使用正式 ID。本卡只补武学本体：层数、招式、被动、学习。
- **基本**：`yang` · 0.30/0.70（持鞭索时"黑索锁拿"改 0.60/0.40）· 强度技艺 `formation`（05 §2.3；09 §6.8.0 强度 ×(1 + formation/200)）· `layerStats {parry [3,10], resCC [1,5]}`（15）· `fusible: false`。
- **reqs**：`attrs {wil 50, wis 45}`、`skills {formation: 50}` **【建议值】**、`prereq [{skill: sk_fumosuofa, layer: 5}]`、`sect {id: sect_shaolin, rank: 5}`、`hard: [sect, prereq]`。`formation` 是软门槛；罗汉阵不再作为倚天本土硬前置，可作为阵法修炼加速项由 `design/09` 配置。
- **层数要点**：1 布圈、黑索锁拿、古松之定｜5 一心补隙｜7 松间伏魔（第一绝招）｜9 禅心坚定（第二绝招）｜10 二僧成圈。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 附带 / 效果 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 布圈 | `mv_jingangfumoquan_buquan` | 1 | 阵位（坐关） | — | — | 8% | 5 | 就位坐关；三人到位即成阵（09 §6.8.0 检查时机） | — | 阵法行动 |
| 黑索锁拿 | `mv_jingangfumoquan_suona` | 1 | `aoe_single` | 1–3（阵成且持长索：圈域内任意） | 0.90 | 8% | 1 | `bf_shouqin(level:4,holdRange:1)` 30% 2 | 可 | 1.17×0.85−0.075 |
| 禅心坚定（绝） | `mv_jingangfumoquan_chanxin` | 9 | 阵员 | — | — | 9% | — | `ultimate:true`；气势 100；`recovery:1200`；阵员各驱散全部 `cc` 或 `mind`（≤ 品阶），用于化解 09"阵滞" | — | 支援绝招；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 松间伏魔（绝） | `mv_jingangfumoquan_fumo` | 7 | 圈域内全部敌人 | — | 1.30 | 9% | — | `ultimate:true`；`rageCost:100`；`recovery:1200`；`bf_dingshen` 100% 1；合璧：其余阵员集气 −300 同时出手（09） | 可 | 3.0×0.60×0.85−0.25=1.28；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

- **被动**：`ps_jingangfumoquan_songxin` 古松之定（1，阵员 Z4 +4%→+10%）；`ps_jingangfumoquan_buxi` 一心补隙（5，09“一心之隙”使三力一心失效的时间由 2 轮减为 1 轮）；`ps_jingangfumoquan_dacheng` 二僧成圈（10，2 人亦可成阵，阵域改为两人连线两侧各 1 格，效果 ×0.75；09 已提供 `minMembers` 接口）。
- **特殊**：合击类地阶（05 §14.6 地阶合击 ≤ 3%，本文仅此 1 门）。敌方三渡版见 §3.3。
- **setTags**：`[]`。
- **获取**：`{master, ch04_yitian, npc_duee, 10, note: 闯圈事件后渡厄相授（原创扩展）}`；队友经 `combo`（05 §7.7：羁绊 ≥ 3、合击 5 次）领悟。

### 1.7 玄阶与既有黄阶明细（嵩山少林 35 门）

> 记法：招式格 `名 mv_后缀 (层) 范围·射程·倍率·耗内·冷却[·附带]`；未写射程 = 1、未写收招 = 1000、架势收招 800。所有倍率按 05 §4.2 核算（玄耗内基准 6%、黄 5%），手调幅度 ≤ 0.05。`layerStats` 合计：黄 ≤ 6、玄 ≤ 10。招式与被动的完整 ID = `mv_<武学拼音>` / `ps_<武学拼音>` ＋ 表中后缀（如少林桩功"扎马 `_zhama`" = `mv_shaolinzhuanggong_zhama`）。

#### 1.7.1 铜人横练 `sk_tongrenhenglian`（玄上 6 · 内功·横练 · 天龙/倚天/笑傲/鹿鼎 · 原创扩展）——用户示例套装成员

- **简述**：罗汉堂外门横练，弟子须"闯铜人巷"方得传授（民间"少林十八铜人"传说的化用，原创扩展）。横练链起点：铜人横练 → 铁布衫 → 金钟罩 → 金刚不坏体。
- **基本**：`yang`；`inner.contribution {mpMaxPct 14, hpMaxPct 15.5, attrs {con 6, str 4}, mpRegen 1.5, stats {defOut 6, resCC 4}}`（IP 14+15.5+20+7.5 = 57 ✓；mp −30%、hp +29%、属性 +25%、回内 −17%）；moveSlots 3。
- **reqs**：`attrs {con 30, str 30}`、`aptitude {apInner 25}`、`prereq [{skill: sk_shaolinzhuanggong, layer: 4}]`、`sect {id: sect_shaolin, rank: 3}`、`hard: [sect, prereq]`。
- **招式**：铜身 `mv_tongrenhenglian_tongshen`（1）架势·`bf_waifang_sheng` 2·5%·cd2｜铜臂撞 `mv_tongrenhenglian_tongbi`（1）单体·0.95·6%·cd0·击退 1（1−0.05；wOut/wIn 覆写 0.80/0.20）｜千斤坠 `mv_tongrenhenglian_qianjin`（4）架势·`bf_wenzhong` 3·5%·cd3｜**铜人巷（绝）** `mv_tongrenhenglian_tongrenxiang`（7）`aoe_around`·2.20·8%·气势100·收招1200·`ultimate:true`·击退 1（`3.00×0.75−0.05=2.20`）。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`
- **被动**：`ps_tongrenhenglian_henglian` 横练（1，Z4 近战来袭 −2%→−6%，`scaled`）；`ps_tongrenhenglian_zhaomen` 罩门（1，伴生 `bf_zhaomen`，品阶 = 本功）；`ps_tongrenhenglian_tongpi` 铜皮（5，trigger `onHurt` 近战，`bf_renjin` 1，每回合 1 次）；`ps_tongrenhenglian_dacheng` 横练大成（10，常驻 `bf_mian_liuxue`，06 所列"横练大成"）。
- **setTags**：`[set_shaolin_jingang]`。
- **获取**：`{master, ch01_tianlong / ch04_yitian / ch05_xiaoao / ch08_luding, 少林·罗汉堂授艺岗位槽, 10, note: 须完成"闯铜人巷"事件 q_NN_faction_81（原创扩展）}`。

#### 1.7.2 内功与拳脚（玄/黄，表内 15 门；罗汉拳见表后注）

| ID · 名称 · 品阶 | 性质 · 比例 · 成长 | reqs | 招式 | 被动 · 获取要点 |
|---|---|---|---|---|
| `sk_shaolinzhuanggong` 少林桩功 · 黄下 1 | 阳 · 0/1 · 贡献 `{mp 6, hp 4, con 1, str 1, mpRegen 1.0}`（IP 19）· stats `{resCC 3, parry 3}` | `sect {id: sect_shaolin, rank: 1}` | 扎马 `_zhama`（1）架势·`bf_wenzhong` 2·4%·cd3 | `_zhuangwen` 桩稳（1，resCC +2→+6）；`_yuanman`（10，首次练满 `con` +1，全游戏一次）。入寺第一课；`setTags [set_shaolin_luohan]` |
| `sk_shaolinxinfa` 少林心法 · 黄中 2 | 阳 · 0/1 · 贡献 `{mp 8, hp 5, con 2, str 1, mpRegen 1.0}`（IP 24）· stats `{resInjury 3, defOut 3}` | `sect {id: sect_shaolin, rank: 1}` | 调息 `_tiaoxi`（1）自身·`bf_huinei` 3·0%·cd4·收招 900 | `_zhengzong` 少林正宗（1，主运时少林拳脚招式 Z3 +1%→+4%，`auxMode: none`）；`_yuanman`（10，少林武学修炼 +5%）；`setTags [set_shaolin_luohan]` |
| `sk_tongzigong` 童子功 · 玄下 4 | 阳 · 0/1 · 贡献 `{mp 13, hp 9.5, con 4, str 2, mpRegen 1.4}`（IP 41.5）· stats `{resInjury 5, tough 5}` | `attrs {con 30}`；`sect {id: sect_shaolin, rank: 2}` | 童子拜佛 `_baifo`（1）自身·`bf_jiangu` 2·5%·cd3｜元阳劲 `_yuanyang`（4）单体·1.15·7%·cd1（1.17；wOut/wIn 覆写 0.60/0.40） | `_zaolian` 早练（1，习得时显示等级 ≤ 20 则本功修炼 +30%）；`_guben` 固本（5，`battleStart` → `bf_guben` 3）。清代民间名目，原创纳入；书剑经南少林习得 |
| `sk_damoxinjing` 达摩心经 · 玄中 5 | 调和 · 0/1 · 贡献 `{mp 18, hp 9, wis 3, wil 4, mpRegen 1.5}`（IP 48.5）· stats `{resMind 5, effRes 5}` | `attrs {wis 30, wil 30}`；`sect {id: sect_shaolin, rank: 3}` | 面壁观心 `_mianbi`（1）自身·驱散 1 个 `mind`＋`bf_dingxin` 3·6%·cd3｜静坐 `_jingzuo`（4）架势·`bf_yangshi` 3·4%·cd3｜禅力 `_chanli`（7）友方 r1·`bf_shouyi` 3·6%·cd3 | `_fofa` 佛法根基（1，mechanic，§1.3.1）；`_dacheng`（10，同装配少林内功辅运比例 +0.05）。袈裟伏魔功前置；`setTags [set_shaolin_damo]` |
| `sk_weituozhang` 韦陀掌 · 黄中 2 | 阳 · 0.75/0.25 · `{parry [1,3], defOut [1,3]}` | `sect {id: sect_shaolin, rank: 1}` | 韦陀护法 `_hufa`（1）单体·1.00·5%·cd0｜捧杵 `_pengchu`（4）单体·1.10·6%·cd1·击退 1（1.17−0.05）｜分山 `_fenshan`（7）`aoe_cone {angle:120,r:1,dirCount:6}`·0.95·6%·cd1（N=3、AF=0.85；0.85×1.12=0.95） | `_duanning` 端凝（5，parry +2）；`_yuanman`（10，学般若掌/韦陀杵/降魔杵资质软门槛 −10）。虚竹是否明确习过此名目待 K-06 核定 |
| `sk_fuhuquan` 伏虎拳 · 黄上 3 | 阳 · 0.85/0.15 · `{hit [1,3], crit [1,3]}` | `prereq [{skill: sk_luohanquan, layer: 4}]`；`sect {id: sect_shaolin, rank: 1}`。射雕/侠客来源：`reqsOverride {prereq: [{skill: sk_weituozhang, layer: 4}]}` | 伏虎 `_fuhu`（1）单体·1.15·6%·cd1｜擒虎 `_qinhu`（4）`aoe_pull` n1·1–2·1.00·6%·cd1｜饿虎扑食 `_pushi`（7）`aoe_dash` n3·1.20·6%·cd2（1.29−0.10） | `_huwei` 虎威（5，`onKill` → `bf_waigong_sheng` 2）；`_dacheng`（10，对拳脚类敌人 Z3 +5%）。大金刚拳前置 |
| `sk_shuaibeishou` 摔碑手 · 玄下 4 | 阳 · 0.75/0.25 · `{defOut [1,5], parry [1,5]}` | `attrs {str 25}`；`prereq [{skill: sk_luohanquan, layer: 4}]`；`sect {id: sect_shaolin, rank: 2}`。侠客来源：`reqsOverride {prereq: [{skill: sk_weituozhang, layer: 4}]}` | 摔碑 `_shuaibei`（1）单体·1.15·7%·cd1·`bf_pojia` 30%（1.17−0.03）｜劈石 `_pishi`（3）单体·1.35·8%·cd2·收招 1100·击退 1（1.41−0.05）｜推碑 `_tuibei`（6）`aoe_line` n2·0.95·7%·cd1·击退 1 | `_shouli` 手力（1，Z2 3%→8%）；`_xiaocheng`（5，对 `bf_pojia` 目标 Z3 +6%）；`_dacheng`（10，劈石冷却 −1）。心意把前置 |
| `sk_tieshazhang` 铁砂掌 · 玄中 5 | 以 05 §2.8 为准：阳 · 0.75/0.25 · `{defOut [1,6]}` | `attrs {str 35, con 30}`；`prereq [{skill: sk_luohanquan, layer: 4}]`；`sect {id: sect_shaolin, rank: 3}` | 开碑手（1）1.05·破甲 25%｜推山掌（4）`aoe_line` n2·1.00·击退｜砂掌连环（6）1.45×3｜金刚掌印（7）1.50·10%·cd2·收招1200·内伤60%（普通招） | 砂掌/铁臂（`bf_tiebi`）/铁砂大成；`setTags [set_shaolin_jingang]`；`conflicts` 绵掌 `sk_mianzhang`（武当，道家组）clash。大金刚掌前置；完整定义见 05 §2.8 |
| `sk_xinyiba` 心意把 · 玄上 6 | 阳 · 0.70/0.30 · `{hit [1,5], crit [1,5]}` | `attrs {str 30, agi 30}`；`aptitude {apFist 30}`；`prereq [{skill: sk_shuaibeishou, layer: 5}]`；`sect {id: sect_shaolin, rank: 3}` | 把子 `_bazi`（1）单体·1.05·6%·cd0·收招 900｜龙身 `_longshen`（3）`aoe_dash` n2·1.05·7%·cd1｜熊膀 `_xiongbang`（5）单体·1.25·7%·cd2·击退 1｜虎抱头 `_hubaotou`（7）单体·1.15·7%·cd1·`bf_pojia` 30%｜**心意合一（绝）** `_heyi`（7）单体·2.90·8%·气势100·收招1200·`ultimate:true`·`bf_xuanyun` 30%（`3.00−0.075=2.925≈2.90`） | `_liuhe` 六合（1，连续两回合使用本武学 → `bf_ruiyi` 1）；`_xiaocheng`（5，本武学破招 +5）。民间嵩山少林"心意把"，原创纳入；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |
| `sk_dacidabeiqianyeshou` 大慈大悲千叶手 · 玄上 6 | 调和 · 0.60/0.40 · `{combo [1,5], parry [1,5]}` | `attrs {agi 30, wis 30}`；`aptitude {apFist 30}`；`sect {id: sect_shaolin, rank: 3}`。海大富来源：`reqsOverride {sect: null}` | 千叶 `_qianye`（1）`aoe_multi` n4 r1·1.00（4 段）·7%·cd1｜慈悲 `_cibei`（1）架势·`bf_yuanzhuan` 2·5%·cd2｜佛海 `_fohai`（4）单体·1.25·7%·cd2·`bf_chizhi` 30%｜**渡厄（绝）** `_due`（7）`aoe_pull` n2·1–3·2.30·8%·气势100·收招1200·`ultimate:true`（`3.00×0.95×0.85−0.10=2.3225≈2.30`） | `_qianshou` 千手千眼（1，本武学被招架时 30% 追加一段 ×0.5，每回合 1 次）；`_cibei` 慈悲（5，制服）。《鹿鼎记》中海大富传韦小宝、韦小宝再与康熙过招；其招名和少林归属待 K-07 核定；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |
| `sk_jingangzhi` 金刚指 · 玄下 4 | 阳 · 0.60/0.40 · `{seal [2,6], hit [1,4]}` | `attrs {agi 25}`；`sect {id: sect_shaolin, rank: 2}` | 指力 `_zhili`（1）单体·1–2·1.00·7%·cd1（1.17×0.85）｜点穴 `_dianxue`（3）单体·1.10·7%·cd1·`bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)` 25%｜穿石 `_chuanshi`（6）`aoe_pierce`·1.15·7%·cd2 | `_xiaocheng`（5，本武学点穴持续 +1）；`_dacheng`（10，学一指禅/摩诃指/多罗叶指/大力金刚指资质软门槛 −10）。指法链起点 |
| `sk_tantui` 少林弹腿 · 黄中 2 | 中性 · 0.90/0.10 · `{eva [1,3], hit [1,3]}` | 无 | 弹腿 `_tantui`（1）单体·1.00·4%·cd0·收招 900｜扫堂 `_saotang`（4）`aoe_cone {angle:120,r:1,dirCount:6}`·0.90·5%·cd1·`bf_panshan` 30%｜连环弹踢 `_lianti`（7）单体·1.10（2 段）·5%·cd1 | `_shilu` 十路（5，命中后 `bf_jixing` 1，每回合 1 次）；`_yuanman`（10）。民间"少林弹腿/十路弹腿"（亦有教门弹腿之说），原创纳入；持械不降效 |
| `sk_tiesaozhou` 铁扫帚 · 玄中 5 | 阳 · 0.80/0.20 · `{hit [1,5], parry [1,5]}` | `prereq [{skill: sk_tantui, layer: 4}]`；`sect {id: sect_shaolin, rank: 3}`。天龙来源：`reqsOverride {prereq: [{skill: sk_luohanquan, layer: 4}]}` | 铁扫帚 `_saozhou`（1）`aoe_cone {angle:120,r:1,dirCount:6}`·0.95·7%·cd1·`bf_panshan` 40%｜勾腿 `_goutui`（3）单体·1.10·7%·cd1·`bf_dingshen` 20%｜旋风扫 `_xuanfeng`（6）`aoe_around`·0.95·8%·cd2·`bf_panshan` 30%（N=6、AF=0.75；`.75×1.29−.03≈.95`） | `_tietui` 铁腿（1，Z2 3%→8%）；`_xiaocheng`（5，对 `bf_panshan` 目标 Z3 +8%）。民间七十二艺，原创纳入；如影随形腿前置 |
| `sk_shaolinqinna` 少林擒拿手 · 黄上 3 | 阳 · 0.85/0.15 · `{seal [1,3], hit [1,3]}` | `sect {id: sect_shaolin, rank: 1}` | 拿腕 `_nawan`（1）单体·1.10·6%·cd1·`bf_jiaoxie` 20%（持械）｜错骨 `_cuogu`（4）单体·1.10·6%·cd1·`bf_xueweishoufeng(level:7,acupointRef:sourcePrimary)` 20%｜锁肩 `_suojian`（7）`aoe_pull` n1·1.00·6%·cd1 | `_naxue` 拿穴（5，命中 10% `bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)`）；`_yuanman`（10，学龙爪手资质软门槛 −10）。05 龙爪手前置（≥ 5 重） |
| `sk_yingzhuagong` 鹰爪功 · 玄中 5 | 阳 · 0.75/0.25 · `{seal [1,5], crit [1,5]}` | `prereq [{skill: sk_shaolinqinna, layer: 4}]`；`sect {id: sect_shaolin, rank: 3}`。书剑来源：`reqsOverride {sect: {id: sect_nanshaolin, rank: 3}, prereq: [{skill: sk_hongquan, layer: 4}]}` | 鹰爪 `_yingzhua`（1）单体·1.15·7%·cd1·`bf_liuxue` 30%｜鹰击长空 `_yingji`（3）`aoe_leap`·1–3·1.05·7%·cd2｜分筋 `_fenjin`（6）单体·1.23·7%·cd2·`bf_xueweishoufeng(level:7,acupointRef:sourcePrimary)` 30% | `_zhuali` 爪力（1，Z2 3%→8%）；`_dacheng`（10，对 `bf_xueweishoufeng` 目标 Z3 +8%）。民间"鹰爪力"，原创纳入 |

> `sk_luohanquan` 罗汉拳（黄下 1）以 05 §13.8 为准：罗汉拜佛（1，0.90）、罗汉撞钟（4，1.05，击退）、罗汉推山（7，`aoe_line` n2，0.95）；被动拳架扎实、入门圆满；`setTags [set_shaolin_luohan]`。
>
> **AR-16 外放字段（玄阶）**：`mv_jingangzhi_zhili` → `MoveDef{projection:true; range:{min:1,max:2}; aoe:{tpl:aoe_single}; projectionSpreadSteps:[{tpl:aoe_single},{tpl:aoe_single},{tpl:aoe_single}]; meridianRouteRef:mfr_jingangzhi_zhili}`；全部伤害段 `DamageKind='projected'`。同门“点穴”为接触招；“穿石”缺少离体表现证据，暂记待考。

#### 1.7.3 兵器、轻功、暗器、杂学（玄/黄，18 门）

| ID · 名称 · 品阶 | 性质 · 比例 · 成长 | reqs | 招式 | 被动 · 获取要点 |
|---|---|---|---|---|
| `sk_shaolingunfa` 少林棍法 · 黄中 2 | 中性 · 0.85/0.15 · `weaponReq staff` · `{parry [1,3], hit [1,3]}` | `sect {id: sect_shaolin, rank: 1}` | 横扫 `_hengsao`（1）`aoe_cone {angle:120,r:1,dirCount:6}`·0.95·5%·cd1（N=3、AF=0.85；0.85×1.12=0.95）｜挑刺 `_tiaoci`（1）单体·1–2·0.95·5%·cd0（射程 2 手调 −0.05）｜劈棍 `_pigun`（4）单体·1.25·6%·cd1·收招 1100 | `_shisan` 十三棍僧（5，每名装配少林棍法的相邻队友使自身 parry +2，≤ +6；"十三棍僧救唐王"民间传说，原创扩展）；`_yuanman`（10）。棍杖链起点；书剑经南少林习得；`setTags [set_shaolin_luohan]` |
| `sk_yinshougun` 阴手棍 · 玄下 4 | 中性 · 0.80/0.20 · `staff` · `{parry [1,5], hit [1,5]}` | `prereq [{skill: sk_shaolingunfa, layer: 4}]`；`sect {id: sect_shaolin, rank: 2}` | 阴手 `_yinshou`（1）单体·1–2·1.15·7%·cd1｜封门 `_fengmen`（3）架势·`bf_jieji` 2·5%·cd2｜连枝 `_lianzhi`（6）单体·1.30（2 段）·7%·cd2 | `_changbing` 长兵之利（1，敌人进入相邻格后本武学下一招 Z3 +5%）；`_dacheng`（10）。明·程宗猷《少林棍法阐宗》所记“阴手”持法（史实名目），原创纳入；明代书界（笑傲/侠客）与鹿鼎 |
| `sk_yachagun` 夜叉棍法 · 玄中 5 | 阳 · 0.75/0.25 · `staff` · `{crit [1,5], defOut [1,5]}` | `prereq [{skill: sk_shaolingunfa, layer: 5}]`；`sect {id: sect_shaolin, rank: 3}` | 夜叉探海 `_tanhai`（1）单体·1–2·1.15·7%·cd1｜夜叉分水 `_fenshui`（3）`aoe_cone {angle:120,r:1,dirCount:6}`·0.95·8%·cd1·击退 1｜夜叉劈山 `_pishan`（6）单体·1.35·8%·cd2·收招 1100·`bf_chihuan` 30%｜罗刹乱舞 `_luosha`（10）`aoe_around`·1.05·8%·cd3·收招 1000·击退 1（普通招：`0.75×1.46−0.05≈1.05`） | `_xiongmeng` 凶猛（1，Z2 3%→8%）；`_xiaocheng`（5，横扫类招式击退 +1）。民间少林大小夜叉棍，原创纳入；伏魔杖法前置 |
| `sk_jiedaofa` 戒刀法 · 黄上 3 | 中性 · 0.85/0.15 · `blade` · `{parry [1,3], hit [1,3]}` | `sect {id: sect_shaolin, rank: 1}` | 戒刀 `_jiedao`（1）单体·1.00·5%·cd0｜横劈 `_hengpi`（3）`aoe_cone {angle:120,r:1,dirCount:6}`·0.95·6%·cd1｜戒杀 `_jiesha`（7）单体·1.30·6%·cd2 | `_jiesha` 戒杀（5，mechanic，制服）。刀法链起点 |
| `sk_cibeidao` 慈悲刀 · 玄上 6 | 调和 · 0.60/0.40 · `blade` · `{parry [2,6], defIn [1,4]}` | `prereq [{skill: sk_jiedaofa, layer: 5}]`；`sect {id: sect_shaolin, rank: 3}`。侠客来源：`reqsOverride {sect: null, prereq: []}` | 慈悲 `_cibei`（1）单体·1.15·7%·cd1｜息事 `_xishi`（3）单体·1.10·7%·cd1·`bf_waigong_jiang` 50%｜回刀 `_huidao`（5）架势·`bf_houfa` 2·5%·cd3｜**渡化（绝）** `_duhua`（7）`aoe_cone {r:2,angle:60,dirCount:6}`·2.30·8%·气势100·收招1200·`ultimate:true`·`bf_waigong_jiang` 100% 2（`3.00×0.80−0.10=2.30`） | `_buren` 不忍（1，制服）；`_daoyi` 刀意（5，`onParry` → `bf_xieli` 1）；`_dacheng`（10，Z3 +6%）。燃木刀法前置；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |
| `sk_luohanjian` 罗汉剑法 · 黄上 3 | 中性 · 0.85/0.15 · `sword` · `{parry [1,3], hit [1,3]}` | `sect {id: sect_shaolin, rank: 1}` | 罗汉刺 `_ci`（1）单体·1.00·5%·cd0｜横剑 `_hengjian`（3）`aoe_cone {angle:120,r:1,dirCount:6}`·0.95·6%·cd1｜护法剑 `_hufa`（7）架势·`bf_yuanzhuan` 2·5%·cd2 | `_yuanman`（10）。剑法链起点 |
| `sk_fumojian` 伏魔剑法 · 玄中 5 | 阳 · 0.70/0.30 · `sword` · `{parry [1,5], crit [1,5]}` | `prereq [{skill: sk_luohanjian, layer: 4}]`；`sect {id: sect_shaolin, rank: 3}`。侠客来源：`reqsOverride {sect: {id: sect_shaolin, rank: 4}, prereq: []}` | 伏魔 `_fumo`（1）单体·1.15·7%·cd1｜斩妖 `_zhanyao`（3）单体·1.50·8%·cd2·条件：目标品德 ≤ −20（常见条件 +0.15）｜剑阵 `_jianzhen`（6）`aoe_line` n3·1.05·8%·cd2 | `_zhengqi` 正气（1，对邪派目标 Z3 +3%→+8%）；`_dacheng`（10）。传统同名不足以证明小说出处，按原创扩展处理；达摩剑法前置 |
| `sk_xiangmochu` 韦陀降魔杵 · 玄上 6 | 阳 · 0.75/0.25 · `weaponReq {exotic, kinds [pestle]}` · `{defOut [1,5], crit [1,5]}` | `prereq [{skill: sk_weituozhang, layer: 5}]`；`sect {id: sect_shaolin, rank: 3}` | 降魔 `_xiangmo`（1）单体·1.25·7%·cd1·收招 1100｜镇魔 `_zhenmo`（3）`aoe_around`·0.85·8%·cd2·`bf_chihuan` 30%｜**破甲（绝）** `_pojia`（7）单体·2.90·8%·气势100·收招1200·`ultimate:true`·`bf_pojia` 100%（`3.00−0.10=2.90`） | `_zhongbing` 重兵（1，Z2 4%→10%）；`_dacheng`（10）。韦陀菩萨持杵之像，原创扩展（10 奇门 `pestle` 为双手 `heavy`）；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |
| `sk_fumosuofa` 伏魔索法 · 玄上 6 | 阳 · 0.60/0.40 · `whip` · `{hit [1,5], parry [1,5]}` | `sect {id: sect_shaolin, rank: 3}` | 黑索 `_suo`（1）单体·1–3·1.10·7%·cd1·`bf_shouqin(level:4,holdRange:1)` 20%｜盘索 `_pansuo`（3）`aoe_pull` n2·1–3·1.10·7%·cd2｜**环圆（绝）** `_huanyuan`（7）`aoe_ring` r2·1.85·8%·气势100·收招1200·`ultimate:true`（`3.00×0.65−0.10=1.85`，手擒50% 2） | `_suoxin` 索心（1，Z2 3%→8%）；`_fumo` 伏魔（5，与金刚伏魔圈同装配且阵成时，"索网"外本武学射程 +1）。取三渡长索之意，原创扩展；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |
| `sk_luohanbu` 罗汉步 · 黄中 2 | 轻功 · `QS 38` · `{eva [1,3], hit [1,3]}` | `sect {id: sect_shaolin, rank: 1}`；书剑来源 `reqsOverride {sect: {id: sect_nanshaolin, rank: 1}}` | 换步 `_huanbu`（1）自身·`bf_jixing` 1·3%·cd2 | `_wenbu` 步稳（5，resCC +3）。全部少林书界＋书剑；`setTags [set_shaolin_luohan]` |
| `sk_meihuazhuang` 梅花桩 · 玄下 4 | 轻功 · `QS 56` · `{eva [1,5], resCC [1,5]}` | `sect {id: sect_shaolin, rank: 2}` | 桩步 `_zhuangbu`（1）架势·`bf_wenzhong` 2·4%·cd2｜跳桩 `_tiaozhuang`（4）自身 `leap` r3＋`bf_tengyue` 2·4%·cd3 | `_zhuanggong` 桩功（5，立于比相邻敌人高 ≥ 1 级的格上时 parry +5）。民间名目，原创纳入 |
| `sk_bihuyouqiang` 壁虎游墙功 · 玄中 5 | 轻功 · `QS 65` · `{eva [1,5], hit [1,5]}` | `sect {id: sect_shaolin, rank: 3}` | 游墙 `_youqiang`（1）本回合可沿墙体/崖壁攀移 ≤ 3 级高差（08）·4%·cd2｜贴壁 `_tiebi`（4）架势·`bf_piaohu` 2·4%·cd3 | `_panya` 攀崖（5，探索攀爬体力消耗 −30%，08）。民间七十二艺，原创纳入；一苇渡江前置 |
| `sk_putizi` 菩提子 · 黄上 3 | 暗器 · 0.90/0.10 · `{hit [1,3], seal [1,3]}` | `sect {id: sect_shaolin, rank: 1}` | 弹子 `_tanzi`（1）`aoe_bolt` 投射·2–5·1.00·5%·cd1（0.92×1.12，手调 −0.03）｜打穴 `_daxue`（4）投射·2–5·0.95·5%·cd1·`bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)` 20% | `_putixin` 菩提心（5，不淬毒时效果命中 +5）。以念珠菩提子为弹，原创扩展 |
| `sk_jingangnianzhu` 金刚念珠 · 玄上 6 | 暗器 · 0.85/0.15 · `{hit [1,5], seal [1,5]}` | `prereq [{skill: sk_putizi, layer: 5}]`；`sect {id: sect_shaolin, rank: 3}` | 连珠 `_lianzhu`（1）`aoe_chain` n3 投射·2–5·0.85·7%·cd1｜定穴 `_dingxue`（3）`aoe_bolt`·2–5·1.13·7%·cd2·`bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)` 30%｜**回旋（绝）** `_huixuan`（7）`aoe_boomerang` n3·1.55·8%·气势100·收招1200·`ultimate:true`（`3.00×0.70×0.92×0.85−0.10=1.5422≈1.55`） | `_foli` 佛力（1，Z2 3%→8%）；`_dacheng`（10）。原创扩展；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |
| `sk_boruoxinjing` 般若心经 · 玄下 4 | 杂学·心神 · 资质按 `wil`（05 §2.3）· `{resMind [1,5], effRes [1,5]}` | `attrs {wil 25}`；`sect {id: sect_shaolin, rank: 2}`；书剑来源 `reqsOverride {sect: {id: sect_nanshaolin, rank: 2}}` | 诵经 `_songjing`（1）`aoe_allies` r2·友方各驱散 1 个 `mind`＋`bf_dingxin` 3·6%·cd3｜观自在 `_guanzizai`（4）自身·`bf_mian_xin` 1·6%·cd5 | `_fofa` 佛法根基（1，mechanic，§1.3.1）；`_wuguai` 心无挂碍（5，resMind +3→+8）。杂学不可携带：每个少林书界都要重新习得；`setTags [set_saodiseng]` |
| `sk_shaolinshangke` 少林伤科 · 玄中 5 | 杂学·医 · 强度按 `med` · `{healPower [2,6], resInjury [1,4]}` | `attrs {wis 30}`；`skills {med: 30}` **【建议值】**；`sect {id: sect_shaolin, rank: 3}` | 接骨 `_jiegu`（1）友方 r1·驱散 `injury.bone`（`bf_gushang`）＋回复 12%·5%·cd2｜推拿 `_tuina`（3）友方 r1·`bf_huoluo` 3＋回复 10%·6%·cd2｜正骨 `_zhenggu`（6）友方 r1·驱散 2 个 `injury`/`bleed`＋回复 18%·7%·cd3 | `_yizhe` 医者（1，解锁战斗外疗伤服务，见 `design/12`）；`_dahuan` 大还丹方（7，`unlockReqs {skills: {alchemy: 40}}` 时解锁 `it_dahuandan` 配方；物品与配方归 `design/10`；待考 K-10：核金庸小说中是否出现“少林大还丹”名目及使用情节）。专解大力金刚指之骨伤 |
| `sk_luohanzhen` 罗汉阵 · 玄上 6 | 杂学·阵法（合击） · 0.60/0.40 · `{parry [1,5], resCC [1,5]}` | `skills {formation: 30}` **【建议值】**；`sect {id: sect_shaolin, rank: 3}` | 布阵 `_buzhen`（1）与 ≥ 2 名装配本武学的友方相邻成阵：阵员 `bf_yuanhu` 2＋`bf_jiangu` 3·6%·cd5｜罗汉合击 `_heji`（3）单体·1.15·6%·cd2（目标须与 ≥ 2 名阵员相邻；命中后其余阵员各追加基础招式 ×0.4；1.24−0.10）｜**十八罗汉（绝）** `_shibaluohan`（7）`aoe_allies` r2·8%·气势100·收招1200·`ultimate:true`·`bf_zhuiji` 3 | `_zhenshi` 阵势（1，每名相邻阵员 parry +2，≤ +10）。本作玩家版阵法为原创扩展；待考 K-11：核《天龙八部》《鹿鼎记》是否出现同名"罗汉阵"及其人数。阵法通用规则见 `design/09` §6.8.0（3–6 人、无固定阵眼）；18 人完整大阵为 NPC 机制（§3.3）；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |
| `sk_jingangnuhou` 金刚怒吼 · 玄上 6 | 杂学·音功 · 阳 · 0/1 · `{effHit [1,5], resMind [1,5]}` | `attrs {con 30, wil 30}`；`sect {id: sect_shaolin, rank: 3}` | 怒吼 `_nuhou`（1）`aoe_around`·0.67·7%·cd2·`bf_zhenshe` 30%·**只伤敌**（N=6、AF=0.75；原创扩展：内敛之吼）｜**震慑（绝）** `_zhenshe`（7）`aoe_cone {r:3,angle:60,dirCount:6}`·1.40·8%·气势100·收招1200·`ultimate:true`·`bf_xieqi` 100% 2（`3.00×0.70×0.7225−0.10=1.4173≈1.40`） | `_weimeng` 威猛（1，`battleStart` 气势 +5）；`_dacheng`（10，本武学附带减益效果命中 +10）。06 已列为 `bf_zhenshe` 来源；狮子吼前置（≥ 5 重）；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |

### 1.8 黄阶一行总表（嵩山少林 15 门）

> 本表是 AR-01 的可计数黄阶索引。既有 12 门保留 §1.7 明细，新 3 门以本表为正式摘要条目；`L1` 均指 T01 授艺职级。新条目不含内功、不引用 Buff、不加入套装，故无需新增 `nature`、`bf_*` 或跨组 `setTags` 登记。

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或（原创扩展） |
|---|---|---|---|---|---|---|---|
| `sk_shaolinzhuanggong` | 少林桩功 | `sect_shaolin`／罗汉堂 | 内功（黄下1·`yang`） | 天龙、射雕、神雕、倚天、笑傲、侠客、鹿鼎、书剑 | IP `6+4+2×2+5×1=19`；稳固架势；`set_shaolin_luohan` | L1；无武学前置 | **（原创扩展）** |
| `sk_luohanquan` | 罗汉拳 | `sect_shaolin`／罗汉堂 | 拳脚／拳掌（黄下1·`yang`） | 天龙、神雕、倚天、笑傲、鹿鼎 | 基础单体、击退与线2；`set_shaolin_luohan` | L1；无武学前置 | 原著少林入门拳法；招式拆分见 `design/05` §13.8 |
| `sk_shaolinxinfa` | 少林心法 | `sect_shaolin`／山门传授 | 内功（黄中2·`yang`） | 天龙、射雕、神雕、倚天、笑傲、侠客、鹿鼎、书剑 | IP `8+5+2×3+5×1=24`；少林拳脚修炼辅助；`set_shaolin_luohan` | L1；无武学前置 | **（原创扩展）** |
| `sk_weituozhang` | 韦陀掌 | `sect_shaolin`／罗汉堂 | 拳脚／拳掌（黄中2·`yang`） | 天龙、射雕、笑傲、侠客、鹿鼎 | 单体、击退与横扫；`setTags: []` | L1；无武学前置 | 原著入门功夫；虚竹所习名目待考 K-06 |
| `sk_tantui` | 少林弹腿 | `sect_shaolin`／山门传授 | 拳脚／腿法（黄中2·`neutral`） | 笑傲、侠客、鹿鼎、书剑 | 单踢、横扫与连踢；持械不降效；`setTags: []` | L1；无武学前置 | 民间名目，**（原创扩展）**纳入 |
| `sk_shaolingunfa` | 少林棍法 | `sect_shaolin`；书剑经 `sect_nanshaolin` 共享 | 兵器／棍杖（黄中2·`neutral`） | 天龙、射雕、神雕、倚天、笑傲、侠客、鹿鼎、书剑 | 横扫、射程2挑刺；`weaponReq: staff`；`setTags [set_shaolin_luohan]` | L1；无武学前置 | **（原创扩展）** |
| `sk_luohanbu` | 罗汉步 | `sect_shaolin`；书剑经 `sect_nanshaolin` 共享 | 轻功（黄中2·`neutral`） | 天龙、射雕、神雕、倚天、笑傲、侠客、鹿鼎、书剑 | `Q_skill=QS(2)=38`；基础换步；`set_shaolin_luohan` | L1；无武学前置 | **（原创扩展）** |
| `sk_chanmenshenfa` | 禅门身法 | `sect_shaolin`；书剑经 `sect_nanshaolin` 共享 | 轻功（黄中2·`harmony`） | 笑傲、侠客、鹿鼎、书剑 | `Q_skill=QS(2)=38`；移动1格的守中步；`setTags: []` | L1；无武学前置 | **（原创扩展）** |
| `sk_fuhuquan` | 伏虎拳 | `sect_shaolin`／罗汉堂 | 拳脚／拳掌（黄上3·`yang`） | 天龙、射雕、神雕、侠客、鹿鼎 | 单体、拉拽与突进；`setTags: []` | L1；罗汉拳4重；射雕／侠客可改韦陀掌4重 | 同名传统拳术不作小说事实；**（原创扩展）** |
| `sk_shaolinqinna` | 少林擒拿手 | `sect_shaolin`／般若堂基础 | 拳脚／擒拿（黄上3·`yang`） | 天龙、射雕、神雕、倚天、笑傲、侠客、鹿鼎 | 缴械、封经脉与拉拽；龙爪手前置；`setTags: []` | L1；无武学前置 | **（原创扩展）**；`design/05` 已引用 |
| `sk_jiedaofa` | 戒刀法 | `sect_shaolin`；书剑经 `sect_nanshaolin` 共享 | 兵器／刀（黄上3·`neutral`） | 天龙、笑傲、鹿鼎、书剑 | 单体、横扫与“制服”；`weaponReq: blade`；`setTags: []` | L1；无武学前置 | **（原创扩展）** |
| `sk_luohanjian` | 罗汉剑法 | `sect_shaolin`／山门传授 | 兵器／剑（黄上3·`neutral`） | 天龙、笑傲 | 单体、横扫与守势；`weaponReq: sword`；`setTags: []` | L1；无武学前置 | **（原创扩展）** |
| `sk_putizi` | 菩提子 | `sect_shaolin`；书剑经 `sect_nanshaolin` 共享 | 暗器（黄上3·`neutral`） | 天龙、笑傲、鹿鼎、书剑 | 投射与打穴；不淬毒时效果命中提高；`setTags: []` | L1；无武学前置 | 以念珠菩提子作弹；**（原创扩展）** |
| `sk_shaolinchangquan` | 少林长拳 | `sect_shaolin`；书剑经 `sect_nanshaolin` 共享 | 拳脚／拳掌（黄上3·`neutral`） | 笑傲、侠客、鹿鼎、书剑 | 近身单体 `1.00`、线2 `.90`（均5% MPREF、cd0）；`setTags: []` | L1；无武学前置 | **（原创扩展）**；不等同 `sk_changquanrumen` |
| `sk_shaolinhushangun` | 少林护山棍 | `sect_shaolin`；书剑经 `sect_nanshaolin` 共享 | 兵器／棍杖（黄上3·`neutral`） | 笑傲、侠客、鹿鼎、书剑 | 近身单体 `1.00`、120°扇形 r1 `.85`（均5% MPREF、cd0）；`weaponReq: staff`；`setTags: []` | L1；少林棍法3重 | **（原创扩展）** |

---

## 2. 南少林 `sect_nanshaolin`（书剑）

### 2.1 简介

《书剑恩仇录》写有福建南少林传承；其现实寺址究属泉州还是莆田，以及小说所写人物关系与考较细节，须按三联版相关南少林段落逐字核对（待考 K-03）。民间关于寺毁与南派拳种流衍的说法不作史实定论；本作若采用“寺火”改命支线，只能标为原创扩展并由 `chapters/12` 决定。地图位置只接 `design/11` 的 `rg_minnan_nanshaolin` 建议 ID。

- **境界**：书剑为中武（携带 2/2/2、压制 −2）。南少林是书剑唯一的少林系传承，原生最高为地阶（虎鹤双形拳、铁布衫、一指禅），天级只有书剑原生的百花错拳、庖丁解牛掌（不属本组）。
- **与嵩山的关系**：同出少林一脉；是否互计“同门残篇”仍由 `design/02` §5.4 裁定，本文不重定义。嵩山 IDs 在书剑经南少林习得时一律 `reqsOverride {sect: {id: sect_nanshaolin, rank: Ln}}`。
- **职级**：与 `design/17` §5.2 对齐，采用 §0.4 的 T01 L1–L5；L4 可改走“洪门护法”俗家支路（原创扩展），不另建第六级。

### 2.2 南少林武学总表（专属 8 门＋书剑可学的嵩山武学 19 门）

| ID | 名称 | 大类/子类 | 品阶 | 性质 | wOut/wIn | 原生书界 | 获取方式 | 出处 |
|---|---|---|---|---|---|---|---|---|
| `sk_huheshuangxingquan` | 虎鹤双形拳 | 拳脚/拳掌 | 7 地下 | 阳 | 0.65/0.35 | 书剑 | 拜(L4)罗汉堂 | 民间南派名目，原创纳入 |
| `sk_wulangbaguagun` | 五郎八卦棍 | 兵器/棍杖 | 6 玄上 | 阳 | 0.75/0.25 | 书剑 | 拜(L3) | 民间南派名棍，原创纳入 |
| `sk_tiexiangong` | 铁线功 | 内功/心法（横练） | 5 玄中 | `yang` | 0/1 | 书剑 | 拜(L3) | 民间"铁线拳"之内功化，原创扩展 |
| `sk_wuxingquan` | 五形拳 | 拳脚/拳掌 | 5 玄中 | 阳 | 0.75/0.25 | 书剑 | 拜(L3)；页 | 民间名目，原创纳入 |
| `sk_bazhandao` | 八斩刀 | 兵器/刀（双刀） | 5 玄中 | 中性 | 0.85/0.15 | 书剑 | 拜(L3) | 民间南派双刀，原创纳入 |
| `sk_hongquan` | 洪拳 | 拳脚/拳掌 | 3 黄上 | 阳 | 0.85/0.15 | 书剑 | 拜(L1)；观 | 民间南派名目，原创纳入 |
| `sk_nanshaolinqiaoshou` | 南少林桥手 | 拳脚/拳掌 | 3 黄上 | 阳 | 0.80/0.20 | 书剑 | 拜(L1) | **（原创扩展）** |
| `sk_luohanshibashou` | 罗汉十八手 | 拳脚/拳掌 | 1 黄下 | 阳 | 0.90/0.10 | 书剑 | 拜(L1) | 原创扩展（入门） |
| 嵩山共享 | 少林桩功、少林心法、童子功、**铁布衫**、**一指禅**、金刚指、少林弹腿、铁扫帚、鹰爪功、少林棍法、戒刀法、罗汉步、梅花桩、菩提子、般若心经、少林伤科、**少林长拳、少林护山棍、禅门身法** | — | 地 **2** / 玄 **7** / 黄 **10** | — | — | 书剑（经南少林） | 同 §1.4；各来源以正式 `reqsOverride {sect: {id: sect_nanshaolin, rank: Ln}, ...}` 覆写 | 见 §1 |

### 2.3 地阶条目卡

##### 虎鹤双形拳 `sk_huheshuangxingquan`（地下 7 · 拳脚·拳 · 书剑 · 原创纳入）

- **简述**：南派少林拳术，虎形练力、鹤形练精，刚柔并济（民间南拳名目；本作纳入南少林，为书剑少林系拳法顶点）。南派拳链：罗汉十八手（黄下）→ 洪拳（黄上）→ 五形拳（玄中）→ 虎鹤双形拳（地下）。
- **基本**：`yang` · 0.65/0.35 · `layerStats {parry [2,7], eva [1,8]}`（15）· moveSlots 4。
- **reqs**：`attrs {str 40, agi 40, wis 40}`、`aptitude {apFist 40}`、`prereq [{skill: sk_wuxingquan, layer: 5}]`、`sect {id: sect_nanshaolin, rank: 4}`、`hard: [sect, prereq]`。
- **层数要点**：1 猛虎出林、白鹤亮翅、虎骨｜4 虎抱头、鹤步｜6 鹤嘴啄｜7 虎鹤双形（绝）｜10 大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 Buff | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 猛虎出林 | `mv_huheshuangxingquan_hu` | 1 | `aoe_dash` n2 | 1–2 | 1.05 | 8% | 1 | 1000 | — | 可 | 1.17−0.10=1.07 |
| 白鹤亮翅 | `mv_huheshuangxingquan_he` | 1 | `aoe_self` | 0 | — | 5% | 2 | 800 | `bf_yuanzhuan` 2（自身） | — | 架势 |
| 虎抱头 | `mv_huheshuangxingquan_hubao` | 4 | `aoe_single` | 1 | 1.35 | 9% | 2 | 1100 | `bf_xuanyun` 20% 1 | 可 | 1+0.24+0.10+0.07−0.05=1.36 |
| 鹤嘴啄 | `mv_huheshuangxingquan_hezui` | 6 | `aoe_single` | 1 | 1.15（2 段） | 8% | 1 | 1000 | `bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)` 15% 1 | 可 | 1.17−0.03=1.14 |
| 虎鹤双形（绝） | `mv_huheshuangxingquan_shuangxing` | 7 | `aoe_single` | 1 | 2.85（4 段） | 9% | — | 1200 | `ultimate:true`；`rageCost:100`；`bf_xuanyun` 30% 1；`bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)` 30% 1 | 可 | 3.0−0.075−0.06=2.87；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

- **被动**：`ps_huheshuangxingquan_hugu` 虎骨（1，Z2 3%→10%）；`ps_huheshuangxingquan_hebu` 鹤步（4，施展"白鹤亮翅"后下一"虎"招 Z3 +10%）；`ps_huheshuangxingquan_dacheng` 大成（10，虎、鹤两类招式交替使用时，下一招冷却 −1）。
- **setTags**：`[]`。
- **获取**：`{master, ch12_shujian, 南少林·罗汉堂授艺岗位槽, 10}`。

### 2.4 玄阶·黄阶紧凑表（南少林专属 6 门）

| ID · 名称 · 品阶 | 性质 · 比例 · 成长 | reqs | 招式 | 被动 · 要点 |
|---|---|---|---|---|
| `sk_tiexiangong` 铁线功 · 玄中 5 | 阳 · 0/1 · 贡献 `{mp 12, hp 13, con 5, str 4, mpRegen 1.1}`（IP 12+13+18+5.5 = 48.5 ✓，横练式分配）· stats `{defOut 5, parry 5}` | `attrs {con 30, str 30}`；`sect {id: sect_nanshaolin, rank: 3}` | 铁线 `_tiexian`（1）架势·`bf_jiangu` 2·5%·cd2｜硬桥 `_yingqiao`（4）单体·1.15·7%·cd1（wOut/wIn 覆写 0.70/0.30）｜气沉 `_qichen`（7）自身·回复 10% 气血＋`bf_wenzhong` 2·7%·cd4 | `_yingma` 硬桥硬马（1，resCC +3→+10）；`_dacheng`（10，南少林拳法 Z3 +5%）。`setTags []` |
| `sk_luohanshibashou` 罗汉十八手 · 黄下 1 | 阳 · 0.90/0.10 · `{parry [1,3], hit [1,3]}` | 无 | 起手 `_qishou`（1）单体·0.90·4%·cd0·收招 950｜连手 `_lianshou`（4）单体·1.10（2 段）·5%·cd1 | `_yuanman`（10，学洪拳资质软门槛 −10） |
| `sk_hongquan` 洪拳 · 黄上 3 | 阳 · 0.85/0.15 · `{defOut [1,3], hit [1,3]}` | `sect {id: sect_nanshaolin, rank: 1}` | 工字伏虎 `_gongzi`（1）单体·1.15·6%·cd1｜桥手 `_qiaoshou`（4）架势·`bf_shoushi` 2·5%·cd2｜洪家冲拳 `_chongquan`（7）单体·1.30·6%·cd2 | `_mabu` 马步（5，resCC +3）。`setTags []` |
| `sk_wuxingquan` 五形拳 · 玄中 5 | 阳 · 0.75/0.25 · `{eva [1,5], parry [1,5]}` | `prereq [{skill: sk_hongquan, layer: 4}]`；`sect {id: sect_nanshaolin, rank: 3}` | 虎形 `_hu`（1）单体·1.15·7%·cd1｜鹤形 `_he`（2）架势·`bf_youshi` 2·5%·cd2｜豹形 `_bao`（4）`aoe_dash` n3·1.05·7%·cd1｜蛇形 `_she`（6）单体·1.13·7%·cd1·`bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)` 20%｜龙形 `_long`（8）`aoe_cone {angle:120,r:1,dirCount:6}`·1.10·8%·cd2 | `_lunzhuan` 五形轮转（1，连续使用不同"形"时第二招 Z3 +5%）；`_dacheng`（10，Z3 +5%）。`setTags []` |
| `sk_wulangbaguagun` 五郎八卦棍 · 玄上 6 | 阳 · 0.75/0.25 · `weaponReq {staff, altCategories {spear ×0.9}}` · `{parry [1,5], hit [1,5]}` | `prereq [{skill: sk_shaolingunfa, layer: 4}]`；`sect {id: sect_nanshaolin, rank: 3}` | 八卦 `_bagua`（1）`aoe_around`·0.85·8%·cd2｜点戳 `_dianchuo`（1）单体·1–2·1.15·7%·cd1｜封门 `_fengmen`（4）架势·`bf_jieji` 2·5%·cd2｜**五郎破阵（绝）** `_pozhen`（7）`aoe_line` n3·1.75·8%·气势100·收招1200·`ultimate:true`·击退 1（`3.00×0.70×0.85−0.05=1.735≈1.75`） | `_qianggun` 枪棍合一（1，可持枪施展，×0.9）；`_dacheng`（10）。民间传说杨五郎出家所创（传说，非金庸原著）；绝招化为本作机制化（原创扩展）。`setTags []`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |
| `sk_bazhandao` 八斩刀 · 玄中 5 | 中性 · 0.85/0.15 · `weaponReq {blade, dual: true}` · `{combo [1,5], parry [1,5]}` | `sect {id: sect_nanshaolin, rank: 3}` | 斩 `_zhan`（1）单体·1.00（2 段）·6%·cd0｜滚手 `_gunshou`（3）架势·`bf_yuanzhuan` 2·5%·cd2｜八斩连环 `_lianhuan`（6）`aoe_multi` n8 r1·1.15（8 段）·8%·cd2 | `_shuangdao` 双刀（1，副手持刀时 combo +3）；`_dacheng`（10）。`setTags []` |

### 2.5 黄阶一行总表（南少林专属 3 门）

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或（原创扩展） |
|---|---|---|---|---|---|---|---|
| `sk_luohanshibashou` | 罗汉十八手 | `sect_nanshaolin`／罗汉堂 | 拳脚／拳掌（黄下1·`yang`） | 书剑 | 单体起手与两段连手；`setTags: []` | L1；无武学前置 | **（原创扩展）** |
| `sk_hongquan` | 洪拳 | `sect_nanshaolin`／山门传授 | 拳脚／拳掌（黄上3·`yang`） | 书剑 | 单体、守势与冲拳；`setTags: []` | L1；罗汉十八手4重 | 民间南派名目，**（原创扩展）**纳入 |
| `sk_nanshaolinqiaoshou` | 南少林桥手 | `sect_nanshaolin`／山门传授 | 拳脚／拳掌（黄上3·`yang`） | 书剑 | 近身单体 `1.00`（5% MPREF、cd0）与招架成长；`setTags: []` | L1；罗汉十八手3重 | **（原创扩展）** |

---

## 3. 旁支、叛僧与敌人专用

### 3.1 西域金刚门（倚天，敌对）

《倚天屠龙记》中少林火工头陀叛寺后远赴西域，其后传人阿二、阿三为汝阳王府效力，阿三以大力金刚指重创俞岱岩四肢（原著；具体地域与师承层级待考 K-09）。本组不另立武学：金刚门 NPC 使用 `sk_dalijingangzhi`（地中），玩家可在交手中观摩（§1.6.3）。按 C14／`design/17` §3.3，**不启用** `sect_jingangmen`；武学数据以自由文本 `lineage: 火工头陀 → 西域金刚门 → 阿二、阿三` 表达传承，不创建伪 ID。

### 3.2 叛僧成昆（圆真）：幻阴指

##### 幻阴指 `sk_huanyinzhi`（地中 8 · 拳脚·指 · 倚天 · 原著）

- **简述**：《倚天屠龙记》中成昆化名圆真潜伏少林，于光明顶以幻阴指暗袭明教众人，中指者受阴寒指力所制，后由张无忌以九阳神功化解（原著）。被袭者名单与先后次序待考 K-08；本作据其阴毒偷袭定位设置邪派门槛。
- **基本**：`sect: null`、`lineage: 叛僧成昆（圆真）`（少林旁出，不属少林门派传承）· `yin` · 0.20/0.80 · `layerStats {crit [2,8], seal [1,7]}`（15）· moveSlots 4；招式 `tags [cold]`；`observable: false`。
- **reqs**：`attrs {wis 45, agi 40}`、`aptitude {apFinger 45}`、`morality {max -20}`、`hard: [morality]`。**不属七十二绝技**（无 `liqi`）。
- **层数要点**：1 幻阴、暗袭、阴寒｜4 寒劲入脉、潜形｜6 幻影｜7 幻阴无相（第一绝招）｜10 大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 附带 Buff | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 幻阴 | `mv_huanyinzhi_huanyin` | 1 | `aoe_single` | 1 | 1.10 | 8% | 1 | `bf_hanqi` 50% 1 层 | 可 | 1.17−0.05=1.12 |
| 暗袭 | `mv_huanyinzhi_anxi` | 1 | `aoe_behind` r3 | 1–3 | 0.95 | 8% | 2 | `bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)` 30% 1 | 可 | 0.90×1.29−0.15−0.06=0.95 |
| 寒劲入脉 | `mv_huanyinzhi_hanjin` | 4 | `aoe_single` | 1 | 1.15 | 9% | 2 | `ultimate:false`；`recovery:1000`；`bf_hanqi` 100% 2 层；`bf_mabi` 30% 2 | 可 | 普通招：`1.34−0.10−0.25×0.30=1.165≈1.15`；`MoveDef{unlock:4; ultimate:false; mpCost:9%; cd:2; recovery:1000}` |
| 幻影 | `mv_huanyinzhi_huanying` | 6 | `aoe_self` | 0 | — | 7% | 4 | `bf_yinshen` 1（自身） | — | 支援（`kind: support`） |
| 幻阴无相（绝） | `mv_huanyinzhi_wuxiang` | 7 | `aoe_single` | 1 | 2.65 | 9% | — | `ultimate:true`；气势 100；`recovery:1200`；`bf_mabi` 100% 2；`bf_hanqi` 100% 3 层 | 可 | 3.0−0.25−0.10；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

- **被动**：`ps_huanyinzhi_yinhan` 阴寒（1，Z2 无视内劲防御 4%→10%）；`ps_huanyinzhi_qianxing` 潜形（4，trigger `battleStart`，`bf_xianji`）；`ps_huanyinzhi_dacheng` 大成（10，对 `bf_hanqi` ≥ 3 层的目标 Z3 +12%）。
- **AR-16 外放字段**：`mv_huanyinzhi_anxi` 为阴寒指力隔空暗袭，`MoveDef{projection:true; range:{min:1,max:3}; aoe:{tpl:aoe_behind,r:3}; projectionSpreadSteps:[{tpl:aoe_behind,r:3},{tpl:aoe_behind,r:3},{tpl:aoe_behind,r:3}]; meridianRouteRef:mfr_huanyinzhi_anxi}`；全部伤害段 `DamageKind='projected'`。其余伤害招射程 1，按接触指力不标；幻影为纯支援。
- **conflicts**：`{with: sk_jiuyang, type: counter, note: 九阳寒毒不侵}`、`{with: sk_shaolinjiuyang, type: counter, note: 寒毒难侵（半效）}`。**setTags**：`[]`。
- **获取**：`{qiyu, ch04_yitian, q_04_qiyu_83, 10, note: "圆真遗册"——成昆伏诛后于少林后山所得（原创扩展）；习得 morality −10}`。成昆本人为 Boss；混元霹雳手只作为其江湖称号与 Boss 表现接口，不在本文新增同名武学。

### 3.3 敌人专用与 Boss 版（不计入 74 门）

| ID / 用法 | 名称 | 使用者 | 规则要点 |
|---|---|---|---|
| `sk_shibaluohanzhen`（`enemyOnly: true`） | 十八罗汉大阵 | 天龙少林罗汉堂、鹿鼎护送韦小宝的十八罗汉 | 18 人整阵为 Boss 机制（09）：阵眼轮换、合击、阵破则群体失衡；玩家可学的缩小版为 `sk_luohanzhen`（3–6 人） |
| `sk_jingangfumoquan` Boss 配置 | 金刚伏魔圈（三渡版） | 倚天渡厄、渡劫、渡难 | 同 ID，Boss 画像（06 §11.4）：阵员位置固定于三松，圈内持续缠绕；以"闯圈"作为金刚不坏体与本武学的学习事件 |

### 3.4 五台山清凉寺（少林下院）

《天龙八部》中神山上人为五台山清凉寺方丈，其与少林的论武关系及具体武学待考 K-12；《鹿鼎记》中顺治出家后法名行痴，韦小宝以少林法名“晦明”任清凉寺住持（原著）。本作把清凉寺作为鹿鼎少林武学的**第二传授点**（伏魔杖法、韦陀降魔杵、罗汉阵、铁布衫），并承载护送行痴的战斗事件（原创扩展，归 `chapters/08`）。

---

## 4. 套装候选（已由 `design/07` 收敛）

### 4.1 本组保留套装（5 个）

> 效果、品阶与逐书界路径只在 `design/07` §9 定义；本节仅保留图鉴侧成员索引。

| ID | 成员 | 收敛结论 |
|---|---|---|
| `set_shaolin_jingang` | `sk_longzhaoshou`、`sk_yijinjing`、`sk_tieshazhang`、`sk_tongrenhenglian` | 保留；用户示例与跨品阶金标准 |
| `set_shaolin_luohan` | `sk_luohanquan`、`sk_shaolinzhuanggong`、`sk_shaolinxinfa`、`sk_shaolingunfa`、`sk_luohanbu` | 保留；少林入门构筑 |
| `set_shaolin_damo` | `sk_yijinjing`、`sk_xisuijing`、`sk_damoxinjing`、`sk_damojianfa`、`sk_yiweidujiang` | 保留；达摩传承主题 |
| `set_saodiseng` | `sk_yijinjing`、`sk_boruoxinjing`、`sk_xumishanzhang`、`sk_nianhuazhi` | 保留；藏经阁人物主题 |
| `set_fangzheng` | `sk_yijinjing`、`sk_qianshourulaizhang`、`sk_yizhichan`、`sk_jinzhongzhao` | 保留；笑傲人物主题 |

### 4.2 跨组正式成员

`sk_wuxiangjiezhi`、`sk_duoluoyezhi`、`sk_ranmudaofa`、`sk_jiashafumogong` 归 `set_mizong_mingwang`；`sk_shizihou` 归 `set_mingjiao_sida_fawang`。完整成员与效果分别见 `design/07` §12.4、§13.5。

### 4.3 删除与合并去向

`legacy-set:shaolin_henglian`、`legacy-set:shaolin_banruo`、`legacy-set:shaolin_gunseng`、`legacy-set:sandu`、`legacy-set:chengguan`、`legacy-set:nanshaolin_hongmen` 不进入首发：主题重叠、装配类别拥挤或只在单一地点成立；可辨识成员分别并入上述五套或跨组人物套，其余成员 `setTags: []`。完整收敛理由见 `design/07` §19。

---

## 5. 本组统计（合计 74 门；另敌人专用 1 门不计）

### 5.1 门派 × 品阶（12 级）

| 门派 | 黄下1 | 黄中2 | 黄上3 | 玄下4 | 玄中5 | 玄上6 | 地下7 | 地中8 | 地上9 | 天下10 | 天中11 | 天上12 | 合计 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 少林（嵩山） | 2 | 6 | 7 | 6 | 8 | 9 | 7 | 9 | 8 | 2 | 0 | 1 | **65** |
| 旁支（叛僧成昆：幻阴指） | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | **1** |
| 南少林 | 1 | 0 | 2 | 0 | 3 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | **8** |
| **合计** | 3 | 6 | 9 | 6 | 11 | 10 | 8 | 10 | 8 | 2 | 0 | 1 | **74** |
| 大阶小计 | 黄 **18**（24.32%） | | | 玄 **27**（36.49%） | | | 地 **26**（35.14%） | | | 天 **3**（4.05%） | | | |
| **AR-16 外放招式** | 0 | 0 | 0 | 1 | 0 | 0 | 9 | 3 | 10 | 0 | 0 | 0 | **23** |

> AR-16 外放按武学品阶汇总为：天 0、地 22、玄 1、黄 0、合计 23。`mv_boruozhang_kongxiang`、`mv_boruozhang_boluomi`、`mv_dalijingangzhi_chuanshi`、`mv_jingangzhi_chuanshi`、`mv_ranmudaofa_fenxiang`、`mv_shaolinjiuyang_chunyang`、`mv_xumishanzhang_yading` 资料不足，单列待考且不计入外放数。

#### AR-16 外放候选审计表

本表是 `tech/04` 构建 `projection-coverage.json` 的图鉴输入之一；结论按 `moveId` 排序。“已审不标”覆盖容易由远程、招名或旧表现误判的候选，不表示省略了未审计招式。

| `moveId` | 结论 | 依据 | 所在位置 |
|---|---|---|---|
| `mv_boruozhang_boluomi` | 待考 | 远程范围掌招，但现文没有离体掌力证据 | §1.6.2 般若掌 |
| `mv_boruozhang_kongxiang` | 待考 | 远程直线只证明几何，不足以证明真气离体 | §1.6.2 般若掌 |
| `mv_dajingangzhang_cuishan` | 已审不标 `not_projected` | 近身推山，线形不等于外放 | §1.6.2 大金刚掌 |
| `mv_dajingangzhang_moyun` | 已标 `projected` | 卡内明确为掌风 | §1.6.2 大金刚掌 |
| `mv_dalijingangzhi_chuanshi` | 待考 | 贯穿和 1–2 格射程不能单独证明离体指力 | §1.6.3 大力金刚指 |
| `mv_duoluoyezhi_beiye` | 已标 `projected` | 多罗叶指卡明确为离体指力 | §1.6.3 多罗叶指 |
| `mv_duoluoyezhi_jingye` | 已标 `projected` | 同上；放射形指力 | §1.6.3 多罗叶指 |
| `mv_duoluoyezhi_luanye` | 已标 `projected` | 同上；连锁指力 | §1.6.3 多罗叶指 |
| `mv_duoluoyezhi_mantian` | 已标 `projected` | 同上；范围指力 | §1.6.3 多罗叶指 |
| `mv_duoluoyezhi_yeluo` | 已标 `projected` | 同上；多目标指力 | §1.6.3 多罗叶指 |
| `mv_huanyinzhi_anxi` | 已标 `projected` | 阴寒指力隔空暗袭 | §3.2 幻阴指 |
| `mv_jingangzhi_chuanshi` | 待考 | 招名与贯穿表现不足以证明离体 | §1.7.2 金刚指 |
| `mv_jingangzhi_zhili` | 已标 `projected` | 明列指力且基础射程 1–2 | §1.7.2 金刚指 |
| `mv_mohezhi_dazhi` | 已标 `projected` | 远程摩诃指力 | §1.6.3 摩诃指 |
| `mv_mohezhi_poqi` | 已标 `projected` | 远程破气指力 | §1.6.3 摩诃指 |
| `mv_mohezhi_wuliang` | 已标 `projected` | 离体指力连锁 | §1.6.3 摩诃指 |
| `mv_nianhuazhi_jiaye` | 已标 `projected` | 作者决定（2026-09-28）；卡内明确阴柔无形指力 | §1.6.3 拈花指 |
| `mv_nianhuazhi_nianhua` | 已标 `projected` | 作者决定（2026-09-28）；单体离体指力 | §1.6.3 拈花指 |
| `mv_nianhuazhi_sanhua` | 已标 `projected` | 作者决定（2026-09-28）；放射形离体指力 | §1.6.3 拈花指 |
| `mv_nianhuazhi_weixiao` | 已审不标 `not_projected` | 作者决定（2026-09-28）；拈花指整门判外放，但本招为纯增益架势（自身 `bf_yuanzhuan`），不造成任何伤害，按例外不标 | §1.6.3 拈花指 |
| `mv_nianhuazhi_wuxing` | 已标 `projected` | 作者决定（2026-09-28）；无形离体指力 | §1.6.3 拈花指 |
| `mv_ranmudaofa_fenxiang` | 待考 | 远线但没有刀气／刀罡证据 | §1.6.5 燃木刀法 |
| `mv_ranmudaofa_liaoyuan` | 已标 `projected` | 招名与正文明确刀气 | §1.6.5 燃木刀法 |
| `mv_shaolinjiuyang_chunyang` | 待考 | 1–2 格内劲招，未说明离体伤害 | §1.6.1 少林九阳功 |
| `mv_shizihou_juyin` | 已审不标 `not_projected` | 音功远程，不属于 AR-16 外放 | §1.5.3 狮子吼 |
| `mv_wuxiangjiezhi_jiehuo` | 已标 `projected` | 卡内明确无形离体指力 | §1.6.3 无相劫指 |
| `mv_wuxiangjiezhi_jiejin` | 已标 `projected` | 同上；范围离体指力 | §1.6.3 无相劫指 |
| `mv_wuxiangjiezhi_kongjie` | 已标 `projected` | 同上；直线离体指力 | §1.6.3 无相劫指 |
| `mv_wuxiangjiezhi_wuxiang` | 已标 `projected` | 同上；单体离体指力 | §1.6.3 无相劫指 |
| `mv_wuxiangjiezhi_wuxiangjie` | 已标 `projected` | 同上；无形离体指力 | §1.6.3 无相劫指 |
| `mv_xumishanzhang_yading` | 待考 | 远程压顶但没有离体掌力证据 | §1.6.2 须弥山掌 |
| `mv_yizhichan_qiankun` | 已标 `projected` | 本门明示“指力外放” | §1.6.3 一指禅 |
| `mv_yizhichan_yizhi` | 已标 `projected` | 同上；远程单体指力 | §1.6.3 一指禅 |

> 天级 3 门与基准 §13 完全一致（易筋经天上、金刚不坏体天下、狮子吼天下）；其余 71 门均为地/玄/黄。相对单册名义 `3/9/27/27`，地／天为 `26÷3=8.667`，相对目标 3 偏差 `+188.89%`；玄／天为 `27÷3=9`，偏差 `0%`；黄／天为 `18÷3=6`，相对目标 9 偏差 `−33.33%`。偏差来自既有 26 门地阶只增不减与全目录总闸；本轮已精确命中 `design/05` §14.5 的受控目标 `3/26/27/18`，不能再补到单册 `3/9/27/27`。七十二绝技仍为 **21 门**。
>
> 统一裁定后：天上 1 门 3 记、天下 2 门各 2 记，共 **7**；地上 8 门各 2 记、地中为 9 门各 1 记与龙爪手 1 门 2 记、地下 8 门各 1 记，共 **35**；玄上 10 门各 1 记，共 **10**。统一前对应为 `7 / 44 / 10`，本轮净减 9 个 `ultimate:true`，全部降为普通招，未删除或新增招式 ID。

#### 天中／地中绝招区间逐门取值

本册无天中；地中按统一裁定取 1–2 记，不为凑数新增招名。

| 武学 | 品阶 | 绝招数 | 取值理由 |
|---|---:|---:|---|
| 金钟罩 | 地中 8 | 1 | 横练护体靠功力，无原著多式；保留“金钟不破” |
| 少林九阳功 | 地中 8 | 1 | 内功分支有名但不是多招体系；保留“九阳周天” |
| 般若掌 | 地中 8 | 1 | 攻援兼有但无原著多式证据；保留“般若波罗蜜” |
| 韦陀杵 | 地中 8 | 1 | 单一刚猛劲力；保留最具代表性的“大韦陀杵” |
| 大力金刚指 | 地中 8 | 1 | 以刚猛指力取胜；保留“金刚碎骨” |
| 一指禅 | 地中 8 | 1 | 考据未闭合，不用原创招名取上限；保留“一指定乾坤” |
| 龙爪手 | 地中 8 | 2 | 三十六式连攻与捣虚式擒拿封穴分工 |
| 伏魔杖法 | 地中 8 | 1 | 现有招名主要为扩写；保留“降魔禅杖” |
| 袈裟伏魔功 | 地中 8 | 1 | 器用精巧但原著分式不足；保留“袈裟伏魔” |
| 幻阴指 | 地中 8 | 1 | 核心仍是一类阴寒指力；保留“幻阴无相” |

### 5.2 按类别（大类/子类 × 大阶：天/地/玄/黄）

| 大类 | 子类 | 天 | 地 | 玄 | 黄 | 合计 |
|---|---|---|---|---|---|---|
| 内功 | 心法（含横练 4 门） | 2 | 4 | 4 | 2 | **12** |
| 拳脚 | 拳掌 | 0 | 7 | 5 | 7 | 19 |
| | 指法 | 0 | 7 | 1 | 0 | 8 |
| | 腿法 | 0 | 1 | 1 | 1 | 3 |
| | 擒拿/爪 | 0 | 1 | 1 | 1 | 3 |
| | 小计 | 0 | 16 | 8 | 9 | **33** |
| 兵器 | 棍杖 | 0 | 1 | 3 | 2 | 6 |
| | 刀 | 0 | 1 | 2 | 1 | 4 |
| | 剑 | 0 | 1 | 1 | 1 | 3 |
| | 奇门（袈裟、杵） | 0 | 1 | 1 | 0 | 2 |
| | 鞭索 | 0 | 0 | 1 | 0 | 1 |
| | 小计 | 0 | 4 | 8 | 4 | **16** |
| 轻功 | | 0 | 1 | 2 | 2 | **5** |
| 暗器 | | 0 | 0 | 1 | 1 | **2** |
| 杂学 | 音功 2、阵法 2、医 1、心神 1 | 1 | 1 | 4 | 0 | **6** |
| **合计** | | **3** | **26** | **27** | **18** | **74** |

### 5.3 按原生书界（可学池 = 该书界原生的本组武学；一门可属多书界）

| 书界 | 境界 | 可学池 | 天/地/玄/黄 | 内功/拳脚/兵器/轻功/暗器/杂学 | 同类兵器最多 | 七十二绝技 | 首现（天/地/玄/黄） |
|---|---|---|---|---|---|---|---|
| 天龙 | 高 | 44 | 1/19/13/11 | 7/21/9/3/1/3 | 棍 3、刀 3 | 19 | 1/19/13/11 = 44 |
| 射雕 | 高 | 9 | 1/0/1/7 | 3/3/1/1/0/1 | 棍 1 | 0 | 0/0/0/0 = 0 |
| 神雕 | 高 | 9 | 0/0/2/7 | 3/3/1/1/0/1 | 棍 1 | 0 | 0/0/0/0 = 0 |
| 倚天 | 高 | **23** | **3/6/8/6** | **6/9/2/2/0/4** | 棍 1、鞭索 1 | **3** | 2/3/2/0 = 7 |
| 笑傲 | 中 | 39 | 1/7/17/14 | 6/15/9/4/2/3 | 剑 3 | 7 | 0/2/7/4 = 13 |
| 侠客 | 中 | 25 | 0/5/9/11 | 4/12/5/3/0/1 | 棍 3 | 4 | 0/1/0/0 = 1 |
| 鹿鼎 | 低 | 39 | 0/5/20/14 | 6/15/8/4/2/4 | **棍 5** | 4 | 0/0/1/0 = 1 |
| 书剑（南少林） | 中 | 27 | 0/3/11/13 | 5/11/5/3/1/2 | 棍 3、刀 2 | 2 | 0/1/4/3 = 8 |

- **装配栏可填性**（05 §14.6-4、基准 §20）：少林组自身的侠客、书剑棍杖已由新增护山棍补到 3 门；倚天少林白名单仍只有棍 1、鞭索 1，射雕／神雕也不够 3 门同类兵器。十四界最终均由 `skills-general` §11.1 的 `ALL14` 三类底座补齐，逐界核对见 §5.5。低武鹿鼎在“1/1/1 携带”下仍可凭本土少林武学满配，且有 3 个可本土成套的套装（§4.3 注）。
- **七十二绝技逐代投放**（02 §5.7）：天龙 19 → 倚天 **3**（般若掌、大力金刚指、龙爪手）→ 笑傲 7 → 侠客 4 → 鹿鼎 4 → 书剑 2（南少林）；射雕/神雕为“背景存在”不开放绝技。倚天下降来自 C14 白名单，不表示寺藏在原著世界中只余三门。
- 射雕/神雕刻意只放有限入门内容（避免与五绝体系争夺主线资源）；按 P49，只有射雕另保留易筋经完整学习线，神雕不新增该线；两书界的少林玩家以携带为主。

### 5.4 预算口径说明与黄阶整体核对

- **现行口径**：本文所有新条目统一采用 `design/05` §4.2：Buff 成本只按“单位效果成本 × 基础施加率”扣一次，**不乘持续回合**；位移成本另按 `cost_disp` 扣除。对照协调备注 CN-01，本图鉴没有沿用“Buff 成本 × 持续回合”的旧口径，需交 F2 重算的旧口径条目清单为：**空集**。
- **黄阶攻击模板**：少林长拳与南少林桥手的近身单体均为“5% MPREF、cd0、收招1000、可招架、无附带”，故 `power=AF(1)×(1+0)×1×1=1.00`；少林长拳线2为 `AF(2)=0.90`，故 `power=0.90`；护山棍 120° 扇形 r1 最大命中 3 格，故 `power=AF(3)=0.85`。三门均不附 Buff、无位移，显示值与公式值完全一致。
- **黄阶轻功模板**：禅门身法为黄中，`Q_skill=QS(2)=38`（`design/03` §4.5），仅移动 1 格并提供守中站位，不造成伤害、不施加 Buff，`power=0`；不与攻击倍率混算。
- **既有黄阶**：14 门既有条目保留 §1.7／§2.4 的原核算；本轮只将其转录为八字段一行索引，不改招式数值。故本轮新增 4 门中，攻击模板 3 门、支援／移动模板 1 门，整体预算覆盖率 `4/4=100%`。

### 5.5 境界覆盖与装配可行性

`design/05` §14.6-4 要求每个正式书界存在可同时获得、前置闭合且非互斥的本土内功、拳脚、兵器各至少 3 门，兵器还须有 3 门同一子类。少林本组不能也不应独自为所有书界重复造基础武学；最终证明引用 `skills-general` §11.1 的 `ALL14` 通行底座。`ALL14` 必须在落库时展开为十四个 `chapterId`，不是新 ID。下表的“通过”是目录与候选来源层面的静态结论；实际非互斥、取得时点与前置可达性尚须章节落地验证。

| 书界（境界） | 本土内功 ≥3 | 本土拳脚 ≥3 | 本土同类兵器 ≥3 | 校核 |
|---|---|---|---|---|
| 天龙（高） | 军旅吐纳、武馆心法、江湖吐纳 | 通背劲、弹腿（通行）、短打手 | 江湖入门剑→清风剑→江湖百战剑 | ✅ 目录层面；高武携带 3/3/3，零携带压力测试亦可补满 |
| 射雕（高） | 同上 `ALL14` 三门 | 同上 `ALL14` 三门 | 同上通行剑链三门 | ✅ 目录层面；少林本组兵器不足由通行池补位 |
| 神雕（高） | 同上 `ALL14` 三门 | 同上 `ALL14` 三门 | 同上通行剑链三门 | ✅ 目录层面；少林本组兵器不足由通行池补位 |
| 倚天（高） | 同上 `ALL14` 三门 | 同上 `ALL14` 三门 | 同上通行剑链三门 | ✅ 目录层面；不扩写 C14 的 23 门少林白名单 |
| 笑傲（中） | 同上 `ALL14` 三门 | 同上 `ALL14` 三门 | 同上通行剑链三门 | ✅ 目录层面；2/2/2 携带后仍能补满 |
| 侠客（中） | 同上 `ALL14` 三门 | 同上 `ALL14` 三门 | 同上通行剑链三门 | ✅ 目录层面；少林组另有 3 门本土棍杖 |
| 碧血（中） | 同上 `ALL14` 三门 | 同上 `ALL14` 三门 | 同上通行剑链三门 | ✅ 目录层面 |
| 鹿鼎（低） | 同上 `ALL14` 三门 | 同上 `ALL14` 三门 | 同上通行剑链三门 | ✅ 目录层面；1/1/1 携带后仍能补满，少林组另有 5 门本土棍杖 |
| 连城（低） | 同上 `ALL14` 三门 | 同上 `ALL14` 三门 | 同上通行剑链三门 | ✅ 目录层面 |
| 白马（低） | 同上 `ALL14` 三门 | 同上 `ALL14` 三门 | 同上通行剑链三门 | ✅ 目录层面 |
| 鸳鸯（低） | 同上 `ALL14` 三门 | 同上 `ALL14` 三门 | 同上通行剑链三门 | ✅ 目录层面 |
| 书剑（中） | 同上 `ALL14` 三门 | 同上 `ALL14` 三门 | 同上通行剑链三门 | ✅ 目录层面；少林组另有 3 门本土棍杖 |
| 飞狐（中） | 同上 `ALL14` 三门 | 同上 `ALL14` 三门 | 同上通行剑链三门 | ✅ 目录层面 |
| 雪山（中） | 同上 `ALL14` 三门 | 同上 `ALL14` 三门 | 同上通行剑链三门 | ✅ 目录层面 |

通行底座的闭合链为：内功 `sk_jundituna`（无前置）、`sk_zhamabu → sk_wuguanxinfa`、`sk_tunaqianjue → sk_jianghutuna`；拳脚 `sk_changquanrumen → sk_tongbeijin`、`sk_tantuirumen → sk_tantui_tongxing`、`sk_changquanrumen → sk_duandashou`；同类剑 `sk_jianghurumenjian → sk_qingfengjian → sk_jianghubaizhanjian`。链上 ID 均在 `skills-general` 标为 `ALL14`。表中“✅”只证明图鉴目录及候选原生来源充足；若章节把三条来源做成互斥或后置，仍须由对应 `chapters/*` 修正。

### 5.6 十四书界可习得池比例校核

按 `design/05` §14.4 的全部路线唯一 ID 并集，将本轮 `sourceChapters` 增量叠加到 C3 快照：笑傲、侠客、鹿鼎各 `+0/0/0/3`，书剑 `+0/0/0/4`；其余十界不变。以下百分数均以未舍入分数验收。

| 书界 | 境界 | 更新后 天/地/玄/黄 = 合计 | 占比（%） | 目标占比（天/地/玄/黄） | 结论 |
|---|---|---:|---:|---:|---|
| 天龙 | 高 | 14/45/88/93 = 240 | 5.83/18.75/36.67/38.75 | 10–15/20–25/30–35/30–35 | ⚠️ 未通过 |
| 射雕 | 高 | 15/32/74/79 = 200 | 7.50/16.00/37.00/39.50 | 同上 | ⚠️ 未通过 |
| 神雕 | 高 | 16/38/90/84 = 228 | 7.02/16.67/39.47/36.84 | 同上 | ⚠️ 未通过 |
| 倚天 | 高 | 12/39/98/104 = 253 | 4.74/15.42/38.74/41.11 | 同上 | ⚠️ 未通过 |
| 笑傲 | 中 | 5/41/116/115 = 277 | 1.81/14.80/41.88/41.52 | 2–6/15–20/33–38/38–45 | ⚠️ 未通过 |
| 侠客 | 中 | 2/28/89/93 = 212 | 0.94/13.21/41.98/43.87 | 同上 | ⚠️ 未通过 |
| 碧血 | 中 | 2/26/79/84 = 191 | 1.05/13.61/41.36/43.98 | 同上 | ⚠️ 未通过 |
| 鹿鼎 | 低 | 1/24/93/96 = 214 | 0.47/11.21/43.46/44.86 | 0–5/8–12/33–38/48–55 | ⚠️ 未通过 |
| 连城 | 低 | 1/15/62/68 = 146 | 0.68/10.27/42.47/46.58 | 同上 | ⚠️ 未通过 |
| 白马 | 低 | 0/9/59/63 = 131 | 0.00/6.87/45.04/48.09 | 同上 | ⚠️ 未通过 |
| 鸳鸯 | 低 | 0/11/61/69 = 141 | 0.00/7.80/43.26/48.94 | 同上 | ⚠️ 未通过 |
| 书剑 | 中 | 2/26/82/85 = 195 | 1.03/13.33/42.05/43.59 | 2–6/15–20/33–38/38–45 | ⚠️ 未通过 |
| 飞狐 | 中 | 1/24/82/87 = 194 | 0.52/12.37/42.27/44.85 | 同上 | ⚠️ 未通过 |
| 雪山 | 中 | 1/18/65/69 = 153 | 0.65/11.76/42.48/45.10 | 同上 | ⚠️ 未通过 |

本轮只拥有少林图鉴写权限，不能通过删改其他图鉴来源来强行修表。故如实保留十四界均未完整命中的结论：由 F2／章节在四册 CX 扩充完成后统一重算并重配来源；不得新增天阶、删除 ID，亦不得把外来携带误算成本土。

---

### 5.7 AR-14 经脉运行绑定（`design/21` v2.0）

#### 5.7.1 边界、字段与展开约定

本节只把本册既有武学与招式绑定到 `design/21` 的运行接口，不复制河流公式、独立乘区或结算规则。`MoveDef.meridianRouteRef` 引用 `MeridianRouteDef`；被动触发路线用 `routeOnTriggerRef`；内功调息引用 `BreathProfile`。战斗仍按 `Z0–Z4 → Z4M → Z5 → Z5M → Z6–Z10 → 护体真气 → 护体内劲 → mpGuard → 气血`，每个我方、敌方独立行动单位各持一个 `MeridianFlowModule`，`preview` 不写状态也不耗 RNG（均见 21 §4.4、§11–§12）。
落库字段严格复用 21 §12：`MeridianRouteDef.id/moveRef/ultimate/purpose/requiredNature/steps`，其中 `RouteStep.acupointRef/segmentCt/riskBp`；`BreathProfile.id/grade/layer/nature/scope/ct/mpCostBp/outOfBattleScaleBp`。

- 具体路线 ID 采用 `mfr_<完整 move ID 去掉 mv_>`；调息档案采用 `txp_<完整 skill ID 去掉 sk_>`。两前缀仍是 21 §16.2 / M2-P01 的**拟登记前缀**，不是本文越权登记。
- 表内 `AT/DF/MV` 分别展开为 `purpose:attack/defense/movement`；`Y/I/H` 为阳 / 阴 / 调和路线。中性武学使用调和几何但 `requiredNature:[yin,yang,harmony]`，不虚构 `neutral` 内力性质。
- 表内 `true/false` 显式镜像现有 `MoveDef.ultimate`；`route.ultimate` 必须与之相等。支援、治疗、布阵的路线用于运行与时间成本，不把攻击乘区套到治疗或原有效果。
- `innerGuard:{enabled:true,reflectBp:0}` 只挂于表中 `IG` 的护体防线；运行值由实际 `MeridianProfile` 计算。“护体档”只是 UI 档位，不增乘区。已有 `bf_fanzhen` 仍归 06，故路线反震固定 0，避免双算。
- 天 / 地阶全部逐招显式登记；玄上绝招也在 §5.7.5 逐招显式登记。其余玄 / 黄阶每个现有伤害招、架势 / 护体招、轻功招按确定性模板展开唯一 `mfr_<move>`；纯探索 / 对话动作不强制战斗路线。旧内容缺引用时仅可用 21 §4.6 的 2 段迁移短路，正式发布前必须写回稳定引用。

#### 5.7.2 本册路线模板（排版码，不是 ID）

以下穴位均已在 `design/15` 登记；数组顺序即 `steps` 顺序，每项写作 `穴位/segmentCt/riskBp`。同一模板可生成多个独立 `mfr_*`，但正式数据必须展开，不把模板码传给 Core。

| 码 | `purpose` / `requiredNature` | `steps`（依次） | ΣCT | 适用 |
|---|---|---|---:|---|
| `AT-Y4` | attack / `[yang,harmony]` | `ap_shouyangming_quchi/70/80 → ap_shouyangming_shousanli/70/100 → ap_shouyangming_hegu/70/120 → ap_shouyangming_shangyang/70/140` | 280 | 阳性短攻 |
| `AT-Y6` | attack / `[yang,harmony]` | `ap_dumai_mingmen/70/80 → ap_dumai_zhiyang/70/100 → ap_dumai_shendao/70/120 → ap_dumai_baihui/70/140 → ap_shouyangming_quchi/70/350 → ap_shouyangming_hegu/70/150` | 420 | 阳性换脉攻 |
| `AT-Y8` | attack / `[yang,harmony]` | 督脉 B 四穴后接手阳明 E 四穴；CT 均 70，风险 `80/100/120/140/400/100/120/140` | 560 | 阳性地阶重招 |
| `U-Y8` | attack / `[yang,harmony]` | `ap_dumai_mingmen→ap_dumai_zhiyang→ap_dumai_shendao→ap_dumai_baihui→ap_shouyangming_quchi→ap_shouyangming_shousanli→ap_shouyangming_hegu→ap_shouyangming_shangyang`；CT 均 90，风险 `100/150/180/250/350/180/150/120` | 720 | 阳性地阶绝招；防守 / 移动沿用同骨架但改 `purpose` |
| `U-Y10` | attack / `[yang,harmony]` | `ap_renmai_qihai→ap_renmai_danzhong→ap_dumai_mingmen→ap_dumai_zhiyang→ap_dumai_shendao→ap_dumai_baihui→ap_shouyangming_quchi→ap_shouyangming_shousanli→ap_shouyangming_hegu→ap_shouyangming_shangyang`；CT 均 80，风险 `100/150/350/150/180/250/350/180/150/120` | 800 | 阳性天阶绝招；防守沿用同骨架但改 `purpose` |
| `AT-I4` | attack / `[yin,harmony]` | 手太阴 C 四穴；CT 均 70，风险 `80/100/120/140` | 280 | 阴性短攻 |
| `AT-I6` | attack / `[yin,harmony]` | 手厥阴 D 五穴后接 `ap_shoutaiyin_yunmen`；CT 均 70，风险 `80/100/120/140/160/350` | 420 | 阴性换脉攻 |
| `AT-I8` | attack / `[yin,harmony]` | 手太阴 C 四穴后接手厥阴 D 前四穴；CT 均 70，风险 `80/100/120/140/400/100/120/140` | 560 | 阴性地阶重招 |
| `U-I8` | attack / `[yin,harmony]` | `ap_renmai_qihai→ap_renmai_guanyuan→ap_renmai_zhongwan→ap_renmai_danzhong→ap_shoujueyin_tianchi→ap_shoujueyin_quze→ap_shoujueyin_neiguan→ap_shoujueyin_laogong`；CT 均 90，风险 `100/100/150/180/350/200/180/150` | 720 | 阴性地阶绝招；防守 / 移动沿用同骨架但改 `purpose` |
| `U-I10` | attack / `[yin,harmony]` | 上列八穴后接 `ap_shoujueyin_zhongchong→ap_shoutaiyin_shaoshang`；CT 均 80，风险 `100/100/120/150/350/180/160/140/120/300` | 800 | 阴性天阶绝招；防守沿用同骨架但改 `purpose` |
| `AT-H4` | attack / `[yin,yang,harmony]` | 腰腿 F 四穴；CT 均 70，风险 `80/100/120/140` | 280 | 调和 / 中性短攻 |
| `AT-H6` | attack / `[yin,yang,harmony]` | 带督 G 四穴后接 `ap_shoujueyin_neiguan→ap_shoujueyin_zhongchong`；CT 均 70，风险 `80/100/120/140/400/120` | 420 | 调和 / 中性换脉攻；外放指掌以腕转指端收束 |
| `AT-H8` | attack / `[yin,yang,harmony]` | 带督 G 四穴后接手太阴 C 四穴；CT 均 70，风险 `80/100/120/140/400/100/120/140` | 560 | 调和 / 中性地阶重招 |
| `U-H8` | attack / `[yin,yang,harmony]` | `ap_zushaoyin_yongquan→ap_zushaoyin_taixi→ap_zutaiyang_weizhong→ap_dumai_mingmen→ap_daimai_zulinqi→ap_daimai_weidao→ap_daimai_daimai→ap_dumai_zhiyang`；CT 均 90，风险 `100/120/180/250/350/180/160/150` | 720 | 调和 / 中性地阶绝招；防守 / 移动沿用同骨架但改 `purpose` |
| `U-H10` | attack / `[yin,yang,harmony]` | 上列八穴后接 `ap_renmai_qihai→ap_renmai_danzhong`；CT 均 80，风险 `100/120/180/250/350/180/160/150/350/150` | 800 | 调和 / 中性天阶绝招；防守沿用同骨架但改 `purpose` |
| `U-Y6` | attack / `[yang,harmony]` | `ap_dumai_mingmen→ap_dumai_zhiyang→ap_dumai_shendao→ap_dumai_baihui→ap_shouyangming_hegu→ap_shouyangming_shangyang`；CT 均 100，风险 `100/150/180/250/220/160` | 600 | 阳性玄上绝招 |
| `U-I6` | attack / `[yin,harmony]` | `ap_renmai_qihai→ap_renmai_guanyuan→ap_renmai_zhongwan→ap_renmai_danzhong→ap_shoujueyin_neiguan→ap_shoujueyin_laogong`；CT 均 100，风险 `100/120/180/250/220/180` | 600 | 阴性玄上绝招 |
| `U-H6` | attack / `[yin,yang,harmony]` | `ap_zushaoyin_yongquan→ap_zushaoyin_taixi→ap_zutaiyang_weizhong→ap_dumai_mingmen→ap_daimai_zulinqi→ap_daimai_daimai`；CT 均 100，风险 `100/120/180/250/220/160` | 600 | 调和 / 中性玄上绝招；防守 / 移动沿用同骨架但改 `purpose` |
| `DF-Y4` | defense / `[yang,harmony]` | 督脉 B 四穴；CT 均 70，风险 `50/70/90/110` | 280 | 阳性架势 |
| `DF-Y6` | defense / `[yang,harmony]` | 督脉 B 四穴→手阳明 E 前二穴；CT 均 70，风险 `50/70/90/110/300/100` | 420 | 阳性护体；绝招改 90/段 |
| `DF-I4` | defense / `[yin,harmony]` | 任脉 A 四穴；CT 均 70，风险 `50/70/90/110` | 280 | 阴性架势 |
| `DF-I6` | defense / `[yin,harmony]` | 任脉 A 四穴→手厥阴 D 前二穴；CT 均 70，风险 `50/70/90/110/300/100` | 420 | 阴性护体；绝招改 90/段 |
| `DF-H4` | defense / `[yin,yang,harmony]` | 带督 G 四穴；CT 均 70，风险 `50/70/90/110` | 280 | 调和 / 中性架势 |
| `DF-H6` | defense / `[yin,yang,harmony]` | 带督 G 四穴→手厥阴 D 前二穴；CT 均 70，风险 `50/70/90/110/300/100` | 420 | 调和 / 中性护体；绝招改 90/段 |
| `MV-Y4/8` | movement / `[yang,harmony]` | 阳跷前 4 / 8 穴；CT 均 60（绝招 75），风险前四 `50/70/90/110`、后四 `250/70/90/110` | 240 / 480 | 阳性轻功 |
| `MV-I4/8` | movement / `[yin,harmony]` | 阴跷前 4；八段为阴跷六穴→`ap_shoujueyin_tianchi → ap_shoujueyin_quze`；CT 均 60（绝招 75），风险前四 `50/70/90/110`，后四 `250/70/90/110` | 240 / 480 | 阴性轻功 |
| `MV-H4/8` | movement / `[yin,yang,harmony]` | 腰腿 F 四穴 / F 后接带督 G 四穴；CT 均 60（绝招 75），风险前四 `50/70/90/110`、后四 `250/70/90/110` | 240 / 480 | 调和 / 中性轻功 |

每个模板均为 1–18 段、穴位不重复、`segmentCt=60/70/75/80/90/100`、`riskBp=50..450`。普通 4/6/8 段分别增加 240–560 CT；玄上、地、天绝招分别增加 600、720、800 CT，配合绝招 1200 收招为 1800、1920、2000 CT，均不超过 2000。

##### AR-16 普通外放路线实例登记

下表将本轮新增引用的普通外放路线登记为本册正式 `MeridianRouteDef` 实例；每行与 §5.7.2 对应展开码合并后得到完整 `steps`，不得把展开码写入 Core。所有路线均为 `ultimate:false`、`purpose:attack`，并命中表列的 21 §4.3 合法外放端点。

| 路线 ID | `moveRef` | `requiredNature` | 展开码 | 合法外放端点 |
|---|---|---|---|---|
| `mfr_duoluoyezhi_beiye` | `mv_duoluoyezhi_beiye` | `[yin,yang,harmony]` | `AT-H6` | `ap_shoujueyin_neiguan`、`ap_shoujueyin_zhongchong` |
| `mfr_duoluoyezhi_jingye` | `mv_duoluoyezhi_jingye` | `[yin,yang,harmony]` | `AT-H8` | `ap_shoutaiyin_shaoshang` |
| `mfr_duoluoyezhi_luanye` | `mv_duoluoyezhi_luanye` | `[yin,yang,harmony]` | `AT-H8` | `ap_shoutaiyin_shaoshang` |
| `mfr_duoluoyezhi_yeluo` | `mv_duoluoyezhi_yeluo` | `[yin,yang,harmony]` | `AT-H6` | `ap_shoujueyin_neiguan`、`ap_shoujueyin_zhongchong` |
| `mfr_huanyinzhi_anxi` | `mv_huanyinzhi_anxi` | `[yin,harmony]` | `AT-I8` | `ap_shoutaiyin_shaoshang`、`ap_shoujueyin_neiguan` |
| `mfr_jingangzhi_zhili` | `mv_jingangzhi_zhili` | `[yang,harmony]` | `AT-Y6` | `ap_shouyangming_hegu` |
| `mfr_mohezhi_dazhi` | `mv_mohezhi_dazhi` | `[yang,harmony]` | `AT-Y6` | `ap_shouyangming_hegu` |
| `mfr_mohezhi_poqi` | `mv_mohezhi_poqi` | `[yang,harmony]` | `AT-Y8` | `ap_shouyangming_hegu`、`ap_shouyangming_shangyang` |
| `mfr_nianhuazhi_nianhua` | `mv_nianhuazhi_nianhua` | `[yin,yang,harmony]` | `AT-H6` | `ap_shoujueyin_neiguan`、`ap_shoujueyin_zhongchong` |
| `mfr_nianhuazhi_sanhua` | `mv_nianhuazhi_sanhua` | `[yin,yang,harmony]` | `AT-H8` | `ap_shoutaiyin_shaoshang` |
| `mfr_wuxiangjiezhi_jiehuo` | `mv_wuxiangjiezhi_jiehuo` | `[yin,yang,harmony]` | `AT-H6` | `ap_shoujueyin_neiguan`、`ap_shoujueyin_zhongchong` |
| `mfr_wuxiangjiezhi_kongjie` | `mv_wuxiangjiezhi_kongjie` | `[yin,yang,harmony]` | `AT-H8` | `ap_shoutaiyin_shaoshang` |
| `mfr_wuxiangjiezhi_wuxiang` | `mv_wuxiangjiezhi_wuxiang` | `[yin,yang,harmony]` | `AT-H6` | `ap_shoujueyin_neiguan`、`ap_shoujueyin_zhongchong` |
| `mfr_yizhichan_yizhi` | `mv_yizhichan_yizhi` | `[yin,yang,harmony]` | `AT-H6` | `ap_shoujueyin_neiguan`、`ap_shoujueyin_zhongchong` |

#### 5.7.3 天 / 地阶逐招绑定（上）

表内每项格式为 `moveRef→meridianRouteRef/ultimate/purpose/骨架`；每个 `mfr_*` 都是稳定、唯一的路线 ID。对“攻击同时自护”的招式仍以主要伤害用途挂 attack；其既有效果不变。

| 武学（品阶 / 性质） | 逐招 `mv_*→mfr_*/ultimate/purpose/骨架` |
|---|---|
| 易筋经 `sk_yijinjing`（天上 / 调和） | `mv_yijinjing_xisui→mfr_yijinjing_xisui/false/defense/DF-H6`；`mv_yijinjing_weituo→mfr_yijinjing_weituo/true/defense/显式`；`mv_yijinjing_daozhuai→mfr_yijinjing_daozhuai/true/attack/显式（见本册绝招显式路线索引）`；`mv_yijinjing_huangu→mfr_yijinjing_huangu/true/defense/显式` |
| 金刚不坏体 `sk_jingangbuhuai`（天下 / 阳） | `mv_jingangbuhuai_shoushi→mfr_jingangbuhuai_shoushi/false/defense/DF-Y4`；`mv_jingangbuhuai_shouquan→mfr_jingangbuhuai_shouquan/false/defense/DF-Y4`；`mv_jingangbuhuai_hushen→mfr_jingangbuhuai_hushen/false/defense/DF-Y6+IG`；`mv_jingangbuhuai_hanshan→mfr_jingangbuhuai_hanshan/true/attack/显式`；`mv_jingangbuhuai_jinshen→mfr_jingangbuhuai_jinshen/true/defense/显式（见本册绝招显式路线索引）` |
| 狮子吼 `sk_shizihou`（天下 / 阳） | `mv_shizihou_zhenhou→mfr_shizihou_zhenhou/false/attack/AT-Y8`；`mv_shizihou_shehun→mfr_shizihou_shehun/false/attack/AT-Y8`；`mv_shizihou_pozhen→mfr_shizihou_pozhen/false/attack/AT-Y8`；`mv_shizihou_hexing→mfr_shizihou_hexing/false/defense/DF-Y6`；`mv_shizihou_juyin→mfr_shizihou_juyin/true/attack/显式`；`mv_shizihou_shizihou→mfr_shizihou_shizihou/true/attack/显式（见本册绝招显式路线索引）` |
| 铁布衫 `sk_tiebushan`（地下 / 阳） | `mv_tiebushan_yingjie→mfr_tiebushan_yingjie/false/defense/DF-Y4`；`mv_tiebushan_tiebei→mfr_tiebushan_tiebei/false/attack/AT-Y6`；`mv_tiebushan_qianjinzhui→mfr_tiebushan_qianjinzhui/false/defense/DF-Y4`；`mv_tiebushan_tieniu→mfr_tiebushan_tieniu/false/attack/AT-Y6`；`mv_tiebushan_gangqi→mfr_tiebushan_gangqi/true/defense/显式（见本册绝招显式路线索引）` |
| 金钟罩 `sk_jinzhongzhao`（地中 / 阳） | `mv_jinzhongzhao_huti→mfr_jinzhongzhao_huti/false/defense/DF-Y6+IG`；`mv_jinzhongzhao_zhongming→mfr_jinzhongzhao_zhongming/false/attack/AT-Y6`；`mv_jinzhongzhao_fanzhen→mfr_jinzhongzhao_fanzhen/false/defense/DF-Y4+IG`；`mv_jinzhongzhao_hongzhong→mfr_jinzhongzhao_hongzhong/false/attack/AT-Y6`；`mv_jinzhongzhao_bupo→mfr_jinzhongzhao_bupo/true/defense/显式（见本册绝招显式路线索引）` |
| 少林九阳功 `sk_shaolinjiuyang`（地中 / 阳） | `mv_shaolinjiuyang_huti→mfr_shaolinjiuyang_huti/false/defense/DF-Y6+IG`；`mv_shaolinjiuyang_chunyang→mfr_shaolinjiuyang_chunyang/false/attack/AT-Y6`；`mv_shaolinjiuyang_liaoshang→mfr_shaolinjiuyang_liaoshang/false/defense/DF-Y4`；`mv_shaolinjiuyang_zhoutian→mfr_shaolinjiuyang_zhoutian/true/defense/显式（见本册绝招显式路线索引）` |
| 洗髓经 `sk_xisuijing`（地上 / 调和） | `mv_xisuijing_famao→mfr_xisuijing_famao/false/defense/DF-H4`；`mv_xisuijing_chengxin→mfr_xisuijing_chengxin/false/defense/DF-H6`；`mv_xisuijing_huanmai→mfr_xisuijing_huanmai/true/defense/显式`；`mv_xisuijing_huanyuan→mfr_xisuijing_huanyuan/true/defense/显式（见本册绝招显式路线索引）` |
| 大金刚拳 `sk_dajingangquan`（地下 / 阳） | `mv_dajingangquan_kaishan→mfr_dajingangquan_kaishan/false/attack/AT-Y6`；`mv_dajingangquan_zhenmo→mfr_dajingangquan_zhenmo/false/attack/AT-Y6`；`mv_dajingangquan_numu→mfr_dajingangquan_numu/false/attack/AT-Y6`；`mv_dajingangquan_daochu→mfr_dajingangquan_daochu/false/attack/AT-Y8`；`mv_dajingangquan_yinu→mfr_dajingangquan_yinu/true/attack/显式（见本册绝招显式路线索引）` |
| 大金刚掌 `sk_dajingangzhang`（地下 / 阳） | `mv_dajingangzhang_tuotian→mfr_dajingangzhang_tuotian/false/attack/AT-Y6`；`mv_dajingangzhang_moyun→mfr_dajingangzhang_moyun/false/attack/AT-Y6`；`mv_dajingangzhang_lieshi→mfr_dajingangzhang_lieshi/false/attack/AT-Y8`；`mv_dajingangzhang_cuishan→mfr_dajingangzhang_cuishan/false/attack/AT-Y8`；`mv_dajingangzhang_dali→mfr_dajingangzhang_dali/true/attack/显式（见本册绝招显式路线索引）` |
| 般若掌 `sk_boruozhang`（地中 / 调和） | `mv_boruozhang_rushi→mfr_boruozhang_rushi/false/attack/AT-H6`；`mv_boruozhang_kongxiang→mfr_boruozhang_kongxiang/false/attack/AT-H6`；`mv_boruozhang_zhaojian→mfr_boruozhang_zhaojian/false/attack/AT-H8`；`mv_boruozhang_duyi→mfr_boruozhang_duyi/false/defense/DF-H6`；`mv_boruozhang_boluomi→mfr_boruozhang_boluomi/true/attack/显式（见本册绝招显式路线索引）` |
| 韦陀杵 `sk_weituochu`（地中 / 阳） | `mv_weituochu_xiangmo→mfr_weituochu_xiangmo/false/attack/AT-Y6`；`mv_weituochu_hufa→mfr_weituochu_hufa/false/defense/DF-Y4`；`mv_weituochu_zhenyue→mfr_weituochu_zhenyue/false/attack/AT-Y8`；`mv_weituochu_dachu→mfr_weituochu_dachu/true/attack/显式（见本册绝招显式路线索引）`；`mv_weituochu_fumo→mfr_weituochu_fumo/false/attack/MV-Y8` |
| 须弥山掌 `sk_xumishanzhang`（地上 / 阳） | `mv_xumishanzhang_yashan→mfr_xumishanzhang_yashan/false/attack/AT-Y6`；`mv_xumishanzhang_chenzhang→mfr_xumishanzhang_chenzhang/false/attack/AT-Y6`；`mv_xumishanzhang_bafeng→mfr_xumishanzhang_bafeng/false/defense/DF-Y4`；`mv_xumishanzhang_jiezi→mfr_xumishanzhang_jiezi/true/attack/显式`；`mv_xumishanzhang_yading→mfr_xumishanzhang_yading/true/attack/显式（见本册绝招显式路线索引）` |
| 千手如来掌 `sk_qianshourulaizhang`（地上 / 调和） | `mv_qianshourulaizhang_qianshou→mfr_qianshourulaizhang_qianshou/false/attack/AT-H6`；`mv_qianshourulaizhang_zhangying→mfr_qianshourulaizhang_zhangying/false/attack/AT-H6`；`mv_qianshourulaizhang_jieyin→mfr_qianshourulaizhang_jieyin/true/attack/显式`；`mv_qianshourulaizhang_rulai→mfr_qianshourulaizhang_rulai/false/defense/DF-H4`；`mv_qianshourulaizhang_wanfo→mfr_qianshourulaizhang_wanfo/true/attack/显式（见本册绝招显式路线索引）` |
| 摩诃指 `sk_mohezhi`（地下 / 阳） | `mv_mohezhi_dazhi→mfr_mohezhi_dazhi/false/attack/AT-Y6`；`mv_mohezhi_dianxue→mfr_mohezhi_dianxue/false/attack/AT-Y6`；`mv_mohezhi_poqi→mfr_mohezhi_poqi/false/attack/AT-Y8`；`mv_mohezhi_lianzhi→mfr_mohezhi_lianzhi/false/attack/AT-Y8`；`mv_mohezhi_wuliang→mfr_mohezhi_wuliang/true/attack/显式（见本册绝招显式路线索引）` |
| 多罗叶指 `sk_duoluoyezhi`（地下 / 调和） | `mv_duoluoyezhi_yeluo→mfr_duoluoyezhi_yeluo/false/attack/AT-H6`；`mv_duoluoyezhi_beiye→mfr_duoluoyezhi_beiye/false/attack/AT-H6`；`mv_duoluoyezhi_jingye→mfr_duoluoyezhi_jingye/false/attack/AT-H8`；`mv_duoluoyezhi_luanye→mfr_duoluoyezhi_luanye/false/attack/AT-H8`；`mv_duoluoyezhi_mantian→mfr_duoluoyezhi_mantian/true/attack/显式（见本册绝招显式路线索引）` |

#### 5.7.4 天 / 地阶逐招绑定（下）

| 武学（品阶 / 性质） | 逐招 `mv_*→mfr_*/ultimate/purpose/骨架` |
|---|---|
| 大力金刚指 `sk_dalijingangzhi`（地中 / 阳） | `mv_dalijingangzhi_niegu→mfr_dalijingangzhi_niegu/false/attack/AT-Y6`；`mv_dalijingangzhi_zhaxue→mfr_dalijingangzhi_zhaxue/false/attack/AT-Y6`；`mv_dalijingangzhi_cuogu→mfr_dalijingangzhi_cuogu/false/attack/AT-Y8`；`mv_dalijingangzhi_chuanshi→mfr_dalijingangzhi_chuanshi/false/attack/AT-Y8`；`mv_dalijingangzhi_suigu→mfr_dalijingangzhi_suigu/true/attack/显式（见本册绝招显式路线索引）` |
| 一指禅 `sk_yizhichan`（地中 / 调和） | `mv_yizhichan_yizhi→mfr_yizhichan_yizhi/false/attack/AT-H6`；`mv_yizhichan_chanding→mfr_yizhichan_chanding/false/defense/DF-H4`；`mv_yizhichan_guanding→mfr_yizhichan_guanding/false/attack/AT-H8`；`mv_yizhichan_jiexue→mfr_yizhichan_jiexue/false/defense/DF-H6`；`mv_yizhichan_qiankun→mfr_yizhichan_qiankun/true/attack/显式（见本册绝招显式路线索引）` |
| 拈花指 `sk_nianhuazhi`（地上 / 调和） | `mv_nianhuazhi_nianhua→mfr_nianhuazhi_nianhua/false/attack/AT-H6`；`mv_nianhuazhi_weixiao→mfr_nianhuazhi_weixiao/false/defense/DF-H4`；`mv_nianhuazhi_wuxing→mfr_nianhuazhi_wuxing/true/attack/显式`；`mv_nianhuazhi_sanhua→mfr_nianhuazhi_sanhua/false/attack/AT-H8`；`mv_nianhuazhi_jiaye→mfr_nianhuazhi_jiaye/true/attack/显式（见本册绝招显式路线索引）` |
| 无相劫指 `sk_wuxiangjiezhi`（地上 / 调和） | `mv_wuxiangjiezhi_wuxiang→mfr_wuxiangjiezhi_wuxiang/false/attack/AT-H6`；`mv_wuxiangjiezhi_jiehuo→mfr_wuxiangjiezhi_jiehuo/false/attack/AT-H6`；`mv_wuxiangjiezhi_kongjie→mfr_wuxiangjiezhi_kongjie/false/attack/AT-H8`；`mv_wuxiangjiezhi_wuxiangjie→mfr_wuxiangjiezhi_wuxiangjie/true/attack/显式`；`mv_wuxiangjiezhi_jiejin→mfr_wuxiangjiezhi_jiejin/true/attack/显式（见本册绝招显式路线索引）` |
| 如影随形腿 `sk_ruyingsuixingtui`（地下 / 阳） | `mv_ruyingsuixingtui_ruying→mfr_ruyingsuixingtui_ruying/false/movement/MV-Y4`；`mv_ruyingsuixingtui_suixing→mfr_ruyingsuixingtui_suixing/false/defense/DF-Y4`；`mv_ruyingsuixingtui_lianhuan→mfr_ruyingsuixingtui_lianhuan/false/attack/AT-Y8`；`mv_ruyingsuixingtui_raoying→mfr_ruyingsuixingtui_raoying/false/movement/MV-Y8`；`mv_ruyingsuixingtui_yingzong→mfr_ruyingsuixingtui_yingzong/true/attack/显式（见本册绝招显式路线索引）` |
| 龙爪手 `sk_longzhaoshou`（地中 / 阳） | `mv_longzhaoshou_bufeng→mfr_longzhaoshou_bufeng/false/attack/AT-Y6`；`mv_longzhaoshou_zhuoying→mfr_longzhaoshou_zhuoying/false/attack/AT-Y6`；`mv_longzhaoshou_fuqin→mfr_longzhaoshou_fuqin/false/attack/AT-Y8`；`mv_longzhaoshou_guse→mfr_longzhaoshou_guse/false/attack/AT-Y8`；`mv_longzhaoshou_pikang→mfr_longzhaoshou_pikang/false/attack/AT-Y8`；`mv_longzhaoshou_daoxu→mfr_longzhaoshou_daoxu/true/attack/显式`；`mv_longzhaoshou_sanshiliu→mfr_longzhaoshou_sanshiliu/true/attack/显式（见本册绝招显式路线索引）`；`mv_longzhaoshou_baocan→mfr_longzhaoshou_baocan/false/defense/DF-Y6`；`mv_longzhaoshou_shouque→mfr_longzhaoshou_shouque/false/defense/DF-Y6` |

正文运行字段（正文卡仍唯一拥有绝招真值）：`mv_longzhaoshou_daoxu MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}`；`mv_longzhaoshou_sanshiliu MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}`。
| 伏魔杖法 `sk_fumozhangfa`（地中 / 阳） | `mv_fumozhangfa_fumo→mfr_fumozhangfa_fumo/false/attack/AT-Y6`；`mv_fumozhangfa_hengsao→mfr_fumozhangfa_hengsao/false/attack/AT-Y6`；`mv_fumozhangfa_zhenzhang→mfr_fumozhangfa_zhenzhang/false/attack/AT-Y8`；`mv_fumozhangfa_juding→mfr_fumozhangfa_juding/false/movement/MV-Y8`；`mv_fumozhangfa_xiangmo→mfr_fumozhangfa_xiangmo/true/attack/显式（见本册绝招显式路线索引）` |
| 燃木刀法 `sk_ranmudaofa`（地上 / 阳） | `mv_ranmudaofa_ranmu→mfr_ranmudaofa_ranmu/false/attack/AT-Y6`；`mv_ranmudaofa_liyan→mfr_ranmudaofa_liyan/false/attack/AT-Y6`；`mv_ranmudaofa_fenxiang→mfr_ranmudaofa_fenxiang/false/attack/AT-Y8`；`mv_ranmudaofa_liaoyuan→mfr_ranmudaofa_liaoyuan/true/attack/显式`；`mv_ranmudaofa_yehuo→mfr_ranmudaofa_yehuo/true/attack/显式（见本册绝招显式路线索引）` |
| 达摩剑法 `sk_damojianfa`（地下 / 调和） | `mv_damojianfa_mianbi→mfr_damojianfa_mianbi/false/defense/DF-H4`；`mv_damojianfa_zhizhi→mfr_damojianfa_zhizhi/false/attack/AT-H6`；`mv_damojianfa_yiwei→mfr_damojianfa_yiwei/false/movement/MV-H8`；`mv_damojianfa_zhilv→mfr_damojianfa_zhilv/false/movement/MV-H8`；`mv_damojianfa_jianxing→mfr_damojianfa_jianxing/true/attack/显式（见本册绝招显式路线索引）` |
| 袈裟伏魔功 `sk_jiashafumogong`（地中 / 调和） | `mv_jiashafumogong_juan→mfr_jiashafumogong_juan/false/attack/AT-H6`；`mv_jiashafumogong_fu→mfr_jiashafumogong_fu/false/attack/AT-H6`；`mv_jiashafumogong_zhao→mfr_jiashafumogong_zhao/false/attack/AT-H8`；`mv_jiashafumogong_fuqi→mfr_jiashafumogong_fuqi/false/defense/DF-H6`；`mv_jiashafumogong_fumo→mfr_jiashafumogong_fumo/true/attack/显式（见本册绝招显式路线索引）` |
| 一苇渡江 `sk_yiweidujiang`（地上 / 中性） | `mv_yiweidujiang_yiwei→mfr_yiweidujiang_yiwei/false/movement/MV-H4`；`mv_yiweidujiang_tawei→mfr_yiweidujiang_tawei/false/movement/MV-H8`；`mv_yiweidujiang_suibo→mfr_yiweidujiang_suibo/true/movement/显式`；`mv_yiweidujiang_feidu→mfr_yiweidujiang_feidu/true/movement/显式（见本册绝招显式路线索引）` |
| 金刚伏魔圈 `sk_jingangfumoquan`（地上 / 阳） | `mv_jingangfumoquan_buquan→mfr_jingangfumoquan_buquan/false/defense/DF-Y6`；`mv_jingangfumoquan_suona→mfr_jingangfumoquan_suona/false/attack/AT-Y8`；`mv_jingangfumoquan_chanxin→mfr_jingangfumoquan_chanxin/true/defense/显式`；`mv_jingangfumoquan_fumo→mfr_jingangfumoquan_fumo/true/attack/显式（见本册绝招显式路线索引）` |
| 虎鹤双形拳 `sk_huheshuangxingquan`（地下 / 阳） | `mv_huheshuangxingquan_hu→mfr_huheshuangxingquan_hu/false/movement/MV-Y4`；`mv_huheshuangxingquan_he→mfr_huheshuangxingquan_he/false/defense/DF-Y4`；`mv_huheshuangxingquan_hubao→mfr_huheshuangxingquan_hubao/false/attack/AT-Y8`；`mv_huheshuangxingquan_hezui→mfr_huheshuangxingquan_hezui/false/attack/AT-Y8`；`mv_huheshuangxingquan_shuangxing→mfr_huheshuangxingquan_shuangxing/true/attack/显式（见本册绝招显式路线索引）` |
| 幻阴指 `sk_huanyinzhi`（地中 / 阴） | `mv_huanyinzhi_huanyin→mfr_huanyinzhi_huanyin/false/attack/AT-I6`；`mv_huanyinzhi_anxi→mfr_huanyinzhi_anxi/false/attack/AT-I8`；`mv_huanyinzhi_hanjin→mfr_huanyinzhi_hanjin/false/attack/AT-I8`；`mv_huanyinzhi_huanying→mfr_huanyinzhi_huanying/false/defense/DF-I6`；`mv_huanyinzhi_wuxiang→mfr_huanyinzhi_wuxiang/true/attack/显式（见本册绝招显式路线索引）` |

共覆盖本册天 / 地阶 29 门、145 个现有招式，逐项给出稳定 `mfr_*`、绝招真值、用途与骨架；未新增招名。治疗 / 解穴 / 阵法支援挂 defense 是运行用途，不改其 `power` 或效果目标；纯位移挂 movement，不额外取得攻击倍率。

#### 同门第二／第三绝招显式路线

以下路线沿用既有 ID，只重写步骤；与同门保留的第一绝招模板在穴位集合、CT／风险数组及职责上均有区分。

| 武学 | moveRef | 路线 ID | purpose | 职责 | 显式步骤（`ap_*/CT/风险`） | 段数 | 路线 CT | 收招 + 路线 |
|---|---|---|---|---|---|---:|---:|---:|
| 金刚不坏体 | `mv_jingangbuhuai_hanshan` | `mfr_jingangbuhuai_hanshan` | attack | 单体震退破势 | 见文首索引 | 10 | 750 | 1950 |
| 狮子吼 | `mv_shizihou_juyin` | `mfr_shizihou_juyin` | attack | 远线聚音震慑 | 见文首索引 | 10 | 750 | 1950 |
| 易筋经 | `mv_yijinjing_weituo` | `mfr_yijinjing_weituo` | defense | 自身运功增益 | 见文首索引 | 10 | 750 | 1950 |
| 〃 | `mv_yijinjing_huangu` | `mfr_yijinjing_huangu` | defense | 自疗清伤换骨 | 见文首索引 | 10 | 750 | 1950 |
| 韦陀杵 | `mv_weituochu_dachu` | `mfr_weituochu_dachu` | attack | 单体重击 | 见文首索引 | 8 | 600 | 1800 |
| 燃木刀法 | `mv_ranmudaofa_liaoyuan` | `mfr_ranmudaofa_liaoyuan` | attack | 扇面清场 | 见文首索引 | 8 | 600 | 1800 |
| 须弥山掌 | `mv_xumishanzhang_jiezi` | `mfr_xumishanzhang_jiezi` | attack | 单体聚劲 | 见文首索引 | 8 | 600 | 1800 |
| 金刚伏魔圈 | `mv_jingangfumoquan_chanxin` | `mfr_jingangfumoquan_chanxin` | defense | 阵法补隙支援 | 见文首索引 | 8 | 600 | 1800 |
| 龙爪手 | `mv_longzhaoshou_daoxu` | `mfr_longzhaoshou_daoxu` | attack | 单体擒拿封穴 | 见文首索引 | 8 | 600 | 1800 |
| 拈花指 | `mv_nianhuazhi_wuxing` | `mfr_nianhuazhi_wuxing` | attack | 远程无形指力 | 见文首索引 | 8 | 600 | 1800 |
| 千手如来掌 | `mv_qianshourulaizhang_jieyin` | `mfr_qianshourulaizhang_jieyin` | defense | 友方接引支援 | 见文首索引 | 8 | 600 | 1800 |
| 无相劫指 | `mv_wuxiangjiezhi_wuxiangjie` | `mfr_wuxiangjiezhi_wuxiangjie` | attack | 单体封穴 | 见文首索引 | 8 | 600 | 1800 |
| 洗髓经 | `mv_xisuijing_huanmai` | `mfr_xisuijing_huanmai` | defense | 自身换脉清伤 | 见文首索引 | 8 | 600 | 1800 |
| 一苇渡江 | `mv_yiweidujiang_suibo` | `mfr_yiweidujiang_suibo` | movement | 水面位移脱身 | 见文首索引 | 9 | 675 | 1875 |

#### 5.7.5 玄 / 黄阶路线模板与全轻功绑定

玄上十门绝招不再走隐式模板，均逐招登记稳定路线：

| 武学 / 性质 | 玄上绝招显式路线 |
|---|---|
| `sk_tongrenhenglian` / 阳 | `mv_tongrenhenglian_tongrenxiang→mfr_tongrenhenglian_tongrenxiang/true/attack/显式（见本册绝招显式路线索引）`（6 段，100 CT/段，总风险 1060） |
| `sk_dacidabeiqianyeshou` / 调和 | `mv_dacidabeiqianyeshou_due→mfr_dacidabeiqianyeshou_due/true/attack/显式（见本册绝招显式路线索引）`（6 段，100 CT/段，总风险 1030） |
| `sk_xinyiba` / 阳 | `mv_xinyiba_heyi→mfr_xinyiba_heyi/true/attack/显式（见本册绝招显式路线索引）`（6 段，100 CT/段，总风险 1060） |
| `sk_cibeidao` / 调和 | `mv_cibeidao_duhua→mfr_cibeidao_duhua/true/attack/显式（见本册绝招显式路线索引）`（6 段，100 CT/段，总风险 1030） |
| `sk_xiangmochu` / 阳 | `mv_xiangmochu_pojia→mfr_xiangmochu_pojia/true/attack/显式（见本册绝招显式路线索引）`（6 段，100 CT/段，总风险 1060） |
| `sk_fumosuofa` / 阳 | `mv_fumosuofa_huanyuan→mfr_fumosuofa_huanyuan/true/attack/显式（见本册绝招显式路线索引）`（6 段，100 CT/段，总风险 1060） |
| `sk_jingangnianzhu` / 中性 | `mv_jingangnianzhu_huixuan→mfr_jingangnianzhu_huixuan/true/attack/显式（见本册绝招显式路线索引）`（6 段，100 CT/段，总风险 1030） |
| `sk_luohanzhen` / 阳 | `mv_luohanzhen_shibaluohan→mfr_luohanzhen_shibaluohan/true/defense/显式（见本册绝招显式路线索引）`（8 段，75 CT/段，总风险 1080） |
| `sk_jingangnuhou` / 阳 | `mv_jingangnuhou_zhenshe→mfr_jingangnuhou_zhenshe/true/attack/显式（见本册绝招显式路线索引）`（6 段，100 CT/段，总风险 1060） |
| `sk_wulangbaguagun` / 阳 | `mv_wulangbaguagun_pozhen→mfr_wulangbaguagun_pozhen/true/attack/显式（见本册绝招显式路线索引）`（6 段，100 CT/段，总风险 1060） |

十条路线按 `U-Y6/U-H6` 逐项展开后，穴位均在 `design/15` 登记且同路线不重复；收招上界统一为 `1200+6×100=1800 CT`。

玄 / 黄阶按现有招式语义逐招确定性展开，保证不会以“整门武学一条万能路线”替代招式路线：

| 大阶 | 伤害招 | 防守 / 支援招 | 位移 / 闪避招 | 绝招 |
|---|---|---|---|---|
| 玄 | 同武学性质用 `AT-Y4/AT-I4/AT-H4`；重击、点穴、范围或换脉表现用对应 6 段 | `DF-Y4/DF-I4/DF-H4`；明确护体者用 6 段并挂 `innerGuard` | `MV-Y4/MV-I4/MV-H4`；长跃、追击用 8 段 | 仅玄上有绝招，显式路线均见上表；玄中 / 玄下无绝招 |
| 黄 | 同武学性质取对应 4 段模板的前 2–4 段；完整卡有 3 招时按 2/3/4 段递进 | 对应 `DF-*4` 的前 2–4 段 | 对应 `MV-*4` 的前 2–4 段 | 黄阶无绝招 |

性质“中性”的外功统一按 H 模板并允许 `[yin,yang,harmony]`。每条正式路线仍生成唯一 `mfr_<move>`，不得保存“前 N 段”或表内模板码。玄 / 黄正式数据须继续满足 `recovery+ΣsegmentCt≤2000`；治疗 / 纯支援只获得经脉运行结果及 CT，不套攻击乘区。

所有五门轻功都接入速度路线族；高阶逐招已在上表列出，玄 / 黄未列 `mv_*` 的一行卡由构建器在招式实体化时按下表生成，不凭空新建招名：

| 轻功 | 性质 / 品阶 | 武学速度路线 | 已有招式绑定 / 生成规则 |
|---|---|---|---|
| `sk_yiweidujiang` | 中性 / 地上 | `MV-H8` | 四招见 §5.7.4；`mfr_yiweidujiang_*` 均为 movement |
| `sk_bihuyouqiang` | 中性 / 玄上 | `MV-H4`，长跃 / 闪避用 `MV-H8` | 每个既有移动、跃起、追击、脱离、闪避招生成 `mfr_<move>` |
| `sk_meihuazhuang` | 中性 / 玄中 | `MV-H4` | 同上；木桩 / 高低差资格仍归 08 |
| `sk_luohanbu` | 中性 / 黄中 | `MV-H4` 前 3 段 | 同上；门禁仍读未修正有效轻功 |
| `sk_chanmenshenfa` | 中性 / 黄上 | `MV-H4` | 同上 |

速度输出只消费 21 §4.9 已归一的 `MeridianProfile`；不得再输入原始 `routeQualityBp`。`openingQinggong`、`spd`、`move`、`evadeRatingDelta` 的投影与先经脉后擒拿顺序均归 21 / 09，本册不把倍率写回 `QS` 或 08 的门禁。

#### 5.7.6 全内功调息档案与护体内劲显示档

每门内功的 `breathProfileRef` 指向同名 `txp_*`。表内固定展示 10 重输入；正式字段为 `id/grade/layer/nature/scope/ct/mpCostBp/outOfBattleScaleBp`，其中 `ct=1000`、`mpCostBp=0`、`outOfBattleScaleBp=15000`。核算列仅是 21 §10.2 通式的审阅结果，不写进 schema；运行态以压制后的实际 `effGrade/effLayer` 重算。护体显示档按黄 / 玄 / 地 / 天为 I / II / III / IV；只有执行合法自然护体短路或带 `IG` 的防守路线才启用，不自带倍率。

| 内功 → 调息档案 | 正式字段 `grade/layer/nature/scope/ct/mpCostBp/outOfBattleScaleBp` | 10 重核算 `reliefBp / repairUnits` | 护体显示档 |
|---|---|---:|:---:|
| `sk_yijinjing → txp_yijinjing` | `12/10/harmony/4/1000/0/15000` | `min(2500,floor((500+1200+800)×1.05))=2500 / floor((120+288+180)×1.05)=617`；专精修复 `floor(617×12000/10000)=740`（21 §10.4，非档案字段） | IV；`outOfBattleScaleBp:15000` |
| `sk_jingangbuhuai → txp_jingangbuhuai` | `10/10/yang/3/1000/0/15000` | `2300 / 540` | IV；`outOfBattleScaleBp:15000` |
| `sk_xisuijing → txp_xisuijing` | `9/10/harmony/3/1000/0/15000` | `floor(2200×1.05)=2310 / floor(516×1.05)=541` | III；`outOfBattleScaleBp:15000` |
| `sk_jinzhongzhao → txp_jinzhongzhao` | `8/10/yang/3/1000/0/15000` | `2100 / 492` | III；`outOfBattleScaleBp:15000` |
| `sk_shaolinjiuyang → txp_shaolinjiuyang` | `8/10/yang/3/1000/0/15000` | `2100 / 492` | III；`outOfBattleScaleBp:15000` |
| `sk_tiebushan → txp_tiebushan` | `7/10/yang/3/1000/0/15000` | `2000 / 468` | III；`outOfBattleScaleBp:15000` |
| `sk_tongrenhenglian → txp_tongrenhenglian` | `6/10/yang/2/1000/0/15000` | `1900 / 444` | II；`outOfBattleScaleBp:15000` |
| `sk_damoxinjing → txp_damoxinjing` | `5/10/harmony/2/1000/0/15000` | `floor(1800×1.05)=1890 / floor(420×1.05)=441` | II；`outOfBattleScaleBp:15000` |
| `sk_tongzigong → txp_tongzigong` | `4/10/yang/2/1000/0/15000` | `1700 / 396` | II；`outOfBattleScaleBp:15000` |
| `sk_shaolinxinfa → txp_shaolinxinfa` | `2/10/yang/1/1000/0/15000` | `1500 / 348` | I；`outOfBattleScaleBp:15000` |
| `sk_shaolinzhuanggong → txp_shaolinzhuanggong` | `1/10/yang/1/1000/0/15000` | `1400 / 324` | I；`outOfBattleScaleBp:15000` |
| `sk_tiexiangong → txp_tiexiangong` | `5/10/yang/2/1000/0/15000` | `1800 / 420` | II；`outOfBattleScaleBp:15000` |

标准对标准的攻、防、速度输出均为 10000 bp。护体内劲仅按 21 §4.8 对拳脚 / 持械 / 暗器 / 外放分别取 10000 / 2500 / 0 / 4000 bp 的适用率，并严格位于护体真气之后、`mpGuard` 之前；本册不另存抵消倍率。

## 6. 本文新增术语与 ID

| 类别 | 数量 | ID |
|---|---|---|
| 门派 / 传承 | 1 个门派、2 个引用 | 新增 `sect_nanshaolin`；引用基准 `sect_shaolin`；西域金刚门只用自由文本 `lineage: 火工头陀 → 西域金刚门 → 阿二、阿三`，禁止创建 `sect_jingangmen` |
| 武学（本文定义） | **68** | 内功：`sk_shaolinzhuanggong` `sk_shaolinxinfa` `sk_tongzigong` `sk_damoxinjing` `sk_tiexiangong` `sk_tongrenhenglian` `sk_tiebushan` `sk_jinzhongzhao` `sk_shaolinjiuyang` `sk_xisuijing`；拳掌：`sk_luohanshibashou` `sk_weituozhang` `sk_fuhuquan` `sk_hongquan` `sk_shaolinchangquan` `sk_nanshaolinqiaoshou` `sk_shuaibeishou` `sk_wuxingquan` `sk_xinyiba` `sk_dacidabeiqianyeshou` `sk_dajingangquan` `sk_dajingangzhang` `sk_huheshuangxingquan` `sk_boruozhang` `sk_weituochu` `sk_xumishanzhang` `sk_qianshourulaizhang`；指：`sk_jingangzhi` `sk_mohezhi` `sk_duoluoyezhi` `sk_dalijingangzhi` `sk_yizhichan` `sk_huanyinzhi` `sk_nianhuazhi` `sk_wuxiangjiezhi`；腿：`sk_tantui` `sk_tiesaozhou` `sk_ruyingsuixingtui`；擒拿：`sk_shaolinqinna`（05 已引用）`sk_yingzhuagong`；棍：`sk_shaolingunfa` `sk_shaolinhushangun` `sk_yinshougun` `sk_yachagun` `sk_wulangbaguagun` `sk_fumozhangfa`；刀：`sk_jiedaofa` `sk_bazhandao` `sk_cibeidao` `sk_ranmudaofa`；剑：`sk_luohanjian` `sk_fumojian` `sk_damojianfa`；奇门/鞭：`sk_xiangmochu` `sk_jiashafumogong` `sk_fumosuofa`；轻功：`sk_luohanbu` `sk_chanmenshenfa` `sk_meihuazhuang` `sk_bihuyouqiang` `sk_yiweidujiang`；暗器：`sk_putizi` `sk_jingangnianzhu`；杂学：`sk_boruoxinjing` `sk_shaolinshangke` `sk_luohanzhen` `sk_jingangnuhou` `sk_jingangfumoquan` |
| 武学（收录但非本文新增） | 6 | 基准 §13：`sk_yijinjing` `sk_jingangbuhuai` `sk_shizihou`；05 已定义：`sk_longzhaoshou` `sk_luohanquan` `sk_tieshazhang` |
| 敌人专用（不计数） | 1 | `sk_shibaluohanzhen`（`enemyOnly: true`） |
| 七十二绝技清单（`lg_shaolin72`，`special.liqi`；供逍遥组"小无相功 × 七十二绝技 synergy"逐条登记） | 21 | `sk_tiebushan` `sk_jinzhongzhao` `sk_dajingangquan` `sk_dajingangzhang` `sk_boruozhang` `sk_weituochu` `sk_xumishanzhang` `sk_qianshourulaizhang` `sk_mohezhi` `sk_duoluoyezhi` `sk_dalijingangzhi` `sk_yizhichan` `sk_nianhuazhi` `sk_wuxiangjiezhi` `sk_ruyingsuixingtui` `sk_longzhaoshou` `sk_fumozhangfa` `sk_ranmudaofa` `sk_damojianfa` `sk_jiashafumogong` `sk_yiweidujiang` |
| 招式 `mv_*` | ≈ 245 | 天/地卡 132 条（全 ID 已列于卡内）＋既有玄/黄表 113 条（`mv_<武学拼音>_<表中后缀>`）；不含 05 已定义的易筋经、龙爪手、罗汉拳、铁砂掌招式。AR-01 新增四门采用黄阶一行摘要，本轮不预造 `mv_*`，由数据化阶段按 §5.4 模板命名展开 |
| 被动 `ps_*` | ≈ 163 | 天/地卡 90 条＋既有玄/黄表 73 条（同上规则）；AR-01 新增四门只登记核心效果，不预造 `ps_*` |
| AR-01 新增武学 | **4** | `sk_shaolinchangquan`、`sk_shaolinhushangun`、`sk_chanmenshenfa`、`sk_nanshaolinqiaoshou`；写入前全仓精确查重均为 0 命中 |
| 套装候选 `set_*` | 11（新增 9） | 新增：`legacy-set:shaolin_henglian` `legacy-set:shaolin_banruo` `legacy-set:shaolin_gunseng` `set_shaolin_damo` `legacy-set:nanshaolin_hongmen` `set_saodiseng` `set_fangzheng` `legacy-set:sandu` `legacy-set:chengguan`；沿用：`set_shaolin_jingang`（基准）、`set_shaolin_luohan`（05 建议） |
| 特殊规则 / 字段 | 3 | `special.liqi`（七十二绝技·戾气，§1.3.1）；"制服"（慈悲，§1.3.2）；"开口泄气"（金刚不坏体 × 音功，§1.5.2） |
| 经脉路线 / 调息档案（引用） | 高阶 145 / 玄上绝招 10 / 内功 12 | 天 / 地 145 招均绑定唯一同名 `mfr_*`；本轮新增路线 ID 仍为 31，并重写 22 条同门第二／第三绝招路线步骤；玄上 10 记绝招逐项登记；12 门内功引用同名 `txp_*` 并补齐 `outOfBattleScaleBp:15000`。对象均归 21，不计本文新增 ID |
| Buff | **0** | 本文不新增 Buff；引用的 73 个 `bf_*` 已逐一核对存在于 06 目录（含 06 §8.11 已收录的 `bf_shouque`） |
| NPC（命名接口） | 具名引用 12；岗位槽 8 | 具名：`npc_xuanci` `npc_kongwen` `npc_kongzhi` `npc_duee` `npc_asan` `npc_fangsheng` `npc_huicong` `npc_chengguan` `npc_haidafu` `npc_tianhong` `npc_jiumozhi` `npc_xiexun`；岗位槽：少林当代方丈、罗汉堂、般若堂、戒律院、达摩院、十八罗汉、代掌寺务长老与南少林罗汉堂，均不注册静态 `npc_*` |
| 任务（占位） | 6 | `q_01_qiyu_81`（藏经阁扫地僧指点）`q_01_qiyu_82`（达摩洞面壁）`q_04_qiyu_81`（空见遗泽）`q_04_qiyu_82`（楔子闻经）`q_04_qiyu_83`（圆真遗册）`q_NN_faction_81`（闯铜人巷，各少林书界） |
| 物品 / 装备（建议接口） | 具体条目未定义 | 秘籍 `it_miji_tiebushan` `it_miji_jinzhongzhao` `it_miji_xisuijing` `it_miji_dajingangzhang` `it_miji_yizhichan` `it_miji_ruyingsuixingtui`；残页 `it_canye_dajingangquan`；袈裟类奇门兵器 `eq_jiasha_*`（`kinds: misc`、标签 `jiasha`）。这些只符合 10 的命名/变体规则，仍须由 10 建实体；`it_dahuandan` 已在 10 定义 |

---

### 正式套装反向标签镜像（全局审计）

下表仅镜像 `design/07` §8.4 的正式成员关系，供构建与 lint 读取；不是第二份武学定义。历史候选只以 `legacy-set:<slug>` 保留，不得写入运行态 `setTags`。

| 武学 ID | setTags |
|---|---|
| `sk_boruoxinjing` | `set_saodiseng` |
| `sk_damojianfa` | `set_shaolin_damo` |
| `sk_damoxinjing` | `set_shaolin_damo` |
| `sk_duoluoyezhi` | `set_mizong_mingwang` |
| `sk_jiashafumogong` | `set_mizong_mingwang` |
| `sk_jinzhongzhao` | `set_fangzheng` |
| `sk_longzhaoshou` | `set_shaolin_jingang` |
| `sk_luohanbu` | `set_shaolin_luohan` |
| `sk_luohanquan` | `set_shaolin_luohan` |
| `sk_nianhuazhi` | `set_saodiseng` |
| `sk_qianshourulaizhang` | `set_fangzheng` |
| `sk_ranmudaofa` | `set_mizong_mingwang` |
| `sk_shaolingunfa` | `set_shaolin_luohan` |
| `sk_shaolinxinfa` | `set_shaolin_luohan` |
| `sk_shaolinzhuanggong` | `set_shaolin_luohan` |
| `sk_shizihou` | `set_mingjiao_sida_fawang` |
| `sk_tieshazhang` | `set_shaolin_jingang` |
| `sk_tongrenhenglian` | `set_shaolin_jingang` |
| `sk_wuxiangjiezhi` | `set_mizong_mingwang` |
| `sk_xisuijing` | `set_shaolin_damo` |
| `sk_xumishanzhang` | `set_saodiseng` |
| `sk_yiweidujiang` | `set_shaolin_damo` |
| `sk_yizhichan` | `set_fangzheng` |

## 7. 数据校验规则与测试用例

### 7.1 静态校验

| 编号 | 规则 | 通过条件 | 本次结果 |
|---|---|---|---|
| V-SL-01 | 数量与品阶 | 74 个唯一玩家可习得 `sk_*`；12 级为 `3/6/9/6/11/10/8/10/8/2/0/1`，天/地/玄/黄为 `3/26/27/18` | ✅；命中 `design/05` §14.5 受控目标；另有敌人专用 1 门不计 |
| V-SL-02 | 天级封闭集合 | 恰为 `sk_yijinjing`、`sk_jingangbuhuai`、`sk_shizihou` | ✅；与基准 §13 一致 |
| V-SL-03 | ID 与重命名 | 武学 ID 唯一；生产字段只接受正式 ID `sk_jingangfumoquan`，迁移别名不得入库 | ✅；C12 已解决 |
| V-SL-04 | 内功性质 | §0.3 的 12 门内功均有且仅有 `yin/yang/harmony` 之一 | ✅；`yang` 9、`harmony` 3、`yin` 0 |
| V-SL-05 | `reqs` 结构 | 技艺只进 `reqs.skills`；前置均为 `{skill, layer}` 或 `{anyOf: [...]}`；硬门槛进 `hard` | ✅；伤科 `med:30`、罗汉阵 `formation:30`、伏魔圈 `formation:50` 为【建议值】 |
| V-SL-06 | Buff 闭包 | 全文引用的 73 个唯一 `bf_*` 均存在于 `design/06` | ✅；缺失 0，C23 已解决 |
| V-SL-07 | 套装闭包 | `SetDef.members ↔ SkillDef.setTags` 双向一致；跨组四技与狮子吼不得被空数组覆盖 | ✅；按 C22 登记；易筋经权威卡仍待 05 同步 |
| V-SL-08 | 倚天白名单 | 与下列 23 项显式集合完全相等；天/地/玄/黄 `3/6/8/6`，类别 `6/9/2/2/0/4`，七十二绝技 3 | ✅；按 C14 收敛 |
| V-SL-09 | 门派与职级 | 只启用 `sect_shaolin`、`sect_nanshaolin`；T01 用 L1–L5；禁用 `sect_jingangmen` | ✅；与 `design/17` 一致 |
| V-SL-10 | 作者决定 | 三天级均 `observable:false`；P32、P47、P49 的默认决定可在正文定位 | ✅ |
| V-SL-11 | 七十二绝技 | 21 门均列入 `lg_shaolin72` 且需落 `special.liqi:true`；紧凑表可据 §6 清单展开 | ✅（文档级）；数据导入时再做字段级断言 |
| V-SL-12 | 标注与占位 | 每个剩余“待考”均指向 K 编号；不得遗留未完成占位语或截断句 | ✅ |
| V-SL-13 | 黄阶八字段索引 | 18 门黄阶全部且仅出现一次于 §1.8／§2.5，列齐 ID、名称、门派/来源、类别、原生书界、核心效果、前置、出处 | ✅；嵩山 15＋南少林 3 = 18 |
| V-SL-14 | AR-01 新条目 | 新增恰为黄中 1、黄上 3；无新增天／地／玄、内功、Buff、套装成员 | ✅；`0/0/0/4` |
| V-SL-15 | 装配与池比例 | 十四界三类底座均可由 `skills-general` §11.1 的 `ALL14` 补满；池比例按新增来源重算 | ⚠️；目录覆盖通过，实际非互斥与前置可达性待章节验证；十四界比例仍待 F2／章节重配，见 §5.5–§5.6 |
| V-SL-16 | 经脉高阶覆盖（AR-14） | 29 门天 / 地阶、145 个既有招式逐一显式绑定；`route.ultimate == MoveDef.ultimate` | ✅；见 §5.7.3–§5.7.4，未新增招名 |
| V-SL-17 | 路线硬约束 | 每条 1–18 段、穴位不重复、CT 40–120、风险 0–1200，且 `recovery+ΣsegmentCt≤2000`；中性不用非法 `neutral` | ✅；玄上 / 地 / 天绝招上界为 1800 / 1920 / 2000 CT，见 §5.7.2、§5.7.5 |
| V-SL-18 | 轻功与调息全覆盖 | 5 门轻功均接 movement；12 门内功均有 `txp_*`，含 `outOfBattleScaleBp:15000`；护体显示档不加倍率 | ✅；见 §5.7.5–§5.7.6 |
| V-SL-19 | 绝招数量新规 | 天上 3、天下 2；地上 2、地中按统一裁定 1–2、地下 1；玄上 1；玄中以下 0 | ✅；天 / 地 / 玄上总数 `7/35/10`，本轮前为 `7/44/10` |
| V-SL-20 | AR-16 逐招覆盖 | 审计表按 `moveId` 排序；每个 `projected` 条目均有 `projection:true`、基础 `range/aoe`、恰三项 spread，且 `[0] == aoe`；不从远程、招名或旧伤害类型反推 | ✅；外放 23（天/地/玄/黄 `0/22/1/0`），待考 7，易误判且已审不标 2 |
| V-SL-21 | AR-16 伤害与路线 | 外放招全部伤害段为 `DamageKind='projected'`；攻击路线至少含 21 §4.4.1.4 的合法上肢端点 | ✅；阳性模板已有合谷，调和 `AT-H6` 改由内关转中冲，`AT-H8` 含少商；显式绝招逐条命中白名单 |

**V-SL-08 期望集合（构建器按 ID 集合等值断言，不从“同上”“全部少林书界”等展示短语猜测）：**

| 品阶 | 倚天保留 ID |
|---|---|
| 天（3） | `sk_yijinjing`、`sk_jingangbuhuai`、`sk_shizihou` |
| 地（6） | `sk_shaolinjiuyang`、`sk_jingangfumoquan`、`sk_longzhaoshou`、`sk_dalijingangzhi`、`sk_boruozhang`、`sk_huanyinzhi` |
| 玄（8） | `sk_tongrenhenglian`、`sk_jingangzhi`、`sk_tieshazhang`、`sk_yingzhuagong`、`sk_fumosuofa`、`sk_jingangnuhou`、`sk_bihuyouqiang`、`sk_boruoxinjing` |
| 黄（6） | `sk_shaolinxinfa`、`sk_shaolinzhuanggong`、`sk_luohanquan`、`sk_shaolinqinna`、`sk_shaolingunfa`、`sk_luohanbu` |

### 7.2 招式预算抽查（05 §4.2）

允许显示值相对公式结果手调不超过 `±0.05`；下表按未四舍五入结果复算。

| 招式 | 复算 | 表值 | 偏差 | 结论 |
|---|---:|---:|---:|---|
| 狮吼震 | `0.65×1.34×0.85×0.85−0.05−0.03=0.5493` | 0.55 | +0.0007 | ✅ |
| 慑魂 | `0.55×1.46×0.85×0.85−0.0625=0.5177` | 0.52 | +0.0023 | ✅ |
| 破阵吼 | `0.65×1.41×0.85×0.85−0.10=0.5622` | 0.56 | −0.0022 | ✅ |
| 聚音成线 | `1×1.34×0.85×0.85−0.10=0.8682` | 0.87 | +0.0018 | ✅ |
| 狮子吼（绝） | `3×0.35×0.85×0.85−0.10−0.10−0.075=0.4836` | 0.50 | +0.0164 | ✅ |
| 钟鸣 | `0.65×1.29−0.0375=0.8010` | 0.80 | −0.0010 | ✅ |
| 洪钟大吕 | `0.70×1.34×0.85−0.05=0.7473` | 0.75 | +0.0027 | ✅ |
| 般若波罗蜜 | `3×0.60×0.85−0.05=1.48` | 1.50 | +0.02 | ✅ |
| 摩诃无量 | `3×0.80×0.85−0.10=1.94` | 1.95 | +0.01 | ✅ |
| 漫天贝叶 | `3×0.50×0.85−0.06=1.215` | 1.20 | −0.015 | ✅ |
| 一指定乾坤 | `3×0.85−0.20=2.35` | 2.35 | 0 | ✅ |
| 幻阴指·暗袭 | `0.90×1.29−0.15−0.06=0.951` | 0.95 | −0.001 | ✅ |
| 少林长拳·近身单体（模板） | `AF(1)×1×1×1=1.00` | 1.00 | 0 | ✅ |
| 少林长拳·线2（模板） | `AF(2)×1×1×1=0.90` | 0.90 | 0 | ✅ |
| 少林护山棍·扇形 r1（模板） | `AF(3)×1×1×1=0.85` | 0.85 | 0 | ✅ |
| 南少林桥手·近身单体（模板） | `AF(1)×1×1×1=1.00` | 1.00 | 0 | ✅ |

> 新增禅门身法为纯移动支援，`power=0`，不进入攻击式倍率表；四门新条目均未引用 Buff，故不存在“成本乘持续回合”问题。

### 7.3 最小行为测试

1. **书界池**：载入倚天，只能从 §1.1/C14 的 23 门创建本土学习来源；`sk_tiebushan`、`sk_jinzhongzhao`、`sk_dajingangquan`、`sk_weituochu`、`sk_fumozhangfa`、`sk_damojianfa`、`sk_yiweidujiang` 均不得生成倚天学习来源。
2. **观摩**：尝试观摩三门天级武学均失败；地阶 `observe` 来源仍按各自 `maxLayer` 生效。
3. **前置**：倚天般若掌以铁砂掌 5 重满足局部 `reqsOverride`；默认来源仍要求韦陀掌 7 重。少林伤科只有 `med≥30` 可学，大还丹配方另在 7 重检查 `alchemy≥40`。
4. **职级**：L3 能学玄阶但不能直接领取地阶；L4 可授地阶；L5 只取得天级任务资格，仍须满足武学自身 `reqs`。南少林 L4“洪门护法”不得产生第六级。
5. **套装**：少林金刚四件有效品阶 `[5,6,8,12]` 得 `g_set=floor((6+8)/2)=7`；鹿鼎压制后 `[4,5,6,8]` 得 5。卸下一件后重新取中位数，不以固定图鉴平均代替。
6. **跨组标签**：无相劫指、多罗叶指、燃木刀法、袈裟伏魔功均命中 `set_mizong_mingwang`；谢逊来源的狮子吼命中 `set_mingjiao_sida_fawang`，少林来源不计该人物主题。
7. **制服**：普通人形敌人默认重伤退场；Boss、野兽不触发；单场关闭后恢复通常击倒结果。
8. **阵法**：三名合格阵员正常成金刚伏魔圈；10 重被动或 `legacy-set:sandu` 三件允许二人成圈且效果 ×0.75；人数不足时不得成阵。
9. **剃度状态**：剃度后少林武学修炼倍率增加 10% 且情缘关闭；还俗同时移除增益并恢复情缘资格，历史门派贡献不在本文重算。
10. **考据门禁**：标 K-01～K-12 的内容只影响命名、来源叙述或章节落点；未经核定不得据此新增规则数值。
11. **AR-01 配额**：加载图鉴后玩家可习得 ID 恰为 74；新增集合须严格等于 `{sk_shaolinchangquan, sk_shaolinhushangun, sk_chanmenshenfa, sk_nanshaolinqiaoshou}`，四门 `grade≤3`，天级集合与扩充前完全相同。
12. **黄阶索引**：从 §1.8 与 §2.5 解析 18 行，ID 集合与全图鉴 `grade∈{1,2,3}` 的玩家可习得集合等值；南少林桥手只原生书剑，其余三门新增不得进入倚天白名单。
13. **装配底座**：逐个展开 `ALL14`，每界检查 §5.5 所列 3 内功、3 拳脚、3 剑均有本土来源，且前置链在同界闭合；任一章节把三条底座来源设为互斥即失败。
14. **经脉零漂移**：标准强度对标准强度时攻、防、速度均为 10000 bp；不得把路线质量再写入 Z3、`Q_skill` 或轻功门禁。
15. **护体顺序**：金刚不坏或少林九阳的合法 IG 防线受拳脚伤害时，依次经过护体真气、护体内劲、`mpGuard`、气血；路线 `reflectBp=0`，既有反震只结算一次。
16. **逐单位隔离**：两名同阵营单位施展相同武学仍各有一个 `MeridianFlowModule`；对任一单位 `preview` 后双方状态与 RNG 游标均不变。
17. **外放零档**：逐一载入 §5.1 审计表的 23 个 `projected` 招式，0 档有效射程等于卡内基础 `range`，有效形状与 `projectionSpreadSteps[0]` 深相等；标准 Profile 不得取得 +2 / +4 格。
18. **外放端点与伤害类型**：对每个外放招展开 `meridianRouteRef`，须至少命中一个合法上肢端点，且所有伤害段均为 `projected`；将任一路线改成不含白名单端点或把一个伤害段改成 `physical` 时构建失败。
19. **不误标**：狮子吼音功、菩提子 / 金刚念珠实体投射、燃木刀普通挥击、轻功位移与护体招均不得出现 `projection:true`；七个待考招在资料补齐前也不得获得扩张档。

---

## 8. 待决事项 / 依赖

### 8.1 替下游给出的建议值

| # | 接收文档 | 建议值 / 接口 | 默认处理 |
|---|---|---|---|
| S-1 | `design/05` | `sk_shaolinshangke.reqs.skills.med = 30`；七重配方 `unlockReqs.skills.alchemy = 40` | 保持；前者是整门武学软门槛，后者只控制大还丹方 |
| S-2 | `design/05`、`design/09` | 罗汉阵 `formation = 30`；金刚伏魔圈 `formation = 50` | 保持；均为软门槛，阵法强度公式仍归 09 |
| S-3 | `design/07` | 本文 11 套装的阈值与效果数值 | 保持为候选；`g_set=floor(median(effGrade))` 已由 C22 定案，不再是建议 |

### 8.2 本文依赖的上游事实

| # | 上游 | 状态 / 事项 |
|---|---|---|
| D-1 | `design/06` | 已解决：73 个唯一 `bf_*` 全部存在（C23）。仍需归属文档确认 `bf_zhaomen` 的玄阶参数、金刚不坏体压制罩门钩子与 `bf_mian_liuxue` 常驻用法 |
| D-2 | `design/07` | 采纳 11 套装的最终成员、阈值、数值；实现 C22 的成员与 `setTags` 双向校验 |
| D-3 | `design/09` | 已解决：金刚伏魔圈、二僧成圈、罗汉阵、十八罗汉 Boss、制服和合璧 CT 均已有接口；实现时以其正式结构为准 |
| D-4 | `design/10` | 建立 §6 所列秘籍、残页、袈裟奇门和“塞耳”物品实体；`it_dahuandan` 已存在，只需挂接配方解锁 |
| D-5 | `design/12`、`design/16` | 已解决职级：均采用 T01 L1–L5（AR-07/08）。仍需承接贡献、还俗后果、制服后的劝降/盘问、武当/红花会好感，以及月钱资源档位 |
| D-6 | `design/03` | 校准金钟大成 `shieldMax +5%` 与一苇渡江大成 `qinggong flat +10` 是否满足上限 |
| D-7 | `chapters/01/02/03/04/05/06/08/12` | 替换占位 NPC/任务；落实射雕易筋经、铜人巷、金刚伏魔圈、少林三战、清凉寺等事件。金刚门不独立已解决，不再作为章节选择题 |
| D-8 | `skills-yitian.md` | 以同一 `sk_shizihou` 配置谢逊来源，并仅对该来源计 `set_mingjiao_sida_fawang` |
| D-9 | `skills-xiaoyao.md` | 保持小无相功观摩上限 8；校验四门少林绝技的 `set_mizong_mingwang` 双向标签与 `npc_jiumozhi` 引用 |
| D-10 | 西域/吐蕃归属图鉴 | 补 `sk_huoyandao × sk_ranmudaofa` synergy 的反向登记 |
| D-11 | `design/05`、F2、`chapters/*` | 按 §5.6 的更新快照重算十四书界全部路线唯一 ID 并集并重配来源；当前十四界仍未完整命中高／中／低武目标区间 |
| D-12 | `chapters/05/06/08/12` | 为少林长拳、少林护山棍、禅门身法与南少林桥手建立可达且不破坏前置闭包的实际授艺来源；书剑前三门须把门派条件覆写为 `sect_nanshaolin` |
| D-13 | AR-14；`design/21` v2.0 | **已解决（本文侧）**：29 门天 / 地、145 招逐一显式绑定，10 条玄上绝招路线显式登记，5 门轻功接速度路线，12 门内功接含离战倍率的调息档案与护体显示档；动态公式仍由 21 唯一拥有（见 §5.7） |
| D-14 | `design/05` §13.7、§2.8 | 铁砂掌部分**已解决**：M4（`b02edfa`）已将 `mv_tieshazhang_jingang` 降为普通招并统一参数；仍需 05 §13.7 同步 `mv_longzhaoshou_daoxu` 为龙爪手第二绝招；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

### 8.3 对基准的修改提案

| # | 提案 | 状态与理由 |
|---|---|---|
| BP-1 | 原提案“05 §14.5 少林 48→70、通行 116→94，总量仍 661” | **已解决并被 AR-01 覆盖**：本轮从 70 补到受控目标 74；全目录采用 `51/169/459/459=1,138`，不再回写旧 661 分配 |
| BP-2 | 武学/招式/被动/秘籍/残页前缀登记 | **已采纳（v1.1）**：基准 §12 已登记 `sk_`、`mv_`、`ps_`、`it_miji_`、`it_canye_`；本文已按该命名执行 |
| BP-3 | 洗髓经保持地上 9，不新增天级 | **已采纳（v1.1）**：基准 §13 天级封闭集合不含洗髓经，本文不得越权升阶 |
| BP-4 | 七十二绝技“戾气”列入 05 §10.2 走火触发源 | **仍提案**：这是组合装配规则，不计单门代价型配额；公式见 §1.3.1 |
| BP-5 | 铁布衫、金钟罩、一苇渡江以原创纳入方式计入 `lg_shaolin72` | **仍提案**：影响同源加速及戾气计数；在基准未收录前保持“原创扩展”，不宣称原著定数 |
| BP-6 | Canon §12 / §18 登记 `mfr_*`、`txp_*` 及 21 的战斗经脉唯一归属 | **待采纳**：沿用 21 §18.3 的 M2-P01、M3-P04；本文先按拟登记前缀引用，不越权定义 |
| BP-7 | Canon §4 明列天 / 地 / 玄上绝招数量区间与默认分配 | **已解决**：M4（`b02edfa`）已在 05 §3.5、§4.8 与 V9 写入十二品数量矩阵；本册按天上 3、天下 2、地上 / 地中 2、地下 1、玄上 1 执行 |

### 8.4 原著考据待办

剩余正文“待考”均归下列 12 项；K-01、K-05～K-12 影响武学名目、来源或事件文本，**不改变本轮规则数值**。K-02、K-03 影响年代/地图或人物文本，亦不在本文越权定案。

| # | 影响 | 需核内容（三联／广州修订版基线） |
|---|---|---|
| K-01 | 规则来源标签 | 《天龙八部》《笑傲江湖》《侠客行》《书剑恩仇录》：须弥山掌、大金刚拳/掌、摩诃指、一指禅、如影随形腿、伏魔杖法、达摩剑法是否出现、用名及施用人物 |
| K-02 | 仅时代文本 | 《射雕英雄传》郭啸天、杨铁心开篇与主线年序；在 `design/02`／基准年表确认前沿用现值 |
| K-03 | 地图与人物文本 | 《书剑恩仇录》南少林段落：天虹、于万亭关系、诸殿考较与寺址表述；最终地图位置归 `design/11` |
| K-04 | 仅文本 | 《天龙八部》藏经阁：扫地僧论绝技与佛法的逐字措辞；本文只保留稳妥大意 |
| K-05 | 来源文本 | 《天龙八部》《鹿鼎记》：拈花指相关论述及澄观是否明确通晓 |
| K-06 | 来源文本 | 《天龙八部》虚竹所习入门功夫中是否明确有韦陀掌 |
| K-07 | 来源标签 | 《鹿鼎记》海大富传韦小宝、韦小宝与康熙过招段落：大慈大悲千叶手用名及少林归属 |
| K-08 | 仅事件文本 | 《倚天屠龙记》光明顶：成昆以幻阴指暗袭者名单与先后次序 |
| K-09 | 地图与传承文本 | 《倚天屠龙记》火工头陀、西域金刚门、阿二阿三的地域和师承层级 |
| K-10 | 来源标签 | 金庸作品中是否出现“少林大还丹”名目及使用情节；物品实体以 `design/10` 为准 |
| K-11 | 来源标签 | 《天龙八部》《鹿鼎记》是否有同名“罗汉阵”及人数；玩家版始终标原创扩展 |
| K-12 | 仅人物文本 | 《天龙八部》神山上人与五台山清凉寺、少林的论武关系及其武功 |

### 8.5 开放问题（附默认值）

| # | 事项 | 当前默认 / 追溯 |
|---|---|---|
| O-1 | 剃度是否关闭情缘线换修炼收益 | **已解决**：采用、修炼 `+10%`、可还俗（作者决定 P32；见 §1.2） |
| O-2 | 幻阴指归属 | **已解决**：收在本文 §3.2，`sect:null`（`rulings-v1` 图鉴分工表） |
| O-3 | 西域金刚门是否独立为 `sect_jingangmen` | **已解决**：不独立，只用自由文本 `lineage: 火工头陀 → 西域金刚门 → 阿二、阿三`（C14；见 §3.1） |
| O-4 | 慈悲武学是否默认“制服” | **已解决**：默认开启、可单场关闭，Boss/野兽例外（作者决定 P47；见 §1.3.2） |
| O-5 | 射雕、神雕少林投放 | **已解决**：均以背景与有限入门为主；只有射雕保留易筋经完整线（作者决定 P49；见 §1.1） |
| O-6 | 易筋经 `nature` 与天级观摩 | **已解决**：`harmony`（P06）；三门天级默认均不可观摩（P09；见 §0.3、§0 通用约定） |
| O-7 | 三项技艺门槛建议值 | 默认采用 S-1/S-2；待 05/09 配表时校准，未拍板前不改变武学品阶或来源 |
| O-8 | 单册名义 `3/9/27/27` 与受控配额冲突 | **已解决**：默认服从 `design/05` §14.5 与全目录 1,138 总闸，终态为 `3/26/27/18`；不删除 17 门既有地阶，也不越配额再补 9 门黄阶 |
| O-9 | 少林图鉴是否自行定义攻防 / 速度乘区与护体内劲公式 | **已解决：否**。本文只登记绑定；公式、调息、结算顺序、逐单位状态与 preview 契约统一见 `design/21` §3–§12（见 §5.7） |
| O-10 | 地中是否统一取 1 还是 2 记绝招 | **已解决**：按 `docs/decisions/ultimate-counts-tianzhong-dizhong.md` 逐门裁定；本册 9 门取 1、龙爪手取 2 |
| O-11 | 七个远程／贯穿候选是否确为离体真气 | 默认保持“待考”、不赋 `projection:true`；待逐字核武学描写或由作者确认表现后，再补基础范围与三档 spread |
