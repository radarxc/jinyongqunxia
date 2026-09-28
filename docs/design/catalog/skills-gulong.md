# 门派武学图鉴 · 古龙门派武学（`skills-gulong`）

> **归属（基准 §18）**：`design/catalog/skills-*.md` 门派武学图鉴之一。本文定义 `design/17` §11 选定的十五个古龙组织之可学武学；门派历史、驻地、时代开放与正式职级称谓仍唯一归 `design/17`。
> **上游**：`decisions/author-decisions.md`（G1 / P33）、`00-canon.md`（§3–§7、§9、§12–§13、§16、§18、§20）、`decisions/author-requirements.md` AR-01–AR-03、AR-07–AR-08、AR-12、AR-14、AR-16、`decisions/rulings-v1.md` C14、C16–C17、C22–C23、`design/17` §1.11–§1.14、§3.4、§11、`design/21` v2.0。
> **引用而不重定义**：字段、层数、招式预算、内功贡献与学习规则见 `design/05`；战斗经脉运行、路线、护体内劲、速度修正与调息见 `design/21`；经脉、穴位、冲穴、周天与九转见 `design/15`；Buff 本体见 `design/06`；六角范围与阵法流程见 `design/09`；机关、毒物、兵器与弹药见 `design/10`；套装规则与最终数值见 `design/07`。
> **标注约定**：**（原创扩展）** = 原著没有的武学、招名或投放；**（原创扩展命名）** = 原著有其人、兵器或行为而无可确认武学名；**（待考）** = 须以正式出版的古龙作品逐字核对。本文不编造引文与回目号。
> **版本**：C1g 初稿；审校 C1g.R（2026-09-26）；全局审计（2026-09-27）；经脉系统落地（2026-09-27）；绝招数量调整（2026-09-27）；图鉴一致性审计（2026-09-28）；天中 / 地中绝招数统一（2026-09-28）；外放标记（2026-09-28）。

---

## 0. 阅读指引与统一记法
### 绝招显式路线索引（镜像正文卡，非覆写层；2026-09-28）

本索引镜像正文卡，非覆写层；与正文不一致即为错误，并以正文为准。每记绝招使用独立稳定路线与显式穴位序列。

<!-- skill-catalog-audit:start -->
| 品阶 | 武学 | MoveDef（正文卡镜像） | 路线 ID | steps（acupointRef/segmentCt/riskBp） |
|---|---|---|---|---|
| 9 地上 | `sk_mingyugong` | `mv_mingyugong_huiliu` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_mingyugong_huiliu}` | `mfr_mingyugong_huiliu` | `MeridianRouteDef{moveRef:mv_mingyugong_huiliu; ultimate:true; purpose:defense}`；`ap_zujueyin_xiguan/90/100→ap_zushaoyin_lingxu/90/120→ap_zutaiyin_dabao/90/140→ap_zutaiyin_yinbai/90/160→ap_renmai_qugu/90/180→ap_shoujueyin_daling/90/200→ap_shoujueyin_ximen/90/220→ap_shoushaoyin_shaohai/90/240` |
| 9 地上 | `sk_mingyugong` | `mv_mingyugong_zhaoye` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_mingyugong_zhaoye}` | `mfr_mingyugong_zhaoye` | `MeridianRouteDef{moveRef:mv_mingyugong_zhaoye; ultimate:true; purpose:defense}`；`ap_shoujueyin_zhongchong/90/100→ap_shoushaoyin_shenmen/90/120→ap_shoutaiyin_tianfu/90/140→ap_yinqiao_lieque/90/160→ap_yinwei_lianquan/90/180→ap_zujueyin_taichong/90/200→ap_zushaoyin_fuliu/90/220→ap_zushaoyin_yongquan/90/240` |
| 9 地上 | `sk_jiayishengong` | `mv_jiayishengong_chongzhen` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_jiayishengong_chongzhen}` | `mfr_jiayishengong_chongzhen` | `MeridianRouteDef{moveRef:mv_jiayishengong_chongzhen; ultimate:true; purpose:defense}`；`ap_yangwei_jinmen/90/100→ap_zushaoyang_riyue/90/120→ap_zutaiyang_chengshan/90/140→ap_zutaiyang_xinshu/90/160→ap_zuyangming_renying/90/180→ap_dumai_mingmen/90/200→ap_dumai_yinjiao/90/220→ap_shoushaoyang_yemen/90/240` |
| 9 地上 | `sk_jiayishengong` | `mv_jiayishengong_liehuo` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_jiayishengong_liehuo}` | `mfr_jiayishengong_liehuo` | `MeridianRouteDef{moveRef:mv_jiayishengong_liehuo; ultimate:true; purpose:defense}`；`ap_yangwei_benshen/90/100→ap_yangwei_yangjiao/90/120→ap_zushaoyang_yangbai/90/140→ap_zutaiyang_shenshu/90/160→ap_zuyangming_jiache/90/180→ap_dumai_baihui/90/200→ap_dumai_shuigou/90/220→ap_shoushaoyang_tianjing/90/240` |
| 9 地上 | `sk_shenshuineigong` | `mv_shenshuineigong_huilan` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_shenshuineigong_huilan}` | `mfr_shenshuineigong_huilan` | `MeridianRouteDef{moveRef:mv_shenshuineigong_huilan; ultimate:true; purpose:defense}`；`ap_renmai_shenque/90/100→ap_shoujueyin_jianshi/90/120→ap_shoujueyin_zhongchong/90/140→ap_shoushaoyin_shenmen/90/160→ap_shoutaiyin_tianfu/90/180→ap_yinqiao_lieque/90/200→ap_yinwei_lianquan/90/220→ap_zujueyin_taichong/90/240` |
| 9 地上 | `sk_shenshuineigong` | `mv_shenshuineigong_zhongchao` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_shenshuineigong_zhongchao}` | `mfr_shenshuineigong_zhongchao` | `MeridianRouteDef{moveRef:mv_shenshuineigong_zhongchao; ultimate:true; purpose:defense}`；`ap_yinqiao_jiaoxin/90/100→ap_yinwei_fuai/90/120→ap_zujueyin_ligou/90/140→ap_zujueyin_zhongfeng/90/160→ap_zushaoyin_taixi/90/180→ap_zutaiyin_shangqiu/90/200→ap_renmai_guanyuan/90/220→ap_renmai_yinjiao/90/240` |
| 7 地下 | `sk_qinglongcisha` | `mv_qinglongcisha_yici` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_qinglongcisha_yici}` | `mfr_qinglongcisha_yici` | `MeridianRouteDef{moveRef:mv_qinglongcisha_yici; ultimate:true; purpose:attack}`；`ap_renmai_chengjiang/90/100→ap_renmai_shimen/90/120→ap_shoujueyin_laogong/90/140→ap_shoushaoyin_jiquan/90/160→ap_shoushaoyin_tongli/90/180→ap_shoutaiyin_xiabai/90/200→ap_yinqiao_lougu/90/220→ap_yinwei_qimen/90/240` |
| 8 地中 | `sk_tangmenanshou` | `mv_tangmenanshou_baoyu` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_tangmenanshou_baoyu}` | `mfr_tangmenanshou_baoyu` | `MeridianRouteDef{moveRef:mv_tangmenanshou_baoyu; ultimate:true; purpose:attack}`；`ap_shoujueyin_tianquan/90/100→ap_shoushaoyin_shaofu/90/120→ap_shoutaiyin_shaoshang/90/140→ap_yinqiao_jiaoxin/90/160→ap_yinwei_fuai/90/180→ap_zujueyin_ligou/90/200→ap_zujueyin_zhongfeng/90/220→ap_zushaoyin_taixi/90/240` |
| 9 地上 | `sk_kongquelingfa` | `mv_kongquelingfa_shouping` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_kongquelingfa_shouping}` | `mfr_kongquelingfa_shouping` | `MeridianRouteDef{moveRef:mv_kongquelingfa_shouping; ultimate:true; purpose:defense}`；`ap_shoushaoyang_yifeng/90/100→ap_shoutaiyang_tinggong/90/120→ap_shouyangming_pianli/90/140→ap_yangqiao_dicang/90/160→ap_yangqiao_pucan/90/180→ap_yangwei_toulinqi/90/200→ap_zushaoyang_waiqiu/90/220→ap_zutaiyang_feishu/90/240` |
| 9 地上 | `sk_kongquelingfa` | `mv_kongquelingfa_kaiping` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_kongquelingfa_kaiping}` | `mfr_kongquelingfa_kaiping` | `MeridianRouteDef{moveRef:mv_kongquelingfa_kaiping; ultimate:true; purpose:defense}`；`ap_yangwei_yamen/90/100→ap_zushaoyang_xuanzhong/90/120→ap_zutaiyang_kunlun/90/140→ap_zuyangming_fenglong/90/160→ap_zuyangming_zusanli/90/180→ap_dumai_shenzhu/90/200→ap_shoushaoyang_sizhukong/90/220→ap_shoushaoyang_zhongzhu/90/240` |
| 9 地上 | `sk_longfengshuanghuan` | `mv_longfengshuanghuan_huihuan` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_longfengshuanghuan_huihuan}` | `mfr_longfengshuanghuan_huihuan` | `MeridianRouteDef{moveRef:mv_longfengshuanghuan_huihuan; ultimate:true; purpose:attack}`；`ap_dumai_shuigou/90/100→ap_shoushaoyang_tianjing/90/120→ap_shoutaiyang_houxi/90/140→ap_shoutaiyang_yanggu/90/160→ap_shouyangming_shangyang/90/180→ap_yangqiao_jugu/90/200→ap_yangwei_fengfu/90/220→ap_zushaoyang_fengshi/90/240` |
| 9 地上 | `sk_longfengshuanghuan` | `mv_longfengshuanghuan_jueyu` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_longfengshuanghuan_jueyu}` | `mfr_longfengshuanghuan_jueyu` | `MeridianRouteDef{moveRef:mv_longfengshuanghuan_jueyu; ultimate:true; purpose:attack}`；`ap_yangwei_jianjing/90/100→ap_zushaoyang_guangming/90/120→ap_zushaoyang_zuqiaoyin/90/140→ap_zutaiyang_weizhong/90/160→ap_zuyangming_lidui/90/180→ap_dumai_jizhong/90/200→ap_dumai_yaoyangguan/90/220→ap_shoushaoyang_yangchi/90/240` |
| 9 地上 | `sk_shenjianwuwang` | `mv_shenjianwuwang_fanzhao` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_shenjianwuwang_fanzhao}` | `mfr_shenjianwuwang_fanzhao` | `MeridianRouteDef{moveRef:mv_shenjianwuwang_fanzhao; ultimate:true; purpose:attack}`；`ap_dumai_shenzhu/90/100→ap_shoushaoyang_sizhukong/90/120→ap_shoushaoyang_zhongzhu/90/140→ap_shoutaiyang_xiaohai/90/160→ap_shouyangming_sanjian/90/180→ap_yangqiao_jianyu/90/200→ap_yangwei_benshen/90/220→ap_yangwei_yangjiao/90/240` |
| 9 地上 | `sk_shenjianwuwang` | `mv_shenjianwuwang_yijian` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_shenjianwuwang_yijian}` | `mfr_shenjianwuwang_yijian` | `MeridianRouteDef{moveRef:mv_shenjianwuwang_yijian; ultimate:true; purpose:attack}`；`ap_shoushaoyang_yifeng/90/100→ap_shoutaiyang_tinggong/90/120→ap_shouyangming_pianli/90/140→ap_yangqiao_dicang/90/160→ap_yangqiao_pucan/90/180→ap_yangwei_toulinqi/90/200→ap_zushaoyang_waiqiu/90/220→ap_zutaiyang_feishu/90/240` |
| 9 地上 | `sk_ximenjiandao` | `mv_ximenjiandao_yingxue` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_ximenjiandao_yingxue}` | `mfr_ximenjiandao_yingxue` | `MeridianRouteDef{moveRef:mv_ximenjiandao_yingxue; ultimate:true; purpose:attack}`；`ap_zutaiyin_yinlingquan/90/100→ap_renmai_shenque/90/120→ap_shoujueyin_jianshi/90/140→ap_shoujueyin_zhongchong/90/160→ap_shoushaoyin_shenmen/90/180→ap_shoutaiyin_tianfu/90/200→ap_yinqiao_lieque/90/220→ap_yinwei_lianquan/90/240` |
| 9 地上 | `sk_ximenjiandao` | `mv_ximenjiandao_xilai` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_ximenjiandao_xilai}` | `mfr_ximenjiandao_xilai` | `MeridianRouteDef{moveRef:mv_ximenjiandao_xilai; ultimate:true; purpose:attack}`；`ap_zushaoyin_lingxu/90/100→ap_zutaiyin_dabao/90/120→ap_zutaiyin_yinbai/90/140→ap_renmai_qugu/90/160→ap_shoujueyin_daling/90/180→ap_shoujueyin_ximen/90/200→ap_shoushaoyin_shaohai/90/220→ap_shoutaiyin_taiyuan/90/240` |
| 9 地上 | `sk_tianwaifeixian` | `mv_tianwaifeixian_yunwai` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_tianwaifeixian_yunwai}` | `mfr_tianwaifeixian_yunwai` | `MeridianRouteDef{moveRef:mv_tianwaifeixian_yunwai; ultimate:true; purpose:attack}`；`ap_yangqiao_pucan/90/100→ap_yangwei_toulinqi/90/120→ap_zushaoyang_waiqiu/90/140→ap_zutaiyang_feishu/90/160→ap_zuyangming_chengqi/90/180→ap_zuyangming_tianshu/90/200→ap_dumai_shendao/90/220→ap_shoushaoyang_guanchong/90/240` |
| 9 地上 | `sk_tianwaifeixian` | `mv_tianwaifeixian_tianwai` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_tianwaifeixian_tianwai}` | `mfr_tianwaifeixian_tianwai` | `MeridianRouteDef{moveRef:mv_tianwaifeixian_tianwai; ultimate:true; purpose:attack}`；`ap_shoutaiyang_houxi/90/100→ap_shoutaiyang_yanggu/90/120→ap_shouyangming_shangyang/90/140→ap_yangqiao_jugu/90/160→ap_yangwei_fengfu/90/180→ap_zushaoyang_fengshi/90/200→ap_zushaoyang_yanglingquan/90/220→ap_zutaiyang_tianzhu/90/240` |
| 6 玄上 | `sk_yihuajieyu` | `mv_yihuajieyu_jieli` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_yihuajieyu_jieli}` | `mfr_yihuajieyu_jieli` | `MeridianRouteDef{moveRef:mv_yihuajieyu_jieli; ultimate:true; purpose:defense}`；`ap_zujueyin_xingjian/100/100→ap_zushaoyin_rangu/100/120→ap_zutaiyin_dadu/100/140→ap_zutaiyin_yinlingquan/100/160→ap_renmai_shenque/100/180→ap_shoujueyin_jianshi/100/200` |
| 6 玄上 | `sk_yihuagongqinggong` | `mv_yihuagongqinggong_yibu` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_yihuagongqinggong_yibu}` | `mfr_yihuagongqinggong_yibu` | `MeridianRouteDef{moveRef:mv_yihuagongqinggong_yibu; ultimate:true; purpose:movement}`；`ap_zushaoyin_shuiquan/100/100→ap_zutaiyin_gongsun/100/120→ap_renmai_danzhong/100/140→ap_renmai_shuifen/100/160→ap_shoujueyin_neiguan/100/180→ap_shoushaoyin_lingdao/100/200` |
| 6 玄上 | `sk_wuehezhen` | `mv_wuehezhen_hewei` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_wuehezhen_hewei}` | `mfr_wuehezhen_hewei` | `MeridianRouteDef{moveRef:mv_wuehezhen_hewei; ultimate:true; purpose:attack}`；`ap_chongmai_futonggu/100/100→ap_chongmai_siman/100/120→ap_daimai_wushu/100/140→ap_dumai_shangxing/100/160→ap_dumai_zhiyang/100/180→ap_renmai_qugu/100/200` |
| 6 玄上 | `sk_daqiqiang` | `mv_daqiqiang_chongying` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_daqiqiang_chongying}` | `mfr_daqiqiang_chongying` | `MeridianRouteDef{moveRef:mv_daqiqiang_chongying; ultimate:true; purpose:attack}`；`ap_yangqiao_fuyang/100/100→ap_yangqiao_shenmai/100/120→ap_yangwei_yamen/100/140→ap_zushaoyang_xuanzhong/100/160→ap_zutaiyang_kunlun/100/180→ap_zuyangming_fenglong/100/200` |
| 6 玄上 | `sk_tiexueqigong` | `mv_tiexueqigong_shouqi` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_tiexueqigong_shouqi}` | `mfr_tiexueqigong_shouqi` | `MeridianRouteDef{moveRef:mv_tiexueqigong_shouqi; ultimate:true; purpose:defense}`；`ap_zutaiyin_xuehai/100/100→ap_zuyangming_lidui/100/120→ap_chongmai_futonggu/100/140→ap_chongmai_siman/100/160→ap_daimai_wushu/100/180→ap_dumai_shangxing/100/200` |
| 6 玄上 | `sk_tianyishenshui` | `mv_tianyishenshui_fengxia` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_tianyishenshui_fengxia}` | `mfr_tianyishenshui_fengxia` | `MeridianRouteDef{moveRef:mv_tianyishenshui_fengxia; ultimate:true; purpose:attack}`；`ap_zutaiyin_gongsun/100/100→ap_renmai_danzhong/100/120→ap_renmai_shuifen/100/140→ap_shoujueyin_neiguan/100/160→ap_shoushaoyin_lingdao/100/180→ap_shoushaoyin_yinxi/100/200` |
| 6 玄上 | `sk_wuzhengxinfa` | `mv_wuzhengxinfa_huzhuang` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_wuzhengxinfa_huzhuang}` | `mfr_wuzhengxinfa_huzhuang` | `MeridianRouteDef{moveRef:mv_wuzhengxinfa_huzhuang; ultimate:true; purpose:defense}`；`ap_shoujueyin_tianchi/100/100→ap_shoushaoyang_waiguan/100/120→ap_shoushaoyin_lingdao/100/140→ap_shoushaoyin_yinxi/100/160→ap_shoutaiyang_xiaohai/100/180→ap_shoutaiyin_tianfu/100/200` |
| 6 玄上 | `sk_tingfengbianwei` | `mv_tingfengbianwei_xunsheng` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_tingfengbianwei_xunsheng}` | `mfr_tingfengbianwei_xunsheng` | `MeridianRouteDef{moveRef:mv_tingfengbianwei_xunsheng; ultimate:true; purpose:attack}`；`ap_zushaoyin_dazhong/100/100→ap_zushaoyin_yingu/100/120→ap_zutaiyang_tianzhu/100/140→ap_zutaiyin_gongsun/100/160→ap_zuyangming_fenglong/100/180→ap_zuyangming_zusanli/100/200` |
| 6 玄上 | `sk_bianfushenfa` | `mv_bianfushenfa_anxiang` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_bianfushenfa_anxiang}` | `mfr_bianfushenfa_anxiang` | `MeridianRouteDef{moveRef:mv_bianfushenfa_anxiang; ultimate:true; purpose:movement}`；`ap_shoushaoyin_tongli/100/100→ap_shoutaiyin_xiabai/100/120→ap_yinqiao_lougu/100/140→ap_yinwei_qimen/100/160→ap_zujueyin_xiguan/100/180→ap_zushaoyin_lingxu/100/200` |
| 6 玄上 | `sk_sishierduanzhen` | `mv_sishierduanzhen_xiaduan` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_sishierduanzhen_xiaduan}` | `mfr_sishierduanzhen_xiaduan` | `MeridianRouteDef{moveRef:mv_sishierduanzhen_xiaduan; ultimate:true; purpose:attack}`；`ap_dumai_shangxing/100/100→ap_dumai_zhiyang/100/120→ap_renmai_qugu/100/140→ap_shoujueyin_daling/100/160→ap_shoujueyin_ximen/100/180→ap_shoushaoyang_yemen/100/200` |
| 6 玄上 | `sk_qinglongneifa` | `mv_qinglongneifa_huxin` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_qinglongneifa_huxin}` | `mfr_qinglongneifa_huxin` | `MeridianRouteDef{moveRef:mv_qinglongneifa_huxin; ultimate:true; purpose:defense}`；`ap_yangqiao_juliao_wei/100/100→ap_yangwei_jinmen/100/120→ap_yinqiao_lieque/100/140→ap_yinwei_lianquan/100/160→ap_zujueyin_ququan/100/180→ap_zushaoyang_fengshi/100/200` |
| 6 玄上 | `sk_qiankunmishou` | `mv_qiankunmishou_zarou` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_qiankunmishou_zarou}` | `mfr_qiankunmishou_zarou` | `MeridianRouteDef{moveRef:mv_qiankunmishou_zarou; ultimate:true; purpose:attack}`；`ap_yinwei_daheng/100/100→ap_yongquan/100/120→ap_zujueyin_yinlian/100/140→ap_zushaoyang_waiqiu/100/160→ap_zushaoyin_lingxu/100/180→ap_zutaiyang_chengshan/100/200` |
| 6 玄上 | `sk_jifengqishu` | `mv_jifengqishu_chitu` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_jifengqishu_chitu}` | `mfr_jifengqishu_chitu` | `MeridianRouteDef{moveRef:mv_jifengqishu_chitu; ultimate:true; purpose:movement}`；`ap_zuyangming_lidui/100/100→ap_dumai_jizhong/100/120→ap_dumai_yaoyangguan/100/140→ap_shoushaoyang_yangchi/100/160→ap_shoutaiyang_shaoze/100/180→ap_shouyangming_erjian/100/200` |
| 6 玄上 | `sk_kuaihuozhen` | `mv_kuaihuozhen_jiadao` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_kuaihuozhen_jiadao}` | `mfr_kuaihuozhen_jiadao` | `MeridianRouteDef{moveRef:mv_kuaihuozhen_jiadao; ultimate:true; purpose:attack}`；`ap_shoushaoyin_shaochong/100/100→ap_shoutaiyang_qiangu/100/120→ap_shoutaiyang_yanglao/100/140→ap_shoutaiyin_yuji/100/160→ap_shouyangming_sanjian/100/180→ap_yangqiao_jianyu/100/200` |
| 6 玄上 | `sk_yanluosuo` | `mv_yanluosuo_tuoying` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_yanluosuo_tuoying}` | `mfr_yanluosuo_tuoying` | `MeridianRouteDef{moveRef:mv_yanluosuo_tuoying; ultimate:true; purpose:attack}`；`ap_zujueyin_zhongdu/100/100→ap_zushaoyin_shuiquan/100/120→ap_zutaiyin_gongsun/100/140→ap_renmai_danzhong/100/160→ap_renmai_shuifen/100/180→ap_shoujueyin_neiguan/100/200` |
| 6 玄上 | `sk_yanluosan` | `mv_yanluosan_xuanmian` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_yanluosan_xuanmian}` | `mfr_yanluosan_xuanmian` | `MeridianRouteDef{moveRef:mv_yanluosan_xuanmian; ultimate:true; purpose:attack}`；`ap_shoutaiyin_kongzui/100/100→ap_shoutaiyin_zhongfu/100/120→ap_shouyangming_shousanli/100/140→ap_yangqiao_juliao/100/160→ap_yangwei_jianjing/100/180→ap_yinqiao_jingming/100/200` |
| 6 玄上 | `sk_tangmenjieqi` | `mv_tangmenjieqi_fankou` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_tangmenjieqi_fankou}` | `mfr_tangmenjieqi_fankou` | `MeridianRouteDef{moveRef:mv_tangmenjieqi_fankou; ultimate:true; purpose:attack}`；`ap_zushaoyin_yingu/100/100→ap_zutaiyang_tianzhu/100/120→ap_zutaiyin_gongsun/100/140→ap_zuyangming_fenglong/100/160→ap_zuyangming_zusanli/100/180→ap_chongmai_qixue/100/200` |
| 6 玄上 | `sk_tangmenbidu` | `mv_tangmenbidu_shoumai` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_tangmenbidu_shoumai}` | `mfr_tangmenbidu_shoumai` | `MeridianRouteDef{moveRef:mv_tangmenbidu_shoumai; ultimate:true; purpose:defense}`；`ap_shoutaiyin_zhongfu/100/100→ap_yinwei_daheng/100/120→ap_zujueyin_dadun/100/140→ap_zujueyin_zhongdu/100/160→ap_zushaoyin_shuiquan/100/180→ap_zutaiyin_gongsun/100/200` |
| 6 玄上 | `sk_kongquezhen` | `mv_kongquezhen_bimen` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_kongquezhen_bimen}` | `mfr_kongquezhen_bimen` | `MeridianRouteDef{moveRef:mv_kongquezhen_bimen; ultimate:true; purpose:attack}`；`ap_yinqiao_zhaohai/100/100→ap_yinwei_zhubin/100/120→ap_zujueyin_xingjian/100/140→ap_zushaoyang_tongziliao/100/160→ap_zushaoyin_fuliu/100/180→ap_zushaoyin_yongquan/100/200` |
| 6 玄上 | `sk_jingwumingkuaijian` | `mv_jingwumingkuaijian_juehui` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_jingwumingkuaijian_juehui}` | `mfr_jingwumingkuaijian_juehui` | `MeridianRouteDef{moveRef:mv_jingwumingkuaijian_juehui; ultimate:true; purpose:attack}`；`ap_zushaoyin_lingxu/100/100→ap_zutaiyin_dabao/100/120→ap_zutaiyin_yinbai/100/140→ap_renmai_qugu/100/160→ap_shoujueyin_daling/100/180→ap_shoujueyin_ximen/100/200` |
| 6 玄上 | `sk_xiejiajianlu` | `mv_xiejiajianlu_bianlu` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_xiejiajianlu_bianlu}` | `mfr_xiejiajianlu_bianlu` | `MeridianRouteDef{moveRef:mv_xiejiajianlu_bianlu; ultimate:true; purpose:attack}`；`ap_daimai_weidao/100/100→ap_dumai_mingmen/100/120→ap_dumai_yinjiao/100/140→ap_renmai_qihai/100/160→ap_renmai_zhongwan/100/180→ap_shoujueyin_tianquan/100/200` |
| 6 玄上 | `sk_wanmeixinjing` | `mv_wanmeixinjing_jinghou` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_wanmeixinjing_jinghou}` | `mfr_wanmeixinjing_jinghou` | `MeridianRouteDef{moveRef:mv_wanmeixinjing_jinghou; ultimate:true; purpose:defense}`；`ap_shouyangming_sanjian/100/100→ap_yangqiao_jianyu/100/120→ap_yangwei_benshen/100/140→ap_yangwei_yangjiao/100/160→ap_yinwei_daheng/100/180→ap_yongquan/100/200` |
| 6 玄上 | `sk_baiyunjianwei` | `mv_baiyunjianwei_huijian` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_baiyunjianwei_huijian}` | `mfr_baiyunjianwei_huijian` | `MeridianRouteDef{moveRef:mv_baiyunjianwei_huijian; ultimate:true; purpose:attack}`；`ap_zushaoyang_fengshi/100/100→ap_zushaoyang_yanglingquan/100/120→ap_zushaoyin_shuiquan/100/140→ap_zutaiyang_kunlun/100/160→ap_zutaiyin_dadu/100/180→ap_zutaiyin_yinlingquan/100/200` |
| 6 玄上 | `sk_feixiandao` | `mv_feixiandao_guidao` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_feixiandao_guidao}` | `mfr_feixiandao_guidao` | `MeridianRouteDef{moveRef:mv_feixiandao_guidao; ultimate:true; purpose:movement}`；`ap_zushaoyin_shufu/100/100→ap_zutaiyang_feishu/100/120→ap_zutaiyin_dabao/100/140→ap_zutaiyin_yinbai/100/160→ap_zuyangming_renying/100/180→ap_chongmai_henggu/100/200` |
| 6 玄上 | `sk_renyizhuangjian` | `mv_renyizhuangjian_hewei` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_renyizhuangjian_hewei}` | `mfr_renyizhuangjian_hewei` | `MeridianRouteDef{moveRef:mv_renyizhuangjian_hewei; ultimate:true; purpose:attack}`；`ap_yangqiao_shenmai/100/100→ap_yangwei_yamen/100/120→ap_yinqiao_zhaohai/100/140→ap_yinwei_zhubin/100/160→ap_zujueyin_xingjian/100/180→ap_zushaoyang_tongziliao/100/200` |
| 6 玄上 | `sk_sanzhuangheji` | `mv_sanzhuangheji_tongji` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_sanzhuangheji_tongji}` | `mfr_sanzhuangheji_tongji` | `MeridianRouteDef{moveRef:mv_sanzhuangheji_tongji; ultimate:true; purpose:attack}`；`ap_shoushaoyin_shenmen/100/100→ap_shoutaiyang_tinggong/100/120→ap_shoutaiyin_shaoshang/100/140→ap_shouyangming_erjian/100/160→ap_shouyangming_yangxi/100/180→ap_yangqiao_juliao_wei/100/200` |
<!-- skill-catalog-audit:end -->


### 0.1 条目格式

| 品阶 | 本文格式 | 内容 |
|---|---|---|
| 天阶 10–12 | 不适用 | 本组没有基准 §13 天级锚点，本文不得新增天阶 |
| 地阶 7–9 | 完整条目卡 | 完整字段、逐招式核算、被动与获取途径 |
| 玄阶 4–6 | 紧凑卡 | 关键字段、招式摘要、被动、获取；至少 30% 玄阶武学列招式核算式 |
| 黄阶 1–3 | 一行表格 | `ID / 名称 / 门派或来源 / 类别 / 原生书界 / 核心效果 / 前置 / 出处或原创标注`；只在 §0.2 做整体预算核对 |

- `grade` 均为绝对品阶；外来压制后的 `effGrade` 不在图鉴里另造武学。
- 所有 Buff 均写 `bf_*·承`；“承”即 `grade: inherit`，定义与叠加只引用 `design/06`。
- `sourceChapters` 是本作的可学投放，不是古龙作品年代判断；古龙组织映入十四书界一律属于 **（原创扩展）**。
- `origin: canonExpanded` 表示原著有武学或兵器名、本文补机制；`expanded` 表示武学名本身也是本作归纳或扩写。
- NPC、任务、秘籍和装备 ID 均为 **【建议值】**；章节与 `design/10` 接手时可改资源 ID，不得改本文 `sk_*` 唯一 ID。
- 紧凑卡和黄阶行中的中文性质按 `阴/阳/调和/中性 → yin/yang/harmony/neutral` 导出；`sect rank n` 展开为本节门派的 `reqs.sect:{id:sect_*,rank:n}`，技艺门槛归 `reqs.skills`。未写来源上限者取门派对应职级传授 `maxLayer:10`，实际有效层数仍受修为与书界限制。行内花括号为配表简写，不是可直接执行的 YAML。
- 全文支援效果都按 `design/06` 的施加时点、互斥、消退和品阶继承执行；`bf_jiaoxie` 的回合数只用于预算记账，实际解除仍为拾回兵器/战斗结束，不改写其本体。

### 0.2 招式表列与核算

地阶招式表列为：`招式（ID）｜重｜范围·射程·投送｜倍率｜耗内/cd/收招｜附带｜架｜核算`。预算公式引用 `design/05` §4.2；AR-12 后六角范围模板与 `AF(Nmax)` 的唯一口径引用 `design/09` §5.3：

```text
power = AF × (1 + 冷却 + 耗内 + 收招 + 自损 + 蓄招 + 条件) × K_delivery × K_parry
        − Buff 代价 − 位移代价
```

| 记号 | 本文取值 |
|---|---|
| 大阶基准耗内 | 黄 5% / 玄 6% / 地 7%；绝招另用气势 100、耗内为基准 +2% |
| `cd+` / `内+` / `收+` | 每回合 `+0.12` / 每高 1% `+0.05` / 每多 100 收招 `+0.07` |
| `AF` | 按 `design/09` §5.3 的最大可命中格数查表：`N=1/2/3/6/7` 分别为 `1.00/0.90/0.85/0.75/0.70`；横扫为 `aoe_cone {r:1,angle:120}`（N=3），周身为 `aoe_around`（N=6），旧九宫迁为 `aoe_disk {r:1}`（N=7），60° 扇形 r3 为 N=7 |
| 投送 / 招架 | `ranged 0.85`、`projectile 0.92`；不可招架 `0.85` |
| 常用效果成本 | 硬控（定身/眩晕）`0.25×率×回合`；封经/缴械 `0.20×率×回合`；内伤/破甲/流血/减速/易伤/震慑 `0.10×率`；自身增益 0.10–0.20 |
| 位移成本 | 击退每格 0.05；拉拽/突进/跳斩 0.10；绕背/换位 0.15 |

`aoe_leap`、`aoe_dash`（不穿透）、`aoe_behind` 与带伤害的 `aoe_swap` 都只命中主目标，按 N=1 后另扣位移成本；`aoe_chain` 首段按 N=1、后续每跳 ×0.8；`aoe_boomerang` 每程按该程最大覆盖格数查 AF。本文不沿用 `design/05` §4.3 的旧方格专属 AF。

玄阶共 29 门；本文对其中 20 门的攻击招式显式列算式，`20/29=68.97%≥30%`。黄阶没有逐招式卡：17 门拳脚 / 兵器采用单体基准 `1.00`、六角横扫 `0.85×(1+0.12)=0.952→0.95` 或单目标突进 `1×(1+0.12)−0.10=1.02→1.00`；其余 12 门内功 / 轻功 / 杂学为无伤害支援模板。全部伤害模板偏差均在 ±0.05 内。

黄阶模板省略参数统一为近身、可招架、收招 1000、耗内 5%：单体 cd 0；横扫/突进 cd 1；击退式退 1 格为 `1−0.05=0.95`；擒手附失衡 30% 为 `1−0.10×30%=0.97→1.00`。守反式在成功招架后触发，收招 800、cd 0，`1−0.14=0.86→0.85`；恶人谷短打/血雨门抢攻式耗内 6%、收招 900、cd 0，`1+0.05−0.07=0.98→1.00`。这些参数只落实本文模板，不另改 05 通则。

### 0.3 内功贡献与经脉引用

内功第 10 重主运预算引用 `design/05` §5.5：

```text
IP = mpMaxPct + hpMaxPct + 2 × 属性点总数 + 5 × mpRegen
```

| 品阶 | 目标 IP | 本文标准分配 | 核算 |
|---|---:|---|---:|
| 黄中 2 | 24 | `mpMaxPct 8, hpMaxPct 5, attrs 3, mpRegen 1.0` | `8+5+2×3+5×1.0=24` |
| 黄上 3 | 30 | `10, 6, attrs 4, 1.2` | `10+6+2×4+5×1.2=30` |
| 玄下 4 | 41.5 | `14, 8, attrs 6, 1.5` | `14+8+2×6+5×1.5=41.5` |
| 玄上 6 | 57 | `20, 12, attrs 8, 1.8` | `20+12+2×8+5×1.8=57` |
| 地上 9 | 94.5 | `34, 20, attrs 14, 2.5` | `34+20+2×14+5×2.5=94.5` |

黄阶贡献沿上表同品阶分配；三门的 `attrs` 分别为：大旗吐纳 `{con:1,wis:1,wil:1}`、青龙吐纳 `{con:2,wis:1,wil:1}`、青龙护心功 `{con:2,wil:1}`。所有额外内功属性放在 `inner.contribution.stats`，不新增 `inner.stats` 字段。

AR-02 要求每门内功明确 `nature: yin / yang / harmony`；本文共 9 门内功，全部已标。本文引用 `design/15` 已冻结的 `mer_renmai`、`mer_dumai`、`mer_yinqiao`、`mer_yangqiao`、`mer_shoutaiyin` 五个正式 ID，不在图鉴重定义其效果。

### 0.4 本组五级职级建议（AR-07）

门派具体称谓以 `design/17` §1.11–§1.14 和各派条目为准；数据层统一映射如下。这里只列可学武学，不定义月钱、贡献阈值或资源。

| `rank` | 通用显示称谓 | 可学武学 |
|---:|---|---|
| 1 | 外门弟子 | 本派黄阶入门拳或剑、黄阶基础内功 / 身法 |
| 2 | 入门弟子 | 黄阶全开；玄下武学 |
| 3 | 亲传闭门弟子 | 玄阶全开；地下候选 |
| 4 | 长老 | 地阶全开；组织秘传与跨派互证任务 |
| 5 | 掌门 | 最高目录访问权；禁物、城主 / 王号与剧情人物武学仍需独立事件 |

各组织 UI 显示称谓必须直接沿用 `design/17` §11，不把上表通称覆盖到古龙组织。武学权限仍按 L1–L5 映射：

| 组织 | L1 → L2 → L3 → L4 → L5 正式称谓 |
|---|---|
| 移花宫 | 宫侍 → 门人 → 宫主亲传 → 宫使 / 护法 → 宫主 |
| 恶人谷 | 来客 → 留谷者 → 核心住民 → 十恶席位 → 谷中主事 |
| 大旗门 | 旗卒 → 门人 → 云 / 铁嫡传 → 旗主 / 护法 → 掌门 |
| 神水宫 | 宫侍 → 宫人 → 阴姬亲传 → 宫使 → 宫主 |
| 无争山庄 | 庄客 → 家臣 → 少庄主亲随 → 总管 / 家老 → 庄主 |
| 青龙会 | 外围眼线 → 分坛执事 → 舵主 → 龙首 / 总护法 → 大龙头 |
| 快活王一系 | 外庄侍从 → 卫士 → 使者 / 骑卫 → 统领 → 快活王 |
| 血雨门 | 外线 → 门徒 → 阎罗席 → 护法 → 令主 |
| 蜀中唐门 | 外院门客 → 唐门子弟 → 暗器房亲传 → 房主 / 家老 → 唐门家主 |
| 孔雀山庄 | 庄客 → 护院 → 秋氏亲传 → 总管 / 家老 → 庄主 |
| 金钱帮 | 外围商号 → 帮众 → 舵主 → 护法 / 副帮主 → 帮主 |
| 神剑山庄 | 庄客 → 谢家子弟 → 嫡传 → 家老 / 剑师 → 庄主 |
| 万梅山庄 | 庄客 → 内院执事 → 剑侍 / 亲传 → 总管 → 庄主 |
| 白云城 | 岛民 / 侍从 → 府卫 → 剑侍 → 统领 / 总管 → 城主 |
| 仁义庄 | 庄客 → 执事 → 巡查使 → 庄主之一 / 总管 → 盟议主持 |

### 0.5 数量、天级闭集与品阶调整

- `rulings-v1` 分工表尚无本组一行；默认以 `design/17` 的 45 门候选作为扩容基数（G-11）。AR-01 覆盖旧数量目标：正数四舍五入 `floor(45×1.5+0.5)=68`。本文取 **0 天 / 10 地 / 29 玄 / 29 黄 = 68**。
- 大阶比例为 `10:29:29 = 1:2.90:2.90`；玄、黄相对 `1:3:3` 各偏差 `|2.90−3|/3=3.33%`，在 ±15% 内。
- 基准 §13 的 51 门天级中没有本组条目；任何古龙原作中的“绝顶”“无敌”描述都不构成升天依据。
- `design/17` 的 45 个 ID、名称、类别方向与来源全部保留。因作者后发 AR-01 要求本图鉴按大阶比例落盘，以下 20 项调整其“品阶建议”；类别和效果方向按 05 枚举细化。金钱落地阵降为黄阶后以失衡表现包围，缴械交给同套地阶双环；孔雀翎保留每场一次机发。

| 调整 | ID（`design/17` 建议 → 本文定级） | 理由 |
|---|---|---|
| 地 → 玄 | `sk_yihuajieyu` 9→6、`sk_tiexueqigong` 7→6、`sk_tianyishenshui` 8→6、`sk_tingfengbianwei` 7→6、`sk_bianfushenfa` 8→6、`sk_qiankunmishou` 8→6、`sk_tangmenjieqi` 7→6、`sk_jingwumingkuaijian` 8→6、`sk_xiejiajianlu` 8→6、`sk_wanmeixinjing` 7→6、`sk_sanzhuangheji` 7→6 | 保留原效果方向，以较低数值实现；让地阶为 10 门且贴近 AR-01 比例 |
| 玄 → 黄 | `sk_erenguqianxing` 4→3、`sk_shenshuihezhen` 6→3、`sk_qinglongmihao` 5→3、`sk_xueyuyexing` 5→3、`sk_qiushiqinggong` 5→3、`sk_jinqianluodi` 5→3、`sk_cuiyunbu` 5→3、`sk_taxuemeibu` 5→3、`sk_xuanhongzhuiji` 5→3 | 作为基础身法、基础阵或通行杂学，保留功能但压低强度 |

### 0.6 出处、书界与获取记法

| 简写 | 书界 ID | 本组开放依据 |
|---|---|---|
| XA | `ch05_xiaoao` | 大旗门、快活王一系、仁义庄为主；移花宫等少数隐藏来访按 `design/17` 的 `H` |
| XK | `ch06_xiake` | 移花宫、恶人谷、神水宫、无争山庄、唐门、金钱帮、神剑山庄为主 |
| BX | `ch07_bixue` | 青龙会、孔雀山庄、万梅山庄、白云城为主 |
| LD | `ch08_luding` | 青龙会、血雨门、孔雀山庄为主 |
| LC–XS | `ch09_liancheng` 至 `ch14_xueshan` | 青龙会以不同代网络持续开放；同一人物不跨代长生 |

“古龙·《书名》”只说明组织、人物、兵器或武学名的文学来源；金庸书界投放均为 **（原创扩展）**。本作新增招名统一在条目开头声明，不逐行假称原著招式。

---

## 1. 本组门派一览

### 1.1 门派、书界与数量

| 门派 | `sect_*` | 主投放 | 古龙作品依据 | 地 / 玄 / 黄 | 合计 |
|---|---|---|---|---:|---:|
| 移花宫 | `sect_yihuagong` | XK | 《绝代双骄》 | 1 / 2 / 1 | 4 |
| 恶人谷 | `sect_erengu` | XK | 《绝代双骄》 | 0 / 2 / 2 | 4 |
| 大旗门 | `sect_daqimen` | XA | 《大旗英雄传》 | 1 / 2 / 2 | 5 |
| 神水宫 | `sect_shenshuigong` | XK | 《楚留香传奇·画眉鸟》 | 1 / 1 / 2 | 4 |
| 无争山庄 | `sect_wuzhengshanzhuang` | XK | 《楚留香新传·蝙蝠传奇》 | 0 / 3 / 1 | 4 |
| 青龙会 | `sect_qinglonghui` | BX–XS | 《七种武器》等 | 1 / 4 / 6 | 11 |
| 快活王一系 | `sect_kuaihuowangfu` | XA | 《武林外史》 | 0 / 3 / 1 | 4 |
| 血雨门 | `sect_xueyumen` | LD | 《剑·花·烟雨江南》 | 0 / 2 / 2 | 4 |
| 蜀中唐门 | `sect_tangmen` | XK | 《白玉老虎》 | 1 / 2 / 1 | 4 |
| 孔雀山庄 | `sect_kongqueshanzhuang` | BX、LD | 《七种武器·孔雀翎》 | 1 / 1 / 2 | 4 |
| 金钱帮 | `sect_jinqianbang` | XK | 《多情剑客无情剑》 | 1 / 1 / 2 | 4 |
| 神剑山庄 | `sect_shenjianshanzhuang` | XK | 《三少爷的剑》 | 1 / 1 / 2 | 4 |
| 万梅山庄 | `sect_wanmeishanzhuang` | BX | 《陆小凤传奇》 | 1 / 1 / 2 | 4 |
| 白云城 | `sect_baiyuncheng` | BX | 《陆小凤传奇·决战前后》 | 1 / 2 / 1 | 4 |
| 仁义庄 | `sect_renyizhuang` | XA | 《武林外史》 | 0 / 2 / 2 | 4 |
| **合计** | 15 个唯一 ID | XA–XS | 10 部古龙作品 / 系列 | **10 / 29 / 29** | **68** |

### 1.2 类别与可携带性速查

| 大类 | 地 | 玄 | 黄 | 合计 | 备注 |
|---|---:|---:|---:|---:|---|
| 内功 `inner` | 3 | 3 | 3 | 9 | 全部有 `nature`、IP 核算与 `meridians` 预留 |
| 拳脚 `unarmed` | 0 | 3 | 10 | 13 | 每派至少一门黄阶入门拳或剑 |
| 兵器 `weapon` | 5 | 8 | 7 | 20 | 剑、枪、鞭索、奇门；同类装配证明见 §19 |
| 轻功 `movement` | 0 | 4 | 5 | 9 | 最高玄上 6，不突破各书界上限 |
| 暗器 `hidden` | 2 | 0 | 0 | 2 | 唐门暗手、孔雀翎机发 |
| 杂学 `misc` | 0 | 11 | 4 | 15 | 阵法、心神、毒术、追迹与骑术 |
| **合计** | **10** | **29** | **29** | **68** | 与 §18 逐 ID 复算一致 |

---

## 2. 移花宫 `sect_yihuagong`

### 2.1 定位与武学总表

移花宫史料边界、XK 开放状态和五级称谓引用 `design/17` §11.1。宫中完整支线为侠客书界 **（原创扩展）**；不把邀月、怜星写成古墓或灵鹫传人。

| ID | 名称 | 品阶 | 类别 | 性质 | 原生书界 |
|---|---|---:|---|---|---|
| `sk_mingyugong` | 明玉功 | 9 地上 | 内功 | 阴 | XK（XA 隐线） |
| `sk_yihuajieyu` | 移花接玉 | 6 玄上 | 拳脚/擒拿 | 阴 | XK |
| `sk_yihuagongqinggong` | 移花宫轻功 | 6 玄上 | 轻功 | 阴 | XK |
| `sk_yihuagongjian` | 移花宫入门剑 | 3 黄上 | 兵器/剑 | 阴 | XK（XA 隐线） |

### 2.2 地阶完整条目卡

#### `sk_mingyugong` 明玉功（9 地上 · 内功 · 移花宫）

> **出处**：**（古龙·《绝代双骄》）** 移花宫主邀月、怜星所习绝学；名称与大体地位有原著依据，具体运行层次和招式均 **（原创扩展）**，功效措辞仍须正式版本复核 **（待考）**。

| 字段 | 值 |
|---|---|
| `origin / sect / lineage` | `canonExpanded` / `sect_yihuagong` / 邀月、怜星 → 花无缺（传授细节待考） |
| `sourceChapters` | `[ch06_xiake, ch05_xiaoao]`；XA 仅隐藏互证线 **（原创扩展）** |
| `nature · wOut/wIn · moveSlots` | `yin · 0.10/0.90 · 4` |
| `reqs` | `attrs {con:50,wil:55,wis:45}`；`aptitude {apInner:50}`；`sect {id:sect_yihuagong,rank:4}`；`prereq [{skill:sk_yihuajieyu,layer:6}]`；`hard:[sect,prereq]` |
| `inner.contribution` | `mpMaxPct 34, hpMaxPct 20, attrs {con:4,wis:4,wil:6}, mpRegen 2.5`；`IP=34+20+2×14+5×2.5=94.5` |
| `inner.contribution.stats / meridians` | `{resCold:10,resInjury:5}`（15）；`[mer_renmai, mer_yinqiao]`（正式 ID 见 `design/15`） |
| 层数要点 | 1 凝玉｜3 寒玉护体｜被动内敛｜**7 绝招明玉回流、被动无瑕**｜**9 绝招明玉照夜**｜10 明玉圆满 |
| `setTags / conflicts` | `[set_yihua_shuangbi]` / 无 |
| `special / observable` | `{fusible:true}` / `true` |
| 获取 | XK `master npc_yaoyue` 或 `npc_lianxing`，`maxLayer:10`；花无缺羁绊印证 `maxLayer:8`；恶人谷镜像来源用 `reqsOverride:{sect:null,prereq:[{anyOf:[{skill:sk_yihuajieyu,layer:6},{skill:sk_wuehezhen,layer:6}]}],hard:[prereq]}`；XA 隐线残卷 `maxLayer:6`，来源覆写 `reqsOverride:{sect:null,prereq:[{skill:sk_daqixinfa,layer:5}],hard:[prereq]}`，均 **（原创扩展）** |
| 图鉴文本 | 移花宫绝学明玉功。本文以阴寒、回流与护体表现其特色；数值和招式均为原创扩展。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 凝玉 `mv_mingyugong_ningyu` **（原创扩展命名）** | 1 | 单体·1–3·远程 | 1.00 | 8%/1/1000 | 掌端离体寒劲 **（原创扩展）**；`bf_hanqi·承·30%·3` | ✓ | `(1+0.12+0.05)×0.85−0.03=0.9645→1.00`；`MoveDef{range:{min:1,max:3}; aoe:{tpl:aoe_single}; projection:true; projectionSpreadSteps:[{tpl:aoe_single},{tpl:aoe_single},{tpl:aoe_single}]; DamageKind:'projected'; meridianRouteRef:mfr_mingyugong_ningyu}` |
| 寒玉护体 `mv_mingyugong_hanyu` **（原创扩展命名）** | 3 | 自身·支援 | 0 | 8%/3/900 | `bf_hutizhenqi·承·100%·3`，护体为自身 hpMax 18% | — | 支援核对：`18%≤18%×1.2=21.6%` 标准护体，且 cd 3 |
| 明玉回流 `mv_mingyugong_huiliu`（绝招，**原创扩展命名**） | 7 | 自身·支援 | 0 | 9%/—/1200 | `bf_huinei·承·100%·2`；每次回合开始回 6% mpMax，共两次；气势 100 | — | 支援绝招以气势 100、地阶基准耗内 +2pp 与收招 1200 支付；回内仍按每回合合计 6% 截断；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 明玉照夜 `mv_mingyugong_zhaoye` **（绝招，原创扩展命名）** | 9 | `aoe_around` 周身六格·近身 | 2.15 | 9%/—/1200 | `bf_hanqi·承·100%·3`，气势 100 | ✓ | `3.00×0.75−0.10=2.15`；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 ID | 名称 | 重 | 类型 | 数值 / 说明 |
|---|---|---:|---|---|
| `ps_mingyugong_yunyu` | 运玉 **（原创扩展命名）** | 1 | stat | 主运时 `resCold +4→+10`，为 contribution.stats 中 resCold 的展示映射，不重复叠加 |
| `ps_mingyugong_neilian` | 内敛 **（原创扩展命名）** | 5 | trigger | 招架成功时 30% 获得 `bf_huinei` 1 回合，每回合 1 次 |
| `ps_mingyugong_wuxia` | 无瑕 **（原创扩展命名）** | 7 | effect | 新获得的 `cold` 效果持续 −1，最低 1 |
| `ps_mingyugong_yuanman` | 明玉圆满 **（原创扩展命名）** | 10 | mechanic | 主运且内力 ≥80% 时，内功护体效果 +20% |

### 2.3 玄阶紧凑卡

**`sk_yihuajieyu` 移花接玉**（6 玄上 · `unarmed/grapple` · 阴 · 0.45/0.55 · `canonExpanded`）

- 出处：**（古龙·《绝代双骄》）** 移花宫武学；借力、拆招表现有原著依据，具体招式名与数值 **（原创扩展）**。`sourceChapters:[ch06_xiake]`。
- `reqs {aptitude:{apGrapple:35},sect:{id:sect_yihuagong,rank:3},prereq:[{skill:sk_yihuagongqinggong,layer:5}],hard:[sect,prereq]}`；`layerStats {parry:[1,5],counter:[1,5]}`；`setTags:[set_yihua_shuangbi]`。
- 招式：接玉 `mv_yihuajieyu_jieyu`（单体 0.95，招架成功后反击）；移花 `mv_yihuajieyu_yihua`（单目标换位 1.05，`bf_shiheng·承·40%·2`）；借力 `mv_yihuajieyu_jieli`（绝招，架势，下一次近战反击 1.10；耗内 8%、气势 100、收招 1200）。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`
- 核算抽样：移花按单目标换位 `1.00×(1+0.24)−0.15−0.04=1.05`，倍率同步为 1.05。
- 被动：`ps_yihuajieyu_jieli`（4 重，反击 Z3 +6%→+12%）；`ps_yihuajieyu_dacheng`（10 重，每回合首次成功招架返还本招 20% 耗内）。获取：邀月 / 怜星传授 `maxLayer:10`；花无缺羁绊 `maxLayer:8`。

**`sk_yihuagongqinggong` 移花宫轻功**（6 玄上 · `movement/movement` · 阴 · 0.80/0.20 · `expanded`）

- 出处：**（古龙·《绝代双骄》）** 据移花宫人物身法归纳，武学名与全部招式 **（原创扩展命名）**。`sourceChapters:[ch06_xiake]`；`QS(6)=74`。
- `reqs {attrs:{agi:35},aptitude:{apLight:30},sect:{id:sect_yihuagong,rank:2},prereq:[{skill:sk_yihuagongjian,layer:4}],hard:[sect,prereq]}`；`layerStats {eva:[1,5],hit:[1,5]}`；`setTags:[set_yihua_shuangbi]`。
- 招式：花影 `mv_yihuagongqinggong_huaying`（自身 `bf_piaohu·承·100%·3`）；移步 `mv_yihuagongqinggong_yibu`（绝招，后撤 2 格，`bf_youshi·承·100%·2`；耗内 8%、气势 100、收招 1200）。无伤害招式。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`
- 被动：`ps_yihuagongqinggong_lingbo`（5 重，穿过友方不加移动消耗）；`ps_yihuagongqinggong_dacheng`（10 重 `jump +1`）。获取：宫中传授 `maxLayer:10`。

### 2.4 黄阶一行条目

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或原创标注 |
|---|---|---|---|---|---|---|---|
| `sk_yihuagongjian` | 移花宫入门剑 | 移花宫 | `weapon/sword`，3 黄上，阴，0.75/0.25 | XK（XA 隐线） | 单体 1.00；六角横扫 0.95；`weaponReq:{category:sword}`；`setTags:[set_yihua_shuangbi]` | XK `sect rank 1`；XA 第一幕末剑谱互证 `sect:null,maxLayer:6` | **（古龙·《绝代双骄》）** 据宫人佩剑形象 **（待考）**；武学名、招式与投放 **（原创扩展）** |

### 2.5 进阶链、套装与职级

- 链：`sk_yihuagongjian` 4 重（黄）→ `sk_yihuagongqinggong` 5 重（玄）→ `sk_yihuajieyu` 6 重（玄）→ `sk_mingyugong`（地）。
- 套装候选 `set_yihua_shuangbi`：移花宫入门剑、移花宫轻功、移花接玉、明玉功；四者已双向登记。
- 可学：L1 入门剑；L2 轻功；L3 移花接玉；L4 明玉功；L5 不额外赠送剧情人物身份。

---

## 3. 恶人谷 `sect_erengu`

### 3.1 定位与武学总表

恶人谷是避难聚落而非单线师承，身份与职级引用 `design/17` §11.2。本文将谷中多人训练归成生存、合围与潜行目录，均为 **（原创扩展）**，不把“十大恶人”当自动晋升称号。

| ID | 名称 | 品阶 | 类别 | 性质 | 原生书界 |
|---|---|---:|---|---|---|
| `sk_erengushengcun` | 恶人谷生存术 | 5 玄中 | 杂学/心神 | 中性 | XK |
| `sk_wuehezhen` | 五恶合围 | 6 玄上 | 杂学/阵法 | 中性 | XK |
| `sk_erenguqianxing` | 谷地潜行 | 3 黄上 | 轻功 | 中性 | XK |
| `sk_erenguduanda` | 恶人谷短打 | 2 黄中 | 拳脚/拳掌 | 阳 | XK |

### 3.2 玄阶紧凑卡

**`sk_erengushengcun` 恶人谷生存术**（5 玄中 · `misc/mind` · 中性 · 0.40/0.60 · `expanded`）

- 出处：**（古龙·《绝代双骄》）** 据江小鱼在谷中由多人抚养、学习识诈与自保的经历归纳；武学总名与效果 **（原创扩展）**，具体情节待考。
- `sourceChapters:[ch06_xiake]`；`reqs {attrs:{wis:30,wil:25},skills:{speech:20},sect:{id:sect_erengu,rank:2},hard:[sect]}`，`speech` 为软门槛；`layerStats {effRes:[1,5],eva:[1,5]}`；`setTags:[]`。
- 招式：装傻 `mv_erengushengcun_zhuangsha`（本回合不可攻击；直至自身下次行动前，敌方 AI 对自身的目标评分 `T(x) −0.3` **【建议值】**，不改变目标合法性，评分归属见 `design/09` §8.5）；拆诈 `mv_erengushengcun_chaizha`（驱散自身 1 个 `mind` / `mark`）；藏针 `mv_erengushengcun_cangzhen`（单体 1.00；目标带 `mark` 时取 1.15，仅计入招式预算）。
- 核算抽样：藏针无标记 `1.00`、有标记 `1+0.15=1.15`；被动 `ps_erengushengcun_shizha`（5 重，对背击与陷阱 `Z4 +8%`）；获取：谷中五人关系任务 **（原创扩展）**，`maxLayer:10`。

**`sk_wuehezhen` 五恶合围**（6 玄上 · `misc/formation` · 中性 · 0.55/0.45 · `expanded`）

- 出处：**（古龙·《绝代双骄》）** 据谷中多人协作扩写；名称、阵式与效果均 **（原创扩展）**。`sourceChapters:[ch06_xiake]`。
- `reqs {sect:{id:sect_erengu,rank:3},skills:{formation:30},prereq:[{skill:sk_erenguduanda,layer:4}],hard:[sect,prereq]}`；`layerStats {hit:[1,5],effHit:[1,5]}`；`setTags:[]`；不是“必须多人才能施放”的地阶合击，且本身为玄阶。
- 招式：合围 `mv_wuehezhen_hewei`（绝招，单体 2.80；目标相邻我方 ≥2 时 `bf_suoding·承·60%·2`；耗内 8%、气势 100、收招 1200）；换手 `mv_wuehezhen_huanshou`（友方换位）；散阵 `mv_wuehezhen_sanzhen`（自身与相邻友方各得 `bf_dunzou·承·100%·2`）。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`
- 核算抽样：合围 `3.00−0.10×60%=2.94`，相邻友方条件价值预扣 0.15，取 2.80。被动 `ps_wuehezhen_duobian`（5 重，阵友伤害类型不同则自身效果命中 +8%）；获取：恶人谷关系线，`maxLayer:10`。

### 3.3 黄阶一行条目

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或原创标注 |
|---|---|---|---|---|---|---|---|
| `sk_erenguqianxing` | 谷地潜行 | 恶人谷 | `movement/movement`，3 黄上，中性，0.50/0.50 | XK | 暗处移动消耗 −1；主动获 `bf_yinshen`；无伤害；`setTags:[]` | `sect rank 1` | **（古龙·《绝代双骄》）** 据恶人谷地形；名称、机制 **（原创扩展）** |
| `sk_erenguduanda` | 恶人谷短打 | 恶人谷 | `unarmed/fist`，2 黄中，阳，0.85/0.15 | XK | 单体 1.00、抢先收招 900；`setTags:[]` | `sect rank 1` | **（古龙·《绝代双骄》）** 据谷中自保训练；武学与招名 **（原创扩展）** |

### 3.4 进阶链、套装与职级

- 链：`sk_erenguduanda` 4 重（黄）→ `sk_wuehezhen` 6 重（玄）→ 在移花宫镜像结局以 `anyOf` 前置印证 `sk_mingyugong`（地，跨派互证，**原创扩展**）。
- 套装候选 `legacy-set:erengu_qiaobian`：谷地潜行、恶人谷短打、恶人谷生存术、五恶合围、明玉功；五门均已反向登记该标签。
- 可学：L1 短打 / 潜行；L2 生存术；L3 五恶合围；L4 跨派互证；L5 仍不自动授予“十大恶人”名号。

---

## 4. 大旗门 `sect_daqimen`

### 4.1 定位与武学总表

大旗门的云、铁两姓、XA 开放与五级称谓引用 `design/17` §11.3；后世只投残旗线。旗枪、旗功和入门拳 / 心法是 **（原创扩展）**，不伪称历史军阵。

| ID | 名称 | 品阶 | 类别 | 性质 | 原生书界 |
|---|---|---:|---|---|---|
| `sk_jiayishengong` | 嫁衣神功 | 9 地上 | 内功 | 阳 | XA |
| `sk_daqiqiang` | 大旗枪法 | 6 玄上 | 兵器/枪 | 阳 | XA |
| `sk_tiexueqigong` | 铁血旗功 | 6 玄上 | 杂学/阵法 | 中性 | XA |
| `sk_daqimenquan` | 大旗门入门拳 | 3 黄上 | 拳脚/拳掌 | 阳 | XA |
| `sk_daqixinfa` | 大旗吐纳 | 2 黄中 | 内功 | 调和 | XA |

### 4.2 地阶完整条目卡

#### `sk_jiayishengong` 嫁衣神功（9 地上 · 内功 · 大旗门）

> **出处**：**（古龙·《大旗英雄传》）** 嫁衣神功及“破后再立”的传承方向有原著依据；本文的层次、招式和战斗数值 **（原创扩展）**，完整传授关系 **（待考）**。

| 字段 | 值 |
|---|---|
| `origin / sect / lineage` | `canonExpanded` / `sect_daqimen` / 大旗门相关传承（人物链待考） |
| `sourceChapters` | `[ch05_xiaoao]` **（原创扩展）** |
| `nature · wOut/wIn · moveSlots` | `yang · 0.15/0.85 · 4` |
| `reqs` | `attrs {con:55,wil:55}`；`aptitude {apInner:50}`；`sect {id:sect_daqimen,rank:4}`；`prereq [{skill:sk_tiexueqigong,layer:6}]`；`hard:[sect,prereq]` |
| `inner.contribution` | `mpMaxPct 32, hpMaxPct 22, attrs {con:7,str:4,wil:3}, mpRegen 2.5`；`IP=32+22+2×14+5×2.5=94.5` |
| `inner.contribution.stats / meridians` | `{resInjury:10,resCC:5}`（15）；`[mer_dumai,mer_yangqiao]`（正式 ID 见 `design/15`） |
| 层数要点 | 1 藏锋｜3 烈火护衣、厚炼｜**7 绝招破茧重振、被动返本**｜**9 绝招烈火重衣**｜10 衣成 |
| `setTags / conflicts` | `[]` / 无 |
| `special / observable` | `{fusible:true}` / `true`；没有 `special.cost`，不是 §9.1 代价型；伤后奖励不主动扣血 |
| 获取 | XA 大旗门复兴线传授 / 秘谱，`maxLayer:10`；快活王 / 仁义庄互证来源用 `reqsOverride:{sect:null,prereq:[{anyOf:[{skill:sk_tiexueqigong,layer:6},{skill:sk_qiankunmishou,layer:6},{skill:sk_sanzhuangheji,layer:6}]}],hard:[prereq]}`；后世残旗暂只作剧情线索；未列入 sourceChapters 的书界不开授艺，新增来源须由 C3 同步重算可学池 |
| 图鉴文本 | 嫁衣神功以受创后凝炼、再起表现其“为人作嫁”意象；具体机制为原创扩展。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 藏锋 `mv_jiayishengong_cangfeng` **（原创扩展命名）** | 1 | 单体·1–2·近身 | 1.15 | 8%/1/1000 | 自身 HP≤60% 时 Z3 +15% | ✓ | `1×(1+0.12+0.05)=1.17≈1.15`；条件另加 Z3 |
| 烈火护衣 `mv_jiayishengong_huyi` **（原创扩展命名）** | 3 | 自身·支援 | 0 | 8%/3/1000 | `bf_hutizhenqi·承·100%·3`；护体 hpMax 18% | — | 支援核对：`18%≤18%×1.2=21.6%` 标准护体，且 cd 3 |
| 破茧重振 `mv_jiayishengong_chongzhen`（绝招，**原创扩展命名**） | 7 | 自身·支援 | 0 | 9%/—/1200 | 清 1 层 `bf_neishang`，得 `bf_juqi·承·100%·2`；气势 100 | — | 支援绝招以气势 100、地阶基准耗内 +2pp 与收招 1200 支付；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 烈火重衣 `mv_jiayishengong_liehuo` **（绝招，原创扩展命名）** | 9 | `aoe_around` 周身六格·近身 | 2.20 | 9%/—/1200 | `bf_zhenshe·承·50%·2`，气势 100 | ✓ | `3.00×0.75−0.10×50%=2.20`；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 ID | 名称 | 重 | 类型 | 数值 / 说明 |
|---|---|---:|---|---|
| `ps_jiayishengong_houlian` | 厚炼 **（原创扩展命名）** | 3 | stat | 气血每比 hpMax 降低 20%，`resInjury +3`，最多 +9 |
| `ps_jiayishengong_fanben` | 返本 **（原创扩展命名）** | 7 | trigger | 每场首次从 HP≤35% 被治疗至其上时，回复 12% 内力 |
| `ps_jiayishengong_yicheng` | 衣成 **（原创扩展命名）** | 10 | effect | 主运且 HP≥80% 时，护体值 +15% |

### 4.3 玄阶紧凑卡

**`sk_daqiqiang` 大旗枪法**（6 玄上 · `weapon/spear` · 阳 · 0.80/0.20 · `expanded`）

- 出处：**（古龙·《大旗英雄传》）** 据门名、旗阵与边塞冲突扩写；武学名、招式均 **（原创扩展）**。`sourceChapters:[ch05_xiaoao]`。
- `weaponReq:{category:spear}`；`reqs {aptitude:{apSpear:30},sect:{id:sect_daqimen,rank:2},prereq:[{skill:sk_daqimenquan,layer:4}],hard:[sect,prereq]}`；`layerStats {hit:[1,5],parry:[1,5]}`；`setTags:[]`。
- 招式：卷旗 `mv_daqiqiang_juanqi`（`aoe_line n2` 1.05）；立纛 `mv_daqiqiang_lidu`（单体 1.10，命中后自身 `bf_wenzhong·承·100%·2`）；冲营 `mv_daqiqiang_chongying`（绝招，单目标突进 2 格 2.90；耗内 8%、气势 100、收招 1200）。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`
- 核算抽样：卷旗按 `aoe_line n2`，`0.90×(1+0.12+0.05)=1.053→1.05`（倍率同步为 1.05）；冲营按单目标突进，`3.00−0.10=2.90`。获取：XA 门中传授，`maxLayer:10`。

**`sk_tiexueqigong` 铁血旗功**（6 玄上 · `misc/formation` · 中性 · 0.55/0.45 · `expanded`）

- 出处：**（古龙·《大旗英雄传》）** 据大旗门群体守望归纳；名称和机制 **（原创扩展命名）**。`sourceChapters:[ch05_xiaoao]`。
- `reqs {skills:{formation:35},sect:{id:sect_daqimen,rank:3},prereq:[{skill:sk_daqixinfa,layer:5}],hard:[sect,prereq]}`；`layerStats {effRes:[1,6]}`；`setTags:[]`。
- 招式：举旗 `mv_tiexueqigong_juqi`（相邻友方得 `bf_zhanyi` 2 回合）；换列 `mv_tiexueqigong_huanlie`（友方换位）；守旗 `mv_tiexueqigong_shouqi`（绝招，自身与一名友方得 `bf_yuanhu` 2 回合；耗内 8%、气势 100、收招 1200）。无伤害。获取：XA 复兴任务，`maxLayer:10`。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`

### 4.4 黄阶一行条目

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或原创标注 |
|---|---|---|---|---|---|---|---|
| `sk_daqimenquan` | 大旗门入门拳 | 大旗门 | `unarmed/fist`，3 黄上，阳，0.90/0.10 | XA | 单体 1.00、六角横扫 0.95；`setTags:[]` | `sect rank 1` | **（古龙·《大旗英雄传》）** 门人基础训练 **（原创扩展）** |
| `sk_daqixinfa` | 大旗吐纳 | 大旗门 | `inner/inner`，2 黄中，`nature:harmony`，0.10/0.90 | XA | `IP=8+5+2×3+5×1=24`；`meridians:[mer_renmai]`（正式 ID）；`setTags:[]` | `sect rank 1` | **（古龙·《大旗英雄传》）** 基础心法 **（原创扩展）** |

### 4.5 进阶链、套装与职级

- 链：`sk_daqixinfa` 5 重（黄）→ `sk_tiexueqigong` 6 重（玄）→ `sk_jiayishengong`（地）；拳枪支线为 `sk_daqimenquan` 4 重（黄）→ `sk_daqiqiang`（玄），不虚写枪法为旗功前置。
- 套装候选 `legacy-set:daqi_tiexue`：五门均登记，主题为“基础吐纳—枪阵守旗—伤后再起”；最终件数和效果交 `design/07`。
- 可学：L1 入门拳 / 吐纳；L2 大旗枪；L3 铁血旗功；L4 嫁衣神功；L5 掌门目录。

---

## 5. 神水宫 `sect_shenshuigong`

### 5.1 定位与武学总表

神水宫的案件边界、XK 开放和称谓引用 `design/17` §11.4。天一神水仅抽象为虚构危险物的保管与安全运用，本文不写配方、制法或现实摄入方式。

| ID | 名称 | 品阶 | 类别 | 性质 | 原生书界 |
|---|---|---:|---|---|---|
| `sk_shenshuineigong` | 神水内功 | 9 地上 | 内功 | 阴 | XK |
| `sk_tianyishenshui` | 天一神水运用 | 6 玄上 | 杂学/毒术 | 阴 | XK |
| `sk_shenshuihezhen` | 神水合阵 | 3 黄上 | 杂学/阵法 | 中性 | XK |
| `sk_shenshuizhang` | 神水宫入门掌 | 2 黄中 | 拳脚/拳掌 | 阴 | XK |

### 5.2 地阶完整条目卡

#### `sk_shenshuineigong` 神水内功（9 地上 · 内功 · 神水宫）

> **出处**：**（古龙·《楚留香传奇·画眉鸟》）** 水母阴姬与神水宫的强大武力有原著依据；“神水内功”名称、层次及水势机制 **（原创扩展命名）**。

| 字段 | 值 |
|---|---|
| `origin / sect / lineage` | `expanded` / `sect_shenshuigong` / 水母阴姬 → 宫中亲传 **（待考）** |
| `sourceChapters` | `[ch06_xiake]` **（原创扩展）** |
| `nature · wOut/wIn · moveSlots` | `yin · 0.05/0.95 · 4` |
| `reqs` | `attrs {con:50,wil:55}`；`aptitude {apInner:50}`；`sect {id:sect_shenshuigong,rank:4}`；`prereq [{skill:sk_tianyishenshui,layer:6}]`；`hard:[sect,prereq]` |
| `inner.contribution` | `mpMaxPct 36, hpMaxPct 18, attrs {con:5,wis:4,wil:5}, mpRegen 2.5`；`IP=36+18+2×14+5×2.5=94.5` |
| `inner.contribution.stats / meridians` | `{resPoison:8,resCold:7}`（15）；`[mer_renmai,mer_shoutaiyin]`（正式 ID 见 `design/15`） |
| 层数要点 | 1 纳流｜3 水幕、水势｜**7 绝招回澜、被动回流**｜**9 绝招神水重潮**｜10 神水圆满 |
| `setTags / conflicts` | `[]` / 无 |
| `special / observable` | `{fusible:true}` / `true` |
| 获取 | XK 宫主试炼或宫中秘谱，`maxLayer:10`；无争山庄案件互证用 `reqsOverride:{sect:null,prereq:[{anyOf:[{skill:sk_tianyishenshui,layer:6},{skill:sk_tingfengbianwei,layer:6}]}],hard:[prereq]}`；案件旁证只开放 4 重 **（原创扩展）** |
| 图鉴文本 | 据神水宫与水母阴姬的武力表现归纳的阴性内功；名称、招式和数值均为原创扩展。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 纳流 `mv_shenshuineigong_naliu` **（原创扩展命名）** | 1 | 单体·1–3·远程 | 1.00 | 8%/1/1000 | 掌端离体水劲 **（原创扩展）**；`bf_hanqi·承·30%·2` | ✓ | `(1+0.12+0.05)×0.85−0.03=0.9645→1.00`；`MoveDef{range:{min:1,max:3}; aoe:{tpl:aoe_single}; projection:true; projectionSpreadSteps:[{tpl:aoe_single},{tpl:aoe_single},{tpl:aoe_single}]; DamageKind:'projected'; meridianRouteRef:mfr_shenshuineigong_naliu}` |
| 水幕 `mv_shenshuineigong_shuimu` **（原创扩展命名）** | 3 | 自身·支援 | 0 | 8%/3/1000 | `bf_hutizhenqi·承·100%·3`；护体 hpMax 18% | — | 支援核对：`18%≤18%×1.2=21.6%` 标准护体，且 cd 3 |
| 回澜 `mv_shenshuineigong_huilan`（绝招，**原创扩展命名**） | 7 | 自身·支援 | 0 | 9%/—/1200 | `bf_huinei·承·100%·2`，每次回合开始回 5% mpMax，共两次；气势 100 | — | 支援绝招以气势 100、地阶基准耗内 +2pp 与收招 1200 支付；回内仍按每回合合计 6% 截断；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 神水重潮 `mv_shenshuineigong_zhongchao` **（绝招，原创扩展命名）** | 9 | `aoe_cone {r:3,angle:60}` 六角扇形·近身 | 2.00 | 9%/—/1200 | `bf_jiansu·承·100%·2`，气势 100 | ✓ | `3.00×0.70−0.10=2.00`；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 ID | 名称 | 重 | 类型 | 数值 / 说明 |
|---|---|---:|---|---|
| `ps_shenshuineigong_shuishi` | 水势 **（原创扩展命名）** | 3 | stat | 连续命中时效果命中 +3%，最多 3 层 |
| `ps_shenshuineigong_huiliu` | 回流 **（原创扩展命名）** | 7 | trigger | 每回合首次施加 `cold` 后回复 2% 内力 |
| `ps_shenshuineigong_yuanman` | 神水圆满 **（原创扩展命名）** | 10 | mechanic | 主运时自身 `resPoison` 和 `resCold` 额外 +5 |

### 5.3 玄阶紧凑卡

**`sk_tianyishenshui` 天一神水运用**（6 玄上 · `misc/poison` · 阴 · 0.20/0.80 · `canonExpanded`）

- 出处：**（古龙·《楚留香传奇》相关案件）** 天一神水为虚构危险物；“运用”机制、招式名与安全化表现 **（原创扩展）**。`sourceChapters:[ch06_xiake]`。
- `reqs {attrs:{wis:35},skills:{poi:45,antidote:35},sect:{id:sect_shenshuigong,rank:3},prereq:[{skill:sk_shenshuihezhen,layer:5}],hard:[sect,prereq]}`；`layerStats {effHit:[1,6],effRes:[1,4]}`；`setTags:[]`。
- 招式：封匣 `mv_tianyishenshui_fengxia`（绝招，单体 2.95，`bf_zhongdu·承·40%·3`；耗内 8%、气势 100、收招 1200）；净手 `mv_tianyishenshui_jingshou`（自身 `bf_bidu·承·100%·3`）；借露 `mv_tianyishenshui_jielu`（单体 1.00，目标已中毒时 +0.15 条件）。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`
- 核算抽样：封匣 `3.00−0.10×40%=2.96→2.95`。获取：案件中完成安全保管线，`maxLayer:8`；宫中亲传至 10。

### 5.4 黄阶一行条目

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或原创标注 |
|---|---|---|---|---|---|---|---|
| `sk_shenshuihezhen` | 神水合阵 | 神水宫 | `misc/formation`，3 黄上，中性，0.50/0.50 | XK | 水域相邻友方得 `bf_yuanhu`；无伤害；`setTags:[]` | `sect rank 2; formation 15` | **（古龙·《画眉鸟》）** 据宫中守卫 **（原创扩展）** |
| `sk_shenshuizhang` | 神水宫入门掌 | 神水宫 | `unarmed/fist`，2 黄中，阴，0.70/0.30 | XK | 单体 1.00、六角横扫 0.95；`setTags:[]` | `sect rank 1` | **（古龙·《画眉鸟》）** 宫人基础掌法 **（原创扩展）** |

### 5.5 进阶链、套装与职级

- 链：`sk_shenshuihezhen` 5 重（黄）→ `sk_tianyishenshui` 6 重（玄）→ `sk_shenshuineigong`（地）。入门掌独立可学，不声明条目中不存在的 OR 来源。
- 套装候选 `legacy-set:shenshui_shenmiao`：四门均登记，主题为水域控制、避毒与叠劲。
- 可学：L1 入门掌；L2 合阵；L3 天一神水运用；L4 神水内功；L5 宫主目录，禁物仍需剧情旗标。

---

## 6. 无争山庄 `sect_wuzhengshanzhuang`

### 6.1 定位与武学总表

无争山庄家传与蝙蝠岛非法目录必须分离，边界引用 `design/17` §11.5。本文把听风与蝙蝠身法列为案件所得，不据此污名化所有山庄成员。

| ID | 名称 | 品阶 | 类别 | 性质 | 原生书界 |
|---|---|---:|---|---|---|
| `sk_wuzhengxinfa` | 无争心法 | 6 玄上 | 内功 | 调和 | XK |
| `sk_tingfengbianwei` | 听风辨位 | 6 玄上 | 杂学/心神 | 中性 | XK |
| `sk_bianfushenfa` | 蝙蝠身法 | 6 玄上 | 轻功 | 阴 | XK |
| `sk_wuzhengjian` | 无争山庄入门剑 | 3 黄上 | 兵器/剑 | 调和 | XK（XA 隐线） |

### 6.2 玄阶紧凑卡

**`sk_wuzhengxinfa` 无争心法**（6 玄上 · `inner/inner` · 调和 · 0.10/0.90 · `expanded`）

- 出处：**（古龙·《楚留香新传·蝙蝠传奇》）** 据无争山庄声望与家传背景归纳；名称、层数和机制 **（原创扩展）**。`sourceChapters:[ch06_xiake]`。
- `nature:harmony`；`reqs {attrs:{con:35,wil:35},aptitude:{apInner:30},sect:{id:sect_wuzhengshanzhuang,rank:3},prereq:[{skill:sk_wuzhengjian,layer:5}],hard:[sect,prereq]}`；`inner.contribution {mpMaxPct:20,hpMaxPct:12,attrs:{con:3,wis:2,wil:3},mpRegen:1.8}`，`IP=20+12+2×8+5×1.8=57`；`meridians:[mer_renmai,mer_dumai]`（正式 ID）；`setTags:[]`。
- 招式：止争 `mv_wuzhengxinfa_zhizheng`（自身 `bf_wenzhong·承·100%·3`）；澄心 `mv_wuzhengxinfa_chengxin`（清 1 个 `mind`）；护庄 `mv_wuzhengxinfa_huzhuang`（绝招，自身 `bf_hutizhenqi·承·100%·2`；耗内 8%、气势 100、收招 1200）。获取：山庄家传 `maxLayer:10`。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`

**`sk_tingfengbianwei` 听风辨位**（6 玄上 · `misc/mind` · 中性 · 0.35/0.65 · `expanded`）

- 出处：**（古龙·《蝙蝠传奇》）** 据原随云失明后的感知表现归纳；名称、可学化和机制 **（原创扩展命名）**，不作现实医学宣称。
- `sourceChapters:[ch06_xiake]`；`reqs {attrs:{wis:40,wil:35},sect:{id:sect_wuzhengshanzhuang,rank:3},prereq:[{skill:sk_wuzhengjian,layer:5}],hard:[prereq]}`；`layerStats {hit:[1,5],effRes:[1,5]}`（满重合计 10）；`setTags:[]`。
- 招式：听隙 `mv_tingfengbianwei_tingxi`（自身 `bf_tingfeng·承·100%·3`）；辨位 `mv_tingfengbianwei_bianwei`（可选中 5 格内隐身目标，并对其施加 `bf_poyin·承·100%·1`）；循声 `mv_tingfengbianwei_xunsheng`（绝招，单体 2.85，仅目标带 `mark` 时可用；耗内 8%、气势 100、收招 1200）。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`
- 核算抽样：循声 `3.00−0.15=2.85`，标记条件价值已预扣。获取：案件调查 / 原随云观摩，`maxLayer:8/6`；山庄合法训练只到 6 重。

**`sk_bianfushenfa` 蝙蝠身法**（6 玄上 · `movement/movement` · 阴 · 0.75/0.25 · `expanded`）

- 出处：**（古龙·《蝙蝠传奇》）** 据蝙蝠岛暗域行动 **（原创扩展命名）**。`sourceChapters:[ch06_xiake]`；`QS(6)=74`，未超过侠客书界地中 8 上限。
- `reqs {attrs:{agi:40,wis:30},aptitude:{apLight:35},prereq:[{skill:sk_tingfengbianwei,layer:5}],hard:[prereq]}`；`layerStats {eva:[1,6],hit:[1,4]}`；`setTags:[]`。
- 招式：暗翔 `mv_bianfushenfa_anxiang`（绝招，突进 3 格，无伤害，得 `bf_yinshen` 2 回合；耗内 8%、气势 100、收招 1200）；折返 `mv_bianfushenfa_zhefan`（换位 / 失败则后撤 2 格）。获取：蝙蝠岛案件 `maxLayer:10`，不作为山庄 L2 公共课。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`

### 6.3 黄阶一行条目

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或原创标注 |
|---|---|---|---|---|---|---|---|
| `sk_wuzhengjian` | 无争山庄入门剑 | 无争山庄 | `weapon/sword`，3 黄上，调和，0.75/0.25 | XK（XA 隐线） | 单体 1.00、守反 0.85；`weaponReq:{category:sword}`；`setTags:[]` | XK `sect rank 1`；XA 第一幕末剑谱互证 `sect:null,maxLayer:6` | **（古龙·《蝙蝠传奇》）** 据山庄家传背景；武学 **（原创扩展）** |

### 6.4 进阶链、套装与职级

- 链：`sk_wuzhengjian` 5 重（黄）→ `sk_tingfengbianwei` 6 重（玄）→ 案件互证 `sk_shenshuineigong`（地）；仅引用 §5.2 的同一来源覆写，不另列不同 OR 分支。
- 套装候选 `legacy-set:wuzheng_tingfeng`：四门均登记，主题为守势、感知与暗域移动。
- 可学：L1 入门剑；L2 入门剑进修；L3 无争心法 / 听风辨位；L4 案件互证；L5 庄主目录。蝙蝠身法取决于案件路线，不按职级白送。

---

## 7. 青龙会 `sect_qinglonghui`

### 7.1 定位与武学总表

青龙会是 BX–XS 多代沿用名号的网络，不把同一人延寿，见 `design/17` §11.6。为满足其覆盖低武书界的本土补齐需求，本节除三项既有候选外增八项分坛通行技，全部 **（原创扩展）**。

| ID | 名称 | 品阶 | 类别 | 性质 | 原生书界 |
|---|---|---:|---|---|---|
| `sk_qinglongcisha` | 青龙刺杀术 | 7 地下 | 兵器/奇门短兵 | 阴 | BX–XS |
| `sk_sishierduanzhen` | 四时断阵 | 6 玄上 | 杂学/阵法 | 中性 | BX–XS |
| `sk_qinglongneifa` | 青龙护心诀 | 6 玄上 | 内功 | 调和 | BX–XS |
| `sk_qinglongduanjian` | 青龙分坛短剑 | 5 玄中 | 兵器/奇门短兵 | 调和 | BX–XS |
| `sk_qinglongduanren` | 青龙短刃 | 4 玄下 | 兵器/奇门短兵 | 阴 | BX–XS |
| `sk_qinglongmihao` | 青龙密号 | 3 黄上 | 杂学/心神 | 中性 | BX–XS |
| `sk_qinglongduanda` | 青龙短打 | 3 黄上 | 拳脚/拳掌 | 阳 | BX–XS |
| `sk_qinglongtui` | 青龙扫堂腿 | 3 黄上 | 拳脚/腿 | 阳 | BX–XS |
| `sk_qinglongqinshou` | 青龙擒手 | 3 黄上 | 拳脚/擒拿 | 阴 | BX–XS |
| `sk_qinglongtuna` | 青龙吐纳 | 3 黄上 | 内功 | 调和 | BX–XS |
| `sk_qinglonghuxin` | 青龙护心功 | 2 黄中 | 内功 | 阳 | BX–XS |

### 7.2 地阶完整条目卡

#### `sk_qinglongcisha` 青龙刺杀术（7 地下 · 兵器/奇门短兵 · 青龙会）

> **出处**：**（古龙·《七种武器》等）** 据青龙会的隐秘行动归纳；“青龙刺杀术”与全部招式均 **（原创扩展命名）**。

| 字段 | 值 |
|---|---|
| `origin / sect / lineage` | `expanded` / `sect_qinglonghui` / 各代分坛刺客目录 |
| `sourceChapters` | `[ch07_bixue,ch08_luding,ch09_liancheng,ch10_baima,ch11_yuanyang,ch12_shujian,ch13_feihu,ch14_xueshan]` **（原创扩展）** |
| `nature · wOut/wIn · moveSlots` | `yin · 0.75/0.25 · 4` |
| `weaponReq` | `{category:exotic,kinds:[dagger]}` **【建议值】**；`dagger` 细类待 `design/10` 对齐 |
| `reqs` | `attrs {agi:45,wis:35}`；`aptitude {apExotic:40}`；`sect {id:sect_qinglonghui,rank:4}`；`prereq [{skill:sk_qinglongduanren,layer:6},{skill:sk_sishierduanzhen,layer:5}]`；`hard:[sect,prereq]` |
| `layerStats` | `{crit:[1,5],hit:[1,5],effHit:[1,5]}`，第 10 重合计 15，等于地阶上限 |
| 层数要点 | 1 藏刃｜3 留记｜5 断线｜7 绝招青龙一刺｜10 无声 |
| `setTags / conflicts` | `[]` / 无 |
| `special / observable` | `{fusible:true}` / `true`；没有 `special.cost`，所有招式均可单人施放 |
| 获取 | 各书界当代龙首传授 `maxLayer:10`；血雨门追查来源用 `reqsOverride:{sect:null,prereq:[{anyOf:[{skill:sk_qinglongduanren,layer:6},{skill:sk_yanluosuo,layer:6}]}],hard:[prereq]}`；脱会者线索谱 `maxLayer:6`，人物不跨代 |
| 图鉴文本 | 青龙会分坛用于标记、近身与撤离的短兵目录；武学名、招式与跨书界沿用均为原创扩展。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 藏刃 `mv_qinglongcisha_cangren` **（原创扩展命名）** | 1 | 单体·1·近身 | 1.15 | 7%/2/1000 | 背击时自身 `bf_yinshen·承·100%·1` | ✓ | `1×(1+0.24)−0.10=1.14→1.15` |
| 留记 `mv_qinglongcisha_liuji` **（原创扩展命名）** | 3 | 单体·1·近身 | 1.20 | 8%/2/1000 | `bf_suoding·承·50%·2` | ✓ | `1×(1+0.24+0.05)−0.10×50%=1.24→1.20` |
| 断线 `mv_qinglongcisha_duanxian` **（原创扩展命名）** | 5 | 单目标绕背·1·近身 | 1.10 | 8%/2/1000 | 击中后后撤 1 格 | ✓ | `1.00×(1+0.24+0.05)−0.15−0.05=1.09→1.10` |
| 封喉 `mv_qinglongcisha_fenghou` **（原创扩展命名）** | 6 | 单体·1·近身 | 1.20 | 8%/1/1100 | `bf_xueweishoufeng(level:8,acupointRef:sourcePrimary)·承·30%·1` | ✓ | `1×(1+0.12+0.05+0.07)−0.06=1.18→1.20` |
| 青龙一刺 `mv_qinglongcisha_yici` **（绝招，原创扩展命名）** | 7 | 单体·1·近身 | 2.95 | 9%/—/1200 | 目标有 `bf_suoding` 时 `bf_yishang·承·40%·2`，气势 100 | ✓ | `3.00−0.10×40%=2.96→2.95`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 ID | 名称 | 重 | 类型 | 数值 / 说明 |
|---|---|---:|---|---|
| `ps_qinglongcisha_fumai` | 伏脉 **（原创扩展命名）** | 3 | trigger | 从 `bf_yinshen` 状态出手时 Z3 +8%，随后移除潜隐 |
| `ps_qinglongcisha_mieji` | 灭迹 **（原创扩展命名）** | 7 | effect | 击倒带 `bf_suoding` 的敌人后获得 `bf_dunzou` 1 回合 |
| `ps_qinglongcisha_wusheng` | 无声 **（原创扩展命名）** | 10 | stat | 首次行动前 `hit +8, crit +5` |

### 7.3 玄阶紧凑卡

**`sk_sishierduanzhen` 四时断阵**（6 玄上 · `misc/formation` · 中性 · 0.50/0.50 · `expanded`）

- 出处：**（古龙·《七种武器》等）** 据分坛网络扩写；阵名与机制均 **（原创扩展）**，且名称刻意不宣称未经核实的堂口数。`sourceChapters:[ch07_bixue,ch08_luding,ch09_liancheng,ch10_baima,ch11_yuanyang,ch12_shujian,ch13_feihu,ch14_xueshan]`。
- `reqs {skills:{formation:35},sect:{id:sect_qinglonghui,rank:3},prereq:[{skill:sk_qinglongmihao,layer:5}],hard:[sect,prereq]}`；`layerStats {effHit:[1,5],effRes:[1,5]}`；`setTags:[]`。
- 招式：春启（相邻友方 `bf_xieli`）；夏断 `mv_sishierduanzhen_xiaduan`（绝招，单体 2.95，`bf_shiheng` 30%；耗内 8%、气势 100、收招 1200）；秋收（标记目标被击倒时回复气势）；冬伏（自身 `bf_yinshen`）。核算抽样：夏断 `3.00−0.10×30%=2.97→2.95`。招式 ID 与招名均 **（原创扩展）**。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`

**`sk_qinglongneifa` 青龙护心诀**（6 玄上 · `inner/inner` · 调和 · 0.15/0.85 · `expanded`）

- 出处：**（古龙·《七种武器》等）** 据青龙会跨代分坛网络归纳；心法名与机制 **（原创扩展）**；`sourceChapters` 同本节地阶卡。
- `nature:harmony`；`reqs {attrs:{con:30,wil:35},aptitude:{apInner:30},sect:{id:sect_qinglonghui,rank:3},prereq:[{anyOf:[{skill:sk_qinglongduanda,layer:5},{skill:sk_qinglongduanjian,layer:4}]}],hard:[sect,prereq]}`；`inner.contribution {mpMaxPct:20,hpMaxPct:12,attrs:{con:3,wis:2,wil:3},mpRegen:1.8}`，`IP=57`；`meridians:[mer_renmai,mer_dumai]`（正式 ID）；`setTags:[]`。
- 招式：护心 `mv_qinglongneifa_huxin`（绝招，自身 `bf_hutizhenqi` 2 回合；耗内 8%、气势 100、收招 1200）、潜息（自身 `bf_yinshen` 2 回合）、回气（自身 `bf_huinei` 2 回合），均无伤害；招式 ID 与招名均 **（原创扩展）**。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`

**`sk_qinglongduanjian` 青龙分坛短剑**（5 玄中 · `weapon/exotic` · 调和 · 0.75/0.25 · `expanded`）

- 出处：**（古龙·《七种武器》等）** 据青龙会分坛武备归纳；短剑在装备枚举中按 `dagger` 短兵处理，武学名与招式 **（原创扩展）**。
- `sourceChapters` 同本节地阶卡；`weaponReq:{category:exotic,kinds:[dagger]}`；`reqs {aptitude:{apExotic:25},sect:{id:sect_qinglonghui,rank:2},prereq:[{skill:sk_qinglongduanda,layer:4}],hard:[sect,prereq]}`；`layerStats {hit:[1,5],parry:[1,4]}`；`setTags:[]`。
- 招式：探路（单体 1.10）、封门（六角横扫 1.00，`bf_shiheng` 30%）、回锋（守反 1.00）。核算抽样：封门 `0.85×(1+0.24)−0.10×30%=1.024→1.00`。武学、招式均 **（原创扩展）**。

**`sk_qinglongduanren` 青龙短刃**（4 玄下 · `weapon/exotic` · 阴 · 0.80/0.20 · `expanded`）

- 出处：**（古龙·《七种武器》等）** 据青龙会隐秘行动归纳；武学名与招式 **（原创扩展）**。
- `sourceChapters` 同本节地阶卡；`weaponReq:{category:exotic,kinds:[dagger]}`；`reqs {aptitude:{apExotic:20},sect:{id:sect_qinglonghui,rank:2},prereq:[{skill:sk_qinglongqinshou,layer:4}],hard:[sect,prereq]}`；`setTags:[]`。
- 招式：近刺（单体 1.10）、割路（六角横扫 1.05）、收刃（攻击后 `bf_dunzou` 1 回合）。割路按 `0.85×(1+0.24)=1.054→1.05`；名称、机制均 **（原创扩展）**。

### 7.4 黄阶一行条目

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或原创标注 |
|---|---|---|---|---|---|---|---|
| `sk_qinglongmihao` | 青龙密号 | 青龙会 | `misc/mind`，3 黄上，中性，0.50/0.50 | BX–XS | 同伴共享目标 `bf_suoding`；无伤害；`setTags:[]` | `sect rank 1; speech 15` | **（古龙·《七种武器》等）** 据组织渗透 **（原创扩展）** |
| `sk_qinglongduanda` | 青龙短打 | 青龙会 | `unarmed/fist`，3 黄上，阳，0.85/0.15 | BX–XS | 单体 1.00、六角横扫 0.95；`setTags:[]` | `sect rank 1` | **（古龙·《七种武器》等）** 据分坛武备归纳；基础拳 **（原创扩展）** |
| `sk_qinglongtui` | 青龙扫堂腿 | 青龙会 | `unarmed/leg`，3 黄上，阳，0.90/0.10 | BX–XS | 单体 1.00、击退式 0.95；`setTags:[]` | `sect rank 1` | **（古龙·《七种武器》等）** 据分坛武备归纳；基础腿 **（原创扩展）** |
| `sk_qinglongqinshou` | 青龙擒手 | 青龙会 | `unarmed/grapple`，3 黄上，阴，0.75/0.25 | BX–XS | 单体 1.00、`bf_shiheng` 30%；`setTags:[]` | `sect rank 1` | **（古龙·《七种武器》等）** 据分坛武备归纳；基础擒拿 **（原创扩展）** |
| `sk_qinglongtuna` | 青龙吐纳 | 青龙会 | `inner/inner`，3 黄上，`nature:harmony`，0.10/0.90 | BX–XS | `IP=10+6+2×4+5×1.2=30`；`meridians:[mer_renmai]`（正式 ID）；`setTags:[]` | `sect rank 1` | **（古龙·《七种武器》等）** 据分坛网络归纳；基础吐纳 **（原创扩展）** |
| `sk_qinglonghuxin` | 青龙护心功 | 青龙会 | `inner/inner`，2 黄中，`nature:yang`，0.15/0.85 | BX–XS | `IP=8+5+2×3+5×1=24`；`meridians:[mer_dumai]`（正式 ID）；`setTags:[]` | `sect rank 1` | **（古龙·《七种武器》等）** 据分坛网络归纳；基础护心法 **（原创扩展）** |

### 7.5 进阶链、套装与职级

- 链：`sk_qinglongqinshou` 4 重（黄）→ `sk_qinglongduanren` 6 重（玄）→ `sk_qinglongcisha`（地），同时满足 `sk_qinglongmihao` 5 重（黄）→ `sk_sishierduanzhen` 5 重（玄）。分坛短剑另以 `sk_qinglongduanda` 4 重为前置，不虚写为断阵前置。
- 套装候选 `legacy-set:qinglong_ancao`：本节 11 门全部登记，主题为“眼线—密号—分坛武备—刺杀撤离”；`legacy-set:kongque_shouzhuang` 另把刺杀术与孔雀山庄守具组成敌对主题套装，成员见 §11。
- 可学：L1 六门黄阶；L2 分坛剑 / 短刃；L3 护心诀 / 四时断阵；L4 青龙刺杀术；L5 总网目录。各书界只生成当代传人。

---

## 8. 快活王一系 `sect_kuaihuowangfu`

### 8.1 定位与武学总表

“王府”只为 ID 兼容，不把柴玉关写成历史受封王爵；势力身份、XA 开放与称谓见 `design/17` §11.7。搜罗来的变招不登记成被掠门派正版传承。

| ID | 名称 | 品阶 | 类别 | 性质 | 原生书界 |
|---|---|---:|---|---|---|
| `sk_qiankunmishou` | 乾坤秘手 | 6 玄上 | 拳脚/拳掌 | 调和 | XA |
| `sk_jifengqishu` | 疾风骑术 | 6 玄上 | 轻功 | 阳 | XA |
| `sk_kuaihuozhen` | 快活城伏阵 | 6 玄上 | 杂学/阵法 | 中性 | XA |
| `sk_kuaihuojian` | 快活城入门剑 | 3 黄上 | 兵器/剑 | 调和 | XA |

### 8.2 玄阶紧凑卡

**`sk_qiankunmishou` 乾坤秘手**（6 玄上 · `unarmed/fist` · 调和 · 0.55/0.45 · `expanded`）

- 出处：**（古龙·《武林外史》）** 据柴玉关搜罗诸派武学归纳；总名、招式与混合机制 **（原创扩展）**。`sourceChapters:[ch05_xiaoao]`。
- `reqs {attrs:{wis:35,agi:30},aptitude:{apFist:30},sect:{id:sect_kuaihuowangfu,rank:3},prereq:[{skill:sk_kuaihuojian,layer:5}],hard:[sect,prereq]}`；`layerStats {hit:[1,5],parry:[1,5]}`（满重合计 10）；`setTags:[]`。
- 招式：偷梁 `mv_qiankunmishou_touliang`（单体 1.10，目标刚用拳掌时 Z3 +10%）；换柱 `mv_qiankunmishou_huanzhu`（单目标换位 1.00，`bf_shiheng` 30%）；杂揉 `mv_qiankunmishou_zarou`（绝招，六角横扫 2.25；耗内 8%、气势 100、收招 1200）。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`
- 核算抽样：换柱 `1×(1+0.12+0.05)−0.15−0.03=0.99→1.00`；杂揉按周身六格 `3.00×0.75=2.25`。获取：赃册反查 / 王府传授，`maxLayer:8/10`。

**`sk_jifengqishu` 疾风骑术**（6 玄上 · `movement/movement` · 阳 · 0.80/0.20 · `expanded`）

- 出处：**（古龙·《武林外史》）** 据快活王骑卫归纳，武学名与招式 **（原创扩展命名）**。`sourceChapters:[ch05_xiaoao]`；`QS(6)=74`。
- `reqs {attrs:{agi:35,con:30},aptitude:{apLight:30},sect:{id:sect_kuaihuowangfu,rank:2},prereq:[{skill:sk_kuaihuojian,layer:4}],hard:[sect,prereq]}`；`layerStats {eva:[1,5],mov:[0,1]}`；`setTags:[]`。
- 招式：驰突 `mv_jifengqishu_chitu`（绝招，骑乘时突进 3 格，无伤害；耗内 8%、气势 100、收招 1200）；回辔 `mv_jifengqishu_huipei`（后撤 2 格，得 `bf_dunzou` 2 回合）；下马时仅保留 80% 轻功加值。坐骑规则引用 `design/10`，本文不定义。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`

**`sk_kuaihuozhen` 快活城伏阵**（6 玄上 · `misc/formation` · 中性 · 0.55/0.45 · `expanded`）

- 出处：**（古龙·《武林外史》）** 据势力据点与部属扩写；阵名与机制均 **（原创扩展）**。`sourceChapters:[ch05_xiaoao]`。
- `reqs {skills:{formation:35},sect:{id:sect_kuaihuowangfu,rank:3},prereq:[{skill:sk_jifengqishu,layer:5}],hard:[sect,prereq]}`；`layerStats {effHit:[1,5],hit:[1,4]}`；`setTags:[]`。
- 招式：诱入（指定 `aoe_disk {r:1}` 六角圆盘七格，进入者得 `bf_suoding` 2 回合）；夹道 `mv_kuaihuozhen_jiadao`（绝招，单体 2.85，相邻友方 ≥1 时生效；耗内 8%、气势 100、收招 1200）；撤骑（相邻友方得 `bf_dunzou` 1 回合）。核算抽样：夹道 `3.00−0.15=2.85`，相邻友方条件价值已预扣。招式 ID 与招名均 **（原创扩展）**。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`

### 8.3 黄阶一行条目

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或原创标注 |
|---|---|---|---|---|---|---|---|
| `sk_kuaihuojian` | 快活城入门剑 | 快活王一系 | `weapon/sword`，3 黄上，调和，0.75/0.25 | XA | 单体 1.00、突进 1.00；`weaponReq:{category:sword}`；`setTags:[]` | `sect rank 1` | **（古龙·《武林外史》）** 据王府卫士武备归纳；剑法与招式 **（原创扩展）** |

### 8.4 进阶链、套装与职级

- 链：`sk_kuaihuojian` 5 重（黄）→ `sk_qiankunmishou` 6 重（玄）→ 大旗门和解 / 夺谱归还线以来源覆写取得 `sk_jiayishengong`（地）；来源覆写只引用 §4.2，同一任务不另建第二份前置。
- 套装候选 `legacy-set:kuaihuo_mifu`：本派四门均登记，主题为卫士剑路、骑卫诱敌、伏阵与杂揉变招。
- 可学：L1 入门剑；L2 疾风骑术；L3 乾坤秘手 / 伏阵；L4 赃册互证；L5 仅为势力权限，不授“王”号。

---

## 9. 血雨门 `sect_xueyumen`

### 9.1 定位与武学总表

血雨门的作品、LD 案件和“五殿阎罗”等考据边界见 `design/17` §11.8；后段版本问题未核定，本文不扩写掌门世系。

| ID | 名称 | 品阶 | 类别 | 性质 | 原生书界 |
|---|---|---:|---|---|---|
| `sk_yanluosuo` | 阎罗索 | 6 玄上 | 兵器/鞭索 | 阴 | LD |
| `sk_yanluosan` | 阎罗伞 | 6 玄上 | 兵器/奇门 | 调和 | LD |
| `sk_xueyuyexing` | 血雨夜行 | 3 黄上 | 轻功 | 阴 | LD |
| `sk_xueyumenquan` | 血雨门入门拳 | 2 黄中 | 拳脚/拳掌 | 阳 | LD |

### 9.2 玄阶紧凑卡

**`sk_yanluosuo` 阎罗索**（6 玄上 · `weapon/whip` · 阴 · 0.70/0.30 · `canonExpanded`）

- 出处：**（古龙·《剑·花·烟雨江南》）** 血雨门人物 / 兵刃依据见 `design/17`；招式名与机制 **（原创扩展）**，人物归属 **（待考）**。`sourceChapters:[ch08_luding]`。
- `weaponReq:{category:whip}`；`reqs {attrs:{agi:35},aptitude:{apWhip:30},sect:{id:sect_xueyumen,rank:2},prereq:[{skill:sk_xueyumenquan,layer:4}],hard:[sect,prereq]}`；`layerStats {hit:[1,5],effHit:[1,5]}`；`setTags:[]`。
- 招式：索魂 `mv_yanluosuo_suohun`（单体 1.05，`bf_shouqin(level:4,holdRange:1)` 40%）；回索 `mv_yanluosuo_huisuo`（`aoe_line n2` 1.05）；拖影 `mv_yanluosuo_tuoying`（绝招，拉拽 1 格 2.90；耗内 8%、气势 100、收招 1200）。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`
- 核算抽样：回索 `0.90×(1+0.12+0.05)=1.053→1.05`；拖影 `3.00−0.10=2.90`。获取：LD 案件战利谱 / 脱门者传授，`maxLayer:8/10`。

**`sk_yanluosan` 阎罗伞**（6 玄上 · `weapon/exotic` · 调和 · 0.65/0.35 · `canonExpanded`）

- 出处：**（古龙·《剑·花·烟雨江南》）** 兵刃名与所属细节 **（待考）**；招式和反暗器机制 **（原创扩展）**。`sourceChapters:[ch08_luding]`。
- `weaponReq:{category:exotic,kinds:[misc]}`；装备侧另标 `umbrella` 标签 **【建议值】**，在现有枚举内按奇门杂项校验；`reqs {aptitude:{apExotic:30},sect:{id:sect_xueyumen,rank:3},prereq:[{skill:sk_xueyuyexing,layer:5}],hard:[sect,prereq]}`；`layerStats {parry:[1,5],effRes:[1,5]}`；`setTags:[]`。
- 招式：开伞（自身 `bf_poanqi` 2 回合）、伞骨刺（单体 1.10）、旋面 `mv_yanluosan_xuanmian`（绝招，`aoe_around` 周身六格 2.20，`bf_shiheng` 30%；耗内 8%、气势 100、收招 1200）。核算抽样：旋面 `3.00×0.75−0.10×30%=2.22→2.20`。招式 ID 与招名均 **（原创扩展）**。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`

### 9.3 黄阶一行条目

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或原创标注 |
|---|---|---|---|---|---|---|---|
| `sk_xueyuyexing` | 血雨夜行 | 血雨门 | `movement/movement`，3 黄上，阴，0.50/0.50 | LD | 雨地获 `bf_yinshen` 1 回合；无伤害；`setTags:[]` | `sect rank 1` | **（古龙·《剑·花·烟雨江南》）** 据门名与案件 **（原创扩展）** |
| `sk_xueyumenquan` | 血雨门入门拳 | 血雨门 | `unarmed/fist`，2 黄中，阳，0.90/0.10 | LD | 单体 1.00、抢攻收招 900；`setTags:[]` | `sect rank 1` | **（古龙·《剑·花·烟雨江南》）** 门徒基础短打 **（原创扩展）** |

### 9.4 进阶链、套装与职级

- 链：`sk_xueyumenquan` 4 重（黄）→ `sk_yanluosuo` 6 重（玄）→ 青龙会追查线来源覆写取得 `sk_qinglongcisha`（地），前置 `{anyOf:[{skill:sk_yanluosuo,layer:6},{skill:sk_qinglongduanren,layer:6}]}`。
- 套装候选 `legacy-set:xueyu_yanluo`：四门均登记，主题为雨夜潜行、缠缚与伞面防御。
- 可学：L1 入门拳 / 夜行；L2 阎罗索；L3 阎罗伞；L4 跨派追查；L5 令主目录。

---

## 10. 蜀中唐门 `sect_tangmen`

### 10.1 定位与武学总表

本文只取古龙《白玉老虎》的唐门边界，见 `design/17` §11.9；不并入其他作者的唐门设定，也不提供毒物或机关的现实制作细节。

| ID | 名称 | 品阶 | 类别 | 性质 | 原生书界 |
|---|---|---:|---|---|---|
| `sk_tangmenanshou` | 唐门暗手 | 8 地中 | 暗器 | 阴 | XK |
| `sk_tangmenjieqi` | 唐门解器 | 6 玄上 | 杂学/心神 | 中性 | XK |
| `sk_tangmenbidu` | 唐门避毒诀 | 6 玄上 | 内功 | 阴 | XK |
| `sk_tangmenquanshu` | 唐门入门拳 | 3 黄上 | 拳脚/拳掌 | 调和 | XK |

### 10.2 地阶完整条目卡

#### `sk_tangmenanshou` 唐门暗手（8 地中 · 暗器 · 蜀中唐门）

> **出处**：**（古龙·《白玉老虎》）** 唐门的暗器传统有原著依据；“唐门暗手”总名、招式与连发结构 **（原创扩展命名）**。

| 字段 | 值 |
|---|---|
| `origin / sect / lineage` | `expanded` / `sect_tangmen` / 唐门暗器房亲传 |
| `sourceChapters` | `[ch06_xiake]` **（原创扩展）** |
| `nature · wOut/wIn · moveSlots` | `yin · 0.70/0.30 · 4` |
| `weaponReq` | 暗器栏与弹药，引用 `design/10`；不使用主手兵器 |
| `reqs` | `attrs {agi:45,wis:40}`；`aptitude {apHidden:45}`；`skills {forge:35,poi:25}`；`sect {id:sect_tangmen,rank:4}`；`prereq [{skill:sk_tangmenjieqi,layer:6},{skill:sk_tangmenbidu,layer:5}]`；`hard:[sect,prereq]` |
| `layerStats` | `{hit:[1,5],crit:[1,5],effHit:[1,5]}`，第 10 重合计 15，等于地阶上限 |
| 层数要点 | 1 藏手｜3 连星｜5 破器｜6 追星（普通招）｜7 绝招暴雨连星｜10 无痕 |
| `setTags / conflicts` | `[]` / 无 |
| `special / observable` | `{fusible:true}` / `true`；消耗普通弹药，但没有 `special.cost`，不属 §9.1 主动代价型 |
| 获取 | XK 暗器房传授 `maxLayer:10`；案件观摩 `maxLayer:6`，具体弹药归 `design/10` |
| 图鉴文本 | 以藏器、识器和短时连发构成的唐门暗器目录；名称与机制为原创扩展，不含现实制作方法。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 藏手 `mv_tangmenanshou_cangshou` **（原创扩展命名）** | 1 | 单体·2–5·投射 | 1.05 | 7%/2/1000 | 命中后自身 `bf_dunzou·承·100%·1` | ✓ | `1×(1+0.24)×0.92−0.10=1.041→1.05` |
| 连星 `mv_tangmenanshou_lianxing` **（原创扩展命名）** | 3 | 连锁 2 目标·2–5·投射 | 1.20（次目标 ×0.8=0.96） | 8%/2/1000 | `aoe_chain n1` | ✓ | 首段按 N=1：`1.00×(1+0.24+0.05)×0.92=1.1868→1.20`；次段再 ×0.8 |
| 破器 `mv_tangmenanshou_poqi` **（原创扩展命名）** | 5 | 单体·2–4·投射 | 1.10 | 8%/2/1000 | `bf_jiaoxie·承·40%·1` | ✓ | `1×(1+0.24+0.05)×0.92−0.20×40%=1.107→1.10` |
| 追星 `mv_tangmenanshou_zhuixing`（普通招，**原创扩展命名**） | 6 | `aoe_line n3`·1–3·投射 | 1.05 | 8%/2/900 | 仅首目标带 `bf_suoding` 时可用（预算条件 +0.15，不再叠加 Z3） | ✓ | N=3、AF=0.85；`0.85×(1+0.24+0.05−0.07+0.15)×0.92=1.071→1.05`；`MoveDef{unlock:6; ultimate:false; rageCost:0; mpCost:8%; cd:2; recovery:900}` |
| 暴雨连星 `mv_tangmenanshou_baoyu` **（绝招，原创扩展命名）** | 7 | `aoe_disk {r:1}` 六角圆盘七格·2–5·投射 | 1.90 | 9%/—/1200 | `bf_zhongdu·承·35%·3`，气势 100 | ✓ | `3.00×0.70×0.92−0.10×35%=1.897→1.90`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 ID | 名称 | 重 | 类型 | 数值 / 说明 |
|---|---|---:|---|---|
| `ps_tangmenanshou_shiqi` | 识器 **（原创扩展命名）** | 3 | stat | 暗器与机关效果命中 +5→+10 |
| `ps_tangmenanshou_shouqi` | 收器 **（原创扩展命名）** | 7 | trigger | 每场首次暗器未命中，返还该枚普通弹药 |
| `ps_tangmenanshou_wuhen` | 无痕 **（原创扩展命名）** | 10 | effect | 从 `bf_yinshen` 出手的首发 Z3 +10% |

### 10.3 玄阶紧凑卡

**`sk_tangmenjieqi` 唐门解器**（6 玄上 · `misc/mind` · 中性 · 0.30/0.70 · `expanded`）

- 出处：**（古龙·《白玉老虎》）** 据唐门制器传统归纳；名称、拆解动作均 **（原创扩展）**，不含危险制作说明。`sourceChapters:[ch06_xiake]`。
- 因 `design/05` 无“机关”杂学子类，暂用 `misc/mind`；`reqs {attrs:{wis:40},skills:{forge:45},sect:{id:sect_tangmen,rank:3},prereq:[{skill:sk_tangmenquanshu,layer:5}],hard:[sect,prereq]}`；`layerStats {effHit:[1,5],effRes:[1,5]}`（满重合计 10）；`setTags:[]`。
- 招式：验簧（揭示机关）、卸机（停用一个已揭示机关，不施加 Buff）、反扣 `mv_tangmenjieqi_fankou`（绝招，单体 2.85，仅对机关敌人可用；耗内 8%、气势 100、收招 1200）。核算抽样：反扣 `3.00−0.15=2.85`，机关条件价值已预扣。招式 ID 与招名均 **（原创扩展）**。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`

**`sk_tangmenbidu` 唐门避毒诀**（6 玄上 · `inner/inner` · 阴 · 0.10/0.90 · `expanded`）

- 出处：**（古龙·《白玉老虎》）** 据唐门毒药环境归纳，武学名与机制 **（原创扩展）**；不写配方。`sourceChapters:[ch06_xiake]`。
- `nature:yin`；`reqs {attrs:{con:30,wis:35},aptitude:{apInner:30},skills:{antidote:35},sect:{id:sect_tangmen,rank:2},prereq:[{skill:sk_tangmenquanshu,layer:4}],hard:[sect,prereq]}`；`inner.contribution {mpMaxPct:20,hpMaxPct:12,attrs:{con:3,wis:3,wil:2},mpRegen:1.8}`，`IP=57`；`meridians:[mer_shoutaiyin,mer_renmai]`（正式 ID）；`setTags:[]`。
- 招式：避毒（自身 `bf_bidu` 3 回合）、清秽（驱散 1 层 `poison`）、守脉 `mv_tangmenbidu_shoumai`（绝招，自身 `bf_shouyi` 2 回合；耗内 8%、气势 100、收招 1200），均无伤害；招式 ID 与招名均 **（原创扩展）**。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`

### 10.4 黄阶一行条目

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或原创标注 |
|---|---|---|---|---|---|---|---|
| `sk_tangmenquanshu` | 唐门入门拳 | 蜀中唐门 | `unarmed/fist`，3 黄上，调和，0.75/0.25 | XK | 单体 1.00、护器架势；`setTags:[]` | `sect rank 1` | **（古龙·《白玉老虎》）** 外院基础训练 **（原创扩展）** |

### 10.5 进阶链、套装与职级

- 链：`sk_tangmenquanshu` 5 重（黄）→ `sk_tangmenjieqi` 6 重（玄）＋`sk_tangmenbidu` 5 重（玄）→ `sk_tangmenanshou`（地）。
- 套装候选 `legacy-set:tangmen_qiaoji`：四门均登记，主题为识器、避毒与暗器连发。
- 可学：L1 入门拳；L2 避毒诀；L3 解器；L4 唐门暗手；L5 家主秘库，实体机关与毒物仍受剧情锁。

---

## 11. 孔雀山庄 `sect_kongqueshanzhuang`

### 11.1 定位与武学总表

孔雀翎是不可量产的剧情名器，保管权不随职级发放；组织、BX / LD 开放与称谓见 `design/17` §11.10。技能只定义机发操作接口，实体与弹药归 `design/10`。

| ID | 名称 | 品阶 | 类别 | 性质 | 原生书界 |
|---|---|---:|---|---|---|
| `sk_kongquelingfa` | 孔雀翎机发 | 9 地上 | 暗器 | 调和 | BX、LD |
| `sk_kongquezhen` | 孔雀守庄阵 | 6 玄上 | 杂学/阵法 | 中性 | BX、LD |
| `sk_qiushiqinggong` | 秋氏轻功 | 3 黄上 | 轻功 | 调和 | BX、LD |
| `sk_kongquejian` | 孔雀山庄入门剑 | 3 黄上 | 兵器/剑 | 调和 | BX、LD |

### 11.2 地阶完整条目卡

#### `sk_kongquelingfa` 孔雀翎机发（9 地上 · 暗器 · 孔雀山庄）

> **出处**：**（古龙·《七种武器·孔雀翎》）** 孔雀翎名器与秋凤梧相关；机括流程、招式名及数值均 **（原创扩展）**。不得据本技能另造天级装备。

| 字段 | 值 |
|---|---|
| `origin / sect / lineage` | `canonExpanded` / `sect_kongqueshanzhuang` / 秋氏保管人与合资格庄主 |
| `sourceChapters` | `[ch07_bixue,ch08_luding]` **（原创扩展）** |
| `nature · wOut/wIn · moveSlots` | `harmony · 0.65/0.35 · 4` |
| `weaponReq` | 暗器栏；另需剧情装备 `eq_kongqueling` **【建议值】** 与当场装填；每场至多机发攻击一次（四个攻击招式共用，落实 17 的一次性扇域建议），实体规则归 `design/10` |
| `reqs` | `attrs {agi:50,wis:50,wil:45}`；`aptitude {apHidden:50}`；`skills {forge:35}`；`sect {id:sect_kongqueshanzhuang,rank:4}`；`prereq [{skill:sk_kongquezhen,layer:6}]`；`hard:[sect,prereq]` |
| `layerStats` | `{hit:[1,5],crit:[1,5],effHit:[1,5]}`，第 10 重合计 15，等于地阶上限 |
| 层数要点 | 1 验翎｜3 展屏｜5 回护｜7 绝招收屏｜9 绝招孔雀开屏｜10 守心 |
| `setTags / conflicts` | `[]` / 无 |
| `special / observable` | `{fusible:false}` / `true`；名器门槛由 `weaponReq` / 招式条件检查；耗剧情弹药但没有 `special.cost`，非 §9.1 代价型 |
| 获取 | BX / LD 守庄线取得“使用资格”至 10 重；无名器时仅机发攻击招式锁定；数值被动按 50% 生效、触发被动的触发率乘 50%，守心因未装填而不触发 **（原创扩展）** |
| 图鉴文本 | 孔雀山庄名器的辨识、机发与掩护操作；技能不复制名器，机制均为原创扩展。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 验翎 `mv_kongquelingfa_yanling` **（原创扩展命名）** | 1 | 自身·支援 | 0 | 7%/2/900 | `bf_jingzhun·承·100%·2` | — | 功能核对：单体自身增益、基准耗内、cd 2，不转伤害 |
| 展屏 `mv_kongquelingfa_zhanping` **（原创扩展命名）** | 3 | `aoe_cone {r:3,angle:60}` 六角扇形·1–3·投射 | 0.85 | 8%/3/1000 | `bf_shiheng·承·35%·2` | ✓ | `0.70×(1+0.36+0.05)×0.92−0.10×35%=0.873→0.85` |
| 回护 `mv_kongquelingfa_huihu` **（原创扩展命名）** | 5 | `aoe_disk {r:1}` 六角圆盘七格·2–4·投射 | 0.85 | 8%/3/1100 | 一名相邻友方得 `bf_yuanhu·承·100%·1` | ✓ | `0.70×(1+0.36+0.05+0.07)×0.92−0.10=0.853→0.85` |
| 收屏 `mv_kongquelingfa_shouping`（绝招，**原创扩展命名**） | 7 | 单体·2–4·投射 | 2.65 | 9%/—/1200 | 命中后自身 `bf_dunzou·承·100%·1`；气势 100 | ✓ | `3.00×0.92−0.10=2.66→2.65`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 孔雀开屏 `mv_kongquelingfa_kaiping` **（绝招，原创扩展命名）** | 9 | `aoe_cone {r:3,angle:60}` 六角扇形·1–3·投射 | 1.90 | 9%/—/1200 | `bf_yishang·承·35%·2`，气势 100 | ✓ | `3.00×0.70×0.92−0.10×35%=1.897→1.90`；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 ID | 名称 | 重 | 类型 | 数值 / 说明 |
|---|---|---:|---|---|
| `ps_kongquelingfa_shouqi` | 守器 **（原创扩展命名）** | 3 | stat | 机关 / 暗器效果抗性 +5→+10 |
| `ps_kongquelingfa_huxin` | 护心 **（原创扩展命名）** | 7 | trigger | 每场首次被近战命中后得 `bf_dunzou` 1 回合 |
| `ps_kongquelingfa_shouxin` | 守心 **（原创扩展命名）** | 10 | mechanic | 名器装填后未发射时，自身不可被缴械；不阻止剧情夺取 |

### 11.3 玄阶紧凑卡

**`sk_kongquezhen` 孔雀守庄阵**（6 玄上 · `misc/formation` · 中性 · 0.45/0.55 · `expanded`）

- 出处：**（古龙·《孔雀翎》）** 据山庄防御扩写；阵名与机制 **（原创扩展）**。`sourceChapters:[ch07_bixue,ch08_luding]`。
- `reqs {skills:{formation:35,forge:20},sect:{id:sect_kongqueshanzhuang,rank:3},prereq:[{skill:sk_kongquejian,layer:5}],hard:[sect,prereq]}`；`layerStats {parry:[1,5],effRes:[1,5]}`；`setTags:[]`。
- 招式：列屏（相邻友方 `bf_yuanhu` 2 回合）、闭门 `mv_kongquezhen_bimen`（绝招，单体 2.95，`bf_suoding` 30%；耗内 8%、气势 100、收招 1200）、护匣（目标友方 `bf_poanqi` 2 回合）。核算抽样：闭门 `3.00−0.10×30%=2.97→2.95`。招式 ID 与招名均 **（原创扩展）**。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`

### 11.4 黄阶一行条目

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或原创标注 |
|---|---|---|---|---|---|---|---|
| `sk_qiushiqinggong` | 秋氏轻功 | 孔雀山庄 | `movement/movement`，3 黄上，调和，0.50/0.50 | BX、LD | 掩护后撤、得 `bf_dunzou` 1 回合；`setTags:[]` | `sect rank 1` | **（古龙·《孔雀翎》）** 据秋凤梧行动 **（原创扩展命名）** |
| `sk_kongquejian` | 孔雀山庄入门剑 | 孔雀山庄 | `weapon/sword`，3 黄上，调和，0.75/0.25 | BX、LD | 单体 1.00、守反 0.85；`weaponReq:{category:sword}`；`setTags:[]` | `sect rank 1` | **（古龙·《七种武器·孔雀翎》）** 山庄护院剑 **（原创扩展）** |

### 11.5 进阶链、套装与职级

- 链：`sk_kongquejian` 5 重（黄）→ `sk_kongquezhen` 6 重（玄）→ `sk_kongquelingfa`（地）。
- 套装候选 `legacy-set:kongque_shouzhuang`：本派四门与 `sk_qinglongcisha` 均登记，主题为守庄者与来犯者的攻防镜像；规则不赋予第二件孔雀翎。
- 可学：L1 入门剑 / 秋氏轻功；L2 基础目录进修；L3 守庄阵；L4 机发资格；L5 庄主目录，名器保管另受剧情锁。

---

## 12. 金钱帮 `sect_jinqianbang`

### 12.1 定位与武学总表

金钱帮的上官金虹、荆无命及 XK 开放见 `design/17` §11.11；财富、武力和职级分开，不允许直接买到 L4 / L5。

| ID | 名称 | 品阶 | 类别 | 性质 | 原生书界 |
|---|---|---:|---|---|---|
| `sk_longfengshuanghuan` | 龙凤双环 | 9 地上 | 兵器/奇门 | 调和 | XK |
| `sk_jingwumingkuaijian` | 无命快剑 | 6 玄上 | 兵器/剑 | 阴 | XK |
| `sk_jinqianluodi` | 金钱落地阵 | 3 黄上 | 杂学/阵法 | 中性 | XK |
| `sk_jinqianbangquan` | 金钱帮入门拳 | 3 黄上 | 拳脚/拳掌 | 阳 | XK |

### 12.2 地阶完整条目卡

#### `sk_longfengshuanghuan` 龙凤双环（9 地上 · 兵器/奇门 · 金钱帮）

> **出处**：**（古龙·《多情剑客无情剑》）** 上官金虹的龙凤双环有原著依据；本文招式名与战术结构 **（原创扩展）**。

| 字段 | 值 |
|---|---|
| `origin / sect / lineage` | `canonExpanded` / `sect_jinqianbang` / 上官金虹个人传承；常规帮众不得自动取得 |
| `sourceChapters` | `[ch06_xiake]` **（原创扩展）** |
| `nature · wOut/wIn · moveSlots` | `harmony · 0.60/0.40 · 4` |
| `weaponReq` | `{category:exotic,kinds:[misc]}`；装备侧另标 `ring` 标签 **【建议值】**；双环是同一兵器套，不要求左右互搏 `dualWield` |
| `reqs` | `attrs {str:45,agi:45,wis:40}`；`aptitude {apExotic:50}`；`sect {id:sect_jinqianbang,rank:4}`；`prereq [{skill:sk_jingwumingkuaijian,layer:6}]`；`hard:[sect,prereq]` |
| `layerStats` | `{hit:[1,5],parry:[1,5],effHit:[1,5]}`，第 10 重合计 15，等于地阶上限 |
| 层数要点 | 1 龙行｜3 凤锁｜5 双环闭路｜7 绝招回环｜9 绝招双环绝域｜10 圆转 |
| `setTags / conflicts` | `[]` / 无 |
| `special / observable` | `{fusible:true}` / `true`；双环成套主武器不产生未定义的 `dualWieldRequired` 字段 |
| 获取 | XK 上官金虹个人事件 / 帮会秘谱，`maxLayer:10/7` **（原创扩展）** |
| 图鉴文本 | 以双环的封锁、回旋与短距压迫表现上官金虹绝技；具体招式和数值为原创扩展。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 龙行 `mv_longfengshuanghuan_longxing` **（原创扩展命名）** | 1 | 单体·1–2·近身 | 1.15 | 8%/1/1000 | 无 | ✓ | `1×(1+0.12+0.05)=1.17→1.15` |
| 凤锁 `mv_longfengshuanghuan_fengsuo` **（原创扩展命名）** | 3 | 单体·1–2·近身 | 1.20 | 8%/2/1000 | `bf_suoding·承·50%·2` | ✓ | `1×(1+0.24+0.05)−0.10×50%=1.24→1.20` |
| 双环闭路 `mv_longfengshuanghuan_bilu` **（原创扩展命名）** | 5 | `aoe_around` 周身六格·近身 | 1.00 | 8%/3/1000 | `bf_shiheng·承·40%·2` | ✓ | `0.75×(1+0.36+0.05)−0.10×40%=1.0175→1.00` |
| 回环 `mv_longfengshuanghuan_huihuan`（绝招，**原创扩展命名**） | 7 | `aoe_boomerang n3`，每程最多 3 格·近身 | 1.20/程 | 9%/—/1200 | 回程命中后自身 `bf_wenzhong·承·100%·1`；气势 100 | ✓ | 每程 N=3，两程按总预算均摊：`(3.00×0.85−0.10)÷2=1.225→1.20`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 双环绝域 `mv_longfengshuanghuan_jueyu` **（绝招，原创扩展命名）** | 9 | `aoe_around` 周身六格·近身 | 2.05 | 9%/—/1200 | `bf_jiaoxie·承·45%·2`，气势 100 | ✓ | `3.00×0.75−0.20×45%×2=2.07→2.05`；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 ID | 名称 | 重 | 类型 | 数值 / 说明 |
|---|---|---:|---|---|
| `ps_longfengshuanghuan_fenglu` | 封路 **（原创扩展命名）** | 3 | trigger | 招架成功后目标移动消耗 +1，持续 1 回合 |
| `ps_longfengshuanghuan_huansuo` | 环锁 **（原创扩展命名）** | 7 | effect | 对带 `bf_suoding` 目标 Z3 +10% |
| `ps_longfengshuanghuan_yuanzhuan` | 圆转 **（原创扩展命名）** | 10 | stat | 双环类招式招架 +8、效果抗性 +5 |

### 12.3 玄阶紧凑卡

**`sk_jingwumingkuaijian` 无命快剑**（6 玄上 · `weapon/sword` · 阴 · 0.85/0.15 · `expanded`）

- 出处：**（古龙·《多情剑客无情剑》）** 据荆无命剑术归纳；武学名、招式名 **（原创扩展命名）**。`sourceChapters:[ch06_xiake]`。
- `weaponReq:{category:sword}`；`reqs {attrs:{agi:40,wil:35},aptitude:{apSword:35},sect:{id:sect_jinqianbang,rank:3},prereq:[{skill:sk_jinqianbangquan,layer:5}],hard:[prereq]}`；`layerStats {hit:[1,5],crit:[1,5]}`（满重合计 10）；`setTags:[]`。
- 招式：无声（单体 1.15，收招 800）、抢线（突进 2 格 1.00）、绝回 `mv_jingwumingkuaijian_juehui`（绝招，HP≤40% 时单体 3.30；耗内 8%、气势 100、收招 1200）。核算抽样：抢线 `1×(1+0.12)−0.10=1.02→1.00`；绝回 `3.00+0.30=3.30`。招式 ID 与招名均 **（原创扩展命名）**。获取：荆无命事件 `maxLayer:10`；观摩 6。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`

### 12.4 黄阶一行条目

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或原创标注 |
|---|---|---|---|---|---|---|---|
| `sk_jinqianluodi` | 金钱落地阵 | 金钱帮 | `misc/formation`，3 黄上，中性，0.50/0.50 | XK | 相邻敌人 `bf_shiheng` 30%；无伤害；`setTags:[]` | `sect rank 2; formation 15` | **（古龙·《多情剑客无情剑》）** 据帮会包围 **（原创扩展）** |
| `sk_jinqianbangquan` | 金钱帮入门拳 | 金钱帮 | `unarmed/fist`，3 黄上，阳，0.90/0.10 | XK | 单体 1.00、六角横扫 0.95；`setTags:[]` | `sect rank 1` | **（古龙·《多情剑客无情剑》）** 帮众基础短打 **（原创扩展）** |

### 12.5 进阶链、套装与职级

- 链：`sk_jinqianbangquan` 5 重（黄）→ `sk_jingwumingkuaijian` 6 重（玄）→ `sk_longfengshuanghuan`（地）；资质不同者走来源覆写，不要求拳法资质替代剑 / 奇门资质。
- 套装候选 `legacy-set:jinqian_juesu`：本派四门均登记，主题为落地包围、快剑抢先与双环封锁。
- 可学：L1 入门拳；L2 落地阵；L3 快剑事件；L4 双环秘传；L5 帮主目录，银两不能替代条件。

---

## 13. 神剑山庄 `sect_shenjianshanzhuang`

### 13.1 定位与武学总表

谢晓峰是谢家三少爷，“三少爷”不是固定职级；燕十三的剑道也不并入山庄目录。边界、XK 开放与称谓见 `design/17` §11.12。

| ID | 名称 | 品阶 | 类别 | 性质 | 原生书界 |
|---|---|---:|---|---|---|
| `sk_shenjianwuwang` | 神剑无妄 | 9 地上 | 兵器/剑 | 调和 | XK |
| `sk_xiejiajianlu` | 谢家剑路 | 6 玄上 | 兵器/剑 | 调和 | XK |
| `sk_cuiyunbu` | 翠云步 | 3 黄上 | 轻功 | 调和 | XK |
| `sk_shenjianrumenjian` | 神剑山庄入门剑 | 3 黄上 | 兵器/剑 | 调和 | XK |

### 13.2 地阶完整条目卡

#### `sk_shenjianwuwang` 神剑无妄（9 地上 · 兵器/剑 · 神剑山庄）

> **出处**：**（古龙·《三少爷的剑》）** 据谢晓峰剑道归纳；武学总名、招式名及机制均 **（原创扩展命名）**，不宣称是原著秘籍。

| 字段 | 值 |
|---|---|
| `origin / sect / lineage` | `expanded` / `sect_shenjianshanzhuang` / 谢晓峰个人印证 → 谢家合资格剑师 |
| `sourceChapters` | `[ch06_xiake]` **（原创扩展）** |
| `nature · wOut/wIn · moveSlots` | `harmony · 0.70/0.30 · 4` |
| `weaponReq` | `{category:sword}` |
| `reqs` | `attrs {agi:50,wis:50,wil:45}`；`aptitude {apSword:50}`；`sect {id:sect_shenjianshanzhuang,rank:4}`；`prereq [{skill:sk_xiejiajianlu,layer:6}]`；`hard:[sect,prereq]` |
| `layerStats` | `{hit:[1,5],parry:[1,5],crit:[1,5]}`，第 10 重合计 15，等于地阶上限 |
| 层数要点 | 1 观隙｜3 破妄｜5 无住｜7 绝招返照｜9 绝招无妄一剑｜10 返真 |
| `setTags / conflicts` | `[]` / 无 |
| `special / observable` | `{fusible:true}` / `true` |
| 获取 | XK 谢晓峰论剑印证 `maxLayer:10`；谢家剑师传授 `maxLayer:7` **（原创扩展）** |
| 图鉴文本 | 以观隙、识破与克制虚招表现谢晓峰剑道；总名、招式和数值均为原创扩展。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 观隙 `mv_shenjianwuwang_guanxi` **（原创扩展命名）** | 1 | 单体·1·近身 | 1.05 | 8%/1/1000 | `bf_dongxi·承·100%·2` 施于自身 | ✓ | `1×(1+0.12+0.05)−0.10=1.07→1.05` |
| 破妄 `mv_shenjianwuwang_powang` **（原创扩展命名）** | 3 | 单体·1·近身 | 1.20 | 8%/2/1000 | 清目标 1 个 `stance` 增益 | ✓ | `1×(1+0.24+0.05)−0.10=1.19→1.20` |
| 无住 `mv_shenjianwuwang_wuzhu` **（原创扩展命名）** | 5 | 突进·2·近身 | 1.15 | 8%/2/1000 | `bf_pozhao·承·40%·2` | ✓ | `1×(1+0.24+0.05)−0.10−0.04=1.15` |
| 返照 `mv_shenjianwuwang_fanzhao`（绝招，**原创扩展命名**） | 7 | 单体·1·近身 | 2.85 | 9%/—/1200 | 目标有 `stance` 时可用；气势 100 | ✓ | `3.00−0.15=2.85`；条件收益按绝招预算预扣；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 无妄一剑 `mv_shenjianwuwang_yijian` **（绝招，原创扩展命名）** | 9 | 单体·1·近身 | 2.95 | 9%/—/1200 | `bf_pozhao·承·60%·1`，气势 100 | ✓ | `3.00−0.10×60%=2.94→2.95`；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 ID | 名称 | 重 | 类型 | 数值 / 说明 |
|---|---|---:|---|---|
| `ps_shenjianwuwang_jianwei` | 见微 **（原创扩展命名）** | 3 | stat | 对带 `stance` 的目标命中 +8 |
| `ps_shenjianwuwang_fanpu` | 返朴 **（原创扩展命名）** | 7 | effect | 无自身增益时 Z3 +8% |
| `ps_shenjianwuwang_fanzhen` | 返真 **（原创扩展命名）** | 10 | trigger | 每回合首次成功招架，获得 `bf_dongxi` 1 回合 |

### 13.3 玄阶紧凑卡

**`sk_xiejiajianlu` 谢家剑路**（6 玄上 · `weapon/sword` · 调和 · 0.75/0.25 · `expanded`）

- 出处：**（古龙·《三少爷的剑》）** 据谢晓峰与谢家剑道归纳；总名、招式 **（原创扩展命名）**。`sourceChapters:[ch06_xiake]`。
- `weaponReq:{category:sword}`；`reqs {aptitude:{apSword:35},sect:{id:sect_shenjianshanzhuang,rank:3},prereq:[{skill:sk_shenjianrumenjian,layer:5}],hard:[sect,prereq]}`；`layerStats {hit:[1,5],parry:[1,5]}`（满重合计 10）；`setTags:[]`。
- 招式：翠云起（单体 1.10）、绿水回（六角横扫 1.05）、变路 `mv_xiejiajianlu_bianlu`（绝招，单目标换位 2.85；耗内 8%、气势 100、收招 1200）。核算抽样：绿水回 `0.85×(1+0.24)=1.054→1.05`；变路 `3.00−0.15=2.85`。招式 ID 与招名均 **（原创扩展命名）**。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`

### 13.4 黄阶一行条目

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或原创标注 |
|---|---|---|---|---|---|---|---|
| `sk_cuiyunbu` | 翠云步 | 神剑山庄 | `movement/movement`，3 黄上，调和，0.50/0.50 | XK | 山地换位、得 `bf_youshi` 1 回合；`setTags:[]` | `sect rank 1` | **（古龙·《三少爷的剑》）** 据翠云峰意象 **（原创扩展命名）** |
| `sk_shenjianrumenjian` | 神剑山庄入门剑 | 神剑山庄 | `weapon/sword`，3 黄上，调和，0.80/0.20 | XK | 单体 1.00、守反 0.85；`weaponReq:{category:sword}`；`setTags:[]` | `sect rank 1` | **（古龙·《三少爷的剑》）** 谢家基础剑路 **（原创扩展）** |

### 13.5 进阶链、套装与职级

- 链：`sk_shenjianrumenjian` 5 重（黄）→ `sk_xiejiajianlu` 6 重（玄）→ `sk_shenjianwuwang`（地）。
- 套装候选 `legacy-set:shenjian_wangfan`：本派四门均登记，主题为翠云入门、变路、观隙与返真。
- 可学：L1 入门剑 / 翠云步；L2 入门目录全开；L3 谢家剑路；L4 神剑无妄；L5 庄主目录，“三少爷”不作职级名。

---

## 14. 万梅山庄 `sect_wanmeishanzhuang`

### 14.1 定位与武学总表

西门吹雪与万梅山庄相连，但稳定弟子体系仍 **（待考）**；因此本文把目录作为本作剑侍支线，不反推原著广收门徒。边界见 `design/17` §11.13。

| ID | 名称 | 品阶 | 类别 | 性质 | 原生书界 |
|---|---|---:|---|---|---|
| `sk_ximenjiandao` | 西门剑道 | 9 地上 | 兵器/剑 | 阴 | BX |
| `sk_wanmeixinjing` | 万梅静境 | 6 玄上 | 杂学/心神 | 中性 | BX |
| `sk_taxuemeibu` | 踏雪梅步 | 3 黄上 | 轻功 | 阴 | BX |
| `sk_wanmeijian` | 万梅入门剑 | 3 黄上 | 兵器/剑 | 阴 | BX |

### 14.2 地阶完整条目卡

#### `sk_ximenjiandao` 西门剑道（9 地上 · 兵器/剑 · 万梅山庄）

> **出处**：**（古龙·《陆小凤传奇》系列）** 西门吹雪的剑道有原著依据；“西门剑道”是本文归纳名，招式名和数值 **（原创扩展）**，不是原著秘籍。

| 字段 | 值 |
|---|---|
| `origin / sect / lineage` | `expanded` / `sect_wanmeishanzhuang` / 西门吹雪个人印证 |
| `sourceChapters` | `[ch07_bixue]` **（原创扩展）** |
| `nature · wOut/wIn · moveSlots` | `yin · 0.80/0.20 · 4` |
| `weaponReq` | `{category:sword}` |
| `reqs` | `attrs {agi:55,wil:55}`；`aptitude {apSword:55}`；`sect {id:sect_wanmeishanzhuang,rank:4}`；`prereq [{skill:sk_wanmeixinjing,layer:6}]`；`hard:[sect,prereq]` |
| `layerStats` | `{hit:[1,5],crit:[1,5],parry:[1,5]}`，第 10 重合计 15，等于地阶上限 |
| 层数要点 | 1 净剑｜3 寒锋｜5 一线｜7 绝招映雪｜9 绝招一剑西来｜10 无垢 |
| `setTags / conflicts` | `[set_baiyun_juezhan]` / 无 |
| `special / observable` | `{fusible:false}` / `true` |
| 获取 | BX 西门吹雪论剑印证，`maxLayer:10`；剑侍目录只到 6 重 **（原创扩展）** |
| 图鉴文本 | 西门吹雪个人剑道的玩法归纳，以专注、先手和单点决胜为核心；名称与招式为原创扩展。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 净剑 `mv_ximenjiandao_jingjian` **（原创扩展命名）** | 1 | 单体·1·近身 | 1.15 | 8%/1/1000 | 自身无负面时 Z3 +10% | ✓ | `1×(1+0.12+0.05)=1.17→1.15` |
| 寒锋 `mv_ximenjiandao_hanfeng` **（原创扩展命名）** | 3 | 单体·1·近身 | 1.25 | 8%/2/1000 | `bf_zhenshe·承·30%·1` | ✓ | `1×(1+0.24+0.05)−0.10×30%=1.26→1.25` |
| 一线 `mv_ximenjiandao_yixian` **（原创扩展命名）** | 5 | 突进·3·近身 | 1.15 | 8%/2/1000 | `bf_pozhao·承·40%·2` | ✓ | `1×(1+0.24+0.05)−0.10−0.04=1.15` |
| 映雪 `mv_ximenjiandao_yingxue`（绝招，**原创扩展命名**） | 7 | `aoe_line n2`·近身 | 2.30 | 9%/—/1200 | 首目标无增益时可用；气势 100 | ✓ | N=2、AF=0.90；`3.00×0.90−0.15=2.55`，直线覆盖手调 −0.25 → 2.30；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 一剑西来 `mv_ximenjiandao_xilai` **（绝招，原创扩展命名）** | 9 | 单体·1·近身 | 2.95 | 9%/—/1200 | `bf_yishang·承·35%·2`，气势 100 | ✓ | `3.00−0.10×35%=2.965→2.95`；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 ID | 名称 | 重 | 类型 | 数值 / 说明 |
|---|---|---:|---|---|
| `ps_ximenjiandao_jiejing` | 洁净 **（原创扩展命名）** | 3 | stat | 无负面状态时命中 +8 |
| `ps_ximenjiandao_gufeng` | 孤锋 **（原创扩展命名）** | 7 | effect | 目标周围无其友军时 Z3 +10% |
| `ps_ximenjiandao_wugou` | 无垢 **（原创扩展命名）** | 10 | trigger | 每场首次被施加 `mind` 状态时自动抵消 |

### 14.3 玄阶紧凑卡

**`sk_wanmeixinjing` 万梅静境**（6 玄上 · `misc/mind` · 中性 · 0.20/0.80 · `expanded`）

- 出处：**（古龙·《陆小凤传奇》系列）** 据西门吹雪生活与剑道归纳；名称、机制 **（原创扩展）**。`sourceChapters:[ch07_bixue]`。
- `reqs {attrs:{wil:40,wis:35},sect:{id:sect_wanmeishanzhuang,rank:3},prereq:[{skill:sk_wanmeijian,layer:5}],hard:[prereq]}`；`layerStats {hit:[1,5],effRes:[1,5]}`（满重合计 10）；`setTags:[]`。
- 招式：观梅（自身 `bf_dingxin` 3 回合）、洗剑（清 1 个 `mind`）、静候 `mv_wanmeixinjing_jinghou`（绝招，架势；下次剑招 `bf_jingzhun` 1 回合；耗内 8%、气势 100、收招 1200），无伤害；招式 ID 与招名均 **（原创扩展）**。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`

### 14.4 黄阶一行条目

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或原创标注 |
|---|---|---|---|---|---|---|---|
| `sk_taxuemeibu` | 踏雪梅步 | 万梅山庄 | `movement/movement`，3 黄上，阴，0.50/0.50 | BX | 先手位移、得 `bf_youshi` 1 回合；`setTags:[]` | `sect rank 1` | **（古龙·《陆小凤传奇》系列）** 据山庄意象 **（原创扩展命名）** |
| `sk_wanmeijian` | 万梅入门剑 | 万梅山庄 | `weapon/sword`，3 黄上，阴，0.85/0.15 | BX | 单体 1.00、突进 1.00；`weaponReq:{category:sword}`；`setTags:[]` | `sect rank 1` | **（古龙·《陆小凤传奇》系列）** 剑侍基础剑路 **（原创扩展）** |

### 14.5 进阶链、套装与职级

- 链：`sk_wanmeijian` 5 重（黄）→ `sk_wanmeixinjing` 6 重（玄）→ `sk_ximenjiandao`（地）。
- 套装候选 `legacy-set:wanmei_gucheng`：本派四门均登记；`set_baiyun_juezhan` 由 `sk_ximenjiandao` 与白云城四门构成，成员见 §15。
- 可学：L1 入门剑 / 踏雪梅步；L2 剑侍目录；L3 万梅静境；L4 西门剑道印证；L5 庄主权限，西门吹雪仍是剧情人物。

---

## 15. 白云城 `sect_baiyuncheng`

### 15.1 定位与武学总表

白云城是城主府组织标签，不映射现实行政城市；叶孤城、BX 来访线与称谓边界见 `design/17` §11.14。城主身份不因学会剑法而取得。

| ID | 名称 | 品阶 | 类别 | 性质 | 原生书界 |
|---|---|---:|---|---|---|
| `sk_tianwaifeixian` | 天外飞仙 | 9 地上 | 兵器/剑 | 调和 | BX |
| `sk_baiyunjianwei` | 白云剑卫 | 6 玄上 | 兵器/剑 | 调和 | BX |
| `sk_feixiandao` | 飞仙岛步 | 6 玄上 | 轻功 | 调和 | BX |
| `sk_baiyunjichujian` | 白云城入门剑 | 3 黄上 | 兵器/剑 | 调和 | BX |

### 15.2 地阶完整条目卡

#### `sk_tianwaifeixian` 天外飞仙（9 地上 · 兵器/剑 · 白云城）

> **出处**：**（古龙·《陆小凤传奇·决战前后》）** 叶孤城的“天外飞仙”有原著依据；招式拆分、层数与战斗数值 **（原创扩展）**。按天级闭集严格维持地上 9。

| 字段 | 值 |
|---|---|
| `origin / sect / lineage` | `canonExpanded` / `sect_baiyuncheng` / 叶孤城个人传承与城主府印证 |
| `sourceChapters` | `[ch07_bixue]` **（原创扩展）** |
| `nature · wOut/wIn · moveSlots` | `harmony · 0.70/0.30 · 4` |
| `weaponReq` | `{category:sword}` |
| `reqs` | `attrs {agi:55,wis:45,wil:50}`；`aptitude {apSword:55}`；`sect {id:sect_baiyuncheng,rank:4}`；`prereq [{skill:sk_baiyunjianwei,layer:6},{skill:sk_feixiandao,layer:6}]`；`hard:[sect,prereq]` |
| `layerStats` | `{hit:[1,5],crit:[1,5],jump:[0,2]}`，第 10 重合计 12≤地阶上限 |
| 层数要点 | 1 云起｜3 飞渡｜5 凌虚｜7 绝招云外｜9 绝招天外飞仙｜10 天成 |
| `setTags / conflicts` | `[set_baiyun_juezhan]` / 无 |
| `special / observable` | `{fusible:false}` / `true` |
| 获取 | BX 叶孤城论剑 / 城主府终局印证，`maxLayer:10/8`；不授城主身份 |
| 图鉴文本 | 叶孤城绝技天外飞仙，以腾跃、取线与单点突击表现；拆招和数值为原创扩展。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 云起 `mv_tianwaifeixian_yunqi` **（原创扩展命名）** | 1 | 单体·1·近身 | 1.05 | 8%/1/1000 | 自身 `bf_piaohu·承·100%·1` | ✓ | `1×(1+0.12+0.05)−0.10=1.07→1.05` |
| 飞渡 `mv_tianwaifeixian_feidu` **（原创扩展命名）** | 3 | 单目标跳斩·3·近身 | 1.20 | 8%/2/1000 | 越过单位 | ✓ | `1.00×(1+0.24+0.05)−0.10=1.19→1.20` |
| 凌虚 `mv_tianwaifeixian_lingxu` **（原创扩展命名）** | 5 | 突进·3·近身 | 1.15 | 8%/2/1000 | `bf_pozhao·承·40%·2` | ✓ | `1×(1+0.24+0.05)−0.10−0.04=1.15` |
| 云外 `mv_tianwaifeixian_yunwai`（绝招，**原创扩展命名**） | 7 | `aoe_line n2`·近身 | 2.60 | 9%/—/1200 | 命中后自身 `bf_piaohu·承·100%·1`；气势 100 | ✓ | N=2、AF=0.90；`3.00×0.90−0.10=2.60`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 天外飞仙 `mv_tianwaifeixian_tianwai` **（绝招）** | 9 | 单目标跳斩·4·近身 | 2.85 | 9%/—/1200 | `bf_yishang·承·40%·2`，气势 100 | ✓ | `3.00−0.10−0.10×40%=2.86→2.85`；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 ID | 名称 | 重 | 类型 | 数值 / 说明 |
|---|---|---:|---|---|
| `ps_tianwaifeixian_yunlu` | 云路 **（原创扩展命名）** | 3 | stat | 跳斩高度容差 +1 |
| `ps_tianwaifeixian_feitian` | 飞天 **（原创扩展命名）** | 7 | effect | 跳斩落点邻接仅一名敌人时 Z3 +10% |
| `ps_tianwaifeixian_tiancheng` | 天成 **（原创扩展命名）** | 10 | trigger | 每场首次跳斩后得 `bf_youshi` 2 回合 |

### 15.3 玄阶紧凑卡

**`sk_baiyunjianwei` 白云剑卫**（6 玄上 · `weapon/sword` · 调和 · 0.75/0.25 · `expanded`）

- 出处：**（古龙·《决战前后》）** 据城主府护卫扩写；武学名、招式 **（原创扩展）**。`sourceChapters:[ch07_bixue]`。
- `weaponReq:{category:sword}`；`reqs {aptitude:{apSword:30},sect:{id:sect_baiyuncheng,rank:2},prereq:[{skill:sk_baiyunjichujian,layer:5}],hard:[sect,prereq]}`；`layerStats {parry:[1,5],hit:[1,5]}`；`setTags:[set_baiyun_juezhan]`。
- 招式：护主（单体 1.00，之后自身 `bf_yuanhu`）、截潮（六角横扫 1.05）、白云回剑 `mv_baiyunjianwei_huijian`（绝招，守反 2.90；耗内 8%、气势 100、收招 1200）。核算抽样：护主 `1×(1+0.12)−0.10=1.02→1.00`；截潮 `0.85×(1+0.24)=1.054→1.05`；白云回剑 `3.00−0.10=2.90`，反应窗口价值已预扣。招式 ID 与招名均 **（原创扩展）**。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`

**`sk_feixiandao` 飞仙岛步**（6 玄上 · `movement/movement` · 调和 · 0.80/0.20 · `expanded`）

- 出处：**（古龙·《陆小凤传奇·决战前后》）** 据飞仙岛 / 海岛意象 **（原创扩展命名）**；具体地理仍 **（待考）**。`sourceChapters:[ch07_bixue]`；`QS(6)=74`。
- `reqs {attrs:{agi:40},aptitude:{apLight:35},sect:{id:sect_baiyuncheng,rank:3},prereq:[{skill:sk_baiyunjichujian,layer:5}],hard:[sect,prereq]}`；`layerStats {eva:[1,5],jump:[0,1]}`；`setTags:[set_baiyun_juezhan]`。
- 招式：临潮（横移 2 格）、凌波（跳至 3 格内空位）、归岛 `mv_feixiandao_guidao`（绝招，后撤 3 格，得 `bf_dunzou` 1 回合；耗内 8%、气势 100、收招 1200），均无伤害；招式 ID 与招名均 **（原创扩展命名）**。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`

### 15.4 黄阶一行条目

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或原创标注 |
|---|---|---|---|---|---|---|---|
| `sk_baiyunjichujian` | 白云城入门剑 | 白云城 | `weapon/sword`，3 黄上，调和，0.80/0.20 | BX | 单体 1.00、突进 1.00；`weaponReq:{category:sword}`；`setTags:[set_baiyun_juezhan]` | `sect rank 1` | **（古龙·《陆小凤传奇·决战前后》）** 城主府剑卫基础 **（原创扩展）** |

### 15.5 进阶链、套装与职级

- 链：`sk_baiyunjichujian` 5 重（黄）→ `sk_baiyunjianwei` 6 重＋`sk_feixiandao` 6 重（玄）→ `sk_tianwaifeixian`（地）。
- 套装候选 `set_baiyun_juezhan`：白云城四门与 `sk_ximenjiandao` 均登记，主题为紫禁决战的两种单点剑道；套装不重演或改写原著胜负。
- 可学：L1 入门剑；L2 白云剑卫；L3 飞仙岛步；L4 天外飞仙印证；L5 城主目录，领地身份另判。

---

## 16. 仁义庄 `sect_renyizhuang`

### 16.1 定位与武学总表

仁义庄的悬赏职能、XA 开放与多人共治边界见 `design/17` §11.15。三位庄主的姓名、世系和具体合击仍 **（待考）**，本文不编造。

| ID | 名称 | 品阶 | 类别 | 性质 | 原生书界 |
|---|---|---:|---|---|---|
| `sk_renyizhuangjian` | 仁义庄剑阵 | 6 玄上 | 杂学/阵法 | 中性 | XA |
| `sk_sanzhuangheji` | 三庄合击 | 6 玄上 | 拳脚/拳掌 | 调和 | XA |
| `sk_xuanhongzhuiji` | 悬红追迹 | 3 黄上 | 杂学/心神 | 中性 | XA |
| `sk_renyizhuangquan` | 仁义庄入门拳 | 3 黄上 | 拳脚/拳掌 | 阳 | XA |

### 16.2 玄阶紧凑卡

**`sk_renyizhuangjian` 仁义庄剑阵**（6 玄上 · `misc/formation` · 中性 · 0.55/0.45 · `expanded`）

- 出处：**（古龙·《武林外史》）** 据庄中群侠与缉捕职能扩写；名称、阵式 **（原创扩展）**。`sourceChapters:[ch05_xiaoao]`。
- `reqs {skills:{formation:35},sect:{id:sect_renyizhuang,rank:3},prereq:[{skill:sk_renyizhuangquan,layer:5}],hard:[sect,prereq]}`；`layerStats {hit:[1,5],effHit:[1,5]}`；`setTags:[]`。
- 招式：列榜（指定目标获 `bf_suoding` 2 回合）、合围 `mv_renyizhuangjian_hewei`（绝招，单体 2.85，相邻友方可选奖励；耗内 8%、气势 100、收招 1200）、留门（友方后撤 2 格）。核算抽样：合围 `3.00−0.15=2.85`，相邻友方奖励价值已预扣。招式 ID 与招名均 **（原创扩展）**。不是必须多人才能施放。获取：XA 庄内传授 `maxLayer:10`；任务观摩 `maxLayer:6`。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`

**`sk_sanzhuangheji` 三庄合击**（6 玄上 · `unarmed/fist` · 调和 · 0.60/0.40 · `expanded`）

- 出处：**（古龙·《武林外史》）** 据仁义庄多人主事结构 **（原创扩展命名）**；具体人物武学 **（待考）**。`sourceChapters:[ch05_xiaoao]`。
- `reqs {aptitude:{apFist:30},sect:{id:sect_renyizhuang,rank:3},prereq:[{skill:sk_xuanhongzhuiji,layer:5}],hard:[sect,prereq]}`；`layerStats {hit:[1,5],parry:[1,5]}`；`setTags:[]`。所有招式均可单人施放。
- 招式：三方照应（单体 1.10）、轮替（与友方换位，无友方则后撤）、同击 `mv_sanzhuangheji_tongji`（绝招，单体 2.85；相邻友方可追加 Z3 +10%，不是施放前提；耗内 8%、气势 100、收招 1200）。核算抽样：同击 `3.00−0.15=2.85`，可选友方奖励价值已预扣。招式 ID 与招名均 **（原创扩展命名）**。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`

### 16.3 黄阶一行条目

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或原创标注 |
|---|---|---|---|---|---|---|---|
| `sk_xuanhongzhuiji` | 悬红追迹 | 仁义庄 | `misc/mind`，3 黄上，中性，0.50/0.50 | XA | 揭示足迹并给目标 `bf_suoding`；无伤害；`setTags:[]` | `sect rank 1; speech 15` | **（古龙·《武林外史》）** 据悬赏追缉职能 **（原创扩展）** |
| `sk_renyizhuangquan` | 仁义庄入门拳 | 仁义庄 | `unarmed/fist`，3 黄上，阳，0.85/0.15 | XA | 单体 1.00、六角横扫 0.95；`setTags:[]` | `sect rank 1` | **（古龙·《武林外史》）** 庄客基础短打 **（原创扩展）** |

### 16.4 进阶链、套装与职级

- 链：`sk_xuanhongzhuiji` 5 重（黄）→ `sk_sanzhuangheji` 6 重（玄）→ 追索快活王赃谱后取得 `sk_jiayishengong`（地），来源覆写见 §4.2；另有入门拳 5 重→仁义庄剑阵（玄）。
- 套装候选 `legacy-set:renyi_xuanhong`：本派四门均登记，主题为悬榜、追迹、合围和互援。
- 可学：L1 入门拳 / 悬红追迹；L2 执事目录；L3 剑阵 / 三庄合击；L4 跨派追索；L5 轮值主持，不强设唯一掌门。

---

## 17. 套装候选（已由 `design/07` 收敛）

> 正式成员、阈值、效果与可达性唯一见 `design/07` §17；本节只保留图鉴侧成员索引。实际 `setTags` 已按 C22 只保留正式关系。

| 正式套装 | ID | 本图鉴成员 |
|---|---|---|
| 移花双璧 | `set_yihua_shuangbi` | `sk_yihuagongjian`、`sk_yihuagongqinggong`、`sk_yihuajieyu`、`sk_mingyugong` |
| 白云决战 | `set_baiyun_juezhan` | `sk_baiyunjichujian`、`sk_baiyunjianwei`、`sk_feixiandao`、`sk_tianwaifeixian`、`sk_ximenjiandao` |

恶人谷、大旗、神水、无争、青龙、快活、血雨、唐门、孔雀、金钱、神剑、万梅与仁义候选均已移除实际标签；去向见 `design/07` §19。

## 18. 本组统计

### 18.1 门派 × 品阶

| 门派 | 天 | 地 | 玄 | 黄 | 合计 |
|---|---:|---:|---:|---:|---:|
| 移花宫 | 0 | 1 | 2 | 1 | 4 |
| 恶人谷 | 0 | 0 | 2 | 2 | 4 |
| 大旗门 | 0 | 1 | 2 | 2 | 5 |
| 神水宫 | 0 | 1 | 1 | 2 | 4 |
| 无争山庄 | 0 | 0 | 3 | 1 | 4 |
| 青龙会 | 0 | 1 | 4 | 6 | 11 |
| 快活王一系 | 0 | 0 | 3 | 1 | 4 |
| 血雨门 | 0 | 0 | 2 | 2 | 4 |
| 蜀中唐门 | 0 | 1 | 2 | 1 | 4 |
| 孔雀山庄 | 0 | 1 | 1 | 2 | 4 |
| 金钱帮 | 0 | 1 | 1 | 2 | 4 |
| 神剑山庄 | 0 | 1 | 1 | 2 | 4 |
| 万梅山庄 | 0 | 1 | 1 | 2 | 4 |
| 白云城 | 0 | 1 | 2 | 1 | 4 |
| 仁义庄 | 0 | 0 | 2 | 2 | 4 |
| **合计** | **0** | **10** | **29** | **29** | **68** |

- AR-01：`68=round(45×1.5)`；地:玄:黄=`10:29:29=1:2.90:2.90`，相对 `1:3:3` 偏差 3.33%。
- 天阶：0；严格未新增基准 §13 名录外天阶。地阶 10≤12。
- 地阶代价 / 誓约型 0 门，`0/10=0%≤5%`；地阶必须多人合击 0 门，`0/10=0%≤3%`。
- `enemyOnly:true` 为 0 门；68 门均至少有一个可学来源或章节内传授说明。
- 统一裁定后：地上 8 门各 2 记、地中 1 门 1 记、地下 1 门 1 记，共 18；玄上 26 门各 1 记，共 26；本册无天阶。统一裁定前为地 19 / 玄上 26，本轮将 `mv_tangmenanshou_zhuixing` 降回普通招。回溯 2026-09-27 调整前基线为地 10 / 玄上 0；截至本版净增 34 个 `ultimate:true`，其中地阶 8 记与玄上 12 记复用既有 `mv_*`，另为原本仅有中文动作名的 14 记玄上绝招补正式 `mv_*`。

### 18.2 类别 × 大阶

| 大类 | 地 | 玄 | 黄 | 合计 |
|---|---:|---:|---:|---:|
| 内功 `inner` | 3 | 3 | 3 | 9 |
| 拳脚 `unarmed` | 0 | 3 | 10 | 13 |
| 兵器 `weapon` | 5 | 8 | 7 | 20 |
| 轻功 `movement` | 0 | 4 | 5 | 9 |
| 暗器 `hidden` | 2 | 0 | 0 | 2 |
| 杂学 `misc` | 0 | 11 | 4 | 15 |
| **合计** | **10** | **29** | **29** | **68** |

### 18.3 玄阶招式抽样与内功预算

- 明列核算式的玄阶武学为：`sk_yihuajieyu`、`sk_erengushengcun`、`sk_wuehezhen`、`sk_daqiqiang`、`sk_tianyishenshui`、`sk_tingfengbianwei`、`sk_sishierduanzhen`、`sk_qinglongduanjian`、`sk_qinglongduanren`、`sk_qiankunmishou`、`sk_kuaihuozhen`、`sk_yanluosuo`、`sk_yanluosan`、`sk_tangmenjieqi`、`sk_kongquezhen`、`sk_jingwumingkuaijian`、`sk_xiejiajianlu`、`sk_baiyunjianwei`、`sk_renyizhuangjian`、`sk_sanzhuangheji`，共 `20/29=68.97%≥30%`。
- 9 门内功全部写 `nature`：阴 3（明玉功、神水内功、唐门避毒诀）、阳 2（嫁衣神功、青龙护心功）、调和 4（大旗吐纳、无争心法、青龙护心诀、青龙吐纳）。逐 ID 见 §20.2。
- IP：地上 3 门各 94.5；玄上 3 门各 57；黄上 1 门为 30、黄中 2 门各 24，均等于 `design/05` §5.5 预算。

### 18.4 外放统计与候选审计

本册逐门、逐招复核后标记外放 **2 招**，均为地阶：天／地／玄／黄为 **0／2／0／0**。`range`、`aoe` 保存 0 档基础值，三档预审形状均保持单体；当前档、扩大后射程、额外耗内与外放 Z5M 只在运行时按 `design/21` §4.4.1 计算。下表是 `tech/04` 构建 `projection-coverage.json` 的本文输入，按 `moveId` 排序。

| moveId | 结论 | 依据 | 所在位置 |
|---|---|---|---|
| `mv_erengushengcun_cangzhen` | `not_projected` | 近身藏针式未声明离体真气；即使使用实体针也只走暗器通道 | §3.2 |
| `mv_kongquelingfa_huihu` | `not_projected` | 孔雀翎机括发射实体暗器并掩护友方 | §11.2 |
| `mv_kongquelingfa_kaiping` | `not_projected` | 名器机括扇域发射实体暗器 | §11.2 |
| `mv_kongquelingfa_shouping` | `not_projected` | 名器机括单体实体投射 | §11.2 |
| `mv_kongquelingfa_zhanping` | `not_projected` | 名器机括扇域发射实体暗器 | §11.2 |
| `mv_longfengshuanghuan_huihuan` | `not_projected` | 双环实体兵刃往返，不因回旋距离而视为气劲外放 | §12.2 |
| `mv_mingyugong_ningyu` | `projected` | 掌端发出离体寒劲**（原创扩展）**；基础单体 1–3，三档均单体 | §2.2 |
| `mv_mingyugong_zhaoye` | `not_projected` | 周身六格近身寒劲，未配置离体段 | §2.2 |
| `mv_shenshuineigong_naliu` | `projected` | 掌端发出离体水劲**（原创扩展）**；基础单体 1–3，三档均单体 | §5.2 |
| `mv_shenshuineigong_zhongchao` | `not_projected` | 近身扇形水势，未配置离体段 | §5.2 |
| `mv_tangmenanshou_baoyu` | `not_projected` | 多枚实体暗器覆盖圆盘 | §10.2 |
| `mv_tangmenanshou_cangshou` | `not_projected` | 单枚实体暗器 | §10.2 |
| `mv_tangmenanshou_lianxing` | `not_projected` | 连发实体暗器 | §10.2 |
| `mv_tangmenanshou_poqi` | `not_projected` | 实体暗器破器 | §10.2 |
| `mv_tangmenanshou_zhuixing` | `not_projected` | 实体暗器沿直线投射 | §10.2 |
| `mv_tianyishenshui_fengxia` | `not_projected` | 封匣运用虚构毒物，不是真气离体 | §5.3 |
| `mv_tianyishenshui_jielu` | `not_projected` | 借用实体毒物，未声明离体真气 | §5.3 |
| `mv_yanluosuo_huisuo` | `not_projected` | 阎罗索实体兵刃横扫 | §9.2 |
| `mv_yanluosuo_suohun` | `not_projected` | 阎罗索实体兵刃擒拿 | §9.2 |
| `mv_yanluosuo_tuoying` | `not_projected` | 阎罗索实体兵刃拉拽 | §9.2 |

两条外放招沿用 §19A.1 阴性攻击骨架的 5 段／360 CT 预算，但以不同蓄劲主干显式展开；路线均包含白名单穴 `ap_shoujueyin_neiguan` 并以掌端 `ap_shoujueyin_laogong` 收束，满足 `design/21` §4.2.1、§4.4.1.4。本册当前没有具全局 `moveId` 的飞刀招式；以后若增补，一律先按实体飞刀 `not_projected`，除非招式正文另有可核验的真气离体伤害段。

---

## 19. 境界覆盖与装配可行性

### 19.1 本组实际投放边界

本组没有天龙、射雕、神雕、倚天的原生投放；按 `design/17` §3.4 与 §11，只覆盖 XA、XK、BX、LD 以及青龙会的 LC–XS 当代分坛。XA / XK / BX 为中武，LD / LC / BM / YY 为低武，SJ / FH / XS 为中武。下列验证只证明**本组承担的本土补位**；其他图鉴的同书界武学可增加选择，但不用于掩盖本组缺口。

### 19.2 逐书界本土 3 / 3 / 3

| 书界 | 本土内功 ≥3 | 本土拳脚 ≥3 | 本土兵器 ≥3 | 结果 |
|---|---|---|---|---|
| XA `ch05_xiaoao` | `sk_jiayishengong`、`sk_daqixinfa`、XA 隐线 `sk_mingyugong` | `sk_daqimenquan`、`sk_qiankunmishou`、`sk_renyizhuangquan` | `sk_kuaihuojian`、XA 隐线 `sk_yihuagongjian`、XA 隐线 `sk_wuzhengjian`（同为剑）；另有 `sk_daqiqiang` | ✅ 3 / 3 / 4；同类剑 3 |
| XK `ch06_xiake` | `sk_mingyugong`、`sk_shenshuineigong`、`sk_wuzhengxinfa`、`sk_tangmenbidu` | `sk_yihuajieyu`、`sk_erenguduanda`、`sk_shenshuizhang`、`sk_tangmenquanshu` | `sk_yihuagongjian`、`sk_wuzhengjian`、`sk_longfengshuanghuan`、`sk_jingwumingkuaijian`、`sk_xiejiajianlu`、`sk_shenjianwuwang` | ✅ 4 / 4 / 6 |
| BX `ch07_bixue` | 青龙 3 内功：`sk_qinglongtuna`、`sk_qinglonghuxin`、`sk_qinglongneifa` | 青龙 3 拳脚：`sk_qinglongduanda`、`sk_qinglongtui`、`sk_qinglongqinshou` | 青龙三门 `exotic/dagger`：`sk_qinglongduanjian`、`sk_qinglongduanren`、`sk_qinglongcisha`；另有孔雀、万梅、白云剑法 | ✅ 3 / 3 / ≥6；同类短兵 3 |
| LD `ch08_luding` | 同上青龙 3 内功 | 同上青龙 3 拳脚＋`sk_xueyumenquan` | 同上青龙三门 `exotic/dagger`；另有 `sk_yanluosuo`、`sk_yanluosan`、`sk_kongquejian` | ✅ 3 / 4 / 6；同类短兵 3 |
| LC `ch09_liancheng` | 同上青龙 3 内功 | 同上青龙 3 拳脚 | `sk_qinglongduanjian`、`sk_qinglongduanren`、`sk_qinglongcisha`（同为 `exotic/dagger`） | ✅ 3 / 3 / 3；同类短兵 3 |
| BM `ch10_baima` | 同上青龙 3 内功 | 同上青龙 3 拳脚 | 同上青龙 3 兵器 | ✅ 3 / 3 / 3 |
| YY `ch11_yuanyang` | 同上青龙 3 内功 | 同上青龙 3 拳脚 | 同上青龙 3 兵器 | ✅ 3 / 3 / 3 |
| SJ `ch12_shujian` | 同上青龙 3 内功 | 同上青龙 3 拳脚 | 同上青龙 3 兵器 | ✅ 3 / 3 / 3 |
| FH `ch13_feihu` | 同上青龙 3 内功 | 同上青龙 3 拳脚 | 同上青龙 3 兵器 | ✅ 3 / 3 / 3 |
| XS `ch14_xueshan` | 同上青龙 3 内功 | 同上青龙 3 拳脚 | 同上青龙 3 兵器 | ✅ 3 / 3 / 3 |

为避免把互斥拜师路线的并集误称为单周目补栏，本节保底来源统一为各界前两幕可接的公开委托 / 脱门者谱录 **（原创扩展）**。来源接口按裁定 A4.3 使用 `reqsOverride:{sect:null}`，删除 `hard` 中的 `sect`，保留属性、资质、技艺与前置；所选技能的前置闭包也须在同界提供相同免门派来源，不依赖互斥身份。XA 采用大旗/快活王/仁义庄公共来源及两门隐藏剑谱，明玉功采用 §2.2 的 XA 专用覆写；XK 采用无争山庄、神水宫、唐门及金钱帮案件谱录；BX–XS 采用青龙分坛脱会谱录。默认 `maxLayer:6`（不足以取得绝招，但可补满栏位并满足最高 6 重前置），不增加技能 ID 或本表书界增量。事件/NPC 实例由 G-04 下游落实。

青龙会后六书界的三内功、三拳脚、三兵器是**同一 ID 的当代分坛再习得**，不是同一 NPC 长生；每书界都生成独立 `learnSources`。这既满足低武只携带 1/1/1 后补齐两格，也避免复制技能 ID。

### 19.3 同类兵器三栏与可用性

- BX：剑系至少 `sk_kongquejian`、`sk_wanmeijian`、`sk_baiyunjichujian` 三门，持剑时可同时装满 3 个兵器栏。
- XK：剑系至少 `sk_yihuagongjian`、`sk_wuzhengjian`、`sk_jingwumingkuaijian`、`sk_shenjianrumenjian` 四门，持剑时任选三门同用。
- XA：`sk_kuaihuojian`、`sk_yihuagongjian`、`sk_wuzhengjian` 均用 `weaponReq:{category:sword}`。后两门的 XA 隐线在第一幕末各提供免门派剑谱互证来源，且与快活王一系的 L1 入门剑不互斥；持一柄剑即可同时启用三栏。
- BX–XS：`sk_qinglongduanjian`、`sk_qinglongduanren`、`sk_qinglongcisha` 均用 `weaponReq:{category:exotic,kinds:[dagger]}`，持一件短兵即可同时启用三栏。各界当代分坛均有独立入门来源。

### 19.4 轻功上限

| 书界 | 本组最高原生轻功 | `design/05` §14.6 #7 上限 | 结果 |
|---|---|---|---|
| XA | `sk_jifengqishu` 6 玄上 | 8 地中 | ✅ |
| XK | `sk_yihuagongqinggong` / `sk_bianfushenfa` 6 玄上 | 8 地中 | ✅ |
| BX | `sk_feixiandao` 6 玄上 | 10 天下 | ✅ |
| LD | `sk_qiushiqinggong` / `sk_xueyuyexing` 3 黄上 | 10 天下 | ✅ |
| LC / BM | 无本组原生轻功 | 7 地下 | ✅（未越界） |
| YY | 无本组原生轻功 | 6 玄上 | ✅（未越界） |
| SJ / FH / XS | 无本组原生轻功 | 8 地中 | ✅（未越界） |

### 19.5 可习得池品阶占比校核

本组没有天阶，不能单独形成符合 §14.4 的完整池；校核口径是把本组**实际声明可学**的增量机械叠加到 `rulings-v1` §3.6 的全局快照。该快照仍是 AR-01 前的 661 门方案，因此下表只用于发现重配缺口，不冒充 C3 的最终总表。四元组顺序均为天 / 地 / 玄 / 黄，百分比用未舍入分数判定。

| 书界 | 本组增量 | 旧快照＋本组 | 占比（%） | 对 `design/05` §14.4 当前结果 |
|---|---:|---:|---:|---|
| XA | 0 / 2 / 7 / 7 | 7 / 28 / 59 / 66 = 160 | 4.38 / 17.50 / 36.88 / 41.25 | ✅ 中武四档均在范围内 |
| XK | 0 / 5 / 12 / 11 | 2 / 22 / 44 / 52 = 120 | 1.67 / 18.33 / 36.67 / 43.33 | ⚠️ 天阶低于 2%；C3 须收敛旧复现或重配其他新增投放 |
| BX | 0 / 4 / 8 / 11 | 2 / 18 / 37 / 46 = 103 | 1.94 / 17.48 / 35.92 / 44.66 | ⚠️ 天阶略低于 2%；同上交 C3 全局重配 |
| LD | 0 / 2 / 7 / 10 | 2 / 11 / 40 / 57 = 110 | 1.82 / 10.00 / 36.36 / 51.82 | ✅ 低武四档均在范围内 |
| LC | 0 / 1 / 4 / 6 | 1 / 5 / 18 / 27 = 51 | 1.96 / 9.80 / 35.29 / 52.94 | ✅ 低武四档均在范围内 |
| BM / YY（各） | 0 / 1 / 4 / 6 | 0 / 4 / 15 / 22 = 41 | 0 / 9.76 / 36.59 / 53.66 | ✅ 低武四档均在范围内 |
| SJ | 0 / 1 / 4 / 6 | 2 / 17 / 36 / 46 = 101 | 1.98 / 16.83 / 35.64 / 45.54 | ⚠️ 天阶略低、黄阶略高；交 C3 重配 |
| FH / XS（各） | 0 / 1 / 4 / 6 | 1 / 10 / 22 / 28 = 61 | 1.64 / 16.39 / 36.07 / 45.90 | ⚠️ 天阶低、黄阶高；交 C3 重配 |

恢复中武天阶至少 2% 的必要条件为：现有 2 门天阶的 XK/BX/SJ 总池 ≤ `2÷2%=100`，现有 1 门的 FH/XS 总池 ≤ `1÷2%=50`。相对本表 120/103/101/61/61，至少需由全局调配净移出 20/3/1/11/11 个非天阶来源；这只是天阶下限的必要条件，C3 仍须同时检查其余三档，不可据此直接删本组候选。

所有十个实际投放书界中，天阶仍为最稀有档；XA、LD、LC、BM、YY 五界按旧快照机械叠加即通过，XK、BX、SJ、FH、XS 五界须由 C3 在 AR-01 全量图鉴落盘后重算。本文不通过新增天阶或删除 `design/17` 的必收候选来伪造达标。

---

## 19A. 经脉系统落地（AR-14）

### 19A.1 接口、路线骨架与实例粒度

本节只登记本册内容：`MoveDef.meridianRouteRef` 引用 `MeridianRouteDef{id,moveRef,ultimate,purpose,requiredNature,steps}`，内功以 `breathProfileRef` 引用 `BreathProfile`。动态河流、Z4M / Z5M、护体内劲、速度、调息、取整和事务均唯一见 `design/21` §3–§5、§10–§12；穴位拓扑与永久成长唯一见 `design/15`。

- 路线 ID 为 `mfr_<moveRef 去掉 mv_>`，调息档案为 `txp_<skill slug>`；两前缀已由 Canon v1.3 §12 登记。
- 阴 / 阳 / 和骨架分别展开 `requiredNature:[yin,harmony] / [yang,harmony] / [harmony]`。下表 `G-*` 只是文档短码，构建时必须展开为 `steps`，不能传给 Core。
- 每招只有一个主 `purpose`：有伤害的突进、绕背和跳斩仍为 `attack`；纯援护 / 架势为 `defense`；纯身法为 `movement`。`ultimate` 与本轮调整后的正文标记严格一致。
- `movement` 路线仍继承所属武学按上项展开的 `requiredNature`；通用 `G-M3/G-M5` 只提供步骤骨架，不覆盖或省略性质字段。
- 每个独立行动的我方、普通敌人、精英与 Boss 各一个 `MeridianFlowModule`；可共享静态定义，不共享 `nodes/stateVersion` 或 RNG（见 21 §11）。

| 骨架 | 有序穴位 | `segmentCt[]` | `riskBp[]` | ΣCT | 用途 |
|---|---|---|---|---:|---|
| `G-Y5` | `ap_renmai_qihai→ap_renmai_danzhong→ap_shoujueyin_tianchi→ap_shoujueyin_neiguan→ap_shoujueyin_laogong` | `[70,70,80,70,70]` | `[100,150,300,150,100]` | 360 | 阴性常用 |
| `G-A5` | `ap_dumai_mingmen→ap_dumai_zhiyang→ap_dumai_shendao→ap_shouyangming_quchi→ap_shouyangming_shangyang` | `[70,70,70,80,70]` | `[100,150,150,300,100]` | 360 | 阳性常用 |
| `G-H5` | `ap_zushaoyin_yongquan→ap_zushaoyin_taixi→ap_zutaiyang_weizhong→ap_dumai_mingmen→ap_shoujueyin_laogong` | `[70,70,70,70,70]` | `[100,100,200,250,150]` | 350 | 调和常用 |
| `G-YD4` | `ap_renmai_qihai→ap_renmai_guanyuan→ap_renmai_zhongwan→ap_renmai_danzhong` | `[70,70,70,70]` | `[50,80,100,120]` | 280 | 阴性防守 |
| `G-AD4` | `ap_dumai_mingmen→ap_dumai_zhiyang→ap_dumai_shendao→ap_dumai_baihui` | `[70,70,80,80]` | `[50,100,150,200]` | 300 | 阳性防守 |
| `G-HD4` | `ap_daimai_zulinqi→ap_daimai_weidao→ap_daimai_daimai→ap_dumai_zhiyang` | `[70,70,70,70]` | `[80,100,120,180]` | 280 | 调和防守 |
| `G-YN2` | `ap_renmai_qihai→ap_shoujueyin_laogong` | `[70,70]` | `[80,100]` | 140 | 阴性自然护体 |
| `G-AN2` | `ap_dumai_mingmen→ap_shouyangming_shangyang` | `[70,70]` | `[80,100]` | 140 | 阳性自然护体 |
| `G-HN2` | `ap_zushaoyin_yongquan→ap_dumai_mingmen` | `[70,70]` | `[80,120]` | 140 | 调和自然护体 |
| `G-M3` | `ap_zushaoyin_yongquan→ap_zushaoyin_taixi→ap_dumai_mingmen` | `[60,60,60]` | `[50,100,200]` | 180 | 黄阶速度 |
| `G-M5` | `ap_zushaoyin_yongquan→ap_zushaoyin_taixi→ap_zutaiyang_weizhong→ap_dumai_mingmen→ap_dumai_baihui` | `[60,60,70,60,70]` | `[50,80,120,180,200]` | 320 | 玄阶速度 |
| `G-Y6U` | `ap_renmai_qihai→ap_renmai_guanyuan→ap_renmai_zhongwan→ap_renmai_danzhong→ap_shoujueyin_neiguan→ap_shoujueyin_laogong` | `[100,100,100,100,100,100]` | `[100,120,180,250,220,180]` | 600 | 阴性玄上绝招 |
| `G-A6U` | `ap_dumai_mingmen→ap_dumai_zhiyang→ap_dumai_shendao→ap_dumai_baihui→ap_shouyangming_hegu→ap_shouyangming_shangyang` | `[100,100,100,100,100,100]` | `[100,150,180,250,220,160]` | 600 | 阳性玄上绝招 |
| `G-H6U` | `ap_zushaoyin_yongquan→ap_zushaoyin_taixi→ap_zutaiyang_weizhong→ap_dumai_mingmen→ap_daimai_zulinqi→ap_daimai_daimai` | `[100,100,100,100,100,100]` | `[100,120,180,250,220,160]` | 600 | 调和 / 中性玄上绝招 |
| `G-M6U` | `ap_zushaoyin_yongquan→ap_zushaoyin_taixi→ap_zutaiyang_weizhong→ap_yangqiao_shenmai→ap_daimai_zulinqi→ap_dumai_baihui` | `[100,100,100,100,100,100]` | `[100,120,180,250,220,200]` | 600 | 玄上纯移动绝招 |
| `G-Y8` | `ap_renmai_qihai→ap_renmai_guanyuan→ap_renmai_zhongwan→ap_renmai_danzhong→ap_shoujueyin_tianchi→ap_shoujueyin_quze→ap_shoujueyin_neiguan→ap_shoujueyin_laogong` | `[90,90,90,90,90,90,90,90]` | `[100,100,150,180,350,200,180,150]` | 720 | 阴性地阶绝招 |
| `G-A8` | `ap_dumai_mingmen→ap_dumai_zhiyang→ap_dumai_shendao→ap_dumai_baihui→ap_shouyangming_quchi→ap_shouyangming_shousanli→ap_shouyangming_hegu→ap_shouyangming_shangyang` | `[90,90,90,90,90,90,90,90]` | `[100,150,180,250,350,180,150,120]` | 720 | 阳性地阶绝招 |
| `G-H8` | `ap_zushaoyin_yongquan→ap_zushaoyin_taixi→ap_zutaiyang_weizhong→ap_dumai_mingmen→ap_daimai_zulinqi→ap_daimai_weidao→ap_daimai_daimai→ap_dumai_zhiyang` | `[90,90,90,90,90,90,90,90]` | `[100,120,180,250,350,180,160,150]` | 720 | 调和地阶绝招 |

全部穴位已在 15 登记、骨架内无重复，段 CT 40–120、风险 0–1200。普通式最大 `1100+360=1460`，玄上绝招 `1200+600=1800`，地阶绝招 `1200+720=1920`，均满足 21 §4.6 的 2000 上限。

### 19A.2 地阶逐招路线注册

格式为“`moveRef→mfr/ultimate/purpose/骨架`”。路线只引用 §2–§15 正文已登记的招式；本轮新增或新标的绝招名称、出处标注、效果与倍率均以正文为准，路线表不重复定义。

#### 外放普通招式显式路线

下列定义沿用 §19A.1 `G-Y5` 的 5 段、360 CT 预算，并按两式动作差异显式展开，保持 `purpose:attack` 不变；两路均经过内关并在掌端劳宫收束，满足 `design/21` §4.2.1、§4.4.1.4。离体寒劲／水劲表现均为**（原创扩展）**。

| 武学 | moveRef | 路线 id | purpose | requiredNature | 显式 steps（`acupointRef/segmentCt/riskBp`） | 段数 | 路线 CT |
|---|---|---|---|---|---|---:|---:|
| `sk_mingyugong` | `mv_mingyugong_ningyu` | `mfr_mingyugong_ningyu` | attack | `[yin,harmony]` | `ap_renmai_qihai/70/100 → ap_renmai_danzhong/70/150 → ap_shoujueyin_tianchi/80/300 → ap_shoujueyin_neiguan/70/150 → ap_shoujueyin_laogong/70/100` | 5 | 360 |
| `sk_shenshuineigong` | `mv_shenshuineigong_naliu` | `mfr_shenshuineigong_naliu` | attack | `[yin,harmony]` | `ap_renmai_qihai/70/100 → ap_zushaoyin_taixi/70/150 → ap_shoujueyin_quze/80/300 → ap_shoujueyin_neiguan/70/150 → ap_shoujueyin_laogong/70/100` | 5 | 360 |

| 武学 / 性质 | 逐招路线 |
|---|---|
| `sk_mingyugong` / 阴 | `mv_mingyugong_ningyu→mfr_mingyugong_ningyu/false/attack/外放显式（见上表）`；`mv_mingyugong_hanyu→mfr_mingyugong_hanyu/false/defense/G-YD4`；`mv_mingyugong_huiliu→mfr_mingyugong_huiliu/true/defense/显式（见本册绝招显式路线索引）`；`mv_mingyugong_zhaoye→mfr_mingyugong_zhaoye/true/attack/显式（见本册绝招显式路线索引）` |
| `sk_jiayishengong` / 阳 | `mv_jiayishengong_cangfeng→mfr_jiayishengong_cangfeng/false/attack/G-A5`；`mv_jiayishengong_huyi→mfr_jiayishengong_huyi/false/defense/G-AD4`；`mv_jiayishengong_chongzhen→mfr_jiayishengong_chongzhen/true/defense/显式（见本册绝招显式路线索引）`；`mv_jiayishengong_liehuo→mfr_jiayishengong_liehuo/true/attack/显式（见本册绝招显式路线索引）` |
| `sk_shenshuineigong` / 阴 | `mv_shenshuineigong_naliu→mfr_shenshuineigong_naliu/false/attack/外放显式（见上表）`；`mv_shenshuineigong_shuimu→mfr_shenshuineigong_shuimu/false/defense/G-YD4`；`mv_shenshuineigong_huilan→mfr_shenshuineigong_huilan/true/defense/显式（见本册绝招显式路线索引）`；`mv_shenshuineigong_zhongchao→mfr_shenshuineigong_zhongchao/true/attack/显式（见本册绝招显式路线索引）` |
| `sk_qinglongcisha` / 阴 | `mv_qinglongcisha_cangren→mfr_qinglongcisha_cangren/false/attack/G-Y5`；`mv_qinglongcisha_liuji→mfr_qinglongcisha_liuji/false/attack/G-Y5`；`mv_qinglongcisha_duanxian→mfr_qinglongcisha_duanxian/false/attack/G-Y5`；`mv_qinglongcisha_fenghou→mfr_qinglongcisha_fenghou/false/attack/G-Y5`；`mv_qinglongcisha_yici→mfr_qinglongcisha_yici/true/attack/显式（见本册绝招显式路线索引）` |
| `sk_tangmenanshou` / 阴 | `mv_tangmenanshou_cangshou→mfr_tangmenanshou_cangshou/false/attack/G-Y5`；`mv_tangmenanshou_lianxing→mfr_tangmenanshou_lianxing/false/attack/G-Y5`；`mv_tangmenanshou_poqi→mfr_tangmenanshou_poqi/false/attack/G-Y5`；`mv_tangmenanshou_zhuixing→mfr_tangmenanshou_zhuixing/false/attack/G-Y5`；`mv_tangmenanshou_baoyu→mfr_tangmenanshou_baoyu/true/attack/显式（见本册绝招显式路线索引）` |
| `sk_kongquelingfa` / 和 | `mv_kongquelingfa_yanling→mfr_kongquelingfa_yanling/false/defense/G-HD4`；`mv_kongquelingfa_zhanping→mfr_kongquelingfa_zhanping/false/attack/G-H5`；`mv_kongquelingfa_huihu→mfr_kongquelingfa_huihu/false/attack/G-H5`；`mv_kongquelingfa_shouping→mfr_kongquelingfa_shouping/true/attack/显式（见本册绝招显式路线索引）`；`mv_kongquelingfa_kaiping→mfr_kongquelingfa_kaiping/true/attack/显式（见本册绝招显式路线索引）` |
| `sk_longfengshuanghuan` / 和 | `mv_longfengshuanghuan_longxing→mfr_longfengshuanghuan_longxing/false/attack/G-H5`；`mv_longfengshuanghuan_fengsuo→mfr_longfengshuanghuan_fengsuo/false/attack/G-H5`；`mv_longfengshuanghuan_bilu→mfr_longfengshuanghuan_bilu/false/attack/G-H5`；`mv_longfengshuanghuan_huihuan→mfr_longfengshuanghuan_huihuan/true/attack/显式（见本册绝招显式路线索引）`；`mv_longfengshuanghuan_jueyu→mfr_longfengshuanghuan_jueyu/true/attack/显式（见本册绝招显式路线索引）` |
| `sk_shenjianwuwang` / 和 | `mv_shenjianwuwang_guanxi→mfr_shenjianwuwang_guanxi/false/attack/G-H5`；`mv_shenjianwuwang_powang→mfr_shenjianwuwang_powang/false/attack/G-H5`；`mv_shenjianwuwang_wuzhu→mfr_shenjianwuwang_wuzhu/false/attack/G-H5`；`mv_shenjianwuwang_fanzhao→mfr_shenjianwuwang_fanzhao/true/attack/显式（见本册绝招显式路线索引）`；`mv_shenjianwuwang_yijian→mfr_shenjianwuwang_yijian/true/attack/显式（见本册绝招显式路线索引）` |
| `sk_ximenjiandao` / 阴 | `mv_ximenjiandao_jingjian→mfr_ximenjiandao_jingjian/false/attack/G-Y5`；`mv_ximenjiandao_hanfeng→mfr_ximenjiandao_hanfeng/false/attack/G-Y5`；`mv_ximenjiandao_yixian→mfr_ximenjiandao_yixian/false/attack/G-Y5`；`mv_ximenjiandao_yingxue→mfr_ximenjiandao_yingxue/true/attack/显式（见本册绝招显式路线索引）`；`mv_ximenjiandao_xilai→mfr_ximenjiandao_xilai/true/attack/显式（见本册绝招显式路线索引）` |
| `sk_tianwaifeixian` / 和 | `mv_tianwaifeixian_yunqi→mfr_tianwaifeixian_yunqi/false/attack/G-H5`；`mv_tianwaifeixian_feidu→mfr_tianwaifeixian_feidu/false/attack/G-H5`；`mv_tianwaifeixian_lingxu→mfr_tianwaifeixian_lingxu/false/attack/G-H5`；`mv_tianwaifeixian_yunwai→mfr_tianwaifeixian_yunwai/true/attack/显式（见本册绝招显式路线索引）`；`mv_tianwaifeixian_tianwai→mfr_tianwaifeixian_tianwai/true/attack/显式（见本册绝招显式路线索引）` |

以上 47/47 个地阶 `mv_*` 均唯一挂接，10/10 门达到统一裁定表的绝招定数：地上 2 记、地中 1 记、地下 1 记。暗器伤害虽不能被护体内劲抵消，仍要运行攻击路线并进入 Z5M；带伤害位移式不再另挂 movement 路线。

### 19A.3 玄 / 黄模板与九门轻功

玄上绝招不再走隐式模板。下表逐招登记 26 条稳定路线；每条均为 6 段、单段 100 CT，`ultimate:true`，收招上界 `1200+600=1800 CT`。阴 / 阳 / 和（含中性）路线总风险分别为 1050 / 1060 / 1030，移动路线总风险 1070；`requiredNature` 依次为 `[yin,harmony]`、`[yang,harmony]`、`[harmony]`、所属武学性质。

| 武学 / 性质 | 玄上绝招显式路线 |
|---|---|
| `sk_yihuajieyu` / 阴 | `mv_yihuajieyu_jieli→mfr_yihuajieyu_jieli/true/defense/显式（见本册绝招显式路线索引）` |
| `sk_yihuagongqinggong` / 阴 | `mv_yihuagongqinggong_yibu→mfr_yihuagongqinggong_yibu/true/movement/显式（见本册绝招显式路线索引）` |
| `sk_wuehezhen` / 中 | `mv_wuehezhen_hewei→mfr_wuehezhen_hewei/true/attack/显式（见本册绝招显式路线索引）` |
| `sk_daqiqiang` / 阳 | `mv_daqiqiang_chongying→mfr_daqiqiang_chongying/true/attack/显式（见本册绝招显式路线索引）` |
| `sk_tiexueqigong` / 中 | `mv_tiexueqigong_shouqi→mfr_tiexueqigong_shouqi/true/defense/显式（见本册绝招显式路线索引）` |
| `sk_tianyishenshui` / 阴 | `mv_tianyishenshui_fengxia→mfr_tianyishenshui_fengxia/true/attack/显式（见本册绝招显式路线索引）` |
| `sk_wuzhengxinfa` / 和 | `mv_wuzhengxinfa_huzhuang→mfr_wuzhengxinfa_huzhuang/true/defense/显式（见本册绝招显式路线索引）` |
| `sk_tingfengbianwei` / 中 | `mv_tingfengbianwei_xunsheng→mfr_tingfengbianwei_xunsheng/true/attack/显式（见本册绝招显式路线索引）` |
| `sk_bianfushenfa` / 阴 | `mv_bianfushenfa_anxiang→mfr_bianfushenfa_anxiang/true/movement/显式（见本册绝招显式路线索引）` |
| `sk_sishierduanzhen` / 中 | `mv_sishierduanzhen_xiaduan→mfr_sishierduanzhen_xiaduan/true/attack/显式（见本册绝招显式路线索引）` |
| `sk_qinglongneifa` / 和 | `mv_qinglongneifa_huxin→mfr_qinglongneifa_huxin/true/defense/显式（见本册绝招显式路线索引）` |
| `sk_qiankunmishou` / 和 | `mv_qiankunmishou_zarou→mfr_qiankunmishou_zarou/true/attack/显式（见本册绝招显式路线索引）` |
| `sk_jifengqishu` / 阳 | `mv_jifengqishu_chitu→mfr_jifengqishu_chitu/true/movement/显式（见本册绝招显式路线索引）` |
| `sk_kuaihuozhen` / 中 | `mv_kuaihuozhen_jiadao→mfr_kuaihuozhen_jiadao/true/attack/显式（见本册绝招显式路线索引）` |
| `sk_yanluosuo` / 阴 | `mv_yanluosuo_tuoying→mfr_yanluosuo_tuoying/true/attack/显式（见本册绝招显式路线索引）` |
| `sk_yanluosan` / 和 | `mv_yanluosan_xuanmian→mfr_yanluosan_xuanmian/true/attack/显式（见本册绝招显式路线索引）` |
| `sk_tangmenjieqi` / 中 | `mv_tangmenjieqi_fankou→mfr_tangmenjieqi_fankou/true/attack/显式（见本册绝招显式路线索引）` |
| `sk_tangmenbidu` / 阴 | `mv_tangmenbidu_shoumai→mfr_tangmenbidu_shoumai/true/defense/显式（见本册绝招显式路线索引）` |
| `sk_kongquezhen` / 中 | `mv_kongquezhen_bimen→mfr_kongquezhen_bimen/true/attack/显式（见本册绝招显式路线索引）` |
| `sk_jingwumingkuaijian` / 阴 | `mv_jingwumingkuaijian_juehui→mfr_jingwumingkuaijian_juehui/true/attack/显式（见本册绝招显式路线索引）` |
| `sk_xiejiajianlu` / 和 | `mv_xiejiajianlu_bianlu→mfr_xiejiajianlu_bianlu/true/attack/显式（见本册绝招显式路线索引）` |
| `sk_wanmeixinjing` / 中 | `mv_wanmeixinjing_jinghou→mfr_wanmeixinjing_jinghou/true/defense/显式（见本册绝招显式路线索引）` |
| `sk_baiyunjianwei` / 和 | `mv_baiyunjianwei_huijian→mfr_baiyunjianwei_huijian/true/attack/显式（见本册绝招显式路线索引）` |
| `sk_feixiandao` / 和 | `mv_feixiandao_guidao→mfr_feixiandao_guidao/true/movement/显式（见本册绝招显式路线索引）` |
| `sk_renyizhuangjian` / 中 | `mv_renyizhuangjian_hewei→mfr_renyizhuangjian_hewei/true/attack/显式（见本册绝招显式路线索引）` |
| `sk_sanzhuangheji` / 和 | `mv_sanzhuangheji_tongji→mfr_sanzhuangheji_tongji/true/attack/显式（见本册绝招显式路线索引）` |

其余玄中 / 玄下普通招与黄阶仍按后表模板展开；不得把上表绝招退回普通 `G-*5` 或两段迁移短路。

| 大阶 / 语义 | 稳定展开 |
|---|---|
| 玄阶伤害、擒拿、点穴 | 按性质取 `G-Y5/G-A5/G-H5`，`purpose:attack`；中性允许 `[yin,yang,harmony]` 并取 `G-H5` 的节点骨架 |
| 玄阶架势、援护、护体 | 按性质取 `G-YD4/G-AD4/G-HD4`，`purpose:defense` |
| 玄阶移动 / 轻功 | `G-M5`，`purpose:movement`；伤害位移式仍为 attack |
| 黄阶伤害 / 防守 | 同性质常用 / 防守骨架前三穴，2–3 段；中性允许三性质 |
| 黄阶轻功 | `G-M3`，`purpose:movement`；无显式 `mv_*` 的一行卡只为既有动作生成局部 MoveDef，不新建全局招名 |

| 轻功武学 | 速度路线 |
|---|---|
| `sk_yihuagongqinggong` | `huaying→mfr_yihuagongqinggong_huaying/false/movement/G-M5`；绝招 `yibu` 见上表 |
| `sk_bianfushenfa` | `zhefan→mfr_bianfushenfa_zhefan/false/movement/G-M5`；绝招 `anxiang` 见上表 |
| `sk_jifengqishu` | `huipei→mfr_jifengqishu_huipei/false/movement/G-M5`；绝招 `chitu` 见上表；坐骑前提仍归 `design/10` |
| `sk_feixiandao` | 既有“临潮 / 凌波”局部动作各自生成稳定普通路线；绝招 `guidao` 见上表 |
| `sk_erenguqianxing`、`sk_xueyuyexing`、`sk_qiushiqinggong`、`sk_cuiyunbu`、`sk_taxuemeibu` | 各自既有移动动作 → 稳定 `mfr_<move>/false/movement/G-M3` |

九门轻功的速度修正只输出 21 §4.9 的投影，不改变 `Q_skill`，不能越过 08 的门禁、地形逐格成本或坐骑资格。`G-M5` 的 `flowCt=320`、`G-M3=180`；封路 / 胀损分别按 6500 / 8000 bp 上限处理。

### 19A.4 九门内功的调息档案与护体内劲

档案字段顺序为 `grade/layer/nature/scope/ct/mpCostBp/outOfBattleScaleBp`；结果按 21 §10.2 以 10 重核算。黄 / 玄 / 地默认 `scope=1/2/3`，全部 `ct=1000`、`mpCostBp=0`、`outOfBattleScaleBp=15000`。品阶档仅供内容检索，实际抵消容量每次由 21 §4.8 的双方 `MeridianProfile` 求得。

所有自然护体和主动护体路线在展开时均附 `innerGuard:{enabled:true,reflectBp:0}`；下表的 `reflectBp:0` 是该对象子字段，不是路线顶层字段。

| 内功 | `BreathProfile.id` | 输入 | 10 重 `reliefBp / repairUnits` | 护体内劲 |
|---|---|---|---|---|
| `sk_mingyugong` | `txp_mingyugong` | `9/10/yin/3/1000/0/15000` | `2200 / 516` | 地阴档；自然 `G-YN2`；`mv_mingyugong_hanyu→G-YD4`；`reflectBp:0`；`outOfBattleScaleBp:15000` |
| `sk_jiayishengong` | `txp_jiayishengong` | `9/10/yang/3/1000/0/15000` | `2200 / 516` | 地阳档；自然 `G-AN2`；`mv_jiayishengong_huyi→G-AD4`；`reflectBp:0`；`outOfBattleScaleBp:15000` |
| `sk_shenshuineigong` | `txp_shenshuineigong` | `9/10/yin/3/1000/0/15000` | `2200 / 516` | 地阴档；自然 `G-YN2`；`mv_shenshuineigong_shuimu→G-YD4`；`reflectBp:0`；`outOfBattleScaleBp:15000` |
| `sk_wuzhengxinfa` | `txp_wuzhengxinfa` | `6/10/harmony/2/1000/0/15000` | `1995 / 466` | 玄调和档；自然 `G-HN2`；`mv_wuzhengxinfa_huzhuang→G-H6U`；`reflectBp:0`；`outOfBattleScaleBp:15000` |
| `sk_qinglongneifa` | `txp_qinglongneifa` | `6/10/harmony/2/1000/0/15000` | `1995 / 466` | 玄调和档；自然 `G-HN2`；`mv_qinglongneifa_huxin→G-H6U`；`reflectBp:0`；`outOfBattleScaleBp:15000` |
| `sk_tangmenbidu` | `txp_tangmenbidu` | `6/10/yin/2/1000/0/15000` | `1900 / 444` | 玄阴档；自然 `G-YN2`；`mv_tangmenbidu_shoumai→G-Y6U`；`reflectBp:0`；`outOfBattleScaleBp:15000` |
| `sk_qinglongtuna` | `txp_qinglongtuna` | `3/10/harmony/1/1000/0/15000` | `1680 / 390` | 黄调和档；自然 `G-HN2`；`reflectBp:0`；`outOfBattleScaleBp:15000` |
| `sk_daqixinfa` | `txp_daqixinfa` | `2/10/harmony/1/1000/0/15000` | `1575 / 365` | 黄调和档；自然 `G-HN2`；`reflectBp:0`；`outOfBattleScaleBp:15000` |
| `sk_qinglonghuxin` | `txp_qinglonghuxin` | `2/10/yang/1/1000/0/15000` | `1500 / 348` | 黄阳档；自然 `G-AN2`；`reflectBp:0`；`outOfBattleScaleBp:15000` |

护体对拳脚 / 兵器 / 暗器 / 内劲外放适用率为 `10000/2500/0/4000 bp`，1 MP 抵 2 伤害；护体真气先结、护体内劲次之、既有 `mpGuard` 再后。三门暗器相关武学不会因护体内劲丢失投射物伤害。本册无既有反震语义，故全部 `reflectBp:0`。

### 19A.5 数据化与验收

- 地阶 47/47 逐招注册；26 条玄上绝招路线逐项显式注册；其余玄 / 黄模板在构建时必须展开为稳定 `mfr_*`，正式发布不得残留迁移短路。
- `moveRef` 必须存在、绝招位相同、主用途唯一；步骤 1–18、穴位无重复、数组等长，`segmentCt∈[40,120]`、`riskBp∈[0,1200]`。
- 同档攻防为 10000 bp，标准伤害 849 / TTK 5，标准速度 `98/106/6/0`；攻击、防守分别只进 Z5M / Z4M，并在各边界向下取整。
- `preview` 不改状态或 RNG；成功命令才提交 Core 的 `battle` RNG。9 级点穴禁自行调息，战斗调息不推进 15 的冲穴 / 周天 / 九转。

## 20. 本文新增术语与 ID

### 20.1 新增武学 ID（23）

`design/17` 已登记的 45 个候选均为复用，不计作本文新增。本文新增 23 门：

| 门派 | 新增 ID |
|---|---|
| 移花宫 / 恶人谷 | `sk_yihuagongjian`、`sk_erenguduanda` |
| 大旗门 | `sk_daqimenquan`、`sk_daqixinfa` |
| 神水宫 / 无争山庄 | `sk_shenshuizhang`、`sk_wuzhengjian` |
| 青龙会 | `sk_qinglongduanda`、`sk_qinglongtui`、`sk_qinglongqinshou`、`sk_qinglongtuna`、`sk_qinglonghuxin`、`sk_qinglongneifa`、`sk_qinglongduanjian`、`sk_qinglongduanren` |
| 其余九派 | `sk_kuaihuojian`、`sk_xueyumenquan`、`sk_tangmenquanshu`、`sk_kongquejian`、`sk_jinqianbangquan`、`sk_shenjianrumenjian`、`sk_wanmeijian`、`sk_baiyunjichujian`、`sk_renyizhuangquan` |

### 20.2 内功性质、调息与路线 ID

| ID | `nature` | `meridians`（正式引用） | IP |
|---|---|---|---:|
| `sk_mingyugong` | `yin` | `[mer_renmai,mer_yinqiao]` | 94.5 |
| `sk_jiayishengong` | `yang` | `[mer_dumai,mer_yangqiao]` | 94.5 |
| `sk_daqixinfa` | `harmony` | `[mer_renmai]` | 24 |
| `sk_shenshuineigong` | `yin` | `[mer_renmai,mer_shoutaiyin]` | 94.5 |
| `sk_wuzhengxinfa` | `harmony` | `[mer_renmai,mer_dumai]` | 57 |
| `sk_qinglongneifa` | `harmony` | `[mer_renmai,mer_dumai]` | 57 |
| `sk_qinglongtuna` | `harmony` | `[mer_renmai]` | 30 |
| `sk_qinglonghuxin` | `yang` | `[mer_dumai]` | 24 |
| `sk_tangmenbidu` | `yin` | `[mer_shoutaiyin,mer_renmai]` | 57 |

本轮为既有原创动作补 14 个正式招式 ID：`mv_sishierduanzhen_xiaduan`、`mv_qinglongneifa_huxin`、`mv_kuaihuozhen_jiadao`、`mv_yanluosan_xuanmian`、`mv_tangmenjieqi_fankou`、`mv_tangmenbidu_shoumai`、`mv_kongquezhen_bimen`、`mv_jingwumingkuaijian_juehui`、`mv_xiejiajianlu_bianlu`、`mv_wanmeixinjing_jinghou`、`mv_baiyunjianwei_huijian`、`mv_feixiandao_guidao`、`mv_renyizhuangjian_hewei`、`mv_sanzhuangheji_tongji`；均为 **（原创扩展）** 或 **（原创扩展命名）**，不冒充原著招名。

| 类别 | 数量 | ID 口径 |
|---|---:|---|
| 招式路线 `mfr_*` | 地阶 47 个逐项登记 + 玄上绝招 26 个逐项登记 + 其余玄阶模板展开 | 地阶见 §19A.2；玄上绝招见 §19A.3；其余玄阶从既有招式稳定派生；黄阶引用模板 |
| 调息档案 `txp_*` | 9 个 | `txp_mingyugong/jiayishengong/daqixinfa/shenshuineigong/wuzhengxinfa/qinglongneifa/qinglongtuna/qinglonghuxin/tangmenbidu` |

`mfr_* / txp_*` 已由 Canon v1.3 §12 登记，定义仍唯一归 `design/21`；`G-*` 仅为本节排版骨架，不是运行 ID。

### 20.3 其他建议 ID

| 类别 | ID | 去向 |
|---|---|---|
| 套装 15 个 | `set_yihua_shuangbi`、`legacy-set:erengu_qiaobian`、`legacy-set:daqi_tiexue`、`legacy-set:shenshui_shenmiao`、`legacy-set:wuzheng_tingfeng`、`legacy-set:qinglong_ancao`、`legacy-set:kuaihuo_mifu`、`legacy-set:xueyu_yanluo`、`legacy-set:tangmen_qiaoji`、`legacy-set:kongque_shouzhuang`、`legacy-set:jinqian_juesu`、`legacy-set:shenjian_wangfan`、`legacy-set:wanmei_gucheng`、`set_baiyun_juezhan`、`legacy-set:renyi_xuanhong` | `design/07` 定稿 |
| 奇门装备标签 2 个 | `umbrella`、`ring` | `design/10`；武学的 `kinds` 均先用 05 已有 `misc`，装备侧可增加非枚举标签，不扩写 `weaponReq.kinds` |
| 装备 1 个 | `eq_kongqueling` | `design/10`；剧情唯一名器，不升天阶 |
| 经脉 5 个 | `mer_renmai`、`mer_dumai`、`mer_yinqiao`、`mer_yangqiao`、`mer_shoutaiyin` | `design/15` 已定稿；均为本文实际使用的正式 ID |

---

### 正式套装反向标签镜像（全局审计）

下表仅镜像 `design/07` §8.4 的正式成员关系，供构建与 lint 读取；不是第二份武学定义。历史候选只以 `legacy-set:<slug>` 保留，不得写入运行态 `setTags`。

| 武学 ID | setTags |
|---|---|
| `sk_baiyunjianwei` | `set_baiyun_juezhan` |
| `sk_baiyunjichujian` | `set_baiyun_juezhan` |
| `sk_feixiandao` | `set_baiyun_juezhan` |
| `sk_mingyugong` | `set_yihua_shuangbi` |
| `sk_yihuagongjian` | `set_yihua_shuangbi` |
| `sk_yihuagongqinggong` | `set_yihua_shuangbi` |
| `sk_yihuajieyu` | `set_yihua_shuangbi` |

## 21. 数据校验规则与测试用例

### 21.1 构建期规则

| ID | 规则 | 预期 |
|---|---|---|
| `GL-V001` | `sk_*` 匹配 `^sk_[a-z0-9_]+$`，68 个定义 ID 唯一；逐项比对 `design/17` 的 45 个候选 ID、名称与建议品阶 | 通过：ID / 名称 45/45；25 项沿用建议品阶，20 项按 AR-01 调阶并逐项登记于 §0.5 |
| `GL-V002` | 品阶 ≥10 的条目数为 0；地阶数 ≤12 | 通过：0 / 10 |
| `GL-V003` | 地阶每招均有核算式且偏差 ≤0.05；玄阶有核算武学占比 ≥30%；范围依 `design/09` §5.3 的六角 `Nmax→AF`，不采用 05 §4.3 旧方格值 | 通过：10 门完整卡；20/29；六角范围已复算 |
| `GL-V003A` | 地阶核心武学招式总数 ≥4、首个绝招 ≤7 重；内功允许 1–4 个运功招式 | 通过：7 门外功 / 暗器地阶各 5 式，3 门地阶内功各 4 式；地上 2 绝招、地中 1 绝招、地下 1 绝招 |
| `GL-V004` | 每门内功 `nature∈{yin,yang,harmony}` 且 IP 在目标 ±5% | 通过：9/9 |
| `GL-V004A` | `layerStats` 满重合计不超过大阶上限（黄 6、玄 10、地 15） | 通过；地阶 7 门外功 / 暗器均 ≤15，玄阶有该字段者均 ≤10 |
| `GL-V005` | 每派至少一门黄阶入门拳或剑、黄→玄→地链、一个闭合套装候选 | 通过：15/15 |
| `GL-V006` | XA–XS 本组覆盖的中 / 低武书界，内功 / 拳脚 / 兵器各 ≥3，且至少 3 门兵器共享同一 `weaponReq` | 文档契约通过，证据见 §19.2–§19.3；章节落实 G-04 后仍须验证同周目可达性 |
| `GL-V007` | `reqs.skills` 键仅来自 C17 十项；`anyOf` 至少两项、不嵌套、不自依赖 | 通过 |
| `GL-V008` | 所有 `bf_*` 均存在于 `design/06` 或 rulings A5、与正文效果语义匹配，且均继承来源品阶 | 通过：潜隐仅用 `bf_yinshen`；牵引 `bf_qianyin` 不作潜隐；系统重创 `bf_zhongchuang` 不由普通攻击施加；“装傻”以 09 的 AI 目标评分表达，不冒充潜隐 Buff |
| `GL-V009` | 地阶代价 / 誓约 ≤5%，必须多人合击 ≤3%；`enemyOnly` 单列 | 通过：0%、0%、0 门 |
| `GL-V010` | 套装表成员与条目 `setTags` 双向一致 | 通过；跨派标签也双向登记 |
| `GL-V011` | 地阶路线 47/47 唯一挂接；26 条玄上绝招路线显式挂接；`moveRef` 存在、`ultimate` 相等、用途唯一并满足 21 MF-V01–V05 | 失败即阻断发布 |
| `GL-V011A` | 绝招数按地上 2、地中逐门服从统一裁定表、地下 1、玄上 1；玄中 / 玄下 / 黄为 0 | 失败即阻断发布 |
| `GL-V012` | 9 门内功各有唯一 `txp_*`，`ct=1000`、`mpCostBp=0`、`outOfBattleScaleBp=15000`；护体路线按性质匹配，反震只能来自既有语义 | 通过：9/9；本册反震均为 0 |
| `GL-V013` | 每个独立行动单位恰有一个 `MeridianFlowModule`，静态定义可共享但节点状态与 RNG 不共享 | 失败即阻断战斗创建 |
| `GL-V014` | 外放静态契约：§18.4 两条 `projected` 均有 `projection:true`、0 档 `range/aoe`、恰三项且 `[0]` 深等于 `aoe` 的 `projectionSpreadSteps`、所有伤害段 `DamageKind:'projected'` 与唯一 attack 路线；实体暗器／机括／普通兵刃结论不得带外放字段 | 失败即阻断发布 |
| `GL-V015` | 外放路线与覆盖：两条外放路线均包含内关并以劳宫掌端收束；§18.4 审计表按 `moveId` 严格排序，外放计数为天／地／玄／黄 0／2／0／0 | 失败即阻断发布 |

### 21.2 最小验收用例

| 用例 | 输入 | 预期 |
|---|---|---|
| `GL-T01` 天阶闭集 | 将 `sk_tianwaifeixian.grade` 改为 10 | `GL-V002` 失败；必须恢复 9 |
| `GL-T02` 低武补位 | 玩家进 LC 只携带 1 内 / 1 拳 / 1 兵，并持短兵 | 当代青龙分坛各提供三类 ≥3；三门兵器均匹配 `exotic/dagger`，可同时启用 |
| `GL-T03` 跨代身份 | 在 BX 与 LC 查询青龙会传授者 | 技能 ID 相同，NPC / `learnSource` 实例不同，不出现角色长生 |
| `GL-T04` 内功预算 | 校验 `sk_qinglonghuxin` | `8+5+2×3+5×1=24`，等于黄中预算 |
| `GL-T05` 二选一前置 | 恶人谷镜像线分别满足任一互证武学 6 重 | `anyOf` 任一满足即可；两者均不满足时不可学 |
| `GL-T06` 套装反向 | 从 `set_baiyun_juezhan` 读取 `sk_ximenjiandao` | 武学条目同时含该 `setTags` |
| `GL-T07` 名器门槛 | 已学 `sk_kongquelingfa` 但未装备 `eq_kongqueling` | 机发攻击招式锁定，数值被动保留 50%、触发率乘 50%，守心不触发 |
| `GL-T08` 合击比例 | 单人施放 `sk_sanzhuangheji` | 可施放；仅失去相邻友方奖励，不计“必须多人”地阶合击 |
| `GL-T09` 高阶路线闭合 | 扫描 §19A.2–§19A.3 的 `moveRef/mfr/ultimate/purpose` | 47 个地阶 `mv_*` 各一次、26 个玄上绝招各一次；绝招总数按地 / 玄上为 18 / 26 |
| `GL-T10` 路线 CT 上界 | 普通最大 `1100+360`；玄上绝招 `1200+600`；地阶绝招 `1200+720` | 1460 / 1800 / 1920，均不超过 2000 |
| `GL-T11` 调息与隔离 | 扫描 9 个 `txp_*`；两个同模板敌人只让 A 跑一段 | 档案唯一且合法；A 状态前进，B 节点 / 版本不变 |
| `GL-T12` 外放基础档 | 标准档分别加载凝玉、纳流 | 两者基础射程均为 1–3、范围均为 `aoe_single`；只在运行时按 `design/21` 取得 +0/+2/+4 射程 |
| `GL-T13` 实体投射反例 | 扫描唐门暗手、孔雀翎、龙凤双环与阎罗索审计条目 | 实体暗器、机括和普通兵刃均保持 `not_projected`，不因投射、回旋或范围模板误挂外放字段 |

---

## 22. 待决事项 / 依赖

### 22.1 替下游给出的建议值

| 编号 | 下游 | 建议值 |
|---|---|---|
| G-01 | `design/07` | §17 的 15 个套装候选先只收成员与主题；阈值、奖励和有效品阶中位数由 07 统一 |
| G-02 | `design/10` | `eq_kongqueling` 为唯一剧情名器；奇门 `umbrella` 若不增枚举则映射 `misc`；不提供现实机关 / 毒物制作信息 |
| G-03 | `design/15` | **已解决**：§20.2 的五个 `mer_*` 均已是 `design/15` §2–§3 正式 ID；本文只引用其拓扑与效果 |
| G-04 | `chapters/05–14`、`design/18` | 各组织 NPC、任务、当代青龙分坛的具体 `learnSources` 与编号；本文固定章节可达性与 §19.2 的免门派补栏来源契约（含前置闭包、maxLayer 6）；事件实例落盘后必须验收同一周目可达 |
| G-04A | `design/09` | 为 `mv_erengushengcun_zhuangsha` 定稿“直至自身下次行动前，敌方 AI 对自身 `T(x) −0.3`”的一回合行动效果；不得用 `bf_yinshen` 代替，因为装傻不应使目标失去可选中性 |
| G-12 | `design/05` / Canon §12 | 接入 `meridianRouteRef`、`breathProfileRef` 并登记 `mfr_* / txp_*`；当前按 21 提案语境输出，不借用其他前缀 |

### 22.2 本文依赖的上游事实

| 上游 | 依赖 | 状态 |
|---|---|---|
| `00-canon` §13 | 天级 51 门闭集；本组 0 门 | 已遵守 |
| `design/05` §2、§4.2、§5.5、§14.6；`design/09` §5.3 | 字段、预算、IP、装配、图鉴硬约束与六角范围 `AF(Nmax)` | 已遵守；本文范围已按 `design/09` §5.3 复算，不沿用 05 §4.3 旧方格模板 |
| `design/06` | Buff 目录与继承品阶 | 正文仅用已有 ID |
| `design/17` §11 | 15 派、45 候选、开放状态与称谓 | 45 项全收录；20 项按 AR-01 调阶见 §0.5 |
| `rulings-v1` C17 / C22 | `reqs.skills`、`anyOf`、套装双向闭合 | 已采用 |
| `design/21` / `design/15` | 动态经脉、攻防路线、护体、速度、调息与每单位实例归 21；经脉穴位和永久成长归 15 | 已按接口引用，不重复规则 |

### 22.3 对基准的修改提案

| 编号 | 提案 | 理由 |
|---|---|---|
| C1g-P01 | 在基准 / `design/05` 的图鉴规模表登记本文件最终配额 **68（0/10/29/29）** | AR-01 已覆盖旧 45 门建议，需让全局总数与本图鉴一致 |
| C1g-P02 | 将 `design/05` §14.6 #4 同步补入裁定 §3.7 已明确的“至少 3 门兵器共享同一类别主武器”，并明确按各图鉴实际声明投放的中 / 低武书界验收 | 避免只读 05 时把剑 / 刀 / 枪各一门误算成可同时启用的三栏；本文已按更严格口径完成 |
| C1g-P03 | **已解决**：`design/05` §4.3 已改为引用 `design/09` §5.3，本文活跃范围与倍率也已按六角 `Nmax→AF` 同步（见 §0.2、§21） | AR-12 已把范围唯一归属移至 09 |
| C1g-P04 | Canon §12 接纳 21 §16.2 的 `mfr_* / qnl_* / dxl_* / txp_*`，并在 §8 / §9 / §11 / §18 / §19 接纳独立乘区、护体、速度与确定性边界 | 当前内容已有稳定引用，但 Canon v1.2 与 ID lint 尚不能完整验证 AR-14 |

### 22.4 原著考据待办

| 编号 | 待核内容 |
|---|---|
| K-01 | 《绝代双骄》：明玉功、移花接玉的准确功效措辞与花无缺传授细节；宫人是否普遍佩剑 |
| K-02 | 《大旗英雄传》：嫁衣神功完整传承链与“破后再立”原文边界 |
| K-03 | 《楚留香传奇》：神水宫人物关系、天一神水案件细节；《蝙蝠传奇》无争山庄省府、原随云 / 原东园称谓 |
| K-04 | 《七种武器》等：青龙会出现作品、首领 / 堂口称谓及版本差异；不得采用网络二创的固定堂数 |
| K-05 | 《武林外史》：快活城路线、柴玉关所搜武学范围、仁义庄三位庄主姓名 / 世系 / 合作方式 |
| K-06 | 《剑·花·烟雨江南》：血雨门人物、阎罗索 / 伞名目与版本 / 代笔边界 |
| K-07 | 《白玉老虎》：唐门人物、暗器和组织关系；不把其他作者唐门设定混入 |
| K-08 | 《孔雀翎》：孔雀翎保管、使用与结局细节；《多情剑客无情剑》龙凤双环、荆无命剑术表述 |
| K-09 | 《三少爷的剑》：谢家剑道与翠云峰 / 绿水湖表述；《陆小凤传奇》万梅山庄弟子体系、白云城 / 飞仙岛地理 |

### 22.5 开放问题（附默认值）

| 编号 | 问题 | 默认值 |
|---|---|---|
| G-05 | 青龙会是否应承担 LC–XS 每一书界的 3/3/3 本土补位 | 保留；用不同代分坛的独立来源，不让人物跨代 |
| G-06 | 无本派地阶的 5 派是否允许以镜像 / 对敌支线共享别派地阶终点 | 允许；只新增来源覆写，不重复定义武学 |
| G-07 | 孔雀翎技能在未持名器时被动保留比例 | 数值被动 50%、触发率乘 50%，守心不触发；机发攻击招式全部锁定 |
| G-08 | `sk_tangmenjieqi` 在 05 无机关子类时的归类 | 暂用 `misc/mind` + `skills.forge`；若未来新增 `misc/mechanism` 再迁移 |
| G-09 | 本组是否加入敌人专用武学 | 不加入；当前 68 门全部可学，Boss 差异由层数、装备和 AI 表现 |
| G-10 | AR-01 扩容后 XK、BX、SJ、FH、XS 的全书界可习得池品阶比例如何恢复 | 默认交 C3 在全部 AR-01 图鉴落盘后按全量池重配；本文件不为追平旧快照而擅改其他图鉴，现状与机械叠加核验见 §19.5 |
| G-11 | 裁定分工表未列 gulong 时，扩容基数采用多少 | 默认以 17 的 45 个候选作为基数，正数四舍五入取 68；C3 正式登记配额并重算全局池 |
| G-13 | 护体“地 / 玄 / 黄档”是否成为正式字段 | 默认不新增字段；只由 `grade/nature` 派生作检索文案，容量仍由 21 实时计算 |
| G-14 | 地中武学应取 1 还是 2 记绝招 | **已解决：本册 `sk_tangmenanshou` 按统一裁定表取 1**；`mv_tangmenanshou_zhuixing` 已恢复普通成本与路线 |

已有待决追溯：经脉正式 ID 已解决（见 G-03、`design/15`）；旧路线 cap 已由作者决定的独立乘区取代（见 `design/21` §3.5、§18.5）；调息默认不另耗内、9 级点穴不可自调息、护体默认不反震，均按 21 §10、§18.5 落地。
