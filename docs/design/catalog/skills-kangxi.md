# 门派武学图鉴 · 康熙前后四书（`skills-kangxi`）

> **归属（基准 §18）**：`design/catalog/skills-*.md` 门派武学图鉴之一。本文只定义《鹿鼎记》《连城诀》《白马啸西风》《鸳鸯刀》组的武学条目、学习关系与套装成员候选。
> **上游**：`docs/decisions/author-decisions.md`、`docs/decisions/author-requirements.md` AR-01/02/03/07/08/14/16、`docs/00-canon.md` §3–§7/§9/§12/§13/§16/§20、`docs/decisions/rulings-v1.md` C12/C14–C17/C22/C23 与 §3–§5、`design/17`、`design/21` v2.0。
> **引用而不重定义**：字段、层数、招式与内功预算见 `design/05`；战斗经脉运行、路线、护体内劲、速度修正与调息见 `design/21`；经脉 / 穴位与永久成长见 `design/15`；伤害乘区见 `design/04`；Buff 本体见 `design/06`；轻功值与门禁见 `design/03`、`design/08`；合击运行见 `design/09` §6.7.4；物品见 `design/10`；门派时代、职级称谓见 `design/17`；套装规则与奖励留给 `design/07`。
> **标注约定**：**（原创扩展）**为原著没有的武学、招名或机制；**（原创扩展命名）**为原著有其人其事而无固定武学名；**（待考）**须以三联/广州修订版逐字核对；**【建议值】**为待唯一归属文档确认的数值。
>
> **版本**：初稿 C1d；审校 C1d.R（2026-09-26）；全局审计（2026-09-27）；经脉系统落地（2026-09-27）；绝招数量调整（2026-09-27）；图鉴一致性审计（2026-09-28）；天中 / 地中绝招数统一（2026-09-28）；外放标记（2026-09-28）；绝招路线叙事化（2026-09-29）。

---

## 0. 阅读指引与统一记法

### 绝招显式路线索引（镜像正文卡，非覆写层；2026-09-28）

本索引镜像正文卡，非覆写层；与正文不一致即为错误，并以正文为准。每记绝招使用独立稳定路线与显式穴位序列。


<!-- skill-catalog-audit:start -->
| 品阶 | 武学 | MoveDef（正文卡镜像） | 路线 ID | steps（acupointRef/segmentCt/riskBp） |
|---|---|---|---|---|
| 10 天下 | `sk_ningxue` | `mv_ningxue_fengmen` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_ningxue_fengmen}` | `mfr_ningxue_fengmen` |`MeridianRouteDef{moveRef:mv_ningxue_fengmen; ultimate:true; purpose:attack}`；`ap_shoujueyin_quze/80/100→ap_shoushaoyin_qingling/80/120→ap_shoutaiyin_chize/80/140→ap_shoutaiyin_yunmen/80/160→ap_yinqiao_zhaohai/80/180→ap_yinwei_zhubin/80/200→ap_zujueyin_yinlian/80/220→ap_zushaoyin_shufu/80/240→ap_zutaiyin_diji/80/260→ap_renmai_chengjiang/80/280` |
| 10 天下 | `sk_ningxue` | `mv_ningxue_jueming` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_ningxue_jueming}` | `mfr_ningxue_jueming` |`MeridianRouteDef{moveRef:mv_ningxue_jueming; ultimate:true; purpose:attack}`；`ap_renmai_qihai/80/100→ap_yinqiao_lieque/80/120→ap_yinwei_zhubin/80/140→ap_zujueyin_taichong/80/160→ap_zushaoyin_fuliu/80/180→ap_zutaiyin_xuehai/80/200→ap_shoujueyin_quze/80/220→ap_shouyangming_quchi/80/240→ap_shouyangming_shousanli/80/260→ap_shouyangming_hegu/80/280` |
| 9 地上 | `sk_shenlongxinfa` | `mv_shenlongxinfa_zuozhen` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_shenlongxinfa_zuozhen}` | `mfr_shenlongxinfa_zuozhen` |`MeridianRouteDef{moveRef:mv_shenlongxinfa_zuozhen; ultimate:true; purpose:defense}`；`ap_yangqiao_fuyang/90/100→ap_yangqiao_shenmai/90/120→ap_yangwei_yamen/90/140→ap_zushaoyang_xuanzhong/90/160→ap_zutaiyang_kunlun/90/180→ap_zuyangming_fenglong/90/200→ap_zuyangming_zusanli/90/220→ap_dumai_shenzhu/90/240` |
| 9 地上 | `sk_shenlongxinfa` | `mv_shenlongxinfa_wanshou` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_shenlongxinfa_wanshou}` | `mfr_shenlongxinfa_wanshou` |`MeridianRouteDef{moveRef:mv_shenlongxinfa_wanshou; ultimate:true; purpose:defense}`；`ap_dumai_mingmen/90/100→ap_dumai_yinjiao/90/120→ap_shoushaoyang_yemen/90/140→ap_shoutaiyang_tianzong/90/160→ap_shouyangming_hegu/90/180→ap_shouyangming_yingxiang/90/200→ap_yangqiao_naoshu/90/220→ap_yangwei_tianliao/90/240` |
| 8 地中 | `sk_yingxiongsanzhao` | `mv_yingxiongsanzhao_diqing` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_yingxiongsanzhao_diqing}` | `mfr_yingxiongsanzhao_diqing` |`MeridianRouteDef{moveRef:mv_yingxiongsanzhao_diqing; ultimate:true; purpose:attack}`；`ap_dumai_changqiang/90/100→ap_dumai_shenzhu/90/120→ap_yangwei_jianjing/90/140→ap_zuyangming_liangqiu/90/160→ap_zuyangming_zusanli/90/180→ap_shouyangming_quchi/90/200→ap_shouyangming_shousanli/90/220→ap_shouyangming_hegu/90/240` |
| 8 地中 | `sk_meirensanzhao` | `mv_meirensanzhao_feiyan` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_meirensanzhao_feiyan}` | `mfr_meirensanzhao_feiyan` |`MeridianRouteDef{moveRef:mv_meirensanzhao_feiyan; ultimate:true; purpose:attack}`；`ap_zujueyin_dadun/90/100→ap_zujueyin_zhongdu/90/120→ap_zushaoyin_shuiquan/90/140→ap_zutaiyin_gongsun/90/160→ap_renmai_danzhong/90/180→ap_renmai_shuifen/90/200→ap_shoujueyin_neiguan/90/220→ap_shoushaoyin_lingdao/90/240` |
| 7 地下 | `sk_hongyingjian` | `mv_hongyingjian_tongxin` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_hongyingjian_tongxin}` | `mfr_hongyingjian_tongxin` |`MeridianRouteDef{moveRef:mv_hongyingjian_tongxin; ultimate:true; purpose:defense}`；`ap_zushaoyang_tongziliao/90/100→ap_zutaiyang_cuanzhu/90/120→ap_zutaiyang_zhiyin/90/140→ap_zuyangming_sibai/90/160→ap_dumai_shangxing/90/180→ap_dumai_zhiyang/90/200→ap_shoushaoyang_yifeng/90/220→ap_shoutaiyang_tinggong/90/240` |
| 7 地下 | `sk_mufuhujian` | `mv_mufuhujian_sheshen` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_mufuhujian_sheshen}` | `mfr_mufuhujian_sheshen` |`MeridianRouteDef{moveRef:mv_mufuhujian_sheshen; ultimate:true; purpose:defense}`；`ap_shoushaoyang_zhongzhu/90/100→ap_shoutaiyang_xiaohai/90/120→ap_shouyangming_sanjian/90/140→ap_yangqiao_jianyu/90/160→ap_yangwei_benshen/90/180→ap_yangwei_yangjiao/90/200→ap_zushaoyang_yangbai/90/220→ap_zutaiyang_shenshu/90/240` |
| 7 地下 | `sk_wangwuposhijian` | `mv_wangwuposhi_kaishan` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_wangwuposhi_kaishan}` | `mfr_wangwuposhi_kaishan` |`MeridianRouteDef{moveRef:mv_wangwuposhi_kaishan; ultimate:true; purpose:attack}`；`ap_shoutaiyang_wangu/90/100→ap_shouyangming_quchi/90/120→ap_yangqiao_fuyang/90/140→ap_yangqiao_shenmai/90/160→ap_yangwei_yamen/90/180→ap_zushaoyang_xuanzhong/90/200→ap_zutaiyang_kunlun/90/220→ap_zuyangming_fenglong/90/240` |
| 9 地上 | `sk_huagumianzhang` | `mv_huagumianzhang_huihuan` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_huagumianzhang_huihuan}` | `mfr_huagumianzhang_huihuan` |`MeridianRouteDef{moveRef:mv_huagumianzhang_huihuan; ultimate:true; purpose:attack}`；`ap_zushaoyin_dazhong/90/100→ap_zushaoyin_yingu/90/120→ap_zutaiyin_taibai/90/140→ap_renmai_huiyin/90/160→ap_renmai_zhongji/90/180→ap_shoujueyin_tianchi/90/200→ap_shoushaoyin_shaochong/90/220→ap_shoutaiyin_kongzui/90/240` |
| 9 地上 | `sk_huagumianzhang` | `mv_huagumianzhang_cangzhen` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_huagumianzhang_cangzhen}` | `mfr_huagumianzhang_cangzhen` |`MeridianRouteDef{moveRef:mv_huagumianzhang_cangzhen; ultimate:true; purpose:attack}`；`ap_renmai_qihai/90/100→ap_yinwei_fuai/90/120→ap_zujueyin_taichong/90/140→ap_zushaoyin_fuliu/90/160→ap_shoujueyin_quze/90/180→ap_shouyangming_quchi/90/200→ap_shoujueyin_neiguan/90/220→ap_shoujueyin_laogong/90/240` |
| 10 天下 | `sk_shenzhao` | `mv_shenzhao_xumai` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_shenzhao_xumai}` | `mfr_shenzhao_xumai` |`MeridianRouteDef{moveRef:mv_shenzhao_xumai; ultimate:true; purpose:defense}`；`ap_yinwei_fuai/80/100→ap_zujueyin_ligou/80/120→ap_zujueyin_zhongfeng/80/140→ap_zushaoyin_taixi/80/160→ap_zutaiyin_shangqiu/80/180→ap_renmai_guanyuan/80/200→ap_renmai_yinjiao/80/220→ap_shoujueyin_quze/80/240→ap_shoushaoyin_qingling/80/260→ap_shoutaiyin_chize/80/280` |
| 10 天下 | `sk_shenzhao` | `mv_shenzhao_huming` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_shenzhao_huming}` | `mfr_shenzhao_huming` |`MeridianRouteDef{moveRef:mv_shenzhao_huming; ultimate:true; purpose:defense}`；`ap_renmai_yinjiao/80/100→ap_shoujueyin_quze/80/120→ap_shoushaoyin_qingling/80/140→ap_shoutaiyin_chize/80/160→ap_shoutaiyin_yunmen/80/180→ap_yinqiao_zhaohai/80/200→ap_yinwei_zhubin/80/220→ap_zujueyin_yinlian/80/240→ap_zushaoyin_shufu/80/260→ap_zutaiyin_diji/80/280` |
| 9 地上 | `sk_xuedaojing` | `mv_xuedaojing_yinren` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_xuedaojing_yinren}` | `mfr_xuedaojing_yinren` |`MeridianRouteDef{moveRef:mv_xuedaojing_yinren; ultimate:true; purpose:attack}`；`ap_renmai_danzhong/90/100→ap_renmai_shuifen/90/120→ap_shoujueyin_neiguan/90/140→ap_shoushaoyin_lingdao/90/160→ap_shoushaoyin_yinxi/90/180→ap_shoutaiyin_yuji/90/200→ap_yinqiao_sanyinjiao/90/220→ap_yinwei_tiantu/90/240` |
| 9 地上 | `sk_xuedaojing` | `mv_xuedaojing_zhaoxue` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_xuedaojing_zhaoxue}` | `mfr_xuedaojing_zhaoxue` |`MeridianRouteDef{moveRef:mv_xuedaojing_zhaoxue; ultimate:true; purpose:attack}`；`ap_renmai_qihai/90/100→ap_yinqiao_zhaohai/90/120→ap_yinwei_qimen/90/140→ap_zujueyin_taichong/90/160→ap_zushaoyin_fuliu/90/180→ap_shoutaiyang_xiaohai/90/200→ap_shoushaoyang_waiguan/90/220→ap_shoutaiyang_yanggu/90/240` |
| 8 地中 | `sk_xuedaofa` | `mv_xuedaofa_cangfeng` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_xuedaofa_cangfeng}` | `mfr_xuedaofa_cangfeng` |`MeridianRouteDef{moveRef:mv_xuedaofa_cangfeng; ultimate:true; purpose:attack}`；`ap_renmai_guanyuan/90/100→ap_renmai_yinjiao/90/120→ap_shoujueyin_quze/90/140→ap_shoushaoyin_qingling/90/160→ap_shoutaiyin_chize/90/180→ap_shoutaiyin_yunmen/90/200→ap_yinqiao_zhaohai/90/220→ap_yinwei_zhubin/90/240` |
| 8 地中 | `sk_xuedaofa` | `mv_xuedaofa_henggu` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_xuedaofa_henggu}` | `mfr_xuedaofa_henggu` |`MeridianRouteDef{moveRef:mv_xuedaofa_henggu; ultimate:true; purpose:attack}`；`ap_renmai_qihai/90/100→ap_yinqiao_zhaohai/90/120→ap_yinwei_zhubin/90/140→ap_zujueyin_taichong/90/160→ap_shoujueyin_quze/90/180→ap_shoushaoyang_waiguan/90/200→ap_shoutaiyang_yanggu/90/220→ap_shouyangming_hegu/90/240` |
| 8 地中 | `sk_tangshijian` | `mv_tangshijian_huanyun` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_tangshijian_huanyun}` | `mfr_tangshijian_huanyun` |`MeridianRouteDef{moveRef:mv_tangshijian_huanyun; ultimate:true; purpose:attack}`；`ap_zuyangming_sibai/90/100→ap_dumai_shangxing/90/120→ap_dumai_zhiyang/90/140→ap_shoushaoyang_yifeng/90/160→ap_shoutaiyang_tinggong/90/180→ap_shouyangming_pianli/90/200→ap_yangqiao_dicang/90/220→ap_yangqiao_pucan/90/240` |
| 8 地中 | `sk_tangshijian` | `mv_tangshijian_liancheng` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_tangshijian_liancheng}` | `mfr_tangshijian_liancheng` |`MeridianRouteDef{moveRef:mv_tangshijian_liancheng; ultimate:true; purpose:attack}`；`ap_renmai_qihai/90/100→ap_chongmai_huangshu/90/120→ap_dumai_shendao/90/140→ap_yangwei_jianjing/90/160→ap_shouyangming_quchi/90/180→ap_shoushaoyang_waiguan/90/200→ap_shoutaiyang_yanggu/90/220→ap_shouyangming_hegu/90/240` |
| 9 地上 | `sk_gaochangshouhujian` | `mv_gaochangshouhu_jieai` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_gaochangshouhu_jieai}` | `mfr_gaochangshouhu_jieai` |`MeridianRouteDef{moveRef:mv_gaochangshouhu_jieai; ultimate:true; purpose:attack}`；`ap_yangqiao_naoshu/90/100→ap_yangwei_tianliao/90/120→ap_zushaoyang_tongziliao/90/140→ap_zutaiyang_cuanzhu/90/160→ap_zutaiyang_zhiyin/90/180→ap_zuyangming_sibai/90/200→ap_dumai_shangxing/90/220→ap_dumai_zhiyang/90/240` |
| 9 地上 | `sk_gaochangshouhujian` | `mv_gaochangshouhu_qianmen` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_gaochangshouhu_qianmen}` | `mfr_gaochangshouhu_qianmen` |`MeridianRouteDef{moveRef:mv_gaochangshouhu_qianmen; ultimate:true; purpose:attack}`；`ap_dumai_jizhong/90/100→ap_dumai_yaoyangguan/90/120→ap_shoushaoyang_yangchi/90/140→ap_shoutaiyang_shaoze/90/160→ap_shouyangming_erjian/90/180→ap_shouyangming_yangxi/90/200→ap_yangqiao_juliao_wei/90/220→ap_yangwei_jinmen/90/240` |
| 7 地下 | `sk_hasakeqishe` | `mv_hasakeqishe_sanshi` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_hasakeqishe_sanshi}` | `mfr_hasakeqishe_sanshi` |`MeridianRouteDef{moveRef:mv_hasakeqishe_sanshi; ultimate:true; purpose:attack}`；`ap_zushaoyin_yongquan/90/100→ap_yangqiao_fuyang/90/120→ap_daimai_zulinqi/90/140→ap_zushaoyang_guangming/90/160→ap_zutaiyang_chengshan/90/180→ap_zuyangming_zusanli/90/200→ap_shoushaoyang_waiguan/90/220→ap_shouyangming_hegu/90/240` |
| 8 地中 | `sk_fuqidaofa` | `mv_fuqidaofa_tongxin` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_fuqidaofa_tongxin}` | `mfr_fuqidaofa_tongxin` |`MeridianRouteDef{moveRef:mv_fuqidaofa_tongxin; ultimate:true; purpose:attack}`；`ap_chongmai_qichong/90/100→ap_daimai_zhangmen/90/120→ap_dumai_mingmen/90/140→ap_yangwei_jianjing/90/160→ap_shoushaoyang_tianjing/90/180→ap_shoushaoyang_waiguan/90/200→ap_shoutaiyang_yanggu/90/220→ap_shouyangming_hegu/90/240` |
| 7 地下 | `sk_weixinliandao` | `mv_weixinliandao_lianying` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_weixinliandao_lianying}` | `mfr_weixinliandao_lianying` |`MeridianRouteDef{moveRef:mv_weixinliandao_lianying; ultimate:true; purpose:attack}`；`ap_shoutaiyang_qiangu/90/100→ap_shoutaiyang_yanglao/90/120→ap_shouyangming_shousanli/90/140→ap_yangqiao_juliao/90/160→ap_yangwei_jianjing/90/180→ap_zushaoyang_guangming/90/200→ap_zushaoyang_zuqiaoyin/90/220→ap_zutaiyang_weizhong/90/240` |
| 6 玄上 | `sk_shenlongzhang` | `mv_shenlongzhang_yazhen` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_shenlongzhang_yazhen}` | `mfr_shenlongzhang_yazhen` |`MeridianRouteDef{moveRef:mv_shenlongzhang_yazhen; ultimate:true; purpose:attack}`；`ap_shoushaoyang_yifeng/100/100→ap_shoutaiyang_tinggong/100/120→ap_shouyangming_pianli/100/140→ap_yangqiao_dicang/100/160→ap_yangqiao_pucan/100/180→ap_yangwei_toulinqi/100/200` |
| 6 玄上 | `sk_manchuqishe` | `mv_manchuqishe_chishe` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_manchuqishe_chishe}` | `mfr_manchuqishe_chishe` |`MeridianRouteDef{moveRef:mv_manchuqishe_chishe; ultimate:true; purpose:attack}`；`ap_shouyangming_yangxi/100/100→ap_yangqiao_juliao_wei/100/120→ap_yangwei_jinmen/100/140→ap_zushaoyang_riyue/100/160→ap_zutaiyang_chengshan/100/180→ap_zutaiyang_xinshu/100/200` |
| 6 玄上 | `sk_xuedaoqinfa` | `mv_xuedaoqinfa_suobi` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_xuedaoqinfa_suobi}` | `mfr_xuedaoqinfa_suobi` |`MeridianRouteDef{moveRef:mv_xuedaoqinfa_suobi; ultimate:true; purpose:attack}`；`ap_renmai_danzhong/100/100→ap_renmai_shuifen/100/120→ap_shoujueyin_neiguan/100/140→ap_shoushaoyin_lingdao/100/160→ap_shoushaoyin_yinxi/100/180→ap_shoutaiyin_yuji/100/200` |
| 6 玄上 | `sk_meinianshengxinfa` | `mv_meinianshengxinfa_huixi` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_meinianshengxinfa_huixi}` | `mfr_meinianshengxinfa_huixi` |`MeridianRouteDef{moveRef:mv_meinianshengxinfa_huixi; ultimate:true; purpose:defense}`；`ap_zushaoyin_rangu/100/100→ap_zutaiyang_cuanzhu/100/120→ap_zutaiyang_zhiyin/100/140→ap_zutaiyin_xuehai/100/160→ap_zuyangming_lidui/100/180→ap_chongmai_futonggu/100/200` |
| 6 玄上 | `sk_gaochangjian` | `mv_gaochangjian_zhuanjiao` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_gaochangjian_zhuanjiao}` | `mfr_gaochangjian_zhuanjiao` |`MeridianRouteDef{moveRef:mv_gaochangjian_zhuanjiao; ultimate:true; purpose:attack}`；`ap_chongmai_shangqu/100/100→ap_daimai_weidao/100/120→ap_yangwei_tianliao/100/140→ap_shoushaoyang_waiguan/100/160→ap_shoutaiyang_wangu/100/180→ap_shouyangming_hegu/100/200` |
| 6 玄上 | `sk_huahuijian` | `mv_huahuijian_yexi` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_huahuijian_yexi}` | `mfr_huahuijian_yexi` |`MeridianRouteDef{moveRef:mv_huahuijian_yexi; ultimate:true; purpose:attack}`；`ap_yinwei_lianquan/100/100→ap_yinqiao_jingming/100/120→ap_zujueyin_xingjian/100/140→ap_shoushaoyin_qingling/100/160→ap_shoushaoyang_waiguan/100/180→ap_shoutaiyang_yanggu/100/200` |
| 6 玄上 | `sk_linyulongdao` | `mv_linyulongdao_zhengxian` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_linyulongdao_zhengxian}` | `mfr_linyulongdao_zhengxian` |`MeridianRouteDef{moveRef:mv_linyulongdao_zhengxian; ultimate:true; purpose:attack}`；`ap_zutaiyang_kunlun/100/100→ap_zuyangming_fenglong/100/120→ap_zuyangming_zusanli/100/140→ap_dumai_shenzhu/100/160→ap_shoushaoyang_sizhukong/100/180→ap_shoushaoyang_zhongzhu/100/200` |
| 6 玄上 | `sk_renfeiyandao` | `mv_renfeiyandao_rangfeng` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_renfeiyandao_rangfeng}` | `mfr_renfeiyandao_rangfeng` |`MeridianRouteDef{moveRef:mv_renfeiyandao_rangfeng; ultimate:true; purpose:attack}`；`ap_zutaiyin_shangqiu/100/100→ap_renmai_guanyuan/100/120→ap_renmai_yinjiao/100/140→ap_shoujueyin_quze/100/160→ap_shoushaoyin_qingling/100/180→ap_shoutaiyin_chize/100/200` |
| 6 玄上 | `sk_taiyueshibeishou` | `mv_taiyueshibei_hengpai` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_taiyueshibei_hengpai}` | `mfr_taiyueshibei_hengpai` |`MeridianRouteDef{moveRef:mv_taiyueshibei_hengpai; ultimate:true; purpose:attack}`；`ap_zuyangming_chengqi/100/100→ap_zuyangming_tianshu/100/120→ap_dumai_shendao/100/140→ap_shoushaoyang_guanchong/100/160→ap_shoushaoyang_zhigou/100/180→ap_shoutaiyang_wangu/100/200` |
<!-- skill-catalog-audit:end -->


### 0.1 数量口径与条目详略

`author-requirements.md` AR-01 虽写“天级为 0–1 门时”，同一条又把 `kangxi` 明列为回退组；本文按这项更具体的作者指示执行：旧分工目标 60 × 1.5 = **90 门**。两门天级仍严格取基准 §13，余量按地:玄:黄约 1:3:3 分配。

| 大阶 | 门数 | 算式 / 说明 | 条目格式 |
|---|---:|---|---|
| 天 | 2 | 仅 `sk_ningxue`、`sk_shenzhao` | 完整条目卡 |
| 地 | 14 | 固定锚点优先，再补各正式组织的进阶链顶点 | 完整条目卡 |
| 玄 | 37 | `14 × 2.64 ≈ 37` | 紧凑卡；111 招中抽样核算 37 招（33.3%） |
| 黄 | 37 | `14 × 2.64 ≈ 37` | 一行表格；只做整体预算核对 |
| **合计** | **90** | `2+14+37+37=90`；地:玄:黄=`1:2.64:2.64`，在 1:3:3 的 ±15% 区间 `[1:2.55:2.55, 1:3.45:3.45]` 内 | — |

唯一武学按 ID 计一次；同一 ID 在不同书界复现不重复计数。敌人专用条目另列且不计 90。天、地阶完整卡列明顶层字段、招式与被动；玄阶紧凑卡仍保留 `nature`、`reqs`、`setTags` 与招式核算；黄阶按 AR-01 使用一行表。

### 0.2 字段、枚举与来源约定

- `category/subType`、`origin`、`nature`、`wOut/wIn`、`weaponReq`、`learnSources`、`special` 等均沿用 `design/05` §2。所有内功的 `nature` 只能是 `yin/yang/harmony`；非内功可以是 `neutral`。
- `reqs.skills` 使用 C17 的十项技艺 ID；`reqs.prereq` 外层 AND、`anyOf` 内层 OR。本文不再使用口头“二选一”或 `special.altPrereq`。
- `sourceChapters` 只表示本土可习得来源：鹿鼎 `ch08_luding`、连城 `ch09_liancheng`、白马 `ch10_baima`、鸳鸯 `ch11_yuanyang`。原著未提供传授链的来源均标**（原创扩展）**。
- 完整卡中的 `q_*`、`npc_*`、`it_*` 若尚未由唯一归属文档登记，只是语义占位引用，不算本文新增 ID；下游须在正式落表时查重、定号。本文不会以占位号反向定义任务、NPC 或物品。
- `sect_*`、时代开放与职级称谓服从 `design/17`。平西王府、南四奇、梅念笙/丁典/狄云、吕梁三杰、华辉、太岳四侠、林玉龙/任飞燕不是独立门派 ID，使用 `sect:null + lineage`。
- 弓箭武学按 C16 为 `hidden/hidden`，用 `apHidden` 与暗器栏；`dualWield` 只表示左右互搏有效层数，本文不写入该字段。双刀招式改用 `weaponReq.dual:true` 检查同类副手或成对兵器。
- `meridians` 已进入 `design/05` 的 `InnerDef` 接口；本文只使用 `design/15` 已定稿的正式 `mer_*` ID，具体穴位效果仍唯一归 15。

### 0.3 招式表与核算记法

完整卡招式列为“招式（ID）｜重｜范围·射程·投送｜倍率｜耗内/cd/收招｜附带｜架｜核算”。玄阶紧凑卡将同样信息压成一行。公式严格沿用 `design/05` §4.2：

```text
power = AF × (1 + Σadj) × K_delivery × K_parry − Σcost_buff − Σcost_disp
```

| 记号 | 本文写法 |
|---|---|
| 冷却 | `cd n` 写 `+0.12n` |
| 耗内 | 相对黄/玄/地/天基准 5%/6%/7%/8%，每 ±1pp 写 `±0.05` |
| 收招 | 每比 1000 多/少 100，写 `±0.07` |
| 条件 | 常见 `+0.15`；罕见 `+0.30` |
| 投送 | 近身 1；远程气劲 0.85；投射 0.92 |
| 不可招架 | `Kp=0.85` |
| Buff | 只按 `design/05` §4.2 已列的 **1 回合建议价**：定身/眩晕 `0.25×率`；封穴 `0.20×率`；内伤/破甲/流血/减速 `0.10×率`；自身增益 0.10–0.20。多回合效果不得自行乘持续回合，须由 05/06 另定 |
| 位移 | 击退 0.05/格；拉拽或突进 0.10；换位/绕背 0.15 |
| 绝招 | `3.00×AF×Kd×Kp−成本`；气势 100、耗内为大阶基准+2pp、收招 1200 |

四书均为低武，核心武学有效层数上限 8；所以每门核心武学的首个绝招都在第 7 重或更早。`aoe_*` 的几何表仍引用 `design/05` §4.3；六角格落点由 `design/09` 决定，不在本文另画旧方格模板。

### 0.4 内功贡献与五级职级

内功第 10 重主运贡献核算为：

```text
IP = mpMaxPct + hpMaxPct + 2 × Σattrs + 5 × mpRegen
```

目标预算：黄下/中/上 19/24/30，玄下/中/上 41.5/48.5/57，地下/中/上 72/83/94.5，天下 118；IP 总额允许 ±5%，`mpMaxPct`、`hpMaxPct`、`Σattrs`、`mpRegen` 四项各自相对该品阶标准值允许 ±30%。`stats` 不计入 IP，但不得超过该大阶 `layerStats` 上限。

下表只列“到此职级可学的本文武学”，月钱与资源留给 `design/16`；L1–L5 与称谓完全取 `design/17`。同格中更高阶仍须满足属性、技艺、前置与剧情来源，不因晋升自动学会。

| 组织 | L1 | L2 | L3 | L4 | L5 |
|---|---|---|---|---|---|
| 天地会 `sect_tiandihui`（会众→骨干→香主→堂主/舵主→总舵主） | `sk_tiandihuiquan` | `sk_xiangtangbu` | `sk_tiandihuidao` | `sk_hongyingjian` | `sk_ningxue`（另需陈近南线） |
| 神龙教 `sect_shenlongjiao`（教众→旗弟子→龙使→护法→教主） | `sk_shenlongrumenquan` | `sk_shenlongshebu` | `sk_shenlongzhang` | `sk_yingxiongsanzhao` / `sk_meirensanzhao` | `sk_shenlongxinfa` |
| 沐王府 `sect_muwangfu`（家丁→府兵→亲随→家老/统领→府主） | `sk_mufujichujian` | `sk_muwangbu` | `sk_muwangquan` / `sk_muwangjian` | `sk_mufuhujian` | 同左，L5 只开放传授权 |
| 王屋派 `sect_wangwu`（寨众→弟子→香主→副寨主→首领） | `sk_wangwujibenjian` | `sk_wangwuxinfa` | `sk_wangwuzhang` / `sk_wangwujian` | `sk_wangwuposhijian` | 同左，L5 只开放传授权 |
| 清宫 `sect_qinggong`（侍卫学员→三等侍卫→一等侍卫→统领/供奉→总教头） | `sk_daneichangquan` / `sk_yulinjian` | `sk_daneishenfa` | `sk_bukushuaijiao` / `sk_manchuqishe` | `sk_huagumianzhang`（海大富来源另判） | 同左；帝王不是 L5 |
| 血刀门 `sect_xuedaomen`（行脚弟子→入门僧→亲传→上师/护法→老祖） | `sk_xuedaorumenquan` / `sk_xuedaojichudao` | `sk_xuedaoxinfa` | `sk_xuedaojibu` | `sk_xuedaofa` | `sk_xuedaojing` |
| 万家门 `sect_wanjia`（家仆→门下弟子→得意弟子→总管/师叔→门主） | `sk_wanjiaquan` / `sk_wanjiajibenjian` | `sk_wanjiajian` | `sk_wanjiaxinfa` | `sk_tangshijian` | 同左，L5 只开放传授权 |
| 高昌遗脉 `sect_gaochang`（寻路人→守门人→传承者→护藏人→守藏首领） | `sk_gaochangjibenjian` / `sk_gaochangtuna` | `sk_migongbu` | `sk_gaochangjian` / `sk_gaochanggong` | `sk_gaochangjiguan` | `sk_gaochangshouhujian` |
| 哈萨克部族 `sect_hasake`（客人/牧人→勇士→亲随→长老/头人→部族首领） | `sk_caoyuanquan` / `sk_caoyuandao` | `sk_hasakehuxi` | `sk_hasakeshuai` / `sk_hasakexinfa` | `sk_hasakeqishe` | 同左；称谓仍待民族史复核 |
| 威信镖局 `sect_weixinbiaoju`（趟子手→镖师→镖头→总镖头/坐柜→总号主） | `sk_weixinbiaoquan` / `sk_weixinjian` | `sk_hangzhen` | `sk_biaojudaofa` / `sk_weixinbian` | `sk_weixinliandao` | 同左，L5 只开放传授权 |

非组织传承不套月钱职级：平西王府武备按剧情军职来源；南四奇、梅念笙、丁典/狄云、吕梁三杰、华辉、太岳四侠、林玉龙/任飞燕及袁冠南/萧中慧均按师承、羁绊或奇遇判定。

### 0.5 天级闭集与跨图鉴引用

| 武学 | ID | 品阶 | 类别 | 门派 / 传承 | 原生书界 |
|---|---|---:|---|---|---|
| 凝血神爪 | `sk_ningxue` | 10 天下 | 拳脚·擒拿 | 天地会·陈近南 | 鹿鼎 |
| 神照经 | `sk_shenzhao` | 10 天下 | 内功·调和 | 丁典 → 狄云 | 连城 |

本组不新增任何天级。鹿鼎另可本土习得神行百变 `sk_shenxing`，其唯一武学定义归 `skills-xiake-bixue`；通行轻功 `sk_yanzisanchaoshui`、`sk_dengpingdushui`、`sk_caoshangfei` 由 `skills-general` 定义，`sk_babuganchan` 仅为 `design/08` 的待收录建议且当前禁用，通行拳脚 `sk_taizuchangquan` 由 `design/05` §13.5 定义，本文均只引用、不重复定义。

---

## 1. 本组门派、传承与配额一览

### 1.1 组织与传承边界

| 书界 | 组织 / 传承 | `sect` / `lineage` | 时代与称谓依据 | 风格 | 本文门数 |
|---|---|---|---|---|---:|
| 鹿鼎 | 天地会 | `sect_tiandihui` | `design/17` §8.5，LD 为 O，T05B | 擒拿、短刀、密巷接应 | 5 |
| 鹿鼎 | 神龙教 | `sect_shenlongjiao` | `design/17` §9.8，LD 为 O，T06/T09 | 掌、蛇行、受制与反制 | 6 |
| 鹿鼎 | 沐王府 | `sect_muwangfu` | `design/17` §10.7，LD 为 O，T04/T08 | 护主剑、协防拳 | 5 |
| 鹿鼎 | 王屋派 | `sect_wangwu` | `design/17` §8.6，LD 为 O，T05B/T03 | 山道剑、击退掌 | 5 |
| 鹿鼎 | 清宫、大内与满洲武士 | `sect_qinggong` | `design/17` §10.6，LD/YY 为 O，T08 | 布库、骑射、宫墙身法 | 7 |
| 鹿鼎 | 平西王府武备 | `sect:null` / 平西王府军士 | `design/17` 未设独立门派 ID，按裁定不用新造 `sect_*` | 军刀、军中吐纳 | 2 |
| 连城 | 血刀门 | `sect_xuedaomen` | `design/17` §9.9，LC 为 O，T01 邪派变体 | 血刀、雪地反击 | 7 |
| 连城 | 万家门 | `sect_wanjia` | `design/17` §7.15，LC 为 O，T04/T03 | 唐诗剑谱、佯攻 | 5 |
| 连城 | 梅念笙—丁典—狄云 | `sect:null` / 梅念笙一门 | 人物传承，不虚造组织 | 神照、连城剑理、狱中求生 | 7 |
| 连城 | 南四奇“落花流水” | `sect:null` / 南四奇 | 临时并称，不虚造组织 | 合守剑、雪谷协防 | 3 |
| 白马 | 高昌遗脉 | `sect_gaochang` | `design/17` §7.18，BM 为 O，T07 | 狭道剑、迷宫步、机关 | 7 |
| 白马 | 哈萨克部族 | `sect_hasake` | `design/17` §7.19，BM 为 O，T07 | 骑射、摔角、弯刀 | 6 |
| 白马 | 吕梁三杰 | `sect:null` / 吕梁三杰 | 人物组合，关系与姓名待考 | 刀拳、追踪 | 2 |
| 白马 | 华辉 | `sect:null` / 华辉 | 单人传承，人物关系待考 | 快剑、夜行 | 3 |
| 鸳鸯 | 威信镖局 | `sect_weixinbiaoju` | `design/17` §8.8，YY 为 O，T05B 镖局变体 | 护车、连刀、镖鞭 | 6 |
| 鸳鸯 | 林玉龙、任飞燕夫妇 | `sect:null` / 林任夫妇 | 人物夫妻传承 | 夫妻刀、争合互援 | 5 |
| 鸳鸯 | 太岳四侠 | `sect:null` / 太岳四侠 | 临时组合，不虚造组织 | 怪招、石碑、插科打诨 | 4 |
| 鸳鸯 | 袁冠南、萧中慧 | `sect:null` / 鸳鸯双侠 | 人物传承，关系细节待考 | 双刀、仁者制敌 | 3 |
| 鸳鸯 | 大内押刀侍卫 | `sect_qinggong` | 沿用清宫同一 ID，不另建“乾隆大内” | 双刀合围 | 2 |
| **合计** | — | — | — | — | **90** |

### 1.2 分书界与品阶

| 书界 | 天 | 地 | 玄 | 黄 | 合计 | 顶点 |
|---|---:|---:|---:|---:|---:|---|
| 鹿鼎 | 1 | 7 | 11 | 11 | 30 | 凝血神爪（天下） |
| 连城 | 1 | 3 | 9 | 9 | 22 | 神照经（天下） |
| 白马 | 0 | 2 | 8 | 8 | 18 | 高昌守护剑（地上，原创扩展） |
| 鸳鸯 | 0 | 2 | 9 | 9 | 20 | 夫妻刀法（地中）；无天级 |
| **合计** | **2** | **14** | **37** | **37** | **90** | 与基准 §13 闭合 |

### 1.3 正式组织的“黄 → 玄 → 地”链

| 组织 | 入门（黄） | 进阶（玄） | 顶点（地） | 前置闭合 |
|---|---|---|---|---|
| 天地会 | `sk_tiandihuiquan` | `sk_tiandihuidao` | `sk_hongyingjian` | 4 重 → 5 重 |
| 神龙教 | `sk_shenlongrumenquan` | `sk_shenlongzhang` | `sk_shenlongxinfa` | 4 重 → 6 重；内功也可由英雄/美人任一 5 重满足 |
| 沐王府 | `sk_mufujichujian` | `sk_muwangjian` | `sk_mufuhujian` | 4 重 → 6 重 |
| 王屋派 | `sk_wangwujibenjian` | `sk_wangwujian` | `sk_wangwuposhijian` | 4 重 → 6 重 |
| 清宫 | `sk_daneichangquan` | `sk_bukushuaijiao` | `sk_huagumianzhang` | 4 重 → 海大富支线；非普通晋升自动授予 |
| 血刀门 | `sk_xuedaojichudao` | `sk_xuedaoxinfa` | `sk_xuedaofa` → `sk_xuedaojing` | 4 重 → 5 重 → 7 重 |
| 万家门 | `sk_wanjiajibenjian` | `sk_wanjiajian` | `sk_tangshijian` | 4 重 → 6 重 |
| 高昌遗脉 | `sk_gaochangjibenjian` | `sk_gaochangjian` | `sk_gaochangshouhujian` | 4 重 → 6 重 |
| 哈萨克部族 | `sk_caoyuanquan` | `sk_hasakeshuai` | `sk_hasakeqishe` | 4 重 → 5 重；骑射另需 `apHidden` |
| 威信镖局 | `sk_weixinbiaoquan` | `sk_biaojudaofa` | `sk_weixinliandao` | 4 重 → 6 重 |

每个正式组织都有黄阶入门拳或剑。非组织传承采用共享链：梅念笙系 `sk_xiangxituna → sk_meinianshengxinfa → sk_shenzhao`；南四奇 `sk_nansiqijibenjian → sk_luohualiushuijian → sk_tangshijian`；吕梁/华辉 `sk_lvliangquan → sk_huahuijian → sk_gaochangshouhujian`（终点为迷宫印证，原创扩展）；太岳/林任 `sk_taiyuequan → sk_linyulongdao → sk_fuqidaofa`。

---

## 2. 鹿鼎书界：天、地阶完整条目

### 2.1 `sk_ningxue` 凝血神爪（10 天下 · 拳脚/擒拿 · 天地会）

| 字段 | 值 |
|---|---|
| 出处 | 《鹿鼎记》陈近南武学；名称与人物有原著依据，具体招式名、凝血症状与传授段落**（待考）** |
| origin / sect / lineage | `canonExpanded` / `sect_tiandihui` / 陈近南 |
| sourceChapters | `[ch08_luding]`，与基准 §13 完全一致 |
| nature · wOut/wIn · moveSlots | `yin` · `0.35/0.65` · 5 |
| reqs | `attrs {agi:60,wil:55}`；`aptitude {apGrapple:60}`；`sect {id:sect_tiandihui,rank:4}`；`prereq [{skill:sk_hongyingjian,layer:6}]`；`hard:[attrs,aptitude,sect,prereq]`；陈近南羁绊来源以 `reqsOverride {sect:null,prereq:[]}` 删除组织与前置，按 C17 §4.3 同步得到有效 `hard:[attrs,aptitude]` |
| layerStats | `{hit:[4,12], pierce:[3,8]}`，合计 20（天阶上限） |
| 层数要点 | 1 重凝血一爪；2 重锁喉探脉；3 重截脉；5 重追魂；**7 重绝招逆爪封门**；8 重凝而不散；**9 重绝招一爪凝血**；10 重神爪大成 |
| setTags | `[]` |
| conflicts | 无；`bf_ningxue` 与其他持续伤害仍受 06 的 DOT 总上限 |
| special / observable | `{fusible:false}` / `false`（天阶默认不可观摩） |
| learnSources | `master npc_chenjinnan maxLayer:10`；改命线遗谱 `manual it_ningxue_miji maxLayer:8` **（原创扩展）**；两者共用鹿鼎天级获取账本 |
| description | 陈近南的擒拿绝学，爪劲不求撕裂，而令中者血行渐滞。具体伤理以 `bf_ningxue` 为准，不把游戏数值冒充原著医理。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 凝血一爪 `mv_ningxue_yizhua` **（原创扩展命名）** | 1 | 单体·1·近身 | 0.95 | 8%/0/1000 | `bf_ningxue` 30%·5 | 可 | `1.00−0.10×0.30=0.97≈0.95` |
| 锁喉探脉 `mv_ningxue_tanmai` **（原创扩展命名）** | 2 | 单体·1·近身 | 1.00 | 8%/0/1000 | — | 可 | `1.00×(1+0)×1×1−0=1.00` |
| 截脉 `mv_ningxue_jiemai` **（原创扩展命名）** | 3 | 单体·1·近身 | 1.10 | 9%/1/1000 | `bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)` 35%·1 | 可 | `1×(1+0.12+0.05)−0.20×0.35=1.10` |
| 追魂入脉 `mv_ningxue_zhuihun` **（原创扩展命名）** | 5 | `aoe_behind`·1–2·近身 | 0.95 | 9%/2/1000 | 绕背；`bf_ningxue` 50%·5 | 可 | `0.90×(1+0.24+0.05)−0.15−0.10×0.50=0.96≈0.95` |
| 逆爪封门 `mv_ningxue_fengmen`（绝招，**原创扩展命名**） | 7 | 单体·1·近身 | 3.00 | 10%/—/1200 | `bf_shiheng` 20%·1；气势 100 | 可 | `3.00−0.10×0.20=2.98≈3.00`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |
| 一爪凝血 `mv_ningxue_jueming`（绝招，**原创扩展命名**） | 9 | 单体·1·近身 | 2.80 | 10%/—/1200 | `bf_ningxue` 100%·5；`bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)` 50%·1 | 可 | `3.00−0.10−0.20×0.50=2.80`；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 凝血入脉 | `ps_ningxue_rumai` | 4 | 对已有 `bf_ningxue` 的目标 Z3 `+4%→+10%` |
| 秘传解法 | `ps_ningxue_jiefa` | 6 | 自身可用 `circulate` 逐级削弱同品以下 `bf_ningxue`；不授予通用毒免 |
| 凝而不散 | `ps_ningxue_busan` | 8 | 本武学施加的 `bf_ningxue` 持续 +1；仍受 DOT 总上限 |
| 神爪大成 | `ps_ningxue_dacheng` | 10 | 本武学效果命中 +10pp，耗内 −10% |

### 2.2 `sk_shenlongxinfa` 神龙心法（9 地上 · 内功 · 神龙教）

| 字段 | 值 |
|---|---|
| 出处 | 据《鹿鼎记》洪安通深厚武功与神龙教体系扩写；原著无同名成套心法，故为**（原创扩展）** |
| origin / sect / lineage | `expanded` / `sect_shenlongjiao` / 洪安通一系 |
| sourceChapters | `[ch08_luding]` |
| nature · wOut/wIn · moveSlots | `yang` · `0/1` · 4 |
| meridians | `[mer_dumai, mer_yangwei]` **【建议值】** |
| reqs | `attrs {con:55,wil:60}`；`aptitude {apInner:55}`；`sect {id:sect_shenlongjiao,rank:5}`；`prereq [{anyOf:[{skill:sk_yingxiongsanzhao,layer:5},{skill:sk_meirensanzhao,layer:5}]}]`；`hard:[aptitude,sect,prereq]` |
| inner.contribution | `{mpMaxPct:34,hpMaxPct:19,attrs:{con:7,wil:5,str:2},mpRegen:2.7}`；`IP=34+19+2×14+5×2.7=94.5`；`stats {resPoison:8,resMind:7}` 合计 15 |
| layerStats | —（内功不用 `layerStats`） |
| 层数要点 | 1 重神龙吐纳；3 重蛇岛辟毒；**7 重绝招坐镇**；**9 重绝招万寿护体**；10 重圆满 |
| setTags | `[set_shenlong_jiaozhu]` |
| conflicts | 与阴性主运按 05 §5.4 处理阴阳相冲；不免疫 `bf_shouzhi` |
| special / observable | `{fusible:true}` / `true` |
| learnSources | 神龙岛密室 `puzzle q_08_faction_02 maxLayer:8` **（原创扩展）**；洪安通/苏荃支线完整传授 `maxLayer:10` **（原创扩展）** |
| description | 神龙教为洪安通坐镇、抗毒与震慑配出的阳性心法。强在护体与心志，不把教众颂圣直接写成内功数值。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 神龙吐息 `mv_shenlongxinfa_tuxi` **（原创扩展）** | 1 | 单体·1–4·远程 | 0.95 | 8%/1/1000 | `bf_zhenshe` 25%·1 | 可 | `1×(1+0.12+0.05)×0.85−0.15×0.25=0.96≈0.95`；`MoveDef{range:{min:1,max:4}; aoe:{tpl:aoe_single}; projection:true; projectionSpreadSteps:[{tpl:aoe_single},{tpl:aoe_single},{tpl:aoe_single}]; DamageKind:'projected'; meridianRouteRef:mfr_shenlongxinfa_tuxi}` |
| 坐镇 `mv_shenlongxinfa_zuozhen`（绝招，**原创扩展**） | 7 | 自身·支援 | 0 | 9%/—/1200 | `bf_shoushi` 100%·3；气势 100 | — | `power=0`；支援绝招以气势 100、地阶基准耗内 +2pp 与收招 1200 支付；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 万寿护体 `mv_shenlongxinfa_wanshou`（绝招，**原创扩展**） | 9 | 自身·支援 | 0 | 9%/—/1200 | `bf_hutizhenqi` 100%·3，护体=`hpMax×18%×1.2=21.6%` | — | 支援预算：地阶标准治疗 18% 等价护体 ×1.2；气势 100；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 蛇岛辟毒 | `ps_shenlongxinfa_bidu` | 3 | `resPoison +4→+10`；不等于 `bf_mian_du` |
| 教主坐镇 | `ps_shenlongxinfa_zuozhen` | 5 | 本回合未移动时 `parry +5→+12` |
| 神龙圆满 | `ps_shenlongxinfa_dacheng` | 10 | 气血低于 30% 时一次获得 `bf_hutizhenqi`，护体 10% hpMax，每战 1 次 |

### 2.3 `sk_yingxiongsanzhao` 英雄三招（8 地中 · 拳脚/拳）

| 字段 | 值 |
|---|---|
| 出处 | 《鹿鼎记》洪安通、韦小宝相关武学；“子胥举鼎、鲁达拔柳、狄青降龙”招名、创者与传授细节**（待考）** |
| origin / sect / lineage | `canonExpanded` / `sect_shenlongjiao` / 洪安通 |
| sourceChapters | `[ch08_luding]` |
| nature · wOut/wIn · moveSlots | `yang` · `0.75/0.25` · 4 |
| reqs | `attrs {str:50,con:45}`；`aptitude {apFist:50}`；`sect {id:sect_shenlongjiao,rank:4}`；`prereq [{skill:sk_shenlongzhang,layer:5}]`；`hard:[aptitude,sect,prereq]` |
| layerStats | `{parry:[3,8],counter:[3,7]}`，合计 15 |
| 层数要点 | 1 重子胥举鼎；3 重鲁达拔柳；6 重英雄回势；**7 重绝招狄青降龙**；9 重三雄并起（普通招）；10 重三招随心 |
| setTags | `[set_shenlong_jiaozhu]` |
| conflicts | 无；Boss 反制次数与阶段重置见 `design/09` §8.9，玩家版每招每战 1 次 |
| special / observable | `{reactionMoves:true,fusible:true}` / `true` |
| learnSources | 洪安通传授 `maxLayer:10`；韦小宝演示 `observe maxLayer:6`（具体深浅待考） |
| description | 三招借古代英雄典故写举、拔、降之势，擅长把控制与位移反转。触发流程归 `design/09`，本卡只定招式输入；“英雄回势”只是本作补足战斗循环的派生收势，不宣称原著另有第四招。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 子胥举鼎 `mv_yingxiongsanzhao_zixu` | 1 | `aoe_knock n2`·1·近身 | 1.10 | 8%/2/1100 | 拉至身前再击退 2 | 可 | `0.95×(1+0.24+0.05+0.07)−0.10−0.05×2=1.09≈1.10` |
| 鲁达拔柳 `mv_yingxiongsanzhao_luda` | 3 | `aoe_swap`·1·近身 | 1.00 | 8%/1/1000 | 换位；常见触发“被背击/被击退” | 可 | `0.85×(1+0.12+0.05+0.15)−0.15=0.97≈1.00` |
| 狄青降龙 `mv_yingxiongsanzhao_diqing`（绝招；招名原著依据**待考**） | 7 | `aoe_around`·近身 | 2.15 | 9%/—/1200 | `bf_zhenshe` 65%·1；气势 100 | 可 | N=6、AF=0.75；`3×0.75−0.15×0.65=2.1525≈2.15`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 英雄回势 `mv_yingxiongsanzhao_huishi` **（原创扩展）** | 6 | 单体·1·近身 | 1.20 | 8%/1/1000 | — | 可 | `1×(1+0.12+0.05)=1.17≈1.20` |
| 三雄并起 `mv_yingxiongsanzhao_sanxiong`（普通招，**原创扩展命名**） | 9 | `aoe_cone {angle:120,r:1,dirCount:6}`·近身 | 1.05 | 8%/2/1100 | 击退 1；`bf_shiheng` 60%·1 | 可 | N=3、AF=0.85；`0.85×(1+0.24+0.05+0.07)−0.05−0.10×0.60=1.046→1.05`；`MoveDef{unlock:9; ultimate:false; rageCost:0; mpCost:8%; cd:2; recovery:1100}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 以制为机 | `ps_yingxiong_yizhiweiji` | 2 | 首次遭受位移或硬控时，对应反应招不耗行动；每战 1 次 |
| 三招有备 | `ps_yingxiong_youbei` | 6 | 三个反应招各自独立计次，不可由再动刷新 |
| 随心 | `ps_yingxiong_suixin` | 10 | 反应招效果命中 +10pp |

### 2.4 `sk_meirensanzhao` 美人三招（8 地中 · 拳脚/拳）

| 字段 | 值 |
|---|---|
| 出处 | 《鹿鼎记》苏荃、韦小宝相关武学；“贵妃回眸、小怜横陈、飞燕回翔”及创者归属**（待考）** |
| origin / sect / lineage | `canonExpanded` / `sect_shenlongjiao` / 苏荃一系 |
| sourceChapters | `[ch08_luding]` |
| nature · wOut/wIn · moveSlots | `yin` · `0.55/0.45` · 4 |
| reqs | `attrs {agi:55,wis:45}`；`aptitude {apFist:45}`；`sect {id:sect_shenlongjiao,rank:4}`；`prereq [{skill:sk_shenlongshebu,layer:5}]`；`hard:[sect,prereq]` |
| layerStats | `{eva:[4,9],counter:[2,6]}`，合计 15 |
| 层数要点 | 1 重贵妃回眸；3 重小怜横陈；6 重顾盼回身；**7 重绝招飞燕回翔**；9 重三美流转（普通招）；10 重顾盼随心 |
| setTags | `[set_shenlong_jiaozhu]` |
| conflicts | 无；玩家版锁血每战 1 次，不能和同一伤害事件的其他锁血重复触发 |
| special / observable | `{reactionMoves:true,fusible:true}` / `true` |
| learnSources | 苏荃羁绊传授 `maxLayer:10`；韦小宝演示 `observe maxLayer:5` **（待考）** |
| description | 以回眸、横陈、回翔化解近身危局，轻灵中藏反击。招名考据未定，效果与触发均为游戏化扩展；“顾盼回身”只是三招之间的派生转式，不宣称原著另有第四招。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 贵妃回眸 `mv_meirensanzhao_guifei` | 1 | 单体·1·近身 | 1.00 | 7%/1/1000 | `bf_mihuo` 40%·1 | 可 | `1×(1+0.12)−0.25×0.40=1.02≈1.00` |
| 小怜横陈 `mv_meirensanzhao_xiaolian` | 3 | 自身·反应 | 0 | 8%/5/1000 | 致死伤害时 `bf_suoxue` ×1，后撤 2；每战 1 次 | — | `power=0`；机制由 cd5、每战 1 次与气势外 8% 内力支付 |
| 飞燕回翔 `mv_meirensanzhao_feiyan`（绝招；招名原著依据**待考**） | 7 | 单体·1–4·投射 | 2.60 | 9%/—/1200 | 后跃 3；`bf_mabi` 30%·1；气势 100 | 可 | `3×0.92−0.10−0.25×0.30=2.585≈2.60`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 顾盼回身 `mv_meirensanzhao_huishen` **（原创扩展）** | 6 | 单体·1·近身 | 1.15 | 8%/1/1000 | `bf_mihuo` 20%·1 | 可 | `1×(1+0.12+0.05)−0.25×0.20=1.12≈1.15` |
| 三美流转 `mv_meirensanzhao_sanmei`（普通招，**原创扩展命名**） | 9 | `aoe_behind`·1–3·近身 | 0.95 | 8%/2/1100 | 绕背；`bf_mihuo` 50%·1 | 可 | `0.90×(1+0.24+0.05+0.07)−0.15−0.25×0.50=0.949→0.95`；`MoveDef{unlock:9; ultimate:false; rageCost:0; mpCost:8%; cd:2; recovery:1100}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 顾盼 | `ps_meirensanzhao_gupan` | 2 | 被背击时该次招架 +10pp |
| 燕回 | `ps_meirensanzhao_yanhui` | 6 | 自身位移后获得 `bf_youshi` 1 回合，每 3 回合 1 次 |
| 随心 | `ps_meirensanzhao_suixin` | 10 | 反应招耗内 −15% |

### 2.5 `sk_hongyingjian` 红缨护会剑（7 地下 · 兵器/剑 · 天地会）

| 字段 | 值 |
|---|---|
| 出处 | 天地会秘密结社与会众持械的本作归纳，原著无此剑法名，**（原创扩展）** |
| origin / sect / sourceChapters | `expanded` / `sect_tiandihui` / `[ch08_luding]` |
| nature · wOut/wIn | `neutral` · `0.75/0.25`；`weaponReq {category:sword}` |
| reqs | `aptitude {apSword:40}`；`sect {id:sect_tiandihui,rank:4}`；`prereq [{skill:sk_tiandihuidao,layer:5}]`；`hard:[sect,prereq]` |
| layerStats / layers | `{parry:[3,8],hit:[2,7]}`；1 红缨点腕、2 会众交锋、4 香堂接刃、5 秘巷回锋、**7 绝招十堂同心**、10 圆满 |
| setTags / special / observable | `[]` / `{fusible:true}` / `true` |
| learnSources / description | 总舵护卫任务 `maxLayer:8`；陈近南传授 `maxLayer:10` **（原创扩展）**。以护送、接应为纲的剑法，不代表史实天地会拳谱。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 红缨点腕 `mv_hongyingjian_dianwan` **（原创扩展）** | 1 | 单体·1·近身 | 0.95 | 7%/0/1000 | `bf_pojian` 30%·1 | 可 | `1−0.10×0.30=0.97≈0.95` |
| 会众交锋 `mv_hongyingjian_jiaofeng` **（原创扩展）** | 2 | 单体·1·近身 | 1.10 | 7%/1/1000 | — | 可 | `1×(1+0.12)=1.12≈1.10` |
| 香堂接刃 `mv_hongyingjian_jieren` **（原创扩展）** | 4 | 自身架势 | 0 | 6%/2/900 | `bf_yuanhu` 100%·2 | — | `power=0`；援护按支援招、cd2 与伤害转移风险定价 |
| 秘巷回锋 `mv_hongyingjian_huifeng` **（原创扩展）** | 5 | `aoe_line n2`·近身 | 1.20 | 8%/2/1100 | — | 可 | N=2、AF=0.90；`0.90×(1+0.24+0.05+0.07)=1.22≈1.20` |
| 十堂同心 `mv_hongyingjian_tongxin`（绝招，**原创扩展**） | 7 | `aoe_cone {angle:120,r:1,dirCount:6}`·近身 | 2.55 | 9%/—/1200 | 相邻友方每人使 Z3 +3%，最多 +9% | 可 | N=3、AF=0.85；`3×0.85=2.55`；相邻友方只影响命中后的 Z3，不改变 `power`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 护会 | `ps_hongyingjian_huhui` | 3 | 相邻友方被单体攻击时援护概率 +10pp |
| 秘巷接应 | `ps_hongyingjian_jieying` | 6 | 巷道/室内 `mov +1`，不改变轻功境界 |
| 红缨圆满 | `ps_hongyingjian_dacheng` | 10 | 招架后自身 `ct +100`，每回合 1 次 |

### 2.6 `sk_mufuhujian` 沐府护主剑（7 地下 · 兵器/剑 · 沐王府）

| 字段 | 值 |
|---|---|
| 出处 | 据《鹿鼎记》沐王府众人护主行动扩写，非史实沐氏家传武谱，**（原创扩展）** |
| origin / sect / sourceChapters | `expanded` / `sect_muwangfu` / `[ch08_luding]` |
| nature · wOut/wIn | `yang` · `0.75/0.25`；`weaponReq {category:sword}` |
| reqs | `attrs {con:40}`；`aptitude {apSword:40}`；`sect {id:sect_muwangfu,rank:4}`；`prereq [{skill:sk_muwangjian,layer:6}]`；`hard:[sect,prereq]` |
| layerStats / layers | `{parry:[4,9],defOut:[2,6]}`；1 近卫横剑、2 近卫点剑、4 回身护主、5 引敌离主、**7 绝招舍身护主**、10 圆满 |
| setTags / special / observable | `[]` / `{fusible:true}` / `true` |
| learnSources / description | 沐府统领传授 `maxLayer:10`；北京营救线 `maxLayer:8` **（原创扩展）**。守人重于争胜，以剑阵空隙代友承击。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 近卫横剑 `mv_mufuhujian_hengjian` **（原创扩展）** | 1 | 单体·1·近身 | 1.00 | 7%/0/1000 | — | 可 | `1.00×(1+0)×1×1−0=1.00` |
| 近卫点剑 `mv_mufuhujian_dianjian` **（原创扩展）** | 2 | 单体·1·近身 | 1.10 | 7%/1/1000 | — | 可 | `1×(1+0.12)=1.12≈1.10` |
| 回身护主 `mv_mufuhujian_huishen` **（原创扩展）** | 4 | `aoe_swap`·友方 1–2·支援 | 0 | 6%/2/900 | 与友方换位；自身 `bf_shoushi` 2 | — | `power=0`；换位 0.15 与防势由无伤害、cd2 支付 |
| 引敌离主 `mv_mufuhujian_yindi` **（原创扩展）** | 5 | `aoe_knock n1`·1·近身 | 1.25 | 8%/2/1100 | 击退 1 | 可 | `0.95×(1+0.24+0.05+0.07)−0.05=1.24≈1.25` |
| 舍身护主 `mv_mufuhujian_sheshen`（绝招，**原创扩展**） | 7 | `aoe_cone {angle:120,r:1,dirCount:6}`·近身 | 2.45 | 9%/—/1200 | 命中后相邻最低 HP 友方获 `bf_yuanhu` 2 | 可 | N=3、AF=0.85；`3×0.85−0.10=2.45`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 同袍 | `ps_mufuhujian_tongpao` | 3 | 相邻友方存在时 Z4 +5% |
| 护幼 | `ps_mufuhujian_huyou` | 6 | 援护后回复已损内力 5%，每回合 1 次 |
| 沐府剑成 | `ps_mufuhujian_dacheng` | 10 | `bf_yuanhu` 期间招架 +10 |

### 2.7 `sk_wangwuposhijian` 王屋破势剑（7 地下 · 兵器/剑 · 王屋派）

| 字段 | 值 |
|---|---|
| 出处 | 据《鹿鼎记》司徒伯雷、曾柔一系扩写；正式套路名与具体交手**（待考）**，名称为**（原创扩展）** |
| origin / sect / sourceChapters | `expanded` / `sect_wangwu` / `[ch08_luding]` |
| nature · wOut/wIn | `neutral` · `0.80/0.20`；`weaponReq {category:sword}` |
| reqs | `aptitude {apSword:40}`；`sect {id:sect_wangwu,rank:4}`；`prereq [{skill:sk_wangwujian,layer:6}]`；`hard:[sect,prereq]` |
| layerStats / layers | `{hit:[4,9],pierce:[2,6]}`；1 削势、2 横拦山径、4 借坡压剑、5 回锋截路、**7 绝招王屋开山**、10 圆满 |
| setTags / special / observable | `[]` / `{fusible:true}` / `true` |
| learnSources / description | 王屋派救援支线 `maxLayer:8`；司徒伯雷遗谱 `maxLayer:10` **（原创扩展）**。山道窄处先削来势，再逼敌退入不利格。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 削势 `mv_wangwuposhi_xiaoshi` **（原创扩展）** | 1 | 单体·1·近身 | 0.95 | 7%/0/1000 | `bf_shiheng` 40%·1 | 可 | `1−0.10×0.40=0.96≈0.95` |
| 横拦山径 `mv_wangwuposhi_henglan` **（原创扩展）** | 2 | `aoe_line n2`·近身 | 1.05 | 7%/1/1100 | — | 可 | N=2、AF=0.90；`0.90×(1+0.12+0.07)=1.07≈1.05` |
| 借坡压剑 `mv_wangwuposhi_jiepo` **（原创扩展）** | 4 | `aoe_knock n1`·1·近身 | 1.25 | 8%/2/1100 | 击退 1 | 可 | `0.95×(1+0.24+0.05+0.07)−0.05=1.24≈1.25` |
| 回锋截路 `mv_wangwuposhi_jielu` **（原创扩展）** | 5 | 单体·1·近身 | 1.15 | 8%/1/1000 | — | 可 | `1×(1+0.12+0.05)=1.17≈1.15` |
| 王屋开山 `mv_wangwuposhi_kaishan`（绝招，**原创扩展**） | 7 | `aoe_line n3`·近身 | 2.45 | 9%/—/1200 | `bf_polu` 50%·2 | 可 | N=3、AF=0.85；`3×0.85−0.10×0.50=2.50`；保留手调 −0.05 → 2.45；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 山道 | `ps_wangwuposhi_shandao` | 3 | 相邻障碍 ≥2 时招架 +8 |
| 破势 | `ps_wangwuposhi_poshi` | 6 | 对带架势目标 Z5 +8% |
| 王屋剑成 | `ps_wangwuposhi_dacheng` | 10 | 击退造成撞击时只按 `design/04` §7.4 结算一次，撞击伤害 +10% |

### 2.8 `sk_huagumianzhang` 化骨绵掌（9 地上 · 拳脚/掌 · 清宫海大富）

| 字段 | 值 |
|---|---|
| 出处 | 《鹿鼎记》海大富武学；中掌症状与交手段落**（待考）**，地上锚点见基准 §13 |
| origin / sect / lineage | `canonExpanded` / `sect_qinggong` / 海大富 |
| sourceChapters | `[ch08_luding]` |
| nature · wOut/wIn · moveSlots | `yin` · `0.35/0.65` · 4 |
| reqs | `attrs {wil:55,agi:45}`；`aptitude {apFist:55}`；`sect {id:sect_qinggong,rank:4}`；`prereq [{skill:sk_bukushuaijiao,layer:5}]`；`hard:[attrs,aptitude,sect,prereq]`；海大富来源以 `reqsOverride {sect:null,prereq:[]}` 删除组织与前置，按 C17 §4.3 同步得到有效 `hard:[attrs,aptitude]` |
| layerStats | `{pierce:[4,9],hit:[2,6]}`，合计 15 |
| 层数要点 | 1 重绵劲；3 重潜劲；5 重化骨；**7 重绝招绵劲回环**；**9 重绝招绵里藏针**；10 重圆满 |
| setTags | `[]` |
| conflicts | 与阳性主运相冲按 05 §5.4；现实医疗与毒理不可从本条推导 |
| special / observable | `{fusible:false}` / `false` |
| learnSources | 海大富秘密传授 `maxLayer:10` **（原创扩展路径）**；宫中残谱 `maxLayer:7` **（原创扩展）** |
| description | 阴柔掌劲潜入骨节，外表不显而后患深。游戏效果只引用 `bf_huagu`，不另造同义 Buff。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 绵掌 `mv_huagumianzhang_mianzhang` **（原创扩展命名）** | 1 | 单体·1·近身 | 0.95 | 7%/0/1000 | `bf_huagu` 40%·5 | 可 | `1−0.10×0.40=0.96≈0.95` |
| 潜劲入骨 `mv_huagumianzhang_qianjin` **（原创扩展命名）** | 3 | 单体·1·近身 | 1.25 | 8%/2/1100 | `bf_huagu` 70%·5 | 可 | `1×(1+0.24+0.05+0.07)−0.10×0.70=1.29`；手调 −0.04 → 1.25 |
| 隔衣传劲 `mv_huagumianzhang_geyi` **（原创扩展命名）** | 5 | 单体·1–3·远程 | 1.05 | 9%/2/1000 | `bf_huagu` 50%·5 | 可 | `1×(1+0.24+0.10)×0.85−0.05=1.09≈1.10`；隐蔽命中优势手调 −0.05 → 1.05；`MoveDef{range:{min:1,max:3}; aoe:{tpl:aoe_single}; projection:true; projectionSpreadSteps:[{tpl:aoe_single},{tpl:aoe_single},{tpl:aoe_single}]; DamageKind:'projected'; meridianRouteRef:mfr_huagumianzhang_geyi}` |
| 绵劲回环 `mv_huagumianzhang_huihuan`（绝招，**原创扩展命名**） | 7 | 单体·1·近身 | 2.95 | 9%/—/1200 | `bf_huagu` 50%·5；气势 100 | 可 | `3.00−0.10×0.50=2.95`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 绵里藏针 `mv_huagumianzhang_cangzhen`（绝招，**原创扩展命名**） | 9 | 单体·1·近身 | 2.80 | 9%/—/1200 | `bf_huagu` 100%·5；`bf_pojia` 50%·2 | 可 | `3−0.10−0.10×0.50=2.85`；手调 −0.05 → 2.80；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 潜劲 | `ps_huagumianzhang_qianjin` | 4 | 对护体仍未破的目标，`bf_huagu` 效果命中 +8pp；伤害仍先结护体 |
| 化骨 | `ps_huagumianzhang_huagu` | 8 | 目标每有 1 层 `bf_huagu`，本武学 Z3 +3%，最多 +15% |
| 绵掌圆满 | `ps_huagumianzhang_dacheng` | 10 | `bf_huagu` 被驱散时施加者回复 3% 内力，每回合 1 次 |

---

## 3. 连城书界：天、地阶完整条目

### 3.1 `sk_shenzhao` 神照经（10 天下 · 内功 · 丁典—狄云）

| 字段 | 值 |
|---|---|
| 出处 | 《连城诀》丁典、狄云所习神照经；其疗伤、复苏情节及传承原委须据修订版逐字复核**（待考）** |
| origin / sect / lineage | `canonExpanded` / `null` / 梅念笙 → 丁典 → 狄云 |
| sourceChapters | `[ch09_liancheng]`，与基准 §13 完全一致 |
| nature · wOut/wIn · moveSlots | `harmony` · `0/1` · 5 |
| meridians | `[mer_renmai, mer_dumai]` **【建议值】** |
| reqs | `attrs {con:65,wil:70}`；`aptitude {apInner:65}`；`prereq [{anyOf:[{skill:sk_meinianshengxinfa,layer:6},{skill:sk_xiangxituna,layer:8}]}]`；`hard:[attrs,aptitude,prereq]`；丁典/狄云剧情来源用 `reqsOverride {prereq:[]}` 删除前置，不删除属性与内功技艺；按 C17 §4.3 有效 `hard` 同步移除 `prereq` |
| inner.contribution | `{mpMaxPct:42,hpMaxPct:25,attrs:{con:8,wil:7,wis:3},mpRegen:3}`；`IP=42+25+2×18+5×3=118`；`stats {healPower:10,resInjury:10}` 合计 20 |
| layerStats | —（内功不用 `layerStats`） |
| 层数要点 | 1 重神照吐纳；3 重回气；**7 重绝招续脉**；**9 重绝招神照护命**；10 重神照圆满 |
| setTags | `[set_shenzhao_liancheng]` |
| conflicts | 绝招只阻止一次普通战斗致死；不能阻止剧情死亡、处决或 `special` 禁锁血事件；与其他 `bf_suoxue` 同属 ×1 互斥 |
| special / observable | `{fusible:false}` / `false` |
| learnSources | 丁典传授 `maxLayer:10`；狱墙留字 `manual it_shenzhao_yuwen maxLayer:6` **（原创扩展路径）**；不得作为通用商店货 |
| description | 调和内息以护脉、续气和疗伤。护命效果严格走 `bf_suoxue`，不把小说情节泛化成无限起死回生。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 神照吐纳 `mv_shenzhao_tuna` **（原创扩展命名）** | 1 | 自身·支援 | 0 | 8%/2/900 | `bf_huinei` 100%·2，G=2 | — | `power=0`；每回合回 `mpMax×3%`，以 cd2、无伤害与天下内功占槽支付 |
| 续脉 `mv_shenzhao_xumai`（绝招，**原创扩展命名**） | 7 | 单体·1·支援 | 0 | 10%/—/1200 | 治疗 `hpMax×20%`；移除可驱散 `bf_neishang` 2 层；气势 100 | — | `power=0`；支援绝招以气势 100、天下基准耗内 +2pp 与收招 1200 支付；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |
| 神照护命 `mv_shenzhao_huming`（绝招，**原创扩展命名**） | 9 | 自身·被动反应 | 0 | 10%/—/1200 | 获 `bf_suoxue` ×1；挡下致死伤害后按 06 获重创，每战 1 次 | — | `power=0`；采用 06 为神照经指定的锁血语义，以气势 100、10% 内力和每战 1 次支付；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 狱中守息 | `ps_shenzhao_yuzhong` | 3 | 气血低于 40% 时 `mpRegen +1`，每回合至多触发一次结算 |
| 护脉 | `ps_shenzhao_humai` | 6 | 自身受到的可驱散内伤持续 −1（最低 1） |
| 内息绵长 | `ps_shenzhao_mianchang` | 9 | 接受治疗时额外清除 1 层可驱散内伤，每 2 回合 1 次 |
| 神照圆满 | `ps_shenzhao_dacheng` | 10 | 自身施加的治疗与护体效果 +10%；不提高复活比例 |

### 3.2 `sk_xuedaojing` 血刀经（9 地上 · 内功 · 血刀门）

| 字段 | 值 |
|---|---|
| 出处 | 《连城诀》血刀老祖与血刀门武学；经文是否同时包含完整刀谱、具体口诀及雪谷用法**（待考）** |
| origin / sect / lineage | `canonExpanded` / `sect_xuedaomen` / 血刀老祖一系 |
| sourceChapters | `[ch09_liancheng]` |
| nature · wOut/wIn · moveSlots | `yin` · `0/1` · 4 |
| meridians | `[mer_chongmai, mer_yinwei]` **【建议值】** |
| reqs | `attrs {con:55,agi:50,wil:50}`；`aptitude {apInner:55,apBlade:45}`；`sect {id:sect_xuedaomen,rank:5}`；`prereq [{skill:sk_xuedaofa,layer:7}]`；`hard:[aptitude,sect,prereq]` |
| inner.contribution | `{mpMaxPct:31,hpMaxPct:20,attrs:{agi:6,con:5,str:3},mpRegen:3.1}`；`IP=31+20+2×14+5×3.1=94.5`；`stats {resCold:8,crit:7}` 合计 15 |
| layerStats | —（内功不用 `layerStats`） |
| 层数要点 | 1 重血息；3 重伏雪；**7 重绝招饮刃**；**9 重绝招血刀照雪**；10 重经刀合一 |
| setTags | `[]` |
| conflicts | 阴性主运相冲沿用 05；吸取只计算实际气血伤害，受 `bf_shixue` 合计 25% 上限，不从护体或过量伤害吸取 |
| special / observable | `{fusible:false}` / `false` |
| learnSources | 血刀老祖传授 `maxLayer:10`（敌对/改命路线）；血刀经残页 `pages it_canye_xuedaojing maxLayer:7` **（原创扩展路径）** |
| description | 以阴寒内息配合诡奇血刀，在雪地、低血与反击窗口中转守为攻；不把邪派身份直接等同于强制道德扣分。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 血息催刃 `mv_xuedaojing_cuiren` **（原创扩展）** | 1 | 单体·1·近身 | 1.00 | 7%/0/1000 | 仅装备刀时生效 | 可 | `1.00×(1+0)×1×1−0=1.00` |
| 饮刃 `mv_xuedaojing_yinren`（绝招，**原创扩展命名**） | 7 | 单体·1·近身 | 2.80 | 9%/—/1200 | 自身 `bf_shixue` G=3·3；气势 100 | 可 | `3.00−0.20=2.80`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 血刀照雪 `mv_xuedaojing_zhaoxue`（绝招，**原创扩展命名**） | 9 | `aoe_cone {angle:120,r:1,dirCount:6}`·近身 | 2.50 | 9%/—/1200 | 雪地为常见条件；`bf_shixue` G=4·3 | 可 | N=3、AF=0.85；`3×0.85×(1+0.15)−0.40=2.53`；手调 −0.03 → 2.50；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 伏雪 | `ps_xuedaojing_fuxue` | 3 | 雪地上的地形移动代价 −1（最低 1），不提高轻功值 |
| 血刃反照 | `ps_xuedaojing_fanzhao` | 6 | 气血低于 35% 时刀招反击率 +8pp |
| 经刀合一 | `ps_xuedaojing_dacheng` | 10 | `sk_xuedaofa` 耗内 −15%，其 `bf_liuxue` 效果命中 +10pp |

### 3.3 `sk_xuedaofa` 血刀刀法（8 地中 · 兵器/刀 · 血刀门）

| 字段 | 值 |
|---|---|
| 出处 | 《连城诀》血刀老祖雪谷交战所用刀法；具体招式名均为**（原创扩展命名）**，动作次序**（待考）** |
| origin / sect / lineage | `canonExpanded` / `sect_xuedaomen` / 血刀老祖一系 |
| sourceChapters | `[ch09_liancheng]` |
| nature · wOut/wIn | `yin` · `0.70/0.30`；`weaponReq {category:blade}` |
| reqs | `attrs {agi:50,str:45}`；`aptitude {apBlade:50}`；`sect {id:sect_xuedaomen,rank:4}`；`prereq [{skill:sk_xuedaoxinfa,layer:5}]`；`hard:[aptitude,sect,prereq]` |
| layerStats / layers | `{crit:[3,8],hit:[2,7]}`；1 伏刃、2 贴雪横斩、3 回刀割脉、**5 绝招藏锋突进**、**7 绝招血影横谷**、10 圆满 |
| setTags / conflicts | `[]` / 与血刀经同套但不要求主运；流血受 06 上限 |
| special / observable | `{fusible:false}` / `true` |
| learnSources / description | 血刀门亲传 `maxLayer:10`；雪谷战场观摩 `maxLayer:5` **（原创扩展路径）**。贴地、借雪与回刃构成不正面硬拼的诡刀。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 伏刃贴雪 `mv_xuedaofa_furen` **（原创扩展命名）** | 1 | 单体·1·近身 | 1.00 | 7%/0/1000 | 雪地命中 +8，不进倍率 | 可 | `1.00×(1+0)×1×1−0=1.00` |
| 贴雪横斩 `mv_xuedaofa_tiexue` **（原创扩展命名）** | 2 | `aoe_cone {angle:120,r:1,dirCount:6}`·近身 | 1.00 | 7%/1/1100 | — | 可 | N=3、AF=0.85；`0.85×(1+0.12+0.07)=1.01≈1.00` |
| 回刀割脉 `mv_xuedaofa_huidao` **（原创扩展命名）** | 3 | `aoe_behind`·1·近身 | 0.95 | 8%/2/1000 | 绕背；`bf_liuxue` 50%·3 | 可 | `0.90×(1+0.24+0.05)−0.15−0.10×0.50=0.96≈0.95` |
| 藏锋突进 `mv_xuedaofa_cangfeng`（绝招，**原创扩展命名**） | 7 | `aoe_dash n2`·2·近身 | 2.90 | 9%/—/1200 | 自身突进 2；气势 100 | 可 | `3.00−0.10=2.90`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 血影横谷 `mv_xuedaofa_henggu`（绝招，**原创扩展命名**） | 9 | `aoe_line n3`·近身 | 2.50 | 9%/—/1200 | `bf_liuxue` 70%·3 | 可 | N=3、AF=0.85；`3×0.85−0.10×0.70=2.48≈2.50`；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 雪下藏刀 | `ps_xuedaofa_cangdao` | 3 | 雪地首次受近身攻击时招架 +10 |
| 回刃 | `ps_xuedaofa_huiren` | 6 | 成功闪避后下一刀 `ct +150`，每回合 1 次 |
| 血刀圆满 | `ps_xuedaofa_dacheng` | 10 | 对已有 `bf_liuxue` 目标 Z3 +10% |

### 3.4 `sk_tangshijian` 唐诗剑法（8 地中 · 兵器/剑 · 万家门/梅念笙一门）

| 字段 | 值 |
|---|---|
| 出处 | 《连城诀》以唐诗剑谱承载连城诀与宝藏线索；具体诗句、剑招对应和传承人物顺序**（待考）**，本文不伪造诗句引文 |
| origin / sect / lineage | `canonExpanded` / `sect_wanjia` / 梅念笙一门 |
| sourceChapters | `[ch09_liancheng]` |
| nature · wOut/wIn | `harmony` · `0.60/0.40`；`weaponReq {category:sword}` |
| reqs | `attrs {wis:55,agi:45}`；`aptitude {apSword:50}`；`skills {art:45}`；`sect {id:sect_wanjia,rank:4}`；`prereq [{anyOf:[{skill:sk_wanjiajian,layer:6},{skill:sk_luohualiushuijian,layer:6},{skill:sk_meinianshengxinfa,layer:5}]}]`；`hard:[aptitude,skills,sect,prereq]`；梅念笙系来源以 `reqsOverride {sect:null}` 删除组织条件，按 C17 §4.3 有效 `hard` 同步移除 `sect` |
| layerStats / layers | `{hit:[3,8],pierce:[2,7]}`；1 识字入剑、2 起韵平锋、3 断句、4 应对成章、**5 绝招藏锋换韵**、**7 绝招连城一诀**、10 圆满 |
| setTags / conflicts | `[]` / 解谜判定读取 `skills.art` 与章节任务证据状态，不另造 `read` 技艺，也不由战斗倍率反推 |
| special / observable | `{fusible:false}` / `true`（只可观摩剑势，不自动得密码） |
| learnSources / description | 梅念笙系传授 `maxLayer:10`；万家剑谱线 `maxLayer:8`；完整解码另需剧情证据。以诗句节奏藏剑路，读懂剑谱与读懂宝藏密码是两个判定。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 断句点锋 `mv_tangshijian_duanju` **（原创扩展命名）** | 1 | 单体·1·近身 | 0.95 | 7%/0/1000 | `bf_pojian` 30%·1 | 可 | `1−0.10×0.30=0.97≈0.95` |
| 起韵平锋 `mv_tangshijian_qiyun` **（原创扩展命名）** | 2 | 单体·1·近身 | 1.10 | 7%/1/1000 | — | 可 | `1×(1+0.12)=1.12≈1.10` |
| 应对成章 `mv_tangshijian_yingdui` **（原创扩展命名）** | 4 | `aoe_line n2`·近身 | 1.10 | 8%/1/1100 | — | 可 | N=2、AF=0.90；`0.90×(1+0.12+0.05+0.07)=1.12≈1.10` |
| 藏锋换韵 `mv_tangshijian_huanyun`（绝招，**原创扩展命名**） | 7 | `aoe_swap`·1·近身 | 2.35 | 9%/—/1200 | 与目标换位；目标 `bf_shiheng` 40%·1；气势 100 | 可 | `3×0.85−0.15−0.10×0.40=2.36≈2.35`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 连城一诀 `mv_tangshijian_liancheng`（绝招，**原创扩展命名**） | 9 | `aoe_line n3`·近身 | 2.95 | 9%/—/1200 | 对同一目标连续命中时第 2 段 Z3 +15%（常见条件已计） | 可 | N=3、AF=0.85；`3×0.85×(1+0.15)=2.93≈2.95`；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 识字入剑 | `ps_tangshijian_shizi` | 2 | `art ≥45` 时命中 +6；只影响本武学 |
| 剑中藏诀 | `ps_tangshijian_cangjue` | 6 | 探索中可提交“剑谱排列”线索；成功与否由章节任务定义 |
| 唐诗剑成 | `ps_tangshijian_dacheng` | 10 | 本武学绝招气势消耗 −10，最低 90 |

---

## 4. 白马书界：地阶完整条目

### 4.1 `sk_gaochangshouhujian` 高昌守护剑（9 地上 · 兵器/剑 · 高昌遗脉）

| 字段 | 值 |
|---|---|
| 出处 | 据《白马啸西风》高昌迷宫、壁画与寻宝冲突扩写；原著无“高昌派”及同名剑法，**（原创扩展）** |
| origin / sect / lineage | `expanded` / `sect_gaochang` / 迷宫守护者 |
| sourceChapters | `[ch10_baima]` |
| nature · wOut/wIn | `harmony` · `0.60/0.40`；`weaponReq {category:sword}` |
| reqs | `attrs {wis:55,agi:50}`；`aptitude {apSword:55}`；`skills {formation:40}`；`sect {id:sect_gaochang,rank:5}`；`prereq [{skill:sk_gaochangjian,layer:6}]`；`hard:[aptitude,skills,sect,prereq]` |
| layerStats / layers | `{hit:[3,9],parry:[2,6]}`；1 守门、2 引剑入门、3 辨壁转门、**5 绝招借隘回锋**、**7 绝招千门归一**、9 守藏、10 圆满 |
| setTags / conflicts | `[]` / `formation` 只用于机关交互，战斗命中仍按剑术字段 |
| special / observable | `{fusible:false}` / `true`（观摩上限 5，不揭示迷宫答案） |
| learnSources / description | 高昌守藏线 `maxLayer:10`；壁画剑痕 `observe maxLayer:5` **（原创扩展）**。借狭道、门框与转角守藏；不把真实高昌故城说成武林遗址。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 守门剑 `mv_gaochangshouhu_shoumen` **（原创扩展）** | 1 | 单体·1·近身 | 1.25 | 7%/1/1000 | 相邻障碍 ≥2 为常见条件 | 可 | `1.00×(1+0.12+0.15)=1.27≈1.25` |
| 引剑入门 `mv_gaochangshouhu_yinjian` **（原创扩展）** | 2 | 单体·1·近身 | 1.10 | 7%/1/1000 | — | 可 | `1×(1+0.12)=1.12≈1.10` |
| 转门横截 `mv_gaochangshouhu_zhuanmen` **（原创扩展）** | 3 | `aoe_line n2`·近身 | 1.20 | 8%/2/1100 | — | 可 | N=2、AF=0.90；`0.90×(1+0.24+0.05+0.07)=1.22≈1.20` |
| 借隘回锋 `mv_gaochangshouhu_jieai`（绝招，**原创扩展**） | 7 | `aoe_behind`·1·近身 | 2.75 | 9%/—/1200 | 绕背；自身 `bf_shoushi` 2；气势 100 | 可 | `3.00−0.15−0.10=2.75`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 千门归一 `mv_gaochangshouhu_qianmen`（绝招，**原创扩展**） | 9 | `aoe_line n3`·近身 | 2.45 | 9%/—/1200 | `bf_dingshen` 40%·1 | 可 | N=3、AF=0.85；`3×0.85−0.25×0.40=2.45`；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 辨壁 | `ps_gaochangshouhu_bianbi` | 3 | 室内陷阱侦测 `formation +8`；不直接发现剧情密室 |
| 守藏 | `ps_gaochangshouhu_shoucang` | 9 | 守卫目标或宝箱相邻 2 格时 Z4 +8% |
| 千门剑成 | `ps_gaochangshouhu_dacheng` | 10 | 由 `aoe_line` 命中单一目标时 Z3 +10%，避免狭路招退化 |

### 4.2 `sk_hasakeqishe` 哈萨克骑射（7 地下 · 暗器/弓箭 · 哈萨克部族）

| 字段 | 值 |
|---|---|
| 出处 | 据《白马啸西风》草原生活与交战扩写，人物实际射术与情节细节**（待考）**；固定套路名为**（原创扩展命名）** |
| origin / sect / lineage | `expanded` / `sect_hasake` / 草原勇士 |
| sourceChapters | `[ch10_baima]` |
| nature · wOut/wIn | `neutral` · `0.85/0.15`；`category/subType:hidden/hidden`；使用 `design/10` 的 `HiddenKind:bow` 弓具与箭类弹药，`weaponReq` 不适用 |
| reqs | `attrs {agi:45,str:40}`；`aptitude {apHidden:45}`；`sect {id:sect_hasake,rank:4}`；`prereq [{skill:sk_hasakeshuai,layer:5}]`；`hard:[aptitude,sect,prereq]` |
| layerStats / layers | `{hit:[4,9],crit:[2,6]}`；1 马上搭箭、3 回身射、5 逐骑奔射、6 穿阵连矢、**7 绝招三矢逐风**、10 圆满 |
| setTags / conflicts | `[]` / 弓箭按 C16 占暗器栏，不占兵器栏；骑乘规则由 08/09 管理 |
| special / observable | `{fusible:true}` / `true` |
| learnSources / description | 哈萨克勇士传授 `maxLayer:10`；草原竞射 `observe maxLayer:6` **（原创扩展）**。步战可用，骑乘只提供可选机动奖励，避免把族群共同体写成人人同一武谱。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 马上搭箭 `mv_hasakeqishe_dajian` **（原创扩展）** | 1 | 单体·2–6·投射 | 0.90 | 7%/0/1000 | — | 可 | `1×(1+0)×0.92=0.92≈0.90` |
| 回身射 `mv_hasakeqishe_huishen` **（原创扩展）** | 3 | 单体·2–5·投射 | 1.15 | 8%/2/900 | 后撤 2；骑乘为常见条件 | 可 | `1.00×(1+0.24+0.05−0.07+0.15)×0.92−0.10=1.16≈1.15` |
| 逐骑奔射 `mv_hasakeqishe_benshe` **（原创扩展）** | 5 | 单体·2–6·投射 | 1.15 | 8%/1/900 | 本回合移动 ≥3 格为常见条件 | 可 | `1×(1+0.12+0.05−0.07+0.15)×0.92=1.15` |
| 穿阵连矢 `mv_hasakeqishe_chuanshe` **（原创扩展）** | 6 | `aoe_line n3`·2–6·投射 | 1.05 | 8%/2/1100 | 2 段；每目标最多中 1 段 | 可 | N=3、AF=0.85；`0.85×(1+0.24+0.05+0.07)×0.92=1.06≈1.05` |
| 三矢逐风 `mv_hasakeqishe_sanshi`（绝招，**原创扩展**） | 7 | `aoe_cone {r:2,angle:60,dirCount:6}`·2–6·投射 | 2.20 | 9%/—/1200 | 选取锥形内至多三目标分别结算；同一目标最多中 2 矢 | 可 | N=4、AF=0.80；`3×0.80×0.92=2.208≈2.20`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 奔射 | `ps_hasakeqishe_benshe` | 5 | 本回合移动 ≥3 格后弓箭命中 +8；骑乘或步战均可 |
| 惜箭 | `ps_hasakeqishe_xijian` | 6 | 未命中时 30% 回收本箭；特殊箭仍受物品限次 |
| 逐风 | `ps_hasakeqishe_dacheng` | 10 | 投射距离衰减减半；不增加最大射程 |

---

## 5. 鸳鸯书界：地阶完整条目

### 5.1 `sk_fuqidaofa` 夫妻刀法（8 地中 · 兵器/刀 · 林玉龙、任飞燕传承）

| 字段 | 值 |
|---|---|
| 出处 | 《鸳鸯刀》林玉龙、任飞燕夫妇及袁冠南、萧中慧相关刀法；人物传授与合使细节**（待考）** |
| origin / sect / lineage | `canonExpanded` / `null` / 林玉龙、任飞燕夫妇 |
| sourceChapters | `[ch11_yuanyang]` |
| nature · wOut/wIn | `harmony` · `0.65/0.35`；`weaponReq {category:blade}` |
| reqs | `attrs {agi:50,cha:40}`；`aptitude {apBlade:50}`；`prereq [{anyOf:[{skill:sk_linyulongdao,layer:6},{skill:sk_renfeiyandao,layer:6}]}]`；`hard:[aptitude,prereq]` |
| layerStats / layers | `{parry:[3,8],counter:[2,7]}`；1 单刀成式、2 错步迎刀、3 争中求合、4 刀意相连、5 回环双路（普通招）、**7 绝招双环同心**、10 圆满 |
| setTags / conflicts | `[set_yuanyangdao_renzhe]` / 单人可完整施展；可选组合技 `cmb_fuqidao` 完全引用 `design/09` §6.7.4 D |
| special / observable | `{fusible:false}` / `true` |
| learnSources / description | 林玉龙或任飞燕传授 `maxLayer:10`；袁冠南/萧中慧剧情印证 `maxLayer:8`。单刀先能成式，两人满足装配、羁绊与距离后才获得三轮可选追击，不把婚姻或性别设成硬门槛。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 单刀问路 `mv_fuqidaofa_wenlu` **（原创扩展命名）** | 1 | 单体·1·近身 | 1.00 | 7%/0/1000 | — | 可 | `1.00×(1+0)×1×1−0=1.00` |
| 错步迎刀 `mv_fuqidaofa_cuobu` **（原创扩展命名）** | 2 | 单体·1·近身 | 1.10 | 7%/1/1000 | — | 可 | `1×(1+0.12)=1.12≈1.10` |
| 争中求合 `mv_fuqidaofa_zhenghe` **（原创扩展命名）** | 3 | `aoe_swap`·友方 1–2·支援 | 0 | 6%/2/900 | 与友方换位；双方 `bf_youshi` 1 | — | `power=0`；换位和双体增益由无伤害、cd2 与站位要求支付 |
| 回环双路 `mv_fuqidaofa_huihuan`（普通招，**原创扩展命名**） | 5 | `aoe_cone {angle:120,r:1,dirCount:6}`·近身 | 1.15 | 8%/2/1100 | — | 可 | N=3、AF=0.85；`0.85×(1+0.24+0.05+0.07)=1.156→1.15`；`MoveDef{unlock:5; ultimate:false; rageCost:0; mpCost:8%; cd:2; recovery:1100}` |
| 双环同心 `mv_fuqidaofa_tongxin`（绝招，**原创扩展命名**） | 7 | `aoe_cone {angle:120,r:1,dirCount:6}`·近身 | 2.55 | 9%/—/1200 | 单人可用；组合技激活时追击倍率由 09 另算 | 可 | N=3、AF=0.85；`3×0.85=2.55`；可选同伴追击由 09 独立计价，不从单人招式预扣；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 争合 | `ps_fuqidaofa_zhenghe` | 3 | 相邻友方被击后自身下一刀 `ct +100`，每回合 1 次 |
| 刀意相连 | `ps_fuqidaofa_daoyi` | 4 | 若双方均装配本武学 ≥4、羁绊 ≥3、相距 ≤2，则建立 `cmb_fuqidao`，持续与刷新见 09 |
| 同心 | `ps_fuqidaofa_dacheng` | 10 | 未激活组合技时招架 +8；激活时不重复获得此补偿 |

### 5.2 `sk_weixinliandao` 威信连刀（7 地下 · 兵器/刀 · 威信镖局）

| 字段 | 值 |
|---|---|
| 出处 | 据《鸳鸯刀》威信镖局押运、遇劫情节扩写；原著无此固定刀法名，**（原创扩展）** |
| origin / sect / lineage | `expanded` / `sect_weixinbiaoju` / 镖局护运 |
| sourceChapters | `[ch11_yuanyang]` |
| nature · wOut/wIn | `yang` · `0.80/0.20`；`weaponReq {category:blade}` |
| reqs | `attrs {con:45,str:40}`；`aptitude {apBlade:45}`；`sect {id:sect_weixinbiaoju,rank:4}`；`prereq [{skill:sk_biaojudaofa,layer:6}]`；`hard:[sect,prereq]` |
| layerStats / layers | `{parry:[3,8],hit:[2,7]}`；1 护车、2 拦道连斩、3 接镖回刀、5 压阵横刀、**7 绝招八码连营**、10 圆满 |
| setTags / conflicts | `[]` / 护送目标仍由章节任务定义；不可把任意宝箱标成镖车刷加成 |
| special / observable | `{fusible:true}` / `true` |
| learnSources / description | 威信镖局总镖头传授 `maxLayer:10`；护镖任务 `maxLayer:8` **（原创扩展）**。刀路围绕车轴和同伴轮转，重在把劫道者挡在货物之外。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 护车刀 `mv_weixinliandao_huche` **（原创扩展）** | 1 | 单体·1·近身 | 1.25 | 7%/1/1000 | 护送目标相邻为常见条件 | 可 | `1.00×(1+0.12+0.15)=1.27≈1.25` |
| 拦道连斩 `mv_weixinliandao_landao` **（原创扩展）** | 2 | `aoe_line n2`·近身 | 1.20 | 8%/2/1100 | — | 可 | N=2、AF=0.90；`0.90×(1+0.24+0.05+0.07)=1.22≈1.20` |
| 接镖回刀 `mv_weixinliandao_jiebiao` **（原创扩展）** | 3 | `aoe_cone {angle:120,r:1,dirCount:6}`·近身 | 1.05 | 8%/2/1100 | 相邻友方 `bf_yuanhu` 2 | 可 | N=3、AF=0.85；`0.85×(1+0.24+0.05+0.07)−0.10=1.06≈1.05` |
| 压阵横刀 `mv_weixinliandao_yazhen` **（原创扩展）** | 5 | 单体·1·近身 | 1.05 | 8%/1/1000 | 自身 `bf_shoushi` 2 | 可 | `1×(1+0.12+0.05)−0.10=1.07≈1.05` |
| 八码连营 `mv_weixinliandao_lianying`（绝招，**原创扩展**） | 7 | `aoe_cone {angle:120,r:1,dirCount:6}`·近身 | 2.45 | 9%/—/1200 | 命中 ≥2 人时自身 `bf_shoushi` 2 | 可 | N=3、AF=0.85；`3×0.85−0.10=2.45`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 接镖 | `ps_weixinliandao_jiebiao` | 3 | 援护后下一次招架 +8，每回合 1 次 |
| 车轴轮转 | `ps_weixinliandao_lunzhuan` | 6 | 绕护送目标移动时首个敌方控制区不追加移动耗费，每回合 1 次 |
| 连刀圆满 | `ps_weixinliandao_dacheng` | 10 | 成功援护后 Z4 +8%，持续 1 回合 |

---

## 6. 鹿鼎书界：玄阶紧凑卡（11 门）

以下每卡给 1 个代表招式的完整算式；每卡的另外 2 招与 2 个被动集中列在 §6.12。代表式 11 个 / 本节 33 个招式 = **33.3%**，满足 AR-01 的玄阶核算抽样 ≥30%。

### 6.1 `sk_tiandihuidao` 天地会刀（5 玄中 · 兵器/刀）

**字段**｜`origin:expanded`；`sect:sect_tiandihui`；`nature:yang`；`wOut/wIn:0.80/0.20`；`weaponReq:{category:blade}`；`sourceChapters:[ch08_luding]`；`reqs: aptitude {apBlade:25}, sect rank:3, prereq [{skill:sk_tiandihuiquan,layer:4}]`（硬：sect/prereq）；`layerStats:{hit:[1,5],parry:[1,5]}`；`setTags:[]`；可观摩 6 重。

- **代表招式**：香堂截路 `mv_tiandihuidao_jielu` **（原创扩展）**，单体近身，倍率 **1.05**，耗内 6%、cd1、收招 1000，命中施加 `bf_shiheng` 50%·1；核算 `1×(1+0.12)−0.10×0.50=1.07≈1.05`。
- **来源 / 被动**：天地会骨干传授；“同会接应”使相邻同套装友方存在时招架 +5。会党背景有原著依据，固定刀谱与招名均**（原创扩展）**。

### 6.2 `sk_shenlongzhang` 神龙掌（6 玄上 · 拳脚/掌）

**字段**｜`origin:expanded`；`sect:sect_shenlongjiao`；`nature:yang`；`wOut/wIn:0.65/0.35`；`sourceChapters:[ch08_luding]`；`reqs: attrs {str:35,wil:30}, aptitude {apFist:35}, sect rank:3, prereq [{skill:sk_shenlongrumenquan,layer:4}]`（硬：sect/prereq）；`layerStats:{hit:[2,6],effHit:[1,4]}`；`setTags:[set_shenlong_jiaozhu]`；可观摩 6 重。

- **代表招式**：龙首压阵 `mv_shenlongzhang_yazhen`（绝招，**原创扩展**），单体近身，倍率 **2.95**，耗内 8%、气势 100、收招 1200，`bf_zhenshe` 40%·1；核算 `3.00−0.15×0.40=2.94≈2.95`。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`
- **来源 / 被动**：神龙教亲传；未移动时“教坛压阵”命中 +5。原著有洪安通武功高强与教众体系，成套掌名及效果为**（原创扩展）**；`design/09` 把它与心法并写为地上属于旧建议，见 §19.2 及报告 §6。

### 6.3 `sk_shenlongshebu` 神龙蛇步（4 玄下 · 轻功）

**字段**｜`origin:expanded`；`sect:sect_shenlongjiao`；`nature:yin`；`sourceChapters:[ch08_luding]`；`reqs: attrs {agi:30}, aptitude {apLight:20}, sect rank:2`（硬：sect）；`Q_skill=QS(4)=56`（10 重）；`layerStats:{eva:[1,6],tough:[1,4]}`；`setTags:[set_shenlong_jiaozhu]`；`movement.specials:[squeeze]`；可观摩 6 重。

- **代表招式**：蛇折 `mv_shenlongshebu_shezhe` **（原创扩展）**，单体近身，倍率 **0.90**，耗内 6%、cd1、收招 900，绕背；核算 `1×(1+0.12−0.07)−0.15=0.90`。
- **来源 / 被动**：神龙教旗弟子传授；荆棘/灌木格首次进入不触发控制区，仍照常受地形伤害。蛇岛环境与步法名均为游戏化扩展。

### 6.4 `sk_muwangjian` 沐府剑法（5 玄中 · 兵器/剑）

**字段**｜`origin:expanded`；`sect:sect_muwangfu`；`nature:yang`；`wOut/wIn:0.75/0.25`；`weaponReq:{category:sword}`；`sourceChapters:[ch08_luding]`；`reqs: aptitude {apSword:30}, sect rank:3, prereq [{skill:sk_mufujichujian,layer:4}]`（硬：sect/prereq）；`layerStats:{parry:[2,6],hit:[1,4]}`；`setTags:[]`。

- **代表招式**：滇门架剑 `mv_muwangjian_jiajian` **（原创扩展）**，单体近身，倍率 **1.00**，耗内 6%、cd1、收招 1000；命中后自身 `bf_shoushi` 1；核算 `1×(1+0.12)−0.10=1.02≈1.00`。
- **来源 / 被动**：沐府亲随传授；援护后招架 +6、每回合 1 次。沐王府人物与行动据《鹿鼎记》，固定家传剑名为**（原创扩展）**。

### 6.5 `sk_muwangquan` 沐府拳（4 玄下 · 拳脚/拳）

**字段**｜`origin:expanded`；`sect:sect_muwangfu`；`nature:yang`；`wOut/wIn:0.80/0.20`；`sourceChapters:[ch08_luding]`；`reqs: attrs {con:25}, aptitude {apFist:20}, sect rank:3, prereq [{skill:sk_mufujichujian,layer:3}]`（硬：sect）；`layerStats:{parry:[1,5],tough:[1,5]}`；`setTags:[]`。

- **代表招式**：并肩冲拳 `mv_muwangquan_bingjian` **（原创扩展）**，单体近身，倍率 **1.25**，耗内 6%、cd1、收招 1000；相邻友方为常见条件；核算 `1.00×(1+0.12+0.15)=1.27≈1.25`。
- **来源 / 被动**：沐府府兵传授；相邻友方被击后获得 `bf_wenzhong` G=1·1，每 2 回合 1 次。

### 6.6 `sk_wangwujian` 王屋剑法（5 玄中 · 兵器/剑）

**字段**｜`origin:canonExpanded`；`sect:sect_wangwu`；`nature:neutral`；`wOut/wIn:0.80/0.20`；`weaponReq:{category:sword}`；`sourceChapters:[ch08_luding]`；`reqs: aptitude {apSword:30}, sect rank:3, prereq [{skill:sk_wangwujibenjian,layer:4}]`（硬：sect/prereq）；`layerStats:{hit:[2,6],parry:[1,4]}`；`setTags:[]`。

- **代表招式**：山道逼步 `mv_wangwujian_bibu` **（原创扩展命名）**，单体近身，倍率 **1.05**，耗内 6%、cd1、收招 1000，击退 1；核算 `1×(1+0.12)−0.05=1.07≈1.05`。
- **来源 / 被动**：司徒伯雷一系传授，曾柔线可观摩 6 重；人物与门派见《鹿鼎记》，正式剑谱名及招名**（待考；若原著无名则视为原创扩展命名）**。

### 6.7 `sk_wangwuzhang` 王屋掌（4 玄下 · 拳脚/掌）

**字段**｜`origin:expanded`；`sect:sect_wangwu`；`nature:yang`；`wOut/wIn:0.85/0.15`；`sourceChapters:[ch08_luding]`；`reqs: attrs {str:25}, aptitude {apFist:20}, sect rank:3, prereq [{skill:sk_wangwujibenjian,layer:3}]`（硬：sect）；`layerStats:{hit:[1,5],tough:[1,5]}`；`setTags:[]`。

- **代表招式**：推石掌 `mv_wangwuzhang_tuishi` **（原创扩展）**，`aoe_knock n1`，倍率 **1.15**，耗内 7%、cd1、收招 1100，击退 1；核算 `0.95×(1+0.12+0.05+0.07)−0.05=1.13≈1.15`。
- **来源 / 被动**：王屋寨弟子传授；目标撞到障碍时自身 `bf_youshi` 1。

### 6.8 `sk_manchuqishe` 满洲骑射（6 玄上 · 暗器/弓箭）

**字段**｜`origin:expanded`；`sect:sect_qinggong`；`nature:yang`；`wOut/wIn:0.85/0.15`；`category/subType:hidden/hidden`；使用 `design/10` 的 `HiddenKind:bow` 弓具与箭类弹药，`weaponReq` 不适用；`sourceChapters:[ch08_luding]`；`reqs: attrs {str:35,agi:35}, aptitude {apHidden:35}, sect rank:3`（硬：aptitude/sect）；`layerStats:{hit:[2,6],crit:[1,4]}`；`setTags:[]`。

- **代表招式**：驰射 `mv_manchuqishe_chishe`（绝招，**原创扩展**），单体 2–6 格投射，倍率 **2.75**，耗内 8%、气势 100、收招 1200；本回合移动 ≥3 格仍只作为命中条件；核算 `3.00×0.92=2.76≈2.75`。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`
- **来源 / 被动**：清宫侍卫教头传授；弓马历史只作背景参考，具体套路为**（原创扩展）**。弓按 C16 进暗器栏。

### 6.9 `sk_daneishenfa` 大内身法（5 玄中 · 轻功）

**字段**｜`origin:expanded`；`sect:sect_qinggong`；`nature:neutral`；`sourceChapters:[ch08_luding]`；`reqs: attrs {agi:30}, aptitude {apLight:25}, sect rank:2`（硬：sect）；`Q_skill=QS(5)=65`；`layerStats:{eva:[2,6],tough:[1,4]}`；`setTags:[]`；`movement.actionBonus:{climb:[5,15]}`。

- **代表招式**：宫墙折返 `mv_daneishenfa_zhefan` **（原创扩展）**，单体近身，倍率 **0.95**，耗内 6%、cd1、收招 900，突进 2 后可回原格；核算 `1×(1+0.12−0.07)−0.10=0.95`。
- **来源 / 被动**：大内巡防传授；靠墙结束移动时闪避 +5 至下回合开始。

### 6.10 `sk_bukushuaijiao` 布库摔跤（5 玄中 · 拳脚/擒拿）

**字段**｜`origin:canonExpanded`；`sect:sect_qinggong`；`nature:yang`；`wOut/wIn:0.90/0.10`；`sourceChapters:[ch08_luding]`；`reqs: attrs {str:30,con:25}, aptitude {apGrapple:30}, sect rank:3, prereq [{skill:sk_daneichangquan,layer:4}]`（硬：aptitude/sect/prereq）；`layerStats:{tough:[2,6],hit:[1,4]}`；`setTags:[]`。

- **代表招式**：抱腰掼地 `mv_bukushuaijiao_guandi` **（原创扩展命名）**，单体近身，倍率 **1.15**，耗内 6%、cd2、收招 1100，`bf_dingshen` 60%·1；核算 `1.00×(1+0.24+0.07)−0.25×0.60=1.16≈1.15`。
- **来源 / 被动**：布库房教头传授；原著有布库房摔跤场景，制度、术语和动作细节**（待考）**。

### 6.11 `sk_pingxijundao` 平西军刀（4 玄下 · 兵器/刀）

**字段**｜`origin:expanded`；`sect:null`；`lineage:平西王府军士`；`nature:yang`；`wOut/wIn:0.90/0.10`；`weaponReq:{category:blade}`；`sourceChapters:[ch08_luding]`；`reqs: attrs {str:25}, aptitude {apBlade:20}, prereq [{skill:sk_pingxituna,layer:3}]`（硬：prereq）；`layerStats:{hit:[2,6],crit:[1,4]}`；`setTags:[]`。

- **代表招式**：列队横斩 `mv_pingxijundao_hengzhan` **（原创扩展）**，`aoe_cone {angle:120,r:1,dirCount:6}`，倍率 **1.00**，耗内 6%、cd1、收招 1100；N=3、AF=0.85，核算 `0.85×(1+0.12+0.07)=1.01≈1.00`。
- **来源 / 被动**：平西王府军械教头/缴获残页；仅是本作军中通行刀术，不代表吴氏拥有原著具名秘传。

### 6.12 玄阶招式与被动闭合索引

玄阶仍服从 `design/05` §3.5：本节每门恰有 **3 个普通/运功招式、2 个被动**。各卡上方的代表式统一在 1 重解锁；下表补 4 重、7 重招式及 3 重、10 重被动。卡内“来源 / 被动”的自然语言效果由本表同义 ID 正式化，不另算第三个被动。除人物、组织锚点外，下列招名与机制均为**（原创扩展）**；`origin:canonExpanded` 条目的招名具体按**（原创扩展命名）**处理。

| 武学 | 4 重补充招式（ID · 倍率 · 一句效果） | 7 重补充招式（ID · 倍率 · 一句效果） | 被动（3 重；10 重） |
|---|---|---|---|
| `sk_tiandihuidao` | 反腕藏刀 `mv_tiandihuidao_cangdao` · 1.00 · 单体近身，招架后使用时命中 +8 | 巷尾回锋 `mv_tiandihuidao_huifeng` · 1.00 · `aoe_cone {angle:120,r:1,dirCount:6}`，命中后可退 1 格 | 同会接应 `ps_tiandihuidao_jieying`：相邻同套装友方存在时招架 +5；守堂 `ps_tiandihuidao_shoutang`：巷道/室内 Z4 +6% |
| `sk_shenlongzhang` | 盘龙推掌 `mv_shenlongzhang_panlong` · 1.00 · 单体近身，击退 1 | 伏坛震袖 `mv_shenlongzhang_futan` · 1.00 · `aoe_cone {angle:120,r:1,dirCount:6}`，未移动时命中 +5 | 教坛压阵 `ps_shenlongzhang_yazhen`：未移动时命中 +5；神龙掌成 `ps_shenlongzhang_dacheng`：本武学效果命中 +8pp |
| `sk_shenlongshebu` | 游蛇穿隙 `mv_shenlongshebu_chuanxi` · 0.85 · 突进 2 后单体，穿过一处敌方控制区 | 盘柱回身 `mv_shenlongshebu_huishen` · 0.90 · 单体近身，命中后退回起点 | 蛇径 `ps_shenlongshebu_shejing`：每回合首次进入荆棘/灌木不触发控制区；蜕身 `ps_shenlongshebu_tuishen`：受夹击时闪避 +6 |
| `sk_muwangjian` | 护主横剑 `mv_muwangjian_huzhu` · 1.00 · 单体近身，护送目标相邻时自身招架 +5 至下回合 | 滇门分锋 `mv_muwangjian_fenfeng` · 1.05 · `aoe_line n2`，只命中一人时 Z3 +5% | 援护 `ps_muwangjian_yuanhu`：援护后招架 +6、每回合 1 次；同袍 `ps_muwangjian_tongpao`：相邻同套装友方受击后集气 +80 |
| `sk_muwangquan` | 拦肩短打 `mv_muwangquan_lanjian` · 1.00 · 单体近身，目标本回合移动过则 Z3 +6% | 贴身护卫 `mv_muwangquan_hushen` · 0.95 · 单体近身，命中后可与相邻友方换位 | 并肩 `ps_muwangquan_bingjian`：相邻友方受击后自身获 `bf_wenzhong` G=1·1，每 2 回合 1 次；余烈 `ps_muwangquan_yulie`：气血低于 40% 时招架 +5 |
| `sk_wangwujian` | 倚石横锋 `mv_wangwujian_yishi` · 1.00 · 单体近身，相邻障碍 ≥2 时命中 +6 | 逼崖斜刺 `mv_wangwujian_xieci` · 0.95 · 单体近身，击退 1；撞击时不追加控制 | 盘山 `ps_wangwujian_panshan`：山地/坡地移动后招架 +5；余势 `ps_wangwujian_yushi`：击退成功后下一剑 Z3 +6% |
| `sk_wangwuzhang` | 石门拦掌 `mv_wangwuzhang_lanshi` · 1.00 · 单体近身，目标背后是障碍时命中 +6 | 借壁震肩 `mv_wangwuzhang_zhenjian` · 0.95 · 单体近身，击退 1 | 借山 `ps_wangwuzhang_jieshan`：相邻障碍 ≥2 时韧性 +5；碰壁生势 `ps_wangwuzhang_pengbi`：本武学造成撞击后获 `bf_youshi` 1 回合 |
| `sk_manchuqishe` | 回马放箭 `mv_manchuqishe_huima` · 0.90 · 2–6 格投射，后退 1 后结算 | 俯鞍连射 `mv_manchuqishe_fuan` · 0.85 · 同一目标两段投射，护体只破一次 | 弓马 `ps_manchuqishe_gongma`：本回合移动 ≥3 格后命中 +6；驰射不乱 `ps_manchuqishe_buluan`：骑乘时远距衰减减半 |
| `sk_daneishenfa` | 檐下横移 `mv_daneishenfa_yanxia` · 0.85 · 沿障碍横移 2 后单体 | 门洞穿身 `mv_daneishenfa_chuandong` · 0.90 · 穿过相邻友方后攻击，不可穿敌 | 贴墙 `ps_daneishenfa_tieqiang`：靠墙结束移动时闪避 +5 至下回合开始；巡宫 `ps_daneishenfa_xungong`：室内攀越额外移动耗费 −1（最低 1） |
| `sk_bukushuaijiao` | 扣腿翻身 `mv_bukushuaijiao_koutui` · 0.95 · 单体近身，换位 | 肩背摔 `mv_bukushuaijiao_beishuai` · 0.90 · 单体近身，击退 2 | 下盘稳 `ps_bukushuaijiao_xiapan`：被位移距离 −1（最低 0）；贴身擒抱 `ps_bukushuaijiao_tieshen`：对相邻目标效果命中 +6pp |
| `sk_pingxijundao` | 盾后劈斩 `mv_pingxijundao_dunhou` · 1.00 · 单体近身，相邻友方在前方时招架 +5 | 队尾回刀 `mv_pingxijundao_huiwei` · 1.00 · `aoe_cone {angle:120,r:1,dirCount:6}`，只命中一人时 Z3 +5% | 成列 `ps_pingxijundao_chenglie`：相邻同套装友方存在时命中 +5；军械熟手 `ps_pingxijundao_junxie`：切换至刀类武器的收招 −100 |

---

## 7. 连城书界：玄阶紧凑卡（9 门）

9/9 卡均给代表招式核算；三门玄阶内功另给第 10 重主运 IP。代表式 9 个 / 本节 27 个招式 = **33.3%**。

### 7.1 `sk_xuedaoqinfa` 血刀擒法（6 玄上 · 拳脚/擒拿）

**字段**｜`origin:expanded`；`sect:sect_xuedaomen`；`nature:yin`；`wOut/wIn:0.70/0.30`；`sourceChapters:[ch09_liancheng]`；`reqs: attrs {agi:35,str:30}, aptitude {apGrapple:35}, sect rank:3, prereq [{skill:sk_xuedaorumenquan,layer:4}]`（硬：sect/prereq）；`layerStats:{seal:[2,6],hit:[1,4]}`；`setTags:[]`。

- **代表招式**：雪地锁臂 `mv_xuedaoqinfa_suobi`（绝招，**原创扩展**），单体近身，倍率 **2.90**，耗内 8%、气势 100、收招 1200，`bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)` 50%·1；核算 `3.00−0.20×0.50=2.90`。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`
- **来源 / 被动**：血刀门亲传；雪地成功招架后擒拿效果命中 +8pp。原著未见此独立套路，**（原创扩展）**。

### 7.2 `sk_xuedaojibu` 血刀疾步（4 玄下 · 轻功）

**字段**｜`origin:expanded`；`sect:sect_xuedaomen`；`nature:yin`；`sourceChapters:[ch09_liancheng]`；`reqs: attrs {agi:30}, aptitude {apLight:20}, sect rank:3`（硬：sect）；`Q_skill=QS(4)=56`；`layerStats:{eva:[2,6],tough:[1,4]}`；`setTags:[]`；`movement.moveCostByTag:{snow:-1}`。

- **代表招式**：贴雪欺身 `mv_xuedaojibu_qishen` **（原创扩展）**，突进 2 后单体，倍率 **0.95**，耗内 6%、cd1、收招 900；核算 `1×(1+0.12−0.07)−0.10=0.95`。
- **来源 / 被动**：血刀门亲传；深雪仍最低消耗 1，不跨越雪崩门禁。

### 7.3 `sk_xuedaoxinfa` 血刀心法（5 玄中 · 内功）

**字段**｜`origin:expanded`；`sect:sect_xuedaomen`；`nature:yin`；`wOut/wIn:0/1`；`meridians:[mer_chongmai]` **【建议值】**；`sourceChapters:[ch09_liancheng]`；`reqs: attrs {con:30,wil:25}, aptitude {apInner:30}, sect rank:2, prereq [{skill:sk_xuedaojichudao,layer:4}]`（硬：sect/prereq）；`inner.contribution:{mpMaxPct:15,hpMaxPct:13,attrs:{agi:4,con:3},mpRegen:1.3}`，`IP=15+13+2×7+5×1.3=48.5`；`stats:{crit:5,resCold:5}` 合计 10；`setTags:[]`。

- **代表招式**：血息 `mv_xuedaoxinfa_xuexi` **（原创扩展）**，单体近身，倍率 **0.90**，耗内 6%、cd1、收招 1000，自身 `bf_shixue` G=1·2；核算 `1×(1+0.12)−0.20=0.92≈0.90`。
- **来源 / 被动**：血刀门入门僧传授；低于 35% 气血时 `resCold +6`。名称已由 `design/17` 预留，具体法门原创。

### 7.4 `sk_wanjiajian` 万家剑法（4 玄下 · 兵器/剑）

**字段**｜`origin:expanded`；`sect:sect_wanjia`；`nature:neutral`；`wOut/wIn:0.80/0.20`；`weaponReq:{category:sword}`；`sourceChapters:[ch09_liancheng]`；`reqs: aptitude {apSword:25}, sect rank:2, prereq [{skill:sk_wanjiajibenjian,layer:4}]`（硬：sect/prereq）；`layerStats:{hit:[2,6],eva:[1,4]}`；`setTags:[]`。

- **代表招式**：虚门递剑 `mv_wanjiajian_xumen` **（原创扩展）**，单体近身，倍率 **1.10**，耗内 6%、cd1、收招 1000，目标 `bf_shiheng` 40%·1；核算 `1×(1+0.12)−0.10×0.40=1.08≈1.10`。
- **来源 / 被动**：万家门弟子传授；同一目标连续受本招时第二次效果命中 −20pp，防止佯攻锁定。

### 7.5 `sk_wanjiaxinfa` 万家心法（4 玄下 · 内功）

**字段**｜`origin:expanded`；`sect:sect_wanjia`；`nature:yang`；`wOut/wIn:0/1`；`meridians:[mer_dumai]` **【建议值】**；`sourceChapters:[ch09_liancheng]`；`reqs: attrs {con:25,wil:25}, aptitude {apInner:20}, sect rank:3, prereq [{skill:sk_wanjiaquan,layer:4}]`（硬：sect/prereq）；`inner.contribution:{mpMaxPct:14,hpMaxPct:8,attrs:{con:4,str:2},mpRegen:1.5}`，`IP=14+8+2×6+5×1.5=41.5`；`stats:{defOut:5,resMind:5}` 合计 10；`setTags:[]`。

- **代表招式**：闭门守气 `mv_wanjiaxinfa_shouqi` **（原创扩展）**，自身支援，耗内 5%、cd2、收招 900，`bf_wenzhong` G=1·2；`power=0`，以无伤害与 cd2 支付。
- **来源 / 被动**：万家亲传；本回合未移动则外防 +5。

### 7.6 `sk_meinianshengxinfa` 梅门心法（6 玄上 · 内功）

**字段**｜`origin:expanded`；`sect:null`；`lineage:梅念笙一门`；`nature:harmony`；`wOut/wIn:0/1`；`meridians:[mer_renmai]` **【建议值】**；`sourceChapters:[ch09_liancheng]`；`reqs: attrs {con:35,wil:35}, aptitude {apInner:35}, prereq [{skill:sk_xiangxituna,layer:5}]`（硬：aptitude/prereq）；`inner.contribution:{mpMaxPct:18,hpMaxPct:14.5,attrs:{con:5,wil:4},mpRegen:1.3}`，`IP=18+14.5+2×9+5×1.3=57`；`stats:{resInjury:6,resMind:4}` 合计 10；`setTags:[set_shenzhao_liancheng]`。

- **代表招式**：守正回息 `mv_meinianshengxinfa_huixi`（绝招，**原创扩展**），自身支援，耗内 8%、气势 100、收招 1200，`bf_huinei` G=2·2；`power=0`，每回合回内 3%，以玄阶绝招资源与无伤害支付。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`
- **来源 / 被动**：梅念笙系师承；首次受到内伤时抵消 1 层，每战 1 次。原著人物传承为据，独立心法名与机制为**（原创扩展）**。

### 7.7 `sk_lianchengjianli` 连城剑理（5 玄中 · 杂学/剑理）

**字段**｜`origin:expanded`；`sect:null`；`lineage:梅念笙一门`；`nature:harmony`；`wOut/wIn:0.45/0.55`；`sourceChapters:[ch09_liancheng]`；`reqs: attrs {wis:35}, aptitude {apSword:30}, skills {art:30}, prereq [{skill:sk_xiangxituna,layer:4}]`（硬：skills/prereq）；`layerStats:{hit:[2,6],pierce:[1,4]}`；`setTags:[]`。

- **代表招式**：顺句拆剑 `mv_lianchengjianli_chaijian` **（原创扩展）**，单体近身，倍率 **1.05**，耗内 6%、cd1、收招 1000，`bf_pojian` 50%·1；核算 `1×(1+0.12)−0.10×0.50=1.07≈1.05`。
- **来源 / 被动**：阅读残谱与师承印证；`art ≥45` 时对剑类招架 +6。它是剑谱理解能力，不单独充当兵器装配。

### 7.8 `sk_luohualiushuijian` 落花流水合守剑（5 玄中 · 兵器/剑）

**字段**｜`origin:canonExpanded`；`sect:null`；`lineage:南四奇`；`nature:neutral`；`wOut/wIn:0.75/0.25`；`weaponReq:{category:sword}`；`sourceChapters:[ch09_liancheng]`；`reqs: aptitude {apSword:30}, prereq [{skill:sk_nansiqijibenjian,layer:4}]`（硬：prereq）；`layerStats:{parry:[2,6],counter:[1,4]}`；`setTags:[]`。

- **代表招式**：流水接锋 `mv_luohualiushui_jiefeng` **（原创扩展命名）**，单体近身，倍率 **1.25**，耗内 6%、cd1、收招 1000；相邻友方为常见条件；核算 `1.00×(1+0.12+0.15)=1.27≈1.25`。
- **来源 / 被动**：南四奇成员或雪谷协防事件；“落花流水”并称与成员细节**（待考）**，固定合守剑为原创。单人可用，不是强制多人合击。

### 7.9 `sk_yuzhongqinna` 狱中擒拿（4 玄下 · 拳脚/擒拿）

**字段**｜`origin:expanded`；`sect:null`；`lineage:丁典—狄云`；`nature:neutral`；`wOut/wIn:0.75/0.25`；`sourceChapters:[ch09_liancheng]`；`reqs: attrs {wil:30}, aptitude {apGrapple:20}, prereq [{skill:sk_yuzhongduanquan,layer:4}]`（硬：prereq）；`layerStats:{seal:[1,5],tough:[1,5]}`；`setTags:[set_shenzhao_liancheng]`。

- **代表招式**：锁腕夺钥 `mv_yuzhongqinna_duoyao` **（原创扩展）**，单体近身，倍率 **1.15**，耗内 6%、cd2、收招 1000，`bf_jiaoxie` 35%·1；核算 `1.00×(1+0.24)−0.25×0.35=1.15`。
- **来源 / 被动**：荆州牢房求生训练；对徒手或短兵敌人效果命中 +5。全部为玩法扩展，不冒充丁典具名绝技。

### 7.10 玄阶招式与被动闭合索引

本节沿用 §6.12 的解锁与计数口径：每门 3 招、2 被动；代表式在 1 重，表中补 4/7 重招式和 3/10 重被动。内功的三项均是运功招式，符合 `design/05` §3.5 对内功 1–4 个运功招式的例外。除人物与情节锚点外均为**（原创扩展）**，`canonExpanded` 条目的招名为**（原创扩展命名）**。

| 武学 | 4 重补充招式（ID · 倍率 · 一句效果） | 7 重补充招式（ID · 倍率 · 一句效果） | 被动（3 重；10 重） |
|---|---|---|---|
| `sk_xuedaoqinfa` | 拉腕入雪 `mv_xuedaoqinfa_lawan` · 0.95 · 单体近身，拉拽 1 | 伏身绞肘 `mv_xuedaoqinfa_jiaozhou` · 0.90 · 单体近身，`bf_dingshen` 35%·1 | 伏雪锁拿 `ps_xuedaoqinfa_fuxue`：雪地招架成功后效果命中 +8pp；血擒大成 `ps_xuedaoqinfa_dacheng`：对已有 `bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)` 的目标 Z3 +6% |
| `sk_xuedaojibu` | 贴壁滑步 `mv_xuedaojibu_huabu` · 0.85 · 沿障碍突进 2 后单体 | 雪沟回跃 `mv_xuedaojibu_huiyue` · 0.90 · 单体近身，命中后退 2 格 | 踏雪 `ps_xuedaojibu_taxue`：雪地移动代价 −1（最低 1）；欺身 `ps_xuedaojibu_qishen`：本回合移动 ≥3 格后闪避 +5 |
| `sk_xuedaoxinfa` | 雪夜闭息 `mv_xuedaoxinfa_bixi` · 0 · 自身获 `bf_wenzhong` G=1·2，cd2 | 逆血催刀 `mv_xuedaoxinfa_cuidao` · 0 · 自身获 `bf_shixue` G=1·3，cd3 | 寒血 `ps_xuedaoxinfa_hanxue`：低于 35% 气血时 `resCold +6`；血刀心成 `ps_xuedaoxinfa_dacheng`：低于 35% 气血时刀招 Z3 +6% |
| `sk_wanjiajian` | 引锋露隙 `mv_wanjiajian_luxi` · 1.00 · 单体近身，本回合未移动时命中 +5 | 回门封剑 `mv_wanjiajian_fengjian` · 0.95 · 单体近身，命中后自身获 `bf_shoushi` 1 回合 | 虚实 `ps_wanjiajian_xushi`：同一目标连续受本武学减益时第二次效果命中 −20pp；守门 `ps_wanjiajian_shoumen`：未移动时招架 +5 |
| `sk_wanjiaxinfa` | 沉肩纳气 `mv_wanjiaxinfa_naqi` · 0 · 自身获 `bf_huinei` G=1·2，cd3 | 闭户守元 `mv_wanjiaxinfa_shouyuan` · 0 · 自身获 `bf_shoushi` 2 回合，cd3 | 闭门 `ps_wanjiaxinfa_bimen`：本回合未移动时外防 +5；守成 `ps_wanjiaxinfa_shoucheng`：气血高于 70% 时招架 +5 |
| `sk_meinianshengxinfa` | 调息疗创 `mv_meinianshengxinfa_liaochuang` · 0 · 自身清除 1 层可驱散内伤，cd3 | 正气护脉 `mv_meinianshengxinfa_humai` · 0 · 自身获 `bf_hutizhenqi` G=1·2，cd4 | 守正 `ps_meinianshengxinfa_shouzheng`：首次受内伤时抵消 1 层，每战 1 次；绵长 `ps_meinianshengxinfa_mianchang`：自身回复类效果 +8% |
| `sk_lianchengjianli` | 逆句寻隙 `mv_lianchengjianli_xunxi` · 1.00 · 单体近身，对持剑目标命中 +6 | 连句破锋 `mv_lianchengjianli_pofeng` · 0.95 · 单体近身，`bf_pojian` 70%·1 | 通文 `ps_lianchengjianli_tongwen`：`art ≥45` 时对剑类招架 +6；贯句 `ps_lianchengjianli_guanju`：成功施加 `bf_pojian` 后下一剑 Z3 +6% |
| `sk_luohualiushuijian` | 落花补位 `mv_luohualiushui_buwei` · 1.00 · 单体近身，可与相邻友方换位 | 四向回流 `mv_luohualiushui_huiliu` · 1.00 · `aoe_cone {angle:120,r:1,dirCount:6}`，相邻友方存在时命中 +5 | 合守 `ps_luohualiushui_heshou`：相邻友方存在时招架 +5；流水 `ps_luohualiushui_liushui`：援护后集气 +80，每回合 1 次 |
| `sk_yuzhongqinna` | 贴墙锁肘 `mv_yuzhongqinna_suozhou` · 0.95 · 单体近身，目标靠墙时效果命中 +8pp | 反手夺械 `mv_yuzhongqinna_duoxie` · 0.90 · 单体近身，`bf_jiaoxie` 55%·1 | 识械 `ps_yuzhongqinna_shixie`：对徒手或短兵敌人效果命中 +5pp；困兽 `ps_yuzhongqinna_kunshou`：自身相邻障碍 ≥2 时韧性 +5 |

---

## 8. 白马书界：玄阶紧凑卡（8 门）

8/8 卡均给代表招式核算；两门内功标出 `nature`、预留经脉与 IP。代表式 8 个 / 本节 24 个招式 = **33.3%**。

### 8.1 `sk_gaochangjian` 高昌剑术（6 玄上 · 兵器/剑）

**字段**｜`origin:expanded`；`sect:sect_gaochang`；`nature:harmony`；`wOut/wIn:0.65/0.35`；`weaponReq:{category:sword}`；`sourceChapters:[ch10_baima]`；`reqs: attrs {wis:35,agi:30}, aptitude {apSword:35}, sect rank:3, prereq [{skill:sk_gaochangjibenjian,layer:4}]`（硬：aptitude/prereq）；`layerStats:{hit:[2,6],parry:[1,4]}`；`setTags:[]`。

- **代表招式**：转角回锋 `mv_gaochangjian_zhuanjiao`（绝招，**原创扩展**），`aoe_behind` 单体近身，倍率 **2.85**，耗内 8%、气势 100、收招 1200，绕背；核算 `3.00−0.15=2.85`。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`
- **来源 / 被动**：高昌传承者/壁画剑痕；相邻障碍 ≥2 时命中 +6。“高昌剑术”是本作名称，不称真实出土剑谱。

### 8.2 `sk_gaochanggong` 高昌劲（5 玄中 · 内功）

**字段**｜`origin:expanded`；`sect:sect_gaochang`；`nature:harmony`；`wOut/wIn:0/1`；`meridians:[mer_daimai]` **【建议值】**；`sourceChapters:[ch10_baima]`；`reqs: attrs {con:30,wil:25}, aptitude {apInner:30}, sect rank:3, prereq [{skill:sk_gaochangtuna,layer:4}]`（硬：sect/prereq）；`inner.contribution:{mpMaxPct:17,hpMaxPct:10,attrs:{con:4,wil:3},mpRegen:1.5}`，`IP=17+10+2×7+5×1.5=48.5`；`stats:{resHeat:5,tough:5}` 合计 10；`setTags:[]`。

- **代表招式**：闭息穿沙 `mv_gaochanggong_chuansha` **（原创扩展）**，自身支援，耗内 5%、cd3、收招 900，`bf_wenzhong` G=1·3；`power=0`，以无伤害、cd3 与单体自用支付。
- **来源 / 被动**：护藏人传授；沙地探索体力消耗 −10%，不免疫炎热。全部为原创，不宣称高昌遗址出土内功。

### 8.3 `sk_gaochangjiguan` 高昌机关术（4 玄下 · 杂学/机关）

**字段**｜`origin:expanded`；`sect:sect_gaochang`；`nature:neutral`；`sourceChapters:[ch10_baima]`；`reqs: attrs {wis:30}, skills {formation:30}, sect rank:4, prereq [{skill:sk_migongbu,layer:4}]`（硬：skills/prereq）；强度技艺 `formation`；`layerStats:{effHit:[2,6],tough:[1,4]}`；`setTags:[]`。

- **代表招式**：封门绊索 `mv_gaochangjiguan_bansuo` **（原创扩展）**，空格 1–3 格投放，倍率 0，耗内 6%、cd3、收招 1000，首个踏入者 `bf_dingshen` 55%·1；`power=0`，陷阱强度由 `formation`、cd3、可见落点与一次触发支付。
- **来源 / 被动**：迷宫机关解读；探索 `formation` 检定只给线索，不自动开宝库。

### 8.4 `sk_hasakeshuai` 草原摔角（5 玄中 · 拳脚/擒拿）

**字段**｜`origin:expanded`；`sect:sect_hasake`；`nature:yang`；`wOut/wIn:0.90/0.10`；`sourceChapters:[ch10_baima]`；`reqs: attrs {str:30,con:25}, aptitude {apGrapple:30}, sect rank:3, prereq [{skill:sk_caoyuanquan,layer:4}]`（硬：prereq）；`layerStats:{tough:[2,6],hit:[1,4]}`；`setTags:[]`。

- **代表招式**：抱腰掷草 `mv_hasakeshuai_baoyao` **（原创扩展）**，`aoe_knock n2` 单体近身，倍率 **1.15**，耗内 6%、cd2、收招 1100，击退 2；核算 `0.95×(1+0.24+0.07)−0.05×2=1.14≈1.15`。
- **来源 / 被动**：部族勇士竞赛；民俗摔跤史料仍待专项复核，不给虚构仪式或民族专属本质论。

### 8.5 `sk_hasakexinfa` 草原心法（4 玄下 · 内功）

**字段**｜`origin:expanded`；`sect:sect_hasake`；`nature:yang`；`wOut/wIn:0/1`；`meridians:[mer_dumai]` **【建议值】**；`sourceChapters:[ch10_baima]`；`reqs: attrs {con:25}, aptitude {apInner:20}, sect rank:3, prereq [{skill:sk_hasakehuxi,layer:4}]`（硬：prereq）；`inner.contribution:{mpMaxPct:13.5,hpMaxPct:10,attrs:{con:4,str:1},mpRegen:1.6}`，`IP=13.5+10+2×5+5×1.6=41.5`；`stats:{tough:6,resCold:4}` 合计 10；`setTags:[]`。

- **代表招式**：长风调息 `mv_hasakexinfa_changfeng` **（原创扩展）**，自身支援，耗内 5%、cd2、收招 900，`bf_huinei` G=1·2；`power=0`，每回合回复 1.5% mpMax，以无伤害与 cd2 支付。
- **来源 / 被动**：部族长辈传授；骑乘后体力恢复 +5%，不提高坐骑速度。名称和机制均原创。

### 8.6 `sk_lvliangzhuifengdao` 吕梁追风刀（5 玄中 · 兵器/刀）

**字段**｜`origin:canonExpanded`；`sect:null`；`lineage:吕梁三杰`；`nature:yang`；`wOut/wIn:0.85/0.15`；`weaponReq:{category:blade}`；`sourceChapters:[ch10_baima]`；`reqs: attrs {agi:30,str:25}, aptitude {apBlade:30}, prereq [{skill:sk_lvliangquan,layer:4}]`（硬：prereq）；`layerStats:{hit:[2,6],crit:[1,4]}`；`setTags:[]`。

- **代表招式**：逐风横刀 `mv_lvliangzhuifengdao_hengdao` **（原创扩展命名）**，突进 2 后单体，倍率 **1.00**，耗内 6%、cd1、收招 1000；核算 `1×(1+0.12)−0.10=1.02≈1.00`。
- **来源 / 被动**：吕梁三杰战斗观摩或残谱；组合成员姓名、兵刃与交手细节**（待考）**，刀法定名原创。

### 8.7 `sk_huahuijian` 华辉快剑（6 玄上 · 兵器/剑）

**字段**｜`origin:canonExpanded`；`sect:null`；`lineage:华辉`；`nature:yin`；`wOut/wIn:0.70/0.30`；`weaponReq:{category:sword}`；`sourceChapters:[ch10_baima]`；`reqs: attrs {agi:40}, aptitude {apSword:35}, prereq [{skill:sk_huahuijibenjian,layer:4}]`（硬：aptitude/prereq）；`layerStats:{crit:[2,6],hit:[1,4]}`；`setTags:[]`。

- **代表招式**：夜隙一闪 `mv_huahuijian_yexi`（绝招，**原创扩展命名**），单体近身，倍率 **3.15**，耗内 8%、气势 100、收招 1200，夜间为常见条件；核算 `3.00×(1+0.05)=3.15`。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`
- **来源 / 被动**：华辉传授/观摩；人物身份、与瓦耳拉齐等关系及实际剑术**（待考）**。夜间首次攻击命中 +6。

### 8.8 `sk_huahuiyexing` 华辉夜行术（4 玄下 · 轻功）

**字段**｜`origin:expanded`；`sect:null`；`lineage:华辉`；`nature:yin`；`sourceChapters:[ch10_baima]`；`reqs: attrs {agi:30,wil:20}, aptitude {apLight:20}, prereq [{skill:sk_huahuijibenjian,layer:3}]`（硬：prereq）；`Q_skill=QS(4)=56`；`layerStats:{eva:[2,6],tough:[1,4]}`；`setTags:[]`；`movement.actionBonus:{stealth:[5,15]}`。

- **代表招式**：暗处移形 `mv_huahuiyexing_yixing` **（原创扩展）**，移动至 3 格内遮蔽格后单体，倍率 **1.00**，耗内 6%、cd2、收招 900，绕背；核算 `1×(1+0.24−0.07)−0.15=1.02≈1.00`。
- **来源 / 被动**：华辉线传授；夜间潜行噪声 −10%，不等于隐身。

### 8.9 玄阶招式与被动闭合索引

本节每门 3 招、2 被动，解锁与标注沿用 §6.12；代表式 1 重，下表补 4/7 重招式和 3/10 重被动。高昌遗迹、部族生活与人物只作为来源锚点，不将原创套路包装成历史或原著定名。

| 武学 | 4 重补充招式（ID · 倍率 · 一句效果） | 7 重补充招式（ID · 倍率 · 一句效果） | 被动（3 重；10 重） |
|---|---|---|---|
| `sk_gaochangjian` | 倚门斜削 `mv_gaochangjian_yimen` · 1.00 · 单体近身，相邻障碍 ≥2 时命中 +6 | 回廊反刺 `mv_gaochangjian_huilang` · 0.95 · 绕背后单体，命中后可回原格 | 识隙 `ps_gaochangjian_shixi`：相邻障碍 ≥2 时命中 +6；回廊剑成 `ps_gaochangjian_dacheng`：室内招架 +6 |
| `sk_gaochanggong` | 收沙入息 `mv_gaochanggong_shousha` · 0 · 自身获 `bf_huinei` G=1·2，cd3 | 守藏劲 `mv_gaochanggong_shoucang` · 0 · 自身获 `bf_hutizhenqi` G=1·2，cd4 | 耐沙 `ps_gaochanggong_naisha`：沙地探索体力消耗 −10%；守藏 `ps_gaochanggong_shoucang`：守卫目标相邻 2 格内韧性 +6 |
| `sk_gaochangjiguan` | 落石牵索 `mv_gaochangjiguan_qiansuo` · 0 · 1–3 格投放，踏入者 `bf_shiheng` 65%·1 | 迷门转枢 `mv_gaochangjiguan_zhuanshu` · 0 · 2 格区域改为困难地形 2 回合，cd3 | 辨机 `ps_gaochangjiguan_bianji`：探索机关检定 `formation +6`；留痕 `ps_gaochangjiguan_liuhen`：本方陷阱对友方可见且不触发 |
| `sk_hasakeshuai` | 绊膝压肩 `mv_hasakeshuai_banxi` · 0.95 · 单体近身，`bf_shiheng` 50%·1 | 旋身抛掷 `mv_hasakeshuai_paoshi` · 0.90 · 单体近身，选择相邻空格移位 1 | 立根 `ps_hasakeshuai_ligen`：被位移距离 −1（最低 0）；竞胜 `ps_hasakeshuai_jingsheng`：成功位移敌人后命中 +5 至下回合 |
| `sk_hasakexinfa` | 马背调息 `mv_hasakexinfa_mabei` · 0 · 自身获 `bf_wenzhong` G=1·2，骑乘时持续 +1，cd3 | 旷野回元 `mv_hasakexinfa_huiyuan` · 0 · 自身获 `bf_huinei` G=2·2，室外限定，cd4 | 长行 `ps_hasakexinfa_changxing`：骑乘后体力恢复 +5%；草原心成 `ps_hasakexinfa_dacheng`：室外 `mpRegen +0.5` |
| `sk_lvliangzhuifengdao` | 截路反劈 `mv_lvliangzhuifengdao_fanpi` · 1.00 · 单体近身，目标本回合移动过则命中 +6 | 逐马回刀 `mv_lvliangzhuifengdao_huidao` · 1.00 · 突进 2 后 `aoe_cone {angle:120,r:1,dirCount:6}` | 截路 `ps_lvliangzhuifengdao_jielu`：对移动过的目标 Z3 +6%；追风 `ps_lvliangzhuifengdao_zhuifeng`：突进后下一次刀招集气 +80 |
| `sk_huahuijian` | 暗门递刃 `mv_huahuijian_dimen` · 1.05 · 单体近身，来自遮蔽格时命中 +6 | 灯灭回锋 `mv_huahuijian_huifeng` · 0.95 · 绕背后单体，夜间暴击 +6 | 夜袭 `ps_huahuijian_yexi`：夜间首次攻击命中 +6；快剑 `ps_huahuijian_kuaijian`：收招 ≤900 的本武学招式暴击 +5 |
| `sk_huahuiyexing` | 贴影潜步 `mv_huahuiyexing_qianbu` · 0.85 · 向遮蔽格移动 2 后单体 | 背灯换位 `mv_huahuiyexing_huanwei` · 0.90 · 与相邻目标换位后攻击 | 消声 `ps_huahuiyexing_xiaosheng`：夜间潜行噪声 −10%；借暗 `ps_huahuiyexing_jiean`：从遮蔽格开始行动时闪避 +5 |

---

## 9. 鸳鸯书界：玄阶紧凑卡（9 门）

9/9 卡均给代表招式核算；代表式 9 个 / 本节 27 个招式 = **33.3%**。本书界最高原生轻功仅为玄上，且直接引用 `sk_dengpingdushui`，本文新卡不越线。

### 9.1 `sk_biaojudaofa` 护镖刀（4 玄下 · 兵器/刀）

**字段**｜`origin:expanded`；`sect:sect_weixinbiaoju`；`nature:yang`；`wOut/wIn:0.80/0.20`；`weaponReq:{category:blade}`；`sourceChapters:[ch11_yuanyang]`；`reqs: aptitude {apBlade:25}, sect rank:3, prereq [{skill:sk_weixinbiaoquan,layer:4}]`（硬：sect/prereq）；`layerStats:{parry:[2,6],hit:[1,4]}`；`setTags:[]`。

- **代表招式**：车旁拦刀 `mv_biaojudaofa_landao` **（原创扩展）**，单体近身，倍率 **1.25**，耗内 6%、cd1、收招 1000，护送目标相邻为常见条件；核算 `1.00×(1+0.12+0.15)=1.27≈1.25`。
- **来源 / 被动**：威信镖局镖头传授；护送目标相邻时招架 +5。

### 9.2 `sk_weixinbian` 威信镖鞭（5 玄中 · 兵器/鞭索）

**字段**｜`origin:canonExpanded`；`sect:sect_weixinbiaoju`；`nature:neutral`；`wOut/wIn:0.70/0.30`；`weaponReq:{category:whip}`；`sourceChapters:[ch11_yuanyang]`；`reqs: attrs {agi:30}, aptitude {apWhip:30}, sect rank:3, prereq [{skill:sk_weixinjian,layer:4}]`（硬：sect）；`layerStats:{hit:[2,6],parry:[1,4]}`；`setTags:[]`。

- **代表招式**：卷缰回扯 `mv_weixinbian_huiche` **（原创扩展命名）**，单体 1–2 格近身，倍率 **1.15**，耗内 6%、cd2、收招 1000，拉拽 1；核算 `1.00×(1+0.24)−0.10=1.14≈1.15`。
- **来源 / 被动**：镖局护车线；原著镖队是否以鞭为主兵器**（待考）**，若无则整门视为原创扩展。

### 9.3 `sk_linyulongdao` 林玉龙刀法（6 玄上 · 兵器/刀）

**字段**｜`origin:canonExpanded`；`sect:null`；`lineage:林玉龙`；`nature:yang`；`wOut/wIn:0.80/0.20`；`weaponReq:{category:blade}`；`sourceChapters:[ch11_yuanyang]`；`reqs: attrs {str:35}, aptitude {apBlade:35}, prereq [{skill:sk_linrenjichudao,layer:4}]`（硬：prereq）；`layerStats:{hit:[2,6],parry:[1,4]}`；`setTags:[]`。

- **代表招式**：刚刀争先 `mv_linyulongdao_zhengxian`（绝招，**原创扩展命名**），单体近身，倍率 **2.95**，耗内 8%、气势 100、收招 1200，目标 `bf_shiheng` 30%·1；核算 `3.00−0.10×0.30=2.97≈2.95`。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`
- **来源 / 被动**：林玉龙传授；其性情、交手和刀路细节**（待考）**。与任飞燕刀均可单独使用。

### 9.4 `sk_renfeiyandao` 任飞燕刀法（6 玄上 · 兵器/刀）

**字段**｜`origin:canonExpanded`；`sect:null`；`lineage:任飞燕`；`nature:yin`；`wOut/wIn:0.65/0.35`；`weaponReq:{category:blade}`；`sourceChapters:[ch11_yuanyang]`；`reqs: attrs {agi:35,wis:25}, aptitude {apBlade:35}, prereq [{skill:sk_linrenjichudao,layer:4}]`（硬：prereq）；`layerStats:{eva:[2,6],counter:[1,4]}`；`setTags:[]`。

- **代表招式**：燕回让锋 `mv_renfeiyandao_rangfeng`（绝招，**原创扩展命名**），`aoe_behind` 单体近身，倍率 **2.85**，耗内 8%、气势 100、收招 1200，绕背；仅成功闪避后可用（绝招条件不另抬基础倍率）；核算 `3.00−0.15=2.85`。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`
- **来源 / 被动**：任飞燕传授；成功闪避后下一刀招架 +6。人物武功细节**（待考）**。

### 9.5 `sk_linrenhexinfa` 林任合心诀（5 玄中 · 内功）

**字段**｜`origin:expanded`；`sect:null`；`lineage:林任夫妇`；`nature:harmony`；`wOut/wIn:0/1`；`meridians:[mer_renmai,mer_daimai]` **【建议值】**；`sourceChapters:[ch11_yuanyang]`；`reqs: attrs {con:25,cha:30}, aptitude {apInner:25}, prereq [{anyOf:[{skill:sk_linyulongdao,layer:4},{skill:sk_renfeiyandao,layer:4}]}]`（硬：prereq）；`inner.contribution:{mpMaxPct:16,hpMaxPct:12.5,attrs:{con:3,agi:2,cha:2},mpRegen:1.2}`，`IP=16+12.5+2×7+5×1.2=48.5`；`stats:{resMind:5,parry:5}` 合计 10；`setTags:[]`。

- **代表招式**：同息 `mv_linrenhexinfa_tongxi` **（原创扩展）**，自身及 2 格内一友方支援，耗内 6%、cd3、收招 1000，双方 `bf_huinei` G=1·2；`power=0`，双目标回复由 cd3、距离和无伤害支付。
- **来源 / 被动**：夫妻支线和解后传授；相邻羁绊 ≥3 友方存在时抗心神 +5。整门为原创，不把拌嘴写成内功史实。

### 9.6 `sk_taiyueshibeishou` 太岳石碑手（6 玄上 · 兵器/奇门）

**字段**｜`origin:canonExpanded`；`sect:null`；`lineage:太岳四侠`；`nature:yang`；`wOut/wIn:0.90/0.10`；`weaponReq:{category:exotic,kinds:[misc]}`；`eq_changchangfengshibei` 目前在 `design/10` 建模为副手牌，须由其补登记 `exotic/misc` 兼容桥接后才可适配；`sourceChapters:[ch11_yuanyang]`；`reqs: attrs {str:40,con:35}, aptitude {apExotic:35}, prereq [{skill:sk_taiyuequan,layer:4}]`（硬：aptitude/prereq）；`layerStats:{tough:[2,6],parry:[1,4]}`；`setTags:[]`。

- **代表招式**：碑面横拍 `mv_taiyueshibei_hengpai`（绝招，**原创扩展命名**），`aoe_knock n1` 单体近身，倍率 **2.95**，耗内 8%、气势 100、收招 1200，击退 1；核算 `3.00−0.05=2.95`。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`
- **来源 / 被动**：常长风石碑支线；“以石碑为兵器”据 `design/10` 的原著待考项，固定手法名为原创。负重照装备结算。

### 9.7 `sk_taiyueqigong` 太岳奇攻（4 玄下 · 拳脚/拳）

**字段**｜`origin:expanded`；`sect:null`；`lineage:太岳四侠`；`nature:neutral`；`wOut/wIn:0.85/0.15`；`sourceChapters:[ch11_yuanyang]`；`reqs: attrs {wis:25,cha:20}, aptitude {apFist:20}, prereq [{skill:sk_taiyuequan,layer:4}]`（硬：prereq）；`layerStats:{hit:[1,5],eva:[1,5]}`；`setTags:[]`。

- **代表招式**：虚张声势 `mv_taiyueqigong_xuzhang` **（原创扩展）**，单体近身，倍率 **0.95**，耗内 6%、cd1、收招 900，`bf_chaofeng` 40%·1；核算 `1×(1+0.12−0.07)−0.25×0.40=0.95`。
- **来源 / 被动**：太岳四侠事件；嘲讽失败仍造成伤害，不强制剧情人物改换目标。

### 9.8 `sk_yuanyangshuangdao` 鸳鸯双刀式（5 玄中 · 兵器/刀）

**字段**｜`origin:expanded`；`sect:null`；`lineage:袁冠南、萧中慧`；`nature:harmony`；`wOut/wIn:0.70/0.30`；`weaponReq:{category:blade,dual:true}`；`sourceChapters:[ch11_yuanyang]`；`reqs: attrs {agi:30}, aptitude {apBlade:30}, prereq [{skill:sk_yuanyangjibenjian,layer:4}]`（硬：prereq）；`layerStats:{hit:[2,6],counter:[1,4]}`；`setTags:[set_yuanyangdao_renzhe]`。

- **代表招式**：鸳鸯错锋 `mv_yuanyangshuangdao_cuofeng` **（原创扩展命名）**，单体近身两段，合计倍率 **1.10**，耗内 6%、cd1、收招 1000；核算 `1×(1+0.12)=1.12≈1.10`；多段只拆分 `power`，不另扣未注册价值。
- **来源 / 被动**：袁冠南、萧中慧线；装备成对兵器 `eq_yuanyangdao` 可满足 `weaponReq.dual`，同类单手刀主副持也可满足；均不改变 C16 的左右互搏 `dualWield`。具体双刀合使情节**（待考）**。

### 9.9 `sk_daneishuangdao` 大内双刀合围（4 玄下 · 兵器/刀）

**字段**｜`origin:expanded`；`sect:sect_qinggong`；`nature:yang`；`wOut/wIn:0.85/0.15`；`weaponReq:{category:blade}`；`sourceChapters:[ch11_yuanyang]`；`reqs: attrs {str:25}, aptitude {apBlade:25}, sect rank:2, prereq [{skill:sk_yulinjichudao,layer:4}]`（硬：sect/prereq）；`layerStats:{hit:[2,6],parry:[1,4]}`；`setTags:[]`；单人可用。

- **代表招式**：押刀夹击 `mv_daneishuangdao_jiaji` **（原创扩展）**，单体近身，倍率 **1.25**，耗内 6%、cd1、收招 1000；目标另一侧有友方为常见条件；核算 `1.00×(1+0.12+0.15)=1.27≈1.25`。
- **来源 / 被动**：押送鸳鸯刀的大内侍卫线；不要求第二名角色才能施招，故不是强制合击。

### 9.10 玄阶招式与被动闭合索引

本节每门 3 招、2 被动，解锁、计数与原创标注沿用 §6.12。所有招式单人可施；“相邻友方”“护送目标”等只是条件加成，不把任何玄阶条目计作强制多人合击。

| 武学 | 4 重补充招式（ID · 倍率 · 一句效果） | 7 重补充招式（ID · 倍率 · 一句效果） | 被动（3 重；10 重） |
|---|---|---|---|
| `sk_biaojudaofa` | 车辕架刀 `mv_biaojudaofa_jiadao` · 1.00 · 单体近身，护送目标相邻时招架 +5 | 绕车回斩 `mv_biaojudaofa_huizhan` · 1.00 · `aoe_cone {angle:120,r:1,dirCount:6}`，命中后移动至护送目标相邻空格 | 护车 `ps_biaojudaofa_huche`：护送目标相邻时招架 +5；镖路 `ps_biaojudaofa_biaolu`：援护后集气 +80，每回合 1 次 |
| `sk_weixinbian` | 抖索缠腕 `mv_weixinbian_chanwan` · 0.95 · 1–2 格，`bf_shouqin(level:4,holdRange:1)` 45%·1 | 横缰扫路 `mv_weixinbian_saolu` · 0.95 · `aoe_cone {angle:120,r:1,dirCount:6}`，击退 1 | 护缰 `ps_weixinbian_hujiang`：拉拽目标后自身招架 +5；软索 `ps_weixinbian_ruansuo`：对 2 格目标效果命中 +6pp |
| `sk_linyulongdao` | 劈门重刀 `mv_linyulongdao_pimen` · 1.05 · 单体近身，目标未移动时 Z3 +6% | 怒锋压顶 `mv_linyulongdao_yading` · 1.00 · 单体近身，`bf_shiheng` 55%·1 | 争先 `ps_linyulongdao_zhengxian`：本回合首次刀招命中 +5；刚刀 `ps_linyulongdao_gangdao`：气血高于 70% 时 Z3 +6% |
| `sk_renfeiyandao` | 侧身让刃 `mv_renfeiyandao_rangren` · 0.95 · 单体近身，命中后退 1 | 燕尾回刀 `mv_renfeiyandao_huidao` · 0.90 · 绕背后单体 | 让锋 `ps_renfeiyandao_rangfeng`：成功闪避后下一刀招架 +6；燕回 `ps_renfeiyandao_yanhui`：自身位移后下一刀命中 +5 |
| `sk_linrenhexinfa` | 和气归元 `mv_linrenhexinfa_guiyuan` · 0 · 自身获 `bf_huinei` G=2·2，cd3 | 并息护心 `mv_linrenhexinfa_huxin` · 0 · 自身与 2 格友方获 `bf_wenzhong` G=1·2，cd4 | 同心 `ps_linrenhexinfa_tongxin`：相邻羁绊 ≥3 友方存在时抗心神 +5；和合 `ps_linrenhexinfa_hehe`：支援友方后自身回复 2% 内力，每回合 1 次 |
| `sk_taiyueshibeishou` | 碑角挑撞 `mv_taiyueshibei_tiaozhuang` · 0.95 · 单体近身，击退 1 | 负碑冲阵 `mv_taiyueshibei_chongzhen` · 0.90 · 突进 2 后单体，命中后自身获 `bf_shoushi` 1 回合 | 石重 `ps_taiyueshibei_shizhong`：被位移距离 −1（最低 0）；碑守 `ps_taiyueshibei_beishou`：持 `exotic/misc` 石碑类奇门时招架 +6 |
| `sk_taiyueqigong` | 声东击西 `mv_taiyueqigong_shengdong` · 1.00 · 单体近身，目标有 `bf_chaofeng` 时命中 +6 | 四侠乱拳 `mv_taiyueqigong_luanquan` · 1.00 · `aoe_cone {angle:120,r:1,dirCount:6}`，每多命中一人自身集气 +30 | 虚势 `ps_taiyueqigong_xushi`：嘲讽未命中时获 `bf_youshi` 1 回合；奇攻 `ps_taiyueqigong_qigong`：对有心神减益目标 Z3 +6% |
| `sk_yuanyangshuangdao` | 双锋分浪 `mv_yuanyangshuangdao_fenlang` · 1.00 · 同一目标两段，第二段命中 −5 | 交刀护伴 `mv_yuanyangshuangdao_huban` · 0.95 · 单体近身，命中后相邻友方获 `bf_shoushi` 1 回合 | 成双 `ps_yuanyangshuangdao_chengshuang`：满足 `weaponReq.dual` 时命中 +5；错锋 `ps_yuanyangshuangdao_cuofeng`：两段招式第二段 Z3 +6% |
| `sk_daneishuangdao` | 一前一后 `mv_daneishuangdao_qianhou` · 1.00 · 单体近身，友方在目标侧后方时命中 +6 | 押阵横拦 `mv_daneishuangdao_henglan` · 1.00 · `aoe_cone {angle:120,r:1,dirCount:6}`，命中后自身获 `bf_wenzhong` G=1·1 | 合围 `ps_daneishuangdao_hewei`：目标另一侧有友方时命中 +5；押刀 `ps_daneishuangdao_yadao`：护送目标相邻时招架 +5 |

---

## 10. 鹿鼎书界：黄阶一行条目（11 门）

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 |
|---|---|---|---|---|---|---|---|
| `sk_tiandihuiquan` | 天地会入门拳（3 黄上） | 天地会 | 拳脚/拳 | 鹿鼎 | 近身护同伴；`[]` | 无；入会 | 会众武备归纳，**（原创扩展）** |
| `sk_xiangtangbu` | 香堂步（3 黄上） | 天地会 | 轻功 | 鹿鼎 | `QS(3)=45`；撤离与巷道转角；`[]` | `sk_tiandihuiquan` 3 重 | **（原创扩展）**，ID/品阶沿 `design/17` |
| `sk_shenlongrumenquan` | 神龙入门拳（2 黄中） | 神龙教 | 拳脚/拳 | 鹿鼎 | 近身压迫；`set_shenlong_jiaozhu` | 无；入教 | **（原创扩展）** |
| `sk_mufujichujian` | 沐府基础剑（2 黄中） | 沐王府 | 兵器/剑 | 鹿鼎 | 守人优先；`[]` | 无；入府 | **（原创扩展）** |
| `sk_muwangbu` | 滇南步（3 黄上） | 沐王府 | 轻功 | 鹿鼎 | `QS(3)=45`；巷道转身；`[]` | 基础剑 2 重 | **（原创扩展）**，ID/品阶沿 `design/17` |
| `sk_wangwujibenjian` | 王屋基础剑（2 黄中） | 王屋派 | 兵器/剑 | 鹿鼎 | 击退前置；`[]` | 无；入门 | **（原创扩展）** |
| `sk_wangwuxinfa` | 王屋心法（3 黄上） | 王屋派 | 内功 | 鹿鼎 | `nature:yang`；`IP=10+6+2×4+5×1.2=30`；抗压；`[]` | 基础剑 3 重 | **（原创扩展）**，ID/品阶沿 `design/17` |
| `sk_daneichangquan` | 大内长拳（2 黄中） | 清宫 | 拳脚/拳 | 鹿鼎 | 架势与近身；`[]` | 无；侍卫学员 | 清宫训练的本作归纳，**（原创扩展）** |
| `sk_yulinjian` | 羽林基础剑（3 黄上） | 清宫 | 兵器/剑 | 鹿鼎 | 宫门招架；`[]` | 大内长拳 2 重 | 宫廷侍卫武备归纳，**（原创扩展）** |
| `sk_pingxituna` | 平西军吐纳（2 黄中） | 平西王府军士 | 内功 | 鹿鼎 | `nature:yang`；`IP=6+6+2×3+5×1.2=24`；列阵耐力；`[]` | 无；军职来源 | **（原创扩展）** |
| `sk_luochahuoqi` | 罗刹火器术（3 黄上） | 罗刹/雅克萨支线 | 暗器/火器 | 鹿鼎 | 使用 `eq_luochaduanchong`；装填、不可招架与弹药全由装备定义 | 获得短铳；`apHidden 20` | 作者决定 P19；武学条目为**（原创扩展）** |

**整体预算核对**：黄阶伤害招以 AF 1.00、耗内 5%、cd0、收招 1000 得 `power≈1.00`；带击退/失衡者扣 0.05–0.10，轻功只用 `QS(2)=38`、`QS(3)=45`。两门黄阶内功分别命中黄中 24、黄上 30；本表不越黄阶 layerStats 合计 6。

---

## 11. 连城书界：黄阶一行条目（9 门）

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 |
|---|---|---|---|---|---|---|---|
| `sk_xuedaorumenquan` | 血刀入门拳（2 黄中） | 血刀门 | 拳脚/拳 | 连城 | 抢身、压腕；`[]` | 无；入门 | **（原创扩展）** |
| `sk_xuedaojichudao` | 血刀基础刀（3 黄上） | 血刀门 | 兵器/刀 | 连城 | 低位斜斩；`[]` | 入门拳 3 重 | 血刀门背景据原著，基础套路**（原创扩展）** |
| `sk_wanjiaquan` | 万家拳（3 黄上） | 万家门 | 拳脚/拳 | 连城 | 推位与佯攻；`[]` | 无；家仆可学 | **（原创扩展）**，ID/品阶沿 `design/17` |
| `sk_wanjiajibenjian` | 万家基础剑（2 黄中） | 万家门 | 兵器/剑 | 连城 | 虚实起手；`[]` | 无；入门 | **（原创扩展）** |
| `sk_xiangxituna` | 湘西吐纳（3 黄上） | 梅念笙一门 | 内功 | 连城 | `nature:harmony`；`IP=10+6+2×4+5×1.2=30`；`setTags:[set_shenzhao_liancheng]` | 师承/狱中事件 | 地域名仅作游戏归纳，**（原创扩展）** |
| `sk_nansiqijibenjian` | 南四奇基础剑（2 黄中） | 南四奇 | 兵器/剑 | 连城 | 相邻协防；`[]` | 师承/观摩 | 并称有原著依据，套路名**（原创扩展）** |
| `sk_yuzhongduanquan` | 狱中短拳（1 黄下） | 丁典—狄云线 | 拳脚/拳 | 连城 | 狭格反击；`set_shenzhao_liancheng` | 荆州牢房事件 | **（原创扩展）** |
| `sk_yuzhongduandao` | 狱中短刀（2 黄中） | 荆州牢房缴获 | 兵器/刀 | 连城 | 贴身拆械；`set_shenzhao_liancheng` | 短拳 3 重 | **（原创扩展）** |
| `sk_xueguhushou` | 雪谷护手（3 黄上） | 水笙/南四奇线 | 拳脚/掌 | 连城 | 寒地援护；`[]` | 雪谷求生事件 | 人物处境据原著，武学名**（原创扩展）** |

**整体预算核对**：黄阶拳、剑、刀以 0.90–1.00 为目标，控制/援护每项扣 0.05–0.15；`sk_xiangxituna` 的 `IP=30` 精确命中黄上。无一门以代价型或誓约型机制换取越阶强度。

---

## 12. 白马书界：黄阶一行条目（8 门）

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 |
|---|---|---|---|---|---|---|---|
| `sk_gaochangjibenjian` | 高昌基础剑（2 黄中） | 高昌遗脉 | 兵器/剑 | 白马 | 狭道守门；`[]` | 无；寻路人 | **（原创扩展）** |
| `sk_gaochangtuna` | 高昌吐纳（3 黄上） | 高昌遗脉 | 内功 | 白马 | `nature:harmony`；`IP=10+6+2×4+5×1.2=30`；`[]` | 基础剑 3 重 | **（原创扩展）** |
| `sk_migongbu` | 迷宫步（3 黄上） | 高昌遗脉 | 轻功 | 白马 | `QS(3)=45`；转角视线；`[]` | 基础剑 2 重 | **（原创扩展）**，ID/品阶沿 `design/17` |
| `sk_caoyuanquan` | 草原拳（2 黄中） | 哈萨克部族 | 拳脚/拳 | 白马 | 骑下防身；`[]` | 无；客人/牧人 | 不称民族固定拳谱，**（原创扩展）** |
| `sk_caoyuandao` | 草原弯刀（3 黄上） | 哈萨克部族 | 兵器/刀 | 白马 | 移动后斩击；`[]` | 草原拳 3 重 | **（原创扩展）**，ID/品阶沿 `design/17` |
| `sk_hasakehuxi` | 草原呼吸法（2 黄中） | 哈萨克部族 | 内功 | 白马 | `nature:yang`；`IP=8+5+2×3+5×1=24`；`[]` | 无；部族来源 | **（原创扩展）** |
| `sk_lvliangquan` | 吕梁拳（3 黄上） | 吕梁三杰 | 拳脚/拳 | 白马 | 追逐中截路；`[]` | 人物事件 | 人物组合据原著，拳名**（原创扩展命名）** |
| `sk_huahuijibenjian` | 华辉基础剑（3 黄上） | 华辉 | 兵器/剑 | 白马 | 夜间先手；`[]` | 华辉线 | 人物与实际武学**（待考）**；名称原创 |

**整体预算核对**：伤害卡的基础倍率 0.90–1.00，移动后条件最多 +0.15 并由范围或控位扣回；两门内功分别命中黄上 30、黄中 24；本书黄阶轻功仅黄上，不影响最高原生轻功为地下的结论。

---

## 13. 鸳鸯书界：黄阶一行条目（9 门）

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 |
|---|---|---|---|---|---|---|---|
| `sk_weixinbiaoquan` | 威信镖拳（2 黄中） | 威信镖局 | 拳脚/拳 | 鸳鸯 | 贴车护人；`[]` | 无；趟子手 | **（原创扩展）** |
| `sk_weixinjian` | 威信基础剑（3 黄上） | 威信镖局 | 兵器/剑 | 鸳鸯 | 官道招架；`[]` | 镖拳 3 重 | **（原创扩展）** |
| `sk_hangzhen` | 镖车行阵（3 黄上） | 威信镖局 | 杂学/阵法 | 鸳鸯 | 护送站位；`[]` | 镖拳 3 重；`formation 20` | **（原创扩展）**，ID/品阶沿 `design/17` |
| `sk_linrenjichudao` | 林任基础刀（3 黄上） | 林任夫妇 | 兵器/刀 | 鸳鸯 | 一刚一柔的共同底式；`[]` | 师承 | **（原创扩展）** |
| `sk_taiyuequan` | 太岳入门拳（2 黄中） | 太岳四侠 | 拳脚/拳 | 鸳鸯 | 虚张声势；`[]` | 人物事件 | 组合据原著，拳名**（原创扩展）** |
| `sk_taiyuehuxi` | 太岳呼吸法（2 黄中） | 太岳四侠 | 内功 | 鸳鸯 | `nature:yang`；`IP=8+5+2×3+5×1=24`；`[]` | 太岳拳 3 重 | **（原创扩展）** |
| `sk_yuanyangjibenjian` | 双侠基础剑（3 黄上） | 袁冠南、萧中慧 | 兵器/剑 | 鸳鸯 | 制敌留手；`set_yuanyangdao_renzhe` | 双侠线 | 人物关系**（待考）**，套路名原创 |
| `sk_yulinjichudao` | 羽林基础刀（2 黄中） | 大内押刀侍卫 | 兵器/刀 | 鸳鸯 | 列队夹击；`[]` | 无；侍卫学员 | **（原创扩展）** |
| `sk_renzhetuna` | 仁者吐纳（3 黄上） | 鸳鸯双侠线 | 内功 | 鸳鸯 | `nature:harmony`；`IP=10+6+2×4+5×1.2=30`；`set_yuanyangdao_renzhe` | 双侠基础剑 3 重 | “仁者无敌”主题据原著，内功为**（原创扩展）** |

**整体预算核对**：黄阶攻击卡按 0.90–1.00，援护/阵法以 `power=0` 和位置要求支付；两门黄阶内功精确命中 24/30。大内双刀链是“基础刀 → 玄阶合围”，不产生额外地阶。

---

## 14. 套装候选（已由 `design/07` 收敛）

> 正式成员、阈值、效果与逐书界路径唯一见 `design/07` §15.4～§15.6；本节只保留图鉴侧成员索引。实际 `setTags` 已按 C22 只保留正式关系。

| 正式套装 | ID | 本图鉴成员 |
|---|---|---|
| 神龙教·教主武库 | `set_shenlong_jiaozhu` | `sk_shenlongrumenquan`、`sk_shenlongshebu`、`sk_shenlongzhang`、`sk_yingxiongsanzhao`、`sk_meirensanzhao`、`sk_shenlongxinfa` |
| 神照·连城 | `set_shenzhao_liancheng` | `sk_yuzhongduanquan`、`sk_yuzhongduandao`、`sk_yuzhongqinna`、`sk_xiangxituna`、`sk_meinianshengxinfa`、`sk_shenzhao` |
| 鸳鸯刀·仁者 | `set_yuanyangdao_renzhe` | `sk_yuanyangjibenjian`、`sk_renzhetuna`、`sk_yuanyangshuangdao`、`sk_fuqidaofa` |

天地会、陈近南、沐府、王屋、清宫、海大富、平西、血刀、万家、诗剑、南四奇、高昌、哈萨克、吕梁、华辉、威信、夫妻刀、太岳与押刀候选均已移除实际标签；装备草案未进入 v1 成员。完整去向见 `design/07` §19。

## 15. 本组统计

### 15.1 品阶、书界与类别

| 书界 | 天 | 地 | 玄 | 黄 | 合计 | 内功 | 拳脚 | 兵器 | 轻功 | 暗器 | 杂学 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 鹿鼎 | 1 | 7 | 11 | 11 | 30 | 3 | 11 | 10 | 4 | 2 | 0 |
| 连城 | 1 | 3 | 9 | 9 | 22 | 6 | 6 | 8 | 1 | 0 | 1 |
| 白马 | 0 | 2 | 8 | 8 | 18 | 4 | 3 | 7 | 2 | 1 | 1 |
| 鸳鸯 | 0 | 2 | 9 | 9 | 20 | 3 | 3 | 13 | 0 | 0 | 1 |
| **合计** | **2** | **14** | **37** | **37** | **90** | **16** | **23** | **38** | **7** | **3** | **3** |

类别按主类别计，弓/火器归暗器，机关/阵法/剑理归杂学；表中拳脚包括拳、掌、擒拿。四书轻功不足之处由明确的本土引用池补足，见 §16，不重复计入本文 90 门。

统一裁定后：天下 2 门各 2 记，共 4；地上 4 门各 2 记，地中 2 门各 2 记、3 门各 1 记，地下 5 门各 1 记，共 20；玄上 9 门各 1 记，共 9。统一裁定前为天4／地23／玄上9，本轮将 3 个既有 `mv_*` 降回普通招。

### 15.2 约束比例

| 指标 | 结果 | 判定 |
|---|---|---|
| AR-01 总量 | `60×1.5=90` | ✅ |
| 地:玄:黄 | `14:37:37 = 1:2.64:2.64`；2.64 落在 `3×(1±15%)=[2.55,3.45]` | ✅ |
| 天级闭集 | 2 门，均来自基准 §13；无新增天级 | ✅ |
| 玄阶条目完整度 | `37×3=111` 招、`37×2=74` 被动；每门均为 3 招、2 被动 | ✅ |
| 玄阶核算抽样 | 37/111=`33.3%`，高于 30% | ✅ |
| 地阶代价/誓约型 | 0/14=`0% ≤5%` | ✅ |
| 地阶强制多人合击 | 0/14=`0% ≤3%`；夫妻刀单人可施展 | ✅ |
| 敌人专用 | 0 门；没有 `enemyOnly:true` | ✅ |
| 内功性质 | 16/16 均标 `nature` | ✅ |

这里的“可选组合技”与“强制多人合击”严格区分：`sk_fuqidaofa` 单人有完整招式与补偿被动；只有额外满足 `design/09` 的双方装配、羁绊、距离条件时才建立 `cmb_fuqidao`。

### 15.3 外放统计与候选审计

本册逐招审计后共标记 **2** 招外放，均为地阶：天／地／玄／黄为 **0／2／0／0**。下表是 `tech/04` 构建 `projection-coverage.json` 的本文输入，按 `moveId` 排序；实体箭、针和火器只走既有投射／暗器通道。

| moveId | 结论 | 依据 | 所在位置 |
|---|---|---|---|
| `mv_hasakeqishe_benshe` | `not_projected` | 射出实体箭矢 | §4.2 |
| `mv_hasakeqishe_chuanshe` | `not_projected` | 多发实体箭矢穿阵 | §4.2 |
| `mv_hasakeqishe_dajian` | `not_projected` | 弓具与箭类弹药的实体投射 | §4.2 |
| `mv_hasakeqishe_huishen` | `not_projected` | 回身射出实体箭矢 | §4.2 |
| `mv_hasakeqishe_sanshi` | `not_projected` | 三枚实体箭矢，不因范围模板而外放 | §4.2 |
| `mv_huagumianzhang_cangzhen` | `not_projected` | “藏针”为绵劲隐蔽的比喻，原卡仍是近身掌击 | §2.8 |
| `mv_huagumianzhang_geyi` | `projected` | 掌中真气离体隔衣传劲；基础单体 1–3，三档均单体 | §2.8 |
| `mv_huagumianzhang_huihuan` | `not_projected` | 近身掌劲回环，未配置离体表现 | §2.8 |
| `mv_manchuqishe_chishe` | `not_projected` | 骑射实体箭矢 | §6.8 |
| `mv_manchuqishe_fuan` | `not_projected` | 两段实体箭矢投射 | §6.12 |
| `mv_manchuqishe_huima` | `not_projected` | 回马发射实体箭矢 | §6.12 |
| `mv_meirensanzhao_feiyan` | `not_projected` | 原卡的投射通道与后跃动作未声明离体真气；默认按实体／动作投送 | §2.4 |
| `mv_shenlongxinfa_tuxi` | `projected` | 运息后以掌端送出离体真气**（原创扩展）**；基础单体 1–4，三档均单体 | §2.2 |
| `mv_shenlongzhang_futan` | `not_projected` | 近身震袖扇面掌击，未声明离体掌风 | §6.12 |
| `mv_shenlongzhang_yazhen` | `not_projected` | 单体近身掌击，不按同门心法批量标记 | §6.2 |

黄阶 `sk_luochahuoqi` 尚无逐招全局 `moveId`；其伤害来自 `eq_luochaduanchong` 的实体弹药，明确不计外放，后续生成局部招式时也必须继承 `not_projected`。

---

## 16. 境界覆盖与装配可行性

### 16.1 口径

低武书界进入该章时可携带内功/拳脚/兵器各 1 门；玩家仍须在本书界把三个核心栏逐步补满。以下证明按“本土可习得池”计数：本文条目加上已由唯一归属图鉴明确登记到该书界的通行武学。引用只写 ID，不在本文重复定义。弓箭与火器按 C16 进暗器栏，**不计兵器栏**。

### 16.2 鹿鼎（本土核心栏均 ≥3）

| 槽类 | 本土可习得例 | 数量结论 |
|---|---|---|
| 内功 | `sk_shenlongxinfa`、`sk_wangwuxinfa`、`sk_pingxituna` | 本文 3；已满足 |
| 拳脚 | `sk_ningxue`、`sk_yingxiongsanzhao`、`sk_meirensanzhao`、`sk_huagumianzhang`、`sk_shenlongzhang`、`sk_muwangquan`、`sk_wangwuzhang`、`sk_bukushuaijiao`、`sk_daneichangquan`、`sk_tiandihuiquan`、`sk_shenlongrumenquan` | 本文 11；擒拿/拳/掌可组成三格拳脚栏 |
| 兵器 | 剑：`sk_hongyingjian`、`sk_mufuhujian`、`sk_wangwuposhijian`、`sk_muwangjian`、`sk_wangwujian`、`sk_yulinjian`；刀：`sk_tiandihuidao`、`sk_pingxijundao` | 本文同类剑 ≥3、刀 ≥2；满足三门兵器总量，且剑可同类三装 |
| 轻功 | 本文 `sk_xiangtangbu`、`sk_muwangbu`、`sk_shenlongshebu`、`sk_daneishenfa`；另引用 `sk_caoshangfei`、`sk_shenxing` | 最高原生 `sk_shenxing` 10 天下，与 05 §14.6/08 §4.7 一致 |

**装配例**：只带 1/1/1 的玩家，可在前期用平西军吐纳/大内长拳/羽林基础剑补位，中期换王屋心法/神龙掌/沐府剑法，后期按路线升到神龙心法/凝血神爪/任一地阶剑。火器术和骑射不挤占兵器携带位。

### 16.3 连城（本土核心栏均 ≥3）

| 槽类 | 本土可习得例 | 数量结论 |
|---|---|---|
| 内功 | `sk_shenzhao`、`sk_xuedaojing`、`sk_xuedaoxinfa`、`sk_wanjiaxinfa`、`sk_meinianshengxinfa`、`sk_xiangxituna` | 本文 6；阴/阳/调和均有 |
| 拳脚 | `sk_xuedaoqinfa`、`sk_yuzhongqinna`、`sk_xuedaorumenquan`、`sk_wanjiaquan`、`sk_yuzhongduanquan`、`sk_xueguhushou` | 本文 6；拳掌与擒拿均能补栏 |
| 兵器 | 剑：`sk_tangshijian`、`sk_wanjiajian`、`sk_luohualiushuijian`、`sk_wanjiajibenjian`、`sk_nansiqijibenjian`；刀：`sk_xuedaofa`、`sk_xuedaojichudao`、`sk_yuzhongduandao` | 剑 5、刀 3；两类都可完成同类三装 |
| 轻功 | 本文 `sk_xuedaojibu`；另引用 `sk_caoshangfei`、`sk_dengpingdushui`、`sk_yanzisanchaoshui` | 最高原生 `sk_yanzisanchaoshui` 7 地下，与约束一致 |

**装配例**：正线以湘西吐纳/狱中短拳/南四奇基础剑起步，升梅门心法/狱中擒拿/落花流水合守剑；邪线则用血刀心法/擒法/基础刀，最终升血刀经/血刀刀法。两条路线都无需跨书带满 2/2/2 才能成型。

### 16.4 白马（本土核心栏均 ≥3）

| 槽类 | 本土可习得例 | 数量结论 |
|---|---|---|
| 内功 | `sk_gaochanggong`、`sk_hasakexinfa`、`sk_gaochangtuna`、`sk_hasakehuxi` | 本文 4；调和与阳性两路 |
| 拳脚 | `sk_hasakeshuai`、`sk_caoyuanquan`、`sk_lvliangquan`；另可按通行池学 `sk_taizuchangquan` | 本文 3，已满足 |
| 兵器 | 剑：`sk_gaochangshouhujian`、`sk_gaochangjian`、`sk_gaochangjibenjian`、`sk_huahuijian`、`sk_huahuijibenjian`；刀：`sk_lvliangzhuifengdao`、`sk_caoyuandao` | 剑 5，足以同类三装；弓 `sk_hasakeqishe` 另占暗器栏 |
| 轻功 | 本文 `sk_migongbu`、`sk_huahuiyexing`；另引用 `sk_caoshangfei`、`sk_dengpingdushui`、`sk_yanzisanchaoshui` | 最高原生 `sk_yanzisanchaoshui` 7 地下，与约束一致 |

**装配例**：高昌路线从吐纳/基础剑起，升高昌劲/剑术再到守护剑；草原路线以呼吸法/草原拳/弯刀起，升草原心法/摔角，并把骑射装在暗器栏。任一路线都能给 1/1/1 玩家补齐核心栏。

### 16.5 鸳鸯（本土核心栏均 ≥3）

| 槽类 | 本土可习得例 | 数量结论 |
|---|---|---|
| 内功 | `sk_linrenhexinfa`、`sk_taiyuehuxi`、`sk_renzhetuna`；另有游方武当补位（见 `skills-daojia`） | 本文 3，已满足 |
| 拳脚 | `sk_taiyueqigong`、`sk_weixinbiaoquan`、`sk_taiyuequan`；另引用 `sk_taizuchangquan` | 本文 3，已满足 |
| 兵器 | 刀：`sk_fuqidaofa`、`sk_weixinliandao`、`sk_biaojudaofa`、`sk_linyulongdao`、`sk_renfeiyandao`、`sk_yuanyangshuangdao`、`sk_daneishuangdao`、`sk_linrenjichudao`、`sk_yulinjichudao`；另有剑、鞭、奇门 | 刀 9，同类三装充足 |
| 轻功 | 本文不新定义；引用 `sk_caoshangfei`、`sk_dengpingdushui`；`sk_babuganchan` 待收录、当前禁用 | 最高原生 `sk_dengpingdushui` 6 玄上，与约束一致 |

**装配例**：镖局路线以太岳呼吸法/威信镖拳/基础剑起步，再取合心诀/太岳奇攻/护镖刀；刀路线则由林任基础刀升任一玄上单刀，最终学夫妻刀法。无须激活组合技也能使用地中刀法。

### 16.6 品阶占比与获取节奏

`design/05` §14.4 的低武目标是**最终可习得池**天 0%–5%、地 8%–12%、玄 33%–38%、黄 48%–55%，而本文配额是本组首现子集，二者不能混算。裁定 `rulings-v1.md` §3.6 已给出四书的旧全局池，但其 `kangxi` 分量仍是 AR-01 前的 60 门旧配额；下表先给本文首现分配，再以“旧池其余来源不变、用本文新分配替换旧 kangxi 分量”计算临时池。此临时池只用于暴露 AR-01 后的再平衡缺口，不取代未来由 05 汇总全部图鉴得出的最终池。

| 书界 | 本文首现 天/地/玄/黄 | 替换后的临时全局池 | 临时池占比 | 判定 / 最小追加 |
|---|---|---|---|---|
| 鹿鼎 | `1/7/11/11`（另有本土天级引用 `sk_shenxing`） | `(2/9/33/47)−(1/4/6/9)+(1/7/11/11)=2/12/38/49=101` | `1.98%/11.88%/37.62%/48.51%` | 四项均在区间，临时通过；全局仍须按唯一 ID 重算 |
| 连城 | `1/3/9/9` | `(1/4/14/21)−(1/2/5/8)+(1/3/9/9)=1/5/18/22=46` | `2.17%/10.87%/39.13%/47.83%` | 玄偏高、黄偏低；最少再补 2 黄得 `1/5/18/24=48`（`2.08%/10.42%/37.5%/50%`） |
| 白马 | `0/2/8/8` | `(0/3/11/16)−(0/2/4/6)+(0/2/8/8)=0/3/15/18=36` | `0%/8.33%/41.67%/50%` | 玄偏高；只加黄不能把玄压入 38% 且守住地 ≥8%，最少补 `+1地/+3黄` 得 `0/4/15/21=40` |
| 鸳鸯 | `0/2/9/9` | `(0/3/11/16)−(0/1/4/7)+(0/2/9/9)=0/4/16/18=38` | `0%/10.53%/42.11%/47.37%` | 玄偏高、黄偏低；最少补 5 黄得 `0/4/16/23=43`（`0%/9.30%/37.21%/53.49%`） |

补位不是本文新增武学配额的一部分。尤其白马的临时池需要多 1 门地阶，是因为旧 `general`/跨图鉴复现分布尚未按 AR-01 重定；应由全局汇总在既有地阶中增加本土来源或整体重排，不能在本图鉴擅自新增第三门白马地阶。任何补位都须重新做唯一 ID、路线可得性和来源品阶检查。

获取节奏仍按黄阶负责前一幕补槽、玄阶负责路线成形、地阶作为组织或人物顶点；不会让玩家在获得黄阶前被要求以地阶作前置。

“最高原生轻功”只限定轻功品阶，并不限制机关、坐骑和身份钥匙。连城/白马的地下轻功、鸳鸯的玄上轻功均为引用项；引用池已由 `design/08` §4.6–§4.7 登记，不算入本文 90 门首现总数。

---

## 16A. 经脉系统落地（AR-14）

### 16A.1 接口、短码与运行边界

本节是本图鉴的经脉内容配表，字段与算法只引用 `design/21` §3–§5、§10–§12：每个现有 `MoveDef` 以 `meridianRouteRef` 指向一个 `MeridianRouteDef`；路线对象仍使用 `id / moveRef / ultimate / purpose / requiredNature / steps[{acupointRef,segmentCt,riskBp}]`。`mfr_*`、`txp_*` 前缀已由 Canon v1.3 §12 登记；本文只登记本组内容实例，不把 schema、乘区、调息公式或穴位拓扑据为己有。

- 性质短码：阴=`[yin,harmony]`，阳=`[yang,harmony]`，和=`[harmony]`，中=`[yin,yang,harmony]`；它展开为 `requiredNature`，不是新枚举。
- 下表骨架短码只压缩文档；构建时必须逐项展开为 `steps`，不得把 `K-*` 传给 Core。数组与穴位一一对应，所有穴位均已在 `design/15` 登记。
- 路线 ID 统一为 `mfr_<moveRef 去掉 mv_>`；`ultimate` 必须与原招一致。同一招只有一个主 `purpose`：伤害 / 擒拿 / 点穴取 `attack`，架势 / 护体 / 治疗取 `defense`，轻功招式取 `movement`。
- `movement` 路线同样继承所属武学按上项展开的 `requiredNature`，不因使用通用 `K-M3/K-M5` 骨架而改成中性或省略该字段。
- 任一路线实际尝试 CT 计入该招收招；预检硬封不付 CT，途中卡住仍付已尝试段 CT。每个可独立行动的玩家、同伴、普通敌人、精英与 Boss 各初始化一个 `MeridianFlowModule`，只共享只读路线定义，不共享节点运行态或 RNG（见 21 §11）。

| 骨架 | 穴位序列（有序、无重复） | `segmentCt[]` | `riskBp[]` | ΣCT | 用途 |
|---|---|---|---|---:|---|
| `K-Y5` | `ap_renmai_qihai→ap_renmai_danzhong→ap_shoujueyin_tianchi→ap_shoujueyin_neiguan→ap_shoujueyin_laogong` | `[70,70,80,70,70]` | `[100,150,300,150,100]` | 360 | 阴性常用 |
| `K-A5` | `ap_dumai_mingmen→ap_dumai_zhiyang→ap_dumai_shendao→ap_shouyangming_quchi→ap_shouyangming_shangyang` | `[70,70,70,80,70]` | `[100,150,150,300,100]` | 360 | 阳性常用 |
| `K-H5` | `ap_zushaoyin_yongquan→ap_zushaoyin_taixi→ap_zutaiyang_weizhong→ap_dumai_mingmen→ap_shoujueyin_laogong` | `[70,70,70,70,70]` | `[100,100,200,250,150]` | 350 | 调和 / 中性常用 |
| `K-YD4` | `ap_renmai_qihai→ap_renmai_guanyuan→ap_renmai_zhongwan→ap_renmai_danzhong` | `[70,70,70,70]` | `[50,80,100,120]` | 280 | 阴性防守 |
| `K-AD4` | `ap_dumai_mingmen→ap_dumai_zhiyang→ap_dumai_shendao→ap_dumai_baihui` | `[70,70,80,80]` | `[50,100,150,200]` | 300 | 阳性防守 |
| `K-HD4` | `ap_daimai_zulinqi→ap_daimai_weidao→ap_daimai_daimai→ap_dumai_zhiyang` | `[70,70,70,70]` | `[80,100,120,180]` | 280 | 调和 / 中性防守 |
| `K-YN2` | `ap_renmai_qihai→ap_shoujueyin_laogong` | `[70,70]` | `[80,100]` | 140 | 阴性自然护体 |
| `K-AN2` | `ap_dumai_mingmen→ap_shouyangming_shangyang` | `[70,70]` | `[80,100]` | 140 | 阳性自然护体 |
| `K-HN2` | `ap_zushaoyin_yongquan→ap_dumai_mingmen` | `[70,70]` | `[80,120]` | 140 | 调和 / 中性自然护体 |
| `K-M3` | `ap_zushaoyin_yongquan→ap_zushaoyin_taixi→ap_dumai_mingmen` | `[60,60,60]` | `[50,100,200]` | 180 | 黄阶速度 |
| `K-M5` | `ap_zushaoyin_yongquan→ap_zushaoyin_taixi→ap_zutaiyang_weizhong→ap_dumai_mingmen→ap_dumai_baihui` | `[60,60,70,60,70]` | `[50,80,120,180,200]` | 320 | 玄 / 地速度 |
| `K-Y8` | `ap_renmai_qihai→ap_renmai_guanyuan→ap_renmai_zhongwan→ap_renmai_danzhong→ap_shoujueyin_tianchi→ap_shoujueyin_quze→ap_shoujueyin_neiguan→ap_shoujueyin_laogong` | `[90,90,90,90,90,90,90,90]` | `[100,100,150,180,350,200,180,150]` | 720 | 阴性地阶绝招 |
| `K-A8` | `ap_dumai_mingmen→ap_dumai_zhiyang→ap_dumai_shendao→ap_dumai_baihui→ap_shouyangming_quchi→ap_shouyangming_shousanli→ap_shouyangming_hegu→ap_shouyangming_shangyang` | `[90,90,90,90,90,90,90,90]` | `[100,150,180,250,350,180,150,120]` | 720 | 阳性地阶绝招 |
| `K-H8` | `ap_zushaoyin_yongquan→ap_zushaoyin_taixi→ap_zutaiyang_weizhong→ap_dumai_mingmen→ap_daimai_zulinqi→ap_daimai_weidao→ap_daimai_daimai→ap_dumai_zhiyang` | `[90,90,90,90,90,90,90,90]` | `[100,120,180,250,350,180,160,150]` | 720 | 调和 / 中性地阶绝招 |
| `K-Y6U` | `ap_renmai_qihai→ap_renmai_guanyuan→ap_renmai_zhongwan→ap_renmai_danzhong→ap_shoujueyin_neiguan→ap_shoujueyin_laogong` | `[100,100,100,100,100,100]` | `[100,120,180,250,220,180]` | 600 | 阴性玄上绝招 |
| `K-A6U` | `ap_dumai_mingmen→ap_dumai_zhiyang→ap_dumai_shendao→ap_dumai_baihui→ap_shouyangming_hegu→ap_shouyangming_shangyang` | `[100,100,100,100,100,100]` | `[100,150,180,250,220,160]` | 600 | 阳性玄上绝招 |
| `K-H6U` | `ap_zushaoyin_yongquan→ap_zushaoyin_taixi→ap_zutaiyang_weizhong→ap_dumai_mingmen→ap_daimai_zulinqi→ap_daimai_daimai` | `[100,100,100,100,100,100]` | `[100,120,180,250,220,160]` | 600 | 调和 / 中性玄上绝招 |
| `K-Y10` | `ap_renmai_qihai→ap_renmai_guanyuan→ap_renmai_zhongwan→ap_renmai_danzhong→ap_shoujueyin_tianchi→ap_shoujueyin_quze→ap_shoujueyin_neiguan→ap_shoujueyin_laogong→ap_shoujueyin_zhongchong→ap_shoutaiyin_shaoshang` | `[80,80,80,80,80,80,80,80,80,80]` | `[100,100,120,150,350,180,160,140,120,300]` | 800 | 阴性天阶绝招 |
| `K-A10` | `ap_renmai_qihai→ap_renmai_danzhong→ap_dumai_mingmen→ap_dumai_zhiyang→ap_dumai_shendao→ap_dumai_baihui→ap_shouyangming_quchi→ap_shouyangming_shousanli→ap_shouyangming_hegu→ap_shouyangming_shangyang` | `[80,80,80,80,80,80,80,80,80,80]` | `[100,150,350,150,180,250,350,180,150,120]` | 800 | 阳性天阶绝招 |
| `K-H10` | `ap_zushaoyin_yongquan→ap_zushaoyin_taixi→ap_zutaiyang_weizhong→ap_dumai_mingmen→ap_daimai_zulinqi→ap_daimai_weidao→ap_daimai_daimai→ap_dumai_zhiyang→ap_renmai_qihai→ap_renmai_danzhong` | `[80,80,80,80,80,80,80,80,80,80]` | `[100,120,180,250,350,180,160,150,350,150]` | 800 | 调和 / 中性天阶绝招 |

所有单段 CT 都在 40–120，风险在 0–1200。普通高阶招采用 5 段（防守 4 段），玄上 / 地阶 / 天阶绝招分别采用 6 / 8 / 10 段；取现有最大普通收招 1100、绝招收招 1200，最坏核算分别为 `1100+360=1460`、`1200+600=1800`、`1200+720=1920`、`1200+800=2000`，均满足 21 §4.6 的 `recovery+ΣsegmentCt≤2000`。

### 16A.2 天 / 地阶逐招路线注册

表内每项格式为“`moveRef → meridianRouteRef / ultimate / purpose / 骨架`”；性质列展开成各路线的 `requiredNature`。路线、效果与招名均是对现有条目的数据挂接，不新增或改称招式；出处标注继续沿用各完整卡。

| 武学 / 性质 | 逐招路线 |
|---|---|
| `sk_ningxue` / 阴 | `mv_ningxue_yizhua→mfr_ningxue_yizhua/false/attack/K-Y5`；`mv_ningxue_tanmai→mfr_ningxue_tanmai/false/attack/K-Y5`；`mv_ningxue_jiemai→mfr_ningxue_jiemai/false/attack/K-Y5`；`mv_ningxue_zhuihun→mfr_ningxue_zhuihun/false/attack/K-Y5`；`mv_ningxue_fengmen→mfr_ningxue_fengmen/true/attack/显式（见本册绝招显式路线索引）`；`mv_ningxue_jueming→mfr_ningxue_jueming/true/attack/显式（见本册绝招显式路线索引）` |
| `sk_shenlongxinfa` / 阳 | `mv_shenlongxinfa_tuxi→mfr_shenlongxinfa_tuxi/false/attack/外放显式（见下表）`；`mv_shenlongxinfa_zuozhen→mfr_shenlongxinfa_zuozhen/true/defense/显式（见本册绝招显式路线索引）`；`mv_shenlongxinfa_wanshou→mfr_shenlongxinfa_wanshou/true/defense/显式（见本册绝招显式路线索引）` |
| `sk_yingxiongsanzhao` / 阳 | `mv_yingxiongsanzhao_zixu→mfr_yingxiongsanzhao_zixu/false/attack/K-A5`；`mv_yingxiongsanzhao_luda→mfr_yingxiongsanzhao_luda/false/attack/K-A5`；`mv_yingxiongsanzhao_diqing→mfr_yingxiongsanzhao_diqing/true/attack/显式（见本册绝招显式路线索引）`；`mv_yingxiongsanzhao_huishi→mfr_yingxiongsanzhao_huishi/false/attack/K-A5`；`mv_yingxiongsanzhao_sanxiong→mfr_yingxiongsanzhao_sanxiong/false/attack/K-A5` |
| `sk_meirensanzhao` / 阴 | `mv_meirensanzhao_guifei→mfr_meirensanzhao_guifei/false/attack/K-Y5`；`mv_meirensanzhao_xiaolian→mfr_meirensanzhao_xiaolian/false/defense/K-YD4`；`mv_meirensanzhao_feiyan→mfr_meirensanzhao_feiyan/true/attack/显式（见本册绝招显式路线索引）`；`mv_meirensanzhao_huishen→mfr_meirensanzhao_huishen/false/attack/K-Y5`；`mv_meirensanzhao_sanmei→mfr_meirensanzhao_sanmei/false/attack/K-Y5` |
| `sk_hongyingjian` / 中 | `mv_hongyingjian_dianwan→mfr_hongyingjian_dianwan/false/attack/K-H5`；`mv_hongyingjian_jiaofeng→mfr_hongyingjian_jiaofeng/false/attack/K-H5`；`mv_hongyingjian_jieren→mfr_hongyingjian_jieren/false/defense/K-HD4`；`mv_hongyingjian_huifeng→mfr_hongyingjian_huifeng/false/attack/K-H5`；`mv_hongyingjian_tongxin→mfr_hongyingjian_tongxin/true/attack/显式（见本册绝招显式路线索引）` |
| `sk_mufuhujian` / 阳 | `mv_mufuhujian_hengjian→mfr_mufuhujian_hengjian/false/attack/K-A5`；`mv_mufuhujian_dianjian→mfr_mufuhujian_dianjian/false/attack/K-A5`；`mv_mufuhujian_huishen→mfr_mufuhujian_huishen/false/defense/K-AD4`；`mv_mufuhujian_yindi→mfr_mufuhujian_yindi/false/attack/K-A5`；`mv_mufuhujian_sheshen→mfr_mufuhujian_sheshen/true/attack/显式（见本册绝招显式路线索引）` |
| `sk_wangwuposhijian` / 中 | `mv_wangwuposhi_xiaoshi→mfr_wangwuposhi_xiaoshi/false/attack/K-H5`；`mv_wangwuposhi_henglan→mfr_wangwuposhi_henglan/false/attack/K-H5`；`mv_wangwuposhi_jiepo→mfr_wangwuposhi_jiepo/false/attack/K-H5`；`mv_wangwuposhi_jielu→mfr_wangwuposhi_jielu/false/attack/K-H5`；`mv_wangwuposhi_kaishan→mfr_wangwuposhi_kaishan/true/attack/显式（见本册绝招显式路线索引）` |
| `sk_huagumianzhang` / 阴 | `mv_huagumianzhang_mianzhang→mfr_huagumianzhang_mianzhang/false/attack/K-Y5`；`mv_huagumianzhang_qianjin→mfr_huagumianzhang_qianjin/false/attack/K-Y5`；`mv_huagumianzhang_geyi→mfr_huagumianzhang_geyi/false/attack/外放显式（见下表）`；`mv_huagumianzhang_huihuan→mfr_huagumianzhang_huihuan/true/attack/显式（见本册绝招显式路线索引）`；`mv_huagumianzhang_cangzhen→mfr_huagumianzhang_cangzhen/true/attack/显式（见本册绝招显式路线索引）` |
| `sk_shenzhao` / 和 | `mv_shenzhao_tuna→mfr_shenzhao_tuna/false/defense/K-HD4`；`mv_shenzhao_xumai→mfr_shenzhao_xumai/true/defense/显式（见本册绝招显式路线索引）`；`mv_shenzhao_huming→mfr_shenzhao_huming/true/defense/显式（见本册绝招显式路线索引）` |
| `sk_xuedaojing` / 阴 | `mv_xuedaojing_cuiren→mfr_xuedaojing_cuiren/false/attack/K-Y5`；`mv_xuedaojing_yinren→mfr_xuedaojing_yinren/true/attack/显式（见本册绝招显式路线索引）`；`mv_xuedaojing_zhaoxue→mfr_xuedaojing_zhaoxue/true/attack/显式（见本册绝招显式路线索引）` |
| `sk_xuedaofa` / 阴 | `mv_xuedaofa_furen→mfr_xuedaofa_furen/false/attack/K-Y5`；`mv_xuedaofa_tiexue→mfr_xuedaofa_tiexue/false/attack/K-Y5`；`mv_xuedaofa_huidao→mfr_xuedaofa_huidao/false/attack/K-Y5`；`mv_xuedaofa_cangfeng→mfr_xuedaofa_cangfeng/true/attack/显式（见本册绝招显式路线索引）`；`mv_xuedaofa_henggu→mfr_xuedaofa_henggu/true/attack/显式（见本册绝招显式路线索引）` |
| `sk_tangshijian` / 和 | `mv_tangshijian_duanju→mfr_tangshijian_duanju/false/attack/K-H5`；`mv_tangshijian_qiyun→mfr_tangshijian_qiyun/false/attack/K-H5`；`mv_tangshijian_yingdui→mfr_tangshijian_yingdui/false/attack/K-H5`；`mv_tangshijian_huanyun→mfr_tangshijian_huanyun/true/attack/显式（见本册绝招显式路线索引）`；`mv_tangshijian_liancheng→mfr_tangshijian_liancheng/true/attack/显式（见本册绝招显式路线索引）` |
| `sk_gaochangshouhujian` / 和 | `mv_gaochangshouhu_shoumen→mfr_gaochangshouhu_shoumen/false/attack/K-H5`；`mv_gaochangshouhu_yinjian→mfr_gaochangshouhu_yinjian/false/attack/K-H5`；`mv_gaochangshouhu_zhuanmen→mfr_gaochangshouhu_zhuanmen/false/attack/K-H5`；`mv_gaochangshouhu_jieai→mfr_gaochangshouhu_jieai/true/attack/显式（见本册绝招显式路线索引）`；`mv_gaochangshouhu_qianmen→mfr_gaochangshouhu_qianmen/true/attack/显式（见本册绝招显式路线索引）` |
| `sk_hasakeqishe` / 中 | `mv_hasakeqishe_dajian→mfr_hasakeqishe_dajian/false/attack/K-H5`；`mv_hasakeqishe_huishen→mfr_hasakeqishe_huishen/false/attack/K-H5`；`mv_hasakeqishe_benshe→mfr_hasakeqishe_benshe/false/attack/K-H5`；`mv_hasakeqishe_chuanshe→mfr_hasakeqishe_chuanshe/false/attack/K-H5`；`mv_hasakeqishe_sanshi→mfr_hasakeqishe_sanshi/true/attack/显式（见本册绝招显式路线索引）` |
| `sk_fuqidaofa` / 和 | `mv_fuqidaofa_wenlu→mfr_fuqidaofa_wenlu/false/attack/K-H5`；`mv_fuqidaofa_cuobu→mfr_fuqidaofa_cuobu/false/attack/K-H5`；`mv_fuqidaofa_zhenghe→mfr_fuqidaofa_zhenghe/false/defense/K-HD4`；`mv_fuqidaofa_huihuan→mfr_fuqidaofa_huihuan/false/attack/K-H5`；`mv_fuqidaofa_tongxin→mfr_fuqidaofa_tongxin/true/attack/显式（见本册绝招显式路线索引）` |
| `sk_weixinliandao` / 阳 | `mv_weixinliandao_huche→mfr_weixinliandao_huche/false/attack/K-A5`；`mv_weixinliandao_landao→mfr_weixinliandao_landao/false/attack/K-A5`；`mv_weixinliandao_jiebiao→mfr_weixinliandao_jiebiao/false/attack/K-A5`；`mv_weixinliandao_yazhen→mfr_weixinliandao_yazhen/false/attack/K-A5`；`mv_weixinliandao_lianying→mfr_weixinliandao_lianying/true/attack/显式（见本册绝招显式路线索引）` |

以上 75/75 个高阶 `mv_*` 都有唯一稳定路线，16/16 门均达到统一裁定表的绝招定数：天下 2、地上 2、地中按逐门裁定取 1 或 2、地下 1。支援绝招使用对应品阶的防守路线；伤害式即使带位移仍以 `attack` 为唯一主用途，避免同招重复提交攻路与速度路。

#### 外放普通招式显式路线

下列覆写优先于 §16A.1 的通用骨架；保持地阶普通招 5 段、总 CT 360 与原性质，只把掌劲／吐息的动作末端收束到 `design/21` §4.2.1、§4.4.1.4 要求的手部穴位，均为**（原创扩展）**。

| 武学 | moveRef | 路线 id | purpose / requiredNature | 显式 steps（`acupointRef/segmentCt/riskBp`） | 段数 | 路线 CT |
|---|---|---|---|---|---:|---:|
| `sk_huagumianzhang` | `mv_huagumianzhang_geyi` | `mfr_huagumianzhang_geyi` | attack / `[yin,harmony]` | `ap_renmai_qihai/70/100 → ap_renmai_danzhong/70/150 → ap_shoujueyin_quze/80/300 → ap_shoujueyin_neiguan/70/150 → ap_shoujueyin_laogong/70/100` | 5 | 360 |
| `sk_shenlongxinfa` | `mv_shenlongxinfa_tuxi` | `mfr_shenlongxinfa_tuxi` | attack / `[yang,harmony]` | `ap_dumai_mingmen/70/100 → ap_dumai_zhiyang/70/150 → ap_shouyangming_quchi/70/150 → ap_shoujueyin_neiguan/80/300 → ap_shoujueyin_laogong/70/100` | 5 | 360 |

### 16A.3 玄 / 黄阶模板引用与轻功速度路线

玄上绝招不再走隐式模板。下表逐招登记 9 条稳定路线；每条均显式展开为 `mfr_* / true / purpose / 见文首索引`，对应 6 段、单段 100 CT，风险按文首索引逐段求和。其余玄中 / 玄下普通招与黄阶仍按后表模板展开。

| 武学 / 性质 | 玄上绝招显式路线 |
|---|---|
| `sk_shenlongzhang` / 阳 | `mv_shenlongzhang_yazhen→mfr_shenlongzhang_yazhen/true/attack/显式（见本册绝招显式路线索引）`（6 段，100 CT/段，总风险 900） |
| `sk_manchuqishe` / 阳 | `mv_manchuqishe_chishe→mfr_manchuqishe_chishe/true/attack/显式（见本册绝招显式路线索引）`（6 段，100 CT/段，总风险 900） |
| `sk_xuedaoqinfa` / 阴 | `mv_xuedaoqinfa_suobi→mfr_xuedaoqinfa_suobi/true/attack/显式（见本册绝招显式路线索引）`（6 段，100 CT/段，总风险 900） |
| `sk_meinianshengxinfa` / 和 | `mv_meinianshengxinfa_huixi→mfr_meinianshengxinfa_huixi/true/defense/显式（见本册绝招显式路线索引）`（6 段，100 CT/段，总风险 900） |
| `sk_gaochangjian` / 和 | `mv_gaochangjian_zhuanjiao→mfr_gaochangjian_zhuanjiao/true/attack/显式（见本册绝招显式路线索引）`（6 段，100 CT/段，总风险 900） |
| `sk_huahuijian` / 阴 | `mv_huahuijian_yexi→mfr_huahuijian_yexi/true/attack/显式（见本册绝招显式路线索引）`（6 段，100 CT/段，总风险 900） |
| `sk_linyulongdao` / 阳 | `mv_linyulongdao_zhengxian→mfr_linyulongdao_zhengxian/true/attack/显式（见本册绝招显式路线索引）`（6 段，100 CT/段，总风险 900） |
| `sk_renfeiyandao` / 阴 | `mv_renfeiyandao_rangfeng→mfr_renfeiyandao_rangfeng/true/attack/显式（见本册绝招显式路线索引）`（6 段，100 CT/段，总风险 900） |
| `sk_taiyueshibeishou` / 阳 | `mv_taiyueshibei_hengpai→mfr_taiyueshibei_hengpai/true/attack/显式（见本册绝招显式路线索引）`（6 段，100 CT/段，总风险 900） |

九条路线均有 `requiredNature`：阴 `[yin,harmony]`、阳 `[yang,harmony]`、和 `[harmony]`；每条绝招收招上界为 `1200+6×100=1800 CT`。

玄、黄阶不逐门重写穴位数组：其现有招式按类别、性质和语义展开下表模板，生成后仍得到逐 `mv_*` 的稳定 `mfr_<move>`；不得让同一招在不同构建中漂移。

| 大阶 / 招式语义 | 展开骨架 | 生成规则 |
|---|---|---|
| 玄阶伤害、擒拿、点穴 | 同性质 `K-Y5/K-A5/K-H5`，`purpose:attack` | 3–5 招全部展开；擒拿仍只引用 21 §8 严重度，不把抵消伤害换算成抗擒拿 |
| 玄阶架势、援护、护体 | 同性质 `K-YD4/K-AD4/K-HD4`，`purpose:defense` | 按招式支援 / 守势语义展开；不重复 Buff 效果 |
| 玄阶位移 / 轻功招式 | `K-M5`，`purpose:movement` | 适用于突进、绕背、后撤、换位、闪避预置与全部轻功动作 |
| 黄阶伤害 / 防守 | 前三穴 `K-Y5/K-A5/K-H5` 或前三穴防守骨架 | 2–3 段；由条目性质选择，`purpose` 由动作语义确定 |
| 黄阶轻功 | `K-M3`，`purpose:movement` | 无显式 `mv_*` 的一行卡由内容编译器为其既有移动动作生成局部 MoveDef 后挂接，不新增全局招名 ID |

| 轻功武学 | 速度路线绑定 | 核算 / 边界 |
|---|---|---|
| `sk_shenlongshebu` | `mv_shenlongshebu_shezhe/chuanxi/huishen → mfr_<move>/false/movement/K-M5` | 每式 `flowCt=320`；最大 `recovery 900+320=1220` |
| `sk_daneishenfa` | `mv_daneishenfa_zhefan/yanxia/chuandong → mfr_<move>/false/movement/K-M5` | 同上 |
| `sk_xuedaojibu` | `mv_xuedaojibu_qishen/huabu/huiyue → mfr_<move>/false/movement/K-M5` | 同上 |
| `sk_huahuiyexing` | `mv_huahuiyexing_yixing/qianbu/huanwei → mfr_<move>/false/movement/K-M5` | 同上 |
| `sk_xiangtangbu`、`sk_muwangbu`、`sk_migongbu` | 各自既有移动动作 → 稳定 `mfr_<move>/false/movement/K-M3` | `flowCt=180`；黄阶速度倍率不能绕过 08 的轻功门禁 / 地形成本 |

仅本图鉴定义的 7 门轻功在此补路线；跨册引用的 `sk_shenxing`、`sk_yanzisanchaoshui`、`sk_dengpingdushui`、`sk_caoshangfei` 应由各自归属图鉴同步，本文不越权定义其路线。经脉速度只输出 21 §4.9 的 `meridianSpeedBp` 等投影，不回写 `Q_skill`。

### 16A.4 内功调息档案与护体内劲档位

每门本册内功以 `breathProfileRef:txp_<skill slug>` 引用下表 `BreathProfile`。数值直接取 21 §10.2 通用公式；图鉴只保存公式输入与结果，不复制运行算法。字段顺序为 `grade/layer/nature/scope/ct/mpCostBp/outOfBattleScaleBp`；黄 / 玄 / 地天默认 `scope=1/2/3`，`ct=1000`、`mpCostBp=0`、`outOfBattleScaleBp=15000`；本册没有另设 scope 4 专精。

下表所有自然护体和主动护体路线在展开时均附 `innerGuard:{enabled:true,reflectBp:0}`；表内缩写 `reflectBp:0` 是该对象的子字段，不是 `MeridianRouteDef` 顶层字段。

| 内功 | `BreathProfile.id` | `grade/layer/nature/scope/ct/mpCostBp/outOfBattleScaleBp` | 10 重核算 `reliefBp / repairUnits` | 护体内劲档位 |
|---|---|---|---|---|
| `sk_shenzhao` | `txp_shenzhao` | `10/10/harmony/3/1000/0/15000` | `floor((500+100×10+80×10)×10500/10000)=2415`；`floor((120+24×10+18×10)×10500/10000)=567` | `guard:harmony-high`；自然 `K-HN2`；主动 `mv_shenzhao_huming→K-H10`；`reflectBp:0`；`outOfBattleScaleBp:15000` |
| `sk_shenlongxinfa` | `txp_shenlongxinfa` | `9/10/yang/3/1000/0/15000` | `2200 / 516` | `guard:yang-high`；自然 `K-AN2`；主动 `mv_shenlongxinfa_wanshou→K-A8`；`reflectBp:0`；`outOfBattleScaleBp:15000` |
| `sk_xuedaojing` | `txp_xuedaojing` | `9/10/yin/3/1000/0/15000` | `2200 / 516` | `guard:yin-high`；自然 `K-YN2`；无主动护体招；`reflectBp:0`；`outOfBattleScaleBp:15000` |
| `sk_meinianshengxinfa` | `txp_meinianshengxinfa` | `6/10/harmony/2/1000/0/15000` | `1995 / 466` | `guard:harmony-mid`；自然 `K-HN2`；主动 `mv_meinianshengxinfa_humai→K-HD4`；`reflectBp:0`；`outOfBattleScaleBp:15000` |
| `sk_xuedaoxinfa` | `txp_xuedaoxinfa` | `5/10/yin/2/1000/0/15000` | `1800 / 420` | `guard:yin-mid`；自然 `K-YN2`；无主动护体招；`reflectBp:0`；`outOfBattleScaleBp:15000` |
| `sk_gaochanggong` | `txp_gaochanggong` | `5/10/harmony/2/1000/0/15000` | `1890 / 441` | `guard:harmony-mid`；自然 `K-HN2`；主动 `mv_gaochanggong_shoucang→K-HD4`；`reflectBp:0`；`outOfBattleScaleBp:15000` |
| `sk_linrenhexinfa` | `txp_linrenhexinfa` | `5/10/harmony/2/1000/0/15000` | `1890 / 441` | `guard:harmony-mid`；自然 `K-HN2`；无主动护体招；`reflectBp:0`；`outOfBattleScaleBp:15000` |
| `sk_wanjiaxinfa` | `txp_wanjiaxinfa` | `4/10/yang/2/1000/0/15000` | `1700 / 396` | `guard:yang-mid`；自然 `K-AN2`；`mv_wanjiaxinfa_shouqi→K-AD4` 仅防守，不另造护盾；`reflectBp:0`；`outOfBattleScaleBp:15000` |
| `sk_hasakexinfa` | `txp_hasakexinfa` | `4/10/yang/2/1000/0/15000` | `1700 / 396` | `guard:yang-mid`；自然 `K-AN2`；无主动护体招；`reflectBp:0`；`outOfBattleScaleBp:15000` |
| `sk_wangwuxinfa` | `txp_wangwuxinfa` | `3/10/yang/1/1000/0/15000` | `1600 / 372` | `guard:yang-low`；自然 `K-AN2`；`reflectBp:0`；`outOfBattleScaleBp:15000` |
| `sk_xiangxituna` | `txp_xiangxituna` | `3/10/harmony/1/1000/0/15000` | `1680 / 390` | `guard:harmony-low`；自然 `K-HN2`；`reflectBp:0`；`outOfBattleScaleBp:15000` |
| `sk_gaochangtuna` | `txp_gaochangtuna` | `3/10/harmony/1/1000/0/15000` | `1680 / 390` | `guard:harmony-low`；自然 `K-HN2`；`reflectBp:0`；`outOfBattleScaleBp:15000` |
| `sk_renzhetuna` | `txp_renzhetuna` | `3/10/harmony/1/1000/0/15000` | `1680 / 390` | `guard:harmony-low`；自然 `K-HN2`；`reflectBp:0`；`outOfBattleScaleBp:15000` |
| `sk_pingxituna` | `txp_pingxituna` | `2/10/yang/1/1000/0/15000` | `1500 / 348` | `guard:yang-low`；自然 `K-AN2`；`reflectBp:0`；`outOfBattleScaleBp:15000` |
| `sk_hasakehuxi` | `txp_hasakehuxi` | `2/10/yang/1/1000/0/15000` | `1500 / 348` | `guard:yang-low`；自然 `K-AN2`；`reflectBp:0`；`outOfBattleScaleBp:15000` |
| `sk_taiyuehuxi` | `txp_taiyuehuxi` | `2/10/yang/1/1000/0/15000` | `1500 / 348` | `guard:yang-low`；自然 `K-AN2`；`reflectBp:0`；`outOfBattleScaleBp:15000` |

“高 / 中 / 低”只是内容检索档：高=地天、mid=玄、low=黄；实际 `capacity` 仍由 21 §4.8 根据当次 `MeridianProfile` 计算，不能把档名当固定减伤。拳脚 / 兵器 / 暗器 / 内劲外放的适用率仍为 10000 / 2500 / 0 / 4000 bp，且 1 内力抵 2 伤害；本册没有既有反震语义，所以全部 `reflectBp:0`。护盾先结、护体内劲次之、既有 `mpGuard` 再后；点穴 / 擒拿效果仍在伤害后处理。

### 16A.5 数据化与验收

- 路线构建：`moveRef` 必须命中本册既有 `mv_*`；`ultimate` 相等；步骤 1–18、穴位不重复、数组等长；`segmentCt∈[40,120]`、`riskBp∈[0,1200]`。
- 路线覆盖：天 / 地 75/75 逐招；玄 / 黄每个既有招式经模板展开，不允许正式发布仍落到 2 段迁移短路。防守与 movement 路线分别产出 Z4M 与速度投影，不借用 Z5M。
- 独立实例：同模板两个敌人的 `nodes/stateVersion` 不得共享；`preview` 不改状态 / RNG；成功命令才按步骤消费 Core 唯一 `battle` RNG。
- 数值锚点引用 21 §14–§17：同档攻防必须 10000 bp；伤害标准例为 849、TTK 5；速度标准投影 `98/106/6/0`。本图鉴不另建一套黄金值。
- 调息：每档 `ct=1000`、`mpCostBp=0`；9 级点穴禁止自行调息；战斗调息不推进 15 的永久冲穴 / 周天 / 九转。

## 17. 本文新增术语与 ID

### 17.1 武学与套装

| 类别 | 数量 | ID 口径 |
|---|---:|---|
| 武学 `sk_` | 90 个定义 | 天 2、地 14、玄 37、黄 37；完整清单即 §2–§13 的标题与黄阶表首列 |
| 招式 `mv_` | 186 个 | 天/地完整卡 75 个；玄阶 111 个（每门 3 招）；全部按所属武学前缀命名 |
| 被动 `ps_` | 124 个 | 天/地完整卡 50 个；玄阶 74 个（每门 2 个）；全部按所属武学前缀命名 |
| 招式路线 `mfr_` | 75 个高阶逐项登记 + 9 个玄上绝招逐项登记 + 其余玄阶模板展开 | 高阶见 §16A.2；玄上绝招见 §16A.3，均复用既有同名 `mfr_*` 逻辑 ID 并从模板改为显式路线；其余玄阶从既有 `mv_*` 稳定派生；黄阶仅引用模板 |
| 调息档案 `txp_` | 16 个 | 与 §16A.4 的本册内功一一对应；前缀已由 Canon v1.3 §12 登记 |
| 套装候选 `set_` | 22 个 | 见 §14；其中 `legacy-set:chenjinnan`、`legacy-set:haidafu` 暂作一件式传承标签 |
| 新 Buff | 0 个 | 全文只引用 `design/06` 已有 ID |

跨文档只引用、不计为本文定义：`sk_shenxing`（`skills-xiake-bixue`），`sk_yanzisanchaoshui`、`sk_dengpingdushui`、`sk_caoshangfei`（`skills-general`），`sk_taizuchangquan`（`design/05` §13.5）。`sk_babuganchan` 只保留 C12 标准 ID，`design/08` 仅给待收录建议，当前不计正式库存。装备只引用 `eq_luochaduanchong`、`eq_changchangfengshibei`、`eq_yuanyangdao`，没有在本文新定义装备。

### 17.2 经脉引用

| ID | 本文使用者 | 状态 |
|---|---|---|
| `mer_renmai` | 神照经、梅门心法、林任合心诀 | 正式 ID；具体效应见 `design/15` |
| `mer_dumai` | 神照经、神龙心法、万家心法、草原心法 | 正式 ID；具体效应见 `design/15` |
| `mer_yangwei` | 神龙心法 | 正式 ID；同上 |
| `mer_yinwei` | 血刀经 | 正式 ID；同上 |
| `mer_chongmai` | 血刀经、血刀心法 | 正式 ID；同上 |
| `mer_daimai` | 高昌劲、林任合心诀 | 正式 ID；同上 |

### 17.3 术语

| 术语 | 含义 |
|---|---|
| 高昌遗脉 | `design/17` 已定的玩法组织标签，不是原著正式门派，也不是真实历史武术流派 |
| 单人可用合击武学 | 基础招式无需搭档；满足条件后另启组合技奖励，如 `sk_fuqidaofa` |
| 一件式传承标签 | 为未来角色/装备关联保留的 `setTags`，成员不足 2 时不得触发套装奖励 |

---

### 正式套装反向标签镜像（全局审计）

下表仅镜像 `design/07` §8.4 的正式成员关系，供构建与 lint 读取；不是第二份武学定义。历史候选只以 `legacy-set:<slug>` 保留，不得写入运行态 `setTags`。

| 武学 ID | setTags |
|---|---|
| `sk_caoshangfei` | `set_jianghu_baijia` |
| `sk_dengpingdushui` | `set_jianghu_baijia` |
| `sk_fuqidaofa` | `set_yuanyangdao_renzhe` |
| `sk_meinianshengxinfa` | `set_shenzhao_liancheng` |
| `sk_renzhetuna` | `set_yuanyangdao_renzhe` |
| `sk_shenlongrumenquan` | `set_shenlong_jiaozhu` |
| `sk_shenlongshebu` | `set_shenlong_jiaozhu` |
| `sk_shenlongzhang` | `set_shenlong_jiaozhu` |
| `sk_taizuchangquan` | `set_jianghu_baijia`、`set_qidan_xiaofeng` |
| `sk_xiangxituna` | `set_shenzhao_liancheng` |
| `sk_yanzisanchaoshui` | `set_jianghu_baijia` |
| `sk_yuanyangjibenjian` | `set_yuanyangdao_renzhe` |
| `sk_yuanyangshuangdao` | `set_yuanyangdao_renzhe` |
| `sk_yuzhongduandao` | `set_shenzhao_liancheng` |
| `sk_yuzhongduanquan` | `set_shenzhao_liancheng` |
| `sk_yuzhongqinna` | `set_shenzhao_liancheng` |

## 18. 数据校验规则与测试用例

### 18.1 构建校验

| 编号 | 校验 | 通过条件 | 失败示例 |
|---|---|---|---|
| KX-V01 | 唯一 ID | 本文 90 个 `sk_*` 定义互不重复，且每个 `mv_*` / `ps_*` 在仓库唯一 | 同一招式 ID 被两门武学复用 |
| KX-V02 | 天级闭集 | `grade>=10` 的定义集合恰为 `{sk_ningxue,sk_shenzhao}`，ID、品阶、原生书界匹配基准 §13 | 新增第三门天级或把神照经改为天中 |
| KX-V03 | 数量配额 | 四元组恰为 `2/14/37/37`；逐书界恰为 `30/22/18/20` | 把引用轻功重复计进 90 |
| KX-V04 | 内功性质 | `category:inner` 时 `nature∈{yin,yang,harmony}`，不得 `neutral` | 黄阶吐纳漏写 nature |
| KX-V05 | 内功预算 | 每门 `IP` 在品阶目标 ±5%，且 `mpMaxPct`、`hpMaxPct`、`Σattrs`、`mpRegen` 各自相对该品阶标准值不超过 ±30%；`stats` 合计不越黄/玄/地/天 6/10/15/20 | 玄中 IP 合格但某一贡献项低于标准值 70% |
| KX-V06 | 外功成长 | 外功第 10 重 `layerStats` 合计不越黄/玄/地/天 6/10/15/20 | 玄阶 `{hit:6,parry:6}` 合计 12 |
| KX-V07 | 前置可达 | `prereq` 不自环；`anyOf` 至少两项；正式组织均存在黄→玄→地路径 | 神龙心法引用不存在的前置 |
| KX-V08 | 技艺字段 | 只允许 C17 的十项技艺 ID；本文诗文判定用 `art`、机关与阵法用 `formation` | 另造未注册的技艺键 |
| KX-V09 | Buff 外键 | 全部正文 `bf_*` 都存在于 `design/06` 或 rulings A5 | 自建未裁定的同义 Buff |
| KX-V10 | 弓、双持与互搏 | 弓为 `hidden/hidden` 并使用 `apHidden`；双刀检查 `weaponReq.dual:true`；本文不写左右互搏 `dualWield` | 把弓算兵器、用装备件数改写 `dualWield` |
| KX-V11 | 套装双向 | `skill∈members ⇔ setId∈skill.setTags`；装备未反向登记前不得进成员 | 套装表列一门、该门卡中无 tag |
| KX-V12 | 轻功封顶 | 鹿鼎/连城/白马/鸳鸯最高原生分别为 10/7/7/6 | 鸳鸯新建地阶轻功 |
| KX-V13 | 地阶稀有机制 | 代价/誓约 ≤5%，强制多人合击 ≤3%；本文件两者均为 0/14 | 把夫妻刀改成无搭档不可施放 |
| KX-V14 | 原著标注 | `expanded` 必须出现“原创扩展”；不确定招名/人物关系出现“待考” | 把游戏命名写成原著原句 |
| KX-V15 | 禁止敌专计数 | `enemyOnly:true` 条目另表、不进入 90；当前为 0 | 把洪安通 Boss 专招计入玩家武学 |
| KX-V16 | 玄阶招式与被动 | 每张玄阶卡恰有 3 个 `mv_*`、2 个 `ps_*`，前缀匹配所属武学；核算样本不少于全部玄阶招式 30% | 只写一招或把自然语言被动留待实现 |
| KX-V17 | 完整卡数量与绝招 | 总招式 / 被动仍满足 05 的卡片容量；绝招为天下 2、地上 2、地中按统一裁定表取 1 或 2、地下 1、玄上 1 | 某门绝招数偏离统一裁定表，或玄上无绝招 |
| KX-V18 | 低武可习得池比例 | 汇总所有本土复现后，逐书界天 0%–5%、地 8%–12%、玄 33%–38%、黄 48%–55%；本文首现子集只报缺口、不误判通过 | 只用本文配额宣称最终池达标 |
| KX-V19 | 经脉路线 | 高阶 75/75 逐招唯一挂接；9 条玄上绝招显式挂接；模板展开后 `moveRef` 存在、`ultimate` 相等、用途唯一，且满足 21 MF-V01–V05 | 一招同时挂攻路与位移路，或收招加路线 CT 超过 2000 |
| KX-V20 | 调息与护体 | 16 门内功各有唯一 `txp_*`；档案范围满足 21 MF-V09，护体适用率与结算顺序不在图鉴另写变体 | 用检索档名代替按实例计算的 `capacity` |
| KX-V21 | 实例隔离 | 每个独立行动单位各有一个 `MeridianFlowModule`；只共享静态路线，不共享节点状态 / RNG | 两个同模板敌人共用 `nodes` |
| KX-V22 | 外放静态契约 | §15.3 两条 `projected` 均有 `projection:true`、0 档 `range/aoe`、三项且 `[0]` 深等于 `aoe` 的 `projectionSpreadSteps`、所有伤害段 `DamageKind:'projected'` 与唯一 attack 路线 | 把弓箭的 `delivery:projectile` 推断成外放，或在静态数据写当前档／扩大后射程 |
| KX-V23 | 外放路线与覆盖 | 两条外放路线均以劳宫为掌端并命中 13 穴白名单；§15.3 审计表按 `moveId` 严格排序，结论计数为 2，天／地／玄／黄为 0／2／0／0 | 外放路线无合法端点，或漏审实体箭／针／火器反例 |

### 18.2 最小测试向量

| 用例 | 输入 | 预期 |
|---|---|---|
| T-KX-01 天级闭集 | 扫描 §2–§13 的品阶 | 仅 `sk_ningxue=10`、`sk_shenzhao=10` |
| T-KX-02 配额 | 按标题与黄阶表去重计数 | 天/地/玄/黄=`2/14/37/37`，总计 90 |
| T-KX-03 神照 IP | `42+25+2×18+5×3` | 118，命中天下预算 |
| T-KX-04 血刀经 IP | `31+20+2×14+5×3.1` | 94.5，命中地上预算 |
| T-KX-05 玄阶抽样 | 统计 37 张玄阶卡的代表式与闭合索引 | 37/111=`33.3%` ≥30%；每门 3 招、2 被动 |
| T-KX-06 夫妻刀单人 | 单角色装配 `sk_fuqidaofa`，无合击搭档 | 四个普通招式与一记绝招均可用；`cmb_fuqidao` 不建立；招架补偿生效 |
| T-KX-07 夫妻刀合击 | 双方该武学 ≥4、羁绊 3、距离 2 | 按 09 建立三轮“刀意相连”；羁绊 3 时保留拌嘴判定 |
| T-KX-08 双刀持用 | `sk_yuanyangshuangdao.weaponReq.dual=true`，主手装备 `hands:pair` 的鸳鸯刀 | 武学可用；不写入或改动左右互搏 `dualWield` |
| T-KX-09 弓栏位 | 装备 `sk_hasakeqishe` 或 `sk_manchuqishe` | 占暗器栏，兵器三格不变 |
| T-KX-10 套装闭合 | 抽取全文所有 `set_*` 与 §14 成员表互查 | 无单向成员；两个装备候选在 10 同步前不计 |
| T-KX-11 白马装配 | 空携带角色只取白马本土武学 | 可得内功 4、拳脚 3、同类剑 5 |
| T-KX-12 鸳鸯轻功封顶 | 枚举 `ch11_yuanyang` 原生轻功 | 最大品阶为 `sk_dengpingdushui=6` |
| T-KX-13 神照锁血 | 满血单位持神照护命，遭普通致死伤害 | `bf_suoxue` 挡至 1 HP、施加重创且移除；同战不可再次触发 |
| T-KX-14 火器边界 | `sk_luochahuoqi` 未装备 `eq_luochaduanchong` | 火器招式不可用；装备后仍受每战 2 发与装填规则 |
| T-KX-15 高阶路线闭合 | 扫描 §16A.2–§16A.3 的 `moveRef/mfr/ultimate/purpose` | 75 个高阶 `mv_*` 各出现一次；9 个玄上绝招显式登记；绝招总数按天下 / 地 / 玄上为 4 / 20 / 9 |
| T-KX-16 路线 CT 上界 | 普通最大 `1100+360`；玄上绝招 `1200+600`；地绝招 `1200+720`；天绝招 `1200+800` | 分别为 1460 / 1800 / 1920 / 2000，全部不超过 2000 |
| T-KX-17 调息档案 | 扫描 §16A.4 的 16 门内功 | 16 个唯一 `txp_*`；`ct=1000`、`mpCostBp=0`；9 级点穴禁止自调息 |
| T-KX-18 同模板双敌 | 两个同模板敌人初始化后，仅令 A 走一段 | A 状态与 RNG 前进；B 的节点、版本均不变 |
| T-KX-19 外放基础档 | 标准档分别加载神龙吐息、隔衣传劲 | 射程分别为 1–4、1–3，范围均 `aoe_single`；只在运行时按 `design/21` 取得 +0/+2/+4 射程 |
| T-KX-20 实体投射反例 | 扫描哈萨克／满洲骑射、美人三招飞燕回翔与罗刹火器 | 均保持 `not_projected`，不因远程、投射或范围模板误挂外放字段 |

---

## 19. 待决事项 / 依赖

### 19.1 替下游给出的建议值

| # | 下游 | 建议值 | 当前默认 |
|---|---|---|---|
| D-01 | `design/07` | §14 的 22 个套装候选与成员；奖励按已计件成员 `effGrade` 中位数向下取整 | 只登记成员，不在本文先定奖励 |
| D-02 | `design/15` | **已解决**：正式 ID 为 `mer_renmai/dumai/yangwei/yinwei/chongmai/daimai`（见 `design/15` §2–§3、§11.4） | 本文已改用正式 ID；旧 `mer_du/chong/dai` 不再新增 |
| D-03 | `chapters/08–11` | 学习事件、师承人物、秘籍和残页的正式任务 ID | `q_08_faction_02`、`npc_chenjinnan`、`it_ningxue_miji`、`it_shenzhao_yuwen`、`it_canye_xuedaojing` 仅为语义占位；下游落表时须全仓查重并定号，不视为本文新建任务、人物或物品 ID |
| D-04 | `design/10` | 为 `eq_changchangfengshibei` 补 `exotic/misc` 武学兼容桥接，并为该装备及 `eq_yuanyangdao` 补套装反向 tag | 石碑现为副手牌，桥接未登记前不可满足 `sk_taiyueshibeishou.weaponReq`；两件装备在反向 tag 未登记前不计套装件 |
| D-05 | `design/05` 与其余 catalog | 汇总四书全部本土复现并按 §16.6 补足低武可习得池比例 | 在全局清单落地前，以 §16.6 最小池作为缺口下界，不宣称最终比例已达标 |
| D-06 | `design/05` / `design/10` | 为 `hidden/hidden` 武学补正式的 `HiddenKind` 介质约束字段或统一判定路径 | 本文 `sk_hasakeqishe`、`sk_manchuqishe` 只声明使用 `HiddenKind:bow`，不把仅属 `exotic` 的 `weaponReq.kinds` 误用于暗器 |
| D-07 | `design/05` / Canon §12 | **已解决**：Canon v1.3 §12 已登记 `mfr_*` / `txp_*`；图鉴按 `design/21` 接入 `meridianRouteRef`、`breathProfileRef` | 本文使用正式前缀，不借用地图 `route_*` 或 Buff `bf_*` |

### 19.2 本文依赖的上游事实

- 天级名录、武学 ID、品阶与原生书界依赖基准 §13；本文没有修改闭集。
- 字段、招式预算、内功 IP、装配栏和 catalog 约束依赖 `design/05`；Buff 效果与时序依赖 `design/06`。
- `sect_*`、时代开放和五级称谓依赖 `design/17`；高昌遗脉是玩法组织标签，不反推原著或历史存在同名门派。
- 轻功品阶与本土来源依赖 `design/08`；夫妻刀组合技依赖 `design/09` §6.7.4 D；罗刹短铳与鸳鸯刀装备效果依赖 `design/10`。
- 经脉动态运行、独立乘区、路线、护体、速度、调息与每单位实例依赖 `design/21`；穴位拓扑与永久成长继续依赖 `design/15`。

### 19.3 对基准的修改提案

| 编号 | 提案 | 理由 |
|---|---|---|
| KX-P01 | 在基准或 05 的图鉴规模说明中明确：AR-01 点名的低天级数回退组，即使实际分到 2 门天级，仍按旧目标 ×1.5，而非套用“0–1 门”字面条件 | `kangxi` 同时被明确点名且拥有 2 门天级，现有句式有歧义；本文默认 90 门 |
| KX-P02 | 在 05 的合击统计口径补充“本体可单人施展、多人仅追加可选组合技”的武学不计强制多人合击 | 夫妻刀法必须保留合击主题，又不能让单人角色失去地阶招式 |
| KX-P03 | Canon §12 接纳 21 §16.2 的 `mfr_* / qnl_* / dxl_* / txp_*`，并在 §8 / §9 / §11 / §18 / §19 接纳独立乘区、护体资源守恒、经脉速度与确定性边界 | 当前内容已有稳定引用，但 Canon v1.2 与 lint 仍无法完整验证 AR-14 |

### 19.4 原著考据待办

| # | 需核对的书与人物/情节 | 本文保守处理 |
|---|---|---|
| K-01 | 《鹿鼎记》凝血神爪、化骨绵掌的传授与中招描写 | 不写引文和回目；招名均标原创扩展命名 |
| K-02 | 洪安通/苏荃与英雄三招、美人三招的创者、招名字形、韦小宝所学深浅 | 完整卡统一标待考，不延伸新原著事实 |
| K-03 | 王屋派司徒伯雷、曾柔的门派关系与交手；沐王府武备 | 只保留人物/组织锚，套路均标原创 |
| K-04 | 布库房摔跤、清宫弓马与海大富武学细节 | 制度和动作不作确定引文 |
| K-05 | 《连城诀》神照经疗伤/护命、血刀经是否兼含刀谱、雪谷动作次序 | 复用 06 已指定的 `bf_suoxue`；刀招不冒充原著招名 |
| K-06 | 唐诗剑谱的具体诗句和剑招映射 | 不录任何未核实诗句；任务读取 `skills.art` 与证据状态 |
| K-07 | 南四奇成员与“落花流水”称谓、武功及雪谷协作 | 只用并称作 lineage，合守剑为原创 |
| K-08 | 《白马啸西风》吕梁三杰姓名/兵刃、华辉身份关系与剑术、哈萨克人物射术 | 所有具体套路均标待考或原创；民族背景不当作武谱 |
| K-09 | 《鸳鸯刀》林玉龙/任飞燕、袁冠南/萧中慧的传授与双刀合使细节 | 合击运行引用 09，性别不作条件 |
| K-10 | 太岳四侠登场、自报名号次序、常长风石碑；威信镖局人员与兵刃 | 八步赶蟾只引用已裁定 ID；其余均保守标注 |

### 19.5 开放问题（附默认值）

| # | 问题 | 本文默认值 | 影响 |
|---|---|---|---|
| O-01 | AR-01 回退组与“0–1 天级”字面冲突如何解释？ | 采用点名优先，90 门 | 若改按两天级常规比例，总数和四书配额须整体重排 |
| O-02 | 一件式 `legacy-set:chenjinnan`、`legacy-set:haidafu` 是否保留？ | 保留为不触发奖励的传承标签 | 07 可在无装备/角色件时删去 |
| O-03 | 高昌守护剑是否应保留地上顶点？ | 保留，明确全原创且不称历史流派 | 若降阶，白马两门地阶与 AR-01 配额需另补 |
| O-04 | 罗刹火器术是否作为独立武学？ | 保留黄上，装备仍是实际伤害与弹药唯一来源 | 若改成纯装备熟练项，鹿鼎需补 1 门黄阶 |
| O-05 | 夫妻刀组合技的“夫/妻”显示文案是否改为“双侠甲/乙”？ | 运行规则仍按 09，UI 可显示甲/乙，性别不设门槛 | 只影响本地化和角色槽位文案 |
| O-06 | 八步赶蟾是否纳入正式武学库存？ | 默认不纳入、生产禁用；保留 `sk_babuganchan` 作为 C12 已定名的待收录接口 | 若采用，须在 90 门本组配额或全局 1,138 门内指定替换项；不得直接增量补卡 |
| O-07 | 护体“高 / 中 / 低”是否要成为正式数据字段？ | 默认不新增字段；由 `grade/nature` 派生，仅作检索文案 | 若 05 另立枚举，三册需统一迁移，不能把它当固定减伤 |
| O-08 | 地中武学应取 1 还是 2 记绝招？ | **已解决：按统一裁定表逐门取 1 或 2**；英雄三招、美人三招、夫妻刀法各取 1，其余本册地中取 2 | 见 `decisions/ultimate-counts-tianzhong-dizhong.md` §3 |

已有待决追溯：图鉴规模问题已按 AR-01 暂解（见 §0.1、O-01）；弓箭分类已按 C16 解决（见 §0.2）；技艺与 OR 前置已按 C17 解决（见 §0.2、完整卡）；套装双向登记已按 C22 解决到本文范围（见 §14）；Buff 缺口已按 C23 目录核对，本文新增 0 个。
