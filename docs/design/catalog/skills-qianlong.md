# 门派武学图鉴 · 乾隆三部曲（`skills-qianlong`）

> **归属**（基准 §18）：`design/catalog/skills-*.md` 门派武学图鉴之一。本文覆盖《书剑恩仇录》《飞狐外传》《雪山飞狐》的红花会、回部、天池怪侠与天山双鹰散承、关东六魔、辽东胡家、苗家、商家堡、药王门、太极门、八卦门、天龙门及掌门人大会具名小派。
> **上游**：`00-canon.md`（§3–§5、§9、§12–§13、§16、§20）；`decisions/author-requirements.md` AR-01–03、AR-07–08、AR-14；`decisions/author-decisions.md` P33、P38；`decisions/rulings-v1.md` C16、C17、C22、C23；`design/17` 的门派 ID、时代状态与职级称谓；`design/21` v2.0。
> **引用而不重定义**：字段、层数、招式预算、内功贡献、学习与残承 → `design/05`；战斗经脉运行、路线、护体内劲、速度修正与调息 → `design/21`；经脉 / 穴位与永久成长 → `design/15`；Buff → `design/06`；轻功值 → `design/03`；书界、印证与残承 → `design/02`；套装规则与最终数值 → `design/07`；装备 → `design/10`；门派史与开放矩阵 → `design/17`。
> **标注约定**：**（原创扩展）** = 原著没有的武学、招名或机制；**（原创扩展命名）** = 原著有其人其事或器械而无正式武学名；**（待考）** = 须以三联 / 广州修订版逐字核对。本文不编造引文与回目号。
> **版本**：初稿 C1e；审校 C1e.R（2026-09-26）；全局审计（2026-09-27）；经脉系统落地（2026-09-27）；绝招数量调整（2026-09-27）；图鉴一致性审计（2026-09-28）；天中 / 地中绝招数统一（2026-09-28）。

---

## 0. 阅读指引与统一记法
### 绝招显式路线索引（镜像正文卡，非覆写层；2026-09-28）

本索引镜像正文卡，非覆写层；与正文不一致即为错误，并以正文为准。每记绝招使用独立稳定路线与显式穴位序列。

<!-- skill-catalog-audit:start -->
| 品阶 | 武学 | MoveDef（正文卡镜像） | 路线 ID | steps（acupointRef/segmentCt/riskBp） |
|---|---|---|---|---|
| 10 天下 | `sk_baihuacuo` | `mv_baihuacuo_cuoluo` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_baihuacuo_cuoluo}` | `mfr_baihuacuo_cuoluo` | `MeridianRouteDef{moveRef:mv_baihuacuo_cuoluo; ultimate:true; purpose:attack}`；`ap_shoushaoyin_shaofu/80/100→ap_shoutaiyin_shaoshang/80/120→ap_yinqiao_jiaoxin/80/140→ap_yinwei_fuai/80/160→ap_zujueyin_ligou/80/180→ap_zujueyin_zhongfeng/80/200→ap_zushaoyin_taixi/80/220→ap_zutaiyin_shangqiu/80/240→ap_renmai_guanyuan/80/260→ap_renmai_yinjiao/80/280` |
| 10 天下 | `sk_baihuacuo` | `mv_baihuacuo_fanchang` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_baihuacuo_fanchang}` | `mfr_baihuacuo_fanchang` | `MeridianRouteDef{moveRef:mv_baihuacuo_fanchang; ultimate:true; purpose:attack}`；`ap_zushaoyin_rangu/80/100→ap_zutaiyin_dadu/80/120→ap_zutaiyin_yinlingquan/80/140→ap_renmai_shenque/80/160→ap_shoujueyin_jianshi/80/180→ap_shoujueyin_zhongchong/80/200→ap_shoushaoyin_shenmen/80/220→ap_shoutaiyin_tianfu/80/240→ap_yinqiao_lieque/80/260→ap_yinwei_lianquan/80/280` |
| 10 天下 | `sk_paoding` | `mv_paoding_muwuquanniu` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_paoding_muwuquanniu}` | `mfr_paoding_muwuquanniu` | `MeridianRouteDef{moveRef:mv_paoding_muwuquanniu; ultimate:true; purpose:attack}`；`ap_yinwei_fuai/80/100→ap_zujueyin_ligou/80/120→ap_zujueyin_zhongfeng/80/140→ap_zushaoyin_taixi/80/160→ap_zutaiyin_shangqiu/80/180→ap_renmai_guanyuan/80/200→ap_renmai_yinjiao/80/220→ap_shoujueyin_quze/80/240→ap_shoushaoyin_qingling/80/260→ap_shoutaiyin_chize/80/280` |
| 10 天下 | `sk_paoding` | `mv_paoding_daokuan` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_paoding_daokuan}` | `mfr_paoding_daokuan` | `MeridianRouteDef{moveRef:mv_paoding_daokuan; ultimate:true; purpose:attack}`；`ap_shoushaoyin_lingdao/80/100→ap_shoushaoyin_yinxi/80/120→ap_shoutaiyin_yuji/80/140→ap_yinqiao_sanyinjiao/80/160→ap_yinwei_tiantu/80/180→ap_zujueyin_xingjian/80/200→ap_zushaoyin_rangu/80/220→ap_zutaiyin_dadu/80/240→ap_zutaiyin_yinlingquan/80/260→ap_renmai_shenque/80/280` |
| 10 天下 | `sk_hujiadao` | `mv_hujiadao_fengxue` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_hujiadao_fengxue}` | `mfr_hujiadao_fengxue` | `MeridianRouteDef{moveRef:mv_hujiadao_fengxue; ultimate:true; purpose:attack}`；`ap_shoutaiyang_wangu/80/100→ap_shouyangming_quchi/80/120→ap_yangqiao_fuyang/80/140→ap_yangqiao_shenmai/80/160→ap_yangwei_yamen/80/180→ap_zushaoyang_xuanzhong/80/200→ap_zutaiyang_kunlun/80/220→ap_zuyangming_fenglong/80/240→ap_zuyangming_zusanli/80/260→ap_dumai_shenzhu/80/280` |
| 10 天下 | `sk_hujiadao` | `mv_hujiadao_humiaohuzhao` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_hujiadao_humiaohuzhao}` | `mfr_hujiadao_humiaohuzhao` | `MeridianRouteDef{moveRef:mv_hujiadao_humiaohuzhao; ultimate:true; purpose:attack}`；`ap_zutaiyang_feishu/80/100→ap_zuyangming_chengqi/80/120→ap_zuyangming_tianshu/80/140→ap_dumai_shendao/80/160→ap_shoushaoyang_guanchong/80/180→ap_shoushaoyang_zhigou/80/200→ap_shoutaiyang_wangu/80/220→ap_shouyangming_quchi/80/240→ap_yangqiao_fuyang/80/260→ap_yangqiao_shenmai/80/280` |
| 9 地上 | `sk_miaojiajian` | `mv_miaojiajian_bafang` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_miaojiajian_bafang}` | `mfr_miaojiajian_bafang` | `MeridianRouteDef{moveRef:mv_miaojiajian_bafang; ultimate:true; purpose:attack}`；`ap_yangwei_tianliao/90/100→ap_zushaoyang_tongziliao/90/120→ap_zutaiyang_cuanzhu/90/140→ap_zutaiyang_zhiyin/90/160→ap_zuyangming_sibai/90/180→ap_dumai_shangxing/90/200→ap_dumai_zhiyang/90/220→ap_shoushaoyang_yifeng/90/240` |
| 9 地上 | `sk_miaojiajian` | `mv_miaojiajian_shouxi` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_miaojiajian_shouxi}` | `mfr_miaojiajian_shouxi` | `MeridianRouteDef{moveRef:mv_miaojiajian_shouxi; ultimate:true; purpose:attack}`；`ap_zutaiyang_chengshan/90/100→ap_zutaiyang_xinshu/90/120→ap_zuyangming_renying/90/140→ap_dumai_mingmen/90/160→ap_dumai_yinjiao/90/180→ap_shoushaoyang_yemen/90/200→ap_shoutaiyang_tianzong/90/220→ap_shouyangming_hegu/90/240` |
| 8 地中 | `sk_yaowangdujing` | `mv_yaowangdujing_baidu` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_yaowangdujing_baidu}` | `mfr_yaowangdujing_baidu` | `MeridianRouteDef{moveRef:mv_yaowangdujing_baidu; ultimate:true; purpose:defense}`；`ap_zutaiyin_taibai/90/100→ap_renmai_huiyin/90/120→ap_renmai_zhongji/90/140→ap_shoujueyin_tianchi/90/160→ap_shoushaoyin_shaochong/90/180→ap_shoutaiyin_kongzui/90/200→ap_shoutaiyin_zhongfu/90/220→ap_yinwei_daheng/90/240` |
| 8 地中 | `sk_qixinhaitang` | `mv_qixinhaitang_wusheng` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_qixinhaitang_wusheng}` | `mfr_qixinhaitang_wusheng` | `MeridianRouteDef{moveRef:mv_qixinhaitang_wusheng; ultimate:true; purpose:attack}`；`ap_shoujueyin_ximen/90/100→ap_shoushaoyin_shaohai/90/120→ap_shoutaiyin_taiyuan/90/140→ap_yinqiao_jingming/90/160→ap_yinwei_fushe/90/180→ap_zujueyin_ququan/90/200→ap_zushaoyin_dazhong/90/220→ap_zushaoyin_yingu/90/240` |
| 8 地中 | `sk_tianshanyingyang` | `mv_tianshanyingyang_tianji` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_tianshanyingyang_tianji}` | `mfr_tianshanyingyang_tianji` | `MeridianRouteDef{moveRef:mv_tianshanyingyang_tianji; ultimate:true; purpose:movement}`；`ap_zushaoyang_xuanzhong/90/100→ap_zutaiyang_kunlun/90/120→ap_zuyangming_fenglong/90/140→ap_zuyangming_zusanli/90/160→ap_dumai_shenzhu/90/180→ap_shoushaoyang_sizhukong/90/200→ap_shoushaoyang_zhongzhu/90/220→ap_shoutaiyang_xiaohai/90/240` |
| 7 地下 | `sk_honghuahuiheji` | `mv_honghuahuiheji_shisidangjia` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_honghuahuiheji_shisidangjia}` | `mfr_honghuahuiheji_shisidangjia` | `MeridianRouteDef{moveRef:mv_honghuahuiheji_shisidangjia; ultimate:true; purpose:movement}`；`ap_zuyangming_lidui/90/100→ap_dumai_jizhong/90/120→ap_dumai_yaoyangguan/90/140→ap_shoushaoyang_yangchi/90/160→ap_shoutaiyang_shaoze/90/180→ap_shouyangming_erjian/90/200→ap_shouyangming_yangxi/90/220→ap_yangqiao_juliao_wei/90/240` |
| 7 地下 | `sk_hujiaquan` | `mv_hujiaquan_quandao` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_hujiaquan_quandao}` | `mfr_hujiaquan_quandao` | `MeridianRouteDef{moveRef:mv_hujiaquan_quandao; ultimate:true; purpose:defense}`；`ap_yangwei_benshen/90/100→ap_yangwei_yangjiao/90/120→ap_zushaoyang_yangbai/90/140→ap_zutaiyang_shenshu/90/160→ap_zuyangming_jiache/90/180→ap_dumai_baihui/90/200→ap_dumai_shuigou/90/220→ap_shoushaoyang_tianjing/90/240` |
| 7 地下 | `sk_baguadao` | `mv_baguadao_bamen` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_baguadao_bamen}` | `mfr_baguadao_bamen` | `MeridianRouteDef{moveRef:mv_baguadao_bamen; ultimate:true; purpose:attack}`；`ap_shoushaoyang_yemen/90/100→ap_shoutaiyang_tianzong/90/120→ap_shouyangming_hegu/90/140→ap_shouyangming_yingxiang/90/160→ap_yangqiao_naoshu/90/180→ap_yangwei_tianliao/90/200→ap_zushaoyang_tongziliao/90/220→ap_zutaiyang_cuanzhu/90/240` |
| 7 地下 | `sk_huibuqijian` | `mv_huibuqijian_huifeng` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_huibuqijian_huifeng}` | `mfr_huibuqijian_huifeng` | `MeridianRouteDef{moveRef:mv_huibuqijian_huifeng; ultimate:true; purpose:defense}`；`ap_shouyangming_shousanli/90/100→ap_yangqiao_juliao/90/120→ap_yangwei_jianjing/90/140→ap_zushaoyang_guangming/90/160→ap_zushaoyang_zuqiaoyin/90/180→ap_zutaiyang_weizhong/90/200→ap_zuyangming_lidui/90/220→ap_dumai_jizhong/90/240` |
| 7 地下 | `sk_zhangmenboyi` | `mv_zhangmenboyi_baipai` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_zhangmenboyi_baipai}` | `mfr_zhangmenboyi_baipai` | `MeridianRouteDef{moveRef:mv_zhangmenboyi_baipai; ultimate:true; purpose:defense}`；`ap_shoutaiyang_shaoze/90/100→ap_shouyangming_erjian/90/120→ap_shouyangming_yangxi/90/140→ap_yangqiao_juliao_wei/90/160→ap_yangwei_jinmen/90/180→ap_zushaoyang_riyue/90/200→ap_zutaiyang_chengshan/90/220→ap_zutaiyang_xinshu/90/240` |
| 6 玄上 | `sk_jindifa` | `mv_jindifa_huban` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_jindifa_huban}` | `mfr_jindifa_huban` | `MeridianRouteDef{moveRef:mv_jindifa_huban; ultimate:true; purpose:defense}`；`ap_zutaiyang_shenshu/100/100→ap_zutaiyin_diji/100/120→ap_zuyangming_chengqi/100/140→ap_zuyangming_tianshu/100/160→ap_chongmai_qichong/100/180→ap_chongmai_zhongzhu/100/200` |
| 6 玄上 | `sk_yingyangzhang` | `mv_yingyangzhang_bingji` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_yingyangzhang_bingji}` | `mfr_yingyangzhang_bingji` | `MeridianRouteDef{moveRef:mv_yingyangzhang_bingji; ultimate:true; purpose:attack}`；`ap_dumai_baihui/100/100→ap_dumai_shuigou/100/120→ap_shoushaoyang_tianjing/100/140→ap_shoutaiyang_houxi/100/160→ap_shoutaiyang_yanggu/100/180→ap_shouyangming_shangyang/100/200` |
| 6 玄上 | `sk_huibujianshu` | `mv_huibujianshu_liuguang` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_huibujianshu_liuguang}` | `mfr_huibujianshu_liuguang` | `MeridianRouteDef{moveRef:mv_huibujianshu_liuguang; ultimate:true; purpose:attack}`；`ap_shoutaiyang_xiaohai/100/100→ap_shoutaiyin_tianfu/100/120→ap_shouyangming_pianli/100/140→ap_yangqiao_dicang/100/160→ap_yangqiao_pucan/100/180→ap_yangwei_toulinqi/100/200` |
| 6 玄上 | `sk_miaojiaquan` | `mv_miaojiaquan_zhengqi` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_miaojiaquan_zhengqi}` | `mfr_miaojiaquan_zhengqi` | `MeridianRouteDef{moveRef:mv_miaojiaquan_zhengqi; ultimate:true; purpose:attack}`；`ap_shoushaoyang_waiguan/100/100→ap_shoushaoyin_lingdao/100/120→ap_shoushaoyin_yinxi/100/140→ap_shoutaiyang_xiaohai/100/160→ap_shoutaiyin_tianfu/100/180→ap_shouyangming_pianli/100/200` |
| 6 玄上 | `sk_taijimenquan` | `mv_taijimenquan_heshou` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_taijimenquan_heshou}` | `mfr_taijimenquan_heshou` | `MeridianRouteDef{moveRef:mv_taijimenquan_heshou; ultimate:true; purpose:attack}`；`ap_shoushaoyin_tongli/100/100→ap_shoutaiyang_wangu/100/120→ap_shoutaiyin_taiyuan/100/140→ap_shouyangming_hegu/100/160→ap_shouyangming_yingxiang/100/180→ap_yangqiao_naoshu/100/200` |
| 6 玄上 | `sk_baguazhang` | `mv_baguazhang_bafang` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_baguazhang_bafang}` | `mfr_baguazhang_bafang` | `MeridianRouteDef{moveRef:mv_baguazhang_bafang; ultimate:true; purpose:attack}`；`ap_zushaoyin_yongquan/100/100→ap_zutaiyang_weizhong/100/120→ap_zutaiyin_shangqiu/100/140→ap_zuyangming_jiache/100/160→ap_baihui/100/180→ap_chongmai_shangqu/100/200` |
| 6 玄上 | `sk_tianlongjian` | `mv_tianlongjian_zhengshou` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_tianlongjian_zhengshou}` | `mfr_tianlongjian_zhengshou` | `MeridianRouteDef{moveRef:mv_tianlongjian_zhengshou; ultimate:true; purpose:attack}`；`ap_zujueyin_ligou/100/100→ap_zujueyin_zhongfeng/100/120→ap_zushaoyin_taixi/100/140→ap_zutaiyin_shangqiu/100/160→ap_renmai_guanyuan/100/180→ap_renmai_yinjiao/100/200` |
| 6 玄上 | `sk_baxianjian` | `mv_baxianjian_guohai` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_baxianjian_guohai}` | `mfr_baxianjian_guohai` | `MeridianRouteDef{moveRef:mv_baxianjian_guohai; ultimate:true; purpose:attack}`；`ap_dumai_shuigou/100/100→ap_renmai_danzhong/100/120→ap_renmai_shuifen/100/140→ap_shoujueyin_neiguan/100/160→ap_shoushaoyang_sizhukong/100/180→ap_shoushaoyang_zhongzhu/100/200` |
| 6 玄上 | `sk_bajiquan` | `mv_bajiquan_beng` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_bajiquan_beng}` | `mfr_bajiquan_beng` | `MeridianRouteDef{moveRef:mv_bajiquan_beng; ultimate:true; purpose:attack}`；`ap_shouyangming_hegu/100/100→ap_shouyangming_yingxiang/100/120→ap_yangqiao_naoshu/100/140→ap_yangwei_tianliao/100/160→ap_zushaoyang_tongziliao/100/180→ap_zutaiyang_cuanzhu/100/200` |
| 6 玄上 | `sk_jiulongbian` | `mv_jiulongbian_guiyi` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_jiulongbian_guiyi}` | `mfr_jiulongbian_guiyi` | `MeridianRouteDef{moveRef:mv_jiulongbian_guiyi; ultimate:true; purpose:attack}`；`ap_zutaiyin_yinlingquan/100/100→ap_renmai_shenque/100/120→ap_shoujueyin_jianshi/100/140→ap_shoujueyin_zhongchong/100/160→ap_shoushaoyin_shenmen/100/180→ap_shoutaiyin_tianfu/100/200` |
<!-- skill-catalog-audit:end -->


### 0.1 配额、口径与条目详略

作者 AR-01 覆盖旧分工表的 55 门目标。本组有 3 门封闭天级，理想比例是 `3:9:27:27`；为容纳 `design/17` 已登记的清代小派并保持玄黄相等，本文取 **3 天 / 9 地 / 30 玄 / 30 黄 = 72 门**。玄、黄相对理想值 27 各高 11.1%，在 ±15% 容差内。

| 大阶 | 数量 | 本文格式 | 招式核算 | 是否计残承为新增条目 |
|---|---:|---|---|---|
| 天（10–12） | 3 | 完整条目卡 | 逐招核算 | 否；飞狐 9 品残承仍复用原 ID |
| 地（7–9） | 9 | 完整条目卡 | 逐招核算 | 否 |
| 玄（4–6） | 30 | 紧凑卡 | 全列招式；抽样 13 门逐招核算（43.3%） | 否 |
| 黄（1–3） | 30 | 一行表格条目 | 按模板做整体预算核对 | 否 |

- “原生书界”只表示完整定义的本土来源；`partial / lineageGrade` 是残承来源，不能抬高完整天级池。
- `grade` 是绝对品阶；Buff 一律写“承”，即 `grade: inherit`。
- `sourceChapters` 使用 `ch12_shujian`、`ch13_feihu`、`ch14_xueshan`。同处乾隆时代不自动等于三书皆原生；跨书延续明确标 **（原创扩展）**。
- 本文没有 `enemyOnly: true` 条目；72 门全都有至少一个可习得来源。

### 0.2 招式表与预算记法

完整卡招式列为：`招式（ID）｜重｜范围·投送｜倍率｜耗内/cd/收招｜附带｜架｜核算`。公式沿用 `design/05` §4.2：

```text
power = AF × (1 + Σadj) × K_delivery × K_parry − Σcost_buff − Σcost_disp
```

| 记号 | 值 |
|---|---|
| 大阶基础耗内 | 黄 5% / 玄 6% / 地 7% / 天 8% |
| `cd+` | 每回合 `+0.12` |
| `内±` | 每偏离基础 1pp，`±0.05` |
| `收±` | 每偏离 1000 的 100 点，`±0.07` |
| `条+` | 常见条件 `+0.15`；罕见条件 `+0.30` |
| 投送 | `ranged ×0.85`；`projectile ×0.92` |
| 不可招架 | `×0.85` |
| 常用 AF | 单体 1.00；线 2 / 3 格 0.90 / 0.85；横扫 `aoe_cone {angle:120,r:1,dirCount:6}` 为 0.85；锥 2 格 `aoe_cone {r:2,angle:60,dirCount:6}` 为 0.80；周身 0.75，其余按 `design/09` §5.3 的实际 `Nmax` 查表；突进单目标 1.00；回旋每程 0.75；区域每跳 0.25 |
| Buff / 位移成本 | 数值减益、DOT `0.10×率`；控制（定身 / 眩晕 / 麻痹 / 缠绕）`0.25×率`；封穴 / 封经脉 `0.20×率`；自身增益 0.10–0.20；击退 0.05/格；突进 0.10；绕背 0.15。持续回合不重复乘入成本 |
| 绝招 | `3.00 × AF × Kd × Kp − 成本`；气势 100、基础耗内 +2%、收招 1200 |

表中“单体”“线2”“横扫”“周身”“突进”分别是 `aoe_single`、`aoe_line n2`、`aoe_cone {angle:120,r:1,dirCount:6}`、`aoe_around`、`aoe_dash`；“近 / 气 / 投”分别是 `melee / ranged / projectile`；“可 / 否”是 `parryable`。

### 0.3 内功贡献、轻功与弓箭

- 内功贡献：`IP = mpMaxPct + hpMaxPct + 2×属性点 + 5×mpRegen`；本文各内功均在品阶预算 ±5% 内，并逐门标 `nature: yin / yang / harmony`。
- `design/15-meridians-and-acupoints.md` 已冻结正式 `mer_*`；本文只引用专精经脉 ID，不定义经脉效果。
- 书剑、飞狐、雪山最高本土轻功均不超过地中 8；`sk_tianshanyingyang` 为三书可取得的地中上限，满层 `QS(8)=104`。
- 弓箭按 C16 写为 `category:hidden, subType:hidden`，使用 `apHidden`、暗器栏与箭类弹药；`sk_tianshanqishe` 不占兵器栏。

### 0.4 五级职级与可学目录

称谓采用 `design/17` §1 的 T03/T04/T05B/T07；这里只列可学武学，月钱与资源留给 `design/16`。天级仍需剧情、师承或悟道来源，L5 不会自动赠送。

| 门派 / 模板 | 称谓序列（L1→L5，沿用 `design/17`） | L1 可学 | L2 可学 | L3 可学 | L4 可学 | L5 可学 |
|---|---|---|---|---|---|---|
| 红花会 T05B | 会众 → 骨干 → 当家 → 总管 / 首席当家 → 总舵主 | 红花长拳、红花剑、走舵步 | 红花心法 | 金笛法 | 红花会合击 | 百花错拳；庖丁解牛掌仍走悟道 |
| 回部 T07 | 部众 / 客人 → 勇士 → 首领亲随 → 长老 / 队长 → 部族首领 | 回部护手、回部初剑、回部吐纳 | 回部摔角 | 回部剑术、天山骑射 | 回部奇剑 | 奇剑圆满与部族任务 |
| 胡家 T04 | 门客 → 记名 → 嫡传 → 护谱人 → 家主 | 胡家小练拳、辽东护身刀 | 胡家心法 | 胡家拳 | 胡家刀谱守护 | 胡家刀法完整传承 |
| 苗家 T04 | 家仆 / 门客 → 子弟 → 嫡传 → 护剑家老 → 家主 | 苗家剑功、苗家炼气 | 苗家心法 | 苗家拳 | 苗家剑法至 8 重 | 苗家剑法圆满 |
| 商家堡 T04 | 家仆 / 门客 → 外姓 / 本家子弟 → 亲传 / 少主近卫 → 总管 / 教头 → 堡主 / 代家主 | 商家入门拳、商家步 | 商家拳 | 商家刀法 | 掌门博艺候选 | 堡主目录；不新增镇派天级 |
| 药王门 T04/T03 | 药童 → 门人 → 衣钵弟子 → 掌药长老 → 药王传人 | 药王护手、药王吐纳 | 药王针法 | 药王毒经 | 七心海棠法 | 药王衣钵与安全处置资格 |
| 太极门 T03 | 外门 / 馆徒 → 内门弟子 → 亲传 / 闭门弟子 → 长老 / 教习 → 掌门 / 总馆主 | 广平长拳、太极门初剑 | 广平心法 | 太极门剑 | 太极门拳 | 掌门博艺 |
| 八卦门 T03 | 外门 / 馆徒 → 内门弟子 → 亲传 / 闭门弟子 → 长老 / 教习 → 掌门 / 总馆主 | 八卦入门拳、八卦初级刀 | 游身步 | 八卦掌 | 八卦刀 | 掌门博艺 |
| 天龙门 T03 | 外门 / 馆徒 → 内门弟子 → 亲传 / 闭门弟子 → 长老 / 教习 → 掌门 / 总馆主 | 天龙入门剑、关外长拳 | 关外心法 | 天龙北刀 | 天龙剑 | 掌门博艺 |
| 韦陀门 T03 | 外门 / 馆徒 → 内门弟子 → 亲传 / 闭门弟子 → 长老 / 教习 → 掌门 / 总馆主 | 韦陀入门拳、罗汉步 | 韦陀门拳 | 韦陀杵 | 掌门博艺候选 | 掌门博艺 |
| 八仙剑 T03 | 外门 / 馆徒 → 内门弟子 → 亲传 / 闭门弟子 → 长老 / 教习 → 掌门 / 总馆主 | 八仙入门剑、八仙心法 | 醉八仙步 | 八仙剑 | 掌门博艺候选 | 掌门博艺 |
| 八极拳 T03 | 外门 / 馆徒 → 内门弟子 → 亲传 / 闭门弟子 → 长老 / 教习 → 掌门 / 总馆主 | 八极入门拳、八极桩 | 铁山靠 | 八极拳 | 掌门博艺候选 | 掌门博艺 |
| 九龙鞭 T03 | 外门 / 馆徒 → 内门弟子 → 亲传 / 闭门弟子 → 长老 / 教习 → 掌门 / 总馆主 | 九龙入门拳、易家心法 | 缠龙手 | 九龙鞭 | 掌门博艺候选 | 掌门博艺 |

### 0.5 前置、合击与套装口径

- `reqs.prereq` 外层为 AND；二选一或多选一严格用 C17 的 `{anyOf:[{skill,layer},...]}`，不使用自然语言替代。
- 本组唯一写“合击”的 `sk_honghuahuiheji` 可由单人施展；相邻队友只提供可选强化，故不计“必须多人才能施放”的合击类。
- 每个正式门派都有黄阶拳或剑、明确的黄→玄→地链，以及至少一个双向登记成员的 `setTags` 候选；最终套装阈值与奖励只由 `design/07` 定稿。

---

## 1. 本组门派与 72 门名录

### 1.1 门派、时代与数量

| 门派 / 传承 | ID | 时代状态（SJ / FH / XS） | 职级 | 天 / 地 / 玄 / 黄 | 本文重点 |
|---|---|---|---|---:|---|
| 红花会 | `sect_honghuahui` | O / H / H | T05B | 2 / 1 / 2 / 3 | 两门天级、十四当家协作 |
| 天池怪侠、天山双鹰 | `sect:null` | O / H★ / H★ | 散承 | 0 / 1 / 2 / 1 | 鹰扬轻功、天池心路 |
| 关东六魔 | `sect:null` | O / N / N | 敌对散承 | 0 / 0 / 1 / 1 | 只保留可缴获的低中阶套路 |
| 回部 | `sect_huibu` | O / O★ / O★ | T07 | 0 / 1 / 3 / 3 | 剑、摔角、骑射 |
| 辽东胡家 | `sect_hujia` | H / O / O | T04 | 1 / 1 / 1 / 2 | 刀拳互证、冷月刀 |
| 苗家 | `sect_miaojia` | H / O / O | T04 | 0 / 1 / 2 / 2 | 苗剑与胡刀互知破绽 |
| 商家堡 | `sect_shangjiabao` | H / O / D | T04 | 0 / 0 / 2 / 2 | 商家堡事件与残谱 |
| 药王门 | `sect_yaowangmen` | H / O / O | T04/T03 | 0 / 2 / 1 / 2 | 医毒检定、七心海棠 |
| 太极门 | `sect_taijimen` | O / O / H | T03 | 0 / 0 / 3 / 2 | 与武当分立 |
| 八卦门 | `sect_baguamen` | O / O / O | T03 | 0 / 1 / 2 / 2 | 掌、刀、游身 |
| 天龙门 | `sect_tianlongmen` | H / O / O | T03 | 0 / 0 / 3 / 2 | 南北宗竞争；非天龙寺 |
| 韦陀门 | `sect_weituomen` | H / O / H | T03 | 0 / 0 / 2 / 2 | 掌门会小派 |
| 八仙剑 | `sect_baxianjian` | H / O / H | T03 | 0 / 0 / 2 / 2 | 梧州剑派 |
| 八极拳 | `sect_bajiquan` | H / O / H | T03 | 0 / 0 / 2 / 2 | 秦耐之一系与真实拳史分开 |
| 九龙鞭 | `sect_jiulongbian` | H / O / H | T03 | 0 / 0 / 2 / 2 | 易家湾鞭派 |
| 掌门大会会武所得 | `sect:null` | N / O / N | 散承 | 0 / 1 / 0 / 0 | 单人复盘百派，不是强制合击 |
| **合计** | | | | **3 / 9 / 30 / 30 = 72** | ★为同时代原创延续 |

### 1.2 天级封闭名录与残承

| ID | 名称 | 绝对品阶 | 类别 | 完整原生书界 | 后世残承 |
|---|---|---:|---|---|---|
| `sk_baihuacuo` | 百花错拳 | 10 天下 | 拳脚/拳掌 | 书剑 | 飞狐 `partial, lineageGrade 9` |
| `sk_paoding` | 庖丁解牛掌 | 10 天下 | 拳脚/拳掌 | 书剑 | 飞狐 `partial, lineageGrade 9` |
| `sk_hujiadao` | 胡家刀法 | 10 天下 | 兵器/刀 | 飞狐、雪山 | 无；雪山可完成印证 |

三门与基准 §13 的 ID、绝对品阶、类型、完整原生书界完全一致；本文不新增天级。百花、庖丁的飞狐残承遵循作者 P38：未取得书剑完整来源者只能得到 9 品来源记录，书眠或终局不会自动补成 10 品。

### 1.3 地阶九门总览

| ID | 名称 | 品阶 | 类别 | 门派 / 传承 | 原生书界 | 前置链终点 |
|---|---|---:|---|---|---|---|
| `sk_miaojiajian` | 苗家剑法 | 9 地上 | 兵器/剑 | 苗家 | 飞狐、雪山 | 苗家剑功 → 苗家心法 → 本门 |
| `sk_yaowangdujing` | 药王毒经 | 8 地中 | 杂学/毒 | 药王门 | 飞狐、雪山 | 药王吐纳 → 药王针法 → 本门 |
| `sk_qixinhaitang` | 七心海棠法 | 8 地中 | 暗器 | 药王门 | 飞狐、雪山 | 药王护手 → 药王针法 → 本门 |
| `sk_tianshanyingyang` | 天山鹰扬功 | 8 地中 | 轻功 | 天山双鹰散承 | 书剑；飞狐/雪山★ | 天池引路 → 天池步 → 本门 |
| `sk_honghuahuiheji` | 红花会合击 | 7 地下 | 杂学/阵法 | 红花会 | 书剑 | 红花长拳 → 红花心法 → 本门 |
| `sk_hujiaquan` | 胡家拳 | 7 地下 | 拳脚/拳掌 | 胡家 | 飞狐、雪山 | 胡家小练拳 → 胡家心法 → 本门 |
| `sk_baguadao` | 八卦刀 | 7 地下 | 兵器/刀 | 八卦门 | 书剑、飞狐、雪山 | 八卦初级刀 → 八卦掌 → 本门 |
| `sk_huibuqijian` | 回部奇剑 | 7 地下 | 兵器/剑 | 回部 | 书剑；飞狐/雪山★ | 回部初剑 → 回部剑术 → 本门 |
| `sk_zhangmenboyi` | 掌门博艺 | 7 地下 | 杂学/心神 | 掌门人大会 | 飞狐 | 任一大会小派或已识别散承黄→玄后研习 |

地阶代价型 0/9、誓约型 0/9、强制多人合击 0/9，比例均为 0%，满足 `design/05` §14.6。

---

## 2. 天池怪侠与红花会天级

### 2.1 `sk_baihuacuo` 百花错拳（10 天下 · 拳脚/拳掌）

| 字段 | 值 |
|---|---|
| 出处 | 《书剑恩仇录》袁士霄传陈家洛；正式武学名为原著，具体回目与原著招名待考。下表招名与战斗效果均为**（原创扩展）** |
| origin / sect / lineage | `canonExpanded` / `sect_honghuahui`（获取组织）/ 天池怪侠袁士霄 |
| sourceChapters | `[ch12_shujian]`；飞狐仅 `partial, lineageGrade: 9` |
| category / subType / grade | `unarmed / fist / 10` |
| nature · wOut/wIn · aptitude | `harmony` · 0.50/0.50 · `apFist` |
| reqs | `attrs {agi:55,wis:55}`；`aptitude {apFist:55}`；`prereq [{anyOf:[{skill:sk_honghuaxinfa,layer:7},{skill:sk_tianchibu,layer:7}]}]`；`hard:[prereq]` |
| layerStats | `hit [4,10]`、`crit [2,10]`（合计 20） |
| 层数要点 | 1 乱花错眼、移花接木、错中藏真；3 虚实相生；5 百家纷呈、无定；**7 绝招 百花错落**；**9 绝招反常合道、被动错拳后发**；10 百花归一 |
| moveSlots | 5 |
| setTags | `[set_honghua_shisidangjia]` |
| conflicts / weaponReq | `[] / null` |
| special / observable | `{fusible:true}` / `false` |
| 获取 | 书剑：袁士霄奇遇，或陈家洛羁绊并完成天池试招，`maxLayer:10`；飞狐：陈家洛指点，`maxLayer:8, lineageGrade:9, partial:true`（原创扩展残承）；正式任务 ID 由章节文档登记 |
| 图鉴文本 | 袁士霄杂取百家拳意，故意颠倒常见起手与衔接，使人按熟招拆解反而落空。诡而不邪，妙处在“错”后仍能归整。 |

| 招式（ID） | 重 | 范围·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 乱花错眼 `mv_baihuacuo_luanhua` | 1 | 单体·近 | 1.00 | 8%/0/1000 | — | 可 | `1.00` |
| 移花接木 `mv_baihuacuo_yihua` | 1 | 绕背·近 | 0.80 | 8%/1/1000 | 绕背；`bf_pozhao` 40%·1 | 可 | `0.90×1.12−0.15−0.10×0.4=0.82≈0.80` |
| 错中藏真 `mv_baihuacuo_cangzhen` | 3 | 单体·近 | 1.15 | 9%/1/1000 | — | 可 | `1+0.12+0.05=1.17≈1.15` |
| 百家纷呈 `mv_baihuacuo_baijia` | 5 | 横扫·近 | 1.05 | 9%/2/1000 | `bf_shiheng` 50%·1 | 可 | N=3、AF=0.85；`0.85×(1+0.24+0.05)−0.10×0.5=1.0465≈1.05` |
| **百花错落** `mv_baihuacuo_cuoluo`（绝招） | 7 | 周身·近 | 2.00 | 10%/—/1200 | 目标 `bf_shiheng` 100%·1；自身 `bf_bizhong`×1 | 可 | N=6、AF=0.75；`3×0.75−0.10−0.15=2.00`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |
| 反常合道 `mv_baihuacuo_fanchang`（绝招，**原创扩展命名**） | 9 | 单体·近；目标有 `stance` | 2.90 | 10%/—/1200 | `bf_pozhao` 100%·1；气势 100 | 可 | `3.00−0.10=2.90`；姿态条件不另抬绝招基础倍率；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |

| 被动 ID | 名称 | 重 | 类 / 乘区 | 数值与说明 |
|---|---|---:|---|---|
| `ps_baihuacuo_xushi` | 虚实相生 | 3 | stat / Z3 | 与上一招范围模板不同时，本武学伤害 +6%→12% |
| `ps_baihuacuo_wuding` | 无定 | 5 | trigger | `onParry` 每回合 1 次，50% 获得 `bf_youshi` 1 回合 |
| `ps_baihuacuo_houfa` | 错拳后发 | 8 | stat / Z3 | 对本回合已经行动的目标 +10% |
| `ps_baihuacuo_dacheng` | 百花归一 | 10 | mechanic / Z0 | 每第三次使用本武学普通招式获得 `bf_bizhong`×1 |

### 2.2 `sk_paoding` 庖丁解牛掌（10 天下 · 拳脚/拳掌）

| 字段 | 值 |
|---|---|
| 出处 | 《书剑恩仇录》陈家洛于玉峰相关洞窟读《庄子》文字而悟；地点、同行与回目待考。招名取庖丁解牛典故，均为**（原创扩展命名）** |
| origin / sect / lineage | `canonExpanded` / `null` / 陈家洛玉峰悟道 |
| sourceChapters | `[ch12_shujian]`；飞狐仅 `partial, lineageGrade:9` |
| category / subType / grade | `unarmed / fist / 10` |
| nature · wOut/wIn · aptitude | `harmony` · 0.35/0.65 · `apFist` |
| reqs | `attrs {wis:60,wil:50}`；`aptitude {apFist:50}`；`lore {min:55}`；`prereq [{anyOf:[{skill:sk_baihuacuo,layer:5},{skill:sk_honghuaxinfa,layer:8}]}]`；`hard:[prereq]` |
| layerStats | `pierce [5,14]`、`hit [2,6]`（合计 20） |
| 层数要点 | 1 循理、中綮；3 游刃；5 因其固然、洞隙；**7 绝招 目无全牛**；**9 绝招批隙导窾**；10 以神遇 |
| moveSlots | 5 |
| setTags | `[set_honghua_shisidangjia]` |
| conflicts / weaponReq | `[] / null` |
| special / observable | `{fusible:false, learnMethod:text}` / `false` |
| 获取 | 书剑玉峰秘洞文字悟道，须完成读文与实战印证，`maxLayer:10`；飞狐由陈家洛复述拳理，`maxLayer:8, lineageGrade:9, partial:true`（原创扩展残承）；正式任务 ID 由章节文档登记 |
| 图鉴文本 | 不以蛮力破物，而以神会其理、从隙处入。它是陈家洛一次悟道所得，不写成红花会人人可承的镇会套路。 |

| 招式（ID） | 重 | 范围·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 循理 `mv_paoding_xunli` | 1 | 单体·近 | 1.00 | 8%/0/1000 | — | 可 | `1.00` |
| 中綮 `mv_paoding_zhongqing` | 1 | 单体·近 | 1.05 | 8%/1/1000 | `bf_pojia` 60%·2 | 可 | `1+0.12−0.10×0.6=1.06≈1.05` |
| 游刃 `mv_paoding_youren` | 3 | 突进 3·近 | 1.00 | 9%/1/1000 | 自身突进；目标 `bf_pozhao` 20%·1 | 可 | `1×(1+0.12+0.05)−0.10−0.10×0.2=1.05≈1.00` |
| 因其固然 `mv_paoding_guran` | 5 | 线2·近 | 1.05 | 9%/2/1000 | `bf_pojia` 100%·2 | 可 | N=2、AF=0.90；`0.90×(1+0.24+0.05)−0.10=1.06≈1.05` |
| **目无全牛** `mv_paoding_muwuquanniu`（绝招） | 7 | 单体·近 | 2.80 | 10%/—/1200 | 自身 `bf_wushi_fangyu`×1；目标 `bf_pozhao` 100%·1 | 可 | `3.00−0.10−0.10=2.80`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |
| 批隙导窾 `mv_paoding_daokuan`（绝招，**原创扩展命名**） | 9 | 单体·近；目标有 `weaken.def` | 2.95 | 10%/—/1200 | `bf_neishang` 40%·3；气势 100 | 可 | `3.00−0.10×0.40=2.96≈2.95`；虚弱条件不另抬绝招基础倍率；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |

| 被动 ID | 名称 | 重 | 类 / 乘区 | 数值与说明 |
|---|---|---:|---|---|
| `ps_paoding_youren` | 游刃有余 | 3 | trigger | 本武学击破护体后获得 `bf_dongxi` 2 回合，每回合 1 次 |
| `ps_paoding_jianxi` | 见隙 | 5 | stat / Z2 | 对带 `weaken.def` 的目标忽略外防 6%→12% |
| `ps_paoding_daokuan` | 批隙导窾 | 9 | stat / Z3 | 对 `bf_pojia` 或 `bf_pozhao` 目标 +10% |
| `ps_paoding_dacheng` | 以神遇 | 10 | mechanic / Z0 | 每次命中未触发暴击时积 1 层“理”；3 层转为 `bf_wushi_fangyu`×1 |

### 2.3 红花会与天池传承关系

- 百花错拳的创传归袁士霄，陈家洛是传人；因陈家洛兼任总舵主，数据上用 `sect_honghuahui` 连接获取，但 `lineage` 不改写。
- 庖丁解牛掌是陈家洛悟道所得，`sect:null`；红花会职级不替代玉峰悟道任务。
- 两门在飞狐出现的是作者已定的 9 品残承，只进入“可习得池”的地上行，不在地阶定义数或天级完整原生数中重复计数。

---

## 3. 辽东胡家天级

### 3.1 `sk_hujiadao` 胡家刀法（10 天下 · 兵器/刀）

| 字段 | 值 |
|---|---|
| 出处 | 《飞狐外传》《雪山飞狐》胡一刀、胡斐与胡家刀谱；刀法与苗家剑法互知破绽。具体原著招名与胡苗沧州比武段落待考；下表招名均为**（原创扩展命名）** |
| origin / sect / lineage | `canonExpanded` / `sect_hujia` / 辽东胡家 |
| sourceChapters | `[ch13_feihu,ch14_xueshan]` |
| category / subType / grade | `weapon / blade / 10` |
| nature · wOut/wIn · aptitude | `yang` · 0.70/0.30 · `apBlade` |
| weaponReq | `{category:blade}`；冷月宝刀 `eq_lengyuedao` 的专属效果见 `design/10`，不在本文重定义 |
| reqs | `attrs {str:55,agi:50,wil:50}`；`aptitude {apBlade:55}`；`prereq [{skill:sk_hujiadaoxinfa,layer:7},{anyOf:[{skill:sk_liaodonghushendao,layer:7},{skill:sk_hujiaquan,layer:5}]}]`；`hard:[prereq]` |
| layerStats | `crit [4,10]`、`parry [3,10]`（合计 20） |
| 层数要点 | 1 迎门、藏锋、刀拳互证；3 料敌；5 势沉、回身；**7 绝招 辽东风雪**；8 战意；**9 绝招胡苗互照**；10 刀谱圆融 |
| moveSlots | 5 |
| setTags | `[set_hujia_lengyue]` |
| conflicts | 无；与苗家剑法是“互知破绽”而非互斥 |
| special / observable | `{fusible:true}` / `false` |
| 获取 | 飞狐：胡家刀谱残本，缺首二页，`maxLayer:8`（物品与机制见 `design/10`）；胡斐羁绊可实战补至 9。雪山：寻回缺页合全本或与胡斐切磋，`maxLayer:10`；外来完整记录在雪山完成印证。 |
| 图鉴文本 | 辽东胡氏家传刀法，劲路刚健而转折精微。胡、苗两家百年交锋留下的不只是仇怨，也让刀剑双方都熟知彼此最危险的空隙。 |

| 招式（ID） | 重 | 范围·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 迎门一刀 `mv_hujiadao_yingmen` | 1 | 单体·近 | 1.00 | 8%/0/1000 | — | 可 | `1.00` |
| 藏锋回刃 `mv_hujiadao_cangfeng` | 1 | 单体·近 | 1.05 | 7%/2/900 | 自身 `bf_shoushi` 1 回合 | 可 | `1+0.24−0.05−0.07−0.10=1.02≈1.05` |
| 横断关山 `mv_hujiadao_guanshan` | 3 | 线2·近 | 1.10 | 9%/2/1000 | `bf_liuxue` 50%·2 | 可 | N=2、AF=0.90；`0.90×(1+0.24+0.05)−0.10×0.5=1.11≈1.10` |
| 刀走偏锋 `mv_hujiadao_pianfeng` | 5 | 横扫·近 | 1.05 | 9%/2/1000 | `bf_pozhao` 50%·1 | 可 | N=3、AF=0.85；`0.85×1.29−0.10×0.5=1.0465≈1.05` |
| 回身望月 `mv_hujiadao_wangyue` | 5 | 绕背·近 | 0.95 | 8%/2/1000 | 绕背 | 可 | `0.90×1.24−0.15=0.97≈0.95` |
| **辽东风雪** `mv_hujiadao_fengxue`（绝招） | 7 | 锥2·近 | 2.15 | 10%/—/1200 | `bf_liuxue` 100%·2；自身 `bf_shichen` 2 回合 | 可 | N=4、AF=0.80；`3×0.80−0.10−0.15=2.15`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |
| 胡苗互照 `mv_hujiadao_humiaohuzhao`（绝招，**原创扩展命名**） | 9 | 单体·近；目标用剑 | 2.95 | 10%/—/1200 | `bf_pozhao` 60%·1；气势 100 | 可 | `3.00−0.10×0.60=2.94≈2.95`；持剑条件不另抬绝招基础倍率；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |

| 被动 ID | 名称 | 重 | 类 / 乘区 | 数值与说明 |
|---|---|---:|---|---|
| `ps_hujiadao_daoguan` | 刀拳互证 | 1 | stat / Z3 | 同时装配胡家拳时，两门伤害 +4%→8% |
| `ps_hujiadao_liaodi` | 料敌 | 3 | trigger | `onParry` 每回合 1 次，获得 `bf_xushi`；若来招为剑，触发率 +20pp |
| `ps_hujiadao_shichen` | 势沉 | 5 | trigger | 使用收招 ≥1100 的本武学招式后，获得 `bf_shichen` 2 回合 |
| `ps_hujiadao_zhanyi` | 战意 | 8 | trigger | `onCrit` 或 `onKill` 时获得 `bf_zhanyi` 1 层，上限按 06 |
| `ps_hujiadao_dacheng` | 刀谱圆融 | 10 | mechanic / Z0 | 每场首次把 `bf_zhanyi` 叠满时获得 `bf_bibao`×1 |

### 3.2 胡家刀谱与冷月宝刀接口

1. 飞狐所获残本限制 `maxLayer:8`，不是 9 品残承；绝对品阶仍为 10，来源层数上限独立保存。
2. 雪山寻回首二页后，同一 `SkillState.sourceCap` 提升至 10；若从飞狐携入，则按 `design/02` 的原生印证解除当地品阶压制。
3. `eq_lengyuedao` 的器合、强化与“胡家传刀”效果见 `design/10` §5、§6；本文只把装备列为套装候选，不复制数值。

---

## 4. 地阶完整条目卡

### 4.1 `sk_miaojiajian` 苗家剑法（9 地上 · 兵器/剑）

| 字段 | 值 |
|---|---|
| 出处 | 《飞狐外传》《雪山飞狐》苗人凤家传剑法；与胡家刀法互知破绽。正式招名与回目待考，本文招名均为**（原创扩展命名）** |
| origin / sect / lineage | `canonExpanded` / `sect_miaojia` / 苗氏家传 |
| sourceChapters | `[ch13_feihu,ch14_xueshan]` |
| category / subType / grade | `weapon / sword / 9` |
| nature · wOut/wIn · aptitude | `harmony` · 0.55/0.45 · `apSword` |
| weaponReq | `{category:sword}` |
| reqs | `attrs {agi:50,wis:45}`；`aptitude {apSword:50}`；`prereq [{skill:sk_miaojiajiangong,layer:7},{skill:sk_miaojiaxinfa,layer:6}]`；`sect {id:sect_miaojia,rank:4}`；`hard:[sect,prereq]` |
| layerStats | `parry [3,8]`、`pierce [2,7]`（合计 15） |
| 层数要点 | 1 正锋、试刀、剑心；3 披风；5 回锋；**7 绝招 剑照八方**；**9 绝招守隙反刺、被动胡苗互照**；10 金面佛剑意 |
| moveSlots / setTags | `4 / []` |
| conflicts / special / observable | 无 / `{fusible:true}` / `false` |
| 获取 | 苗家 L4 可学至 8 重、L5 可圆满；飞狐、雪山苗人凤羁绊与胡苗真相线使用 `reqsOverride:{sect:null}`，仍保留两项前置；观摩仅至 5 重 |
| 图鉴文本 | 苗人凤一脉家传剑术，取势端正、守中寻隙。与胡家刀法相斗百年，最深的传承恰是对方招中哪里最险、哪里可解。 |

| 招式（ID） | 重 | 范围·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 正锋 `mv_miaojiajian_zhengfeng` | 1 | 单体·近 | 1.00 | 7%/0/1000 | — | 可 | `1.00` |
| 剑试胡刀 `mv_miaojiajian_shidao` | 1 | 单体·近；目标持刀 | 1.10 | 7%/0/1000 | `bf_pozhao` 50%·1 | 可 | `1+条0.15−0.10×0.5=1.10` |
| 披风走剑 `mv_miaojiajian_pifeng` | 3 | 线2·近 | 1.00 | 7%/1/1000 | — | 可 | N=2、AF=0.90；`0.90×1.12=1.008≈1.00` |
| 回锋照隙 `mv_miaojiajian_huifeng` | 5 | 绕背·近 | 0.95 | 7%/2/1000 | 绕背 | 可 | `0.90×1.24−0.15=0.97≈0.95` |
| **剑照八方** `mv_miaojiajian_bafang`（绝招） | 7 | 周身·近 | 2.15 | 9%/—/1200 | `bf_pozhao` 100%·1 | 可 | N=6、AF=0.75；`3×0.75−0.10=2.15`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 守隙反刺 `mv_miaojiajian_shouxi`（绝招，**原创扩展命名**） | 9 | 单体·近 | 2.90 | 9%/—/1200 | 自身 `bf_shoushi` 1 回合；气势 100 | 可 | `3.00−0.10=2.90`；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 ID | 名称 | 重 | 类 / 乘区 | 数值与说明 |
|---|---|---:|---|---|
| `ps_miaojiajian_jianxin` | 剑心端正 | 1 | stat / Z4 | 招架减伤 +5%→10% |
| `ps_miaojiajian_xunzhen` | 寻隙 | 4 | stat / Z3 | 对 `bf_pozhao` 目标 +8% |
| `ps_miaojiajian_humiaohuzhao` | 胡苗互照 | 9 | trigger | 招架刀招后每回合 1 次获得 `bf_bizhong`×1 |
| `ps_miaojiajian_dacheng` | 金面佛剑意 | 10 | mechanic / Z0 | 每回合第一次招架失败仍按成功招架减伤的 50% 结算 |

### 4.2 `sk_yaowangdujing` 药王毒经（8 地中 · 杂学/毒）

| 字段 | 值 |
|---|---|
| 出处 | 《飞狐外传》毒手药王无嗔一门的医毒传承；典籍正式名称待考。本文只作虚构战斗抽象，不给出现实毒物配制、剂量或使用方法 |
| origin / sect / lineage | `canonExpanded` / `sect_yaowangmen` / 毒手药王一门 |
| sourceChapters | `[ch13_feihu,ch14_xueshan]` |
| category / subType / grade | `misc / poison / 8` |
| nature · wOut/wIn | `yin` · 0.15/0.85 |
| reqs | `attrs {wis:50,wil:45}`；`skills {med:55,poi:60,antidote:50}`；`prereq [{skill:sk_yaowangtuna,layer:7},{skill:sk_yaowangzhenfa,layer:6}]`；`sect {id:sect_yaowangmen,rank:3}`；`hard:[sect,prereq,skills.poi]` |
| layerStats | `effHit [3,8]`、`resPoison [3,7]`（合计 15） |
| 层数要点 | 1 辨毒、试毒、医毒同源；3 避毒；5 以毒攻毒；**7 绝招 百毒归经**；9 毒理反照（普通招）；10 药王衣钵 |
| moveSlots / setTags | `4 / []` |
| conflicts / special / observable | 无 / `{fusible:false}` / `true` |
| 获取 | 飞狐药王门师承使用基础门槛；程灵素羁绊或研读药王遗篇使用 `reqsOverride:{sect:null}`，仍保留前置与硬性 `skills.poi`；雪山以药王门残承复现。`observe` 只能获得见闻，不能凭观察学会 |
| 图鉴文本 | 药王门以识毒、解毒、制衡为先。玩法只表达医毒检定、状态转化与战场风险，不映射现实毒理。 |

| 招式（ID） | 重 | 范围·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 辨毒 `mv_yaowangdujing_biandu` | 1 | 单体友方·支援 | 0 | 5%/2/900 | 驱散 1 个 `poison.common`，最高品阶承 | — | 支援招式，`power 0` |
| 试毒 `mv_yaowangdujing_shidu` | 1 | 单体·投 | 0.80 | 7%/1/1000 | `bf_zhongdu` 100%·3 | 否 | `1×1.12×0.92×0.85−0.10=0.78≈0.80` |
| 隔烟布药 `mv_yaowangdujing_buyao` | 3 | `aoe_zone {inner:{tpl:aoe_disk,r:1},duration:2}`·投 | 0.20/跳 | 8%/2/1000 | `bf_zhongdu` 100%·2 | 否 | 持续地表伤害单独审查；`0.25×(1+0.24+0.05)×0.92×0.85−0.10=0.15≈0.20` |
| 以毒攻毒 `mv_yaowangdujing_yidu` | 5 | 单体友方·支援 | 0 | 6%/3/1000 | 驱散 1 个 `poison`；获得 `bf_hutizhenqi`（目标 hpMax 8%） | — | 支援基准：18% 治疗等价 ×0.6≈10.8%，取护体 8%并含驱散 |
| **百毒归经** `mv_yaowangdujing_baidu`（绝招） | 7 | `aoe_allies r2`·支援 | 0 | 9%/—/1200 | 各驱散 2 个 `poison`，自身获得 `bf_huinei` 2 回合 | — | 支援绝招，`power 0`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 毒理反照 `mv_yaowangdujing_fanzhao`（普通招，**原创扩展命名**） | 9 | 单体·投；目标带 `poison` | 1.00 | 7%/2/1000 | `bf_judu` 40%·2 | 否 | `(1+0.24+条0.15)×0.92×0.85−0.10×0.40=1.048→1.00`；`MoveDef{unlock:9; ultimate:false; rageCost:0; mpCost:7%; cd:2; recovery:1000}` |

| 被动 ID | 名称 | 重 | 类 / 乘区 | 数值与说明 |
|---|---|---:|---|---|
| `ps_yaowangdujing_yidutongyuan` | 医毒同源 | 1 | stat / none | `med` 与 `poi` 检定取两者较高值的 25% 补给较低者（不改变存档值） |
| `ps_yaowangdujing_bidu` | 避毒 | 3 | stat / Z0 | `attr:resPoison pp +8→15` |
| `ps_yaowangdujing_fanzhi` | 反制 | 6 | trigger | 成功驱散毒后，目标获得 `bf_huinei` 1 回合 |
| `ps_yaowangdujing_dacheng` | 药王衣钵 | 10 | mechanic / none | 战斗中首次遭受高于自身有效品阶的毒时立即识破，但不免疫 |

### 4.3 `sk_qixinhaitang` 七心海棠法（8 地中 · 暗器）

| 字段 | 值 |
|---|---|
| 出处 | 《飞狐外传》程灵素与七心海棠；植物与毒性属于小说设定。武学名为**（原创扩展命名）**，不提供现实栽培或制毒信息 |
| origin / sect / lineage | `canonExpanded` / `sect_yaowangmen` / 程灵素 |
| sourceChapters | `[ch13_feihu,ch14_xueshan]` |
| category / subType / grade | `hidden / hidden / 8`；使用 `apHidden` 与暗器栏 |
| nature · wOut/wIn · aptitude | `yin` · 0.30/0.70 · `apHidden` |
| reqs | `attrs {agi:45,wis:55}`；`aptitude {apHidden:45}`；`skills {poi:65,med:55}`；`prereq [{skill:sk_yaowangzhenfa,layer:7},{skill:sk_yaowanghushou,layer:5}]`；`sect {id:sect_yaowangmen,rank:3}`；`hard:[sect,prereq,skills.poi]` |
| layerStats | `effHit [4,10]`、`crit [1,5]`（合计 15） |
| 层数要点 | 1 无色、留香、潜毒；3 藏锋；5 双叶、识毒；**7 绝招 海棠无声**；9 迟发（普通招）、被动迟发；10 七心 |
| moveSlots / setTags | `4 / []` |
| conflicts / weaponReq | 无 / `{ammoTag:qixin, category:hidden}` |
| special / observable | `{fusible:false}` / `false` |
| 获取 | 药王门衣钵线使用基础门槛；飞狐程灵素 D5 羁绊使用 `reqsOverride:{sect:null}`，仍保留前置与硬性 `skills.poi`；雪山只在其存活 / 传承分支开放（章节定）。七心海棠素材见 `design/10`，本文不定义配方 |
| 图鉴文本 | 将七心海棠的“无声潜伏”抽象成延迟显现的暗器战法。它不是普通毒镖，更不是可供现实仿制的技艺。 |

| 招式（ID） | 重 | 范围·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 无色 `mv_qixinhaitang_wuse` | 1 | 单体·投 | 0.85 | 7%/1/1000 | `bf_qixin` 25%·2 | 否 | `1×1.12×0.92×0.85−0.10×0.25=0.85` |
| 留香 `mv_qixinhaitang_liuxiang` | 1 | 单体·投 | 0.75 | 6%/1/900 | `bf_zhongdu` 70%·3 | 否 | `(1+0.12−0.05−0.07)×0.92×0.85−0.10×0.7=0.71≈0.75` |
| 双叶 `mv_qixinhaitang_shuangye` | 3 | 线2·投 | 0.85 | 8%/2/1000 | `bf_qixin` 40%·2 | 否 | N=2、AF=0.90；`0.90×1.29×0.92×0.85−0.10×0.4=0.87≈0.85` |
| 藏锋 `mv_qixinhaitang_cangfeng` | 5 | 单体·投；未被目标看见 | 1.00 | 7%/2/1000 | `bf_mabi` 35%·2 | 否 | `(1+0.24+条0.15)×0.92×0.85−0.25×0.35=1.00` |
| **海棠无声** `mv_qixinhaitang_wusheng`（绝招） | 7 | 单体·投 | 2.25 | 9%/—/1200 | `bf_qixin` 100%·2 | 否 | `3×0.92×0.85−0.10=2.25`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 迟发 `mv_qixinhaitang_chifa`（普通招，**原创扩展命名**） | 9 | `aoe_zone {inner:{tpl:aoe_disk,r:1},duration:2}`·投 | 0.20/跳 | 8%/3/1000 | `bf_qixin` 30%·2 | 否 | 持续地表伤害单独审查；`0.25×(1+0.36+0.05)×0.92×0.85−0.10×0.30=0.246→0.20`；`MoveDef{unlock:9; ultimate:false; rageCost:0; mpCost:8%; cd:3; recovery:1000}` |

| 被动 ID | 名称 | 重 | 类 / 乘区 | 数值与说明 |
|---|---|---:|---|---|
| `ps_qixinhaitang_qiandu` | 潜毒 | 1 | stat / Z0 | 七心海棠的识破门槛 `med/poi` +5→+10（只改检定，不改 06 状态本体） |
| `ps_qixinhaitang_shidu` | 识毒 | 5 | stat / Z0 | 自身识破隐藏毒的检定 +10 |
| `ps_qixinhaitang_chifa` | 迟发 | 9 | stat / Z3 | 对尚未识破 `bf_qixin` 的目标，本武学伤害 +10% |
| `ps_qixinhaitang_dacheng` | 七心 | 10 | mechanic / none | 每战首枚消耗的七心海棠暗器返还；不产生额外材料 |

> `bf_qixin` 的原生品阶范围是 8–10，因此本文将 `sk_qixinhaitang` 定为 **8 地中**，覆盖 `design/17` 旧候选的 7 地下建议。

### 4.4 `sk_tianshanyingyang` 天山鹰扬功（8 地中 · 轻功）

| 字段 | 值 |
|---|---|
| 出处 | 《书剑恩仇录》“天山双鹰”陈正德、关明梅相关身法据人物称号扩写；是否有正式轻功名待考，故为**（原创扩展命名）** |
| origin / sect / lineage | `canonExpanded` / `null` / 天山双鹰 |
| sourceChapters | `[ch12_shujian]`；飞狐、雪山隐世复现为**（原创扩展）** |
| category / subType / grade | `movement / movement / 8` |
| nature · wOut/wIn · aptitude | `harmony` · 0.45/0.55 · `apLight` |
| reqs | `attrs {agi:50,wil:40}`；`aptitude {apLight:50}`；`prereq [{skill:sk_tianchibu,layer:7}]`；`hard:[prereq]` |
| layerStats | `eva [3,9]`、`mov [1,3]`、`jump [1,3]`（合计 15） |
| 轻功值 | 满层 `Q_skill = QS(8) = 104`，是三书本土轻功上限，不得再由本组新增更高轻功 |
| 层数要点 | 1 鹰起、双翼；3 掠雪；5 盘空、借风；**7 绝招 鹰扬天际**；9 鹰落（普通招）、被动回旋；10 天山纵横 |
| moveSlots / setTags | `4 / []` |
| conflicts / special / observable | 无 / `{fusible:true}` / `true` |
| 获取 | 书剑天山双鹰羁绊或救援线；飞狐/雪山在同一传承人的隐世支线复现（原创扩展），均不超过地中 |
| 图鉴文本 | 借天山峭壁与长风练出的腾挪法，长于跨越、回旋和照应同伴。名称与战斗招式为本作扩写。 |

| 招式（ID） | 重 | 范围·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 鹰起 `mv_tianshanyingyang_yingqi` | 1 | 自身·支援 | 0 | 6%/2/800 | `bf_jixing` 2 回合 | — | 支援招式，`power 0` |
| 双翼 `mv_tianshanyingyang_shuangyi` | 1 | 自身与相邻友方·支援 | 0 | 7%/3/900 | 各获 `bf_piaohu` 2 回合 | — | 支援招式，`power 0` |
| 掠雪 `mv_tianshanyingyang_luexue` | 3 | 突进 4·近 | 1.15 | 7%/2/1000 | 自身突进 | 可 | `1×1.24−0.10=1.14≈1.15` |
| 盘空 `mv_tianshanyingyang_pankong` | 5 | 自身·支援 | 0 | 6%/3/800 | `bf_youshi` 2 回合；跳跃 +1（结构化位移修正） | — | 支援招式，`power 0` |
| **鹰扬天际** `mv_tianshanyingyang_tianji`（绝招） | 7 | `aoe_allies r2`·支援 | 0 | 9%/—/1200 | 全体 `bf_jixing`、`bf_piaohu` 2 回合 | — | 支援绝招，`power 0`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 鹰落 `mv_tianshanyingyang_yingluo`（普通招，**原创扩展命名**） | 9 | 跳斩 4·近 | 1.05 | 8%/2/1000 | 自身跳斩；`bf_shiheng` 50%·1 | 可 | `0.90×(1+0.24+0.05)−0.10−0.10×0.50=1.011→1.05`；`MoveDef{unlock:9; ultimate:false; rageCost:0; mpCost:8%; cd:2; recovery:1000}` |

| 被动 ID | 名称 | 重 | 类 / 乘区 | 数值与说明 |
|---|---|---:|---|---|
| `ps_tianshanyingyang_shuangying` | 双鹰照应 | 1 | stat / Z4 | 相邻友方存在时双方防御 +4%→8% |
| `ps_tianshanyingyang_yufeng` | 借风 | 5 | stat / none | 探索攀崖、跃隙体力消耗 −15%→25%（门禁仍见 08） |
| `ps_tianshanyingyang_huixuan` | 回旋 | 9 | trigger | 位移结束后若与起点不在同一直线，获得 `bf_piaohu` 1 回合 |
| `ps_tianshanyingyang_dacheng` | 天山纵横 | 10 | mechanic / none | 每回合第一次自身位移不触发敌方截击 |

### 4.5 `sk_honghuahuiheji` 红花会合击（7 地下 · 杂学/阵法）

| 字段 | 值 |
|---|---|
| 出处 | 据《书剑恩仇录》红花会十四当家联手群像扩写；原著是否有正式同名阵法待考，故为**（原创扩展）** |
| origin / sect / lineage | `expanded` / `sect_honghuahui` / 十四当家协作 |
| sourceChapters | `[ch12_shujian]` |
| category / subType / grade | `misc / formation / 7` |
| nature · wOut/wIn | `harmony` · 0.60/0.40 |
| reqs | `attrs {wis:40,cha:40}`；`skills {formation:40}`；`sect {id:sect_honghuahui,rank:4}`；`prereq [{skill:sk_honghuachangquan,layer:5},{skill:sk_honghuaxinfa,layer:6}]`；`hard:[sect,prereq]` |
| layerStats | `effHit [3,8]`、`parry [2,7]`（合计 15） |
| 层数要点 | 1 接应、轮战、群侠同心；3 补位；5 传讯；**7 绝招 十四当家**；9 互援；10 红花同心 |
| moveSlots / setTags | `4 / [set_honghua_shisidangjia]` |
| conflicts / special / observable | 无 / `{fusible:false, optionalAssist:true}` / `true` |
| 获取 | 红花会 L4 由首席当家传授；书剑群雄联手事件后可学。单人可以施展，邻近同伴只强化，不以同伴为合法性门槛 |
| 图鉴文本 | 将十四当家的换位、接应与轮番进招抽象成一人也能演练的阵法总诀；队友在场时更强，但不是必须多人才能施放。 |

| 招式（ID） | 重 | 范围·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 轮战 `mv_honghuahuiheji_lunzhan` | 1 | 单体·近 | 1.05 | 7%/1/1000 | 相邻友方存在时 `bf_pozhao` 50%·1 | 可 | `1+0.12−0.10×0.5=1.07≈1.05` |
| 接应 `mv_honghuahuiheji_jieying` | 1 | 相邻友方·支援 | 0 | 5%/2/800 | 友方 `bf_yuanhu` 2 回合 | — | 支援招式 |
| 补位 `mv_honghuahuiheji_buwei` | 3 | 友方换位 3·支援 | 0 | 6%/2/800 | 换位后双方 `bf_youshi` 1 回合 | — | 支援招式 |
| 夹击 `mv_honghuahuiheji_jiaji` | 5 | 单体·近；友方邻接目标 | 1.25 | 7%/1/1000 | `bf_shiheng` 50%·1 | 可 | `1+0.12+条0.15−0.10×0.5=1.22≈1.25` |
| **十四当家** `mv_honghuahuiheji_shisidangjia`（绝招） | 7 | `aoe_allies r2`·支援 | 0 | 9%/—/1200 | 全体 `bf_zhuiji` 2 回合、`bf_yuanhu` 2 回合 | — | 支援绝招；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 会旗所向 `mv_honghuahuiheji_huiqi` | 9 | 锥2·近 | 0.95 | 8%/2/1000 | 自身 `bf_gongshi` 2 回合 | 可 | N=4、AF=0.80；`0.80×(1+0.24+0.05)−0.10=0.932≈0.95` |

| 被动 ID | 名称 | 重 | 类 / 乘区 | 数值与说明 |
|---|---|---:|---|---|
| `ps_honghuahuiheji_tongxin` | 群侠同心 | 1 | stat / Z3 | 每个 2 格内友方使本阵攻击 +2%，最多 +8%；无友方时仍可用 |
| `ps_honghuahuiheji_chuandi` | 传递 | 5 | trigger | 自身获得增益时，每回合 1 次使相邻友方获得同 ID、1 回合版本 |
| `ps_honghuahuiheji_huyuan` | 互援 | 9 | stat / Z4 | 持有 `bf_yuanhu` 时减伤额外 +5% |
| `ps_honghuahuiheji_dacheng` | 红花同心 | 10 | mechanic / none | 战斗开始给最近友方与自身各施加 `bf_yuanhu` 1 回合 |

### 4.6 `sk_hujiaquan` 胡家拳（7 地下 · 拳脚/拳掌）

| 字段 | 值 |
|---|---|
| 出处 | 《飞狐外传》胡斐家学（正式名目与招式待考）；本文招名为**（原创扩展命名）** |
| origin / sect / lineage | `canonExpanded` / `sect_hujia` / 辽东胡家 |
| sourceChapters | `[ch13_feihu,ch14_xueshan]` |
| category / subType / grade | `unarmed / fist / 7` |
| nature · wOut/wIn · aptitude | `yang` · 0.65/0.35 · `apFist` |
| reqs | `attrs {str:40,agi:35}`；`aptitude {apFist:40}`；`prereq [{skill:sk_hujiaxiaolianquan,layer:6},{skill:sk_hujiadaoxinfa,layer:5}]`；`sect {id:sect_hujia,rank:3}`；`hard:[sect,prereq]` |
| layerStats | `hit [2,7]`、`parry [2,8]`（合计 15） |
| 层数要点 | 1 探门、架刀、拳刀同门；3 贴身；5 翻腕；**7 绝招 拳刀一理**；9 夺势；10 家学圆融 |
| moveSlots / setTags | `4 / [set_hujia_lengyue]` |
| special / observable | `{fusible:true}` / `true` |
| 获取 | 胡家 L3 使用基础门槛；胡斐羁绊使用 `reqsOverride:{sect:null}`，仍保留两项前置。刀谱旁注只给拳理见闻，仍须胡斐实战解锁 7 重以上 |
| 图鉴文本 | 胡家拳与刀法同源：徒手时练的是入门、架拆与转折，回到刀上便成为料敌先机的根基。 |

| 招式（ID） | 重 | 范围·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 探门 `mv_hujiaquan_tanmen` | 1 | 单体·近 | 1.00 | 7%/0/1000 | — | 可 | `1.00` |
| 架刀 `mv_hujiaquan_jiadao` | 1 | 自身架势 | 0 | 5%/2/850 | `bf_shoushi` 1 回合 | — | 架势招式 |
| 贴身靠 `mv_hujiaquan_tieshen` | 3 | 突进 2·近 | 1.00 | 7%/1/1000 | 突进；`bf_shiheng` 30%·1 | 可 | `1×1.12−0.10−0.10×0.3=0.99≈1.00` |
| 翻腕夺势 `mv_hujiaquan_fanwan` | 5 | 单体·近；目标持械 | 1.20 | 7%/1/1000 | `bf_xueweishoufeng(level:7,acupointRef:sourcePrimary)` 30%·2 | 可 | `1+0.12+条0.15−0.20×0.3=1.21≈1.20` |
| **拳刀一理** `mv_hujiaquan_quandao`（绝招） | 7 | 单体·近 | 2.85 | 9%/—/1200 | 自身 `bf_xushi`；目标 `bf_pozhao` 50%·1 | 可 | `3−0.10−0.10×0.5=2.85`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 夺势回身 `mv_hujiaquan_duoshi` | 9 | 横扫·近 | 1.05 | 8%/2/1000 | `bf_shiheng` 50%·1 | 可 | N=3、AF=0.85；`0.85×1.29−0.10×0.5=1.0465≈1.05` |

| 被动 ID | 名称 | 重 | 类 / 乘区 | 数值与说明 |
|---|---|---:|---|---|
| `ps_hujiaquan_quandaotongmen` | 拳刀同门 | 1 | stat / Z3 | 同装胡家刀法时两门 +4%→8% |
| `ps_hujiaquan_tieshen` | 贴身 | 4 | stat / Z4 | 相邻目标对自身的反击伤害 −8% |
| `ps_hujiaquan_duoshi` | 夺势 | 9 | trigger | 对持刀目标成功招架后获得 `bf_gongshi` 1 回合 |
| `ps_hujiaquan_dacheng` | 家学圆融 | 10 | mechanic / none | 徒手与持刀切换不重置本门 `bf_zhanyi` 层数 |

### 4.7 `sk_baguadao` 八卦刀（7 地下 · 兵器/刀）

| 字段 | 值 |
|---|---|
| 出处 | 《书剑恩仇录》《飞狐外传》王维扬、商剑鸣相关八卦门传承；正式套路名、招式与人物关系待考。现实八卦掌年代不可反证小说设定 |
| origin / sect / lineage | `canonExpanded` / `sect_baguamen` / 八卦门 |
| sourceChapters | `[ch12_shujian,ch13_feihu,ch14_xueshan]` |
| category / subType / grade | `weapon / blade / 7` |
| nature · wOut/wIn · aptitude | `harmony` · 0.60/0.40 · `apBlade` |
| weaponReq / reqs | `{category:blade}`；`attrs {agi:40,wis:35}`；`aptitude {apBlade:40}`；`prereq [{skill:sk_baguachujidao,layer:6},{skill:sk_baguazhang,layer:5}]`；`sect {id:sect_baguamen,rank:4}`；`hard:[sect,prereq]` |
| layerStats | `parry [3,8]`、`crit [2,7]`（合计 15） |
| 层数要点 | 1 开门、休门、刀掌同环；3 生门；5 景门；**7 绝招 八门齐转**；9 杜门；10 周流 |
| moveSlots / setTags | `4 / []` |
| special / observable | `{fusible:true}` / `true` |
| 获取 | 八卦门 L4 使用基础门槛；书剑镇远 / 威信镖业相关线、飞狐商家旧怨线与雪山残承若授予门外玩家，须用 `reqsOverride:{sect:null}` 且保留两项前置，具体由章节定 |
| 图鉴文本 | 八卦门刀术以步带刀、绕侧换门。本文不把现实拳种谱系强附会到小说人物，只保留小说武学与玩法扩写。 |

| 招式（ID） | 重 | 范围·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 开门斩 `mv_baguadao_kaimen` | 1 | 单体·近 | 1.00 | 7%/0/1000 | — | 可 | `1.00` |
| 休门回刀 `mv_baguadao_xiumen` | 1 | 绕背·近 | 0.95 | 7%/2/1000 | 绕背 | 可 | `0.90×1.24−0.15=0.97≈0.95` |
| 生门连环 `mv_baguadao_shengmen` | 3 | 线2·近 | 1.00 | 7%/1/1000 | — | 可 | N=2、AF=0.90；`0.90×1.12=1.008≈1.00` |
| 景门横断 `mv_baguadao_jingmen` | 5 | 横扫·近 | 1.05 | 8%/2/1000 | `bf_pozhao` 30%·1 | 可 | N=3、AF=0.85；`0.85×1.29−0.10×0.3=1.0665≈1.05` |
| **八门齐转** `mv_baguadao_bamen`（绝招） | 7 | 周身·近 | 2.10 | 9%/—/1200 | 自身 `bf_youshi` 2 回合；目标 `bf_shiheng` 50%·1 | 可 | N=6、AF=0.75；`3×0.75−0.10−0.10×0.5=2.10`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 杜门封路 `mv_baguadao_dumen` | 9 | 线3·近 | 1.15 | 8%/3/1000 | `bf_jiansu` 60%·2 | 可 | N=3、AF=0.85；`0.85×(1+0.36+0.05)−0.10×0.6=1.14≈1.15` |

| 被动 ID | 名称 | 重 | 类 / 乘区 | 数值与说明 |
|---|---|---:|---|---|
| `ps_baguadao_daosuiti` | 刀随步转 | 1 | stat / Z3 | 本回合移动 ≥2 格后，本门伤害 +5%→10% |
| `ps_baguadao_huanmen` | 换门 | 5 | trigger | 绕背后获得 `bf_youshi` 1 回合 |
| `ps_baguadao_dumen` | 杜门 | 9 | stat / Z4 | 来自正面的兵器伤害 −8% |
| `ps_baguadao_dacheng` | 八卦周流 | 10 | mechanic / none | 每回合第一次绕背的位移成本为 0，但伤害预算不变 |

### 4.8 `sk_huibuqijian` 回部奇剑（7 地下 · 兵器/剑）

| 字段 | 值 |
|---|---|
| 出处 | 据《书剑恩仇录》霍青桐等回部人物交手扩写；原著是否有统一套路名待考，故为**（原创扩展命名）** |
| origin / sect / lineage | `canonExpanded` / `sect_huibu` / 回部勇士传承 |
| sourceChapters | `[ch12_shujian,ch13_feihu,ch14_xueshan]`（后两者为原创延续） |
| category / subType / grade | `weapon / sword / 7` |
| nature · wOut/wIn · aptitude | `harmony` · 0.55/0.45 · `apSword` |
| weaponReq / reqs | `{category:sword}`；`attrs {agi:40,wis:35}`；`aptitude {apSword:40}`；`prereq [{skill:sk_huibuchujian,layer:6},{skill:sk_huibujianshu,layer:5}]`；`sect {id:sect_huibu,rank:4}`；`hard:[sect,prereq]` |
| layerStats | `eva [2,7]`、`hit [3,8]`（合计 15） |
| 层数要点 | 1 绿洲迎客、护营；3 回马；5 飞砂；**7 绝招 天山回风**；9 护旗；10 奇剑圆融 |
| moveSlots / setTags | `4 / []` |
| special / observable | `{fusible:true}` / `true` |
| 获取 | 回部 L4 使用基础门槛；霍青桐羁绊线使用 `reqsOverride:{sect:null}`，不免两项前置；飞狐 / 雪山为部族支线原创延续 |
| 图鉴文本 | 从营地护卫、马战转身与绿洲短兵相接中提炼的剑术。只描述小说人物和虚构玩法，不把“回部”写成单一现代民族武术。 |

| 招式（ID） | 重 | 范围·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 绿洲迎客 `mv_huibuqijian_yingke` | 1 | 单体·近 | 1.00 | 7%/0/1000 | — | 可 | `1.00` |
| 护营 `mv_huibuqijian_huying` | 1 | 自身架势 | 0 | 5%/2/850 | `bf_shoushi` 1 回合 | — | 架势招式 |
| 回马剑 `mv_huibuqijian_huima` | 3 | 突进 3·近 | 1.05 | 7%/1/1000 | 突进 | 可 | `1×1.12−0.10=1.02≈1.05` |
| 飞砂掩锋 `mv_huibuqijian_feisha` | 5 | 锥2·近 | 1.00 | 8%/2/1000 | `bf_shiheng` 40%·1 | 可 | N=4、AF=0.80；`0.80×1.29−0.10×0.4=0.992≈1.00` |
| **天山回风** `mv_huibuqijian_huifeng`（绝招） | 7 | 周身·近 | 2.10 | 9%/—/1200 | 自身 `bf_youshi` 2 回合；目标 `bf_jiansu` 50%·2 | 可 | N=6、AF=0.75；`3×0.75−0.10−0.10×0.5=2.10`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 护旗反刺 `mv_huibuqijian_huqi` | 9 | 单体·近；相邻友方存在 | 1.20 | 7%/1/1000 | 自身 `bf_yuanhu` 1 回合 | 可 | `1+0.12+条0.15−0.10=1.17≈1.20` |

| 被动 ID | 名称 | 重 | 类 / 乘区 | 数值与说明 |
|---|---|---:|---|---|
| `ps_huibuqijian_huying` | 护营 | 1 | stat / Z4 | 相邻友方受单体攻击时，自身对该攻击者减伤 +5%→10% |
| `ps_huibuqijian_feisha` | 飞砂 | 5 | trigger | 沙地上回合开始获得 `bf_piaohu` 1 回合 |
| `ps_huibuqijian_huqi` | 护旗 | 9 | trigger | `onAllyHit` 每回合 1 次获得 `bf_zhuiji` 1 回合 |
| `ps_huibuqijian_dacheng` | 奇剑圆融 | 10 | mechanic / none | 骑乘状态下近战剑招不受转向收招惩罚（骑乘规则见 09） |

### 4.9 `sk_zhangmenboyi` 掌门博艺（7 地下 · 杂学/心神）

| 字段 | 值 |
|---|---|
| 出处 | 据《飞狐外传》天下掌门人大会“观百派、辨来路、临场拆解”改编；武学名与机制均为**（原创扩展）** |
| origin / sect / lineage | `expanded` / `null` / 天下掌门人大会会武所得 |
| sourceChapters | `[ch13_feihu]` |
| category / subType / grade | `misc / mind / 7` |
| nature · wOut/wIn | `harmony` · 0.45/0.55 |
| reqs | `attrs {wis:45,wil:40}`；`lore {min:45}`；`prereq [{anyOf:[{skill:sk_guandongliumodao,layer:6},{skill:sk_shangjiaquan,layer:6},{skill:sk_taijimenquan,layer:6},{skill:sk_baguazhang,layer:6},{skill:sk_tianlongjian,layer:6},{skill:sk_weituomenquan,layer:6},{skill:sk_baxianjian,layer:6},{skill:sk_bajiquan,layer:6},{skill:sk_jiulongbian,layer:6}]}]`；`hard:[prereq]` |
| layerStats | `hit [3,8]`、`parry [2,7]`（合计 15） |
| 层数要点 | 1 识派、试手、见招；3 记路；5 借鉴；**7 绝招 百派一览**；9 临阵校谱；10 博艺不杂 |
| moveSlots / setTags | `4 / []` |
| conflicts / special / observable | 无 / `{fusible:false, forcedTeam:false}` / `true` |
| 获取 | 飞狐掌门人大会完成至少三场不同门类会武，并在终段选择“留谱辨伪”而非夺位；不要求玩家成为任何门派掌门 |
| 图鉴文本 | 把大会上的见闻整理成拆招总诀。它让各小派都有黄→玄→地的玩法落点，但不把百家武学揉成一门虚构神功。 |

| 招式（ID） | 重 | 范围·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 识派 `mv_zhangmenboyi_shipai` | 1 | 自身·支援 | 0 | 5%/2/800 | 获得 `bf_dongxi` 2 回合 | — | 支援招式 |
| 试手 `mv_zhangmenboyi_shishou` | 1 | 单体·近 | 0.95 | 7%/0/1000 | `bf_pozhao` 50%·1 | 可 | `1−0.10×0.5=0.95` |
| 见招 `mv_zhangmenboyi_jianzhao` | 3 | 自身架势 | 0 | 5%/2/850 | `bf_shoushi` 1 回合；下次招架成功得 `bf_bizhong`×1 | — | 架势招式 |
| 借鉴 `mv_zhangmenboyi_jiejian` | 5 | 单体·近；上一招不同类别 | 1.25 | 7%/1/1000 | — | 可 | `1+0.12+条0.15=1.27≈1.25` |
| **百派一览** `mv_zhangmenboyi_baipai`（绝招） | 7 | 周身·近 | 2.05 | 9%/—/1200 | 目标 `bf_pozhao` 50%·1；自身 `bf_dongxi` 2 回合 | 可 | N=6、AF=0.75；`3×0.75−0.10×0.5−0.15=2.05`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 临阵校谱 `mv_zhangmenboyi_jiaopu` | 9 | 单体·近；目标已用过 ≥3 门武学 | 1.25 | 7%/1/1000 | `bf_shiheng` 50%·1 | 可 | `1+0.12+条0.15−0.10×0.5=1.22≈1.25` |

| 被动 ID | 名称 | 重 | 类 / 乘区 | 数值与说明 |
|---|---|---:|---|---|
| `ps_zhangmenboyi_jianzhao` | 见招 | 1 | stat / Z4 | 同一敌人连续使用同一武学时，对其减伤 +4%→8% |
| `ps_zhangmenboyi_jilu` | 记路 | 3 | stat / none | 战斗内见过的敌方武学类别在目标信息面板显示，不复制招式 |
| `ps_zhangmenboyi_jiaopu` | 校谱 | 9 | stat / Z3 | 对已见过三种类别的目标 +10% |
| `ps_zhangmenboyi_dacheng` | 博艺不杂 | 10 | mechanic / none | 本门只提供拆招，不参与任何门派身份、秘籍复制或武学融合捷径 |

### 4.10 地阶链与比例复核

| 门派 | 黄阶入口 | 玄阶承接 | 地阶终点 |
|---|---|---|---|
| 红花会 | `sk_honghuachangquan` | `sk_honghuaxinfa` | `sk_honghuahuiheji` |
| 回部 | `sk_huibuchujian` | `sk_huibujianshu` | `sk_huibuqijian` |
| 天池散承 | `sk_tianchiyinlu` | `sk_tianchibu` | `sk_tianshanyingyang` |
| 关东六魔 | `sk_guandongduandao` | `sk_guandongliumodao` | `sk_zhangmenboyi`（携散承记录赴大会辨谱） |
| 胡家 | `sk_hujiaxiaolianquan` | `sk_hujiadaoxinfa` | `sk_hujiaquan`（再通往天级胡刀） |
| 苗家 | `sk_miaojiajiangong` | `sk_miaojiaxinfa` | `sk_miaojiajian` |
| 药王门 | `sk_yaowangtuna` / `sk_yaowanghushou` | `sk_yaowangzhenfa` | `sk_yaowangdujing` / `sk_qixinhaitang` |
| 八卦门 | `sk_baguachujidao` | `sk_baguazhang` | `sk_baguadao` |
| 太极门、天龙门、韦陀门、八仙剑、八极拳、九龙鞭 | 各门黄阶拳 / 剑 | 各门代表玄阶 | `sk_zhangmenboyi`（`anyOf`） |
| 商家堡 | `sk_shangjiarumenquan` | `sk_shangjiaquan` | `sk_zhangmenboyi`（以大会观摩 / 商家残谱支线满足同阶交流门槛） |

`sk_zhangmenboyi` 是单人杂学，不要求组队，也不替代各门原有武学定义；因此地阶强制合击仍为 0。

---

## 5. 玄阶紧凑卡（30 门）

> 每卡列出全部招式；标“预算样本”的 13 卡逐招给核算式，抽样率 `13/30 = 43.3%`。其余卡的倍率也按 §0.2 模板配表，入库仍由 `design/05` V8 lint 全量复算。

### 5.1 红花会、天池散承与关东六魔（5 门）

**`sk_honghuaxinfa` 红花心法**（5 玄中 · 内功 · `nature:harmony` · 红花会 · **原创扩展**）

- 字段：`sect:sect_honghuahui`；`sourceChapters:[ch12_shujian]`；`reqs.sect {rank:2}`、`prereq [{skill:sk_honghuachangquan,layer:4}]`、`hard:[sect]`；`setTags:[set_honghua_shisidangjia]`。
- 内功：`meridians:[mer_renmai,mer_dumai]`；贡献 `mpMaxPct 17 + hpMaxPct 10 + attrs 7×2 + mpRegen 1.5×5 = 48.5`；`attrs {con:2,wis:2,wil:3}`；`stats {resMind:5,effRes:5}`。
- 招式：同心运气 `mv_honghuaxinfa_tongxin`（3 重，0，友方单体 `bf_huinei` 2 回合）；护会 `mv_honghuaxinfa_huhui`（7 重，0，自身 `bf_hutizhenqi`，护体为 hpMax 10%）。
- 被动：`ps_honghuaxinfa_yiqi` 义气相扶（相邻友方存在时 `resCC +4→8pp`）；`ps_honghuaxinfa_huiqi` 会旗不倒（9 重，首次低于 30% 气血获 `bf_wenzhong` 2 回合）；`ps_honghuaxinfa_yuanrong` 10 重同心圆融（红花会武学修炼 +10%）。获取：红花会 L2；陈家洛 / 文泰来羁绊。

**`sk_jindifa` 金笛法**（6 玄上 · 兵器/奇门（笛）· `nature:harmony` · 红花会余鱼同 · **预算样本**）

- 出处：《书剑恩仇录》“金笛秀才”余鱼同以金笛为兵（武学正式名待考），故为**（原创扩展命名）**；`weaponReq {category:exotic,kinds:[flute]}`；`reqs.skills {music:30}`，`prereq [{skill:sk_honghuajian,layer:5}]`；`setTags:[set_honghua_shisidangjia]`。

| 招式 | ID | 层 | 倍率 | 一句效果 | 核算 |
|---|---|---:|---:|---|---|
| 笛点中庭 | `mv_jindifa_zhongting` | 1 | 0.95 | 单体近身，`bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)` 25%·1 | `1−0.20×0.25=0.95` |
| 金声乱耳 | `mv_jindifa_luaner` | 3 | 0.70 | `aoe_spokes {r:1}` 气劲，`bf_shiheng` 40%·1 | N=7、AF=0.70；`0.70×1.24×0.85−0.10×0.4=0.70` |
| 笛影三叠 | `mv_jindifa_sandie` | 5 | 1.30 | 单体 3 段，8% 内、cd2 | `1+0.24+0.10=1.34≈1.30` |
| 清音护伴（绝招，**原创扩展命名**） | `mv_jindifa_huban` | 7 | 0 | 友方单体驱散 1 个 `mind`，获 `bf_wenzhong` 2 回合；耗内 8%、气势 100、收招 1200 | 支援绝招，`power=0`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |

- 被动：`ps_jindifa_renxue` 金声认穴（本门封穴命中 +5→10pp）；`ps_jindifa_tongjian` 笛剑相通（同装红花剑时 Z3 +8%）；`ps_jindifa_dacheng` 10 重金笛秀才（音乐检定 +10）。获取：余鱼同羁绊；装备 `eq_jindi` 只提供装备效果，不自动授武学。

**`sk_tianchibu` 天池步**（4 玄下 · 轻功 · `nature:harmony` · 天池散承 · **预算样本**）

- 出处：据天池怪侠、天山双鹰活动环境扩写，**（原创扩展）**；`sourceChapters:[ch12_shujian,ch13_feihu,ch14_xueshan]`（后两者为隐世延续）；`reqs` 为 `attrs {agi:25}`、`aptitude {apLight:25}`；`setTags:[]`；满层 `Q_skill=QS(4)=56`。

| 招式 | ID | 层 | 倍率 | 一句效果 | 核算 |
|---|---|---:|---:|---|---|
| 踏雪 | `mv_tianchibu_taxue` | 1 | 0 | 自身 `bf_jixing` 2 回合 | 支援招式 |
| 临崖折身 | `mv_tianchibu_zheshen` | 4 | 0 | 后撤 2 格，获 `bf_piaohu` 1 回合 | 位移支援 |
| 越涧 | `mv_tianchibu_yuejian` | 7 | 1.15 | 突进 3 单体，7% 内、cd2 | `1×(1+0.24+0.05)−0.10=1.19≈1.15` |

- 被动：`ps_tianchibu_xuexing` 雪行（雪地移动耗力 −10%→20%）；`ps_tianchibu_yaxing` 5 重崖行（探索跃隙判定 +8）；`ps_tianchibu_wuhen` 10 重无痕（首格雪地不减速）。前置 `sk_tianchiyinlu ≥4`；获取：袁士霄 / 天山双鹰支线。

**`sk_yingyangzhang` 鹰扬掌**（6 玄上 · 拳脚/拳掌 · `nature:yang` · 天山双鹰 · **预算样本**）

- 出处：据天山双鹰称号与交手扩写，正式武学名待考，**（原创扩展命名）**；`reqs.prereq [{skill:sk_tianchibu,layer:6}]`；`setTags:[]`。

| 招式 | ID | 层 | 倍率 | 一句效果 | 核算 |
|---|---|---:|---:|---|---|
| 鹰啄 | `mv_yingyangzhang_yingzhuo` | 1 | 0.95 | 单体，`bf_pojia` 40%·2 | `1−0.10×0.4=0.96≈0.95` |
| 展翼 | `mv_yingyangzhang_zhanyi` | 3 | 1.10 | 横扫，7% 内、cd2 | N=3、AF=0.85；`0.85×(1+0.24+0.05)=1.0965≈1.10` |
| 扑崖 | `mv_yingyangzhang_puya` | 5 | 1.05 | 跳斩，`bf_shiheng` 30%·1 | `0.90×1.29−0.10−0.03=1.03≈1.05` |
| 双鹰并击 | `mv_yingyangzhang_bingji` | 7 | 2.85 | 绝招单体；相邻友方存在时获 `bf_bizhong`×1 | `3.00−自增益0.15=2.85`；无相邻友方时仍可用但不获增益；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |

- 被动：`ps_yingyangzhang_linya` 临崖不惧（高差 Z7 惩罚减半）；`ps_yingyangzhang_shuangying` 双鹰（相邻友方时招架 +6%）；`ps_yingyangzhang_dacheng` 10 重鹰扬（击败目标获 `bf_jixing`）。

**`sk_guandongliumodao` 关东六魔刀**（4 玄下 · 兵器/刀 · `nature:yang` · 关东六魔 · **预算样本**）

- 出处：《书剑恩仇录》关东六魔为敌方群体；其统一刀法名待考，本文为**（原创扩展命名）**。`sourceChapters:[ch12_shujian]`；缴获残谱可学，非 `enemyOnly`；`prereq [{skill:sk_guandongduandao,layer:5}]`；`setTags:[]`。

| 招式 | ID | 层 | 倍率 | 一句效果 | 核算 |
|---|---|---:|---:|---|---|
| 雪夜截道 | `mv_guandongliumodao_jiedao` | 1 | 1.00 | 单体近身 | `1.00` |
| 六路乱劈 | `mv_guandongliumodao_luanpi` | 3 | 1.10 | 横扫，7% 内、cd2 | N=3、AF=0.85；`0.85×1.29=1.0965≈1.10` |
| 夺路 | `mv_guandongliumodao_duolu` | 5 | 1.05 | 突进 3；击退 1 | `1×1.24−0.10−0.05=1.09≈1.05` |
| 困兽一刀 | `mv_guandongliumodao_kunshou` | 7 | 1.30 | 普通单体，自身气血 <30% 才可用 | `1.00+罕见条件0.30=1.30` |

- 被动：`ps_guandongliumodao_jielu` 截路（目标无空余后退格时 +8%）；`ps_guandongliumodao_xiongming` 凶名（对 `wil<40` 目标效果命中 +8）；`ps_guandongliumodao_wangming` 10 重亡命（低血时暴击 +8）。这是一门可缴获武学，不把“敌人专用”当作绕开计数的方式。

### 5.2 回部（3 门）

**`sk_huibujianshu` 回部剑术**（6 玄上 · 兵器/剑 · `nature:harmony` · **预算样本**）

- 出处：《书剑恩仇录》霍青桐等人物交手，正式统称待考；`sect:sect_huibu`，`sourceChapters:[ch12_shujian,ch13_feihu,ch14_xueshan]`（后两者原创延续）；`prereq [{skill:sk_huibuchujian,layer:5}]`；`setTags:[]`。

| 招式 | ID | 层 | 倍率 | 一句效果 | 核算 |
|---|---|---:|---:|---|---|
| 翠羽点沙 | `mv_huibujianshu_diansha` | 1 | 1.00 | 单体近身 | `1.00` |
| 黄衫回剑 | `mv_huibujianshu_huijian` | 3 | 0.95 | 绕背，cd2 | `0.90×1.24−0.15=0.97≈0.95` |
| 绿洲分浪 | `mv_huibujianshu_fenlang` | 5 | 1.00 | 线2，cd1 | N=2、AF=0.90；`0.90×1.12=1.008≈1.00` |
| 翠羽流光 | `mv_huibujianshu_liuguang` | 7 | 2.80 | 绝招单体，获 `bf_youshi` 2 回合 | `3.00−自增益0.20=2.80`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |

- 被动：`ps_huibujianshu_shaxing` 沙行（沙地命中 +5%）；`ps_huibujianshu_humin` 护民（相邻友方低血时自身 `bf_yuanhu`）；`ps_huibujianshu_cuiyu` 10 重翠羽（绕背后下一招收招 −100）。

**`sk_tianshanqishe` 天山骑射**（5 玄中 · 暗器 · `nature:yang` · **预算样本**）

- 类别固定 `hidden/hidden`，使用 `apHidden`、弓具和箭类弹药；不计兵器。出处据书剑回部战斗扩写，**（原创扩展命名）**；`reqs.prereq [{skill:sk_huibuhushou,layer:4}]`；`setTags:[]`。

| 招式 | ID | 层 | 倍率 | 一句效果 | 核算 |
|---|---|---:|---:|---|---|
| 驰射 | `mv_tianshanqishe_chishe` | 1 | 0.85 | 单体投射；本回合已移动才可用 | `1×(1+条0.15)×0.92×0.85=0.90≈0.85` |
| 连珠箭 | `mv_tianshanqishe_lianzhu` | 3 | 1.05 | 单体 3 段，7% 内、cd2 | `1×1.29×0.92×0.85=1.01≈1.05` |
| 回身箭 | `mv_tianshanqishe_huishen` | 5 | 0.90 | 后撤 2 格后投射，`bf_jiansu` 40%·2 | `1×1.24×0.92×0.85−0.10×0.4=0.93≈0.90`；后撤在 §4.2 无另列成本 |
| 天山落雁 | `mv_tianshanqishe_luoyan` | 7 | 0.90 | 普通线3投射、不可招架，8% 内、cd2、收招1100；`bf_pojia` 50%·2 | N=3、AF=0.85；`0.85×(1+0.10+0.24+0.07)×0.92×0.85−0.10×0.5=0.89≈0.90` |

- 被动：`ps_tianshanqishe_mabei` 马背稳弓（骑乘命中惩罚归零）；`ps_tianshanqishe_zhufeng` 逐风（移动后 `crit +5→10`）；`ps_tianshanqishe_heyi` 10 重骑射合一（攻击后可继续用剩余移动力，等效 `bf_youshi`）。

**`sk_huibushuaijiao` 回部摔角**（4 玄下 · 拳脚/擒拿 · `nature:yang` · **预算样本**）

- **原创扩展**；地域摔跤传统须专题考据，不宣称统一历史拳谱。`sect:sect_huibu`；`prereq [{skill:sk_huibuhushou,layer:5}]`；`setTags:[]`。

| 招式 | ID | 层 | 倍率 | 一句效果 | 核算 |
|---|---|---:|---:|---|---|
| 抱腰 | `mv_huibushuaijiao_baoyao` | 1 | 0.95 | 单体，`bf_shiheng` 50%·1 | `1−0.10×0.5=0.95` |
| 绊腿 | `mv_huibushuaijiao_bantui` | 3 | 1.05 | 单体，击退 1，cd1 | `1+0.12−0.05=1.07≈1.05` |
| 过肩 | `mv_huibushuaijiao_guojian` | 5 | 1.20 | 单体，8% 内、cd2，击退 2 | `1+0.24+0.10−0.10=1.24≈1.20` |

- 被动：`ps_huibushuaijiao_caodi` 草地立稳（草地 `resCC +6pp`）；`ps_huibushuaijiao_chandou` 近身缠斗（相邻目标闪避 −5%）；`ps_huibushuaijiao_dacheng` 10 重摔角好手（击退碰撞伤害 +20%，Z3）。

### 5.3 胡、苗、商、药王诸传承（6 门）

**`sk_hujiadaoxinfa` 胡家心法**（5 玄中 · 内功 · `nature:yang` · **预算样本**）

- 字段：`sect:sect_hujia`；`sourceChapters:[ch13_feihu,ch14_xueshan]`；**（原创扩展）**；`reqs.prereq [{skill:sk_hujiaxiaolianquan,layer:4}]`、`hard:[prereq]`；`setTags:[set_hujia_lengyue]`。
- 内功：`meridians:[mer_dumai,mer_shouyangming]`；贡献 `mpMaxPct 17 + hpMaxPct 10 + attrs 7×2 + mpRegen 1.5×5 = 48.5`；`attrs {str:3,con:2,wil:2}`；`stats {crit:5,resInjury:5}`。

| 招式 | ID | 层 | 倍率 | 一句效果 | 核算 |
|---|---|---:|---:|---|---|
| 藏锋运气 | `mv_hujiadaoxinfa_cangfeng` | 1 | 0 | 自身 `bf_xushi`，3 回合冷却 | 支援招式 |
| 护刀调息 | `mv_hujiadaoxinfa_hudao` | 4 | 0 | 自身 `bf_huinei` 2 回合、`bf_wenzhong` 1 回合 | 支援招式 |
| 刀意催行 | `mv_hujiadaoxinfa_cuixing` | 7 | 0 | 自身 `bf_shichen` 2 回合，4 回合冷却 | 支援招式 |

- 被动：`ps_hujiadaoxinfa_daopu` 刀谱根基（胡家刀 / 拳修炼 +8%→15%）；`ps_hujiadaoxinfa_xuli` 蓄力（持刀且本回合未攻击，回合末获 `bf_xushi`）；`ps_hujiadaoxinfa_zhengqi` 10 重辽东正气（首次低血时获 `bf_wenzhong` 2 回合）。获取：胡斐、胡家刀谱旁注；飞狐残谱最高 8 重，雪山完整。

**`sk_miaojiaquan` 苗家拳**（6 玄上 · 拳脚/拳掌 · `nature:harmony` · **预算样本**）

- 出处：苗人凤家学，正式名目待考，**（原创扩展命名）**；`sect:sect_miaojia`；`prereq [{skill:sk_miaojiajiangong,layer:5}]`；`setTags:[]`。

| 招式 | ID | 层 | 倍率 | 一句效果 | 核算 |
|---|---|---:|---:|---|---|
| 正门拳 | `mv_miaojiaquan_zhengmen` | 1 | 1.00 | 单体近身 | `1.00` |
| 拆刀手 | `mv_miaojiaquan_chaidao` | 3 | 1.10 | 目标持刀；`bf_pozhao` 50%·1 | `1+条0.15−0.10×0.5=1.10` |
| 回身掌 | `mv_miaojiaquan_huishen` | 5 | 1.00 | 横扫，7% 内、cd1 | N=3、AF=0.85；`0.85×1.17=0.9945≈1.00` |
| 金面正气 | `mv_miaojiaquan_zhengqi` | 7 | 2.80 | 绝招单体，自身 `bf_shoushi` 2 回合 | `3.00−0.20=2.80`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |

- 被动：`ps_miaojiaquan_zhengmen` 正门（正面来招减伤 +5%）；`ps_miaojiaquan_chaidao` 拆刀（招架刀招后命中 +10%）；`ps_miaojiaquan_tongli` 10 重拳剑同理（同装苗剑时双方 Z3 +8%）。

**`sk_miaojiaxinfa` 苗家心法**（5 玄中 · 内功 · `nature:harmony`）

- **（原创扩展）**；`sect:sect_miaojia`；`sourceChapters:[ch13_feihu,ch14_xueshan]`；`reqs.prereq [{skill:sk_miaojialianqi,layer:4}]`；`setTags:[]`。
- 内功：`meridians:[mer_renmai,mer_shoujueyin]`；`17 + 10 + 2×7 + 5×1.5 = 48.5 IP`；`attrs {con:2,agi:2,wis:3}`；`stats {parry:5,effRes:5}`。
- 招式：守中调息 `mv_miaojiaxinfa_shouzhong`（1 重，0，自身 `bf_huinei` 2）；剑心澄明 `mv_miaojiaxinfa_chengming`（5 重，0，自身 `bf_shoushi` 2，驱散 1 个 `mind`）；守隙 `mv_miaojiaxinfa_shouxi`（7 重，0，自身 `bf_dongxi` 2）。
- 被动：`ps_miaojiaxinfa_shouzhong` 守中（招架 +3→7%）；`ps_miaojiaxinfa_dingyi` 定意（心神抗性 +6pp）；`ps_miaojiaxinfa_chengming` 10 重澄明（首次被施加 `bf_shiheng` 时立即驱散）。获取：苗人凤 / 苗家家谱内篇。

**`sk_shangjiadao` 商家刀法**（5 玄中 · 兵器/刀 · `nature:yang`）

- 出处：《飞狐外传》商剑鸣一门，正式武学名与招式待考；`sect:sect_shangjiabao`；`sourceChapters:[ch13_feihu]`；`prereq [{skill:sk_shangjiarumenquan,layer:4}]`；`setTags:[]`。
- 招式：堡门抢刀 `mv_shangjiadao_qiangdao`（1，1.00，单体）；火场逼步 `mv_shangjiadao_bibu`（3，0.95，线2，`bf_jiansu` 40%·2；N=2、AF=0.90，`.90×1.12−.04=.968≈.95`）；连环快斩 `mv_shangjiadao_lianhuan`（5，1.25，单体 3 段）；复仇一刀 `mv_shangjiadao_fuchou`（7，1.15，普通单体；目标为胡家传承时额外施加 `bf_pozhao` 100%·1；胡家罕见条件分支 `1.00+0.30−0.10=1.20≈1.15`）。
- 被动：`ps_shangjiadao_qiangong` 抢攻（首回合命中 +8%）；`ps_shangjiadao_zhinian` 执念（对胡家 Z3 +8%，但不改变阵营）；`ps_shangjiadao_canpu` 10 重残谱（堡毁后可由残谱修至满重）。获取：商家堡拜师 / 毁堡前后残谱支线。

**`sk_shangjiaquan` 商家拳**（4 玄下 · 拳脚/拳掌 · `nature:yang`）

- 出处：商家堡交手扩写，正式名待考；`sect:sect_shangjiabao`；`prereq [{skill:sk_shangjiarumenquan,layer:4}]`；`setTags:[]`。
- 招式：护院拳 `mv_shangjiaquan_huyuan`（1，1.00，单体）；逼门 `mv_shangjiaquan_bimen`（3，1.05，单体击退 1）；堡墙连手 `mv_shangjiaquan_lianshou`（5，1.00，六向横扫；N=3、AF=0.85，`0.85×1.17=0.9945≈1.00`）；守堡 `mv_shangjiaquan_shoubao`（7，0，自身 `bf_shoushi` 2）。
- 被动：`ps_shangjiaquan_jinmen` 近门（相邻墙体时防御 +5%）；`ps_shangjiaquan_qiangshou` 抢手（目标未行动时 +8%）；`ps_shangjiaquan_dacheng` 10 重护院老练（每战第一次招架获 `bf_gongshi`）。获取：商家堡 L2 / 残谱。

**`sk_yaowangzhenfa` 药王针法**（5 玄中 · 暗器 · `nature:yin` · **预算样本**）

- **（原创扩展）**，据程灵素医毒与用针能力设计，不提供医疗操作指引；`sect:sect_yaowangmen`；`reqs.skills {med:40,poi:40}`、`prereq [{skill:sk_yaowanghushou,layer:4}]`；`setTags:[]`。

| 招式 | ID | 层 | 倍率 | 一句效果 | 核算 |
|---|---|---:|---:|---|---|
| 认穴针 | `mv_yaowangzhenfa_renxue` | 1 | 0.75 | 单体投射不可招架，`bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)` 30%·1 | `1×0.92×0.85−0.20×0.3=0.72≈0.75` |
| 解穴针 | `mv_yaowangzhenfa_jiexue` | 1 | 0 | 友方单体驱散 1 个 `seal` | 支援招式 |
| 渡药针 | `mv_yaowangzhenfa_duyao` | 3 | 0 | 友方单体治疗 hpMax 18%，cd2 | 标准治疗 |
| 飞针封脉 | `mv_yaowangzhenfa_fengmai` | 5 | 0.80 | 单体投射不可招架，`bf_xueweishoufeng(level:7,acupointRef:sourcePrimary)` 35%·2 | `1×1.12×0.92×0.85−0.20×0.35=0.81≈0.80` |

- 被动：`ps_yaowangzhenfa_zhenwen` 针稳（暗器命中 +4→8%）；`ps_yaowangzhenfa_yizhen` 医针（治疗量 +8%）；`ps_yaowangzhenfa_tongtu` 10 重药针同途（每回合首次驱散毒 / 穴后，目标获 `bf_huinei` 1 回合）。获取：药王门 L2、程灵素羁绊。

### 5.4 太极门与八卦门（5 门）

**`sk_taijimenquan` 太极门拳**（6 玄上 · 拳脚/拳掌 · `nature:harmony` · **预算样本**）

- 出处：《书剑》《飞狐》赵半山等太极门人物（南北宗细节待考）；与武当太极拳 `sk_taijiquan` **不是同一武学**。`sect:sect_taijimen`；`prereq [{skill:sk_guangpingchangquan,layer:5},{skill:sk_guangpingxinfa,layer:5}]`；`setTags:[]`。

| 招式 | ID | 层 | 倍率 | 一句效果 | 核算 |
|---|---|---:|---:|---|---|
| 广平推手 | `mv_taijimenquan_tuishou` | 1 | 0.95 | 单体，`bf_shiheng` 50%·1 | `1−0.10×0.5=0.95` |
| 缠手 | `mv_taijimenquan_chanshou` | 3 | 1.00 | 单体，`bf_shouqin(level:4,holdRange:1)` 50%·2，cd1 | `1+0.12−0.25×0.5=1.00` |
| 进步靠 | `mv_taijimenquan_jinbu` | 5 | 1.10 | 突进 2，击退 1，cd2 | `1+0.24−0.10−0.05=1.09≈1.10` |
| 广平合手 | `mv_taijimenquan_heshou` | 7 | 2.80 | 绝招单体，自己 `bf_shoushi` 2 | `3.00−0.20=2.80`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |

- 被动：`ps_taijimenquan_yuanzhuan` 圆转（招架 +4→8%）；`ps_taijimenquan_jiebu` 借步（移动后减伤 +5%）；`ps_taijimenquan_hejin` 10 重广平合劲（从守势切攻势时下一拳 Z3 +10%）。

**`sk_taijimenjian` 太极门剑**（5 玄中 · 兵器/剑 · `nature:harmony`）

- 与武当太极剑 `sk_taijijian` 分立；`sect:sect_taijimen`；`prereq [{skill:sk_taijimenchujian,layer:5},{skill:sk_guangpingxinfa,layer:4}]`；`setTags:[]`。
- 招式：平圆剑 `mv_taijimenjian_pingyuan`（1，1.00，单体）；转环 `mv_taijimenjian_zhuanhuan`（3，0.95，绕背）；截门 `mv_taijimenjian_jiemen`（5，1.00，线2；N=2、AF=0.90，`0.90×1.12=1.008≈1.00`）；圆中一点 `mv_taijimenjian_yidian`（7，0.95，普通单体，`bf_pozhao` 50%·1；核算 `1.00−0.10×0.5=0.95`）。
- 被动：`ps_taijimenjian_yuanmen` 剑走圆门（招架 +4→8%）；`ps_taijimenjian_huzheng` 拳剑互证（同装太极门拳时 Z3 +8%）；`ps_taijimenjian_wuzhi` 10 重圆转无滞（绕背后获得 `bf_youshi` 1 回合）。

**`sk_guangpingxinfa` 广平心法**（4 玄下 · 内功 · `nature:harmony`）

- **（原创扩展）**；`sect:sect_taijimen`；`sourceChapters:[ch12_shujian,ch13_feihu]`；`reqs.prereq [{anyOf:[{skill:sk_guangpingchangquan,layer:4},{skill:sk_taijimenchujian,layer:4}]}]`；`setTags:[]`。
- 内功：`meridians:[mer_renmai,mer_daimai]`；贡献 `mpMaxPct 14 + hpMaxPct 8 + attrs 6×2 + mpRegen 1.5×5 = 41.5`；`attrs {con:2,agi:2,wis:2}`；`stats {parry:5,effRes:5}`。
- 招式：圆息 `mv_guangpingxinfa_yuanxi`（1，0，自身 `bf_huinei` 2）；开合 `mv_guangpingxinfa_kaihe`（5，0，自身在 `bf_shoushi` / `bf_gongshi` 间切换）；定架 `mv_guangpingxinfa_dingjia`（7，0，自身 `bf_wenzhong` 2）。
- 被动：`ps_guangpingxinfa_xichang` 息长（mpRegen 生效 +5%）；`ps_guangpingxinfa_kaihe` 开合（切势收招 −50）；`ps_guangpingxinfa_yuanrong` 10 重广平圆融（太极门武学修炼 +10%）。

**`sk_baguazhang` 八卦掌**（6 玄上 · 拳脚/拳掌 · `nature:harmony` · **预算样本**）

- 出处：书剑王维扬、飞狐商剑鸣相关传承（准确人物与名目待考）；`sect:sect_baguamen`；`prereq [{skill:sk_baguarumenquan,layer:5},{skill:sk_youshenbu,layer:4}]`；`setTags:[]`。

| 招式 | ID | 层 | 倍率 | 一句效果 | 核算 |
|---|---|---:|---:|---|---|
| 单换掌 | `mv_baguazhang_danhuan` | 1 | 1.00 | 单体 | `1.00` |
| 双换掌 | `mv_baguazhang_shuanghuan` | 3 | 1.05 | 横扫，cd2 | N=3、AF=0.85；`0.85×1.24=1.054≈1.05` |
| 走圈穿掌 | `mv_baguazhang_zouquan` | 5 | 0.95 | 绕背，cd2 | `0.90×1.24−0.15=0.97≈0.95` |
| 八方游身 | `mv_baguazhang_bafang` | 7 | 2.05 | 绝招周身，自身 `bf_youshi` 2 | N=6、AF=0.75；`3×0.75−0.20=2.05`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |

- 被动：`ps_baguazhang_zouquan` 走圈（移动 ≥2 格后闪避 +5%）；`ps_baguazhang_huanzhang` 换掌（绕背后 `bf_pozhao` 施加率 +20pp）；`ps_baguazhang_youlong` 10 重游龙（攻击后可继续移动）。

**`sk_youshenbu` 游身步**（4 玄下 · 轻功 · `nature:harmony`）

- **（原创扩展命名）**；`sect:sect_baguamen`；`sourceChapters:[ch12_shujian,ch13_feihu,ch14_xueshan]`；`reqs.prereq [{skill:sk_baguarumenquan,layer:4}]`；`setTags:[]`；满层 `QS(4)=56`。
- 招式：走圈 `mv_youshenbu_zouquan`（1，0，`bf_youshi` 2）；游龙 `mv_youshenbu_youlong`（4，1.05，绕背攻击）；换位 `mv_youshenbu_huanwei`（7，0，与 3 格友方换位）。
- 被动：`ps_youshenbu_bafang` 八方步（转向不增移动消耗）；`ps_youshenbu_ceshen` 侧身（侧击减伤 +6%）；`ps_youshenbu_shenhuan` 10 重步随身换（每回合第一次绕背不触发截击）。

### 5.5 天龙门（3 门）

**`sk_tianlongjian` 天龙剑**（6 玄上 · 兵器/剑 · `nature:yin` · **预算样本**）

- 出处：飞狐 / 雪山天龙门田归农一系，正式套路名与南北宗细节待考；与大理 `sect_tianlongsi` 无关。`sect:sect_tianlongmen`；`prereq [{skill:sk_tianlongrumenjian,layer:5},{skill:sk_guanwaixinfa,layer:5}]`；`setTags:[]`。

| 招式 | ID | 层 | 倍率 | 一句效果 | 核算 |
|---|---|---:|---:|---|---|
| 关外点锋 | `mv_tianlongjian_dianfeng` | 1 | 1.00 | 单体 | `1.00` |
| 北宗抢剑 | `mv_tianlongjian_beizong` | 3 | 1.15 | 单体，cd1、7% 内 | `1+0.12+0.05=1.17≈1.15` |
| 南宗回锋 | `mv_tianlongjian_nanzong` | 5 | 0.95 | 绕背，cd2 | `0.90×1.24−0.15=0.97≈0.95` |
| 天龙争首 | `mv_tianlongjian_zhengshou` | 7 | 2.95 | 绝招单体，`bf_pozhao` 50%·1 | `3−0.10×0.5=2.95`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |

- 被动：`ps_tianlongjian_nanbei` 南北各长（装配天龙北刀时剑 / 刀各 +6%）；`ps_tianlongjian_zhengming` 争名（对门派首领命中 +8%）；`ps_tianlongjian_hezong` 10 重合宗（完成和解线后，绝招命中时额外获得 `bf_youshi` 1 回合）。

**`sk_tianlongbeidao` 天龙北刀**（5 玄中 · 兵器/刀 · `nature:yang`）

- **（原创扩展命名）**；`sect:sect_tianlongmen`；`sourceChapters:[ch13_feihu,ch14_xueshan]`；`prereq [{skill:sk_guanwaichangquan,layer:4}]`；`setTags:[]`。
- 招式：北地横刀 `mv_tianlongbeidao_hengdao`（1，1.00）；抢关 `mv_tianlongbeidao_qiangguan`（3，1.05，突进 2）；回马斩 `mv_tianlongbeidao_huima`（5，1.00，横扫；N=3、AF=0.85，`0.85×1.17=0.9945≈1.00`）；关外一刀 `mv_tianlongbeidao_guanwai`（7，1.15，普通单体、cd2，`bf_liuxue` 100%·2；核算 `1.00+0.24−0.10=1.14≈1.15`）。
- 被动：`ps_tianlongbeidao_shizhong` 北刀势重（暴伤 +5→10pp）；`ps_tianlongbeidao_huzheng` 剑刀互证（同装天龙剑时 Z3 +6%）；`ps_tianlongbeidao_shouguan` 10 重守关（低血获得 `bf_wenzhong`）。

**`sk_guanwaixinfa` 关外心法**（4 玄下 · 内功 · `nature:yang`）

- **（原创扩展）**；`sect:sect_tianlongmen`；`sourceChapters:[ch13_feihu,ch14_xueshan]`；`prereq [{anyOf:[{skill:sk_tianlongrumenjian,layer:4},{skill:sk_guanwaichangquan,layer:4}]}]`；`setTags:[]`。
- 内功：`meridians:[mer_dumai,mer_zuyangming]`；`14 + 8 + 2×6 + 5×1.5 = 41.5 IP`；`attrs {str:2,con:3,wil:1}`；`stats {resCold:5,resInjury:5}`。
- 招式：御寒 `mv_guanwaixinfa_yuhan`（1，0，自身 `bf_wenzhong` 2）；运劲 `mv_guanwaixinfa_yunjin`（5，0，自身 `bf_xushi`）；守关 `mv_guanwaixinfa_shouguan`（7，0，自身 `bf_shoushi` 2）。
- 被动：`ps_guanwaixinfa_naihan` 关外耐寒（寒冷地形耗力 −15%）；`ps_guanwaixinfa_houxi` 厚息（寒冷地形休整时恢复效率 +5%，不改变 IP 贡献）；`ps_guanwaixinfa_tiaoxi` 10 重南北调息（剑刀切换不清除姿态）。

### 5.6 掌门人大会四个具名小派（8 门）

**`sk_weituomenquan` 韦陀门拳**（5 玄中 · 拳脚/拳掌 · `nature:yang`）

- 出处：《飞狐外传》掌门人大会韦陀门（人物、旁门关系与具体兵刃待考）；本文拳名按门派统称，**（原创扩展命名）**。`sect:sect_weituomen`；`sourceChapters:[ch13_feihu]`；`prereq [{skill:sk_weituorumenquan,layer:5}]`；`setTags:[]`。
- 招式：韦陀献杵 `mv_weituomenquan_xianchu`（1，1.00，单体）；护法推掌 `mv_weituomenquan_tuizhang`（3，0.90，线2）；镇门靠 `mv_weituomenquan_zhenmen`（5，1.10，突进 2、击退 1）；金刚护门 `mv_weituomenquan_humen`（7，1.05，普通单体、cd2，自身 `bf_wenzhong` 2；核算 `1.00+0.24−0.20=1.04≈1.05`）。
- 被动：`ps_weituomenquan_humen` 护门（正面减伤 +5%）；`ps_weituomenquan_chenjian` 沉肩（击退抵抗 +8pp）；`ps_weituomenquan_weituojin` 10 重韦陀劲（同装韦陀杵时两门 +6%）。获取：韦陀门 L2 / 大会交流。

**`sk_weituomenchu` 韦陀门杵**（5 玄中 · 兵器/奇门（杵）· `nature:yang`）

- **（原创扩展命名）**；`weaponReq {category:exotic,kinds:[pestle]}`；`sect:sect_weituomen`；`prereq [{skill:sk_weituorumenquan,layer:5}]`；`setTags:[]`。
- 招式：横杵 `mv_weituomenchu_hengchu`（1，1.00，单体）；护门 `mv_weituomenchu_humen`（3，0，自身 `bf_shoushi` 2）；杵震阶前 `mv_weituomenchu_zhenjie`（5，1.05，横扫，`bf_shiheng` 40%；N=3、AF=0.85，`0.85×1.24−0.04=1.014≈1.00`，取 1.05）；韦陀镇地 `mv_weituomenchu_zhendi`（7，0.95，普通周身、8% 内、cd2、击退 1；N=6、AF=0.75，`0.75×(1+0.10+0.24)−0.05=0.955≈0.95`）。
- 被动：`ps_weituomenchu_chuzhong` 杵重（暴伤 +5→10pp）；`ps_weituomenchu_hufa` 护法（相邻友方受击时获得 `bf_yuanhu`）；`ps_weituomenchu_tonggong` 10 重杵拳同功（拳杵切换后下一招 Z3 +8%）。

**`sk_baxianjian` 八仙剑**（6 玄上 · 兵器/剑 · `nature:harmony`）

- 出处：《飞狐外传》梧州八仙剑派、蓝秦等参加大会（人物与招式待考）；`sect:sect_baxianjian`；`prereq [{skill:sk_baxianrumenjian,layer:5},{skill:sk_zuibaxianbu,layer:4}]`；`setTags:[]`。
- 招式：洞宾指路 `mv_baxianjian_dongbin`（1，1.00，单体）；采和踏歌 `mv_baxianjian_caihe`（3，0.95，绕背）；铁拐横江 `mv_baxianjian_tieguai`（5，1.05，横扫、击退 1；N=3、AF=0.85，`0.85×1.29−0.05=1.0465≈1.05`）；八仙过海 `mv_baxianjian_guohai`（7，2.35，绝招线3，自己 `bf_youshi` 2；N=3、AF=0.85，`3×0.85−0.20=2.35`）。招名均为**（原创扩展）**，只取八仙意象。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`
- 被动：`ps_baxianjian_lunhuan` 八式轮换（连续使用不同招 +4%→8%）；`ps_baxianjian_tage` 踏歌（位移后闪避 +5%）；`ps_baxianjian_guohai` 10 重过海（每回合首次无视浅水移动惩罚）。

**`sk_zuibaxianbu` 醉八仙步**（4 玄下 · 轻功 · `nature:harmony`）

- **（原创扩展）**；`sect:sect_baxianjian`；`sourceChapters:[ch13_feihu]`；`prereq [{skill:sk_baxianrumenjian,layer:4}]`；`setTags:[]`；满层 `QS(4)=56`。
- 招式：醉步 `mv_zuibaxianbu_zuibu`（1，0，自身 `bf_piaohu` 2）；倒骑驴 `mv_zuibaxianbu_daoqi`（4，0，后撤 2 格）；踏歌绕剑 `mv_zuibaxianbu_tage`（7，1.00，绕背单体）。
- 被动：`ps_zuibaxianbu_sizui` 似醉非醉（`bf_shiheng` 持续 −1，至少 1）；`ps_zuibaxianbu_cuobu` 错步（闪避后每回合 1 次 `ct +50`）；`ps_zuibaxianbu_baxianyou` 10 重八仙游（攻击后可移动 1 格）。

**`sk_bajiquan` 八极拳**（6 玄上 · 拳脚/拳掌 · `nature:yang`）

- 出处：《飞狐外传》开封秦耐之一系掌门会武（准确人物与招法待考）；现实孟村八极拳史与小说世系不可互证。`sect:sect_bajiquan`；`prereq [{skill:sk_bajirumenquan,layer:5},{skill:sk_bajizhuang,layer:4}]`；`setTags:[]`。
- 招式：顶肘 `mv_bajiquan_dingzhou`（1，1.00，单体）；进步冲拳 `mv_bajiquan_chongquan`（3，1.05，突进 2）；贴山 `mv_bajiquan_tieshen`（5，1.20，单体、击退 2）；八极崩 `mv_bajiquan_beng`（7，2.90，绝招单体，`bf_shiheng` 100%·1；核算 `3.00−0.10=2.90`）。招名是玩法抽象，史实对应待考。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`
- 被动：`ps_bajiquan_duanda` 短打（相邻目标反击伤害 −6%）；`ps_bajiquan_zhengjin` 整劲（未移动时暴伤 +8pp）；`ps_bajiquan_kaimen` 10 重开门（击退撞墙时附 `bf_pojia`）。

**`sk_tieshankao` 铁山靠**（5 玄中 · 拳脚/拳掌 · `nature:yang`）

- 名称为传统武术常见称谓；其归入小说秦耐之一系为**（原创扩展）**。`sect:sect_bajiquan`；`prereq [{skill:sk_bajirumenquan,layer:5}]`；`setTags:[]`。
- 招式：沉肩 `mv_tieshankao_chenjian`（1，0，自身 `bf_wenzhong` 2）；贴靠 `mv_tieshankao_tiekao`（3，1.05，突进 2）；崩墙 `mv_tieshankao_bengqiang`（5，1.15，单体击退 2）；山崩 `mv_tieshankao_shanbeng`（7，1.15，普通单体、cd2、击退 2；核算 `1.00+0.24−0.05×2=1.14≈1.15`）。
- 被动：`ps_tieshankao_zhuangwen` 桩稳（击退抵抗 +8→15pp）；`ps_tieshankao_kaoshen` 靠身（冲刺后 Z3 +8%）；`ps_tieshankao_guanshen` 10 重整劲贯身（击退碰撞伤害 +25%）。

**`sk_jiulongbian` 九龙鞭**（6 玄上 · 兵器/鞭索 · `nature:yin`）

- 出处：《飞狐外传》湖南易家湾九龙鞭小派（人物与兵刃细节待考）；`sect:sect_jiulongbian`；`prereq [{skill:sk_jiulongrumenquan,layer:5},{skill:sk_chanlongshou,layer:4}]`；`setTags:[]`。
- 招式：游龙 `mv_jiulongbian_youlong`（1，1.00，单体射程 2）；双龙探海 `mv_jiulongbian_shuanglong`（3，0.95，线2；N=2、AF=0.90，扣缠索覆盖价值**【建议值】**0.05）；缠龙 `mv_jiulongbian_chanlong`（5，0.85，单体 `bf_shouqin(level:4,holdRange:1)` 50%·2）；九龙归一 `mv_jiulongbian_guiyi`（7，2.35，绝招线3，`bf_shouqin(level:4,holdRange:1)` 60%·2；N=3、AF=0.85，`3×0.85−0.25×0.60=2.40≈2.35`）。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`
- 被动：`ps_jiulongbian_bianchang` 鞭长（近战射程 +1）；`ps_jiulongbian_huisuo` 回索（招架后 `ct +50`）；`ps_jiulongbian_jiulong` 10 重九龙（缠绕目标对本门招式 Z3 +10%）。

**`sk_chanlongshou` 缠龙手**（4 玄下 · 拳脚/擒拿 · `nature:yin`）

- **（原创扩展）**；`sect:sect_jiulongbian`；`sourceChapters:[ch13_feihu]`；`prereq [{skill:sk_jiulongrumenquan,layer:4}]`；`setTags:[]`。
- 招式：缠腕 `mv_chanlongshou_chanwan`（1，0.90，单体 `bf_xueweishoufeng(level:7,acupointRef:sourcePrimary)` 30%·2）；引臂 `mv_chanlongshou_yinbi`（3，0.90，拉拽 1）；锁肩 `mv_chanlongshou_suojian`（5，0.85，`bf_shouqin(level:4,holdRange:1)` 50%·2）；回龙 `mv_chanlongshou_huilong`（7，1.10，普通单体、7% 内、cd2，`bf_xueweishoufeng(level:7,acupointRef:sourcePrimary)` 100%·2；核算 `1.00+0.05+0.24−0.20=1.09≈1.10`）。
- 被动：`ps_chanlongshou_ruanchan` 软缠（对高力量目标效果命中 +8%）；`ps_chanlongshou_jiesuo` 借索（同装九龙鞭时擒拿 +8%）；`ps_chanlongshou_chanlong` 10 重缠龙（成功施加缠绕后获 `bf_bizhong`×1）。

### 5.7 玄阶招式预算抽样汇总

| 项 | 数量 / 结论 |
|---|---|
| 玄阶总数 | 30 |
| 逐招列公式的样本 | 13：金笛法、天池步、鹰扬掌、关东六魔刀、回部剑术、天山骑射、回部摔角、胡家心法、苗家拳、药王针法、太极门拳、八卦掌、天龙剑 |
| 抽样率 | `13 ÷ 30 = 43.3%`，高于 AR-01 的 30% |
| 未逐式样本 | 仍逐招列名称、倍率和一句效果；正式数据构建必须通过 `design/05` V8 全量复算 |

---

## 6. 黄阶一行条目（30 门）

> 黄阶只用一行表格，不展开招式卡。`核心效果` 中的“单/线/扫/突/减”分别采用预算模板 Y1–Y5；每行末尾同时登记 `setTags`，满足 C22 的成员侧闭合。

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 |
|---|---|---|---|---|---|---|---|
| `sk_honghuachangquan` | 红花长拳 | 红花会 | 3 黄上·拳脚/拳掌·阳 | 书剑 | 单体正拳＋线2进步拳；Y1/Y2；`set_honghua_shisidangjia` | 无；L1 | **（原创扩展）** |
| `sk_honghuajian` | 红花剑 | 红花会 | 3 黄上·兵器/剑·调和 | 书剑 | 单体点剑＋横扫护旗；Y1/Y3；`set_honghua_shisidangjia` | 无；L1 | 据红花会群雄用剑扩写，正式名待考 |
| `sk_honghuabu` | 走舵步 | 红花会 | 2 黄中·轻功·调和 | 书剑 | 自身 `bf_jixing`；满层 `QS(2)=38`；`set_honghua_shisidangjia` | 无；L1 | **（原创扩展）** |
| `sk_tianchiyinlu` | 天池引路 | 天池散承 | 2 黄中·拳脚/拳掌·调和 | 书剑 | 单体探手＋后撤；Y1；`[]` | 无 | **（原创扩展）** |
| `sk_guandongduandao` | 关东短刀 | 关东六魔 | 2 黄中·兵器/刀·阳 | 书剑 | 单体短斩＋横扫；Y1/Y3；`[]` | 无；缴获可学 | **（原创扩展命名）**，人物兵刃待考 |
| `sk_huibuchujian` | 回部初剑 | 回部 | 3 黄上·兵器/剑·调和 | 书剑、飞狐★、雪山★ | 单体刺＋线2护营；Y1/Y2；`[]` | 无；L1 | **（原创扩展）** |
| `sk_huibuhushou` | 回部护手 | 回部 | 2 黄中·拳脚/擒拿·阳 | 书剑、飞狐★、雪山★ | 单体拿腕，30% `bf_shiheng`；Y5；`[]` | 无；L1 | **（原创扩展）** |
| `sk_huibutunaxi` | 回部吐纳 | 回部 | 3 黄上·内功·`nature:harmony` | 书剑、飞狐★、雪山★ | `mpMaxPct:10; hpMaxPct:6; attrs:{con:1,agi:1,wil:1,cha:1}; mpRegen:1.2`，`10+6+2×4+5×1.2=30 IP`；`mer_renmai`；`[]` | 无；L1 | **（原创扩展）** |
| `sk_hujiaxiaolianquan` | 胡家小练拳 | 辽东胡家 | 3 黄上·拳脚/拳掌·阳 | 飞狐、雪山 | 单体架拆＋守势；Y1；`set_hujia_lengyue` | 无；L1 | **（原创扩展命名）** |
| `sk_liaodonghushendao` | 辽东护身刀 | 辽东胡家 | 3 黄上·兵器/刀·阳 | 飞狐、雪山 | 单体护身斩＋线2；Y1/Y2；`set_hujia_lengyue` | 无；L1 | **（原创扩展）** |
| `sk_miaojiajiangong` | 苗家剑功 | 苗家 | 3 黄上·兵器/剑·调和 | 飞狐、雪山 | 单体正刺＋守中架；Y1；`[]` | 无；L1 | **（原创扩展命名）** |
| `sk_miaojialianqi` | 苗家炼气 | 苗家 | 3 黄上·内功·`nature:harmony` | 飞狐、雪山 | `mpMaxPct:10; hpMaxPct:6; attrs:{con:1,agi:1,wis:2}; mpRegen:1.2`，`10+6+2×4+5×1.2=30 IP`；`mer_renmai`；`[]` | 无；L1 | **（原创扩展）** |
| `sk_shangjiarumenquan` | 商家入门拳 | 商家堡 | 2 黄中·拳脚/拳掌·阳 | 飞狐 | 单体抢拳＋线2；Y1/Y2；`[]` | 无；L1 | **（原创扩展）** |
| `sk_shangjiabu` | 商家步 | 商家堡 | 2 黄中·轻功·阳 | 飞狐 | 自身 `bf_jixing`；满层 `QS(2)=38`；`[]` | 无；L1 | **（原创扩展）** |
| `sk_yaowanghushou` | 药王护手 | 药王门 | 2 黄中·拳脚/擒拿·阴 | 飞狐、雪山 | 单体扣腕＋自解 1 层毒；Y5；`[]` | `skills {med:15}`；L1 | **（原创扩展）** |
| `sk_yaowangtuna` | 药王吐纳 | 药王门 | 3 黄上·内功·`nature:yin` | 飞狐、雪山 | `mpMaxPct:10; hpMaxPct:6; attrs:{con:1,wis:2,wil:1}; mpRegen:1.2`，`10+6+2×4+5×1.2=30 IP`；`mer_shoujueyin`；`[]` | `skills {med:15}`；L1 | **（原创扩展）** |
| `sk_guangpingchangquan` | 广平长拳 | 太极门 | 3 黄上·拳脚/拳掌·调和 | 书剑、飞狐 | 单体推拳＋横扫；Y1/Y3；`[]` | 无；L1 | **（原创扩展）** |
| `sk_taijimenchujian` | 太极门初剑 | 太极门 | 2 黄中·兵器/剑·调和 | 书剑、飞狐 | 单体平刺＋守势；Y1；`[]` | 无；L1 | **（原创扩展）**；非武当太极剑 |
| `sk_baguarumenquan` | 八卦入门拳 | 八卦门 | 3 黄上·拳脚/拳掌·调和 | 书剑、飞狐、雪山 | 单体换掌＋绕侧；Y1；`[]` | 无；L1 | **（原创扩展）** |
| `sk_baguachujidao` | 八卦初级刀 | 八卦门 | 2 黄中·兵器/刀·调和 | 书剑、飞狐、雪山 | 单体劈刀＋横扫；Y1/Y3；`[]` | 无；L1 | **（原创扩展）** |
| `sk_tianlongrumenjian` | 天龙入门剑 | 天龙门 | 3 黄上·兵器/剑·阴 | 飞狐、雪山 | 单体点锋＋线2；Y1/Y2；`[]` | 无；L1 | **（原创扩展）**；非天龙寺 |
| `sk_guanwaichangquan` | 关外长拳 | 天龙门 | 2 黄中·拳脚/拳掌·阳 | 飞狐、雪山 | 单体冲拳＋击退 1；Y1/Y5；`[]` | 无；L1 | **（原创扩展）** |
| `sk_weituorumenquan` | 韦陀入门拳 | 韦陀门 | 3 黄上·拳脚/拳掌·阳 | 飞狐 | 单体护门拳＋线2；Y1/Y2；`[]` | 无；L1 | **（原创扩展）** |
| `sk_luohanbu_weituo` | 罗汉步·韦陀 | 韦陀门 | 3 黄上·轻功·阳 | 飞狐 | 自身 `bf_wenzhong` / `bf_jixing` 二选一；`QS(3)=45`；`[]` | 无；L1 | **（原创扩展命名）**；不等同少林身份 |
| `sk_baxianrumenjian` | 八仙入门剑 | 八仙剑 | 3 黄上·兵器/剑·调和 | 飞狐 | 单体点剑＋横扫；Y1/Y3；`[]` | 无；L1 | **（原创扩展）** |
| `sk_baxianxinfa` | 八仙心法 | 八仙剑 | 3 黄上·内功·`nature:harmony` | 飞狐 | `mpMaxPct:10; hpMaxPct:6; attrs:{con:1,agi:2,wis:1}; mpRegen:1.2`，`10+6+2×4+5×1.2=30 IP`；`mer_daimai`；`[]` | 无；L1 | **（原创扩展）** |
| `sk_bajirumenquan` | 八极入门拳 | 八极拳 | 3 黄上·拳脚/拳掌·阳 | 飞狐 | 单体冲拳＋突进靠；Y1/Y4；`[]` | 无；L1 | **（原创扩展）** |
| `sk_bajizhuang` | 八极桩 | 八极拳 | 3 黄上·内功·`nature:yang` | 飞狐 | `mpMaxPct:10; hpMaxPct:6; attrs:{str:2,con:2}; mpRegen:1.2`，`10+6+2×4+5×1.2=30 IP`；`mer_dumai`；`[]` | 无；L1 | 传统站桩仅作参考；小说归属为**（原创扩展）** |
| `sk_jiulongrumenquan` | 九龙入门拳 | 九龙鞭 | 2 黄中·拳脚/拳掌·阴 | 飞狐 | 单体引手＋迟缓；Y1/Y5；`[]` | 无；L1 | **（原创扩展）** |
| `sk_yijiaxinfa` | 易家心法 | 九龙鞭 | 3 黄上·内功·`nature:yin` | 飞狐 | `mpMaxPct:10; hpMaxPct:6; attrs:{con:1,agi:1,wil:2}; mpRegen:1.2`，`10+6+2×4+5×1.2=30 IP`；`mer_shoujueyin`；`[]` | 无；L1 | **（原创扩展）** |

### 6.1 黄阶整体预算核对

| 模板 | 公式 | 用途与结论 |
|---|---|---|
| Y1 单体 | `AF 1.00` | 基准耗内 5%、cd0、收招1000、可招架、无附带 ⇒ 1.00 |
| Y2 线2 | `0.90×(1+cd 0.12)=1.008` | 取 1.00 |
| Y3 横扫 | N=3、AF=0.85；`0.85×(1+cd 0.12)=0.952` | 取 0.95 |
| Y4 突进 | `1×(1+内 0.05+cd 0.12)−位移0.10=1.07` | 取 1.05 |
| Y5 轻减益 / 击退 | `1+cd 0.12−成本 0.05~0.10=1.02~1.07` | 取 1.00 或 1.05 |
| 黄上内功 | `10+6+2×4+5×1.2=30` | 6 门均显式给出 4 点 `attrs` 分配并精确命中黄上 IP 30 |

黄阶没有绝招；攻击项每门配置 2–3 式，支援 / 内功项可无伤害式。所有黄阶 `layerStats` 入库上限 6，表中未另发明超过上限的增益。

### 6.2 全部内功贡献复核

下表复核本文 11 门内功的第 10 重主运贡献。`attrs` 一栏的数字之和才进入 `2×属性点`；`stats` 不计 IP，规则均引用 `design/05` §5.5。

| ID | 品阶 / nature | `mpMaxPct + hpMaxPct + 2×attrs + 5×mpRegen` | IP / 预算 |
|---|---|---|---:|
| `sk_honghuaxinfa` | 5 玄中 / harmony | `17+10+2×(2+2+3)+5×1.5` | 48.5 / 48.5 |
| `sk_hujiadaoxinfa` | 5 玄中 / yang | `17+10+2×(3+2+2)+5×1.5` | 48.5 / 48.5 |
| `sk_miaojiaxinfa` | 5 玄中 / harmony | `17+10+2×(2+2+3)+5×1.5` | 48.5 / 48.5 |
| `sk_guangpingxinfa` | 4 玄下 / harmony | `14+8+2×(2+2+2)+5×1.5` | 41.5 / 41.5 |
| `sk_guanwaixinfa` | 4 玄下 / yang | `14+8+2×(2+3+1)+5×1.5` | 41.5 / 41.5 |
| `sk_huibutunaxi` | 3 黄上 / harmony | `10+6+2×(1+1+1+1)+5×1.2` | 30 / 30 |
| `sk_miaojialianqi` | 3 黄上 / harmony | `10+6+2×(1+1+2)+5×1.2` | 30 / 30 |
| `sk_yaowangtuna` | 3 黄上 / yin | `10+6+2×(1+2+1)+5×1.2` | 30 / 30 |
| `sk_baxianxinfa` | 3 黄上 / harmony | `10+6+2×(1+2+1)+5×1.2` | 30 / 30 |
| `sk_bajizhuang` | 3 黄上 / yang | `10+6+2×(2+2)+5×1.2` | 30 / 30 |
| `sk_yijiaxinfa` | 3 黄上 / yin | `10+6+2×(1+1+2)+5×1.2` | 30 / 30 |

性质合计为阳 3、阴 2、调和 6；11 门全部命中对应品阶标准预算，偏差 0%。

---

## 7. 套装候选（已由 `design/07` 收敛）

> 正式成员、阈值、效果与逐书界路径唯一见 `design/07` §15.7～§15.8；本节只保留图鉴侧成员索引。实际 `setTags` 已按 C22 只保留正式关系。

| 正式套装 | ID | 本图鉴成员 |
|---|---|---|
| 红花十四当家 | `set_honghua_shisidangjia` | `sk_baihuacuo`、`sk_paoding`、`sk_honghuahuiheji`、`sk_honghuaxinfa`、`sk_jindifa`、`sk_honghuachangquan`、`sk_honghuajian`、`sk_honghuabu` |
| 胡家冷月 | `set_hujia_lengyue` | `sk_hujiadao`、`sk_hujiaquan`、`sk_hujiadaoxinfa`、`sk_hujiaxiaolianquan`、`sk_liaodonghushendao` |

天池、关东、回部、胡苗、苗家、商家、药王、广平、八卦、天龙南北、韦陀、八仙、八极、九龙与掌门大会候选均已移除实际标签；冷月宝刀未进入 v1 成员。完整去向见 `design/07` §19。

## 8. 本组统计

### 8.1 品阶分布

| 绝对品级 | 1 黄下 | 2 黄中 | 3 黄上 | 4 玄下 | 5 玄中 | 6 玄上 | 7 地下 | 8 地中 | 9 地上 | 10 天下 | 11 天中 | 12 天上 | 合计 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 数量 | 0 | 11 | 19 | 9 | 11 | 10 | 5 | 3 | 1 | 3 | 0 | 0 | **72** |
| 大阶小计 | | **黄 30** | | | **玄 30** | | | **地 9** | | | **天 3** | | |

- 大阶比例是 `3:9:30:30`。以 3 天为基数，AR-01 理想值为 `3:9:27:27`；玄、黄各偏高 `(30−27)÷27=11.1%`，在 ±15% 内。
- 占总数：天 `3÷72=4.2%`，地 `9÷72=12.5%`，玄、黄各 `30÷72=41.7%`。这是图鉴文件配额，不替代 `design/05` §14.4 按书界汇总的全局目标。
- 3 门天级全在基准 §13；没有新增天阶，也没有用 9 品残承重复计数。
- 统一裁定后：天下 3 门各 2 记，共 6；地上 1 门 2 记、地中 3 门各 1 记、地下 5 门各 1 记，共 10；玄上 10 门各 1 记，共 10。统一裁定前为天6／地13／玄上10，本轮将 3 个既有 `mv_*` 降回普通招。

### 8.2 类别 × 大阶

| 大类 | 天 | 地 | 玄 | 黄 | 合计 |
|---|---:|---:|---:|---:|---:|
| 内功 | 0 | 0 | 5 | 6 | **11** |
| 拳脚 | 2 | 1 | 10 | 12 | **25** |
| 兵器 | 1 | 3 | 10 | 9 | **23** |
| 轻功 | 0 | 1 | 3 | 3 | **7** |
| 暗器 | 0 | 1 | 2 | 0 | **3** |
| 杂学 | 0 | 3 | 0 | 0 | **3** |
| **合计** | **3** | **9** | **30** | **30** | **72** |

类别按实际装配栏计：弓箭 `sk_tianshanqishe` 计暗器；金笛、杵计兵器奇门；毒经和掌门博艺计杂学。内功共 11 门，全部显式标注 `nature`，其中阳 3、阴 2、调和 6（逐门复核见 §6.2）。

### 8.3 约束统计

| 项 | 统计与结论 |
|---|---|
| 玄阶预算样本 | 13/30 = **43.3%**，高于 AR-01 要求的 30% |
| 地阶代价型 | 0/9 = **0%**，≤5% |
| 地阶誓约型 | 0/9 = **0%**，≤5% |
| 地阶强制多人合击 | 0/9 = **0%**，≤3%；红花会合击可单人施展，队友只作可选强化 |
| 敌人专用 | **0 门**；关东六魔两门均可缴获学习，不设 `enemyOnly:true` |
| 套装候选 | 17 组；每个正式门派至少 1 组，成员侧与候选侧均登记 |
| Buff | 30 个唯一 `bf_*`，均来自 `design/06`；本文不新增 Buff |
| 经脉 | 6 个 `mer_*` 正式引用；定义与效应见 `design/15` |

### 8.4 门派链与入门拳剑覆盖

| 范围 | 黄阶入门拳 / 剑 | 黄→玄→地落点 | 套装 |
|---|---|---|---|
| 红花会 | `sk_honghuachangquan` / `sk_honghuajian` | 长拳 → 心法 → 合击 | `set_honghua_shisidangjia` |
| 回部 | `sk_huibuchujian` | 初剑 → 剑术 → 奇剑 | `legacy-set:huibu_cuiyu` |
| 胡家 | `sk_hujiaxiaolianquan` | 小练拳 → 心法 → 胡家拳 | `set_hujia_lengyue` |
| 苗家 | `sk_miaojiajiangong` | 剑功 → 心法 → 苗家剑 | `legacy-set:miaojia_jianxin` |
| 商家堡 | `sk_shangjiarumenquan` | 入门拳 → 商家拳 → 掌门博艺 | `legacy-set:shangjiabao_fuchou` |
| 药王门 | `sk_yaowanghushou` | 护手 → 针法 → 毒经 / 海棠 | `legacy-set:yaowang_yidu` |
| 太极门 | `sk_guangpingchangquan` / `sk_taijimenchujian` | 长拳 → 门拳 → 掌门博艺 | `legacy-set:taijimen_guangping` |
| 八卦门 | `sk_baguarumenquan` | 入门拳 → 八卦掌 → 八卦刀 | `legacy-set:bagua_youlong` |
| 天龙门 | `sk_tianlongrumenjian` | 入门剑 → 天龙剑 → 掌门博艺 | `legacy-set:tianlong_nanbei` |
| 韦陀门 | `sk_weituorumenquan` | 入门拳 → 门拳 → 掌门博艺 | `legacy-set:weituo_hufa` |
| 八仙剑 | `sk_baxianrumenjian` | 入门剑 → 八仙剑 → 掌门博艺 | `legacy-set:baxian_zuijian` |
| 八极拳 | `sk_bajirumenquan` | 入门拳 → 八极拳 → 掌门博艺 | `legacy-set:baji_tieshan` |
| 九龙鞭 | `sk_jiulongrumenquan` | 入门拳 → 九龙鞭 → 掌门博艺 | `legacy-set:jiulong_chanrao` |
| 天池 / 关东散承 | `sk_tianchiyinlu` / 无独立门派要求 | 引路 → 天池步 → 鹰扬；短刀 → 六魔刀 → 掌门博艺 | 各有散承套装 |

---

## 9. 境界覆盖与装配可行性

三书均为中武书界，角色从上一书界至多携带 `2 内 / 2 拳脚 / 2 兵器`；本节按 `design/05` §14.6 #4 证明每书界仍有本土内功、拳脚、兵器各至少 3 门，可从 `2/2/2` 的携带基础补齐常规 `3/3/3` 装配栏。表内只计完整可学或明确的本土延续，不把飞狐 9 品天级残承拆成新武学。

### 9.1 书剑 `ch12_shujian`

| 装配类 | 至少三门本土候选 | 数量证明 | 同类主武器路径 |
|---|---|---:|---|
| 内功 | `sk_honghuaxinfa`、`sk_huibutunaxi`、`sk_guangpingxinfa` | 3 | — |
| 拳脚 | `sk_baihuacuo`、`sk_paoding`、`sk_yingyangzhang`、`sk_huibushuaijiao`、`sk_taijimenquan`、`sk_baguazhang`、`sk_honghuachangquan`、`sk_tianchiyinlu`、`sk_huibuhushou`、`sk_guangpingchangquan`、`sk_baguarumenquan` | 11 | — |
| 兵器 | `sk_jindifa`、`sk_guandongliumodao`、`sk_huibujianshu`、`sk_taijimenjian`、`sk_baguadao`、`sk_huibuqijian`、`sk_honghuajian`、`sk_guandongduandao`、`sk_huibuchujian`、`sk_taijimenchujian`、`sk_baguachujidao` | 11 | 剑：`sk_huibujianshu`、`sk_taijimenjian`、`sk_huibuqijian`、`sk_honghuajian`、`sk_huibuchujian`、`sk_taijimenchujian`，共 6 门；持一柄剑即可同时启用至少 3 格 |

书剑最高本土轻功为 `sk_tianshanyingyang`（8 地中，`QS(8)=104`），另有天池步、游身步、走舵步等低阶替代；符合中武轻功上限。示例补位：携带 2/2/2 后，本土学习红花心法、百花错拳或广平长拳、金笛法或回部初剑，即可补至 3/3/3。

### 9.2 飞狐 `ch13_feihu`

| 装配类 | 至少三门本土候选 | 数量证明 | 同类主武器路径 |
|---|---|---:|---|
| 内功 | `sk_hujiadaoxinfa`、`sk_miaojiaxinfa`、`sk_guanwaixinfa`、`sk_yaowangtuna`、`sk_guangpingxinfa`、`sk_baxianxinfa`、`sk_bajizhuang`、`sk_yijiaxinfa` | 8 | — |
| 拳脚 | `sk_hujiaquan`、`sk_miaojiaquan`、`sk_shangjiaquan`、`sk_taijimenquan`、`sk_baguazhang`、`sk_huibushuaijiao`★、`sk_bajiquan`、`sk_tieshankao`、`sk_chanlongshou` 及各派黄阶拳 | 9+ | — |
| 兵器 | `sk_hujiadao`、`sk_miaojiajian`、`sk_shangjiadao`、`sk_baguadao`、`sk_tianlongjian`、`sk_tianlongbeidao`、`sk_weituomenchu`、`sk_baxianjian`、`sk_jiulongbian` 及各派黄阶兵器 | 9+ | 刀：`sk_hujiadao`、`sk_shangjiadao`、`sk_baguadao`、`sk_tianlongbeidao`、`sk_liaodonghushendao`、`sk_baguachujidao`，共 6 门；剑亦有 `sk_miaojiajian`、`sk_tianlongjian`、`sk_baxianjian`、`sk_miaojiajiangong`、`sk_tianlongrumenjian` 至少 5 门 |

★回部飞狐延续为原创支线；即使删除它，飞狐仍远高于 3 门。百花错拳、庖丁解牛掌在飞狐只有 9 品残承，不计入上表的完整本土拳脚证明。飞狐最高本土轻功采用同传承复现的 `sk_tianshanyingyang`（8 地中）；不采纳该延续时，须由其他图鉴补一门 8 品轻功，见 §12。

### 9.3 雪山 `ch14_xueshan`

| 装配类 | 至少三门本土候选 | 数量证明 | 同类主武器路径 |
|---|---|---:|---|
| 内功 | `sk_hujiadaoxinfa`、`sk_miaojiaxinfa`、`sk_guanwaixinfa`、`sk_yaowangtuna` | 4 | — |
| 拳脚 | `sk_hujiaquan`、`sk_miaojiaquan`、`sk_baguarumenquan`、`sk_guanwaichangquan`、`sk_yaowanghushou` | 5 | — |
| 兵器 | `sk_hujiadao`、`sk_miaojiajian`、`sk_baguadao`、`sk_tianlongjian`、`sk_tianlongbeidao`、`sk_liaodonghushendao`、`sk_miaojiajiangong`、`sk_baguachujidao`、`sk_tianlongrumenjian` | 9 | 刀：`sk_hujiadao`、`sk_baguadao`、`sk_tianlongbeidao`、`sk_liaodonghushendao`、`sk_baguachujidao`，共 5 门；剑亦有 `sk_miaojiajian`、`sk_tianlongjian`、`sk_miaojiajiangong`、`sk_tianlongrumenjian` 共 4 门 |

雪山最高本土轻功同样采用 `sk_tianshanyingyang` 的隐世延续（8 地中），游身步为 4 玄下替代。若章节不采纳天山双鹰延续，最高轻功缺口需交其他图鉴或章节补齐，但内/拳/兵的 `3/3/3` 装配证明不受影响。

### 9.4 可习得池比例边界

本文件是三书的主要新增池，但不是完整可习得池：跨书复现的少林、武当、军中、镖局和通用武学分属其他图鉴。因此这里只做下界与稀有性检查，不伪造全书界最终占比。

| 检查 | 结论 |
|---|---|
| 天级稀有 | 书剑完整天级 2；飞狐完整天级 1（另 2 个 9 品残承）；雪山完整天级 1。均未新增基准外天级 |
| 本文件大阶比例 | 天 4.2%、地 12.5%、玄 41.7%、黄 41.7%，满足 AR-01 文件配额 |
| 中武全池目标 | `design/05` §14.4 要求天 2%–6%、地 15%–20%、玄 33%–38%、黄 38%–45%；须由全体图鉴按 `sourceChapters` 汇总后终验 |
| 携带补齐 | 三书每个内/拳/兵类别均 ≥3；即使从 2/2/2 携带起步，各学 1 门本土武学即可填满 3/3/3 |
| 轻功上限 | 书剑、飞狐、雪山最高均为地中 8，不超过 `design/05` §14.6 #7 |

---

## 9A. 经脉系统落地（AR-14）

### 9A.1 接口、路线骨架与实例边界

本节只配本图鉴的内容数据：既有 `MoveDef.meridianRouteRef` 指向 `MeridianRouteDef{id,moveRef,ultimate,purpose,requiredNature,steps}`，既有内功以 `breathProfileRef` 指向 `BreathProfile`；动态河流、Z4M / Z5M、护体内劲、速度投影、调息与取整均唯一引用 `design/21` §3–§5、§10–§12。穴位、冲穴、周天与九转仍唯一归 `design/15`。

- 路线 ID 固定为 `mfr_<moveRef 去掉 mv_>`，调息档案固定为 `txp_<skill slug>`；二者已由 Canon v1.3 §12 登记，不借用 `route_*` / `bf_*`。
- 性质短码只作排版：阴=`[yin,harmony]`、阳=`[yang,harmony]`、和=`[harmony]`；构建时写入 `requiredNature`。下表 `Q-*` 也是排版骨架，必须展开为有序 `steps[{acupointRef,segmentCt,riskBp}]`，不得传给 Core。
- 一个招式只有一个主 `purpose`：伤害式即使带突进仍为 `attack`；纯援护 / 架势为 `defense`；纯移动、跃起、追击、脱离、闪避预置为 `movement`。`ultimate` 与既有招式保持一致。
- `movement` 路线仍继承所属武学按上项展开的 `requiredNature`；通用 `Q-M3/Q-M5/Q-M8` 只提供步骤骨架，不覆盖或省略性质字段。
- 每个可独立行动的玩家、同伴、普通敌人、精英和 Boss 各持一个 `MeridianFlowModule`；只读路线可以共享，可变 `nodes/stateVersion` 与 Core `battle` RNG 不共享（见 21 §11）。

| 骨架 | 有序穴位 | `segmentCt[]` | `riskBp[]` | ΣCT | 用途 |
|---|---|---|---|---:|---|
| `Q-Y5` | `ap_renmai_qihai→ap_renmai_danzhong→ap_shoujueyin_tianchi→ap_shoujueyin_neiguan→ap_shoujueyin_laogong` | `[70,70,80,70,70]` | `[100,150,300,150,100]` | 360 | 阴性常用 |
| `Q-A5` | `ap_dumai_mingmen→ap_dumai_zhiyang→ap_dumai_shendao→ap_shouyangming_quchi→ap_shouyangming_shangyang` | `[70,70,70,80,70]` | `[100,150,150,300,100]` | 360 | 阳性常用 |
| `Q-H5` | `ap_zushaoyin_yongquan→ap_zushaoyin_taixi→ap_zutaiyang_weizhong→ap_dumai_mingmen→ap_shoujueyin_laogong` | `[70,70,70,70,70]` | `[100,100,200,250,150]` | 350 | 调和常用 |
| `Q-YD4` | `ap_renmai_qihai→ap_renmai_guanyuan→ap_renmai_zhongwan→ap_renmai_danzhong` | `[70,70,70,70]` | `[50,80,100,120]` | 280 | 阴性防守 |
| `Q-AD4` | `ap_dumai_mingmen→ap_dumai_zhiyang→ap_dumai_shendao→ap_dumai_baihui` | `[70,70,80,80]` | `[50,100,150,200]` | 300 | 阳性防守 |
| `Q-HD4` | `ap_daimai_zulinqi→ap_daimai_weidao→ap_daimai_daimai→ap_dumai_zhiyang` | `[70,70,70,70]` | `[80,100,120,180]` | 280 | 调和防守 |
| `Q-YN2` | `ap_renmai_qihai→ap_shoujueyin_laogong` | `[70,70]` | `[80,100]` | 140 | 阴性自然护体 |
| `Q-AN2` | `ap_dumai_mingmen→ap_shouyangming_shangyang` | `[70,70]` | `[80,100]` | 140 | 阳性自然护体 |
| `Q-HN2` | `ap_zushaoyin_yongquan→ap_dumai_mingmen` | `[70,70]` | `[80,120]` | 140 | 调和自然护体 |
| `Q-M3` | `ap_zushaoyin_yongquan→ap_zushaoyin_taixi→ap_dumai_mingmen` | `[60,60,60]` | `[50,100,200]` | 180 | 黄阶速度 |
| `Q-M5` | `ap_zushaoyin_yongquan→ap_zushaoyin_taixi→ap_zutaiyang_weizhong→ap_dumai_mingmen→ap_dumai_baihui` | `[60,60,70,60,70]` | `[50,80,120,180,200]` | 320 | 玄 / 地速度 |
| `Q-M8` | `ap_zushaoyin_yongquan→ap_zushaoyin_taixi→ap_zutaiyang_weizhong→ap_yangqiao_shenmai→ap_daimai_zulinqi→ap_daimai_weidao→ap_dumai_zhiyang→ap_dumai_baihui` | `[80,80,80,80,80,80,80,80]` | `[80,100,150,220,350,180,180,250]` | 640 | 地阶轻功绝招 |
| `Q-Y6U` | `ap_renmai_qihai→ap_renmai_guanyuan→ap_renmai_zhongwan→ap_renmai_danzhong→ap_shoujueyin_neiguan→ap_shoujueyin_laogong` | `[100,100,100,100,100,100]` | `[100,120,180,250,220,180]` | 600 | 阴性玄上绝招 |
| `Q-A6U` | `ap_dumai_mingmen→ap_dumai_zhiyang→ap_dumai_shendao→ap_dumai_baihui→ap_shouyangming_hegu→ap_shouyangming_shangyang` | `[100,100,100,100,100,100]` | `[100,150,180,250,220,160]` | 600 | 阳性玄上绝招 |
| `Q-H6U` | `ap_zushaoyin_yongquan→ap_zushaoyin_taixi→ap_zutaiyang_weizhong→ap_dumai_mingmen→ap_daimai_zulinqi→ap_daimai_daimai` | `[100,100,100,100,100,100]` | `[100,120,180,250,220,160]` | 600 | 调和玄上绝招 |
| `Q-Y8` | `ap_renmai_qihai→ap_renmai_guanyuan→ap_renmai_zhongwan→ap_renmai_danzhong→ap_shoujueyin_tianchi→ap_shoujueyin_quze→ap_shoujueyin_neiguan→ap_shoujueyin_laogong` | `[90,90,90,90,90,90,90,90]` | `[100,100,150,180,350,200,180,150]` | 720 | 阴性地阶绝招 |
| `Q-A8` | `ap_dumai_mingmen→ap_dumai_zhiyang→ap_dumai_shendao→ap_dumai_baihui→ap_shouyangming_quchi→ap_shouyangming_shousanli→ap_shouyangming_hegu→ap_shouyangming_shangyang` | `[90,90,90,90,90,90,90,90]` | `[100,150,180,250,350,180,150,120]` | 720 | 阳性地阶绝招 |
| `Q-H8` | `ap_zushaoyin_yongquan→ap_zushaoyin_taixi→ap_zutaiyang_weizhong→ap_dumai_mingmen→ap_daimai_zulinqi→ap_daimai_weidao→ap_daimai_daimai→ap_dumai_zhiyang` | `[90,90,90,90,90,90,90,90]` | `[100,120,180,250,350,180,160,150]` | 720 | 调和地阶绝招 |
| `Q-Y10` | `ap_renmai_qihai→ap_renmai_guanyuan→ap_renmai_zhongwan→ap_renmai_danzhong→ap_shoujueyin_tianchi→ap_shoujueyin_quze→ap_shoujueyin_neiguan→ap_shoujueyin_laogong→ap_shoujueyin_zhongchong→ap_shoutaiyin_shaoshang` | `[80,80,80,80,80,80,80,80,80,80]` | `[100,100,120,150,350,180,160,140,120,300]` | 800 | 阴性天阶绝招 |
| `Q-A10` | `ap_renmai_qihai→ap_renmai_danzhong→ap_dumai_mingmen→ap_dumai_zhiyang→ap_dumai_shendao→ap_dumai_baihui→ap_shouyangming_quchi→ap_shouyangming_shousanli→ap_shouyangming_hegu→ap_shouyangming_shangyang` | `[80,80,80,80,80,80,80,80,80,80]` | `[100,150,350,150,180,250,350,180,150,120]` | 800 | 阳性天阶绝招 |
| `Q-H10` | `ap_zushaoyin_yongquan→ap_zushaoyin_taixi→ap_zutaiyang_weizhong→ap_dumai_mingmen→ap_daimai_zulinqi→ap_daimai_weidao→ap_daimai_daimai→ap_dumai_zhiyang→ap_renmai_qihai→ap_renmai_danzhong` | `[80,80,80,80,80,80,80,80,80,80]` | `[100,120,180,250,350,180,160,150,350,150]` | 800 | 调和天阶绝招 |

所有段均满足 CT 40–120、风险 0–1200、穴位不重复。以本册最大普通收招 1100、绝招收招 1200 核算：`1100+360=1460`、玄上绝招 `1200+600=1800`、地阶绝招 `1200+720=1920`、天阶绝招 `1200+800=2000`；轻功绝招为 `1200+640=1840`，均不超过 21 §4.6 的 2000。

### 9A.2 天 / 地阶逐招路线注册

格式为“`moveRef→mfr/ultimate/purpose/骨架`”。这是对现有招式的数据挂接；招名、出处标注、效果和倍率仍见 §2–§4，不新增任何招名。

| 武学 / 性质 | 逐招路线 |
|---|---|
| `sk_baihuacuo` / 和 | `mv_baihuacuo_luanhua→mfr_baihuacuo_luanhua/false/attack/Q-H5`；`mv_baihuacuo_yihua→mfr_baihuacuo_yihua/false/attack/Q-H5`；`mv_baihuacuo_cangzhen→mfr_baihuacuo_cangzhen/false/attack/Q-H5`；`mv_baihuacuo_baijia→mfr_baihuacuo_baijia/false/attack/Q-H5`；`mv_baihuacuo_cuoluo→mfr_baihuacuo_cuoluo/true/attack/显式（见本册绝招显式路线索引）`；`mv_baihuacuo_fanchang→mfr_baihuacuo_fanchang/true/attack/显式（见本册绝招显式路线索引）` |
| `sk_paoding` / 和 | `mv_paoding_xunli→mfr_paoding_xunli/false/attack/Q-H5`；`mv_paoding_zhongqing→mfr_paoding_zhongqing/false/attack/Q-H5`；`mv_paoding_youren→mfr_paoding_youren/false/attack/Q-H5`；`mv_paoding_guran→mfr_paoding_guran/false/attack/Q-H5`；`mv_paoding_muwuquanniu→mfr_paoding_muwuquanniu/true/attack/显式（见本册绝招显式路线索引）`；`mv_paoding_daokuan→mfr_paoding_daokuan/true/attack/显式（见本册绝招显式路线索引）` |
| `sk_hujiadao` / 阳 | `mv_hujiadao_yingmen→mfr_hujiadao_yingmen/false/attack/Q-A5`；`mv_hujiadao_cangfeng→mfr_hujiadao_cangfeng/false/attack/Q-A5`；`mv_hujiadao_guanshan→mfr_hujiadao_guanshan/false/attack/Q-A5`；`mv_hujiadao_pianfeng→mfr_hujiadao_pianfeng/false/attack/Q-A5`；`mv_hujiadao_wangyue→mfr_hujiadao_wangyue/false/attack/Q-A5`；`mv_hujiadao_fengxue→mfr_hujiadao_fengxue/true/attack/显式（见本册绝招显式路线索引）`；`mv_hujiadao_humiaohuzhao→mfr_hujiadao_humiaohuzhao/true/attack/显式（见本册绝招显式路线索引）` |
| `sk_miaojiajian` / 和 | `mv_miaojiajian_zhengfeng→mfr_miaojiajian_zhengfeng/false/attack/Q-H5`；`mv_miaojiajian_shidao→mfr_miaojiajian_shidao/false/attack/Q-H5`；`mv_miaojiajian_pifeng→mfr_miaojiajian_pifeng/false/attack/Q-H5`；`mv_miaojiajian_huifeng→mfr_miaojiajian_huifeng/false/attack/Q-H5`；`mv_miaojiajian_bafang→mfr_miaojiajian_bafang/true/attack/显式（见本册绝招显式路线索引）`；`mv_miaojiajian_shouxi→mfr_miaojiajian_shouxi/true/attack/显式（见本册绝招显式路线索引）` |
| `sk_yaowangdujing` / 阴 | `mv_yaowangdujing_biandu→mfr_yaowangdujing_biandu/false/defense/Q-YD4`；`mv_yaowangdujing_shidu→mfr_yaowangdujing_shidu/false/attack/Q-Y5`；`mv_yaowangdujing_buyao→mfr_yaowangdujing_buyao/false/attack/Q-Y5`；`mv_yaowangdujing_yidu→mfr_yaowangdujing_yidu/false/defense/Q-YD4`；`mv_yaowangdujing_baidu→mfr_yaowangdujing_baidu/true/defense/显式（见本册绝招显式路线索引）`；`mv_yaowangdujing_fanzhao→mfr_yaowangdujing_fanzhao/false/attack/Q-Y5` |
| `sk_qixinhaitang` / 阴 | `mv_qixinhaitang_wuse→mfr_qixinhaitang_wuse/false/attack/Q-Y5`；`mv_qixinhaitang_liuxiang→mfr_qixinhaitang_liuxiang/false/attack/Q-Y5`；`mv_qixinhaitang_shuangye→mfr_qixinhaitang_shuangye/false/attack/Q-Y5`；`mv_qixinhaitang_cangfeng→mfr_qixinhaitang_cangfeng/false/attack/Q-Y5`；`mv_qixinhaitang_wusheng→mfr_qixinhaitang_wusheng/true/attack/显式（见本册绝招显式路线索引）`；`mv_qixinhaitang_chifa→mfr_qixinhaitang_chifa/false/attack/Q-Y5` |
| `sk_tianshanyingyang` / 和 | `mv_tianshanyingyang_yingqi→mfr_tianshanyingyang_yingqi/false/movement/Q-M5`；`mv_tianshanyingyang_shuangyi→mfr_tianshanyingyang_shuangyi/false/movement/Q-M5`；`mv_tianshanyingyang_luexue→mfr_tianshanyingyang_luexue/false/attack/Q-H5`；`mv_tianshanyingyang_pankong→mfr_tianshanyingyang_pankong/false/movement/Q-M5`；`mv_tianshanyingyang_tianji→mfr_tianshanyingyang_tianji/true/movement/显式（见本册绝招显式路线索引）`；`mv_tianshanyingyang_yingluo→mfr_tianshanyingyang_yingluo/false/attack/Q-H5` |
| `sk_honghuahuiheji` / 和 | `mv_honghuahuiheji_lunzhan→mfr_honghuahuiheji_lunzhan/false/attack/Q-H5`；`mv_honghuahuiheji_jieying→mfr_honghuahuiheji_jieying/false/defense/Q-HD4`；`mv_honghuahuiheji_buwei→mfr_honghuahuiheji_buwei/false/movement/Q-M5`；`mv_honghuahuiheji_jiaji→mfr_honghuahuiheji_jiaji/false/attack/Q-H5`；`mv_honghuahuiheji_shisidangjia→mfr_honghuahuiheji_shisidangjia/true/defense/显式（见本册绝招显式路线索引）`；`mv_honghuahuiheji_huiqi→mfr_honghuahuiheji_huiqi/false/attack/Q-H5` |
| `sk_hujiaquan` / 阳 | `mv_hujiaquan_tanmen→mfr_hujiaquan_tanmen/false/attack/Q-A5`；`mv_hujiaquan_jiadao→mfr_hujiaquan_jiadao/false/defense/Q-AD4`；`mv_hujiaquan_tieshen→mfr_hujiaquan_tieshen/false/attack/Q-A5`；`mv_hujiaquan_fanwan→mfr_hujiaquan_fanwan/false/attack/Q-A5`；`mv_hujiaquan_quandao→mfr_hujiaquan_quandao/true/attack/显式（见本册绝招显式路线索引）`；`mv_hujiaquan_duoshi→mfr_hujiaquan_duoshi/false/attack/Q-A5` |
| `sk_baguadao` / 和 | `mv_baguadao_kaimen→mfr_baguadao_kaimen/false/attack/Q-H5`；`mv_baguadao_xiumen→mfr_baguadao_xiumen/false/attack/Q-H5`；`mv_baguadao_shengmen→mfr_baguadao_shengmen/false/attack/Q-H5`；`mv_baguadao_jingmen→mfr_baguadao_jingmen/false/attack/Q-H5`；`mv_baguadao_bamen→mfr_baguadao_bamen/true/attack/显式（见本册绝招显式路线索引）`；`mv_baguadao_dumen→mfr_baguadao_dumen/false/attack/Q-H5` |
| `sk_huibuqijian` / 和 | `mv_huibuqijian_yingke→mfr_huibuqijian_yingke/false/attack/Q-H5`；`mv_huibuqijian_huying→mfr_huibuqijian_huying/false/defense/Q-HD4`；`mv_huibuqijian_huima→mfr_huibuqijian_huima/false/attack/Q-H5`；`mv_huibuqijian_feisha→mfr_huibuqijian_feisha/false/attack/Q-H5`；`mv_huibuqijian_huifeng→mfr_huibuqijian_huifeng/true/attack/显式（见本册绝招显式路线索引）`；`mv_huibuqijian_huqi→mfr_huibuqijian_huqi/false/attack/Q-H5` |
| `sk_zhangmenboyi` / 和 | `mv_zhangmenboyi_shipai→mfr_zhangmenboyi_shipai/false/defense/Q-HD4`；`mv_zhangmenboyi_shishou→mfr_zhangmenboyi_shishou/false/attack/Q-H5`；`mv_zhangmenboyi_jianzhao→mfr_zhangmenboyi_jianzhao/false/defense/Q-HD4`；`mv_zhangmenboyi_jiejian→mfr_zhangmenboyi_jiejian/false/attack/Q-H5`；`mv_zhangmenboyi_baipai→mfr_zhangmenboyi_baipai/true/attack/显式（见本册绝招显式路线索引）`；`mv_zhangmenboyi_jiaopu→mfr_zhangmenboyi_jiaopu/false/attack/Q-H5` |

以上 73/73 个天 / 地阶 `mv_*` 均有唯一稳定路线，12/12 门达到统一裁定表的绝招定数：天下 2、地上 2、地中 1、地下 1。纯支援绝招走防守或速度路线；带伤害的位移式仍只提交攻击路线，避免一次招式重复获得 Z5M 与速度路线收益。

### 9A.3 玄 / 黄阶模板与七门轻功

玄上 10 记绝招均在下表显式登记；既有九记与本轮补入的“清音护伴”统一展开，不再依赖玄阶普通模板。每条均为 6 段、单段 100 CT；阴 / 阳 / 和路线总风险分别为 1050 / 1060 / 1030。

| 武学 / 性质 | 玄上绝招显式路线 |
|---|---|
| `sk_jindifa` / 和 | `mv_jindifa_huban→mfr_jindifa_huban/true/defense/显式（见本册绝招显式路线索引）`（`requiredNature:[harmony]`；6 段；100 CT/段；风险 `[100,120,180,250,220,160]`，总风险 1030） |
| `sk_yingyangzhang` / 阳 | `mv_yingyangzhang_bingji→mfr_yingyangzhang_bingji/true/attack/显式（见本册绝招显式路线索引）`（`requiredNature:[yang,harmony]`） |
| `sk_huibujianshu` / 和 | `mv_huibujianshu_liuguang→mfr_huibujianshu_liuguang/true/attack/显式（见本册绝招显式路线索引）`（`requiredNature:[harmony]`） |
| `sk_miaojiaquan` / 和 | `mv_miaojiaquan_zhengqi→mfr_miaojiaquan_zhengqi/true/attack/显式（见本册绝招显式路线索引）`（`requiredNature:[harmony]`） |
| `sk_taijimenquan` / 和 | `mv_taijimenquan_heshou→mfr_taijimenquan_heshou/true/attack/显式（见本册绝招显式路线索引）`（`requiredNature:[harmony]`） |
| `sk_baguazhang` / 和 | `mv_baguazhang_bafang→mfr_baguazhang_bafang/true/attack/显式（见本册绝招显式路线索引）`（`requiredNature:[harmony]`） |
| `sk_tianlongjian` / 阴 | `mv_tianlongjian_zhengshou→mfr_tianlongjian_zhengshou/true/attack/显式（见本册绝招显式路线索引）`（`requiredNature:[yin,harmony]`） |
| `sk_baxianjian` / 和 | `mv_baxianjian_guohai→mfr_baxianjian_guohai/true/attack/显式（见本册绝招显式路线索引）`（`requiredNature:[harmony]`） |
| `sk_bajiquan` / 阳 | `mv_bajiquan_beng→mfr_bajiquan_beng/true/attack/显式（见本册绝招显式路线索引）`（`requiredNature:[yang,harmony]`） |
| `sk_jiulongbian` / 阴 | `mv_jiulongbian_guiyi→mfr_jiulongbian_guiyi/true/attack/显式（见本册绝招显式路线索引）`（`requiredNature:[yin,harmony]`） |

十条路线收招上界均为 `1200+6×100=1800 CT`，不得退回 2 段迁移短路。

| 大阶 / 语义 | 稳定展开 |
|---|---|
| 玄阶伤害、擒拿、点穴 | 按性质取 `Q-Y5/Q-A5/Q-H5`，`purpose:attack`；每个既有 `mv_*` 派生同名 `mfr_*` |
| 玄阶架势、援护、护体 | 按性质取 `Q-YD4/Q-AD4/Q-HD4`，`purpose:defense` |
| 玄阶移动 / 轻功 | `Q-M5`，`purpose:movement`；伤害位移式仍按攻击模板 |
| 黄阶伤害 / 防守 | 取同性质常用 / 防守骨架前三穴，2–3 段；用途按动作语义 |
| 黄阶轻功 | `Q-M3`，`purpose:movement`；无显式 `mv_*` 的一行卡由编译器给既有移动动作生成局部 MoveDef，不另造全局招名 |

| 轻功武学 | 速度路线绑定 | 边界 |
|---|---|---|
| `sk_tianshanyingyang` | 纯支援的 `yingqi/shuangyi/pankong` 与绝招 `tianji` 见 §9A.2；伤害式不重复挂 movement | 地阶绝招 `flowCt=640`；门禁仍读未修正轻功值 |
| `sk_tianchibu` | `mv_tianchibu_taxue/zheshen→mfr_<move>/false/movement/Q-M5`；`yuejian` 为伤害式，按和性攻击 `Q-H5` | `recovery≤1000` 时最多 1350 |
| `sk_youshenbu` | `zouquan/huanwei→movement/Q-M5`；`youlong→attack/Q-H5` | 同上 |
| `sk_zuibaxianbu` | `zuibu/daoqi→movement/Q-M5`；`tage→attack/Q-H5` | 同上 |
| `sk_honghuabu` | 既有移动动作 → 稳定 `mfr_<move>/false/movement/Q-M3` | `flowCt=180` |
| `sk_shangjiabu`、`sk_luohanbu_weituo` | 各自既有移动动作 → 稳定 `mfr_<move>/false/movement/Q-M3` | `flowCt=180`；不能越过 08 门禁 / 地形成本 |

速度路线只产出 21 §4.9 的 `meridianSpeedBp/openingQinggong/spd/move/evadeRatingDelta`，不回写 `Q_skill`；同场参考强度取可选敌方中位数，无敌方取 10000。

### 9A.4 十一门内功的调息档案与护体内劲

字段顺序为 `grade/layer/nature/scope/ct/mpCostBp/outOfBattleScaleBp`；结果按 21 §10.2 在 10 重计算。黄 / 玄默认 `scope=1/2`，全部 `ct=1000`、`mpCostBp=0`、`outOfBattleScaleBp=15000`。护体“玄 / 黄档”只是按品阶检索的内容标签，不能替代 21 §4.8 由当次 `MeridianProfile` 计算的容量。每门内功均可启用所列 2 段自然护体短路；只有已有护体 / 守气动作才另挂主动防守路线。

所有自然护体和主动护体路线在展开时均附 `innerGuard:{enabled:true,reflectBp:0}`；下表的 `reflectBp:0` 是该对象子字段，不是路线顶层字段。

| 内功 | `BreathProfile.id` | 输入 | 10 重 `reliefBp / repairUnits` | 护体内劲 |
|---|---|---|---|---|
| `sk_honghuaxinfa` | `txp_honghuaxinfa` | `5/10/harmony/2/1000/0/15000` | `floor((500+500+800)×10500/10000)=1890` / `floor((120+120+180)×10500/10000)=441` | 玄调和档；自然 `Q-HN2`；`mv_honghuaxinfa_huhui→Q-HD4`；`reflectBp:0`；`outOfBattleScaleBp:15000` |
| `sk_hujiadaoxinfa` | `txp_hujiadaoxinfa` | `5/10/yang/2/1000/0/15000` | `1800 / 420` | 玄阳档；自然 `Q-AN2`；无主动护体招；`reflectBp:0`；`outOfBattleScaleBp:15000` |
| `sk_miaojiaxinfa` | `txp_miaojiaxinfa` | `5/10/harmony/2/1000/0/15000` | `1890 / 441` | 玄调和档；自然 `Q-HN2`；`shouxi/chengming→Q-HD4`；`reflectBp:0`；`outOfBattleScaleBp:15000` |
| `sk_guangpingxinfa` | `txp_guangpingxinfa` | `4/10/harmony/2/1000/0/15000` | `1785 / 415` | 玄调和档；自然 `Q-HN2`；`dingjia→Q-HD4`；`reflectBp:0`；`outOfBattleScaleBp:15000` |
| `sk_guanwaixinfa` | `txp_guanwaixinfa` | `4/10/yang/2/1000/0/15000` | `1700 / 396` | 玄阳档；自然 `Q-AN2`；`shouguan→Q-AD4`；`reflectBp:0`；`outOfBattleScaleBp:15000` |
| `sk_huibutunaxi` | `txp_huibutunaxi` | `3/10/harmony/1/1000/0/15000` | `1680 / 390` | 黄调和档；自然 `Q-HN2`；`reflectBp:0`；`outOfBattleScaleBp:15000` |
| `sk_miaojialianqi` | `txp_miaojialianqi` | `3/10/harmony/1/1000/0/15000` | `1680 / 390` | 黄调和档；自然 `Q-HN2`；`reflectBp:0`；`outOfBattleScaleBp:15000` |
| `sk_yaowangtuna` | `txp_yaowangtuna` | `3/10/yin/1/1000/0/15000` | `1600 / 372` | 黄阴档；自然 `Q-YN2`；`reflectBp:0`；`outOfBattleScaleBp:15000` |
| `sk_baxianxinfa` | `txp_baxianxinfa` | `3/10/harmony/1/1000/0/15000` | `1680 / 390` | 黄调和档；自然 `Q-HN2`；`reflectBp:0`；`outOfBattleScaleBp:15000` |
| `sk_bajizhuang` | `txp_bajizhuang` | `3/10/yang/1/1000/0/15000` | `1600 / 372` | 黄阳档；自然 `Q-AN2`；`reflectBp:0`；`outOfBattleScaleBp:15000` |
| `sk_yijiaxinfa` | `txp_yijiaxinfa` | `3/10/yin/1/1000/0/15000` | `1600 / 372` | 黄阴档；自然 `Q-YN2`；`reflectBp:0`；`outOfBattleScaleBp:15000` |

拳脚 / 兵器 / 暗器 / 内劲外放的护体适用率固定为 `10000/2500/0/4000 bp`，1 MP 抵 2 伤害。顺序固定为护体真气后、护体内劲、既有 `mpGuard`，再到气血；点穴 / 擒拿仍在伤害后处理。本册没有既有反震语义，故全为 `reflectBp:0`。

### 9A.5 数据化与验收边界

- 路线必须满足 21 MF-V01–V05：`moveRef` 存在、用途唯一、绝招位相等、1–18 段、穴位无重复、数组等长，且 `recovery+ΣsegmentCt≤2000`。
- 天 / 地 73/73 逐招登记；玄 / 黄的正式产物必须从模板展开成稳定 `mfr_*`，不得仍依赖 2 段迁移短路。
- 同档攻防必须回到 10000 bp；标准伤害仍为 849、TTK 5；标准速度投影仍为 `98/106/6/0`。防守路线进入 Z4M、攻击路线进入 Z5M，分别在边界向下取整。
- `preview` 不改状态 / RNG；成功 `commit` 才逐段消费 Core 唯一 `battle` RNG。9 级点穴禁止自行调息；战斗调息不推进 15 的永久成长。

## 10. 本文新增术语与 ID

> “新增”指本文承担正式定义；仅从上游引用的 `sect_*`、`bf_*`、`eq_*`、`it_*` 与任务接口不重复归属。所有 ID 均已全仓库检索：与其他图鉴的已定义 ID 无重名；`design/17` 的候选清单属于上游预登记，不算重复定义。

### 10.1 武学 ID（72）

| 大阶 | 数量 | 本文定义 ID |
|---|---:|---|
| 天 | 3 | `sk_baihuacuo` `sk_paoding` `sk_hujiadao` |
| 地 | 9 | `sk_miaojiajian` `sk_yaowangdujing` `sk_qixinhaitang` `sk_tianshanyingyang` `sk_honghuahuiheji` `sk_hujiaquan` `sk_baguadao` `sk_huibuqijian` `sk_zhangmenboyi` |
| 玄 | 30 | `sk_honghuaxinfa` `sk_jindifa` `sk_tianchibu` `sk_yingyangzhang` `sk_guandongliumodao` `sk_huibujianshu` `sk_tianshanqishe` `sk_huibushuaijiao` `sk_hujiadaoxinfa` `sk_miaojiaquan` `sk_miaojiaxinfa` `sk_shangjiadao` `sk_shangjiaquan` `sk_yaowangzhenfa` `sk_taijimenquan` `sk_taijimenjian` `sk_guangpingxinfa` `sk_baguazhang` `sk_youshenbu` `sk_tianlongjian` `sk_tianlongbeidao` `sk_guanwaixinfa` `sk_weituomenquan` `sk_weituomenchu` `sk_baxianjian` `sk_zuibaxianbu` `sk_bajiquan` `sk_tieshankao` `sk_jiulongbian` `sk_chanlongshou` |
| 黄 | 30 | `sk_honghuachangquan` `sk_honghuajian` `sk_honghuabu` `sk_tianchiyinlu` `sk_guandongduandao` `sk_huibuchujian` `sk_huibuhushou` `sk_huibutunaxi` `sk_hujiaxiaolianquan` `sk_liaodonghushendao` `sk_miaojiajiangong` `sk_miaojialianqi` `sk_shangjiarumenquan` `sk_shangjiabu` `sk_yaowanghushou` `sk_yaowangtuna` `sk_guangpingchangquan` `sk_taijimenchujian` `sk_baguarumenquan` `sk_baguachujidao` `sk_tianlongrumenjian` `sk_guanwaichangquan` `sk_weituorumenquan` `sk_luohanbu_weituo` `sk_baxianrumenjian` `sk_baxianxinfa` `sk_bajirumenquan` `sk_bajizhuang` `sk_jiulongrumenquan` `sk_yijiaxinfa` |

### 10.2 招式、被动、套装与经脉接口

| 类别 | 数量 | 说明 |
|---|---:|---|
| 招式 `mv_*` | 183 | 天 / 地完整卡 73 个，玄阶紧凑卡 110 个；均以所属武学 ID 为前缀 |
| 被动 `ps_*` | 139 | 天 / 地 49 个，玄阶 90 个；每个玄阶恰有 3 个具名 ID |
| 招式路线 `mfr_*` | 73 个高阶逐项登记 + 10 个玄上绝招显式登记 + 其余玄阶稳定展开 | 高阶见 §9A.2；玄上绝招见 §9A.3；其余玄阶从既有 `mv_*` 稳定派生；黄阶引用模板 |
| 调息档案 `txp_*` | 11 | 与 §9A.4 的 11 门内功一一对应；前缀已由 Canon v1.3 §12 登记 |
| 套装 `set_*` | 17 | §7 全表；均为候选，最终规则和数值归 `design/07` |
| 经脉 `mer_*` | 6 | `mer_renmai`、`mer_dumai`、`mer_shouyangming`、`mer_shoujueyin`、`mer_zuyangming`、`mer_daimai`；均已命中 `design/15` 正式 ID |
| 新 Buff | 0 | 所有 `bf_*` 均引用 `design/06` 既有目录 |

### 10.3 上游接口（不归本文定义）

| 类型 | ID | 用途 |
|---|---|---|
| 装备 | `eq_lengyuedao`、`eq_jindi` | 胡家冷月套候选；金笛法兵器。两者均已在 `design/10` 定义 |
| 物品 | 胡家刀谱残本（未另造 ID） | 名称、缺页与补全机制见 `design/10`，如需运行时 ID 由该文档登记 |
| 任务 | 百花错拳奇遇、庖丁悟道、飞狐红花残承（未另造 ID） | 具体任务 ID 与流程归 `chapters/12–14` |
| 门派 | §1 所列 13 个 `sect_*` | ID、时代状态、职级称谓全部引用 `design/17` |

---

### 正式套装反向标签镜像（全局审计）

下表仅镜像 `design/07` §8.4 的正式成员关系，供构建与 lint 读取；不是第二份武学定义。历史候选只以 `legacy-set:<slug>` 保留，不得写入运行态 `setTags`。

| 武学 ID | setTags |
|---|---|
| `sk_baihuacuo` | `set_honghua_shisidangjia` |
| `sk_honghuabu` | `set_honghua_shisidangjia` |
| `sk_honghuachangquan` | `set_honghua_shisidangjia` |
| `sk_honghuahuiheji` | `set_honghua_shisidangjia` |
| `sk_honghuajian` | `set_honghua_shisidangjia` |
| `sk_honghuaxinfa` | `set_honghua_shisidangjia` |
| `sk_hujiadao` | `set_hujia_lengyue` |
| `sk_hujiadaoxinfa` | `set_hujia_lengyue` |
| `sk_hujiaquan` | `set_hujia_lengyue` |
| `sk_hujiaxiaolianquan` | `set_hujia_lengyue` |
| `sk_jindifa` | `set_honghua_shisidangjia` |
| `sk_liaodonghushendao` | `set_hujia_lengyue` |
| `sk_paoding` | `set_honghua_shisidangjia` |

## 11. 数据校验规则与测试用例

### 11.1 构建期规则

| # | 规则 | 级别 |
|---|---|---|
| QL-V01 | 武学、招式、被动分别匹配 `sk_<拼音>`、`mv_<武学拼音>_<拼音>`、`ps_<武学拼音>_<拼音>`，并全仓库唯一 | 失败 |
| QL-V02 | `grade >= 10` 时 ID、品阶、类别和完整 `sourceChapters` 必须逐项匹配基准 §13 | 失败 |
| QL-V03 | 统计必须恰为天 / 地 / 玄 / 黄 `3/9/30/30`；残承不得重复计为定义 | 失败 |
| QL-V04 | `category`、`subType`、`nature`、`wOut/wIn` 使用 `design/05` §2 枚举；`wOut+wIn=1`；所有内功 `nature != neutral` | 失败 |
| QL-V05 | `reqs.skills` 键只取 C17 十项；`prereq[].anyOf` 至少两项、不嵌套、不自依赖，外层仍为 AND | 失败 |
| QL-V06 | 招式 `power` 与 §0.2 公式差值 ≤0.05；天/地逐招核算，玄阶公式样本率 ≥30%，黄阶只匹配 Y1–Y5 模板 | 失败 / 非样本玄阶为告警 |
| QL-V07 | 内功 IP 与品阶预算差值 ≤5%；每门有 `nature`，`meridians` 只能引用 `design/15` 正式 ID | 失败 |
| QL-V08 | 所有 `bf_*` 必须存在于 `design/06`，施加品阶一律继承；本文禁止内联重定义 Buff | 失败 |
| QL-V09 | `setTags` 与 §7 候选成员双向一致；跨文件装备成员允许待 `design/07` / `10` 接入但必须报告 | 失败 / 跨文件暂告警 |
| QL-V10 | 每个正式门派至少一门黄阶入门拳或剑、一条黄→玄→地链、一组套装；散承只检查链和套装 | 失败 |
| QL-V11 | 书剑、飞狐、雪山本土内功 / 拳脚 / 兵器各 ≥3；兵器还须存在至少 3 门匹配同一主武器类别的路径；最高原生轻功不得高于 8 地中 | 失败 |
| QL-V12 | 地阶代价型、誓约型各 ≤5%，强制多人合击 ≤3%；`enemyOnly:true` 单列且不入 72 | 失败 |
| QL-V13 | 弓箭只能写 `category:hidden, subType:hidden`，用 `apHidden` 与暗器栏；不得统计为兵器 | 失败 |
| QL-V14 | 原著无正式名的武学 / 招式须标“原创扩展”或“原创扩展命名”；不确定事实须标“待考” | 失败 |
| QL-V15 | 天 / 地路线 73/73 唯一挂接；10 条玄上绝招显式挂接；模板展开后 `moveRef` 存在、`ultimate` 相等、用途唯一，且满足 21 MF-V01–V05 | 失败 |
| QL-V15A | 绝招数按天下 2、地上 2、地中逐门服从统一裁定表、地下 1、玄上 1；玄中 / 玄下 / 黄为 0 | 失败 |
| QL-V16 | 11 门内功各有唯一 `txp_*`，`ct=1000`、`mpCostBp=0`；自然护体路线按性质匹配，反震只能来自既有语义 | 失败 |
| QL-V17 | 每个独立行动单位各持一个 `MeridianFlowModule`；只共享静态路线，不共享节点状态或 RNG | 失败 |

### 11.2 最小测试集

| 用例 | 输入 / 操作 | 期望 |
|---|---|---|
| QL-T01 配额 | 扫描完整卡标题、玄阶粗体卡标题与 §6 黄阶表首列 | 分别得到 12（3 天+9 地）、30、30；武学 ID 合计 72 且唯一 |
| QL-T02 天级白名单 | 将本文 `grade=10` 的 ID 与基准 §13 本组交集比较 | 仅 `sk_baihuacuo`、`sk_paoding`、`sk_hujiadao`；品阶均 10 |
| QL-T03 残承去重 | 读取百花 / 庖丁飞狐学习来源 | `partial:true, lineageGrade:9, maxLayer:8`；仍只有一个 `sk_*` 定义 |
| QL-T04 OR 前置 | 校验 `sk_zhangmenboyi.reqs.prereq[0]` | 是含 9 个不同 `skill` 的 `anyOf`，每项 `layer:6`，无自依赖 |
| QL-T05 技艺门槛 | 读取药王毒经、七心海棠、药王针法、金笛法、红花合击 | `skills` 键均在 `med/poi/antidote/formation/music` 合法集合内 |
| QL-T06 弓箭分类 | 读取 `sk_tianshanqishe` | `hidden/hidden`、`apHidden`，统计进入暗器，不进入兵器 |
| QL-T07 招式预算 | 复算所有天 / 地公式及 13 门玄阶样本 | 显示倍率与公式结果差值 ≤0.05；支援式为 `power:0` |
| QL-T08 内功预算 | 复算 §6.2 的 5 门玄阶和 6 门黄阶内功 | 玄中 48.5、玄下 41.5、黄上 30；11 门全部精确命中预算 |
| QL-T09 Buff 引用 | 提取唯一 `bf_*`，与 `design/06` 目录做差集 | 共 30 个；差集为空 |
| QL-T10 套装闭合 | 对 §7 每个武学成员查其定义中的 `setTags` | 全部命中；仅 `eq_lengyuedao` 作为跨文件待同步成员 |
| QL-T11 门派覆盖 | 对 §8.4 每个正式 `sect_*` 检查入口、链、套装 | 13 个正式门派全通过 |
| QL-T12 书界装配 | 对 §9 三书分别按 `sourceChapters` 汇总内 / 拳 / 兵，并按 `weaponReq.category` 分组兵器 | 每类 ≥3；三书各有同类主武器路径 ≥3 门；从 2/2/2 各补一门可达 3/3/3 |
| QL-T13 轻功上限 | 汇总三书本土 `movement` 最大 `grade` | 均为 8；`QS(8)=104` |
| QL-T14 比例限制 | 扫描地阶 `special` 与施放条件 | 代价 0%、誓约 0%、强制合击 0%；均不越界 |
| QL-T15 文档完整性 | 检查标题序列、Markdown 表格、围栏、行尾与占位标记 | 章节到 §12 完整；代码围栏成对；无截断或占位标记 |
| QL-T16 高阶路线闭合 | 扫描 §9A.2–§9A.3 | 73 个高阶 `mv_*` 各出现一次；10 个玄上绝招显式登记；绝招总数按天下 / 地 / 玄上为 6 / 10 / 10 |
| QL-T17 路线 CT 上界 | 普通 `1100+360`、玄上绝招 `1200+600`、地绝招 `1200+720`、天绝招 `1200+800`、轻功绝招 `1200+640` | 1460 / 1800 / 1920 / 2000 / 1840，全部不超过 2000 |
| QL-T18 调息与隔离 | 扫描 11 个 `txp_*`；两个同模板敌人只令 A 运行一段 | 档案唯一且范围合法；A 前进，B 的节点 / 版本不变 |

---

## 12. 待决事项 / 依赖

### 12.1 替下游给出的建议值

| # | 下游 | 建议值 / 接口 | 本文处理 |
|---|---|---|---|
| QL-D01 | `design/07` | 采纳 §7 的 17 个套装候选；先只定成员，阈值和数值按套装全局预算另行定稿 | 条目侧 `setTags` 已登记，不在本文写套装加成 |
| QL-D02 | `design/07`、`design/10` | `set_hujia_lengyue` 可把 `eq_lengyuedao` 作为装备件；装备侧补同名套装反向登记 | 当前保留为候选；若套装系统不计装备则删除该成员 |
| QL-D03 | `design/15` | **已解决**：`mer_renmai/dumai/shouyangming/shoujueyin/zuyangming/daimai` 均为正式 ID（见 `design/15` §2–§3） | 本文只引用，不定义穴位、效果和经脉关系 |
| QL-D04 | `chapters/12–14` | 天山双鹰传承在飞狐 / 雪山以隐世支线复现，最高地中 8；回部同时代支线亦可复现 | 按原创延续写入 `sourceChapters`；不采纳时删除对应来源并由其他图鉴补轻功上限 |
| QL-D05 | `chapters/13` | 掌门博艺：完成 ≥3 场不同门类会武，且具有 `anyOf` 中任一 6 重代表武学；单人可用 | 按此作为默认获取门槛，任务 ID 待章节分配 |
| QL-D06 | `design/05` / Canon §12 | **已解决**：Canon v1.3 §12 已登记 `mfr_* / txp_*`；图鉴按 `design/21` 接入 `meridianRouteRef`、`breathProfileRef` | 本文使用正式前缀，不借用地图 `route_*` 或 Buff `bf_*` |

### 12.2 本文依赖的上游事实

| 上游 | 依赖事实 |
|---|---|
| `00-canon.md` §13 | 三门天级的 ID、品阶、类别和原生书界；本文逐项照录，不扩表 |
| `author-decisions.md` P33、P38 | AR-01 数量比例生效；百花错拳 / 庖丁解牛掌飞狐残承按 9 品处理 |
| `rulings-v1.md` C16/C17/C22/C23 | 弓箭归暗器、技艺门槛与 `anyOf`、套装双向登记、天级原生 / 残承口径 |
| `design/02` | 三书境界、同年代复现、残承与雪山终卷胡刀苗剑印证 |
| `design/03` | 轻功公式 `QS(8)=104` 及属性 ID |
| `design/05` | 字段枚举、层数、招式倍率、IP、装配栏、比例及图鉴 lint |
| `design/06` | 本文引用的 30 个 Buff 的唯一正式定义 |
| `design/10` | 胡家刀谱残本、冷月宝刀、金笛、七心海棠素材接口 |
| `design/13` | 乾隆卷流程、胡刀苗剑终卷定位和三门天级任务接口 |
| `design/17` | 13 个正式门派的 ID、时代状态、职级模板与具体称谓 |
| `design/21` / `design/15` | 动态经脉、路线、攻防乘区、护体、速度、调息与每单位实例归 21；穴位拓扑和永久成长归 15 |

### 12.3 对基准的修改提案

| 编号 | 提案 | 理由 | 本文默认 |
|---|---|---|---|
| QL-P01 | 基准 §18 或 `design/05` §14.5 的旧 `skills-ming-qing` 拆分行，更新为现行图鉴分工并登记 `skills-qianlong.md` | 当前权威分工在 `rulings-v1.md`，基准 / 05 的旧文件名无法直接映射本产物 | 不改基准；本文按裁定命名 |
| QL-P02 | 在基准 §13 或其注释旁明确“同一 `sk_*` 的 9 品残承不改变 10 品绝对 `grade`，也不新增一条地阶武学” | 百花、庖丁跨飞狐统计最易发生重复计数；C23 已裁定但基准入口仍可更醒目 | 按单 ID、`lineageGrade:9`、`partial:true` 处理 |
| QL-P03 | Canon §12 接纳 21 §16.2 的 `mfr_* / qnl_* / dxl_* / txp_*`，并在 §8 / §9 / §11 / §18 / §19 接纳 AR-14 的独立乘区、护体、速度和确定性边界 | 目前图鉴已有稳定内容引用，但 Canon v1.2 与现有 ID lint 尚不能完整验证 | 继续按 21 v2.0 的明确提案语境登记 |

### 12.4 原著考据待办

| # | 待核事项 |
|---|---|
| QL-K01 | 《书剑》袁士霄传百花错拳的具体段落、原著招名，以及陈家洛玉峰洞窟悟庖丁解牛掌的地点、同行和文字细节 |
| QL-K02 | 红花会十四当家联手是否有正式阵法名；余鱼同金笛的具体招法；赵半山太极门南北宗与广平门脉细节 |
| QL-K03 | 天山双鹰陈正德、关明梅的具体身法 / 掌法是否有原著正式名称；关东六魔成员兵刃与可统一称作刀法的依据 |
| QL-K04 | 霍青桐等回部人物的具体剑招和兵器；原著是否存在可统称的回部剑术；骑射、摔角只保留原创玩法，不反推历史拳谱 |
| QL-K05 | 两部飞狐中胡家刀法、胡家拳、苗家剑法 / 拳的正式招名；胡一刀与苗人凤比武、刀谱缺页及胡苗互知破绽的逐段细节 |
| QL-K06 | 商剑鸣、商老太、商宝震的武学名目；商家堡火场前后残谱来源与可学性 |
| QL-K07 | 毒手药王无嗔一门典籍正式名称、程灵素用针 / 七心海棠情节；本文不核现实毒理与配制方法 |
| QL-K08 | 王维扬、商剑鸣和八卦门刀掌传承关系；小说时代与现实八卦掌史不得互相代证 |
| QL-K09 | 天龙门南北宗人物、剑刀套路正式名；田归农所属与门中争首细节；与天龙寺仅同名无关 |
| QL-K10 | 掌门人大会韦陀门、梧州八仙剑蓝秦、开封秦耐之一系、湖南易家湾九龙鞭的门派名、人物名、兵器和交手细节 |

### 12.5 开放问题（附默认值）

| # | 问题 | 默认值 |
|---|---|---|
| QL-O01 | 七心海棠法采用 8 地中，还是沿用 `design/17` 候选的 7 地下 | **8 地中**；`bf_qixin` 合法来源品阶为 8–10，避免用 7 品来源施加 8 品专属毒 |
| QL-O02 | 天山鹰扬功是否在飞狐、雪山均保留原创隐世延续 | **保留**；维持同年代三书的 8 品轻功上限与玩法连续性 |
| QL-O03 | 关东六魔是否允许缴获残谱学习 | **允许**；因此列入 72 门且不设 `enemyOnly`，同时为散承提供黄→玄→地落点 |
| QL-O04 | 掌门博艺的 `anyOf` 是否接纳商家堡及关东散承 | **接纳**；大会玩法重在辨派见闻，不要求正式门派身份 |
| QL-O05 | 胡苗百年套装强调相克还是和解 | **并存**：成员被动表达互知破绽，套装高档主题优先“化怨印证”，不设互斥 |
| QL-O06 | 17 个候选套装是否过多 | **保留全部候选**；`design/07` 可合并小派两件套或只选其中一部分，本文先确保每派有可成套组合 |
| QL-O07 | 护体“玄 / 黄档”是否成为正式枚举字段 | **不新增字段**；只由 `grade/nature` 派生作检索文案，实际容量按 21 计算 |
| QL-O08 | 地中武学应取 1 还是 2 记绝招 | **已解决：本册 3 门均按统一裁定表取 1**；9 重第二绝招已恢复普通成本与路线 | 见 `decisions/ultimate-counts-tianzhong-dizhong.md` §3 |

已有待决追溯：经脉正式 ID 已解决（见 QL-D03、`design/15`）；旧路线 cap 已由作者决定的独立乘区取代（见 `design/21` §3.5、§18.5）；调息默认不另耗内、9 级点穴不可自调息、护体默认不反震，均按 21 §10、§18.5 落地。
