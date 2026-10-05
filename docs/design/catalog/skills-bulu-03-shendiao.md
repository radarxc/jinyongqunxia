# 《神雕侠侣》首领武学补录图鉴（`skills-bulu-03-shendiao`）

> **归属（基准 §18）**：`design/catalog/skills-*.md` 门派武学图鉴补录册。本文只定义书界 03 为主书界、且现有十一册图鉴尚未定义的首领合规武学；不覆写既有门派图鉴。
> **上游**：`docs/decisions/author-decisions.md`、`docs/decisions/author-requirements.md` AR-14/15/16/27、`docs/00-canon.md`、`docs/decisions/rulings-v1.md`、`design/03` v2、`design/05`、`design/21` v2.0、`design/chapters/03-shendiao.md`。
> **引用而不重定义**：字段、层数、招式预算与外放 schema 见 `design/05`；经脉路线、调息、护体内劲与首领参数见 `design/21`；Buff 见 `design/06`；门派与职级见 `design/17`；装备见 `design/10`；任务和人物来源见 `design/chapters/03-shendiao.md`、`design/18`。
> **标注约定**：**（原创扩展）**为原著没有的武学、招名或机制；**（原创扩展命名）**为人物、兵器或表现有据但固定武学名无据；**（待考）**须以三联／广州修订版逐字核对；**【建议值】**为待唯一归属文档确认的数值。
>
> **覆盖声明**：本文新增 7 门 9 品地上武学，供古墓赤练支、绝情谷、吐蕃密宗金轮一脉与蒙古军伍按正常门派／职级／秘籍途径习得；没有一门以“仅首领可学”作为硬条件。全真、桃花岛、铁掌帮缺口归书界 02，不在本文造同门重复项。
> **版本**：首领武学补录与替补替换（2026-09-28）；经脉落地终审（2026-09-29）；路线叙事第三轮（2026-09-29）；阴阳性质落地 AR-18（2026-09-29）。

---

## 0. 绝招显式路线索引与逐招绑定

### 0.1 显式路线总表（正文卡镜像，非覆写层）

本表是每个 `MoveDef.meridianRouteRef` 的唯一穴位步骤定义；正文卡只引用，不重复步骤。动作末端、性质经脉族与门派底子按 `design/21` §4.3.1–§4.3.4 配路；每段 90 CT，绝招均为 8 段，故 `1200+8×90=1920≤2000 CT`。

<!-- skill-catalog-audit:start -->
| 品阶 | 武学 | MoveDef（正文卡镜像） | 路线 ID | steps（acupointRef/segmentCt/riskBp） |
|---|---|---|---|---|
| 9 地上 | `sk_chiliandugong` | `mv_chiliandugong_humai` `MoveDef{unlock:7;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;projection:false;meridianRouteRef:mfr_chiliandugong_humai}` | `mfr_chiliandugong_humai` | `MeridianRouteDef{moveRef:mv_chiliandugong_humai;ultimate:true;purpose:defense;requiredNature:[yin,harmony]}`；`ap_yinwei_qimen/90/100→ap_yinwei_daheng/90/120→ap_zujueyin_ququan/90/140→ap_shoujueyin_quze/90/160→ap_shoushaoyin_shenmen/90/180→ap_renmai_danzhong/90/200→ap_renmai_qihai/90/220→ap_renmai_guanyuan/90/240` |
| 9 地上 | `sk_chiliandugong` | `mv_chiliandugong_duhuo` `MoveDef{unlock:9;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;projection:false;meridianRouteRef:mfr_chiliandugong_duhuo}` | `mfr_chiliandugong_duhuo` | `MeridianRouteDef{moveRef:mv_chiliandugong_duhuo;ultimate:true;purpose:attack;requiredNature:[yin,harmony]}`；`ap_yinqiao_zhaohai/90/100→ap_zushaoyin_rangu/90/120→ap_zutaiyin_yinlingquan/90/140→ap_zujueyin_xingjian/90/160→ap_renmai_danzhong/90/180→ap_shoujueyin_quze/90/200→ap_shoujueyin_neiguan/90/220→ap_shoujueyin_laogong/90/240` |
| 9 地上 | `sk_chilianfuchen` | `mv_chilianfuchen_suomai` `MoveDef{unlock:7;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;projection:false;meridianRouteRef:mfr_chilianfuchen_suomai}` | `mfr_chilianfuchen_suomai` | `MeridianRouteDef{moveRef:mv_chilianfuchen_suomai;ultimate:true;purpose:attack;requiredNature:[yin,harmony]}`；`ap_zushaoyin_dazhong/90/100→ap_zushaoyin_yingu/90/120→ap_zutaiyin_xuehai/90/140→ap_renmai_danzhong/90/160→ap_shoushaoyin_lingdao/90/180→ap_shoutaiyin_taiyuan/90/200→ap_shoutaiyang_wangu/90/220→ap_shouyangming_hegu/90/240` |
| 9 地上 | `sk_chilianfuchen` | `mv_chilianfuchen_chilian` `MoveDef{unlock:9;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;projection:false;meridianRouteRef:mfr_chilianfuchen_chilian}` | `mfr_chilianfuchen_chilian` | `MeridianRouteDef{moveRef:mv_chilianfuchen_chilian;ultimate:true;purpose:attack;requiredNature:[yin,harmony]}`；`ap_yinwei_zhubin/90/100→ap_zushaoyin_fuliu/90/120→ap_renmai_shuifen/90/140→ap_zutaiyin_diji/90/160→ap_zujueyin_yinlian/90/180→ap_shoujueyin_quze/90/200→ap_shoushaoyang_yangchi/90/220→ap_shoutaiyang_yanggu/90/240` |
| 9 地上 | `sk_jueqingbixuejue` | `mv_jueqingbixuejue_bixue` `MoveDef{unlock:7;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;projection:false;meridianRouteRef:mfr_jueqingbixuejue_bixue}` | `mfr_jueqingbixuejue_bixue` | `MeridianRouteDef{moveRef:mv_jueqingbixuejue_bixue;ultimate:true;purpose:defense;requiredNature:[yin,harmony]}`；`ap_renmai_qihai/90/100→ap_renmai_guanyuan/90/120→ap_renmai_zhongji/90/140→ap_renmai_huiyin/90/160→ap_zushaoyin_taixi/90/180→ap_zutaiyin_xuehai/90/200→ap_shoujueyin_neiguan/90/220→ap_renmai_danzhong/90/240` |
| 9 地上 | `sk_jueqingbixuejue` | `mv_jueqingbixuejue_suoyuan` `MoveDef{unlock:9;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;projection:false;meridianRouteRef:mfr_jueqingbixuejue_suoyuan}` | `mfr_jueqingbixuejue_suoyuan` | `MeridianRouteDef{moveRef:mv_jueqingbixuejue_suoyuan;ultimate:true;purpose:defense;requiredNature:[yin,harmony]}`；`ap_yinwei_qimen/90/100→ap_yinwei_daheng/90/120→ap_zujueyin_xiguan/90/140→ap_zushaoyin_lingxu/90/160→ap_zutaiyin_dabao/90/180→ap_renmai_qugu/90/200→ap_shoushaoyin_shenmen/90/220→ap_renmai_shuifen/90/240` |
| 9 地上 | `sk_jindaoheijianjue` | `mv_jindaoheijianjue_daoluan` `MoveDef{unlock:7;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;projection:false;meridianRouteRef:mfr_jindaoheijianjue_daoluan}` | `mfr_jindaoheijianjue_daoluan` | `MeridianRouteDef{moveRef:mv_jindaoheijianjue_daoluan;ultimate:true;purpose:attack;requiredNature:[harmony]}`；`ap_daimai_zulinqi/90/100→ap_daimai_weidao/90/120→ap_zushaoyang_guangming/90/140→ap_zutaiyang_weizhong/90/160→ap_dumai_yaoyangguan/90/180→ap_shoutaiyang_xiaohai/90/200→ap_shoushaoyang_yangchi/90/220→ap_shoutaiyang_wangu/90/240` |
| 9 地上 | `sk_jindaoheijianjue` | `mv_jindaoheijianjue_heji` `MoveDef{unlock:9;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;projection:false;meridianRouteRef:mfr_jindaoheijianjue_heji}` | `mfr_jindaoheijianjue_heji` | `MeridianRouteDef{moveRef:mv_jindaoheijianjue_heji;ultimate:true;purpose:attack;requiredNature:[harmony]}`；`ap_chongmai_futonggu/90/100→ap_zuyangming_tianshu/90/120→ap_yangqiao_jianyu/90/140→ap_shouyangming_quchi/90/160→ap_shouyangming_shousanli/90/180→ap_dumai_mingmen/90/200→ap_shoushaoyang_waiguan/90/220→ap_shouyangming_hegu/90/240` |
| 9 地上 | `sk_jinganghufagong` | `mv_jinganghufagong_huti` `MoveDef{unlock:7;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;projection:false;meridianRouteRef:mfr_jinganghufagong_huti}` | `mfr_jinganghufagong_huti` | `MeridianRouteDef{moveRef:mv_jinganghufagong_huti;ultimate:true;purpose:defense;requiredNature:[yang,harmony]}`；`ap_dumai_mingmen/90/100→ap_dumai_zhiyang/90/120→ap_dumai_shendao/90/140→ap_yangwei_yamen/90/160→ap_yangqiao_shenmai/90/180→ap_shoutaiyang_xiaohai/90/200→ap_shouyangming_quchi/90/220→ap_dumai_baihui/90/240` |
| 9 地上 | `sk_jinganghufagong` | `mv_jinganghufagong_zhenmai` `MoveDef{unlock:9;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;projection:false;meridianRouteRef:mfr_jinganghufagong_zhenmai}` | `mfr_jinganghufagong_zhenmai` | `MeridianRouteDef{moveRef:mv_jinganghufagong_zhenmai;ultimate:true;purpose:defense;requiredNature:[yang,harmony]}`；`ap_yangqiao_fuyang/90/100→ap_zutaiyang_kunlun/90/120→ap_zushaoyang_xuanzhong/90/140→ap_zuyangming_zusanli/90/160→ap_dumai_jizhong/90/180→ap_shoushaoyang_tianjing/90/200→ap_shoutaiyang_tianzong/90/220→ap_dumai_shenzhu/90/240` |
| 9 地上 | `sk_xueshantieshan` | `mv_xueshantieshan_jizhan` `MoveDef{unlock:7;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;projection:false;meridianRouteRef:mfr_xueshantieshan_jizhan}` | `mfr_xueshantieshan_jizhan` | `MeridianRouteDef{moveRef:mv_xueshantieshan_jizhan;ultimate:true;purpose:attack;requiredNature:[yin,harmony]}`；`ap_yinqiao_zhaohai/90/100→ap_yinwei_zhubin/90/120→ap_zujueyin_ququan/90/140→ap_zushaoyin_taixi/90/160→ap_zutaiyin_xuehai/90/180→ap_shoujueyin_neiguan/90/200→ap_shoushaoyang_yangchi/90/220→ap_shoutaiyang_wangu/90/240` |
| 9 地上 | `sk_xueshantieshan` | `mv_xueshantieshan_huishan` `MoveDef{unlock:9;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;projection:false;meridianRouteRef:mfr_xueshantieshan_huishan}` | `mfr_xueshantieshan_huishan` | `MeridianRouteDef{moveRef:mv_xueshantieshan_huishan;ultimate:true;purpose:attack;requiredNature:[yin,harmony]}`；`ap_zujueyin_taichong/90/100→ap_zutaiyin_diji/90/120→ap_zushaoyin_yingu/90/140→ap_renmai_danzhong/90/160→ap_shoushaoyin_lingdao/90/180→ap_shoutaiyin_taiyuan/90/200→ap_shoushaoyang_waiguan/90/220→ap_shoutaiyang_yanggu/90/240` |
| 9 地上 | `sk_caoyuanjunzhenxinfa` | `mv_caoyuanjunzhenxinfa_shouzheng` `MoveDef{unlock:7;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;projection:false;meridianRouteRef:mfr_caoyuanjunzhenxinfa_shouzheng}` | `mfr_caoyuanjunzhenxinfa_shouzheng` | `MeridianRouteDef{moveRef:mv_caoyuanjunzhenxinfa_shouzheng;ultimate:true;purpose:defense;requiredNature:[yang,harmony]}`；`ap_dumai_mingmen/90/100→ap_dumai_zhiyang/90/120→ap_yangwei_jianjing/90/140→ap_zuyangming_fenglong/90/160→ap_zushaoyang_yanglingquan/90/180→ap_shoutaiyang_xiaohai/90/200→ap_shouyangming_quchi/90/220→ap_dumai_baihui/90/240` |
| 9 地上 | `sk_caoyuanjunzhenxinfa` | `mv_caoyuanjunzhenxinfa_cuifeng` `MoveDef{unlock:9;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;projection:false;meridianRouteRef:mfr_caoyuanjunzhenxinfa_cuifeng}` | `mfr_caoyuanjunzhenxinfa_cuifeng` | `MeridianRouteDef{moveRef:mv_caoyuanjunzhenxinfa_cuifeng;ultimate:true;purpose:defense;requiredNature:[yang,harmony]}`；`ap_yangqiao_fuyang/90/100→ap_zutaiyang_chengshan/90/120→ap_zushaoyang_fengshi/90/140→ap_zuyangming_liangqiu/90/160→ap_dumai_yaoyangguan/90/180→ap_shoushaoyang_tianjing/90/200→ap_shoutaiyang_tianzong/90/220→ap_dumai_shenzhu/90/240` |
<!-- skill-catalog-audit:end -->

### 0.2 普通招式显式路线

下表定义十四个普通招式的稳定路线；与 §0.1 合计覆盖本文 28 个 `MoveDef`，正文卡只引用 `mfr_*`，不重复 steps。普通路线每段 80 CT、风险沿路递增；支援／护体路线取 `purpose:defense`，持械与伤害路线取 `purpose:attack`。

| 武学 | 招式 / `MoveDef` | 路线 ID | `MeridianRouteDef` / steps |
|---|---|---|---|
| `sk_chiliandugong` | `mv_chiliandugong_tiaodu` `MoveDef{unlock:1;ultimate:false;rageCost:0;mpCost:8%;cd:2;recovery:1000;projection:false;meridianRouteRef:mfr_chiliandugong_tiaodu}` | `mfr_chiliandugong_tiaodu` | `MeridianRouteDef{moveRef:mv_chiliandugong_tiaodu;ultimate:false;purpose:defense;requiredNature:[yin,harmony]}`；`ap_renmai_guanyuan/80/80→ap_renmai_qihai/80/100→ap_yinwei_daheng/80/120→ap_yinwei_qimen/80/140→ap_shoujueyin_neiguan/80/160` |
| `sk_chiliandugong` | `mv_chiliandugong_cuidu` `MoveDef{unlock:4;ultimate:false;rageCost:0;mpCost:9%;cd:2;recovery:1000;projection:false;meridianRouteRef:mfr_chiliandugong_cuidu}` | `mfr_chiliandugong_cuidu` | `MeridianRouteDef{moveRef:mv_chiliandugong_cuidu;ultimate:false;purpose:attack;requiredNature:[yin,harmony]}`；`ap_yinqiao_jiaoxin/80/80→ap_zushaoyin_rangu/80/100→ap_zutaiyin_yinlingquan/80/120→ap_shoujueyin_neiguan/80/140→ap_shoujueyin_laogong/80/160` |
| `sk_chilianfuchen` | `mv_chilianfuchen_tanchen` `MoveDef{unlock:1;ultimate:false;rageCost:0;mpCost:8%;cd:1;recovery:1000;projection:false;meridianRouteRef:mfr_chilianfuchen_tanchen}` | `mfr_chilianfuchen_tanchen` | `MeridianRouteDef{moveRef:mv_chilianfuchen_tanchen;ultimate:false;purpose:attack;requiredNature:[yin,harmony]}`；`ap_yinwei_zhubin/80/80→ap_zushaoyin_fuliu/80/100→ap_zujueyin_taichong/80/120→ap_shoushaoyang_waiguan/80/140→ap_shoutaiyang_wangu/80/160` |
| `sk_chilianfuchen` | `mv_chilianfuchen_huanying` `MoveDef{unlock:4;ultimate:false;rageCost:0;mpCost:8%;cd:2;recovery:1000;projection:false;meridianRouteRef:mfr_chilianfuchen_huanying}` | `mfr_chilianfuchen_huanying` | `MeridianRouteDef{moveRef:mv_chilianfuchen_huanying;ultimate:false;purpose:attack;requiredNature:[yin,harmony]}`；`ap_yinqiao_zhaohai/80/80→ap_zutaiyin_diji/80/100→ap_renmai_shuifen/80/120→ap_shoushaoyang_yangchi/80/140→ap_shoutaiyang_yanggu/80/160` |
| `sk_jueqingbixuejue` | `mv_jueqingbixuejue_shouxin` `MoveDef{unlock:1;ultimate:false;rageCost:0;mpCost:8%;cd:2;recovery:1000;projection:false;meridianRouteRef:mfr_jueqingbixuejue_shouxin}` | `mfr_jueqingbixuejue_shouxin` | `MeridianRouteDef{moveRef:mv_jueqingbixuejue_shouxin;ultimate:false;purpose:defense;requiredNature:[yin,harmony]}`；`ap_renmai_huiyin/80/80→ap_renmai_zhongji/80/100→ap_renmai_guanyuan/80/120→ap_renmai_qihai/80/140` |
| `sk_jueqingbixuejue` | `mv_jueqingbixuejue_nixi` `MoveDef{unlock:4;ultimate:false;rageCost:0;mpCost:8%;cd:3;recovery:1000;projection:false;meridianRouteRef:mfr_jueqingbixuejue_nixi}` | `mfr_jueqingbixuejue_nixi` | `MeridianRouteDef{moveRef:mv_jueqingbixuejue_nixi;ultimate:false;purpose:defense;requiredNature:[yin,harmony]}`；`ap_yinwei_daheng/80/80→ap_zujueyin_xiguan/80/100→ap_zushaoyin_taixi/80/120→ap_renmai_danzhong/80/140` |
| `sk_jindaoheijianjue` | `mv_jindaoheijianjue_jinpi` `MoveDef{unlock:1;ultimate:false;rageCost:0;mpCost:8%;cd:1;recovery:1000;projection:false;meridianRouteRef:mfr_jindaoheijianjue_jinpi}` | `mfr_jindaoheijianjue_jinpi` | `MeridianRouteDef{moveRef:mv_jindaoheijianjue_jinpi;ultimate:false;purpose:attack;requiredNature:[harmony]}`；`ap_daimai_daimai/80/80→ap_zushaoyang_guangming/80/100→ap_shoushaoyang_tianjing/80/120→ap_shoushaoyang_waiguan/80/140→ap_shoutaiyang_wangu/80/160` |
| `sk_jindaoheijianjue` | `mv_jindaoheijianjue_heifeng` `MoveDef{unlock:4;ultimate:false;rageCost:0;mpCost:8%;cd:2;recovery:1000;projection:false;meridianRouteRef:mfr_jindaoheijianjue_heifeng}` | `mfr_jindaoheijianjue_heifeng` | `MeridianRouteDef{moveRef:mv_jindaoheijianjue_heifeng;ultimate:false;purpose:attack;requiredNature:[harmony]}`；`ap_chongmai_futonggu/80/80→ap_zuyangming_liangqiu/80/100→ap_dumai_yaoyangguan/80/120→ap_shouyangming_quchi/80/140→ap_shouyangming_hegu/80/160` |
| `sk_jinganghufagong` | `mv_jinganghufagong_jingang` `MoveDef{unlock:1;ultimate:false;rageCost:0;mpCost:8%;cd:2;recovery:1000;projection:false;meridianRouteRef:mfr_jinganghufagong_jingang}` | `mfr_jinganghufagong_jingang` | `MeridianRouteDef{moveRef:mv_jinganghufagong_jingang;ultimate:false;purpose:defense;requiredNature:[yang,harmony]}`；`ap_dumai_mingmen/80/80→ap_dumai_jizhong/80/100→ap_dumai_zhiyang/80/120→ap_dumai_shenzhu/80/140` |
| `sk_jinganghufagong` | `mv_jinganghufagong_xingqi` `MoveDef{unlock:4;ultimate:false;rageCost:0;mpCost:8%;cd:3;recovery:1000;projection:false;meridianRouteRef:mfr_jinganghufagong_xingqi}` | `mfr_jinganghufagong_xingqi` | `MeridianRouteDef{moveRef:mv_jinganghufagong_xingqi;ultimate:false;purpose:defense;requiredNature:[yang,harmony]}`；`ap_yangqiao_shenmai/80/80→ap_zutaiyang_kunlun/80/100→ap_zuyangming_zusanli/80/120→ap_dumai_baihui/80/140` |
| `sk_xueshantieshan` | `mv_xueshantieshan_yafeng` `MoveDef{unlock:1;ultimate:false;rageCost:0;mpCost:8%;cd:1;recovery:1000;projection:false;meridianRouteRef:mfr_xueshantieshan_yafeng}` | `mfr_xueshantieshan_yafeng` | `MeridianRouteDef{moveRef:mv_xueshantieshan_yafeng;ultimate:false;purpose:attack;requiredNature:[yin,harmony]}`；`ap_yinqiao_zhaohai/80/80→ap_zujueyin_ququan/80/100→ap_shoujueyin_neiguan/80/120→ap_shoushaoyang_yangchi/80/140→ap_shoutaiyang_wangu/80/160` |
| `sk_xueshantieshan` | `mv_xueshantieshan_yincang` `MoveDef{unlock:4;ultimate:false;rageCost:0;mpCost:8%;cd:2;recovery:1000;projection:false;meridianRouteRef:mfr_xueshantieshan_yincang}` | `mfr_xueshantieshan_yincang` | `MeridianRouteDef{moveRef:mv_xueshantieshan_yincang;ultimate:false;purpose:attack;requiredNature:[yin,harmony]}`；`ap_yinwei_zhubin/80/80→ap_zushaoyin_taixi/80/100→ap_zutaiyin_xuehai/80/120→ap_shoutaiyin_taiyuan/80/140→ap_shoutaiyang_yanggu/80/160` |
| `sk_caoyuanjunzhenxinfa` | `mv_caoyuanjunzhenxinfa_zhengqi` `MoveDef{unlock:1;ultimate:false;rageCost:0;mpCost:8%;cd:2;recovery:1000;projection:false;meridianRouteRef:mfr_caoyuanjunzhenxinfa_zhengqi}` | `mfr_caoyuanjunzhenxinfa_zhengqi` | `MeridianRouteDef{moveRef:mv_caoyuanjunzhenxinfa_zhengqi;ultimate:false;purpose:defense;requiredNature:[yang,harmony]}`；`ap_dumai_mingmen/80/80→ap_dumai_yaoyangguan/80/100→ap_zuyangming_zusanli/80/120→ap_shouyangming_quchi/80/140` |
| `sk_caoyuanjunzhenxinfa` | `mv_caoyuanjunzhenxinfa_haohe` `MoveDef{unlock:4;ultimate:false;rageCost:0;mpCost:8%;cd:3;recovery:1000;projection:false;meridianRouteRef:mfr_caoyuanjunzhenxinfa_haohe}` | `mfr_caoyuanjunzhenxinfa_haohe` | `MeridianRouteDef{moveRef:mv_caoyuanjunzhenxinfa_haohe;ultimate:false;purpose:defense;requiredNature:[yang,harmony]}`；`ap_yangqiao_fuyang/80/80→ap_zutaiyang_chengshan/80/100→ap_zushaoyang_yanglingquan/80/120→ap_yangwei_jianjing/80/140→ap_dumai_baihui/80/160` |

## 1. 古墓派赤练支

### 1.1 `sk_chiliandugong` 赤练毒功（9 地上 · 内功 · 古墓派李莫愁一系）

> **出处**：李莫愁以赤练神掌、冰魄银针与毒术见长，《五毒秘传》亦在其一系流传；原著没有“赤练毒功”这一套具名内功，故整门及招式均为**（原创扩展）**。同门基础与现有条目同属 `skills-daojia` §3 古墓体系。

| 字段 | 值 |
|---|---|
| origin / sect / lineage | `expanded` / `sect_gumu` / 古墓派李莫愁一系 |
| sourceChapters | `[ch03_shendiao]` |
| nature · wOut/wIn · moveSlots | `yin` · `0/1` · 4 |
| meridians / InnerDef | `[mer_renmai,mer_yinwei,mer_shoujueyin]` **【建议值】**；`breathProfileRef:txp_chiliandugong`；`innerGuard:{enabled:true,reflectBp:0}`；`auxUsableMoves:[mv_chiliandugong_tiaodu]` |
| reqs | `attrs {bre:55,wil:50}`；`aptitude {apInner:40}`；古墓叛支身份；前置为赤练神掌 7 重与五毒秘传 5 重（ID 见 `skills-daojia` §3）；`hard:[aptitude,prereq]`；正线不因古墓身份自动获传 |
| trainingAttrs | `[{layer:3,attrs:{bre:1}},{layer:6,attrs:{bre:1,wil:1}},{layer:9,attrs:{bre:1,wil:1}}]` |
| inner.contribution | `{mpMaxPct:34,hpMaxPct:20,attrs:{con:5,wil:6,wis:3},mpRegen:2.5}`；`IP=34+20+2×(5+6+3)+5×2.5=94.5`；`stats {resPoison:10,effHit:5}` 合计 15 |
| 层数要点 | 1 重调毒入息；4 重催毒；**7 重绝招赤练护脉**；8 重以身试毒；**9 重绝招毒火攻心**；10 重毒功大成 |
| setTags / conflicts | `[]` / 与阳性主运按 `design/05` §5.4 处理阴阳相冲；不获得通用毒免 |
| special / observable | `{fusible:true}` / `true`（观摩上限 6 重） |
| learnSources | 李莫愁邪线传授（完成 `q_03_faction_80`，maxLayer 10，**原创扩展**）；陆无双归还《五毒秘传》并完成解毒试炼后得行气批注（maxLayer 8，**原创扩展**）；不是“首领专用” |
| description | 将古墓阴柔吐纳与李莫愁毒术相合的进阶主运；增益毒招命中，但不替代毒物、解药或 `design/06` 的毒抗结算。 |
| 招式归属 | `sk_chiliandugong`（本卡） |

| 招式（ID） | 重 | 范围 · 射程 | 倍率 | 耗内/cd/收招 | 附带 | 核算 / MoveDef |
|---|---:|---|---:|---|---|---|
| 调毒归脉 `mv_chiliandugong_tiaodu` **（原创扩展）** | 1 | 自身·支援 | 0 | 8%/2/1000 | 驱散自身 2 层 `bf_zhongdu`；`bf_bidu` G=2·2 | 支援招无伤害；`MoveDef{unlock:1;ultimate:false;rageCost:0;mpCost:8%;cd:2;recovery:1000;projection:false;meridianRouteRef:mfr_chiliandugong_tiaodu}` |
| 催毒入掌 `mv_chiliandugong_cuidu` **（原创扩展）** | 4 | 单体·1·近身 | 1.05 | 9%/2/1000 | `bf_zhongdu` 60%·3 | `1.29−0.10×0.60−0.18（内功招手调）=1.05`；`MoveDef{unlock:4;ultimate:false;rageCost:0;mpCost:9%;cd:2;recovery:1000;projection:false;meridianRouteRef:mfr_chiliandugong_cuidu}` |
| 赤练护脉 `mv_chiliandugong_humai`（绝招，**原创扩展**） | 7 | 自身·支援 | 0 | 9%/—/1200 | `bf_huxue` G=3·3、`bf_bidu` G=3·3；气势 100 | 支援绝招以气势、地阶耗内与收招支付；`MoveDef{unlock:7;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;projection:false;meridianRouteRef:mfr_chiliandugong_humai}` |
| 毒火攻心 `mv_chiliandugong_duhuo`（绝招，**原创扩展**） | 9 | 单体·1·近身 | 2.85 | 9%/—/1200 | `bf_judu` 100%·3；气势 100 | `3.00−0.15=2.85`；`MoveDef{unlock:9;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;projection:false;meridianRouteRef:mfr_chiliandugong_duhuo}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 毒中行气 | `ps_chiliandugong_duzhong` | 1 | 自身带 `poison` 标签状态时，调息的 `reliefBp` +10%；不减毒伤 |
| 以身试毒 | `ps_chiliandugong_yishen` | 8 | `resPoison +5→+12`；仍须通过免疫与效果检定 |
| 毒功大成 | `ps_chiliandugong_dacheng` | 10 | 本门招式施加毒状态的效果命中 +10pp，毒层数仍受 06 上限 |

- **路线叙事与互异**：“赤练护脉”由阴维与足厥阴起势，转手厥阴后归任脉护住丹田；“毒火攻心”由阴跷和足三阴起，经膻中保留攻击内功的任脉核心，最后沿曲泽—内关—劳宫发掌。两路共享 2/8 穴，不是轮换或逆序。

| 路线叙事第三轮同步镜像 | 模板代号 | 段数 | 路线 CT | 收招合计 | 风险列表 / 总风险 |
|---|---|---:|---:|---:|---|
| `mfr_chiliandugong_duhuo` | 见文首索引 | 8 | `8×90=720` | `1200+720=1920 CT` | `[100,120,140,160,180,200,220,240]` / `1360` |

### 1.2 `sk_chilianfuchen` 赤练拂尘（9 地上 · 兵器/鞭索（拂尘）· 古墓派李莫愁一系）

> **出处**：李莫愁以拂尘为常用兵器，现有 `sk_sanwusanbushou` 已收录三招原著名；“赤练拂尘”不是原著具名套路，故为**（原创扩展命名）**，四个招式名及效果均为**（原创扩展）**。本卡是同一赤练支的进阶套路，不改写 `skills-daojia` §3 既有条目。

| 字段 | 值 |
|---|---|
| origin / sect / lineage | `canonExpanded` / `sect_gumu` / 古墓派李莫愁一系 |
| sourceChapters | `[ch03_shendiao]` |
| nature · wOut/wIn · moveSlots | `yin` · `0.55/0.45` · 4 |
| weaponReq | `{category:whip,tags:[fuchen]}`；普通拂尘挥击不是外放 |
| reqs | `attrs {agi:55,wis:45}`；`aptitude {apWhip:40}`；前置为三无三不手 7 重与 `sk_chiliandugong` 5 重；`hard:[aptitude,prereq]` |
| trainingAttrs | `[{layer:3,attrs:{agi:1}},{layer:6,attrs:{agi:2,wis:1}},{layer:9,attrs:{agi:1}}]` |
| layerStats | `{hit:[3,9],effHit:[2,6]}`，10 重合计 15 |
| 层数要点 | 1 重探尘；4 重幻影回拂；**7 重绝招拂尘锁脉**；8 重毒尘；**9 重绝招赤练回环**；10 重拂尘大成 |
| setTags / conflicts | `[]` / 无 |
| special / observable | `{fusible:true}` / `true`（观摩上限 6 重） |
| learnSources | 李莫愁邪线于 `q_03_faction_80` 后传授（maxLayer 10，**原创扩展**）；击败李莫愁后可由其拂尘与《五毒秘传》校合残谱（maxLayer 8，**原创扩展**）；主角与其他合格人物可学 |
| description | 以长拂尘控制距离、卷腕锁脉并衔接赤练毒功；不是把“三无三不手”改名升品。 |
| 招式归属 | `sk_chilianfuchen`（本卡） |

| 招式（ID） | 重 | 范围 · 射程 | 倍率 | 耗内/cd/收招 | 附带 | 核算 / MoveDef |
|---|---:|---|---:|---|---|---|
| 探尘试势 `mv_chilianfuchen_tanchen` **（原创扩展）** | 1 | 单体·1–2·近身 | 1.10 | 8%/1/1000 | `bf_shiheng` 30%·1 | `1.17−0.05（射程）−0.10×0.30=1.09≈1.10`；`MoveDef{unlock:1;ultimate:false;rageCost:0;mpCost:8%;cd:1;recovery:1000;projection:false;meridianRouteRef:mfr_chilianfuchen_tanchen}` |
| 幻影回拂 `mv_chilianfuchen_huanying` **（原创扩展）** | 4 | `aoe_cone {angle:120,r:1,dirCount:6}`·近身 | 1.05 | 8%/2/1000 | — | N=3、AF=0.85；`0.85×1.29=1.096≈1.05`；`MoveDef{unlock:4;ultimate:false;rageCost:0;mpCost:8%;cd:2;recovery:1000;projection:false;meridianRouteRef:mfr_chilianfuchen_huanying}` |
| 拂尘锁脉 `mv_chilianfuchen_suomai`（绝招，**原创扩展**） | 7 | 单体·1–2·近身 | 2.65 | 9%/—/1200 | `bf_xueweishoufeng(level:8,acupointRef:sourcePrimary)` 70%·1；气势 100 | `3.00−0.10（射程）−0.20×0.70=2.76`，手调 −0.11 →2.65；`MoveDef{unlock:7;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;projection:false;meridianRouteRef:mfr_chilianfuchen_suomai}` |
| 赤练回环 `mv_chilianfuchen_chilian`（绝招，**原创扩展**） | 9 | `aoe_around`·近身 | 2.10 | 9%/—/1200 | `bf_zhongdu` 70%·3；气势 100 | N=6、AF=0.75；`3×0.75−0.10×0.70=2.18`，手调 −0.08 →2.10；`MoveDef{unlock:9;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;projection:false;meridianRouteRef:mfr_chilianfuchen_chilian}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 柔劲 | `ps_chilianfuchen_roujin` | 1 | 距离恰为 2 时 `parry +4→+10` |
| 毒尘 | `ps_chilianfuchen_duchen` | 8 | 命中已有 `poison` 状态的目标时 Z3 `+5%→+12%` |
| 拂尘大成 | `ps_chilianfuchen_dacheng` | 10 | 本武学施加点穴与中毒的效果命中 +10pp |

## 2. 绝情谷

### 2.1 `sk_jueqingbixuejue` 绝情闭穴诀（9 地上 · 内功 · 绝情谷）

> **出处**：公孙止能闭穴抗点穴，现有 `sk_bixuegong` 已收录原著事实与罩门代价；“绝情闭穴诀”是其高阶主运化的**（原创扩展）**，不把新增机制冒充小说设定。本卡与 `skills-daojia` §6 属同一绝情谷体系。

| 字段 | 值 |
|---|---|
| origin / sect / lineage | `expanded` / `sect_jueqinggu` / 绝情谷历代谷主 |
| sourceChapters | `[ch03_shendiao]` |
| nature · wOut/wIn · moveSlots | `yin` · `0/1` · 4 |
| meridians / InnerDef | `[mer_renmai,mer_yinwei,mer_daimai]` **【建议值】**；`breathProfileRef:txp_jueqingbixuejue`；`innerGuard:{enabled:true,reflectBp:0}`；`auxUsableMoves:[mv_jueqingbixuejue_nixi]` |
| reqs | `attrs {bre:55,wil:45}`；`aptitude {apInner:40}`；`sect {id:sect_jueqinggu,rank:4}`；前置为闭穴功 7 重与绝情心诀 7 重（ID 见 `skills-daojia` §6）；`hard:[aptitude,sect,prereq]` |
| trainingAttrs | `[{layer:3,attrs:{bre:1}},{layer:6,attrs:{bre:1,wil:1}},{layer:9,attrs:{bre:1,wil:1}}]` |
| inner.contribution | `{mpMaxPct:34,hpMaxPct:20,attrs:{con:6,wil:6,wis:2},mpRegen:2.5}`；`IP=34+20+2×(6+6+2)+5×2.5=94.5`；`stats {resSeal:10,defIn:5}` 合计 15 |
| 层数要点 | 1 重守心闭穴；4 重逆息开脉；**7 重绝招闭穴藏机**；8 重闭中留门；**9 重绝招锁元守一**；10 重闭穴大成 |
| setTags / conflicts | `[]` / 保留基础闭穴功的罩门代价；不得叠成无条件点穴免疫 |
| special / observable | `{fusible:true}` / `false`（闭穴次序不可由交手直接观摩） |
| learnSources | 绝情谷 L4 由谷主传授（maxLayer 10，**原创扩展**）；完成谷中旧案后由剑室行气图与闭穴功原谱校合（maxLayer 8，**原创扩展**）；主角与其他合格门人均可学 |
| description | 把闭穴功提升为地上主运，以主动守穴、逐级解封和护体承担强度；绝不脚本化为“点穴无效”。 |
| 招式归属 | `sk_jueqingbixuejue`（本卡） |

| 招式（ID） | 重 | 范围 · 射程 | 倍率 | 耗内/cd/收招 | 附带 | 核算 / MoveDef |
|---|---:|---|---:|---|---|---|
| 守心闭穴 `mv_jueqingbixuejue_shouxin` **（原创扩展）** | 1 | 自身·支援 | 0 | 8%/2/1000 | `bf_huxue` G=2·3 | 支援招无伤害；`MoveDef{unlock:1;ultimate:false;rageCost:0;mpCost:8%;cd:2;recovery:1000;projection:false;meridianRouteRef:mfr_jueqingbixuejue_shouxin}` |
| 逆息开脉 `mv_jueqingbixuejue_nixi` **（原创扩展）** | 4 | 自身·支援 | 0 | 8%/3/1000 | 将一个 1–8 级 `bf_xueweishoufeng` 降 1 级；9 级禁止自调息时不可用 | 严格复用 21 §10.2 解穴边界；`MoveDef{unlock:4;ultimate:false;rageCost:0;mpCost:8%;cd:3;recovery:1000;projection:false;meridianRouteRef:mfr_jueqingbixuejue_nixi}` |
| 闭穴藏机 `mv_jueqingbixuejue_bixue`（绝招，**原创扩展**） | 7 | 自身·支援 | 0 | 9%/—/1200 | `bf_mian_xue` G=3·2、`bf_huxue` G=3·3；气势 100 | 免穴持续短且仍保留罩门；`MoveDef{unlock:7;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;projection:false;meridianRouteRef:mfr_jueqingbixuejue_bixue}` |
| 锁元守一 `mv_jueqingbixuejue_suoyuan`（绝招，**原创扩展**） | 9 | 自身·支援 | 0 | 9%/—/1200 | `bf_hutizhenqi` 100%·3，`shieldPctHpMax:21.6%`；气势 100 | 地阶治疗基准 18% 的等价护体 ×1.2=`21.6%`；`MoveDef{unlock:9;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;projection:false;meridianRouteRef:mfr_jueqingbixuejue_suoyuan}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 无情守窍 | `ps_jueqingbixuejue_wuqing` | 1 | `resSeal +5→+12`，不更改点穴硬控等级 |
| 闭中留门 | `ps_jueqingbixuejue_biyuan` | 8 | 罩门被识破前 `defIn +5→+12`；被识破后归零 |
| 闭穴大成 | `ps_jueqingbixuejue_dacheng` | 10 | 每次调息额外选择一个受封穴位；仍受 9 级禁止自调息约束 |

### 2.2 `sk_jindaoheijianjue` 金刀黑剑诀（9 地上 · 兵器/刀剑 · 绝情谷）

> **出处**：公孙止一手金刀、一手黑剑，刀走剑路、剑作刀使；兵器形制与交手细节仍须核对**（待考：《神雕侠侣》杨过、小龙女在绝情谷与公孙止交手段落）**。“金刀黑剑诀”及本卡招名为**（原创扩展命名）**，是 `skills-daojia` §6 `sk_yinyangdaoluan` 的进阶而非改名重定义。

| 字段 | 值 |
|---|---|
| origin / sect / lineage | `canonExpanded` / `sect_jueqinggu` / 公孙止一系 |
| sourceChapters | `[ch03_shendiao]` |
| nature · wOut/wIn · moveSlots | `harmony` · `0.65/0.35` · 4 |
| weaponReq | `{category:blade}`；主手刀即可使用，副手为剑时激活“双刃”效果；异类双持接口沿用 `skills-daojia` §6.3 的既有约束，不借左右互搏 `dualWield` |
| reqs | `attrs {str:55,agi:45}`；`aptitude {apBlade:40,apSword:40}`；`sect {id:sect_jueqinggu,rank:4}`；前置为阴阳倒乱刃法 7 重（ID 见 `skills-daojia` §6）；`hard:[aptitude,sect,prereq]` |
| trainingAttrs | `[{layer:3,attrs:{str:1}},{layer:6,attrs:{str:2,agi:1}},{layer:9,attrs:{str:1}}]` |
| layerStats | `{pierce:[3,9],hit:[2,6]}`，10 重合计 15 |
| 层数要点 | 1 重金刀横劈；4 重黑剑回锋；**7 重绝招刀乱剑正**；8 重交手换刃；**9 重绝招金刀黑剑合击**；10 重双刃大成 |
| setTags / conflicts | `[]` / 破刀、破剑分别按实际伤害段判定；不得把两类克制相乘 |
| special / observable | `{fusible:true}` / `true`（观摩上限 6 重） |
| learnSources | 绝情谷 L4 经剑室试炼传授（maxLayer 10，**原创扩展**）；取得谷主刀剑行气谱并由任一绝情谷长辈校合（maxLayer 8，**原创扩展**）；不是公孙止专属锁定 |
| description | 在既有倒乱刃法上完成地上进阶；单刀可施，配剑副手才兑现双刃条件收益。 |
| 招式归属 | `sk_jindaoheijianjue`（本卡） |

| 招式（ID） | 重 | 范围 · 射程 | 倍率 | 耗内/cd/收招 | 附带 | 核算 / MoveDef |
|---|---:|---|---:|---|---|---|
| 金刀横劈 `mv_jindaoheijianjue_jinpi` **（原创扩展命名）** | 1 | `aoe_cone {angle:120,r:1,dirCount:6}`·近身 | 1.05 | 8%/1/1000 | — | N=3、AF=0.85；`0.85×1.17=0.994≈1.00`，双刃常见收益 +0.05 →1.05；`MoveDef{unlock:1;ultimate:false;rageCost:0;mpCost:8%;cd:1;recovery:1000;projection:false;meridianRouteRef:mfr_jindaoheijianjue_jinpi}` |
| 黑剑回锋 `mv_jindaoheijianjue_heifeng` **（原创扩展命名）** | 4 | 单体·1·近身 | 1.20 | 8%/2/1000 | `bf_shiheng` 60%·1 | `1.29−0.10×0.60=1.23≈1.20`；`MoveDef{unlock:4;ultimate:false;rageCost:0;mpCost:8%;cd:2;recovery:1000;projection:false;meridianRouteRef:mfr_jindaoheijianjue_heifeng}` |
| 刀乱剑正 `mv_jindaoheijianjue_daoluan`（绝招，**原创扩展命名**） | 7 | `aoe_around`·近身 | 2.15 | 9%/—/1200 | `bf_shiheng` 50%·1；气势 100 | N=6、AF=0.75；`3×0.75−0.10×0.50=2.20`，手调 −0.05 →2.15；`MoveDef{unlock:7;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;projection:false;meridianRouteRef:mfr_jindaoheijianjue_daoluan}` |
| 金刀黑剑合击 `mv_jindaoheijianjue_heji`（绝招，**原创扩展命名**） | 9 | 单体·1·近身（2 段） | 2.90 | 9%/—/1200 | 副手为剑时 `bf_pojia` 60%·2；气势 100 | `3.00−0.10×0.60=2.94≈2.90`；无副手仍可施但不附破甲；`MoveDef{unlock:9;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;projection:false;meridianRouteRef:mfr_jindaoheijianjue_heji}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 阴阳互易 | `ps_jindaoheijianjue_yinyang` | 1 | 副手为剑时，破刀／破剑对对应伤害段的效果各 ×0.7，不交叉、不相乘 |
| 交手换刃 | `ps_jindaoheijianjue_jiaoshou` | 8 | 主副手互换的额外收招 `+150→0`；换手后下一招 hit `+5→+12` |
| 双刃大成 | `ps_jindaoheijianjue_dacheng` | 10 | 副手为剑时本武学 `crit +5`；单刀时不生效 |

## 3. 吐蕃密宗金轮一脉

### 3.1 `sk_jinganghufagong` 金刚护法功（9 地上 · 内功 · 吐蕃密宗）

> **出处**：金轮法王门下有护法、法器与刚猛内功的传承背景；原著没有“金刚护法功”这一具名内功，故整门及招式均为**（原创扩展）**。本卡与 `skills-xiaoyao` §6 的吐蕃密宗武学属于同一门派体系，是 `sk_mizonghufashen` 的进阶，不改写既有条目。

| 字段 | 值 |
|---|---|
| origin / sect / lineage | `expanded` / `sect_mizong` / 金轮法王护法一脉 |
| sourceChapters | `[ch03_shendiao]` |
| nature · wOut/wIn · moveSlots | `yang` · `0/1` · 4 |
| meridians / InnerDef | `[mer_dumai,mer_yangwei,mer_yangqiao]` **【建议值】**；`breathProfileRef:txp_jinganghufagong`；`innerGuard:{enabled:true,reflectBp:0}`；`auxUsableMoves:[mv_jinganghufagong_xingqi]` |
| reqs | `attrs {bre:55,con:45}`；`aptitude {apInner:40}`；`sect {id:sect_mizong,rank:3}`；前置为 `sk_mizonghufashen` 7 重与 `sk_zhuohuogong` 5 重；`hard:[aptitude,sect,prereq]` |
| trainingAttrs | `[{layer:3,attrs:{bre:1,con:1}},{layer:6,attrs:{bre:2,con:1}},{layer:9,attrs:{bre:2,con:1}}]` |
| inner.contribution | `{mpMaxPct:34,hpMaxPct:20,attrs:{con:6,wil:5,str:3},mpRegen:2.5}`；`IP=34+20+2×(6+5+3)+5×2.5=94.5`；`stats {defIn:8,resCC:7}` 合计 15 |
| 层数要点 | 1 重金刚守身；4 重行气固本；**7 重绝招金刚护体**；8 重护法持身；**9 重绝招震脉归元**；10 重护法大成 |
| setTags / conflicts | `[]` / 与阴性主运按 `design/05` §5.4 处理阴阳相冲；护盾与护体内劲仍按 21 §4.8 顺序结算 |
| special / observable | `{fusible:true}` / `true`（观摩上限 6 重） |
| learnSources | 密宗 L3 护经试炼后由护法传授（maxLayer 10，**原创扩展**）；完成 `q_03_bond_08` 护经分支后由达尔巴提供行气批注（maxLayer 8，**原创扩展**）；主角与其他合格门人均可学 |
| description | 以刚猛阳息护住躯干和督脉的地上主运；强项是护体与解封，不把宗教名目写成现实修法。 |
| 招式归属 | `sk_jinganghufagong`（本卡） |

| 招式（ID） | 重 | 范围 · 射程 | 倍率 | 耗内/cd/收招 | 附带 | 核算 / MoveDef |
|---|---:|---|---:|---|---|---|
| 金刚守身 `mv_jinganghufagong_jingang` **（原创扩展）** | 1 | 自身·支援 | 0 | 8%/2/1000 | `bf_shoushi` G=2·2 | 支援招无伤害；`MoveDef{unlock:1;ultimate:false;rageCost:0;mpCost:8%;cd:2;recovery:1000;projection:false;meridianRouteRef:mfr_jinganghufagong_jingang}` |
| 行气固本 `mv_jinganghufagong_xingqi` **（原创扩展）** | 4 | 自身·支援 | 0 | 8%/3/1000 | `bf_guben` G=2·3；将一个 1–6 级 `bf_xueweishoufeng` 降 1 级 | 支援与解穴边界见 21 §10.2；`MoveDef{unlock:4;ultimate:false;rageCost:0;mpCost:8%;cd:3;recovery:1000;projection:false;meridianRouteRef:mfr_jinganghufagong_xingqi}` |
| 金刚护体 `mv_jinganghufagong_huti`（绝招，**原创扩展**） | 7 | 自身·支援 | 0 | 9%/—/1200 | `bf_hutizhenqi` 100%·3，`shieldPctHpMax:21.6%`；气势 100 | 地阶治疗基准 18% 的等价护体 ×1.2=`21.6%`；`MoveDef{unlock:7;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;projection:false;meridianRouteRef:mfr_jinganghufagong_huti}` |
| 震脉归元 `mv_jinganghufagong_zhenmai`（绝招，**原创扩展**） | 9 | 自身·支援 | 0 | 9%/—/1200 | 将一个 1–8 级 `bf_xueweishoufeng` 降 2 级；`bf_huxue` G=3·3；气势 100 | 9 级禁用调息时不可施；`MoveDef{unlock:9;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;projection:false;meridianRouteRef:mfr_jinganghufagong_zhenmai}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 护法持身 | `ps_jinganghufagong_chishen` | 1 | 本门护盾存在时 `resCC +5→+12` |
| 刚脉 | `ps_jinganghufagong_gangmai` | 8 | 调息清除 backlog 的 `reliefBp +10%`，不改变每回合自然衰减 |
| 护法大成 | `ps_jinganghufagong_dacheng` | 10 | 本门产生的护体真气消散时，回复剩余护盾量 10% 的内力，最多为内力上限 5% |

### 3.2 `sk_xueshantieshan` 雪山铁扇（9 地上 · 兵器/奇门（折扇）· 霍都一系）

> **出处**：霍都使用铁骨折扇，扇骨暗器细节见 `skills-xiaoyao` §6.1 与 `skills-wujue` §11；“雪山铁扇”及本卡招名均为**（原创扩展命名）**。本卡与 `skills-wujue` §11 `sk_huodushanfa` 属同一人物传承，也沿用 `skills-xiaoyao` §6 的密宗内功底子。

| 字段 | 值 |
|---|---|
| origin / sect / lineage | `canonExpanded` / `sect_mizong` / 金轮法王门下霍都支 |
| sourceChapters | `[ch03_shendiao]` |
| nature · wOut/wIn · moveSlots | `yin` · `0.65/0.35` · 4 |
| weaponReq | `{category:exotic,kinds:[fan]}`；折扇挥击与扇骨实体均不是离体真气外放 |
| reqs | `attrs {wis:55,agi:45}`；`aptitude {apExotic:40}`；`sect {id:sect_mizong,rank:3}`；前置为 `sk_huodushanfa` 7 重与 `sk_mizonghufashen` 5 重；`hard:[aptitude,sect,prereq]` |
| trainingAttrs | `[{layer:3,attrs:{wis:1}},{layer:6,attrs:{wis:2,agi:1}},{layer:9,attrs:{wis:1}}]` |
| layerStats | `{hit:[3,9],eva:[2,6]}`，10 重合计 15 |
| 层数要点 | 1 重开扇压锋；4 重隐藏扇骨；**7 重绝招疾展封门**；8 重借扇回身；**9 重绝招雪山回扇**；10 重铁扇大成 |
| setTags / conflicts | `[]` / 扇骨、毒针均按实体投射结算，不获得外放增益 |
| special / observable | `{fusible:true}` / `true`（观摩上限 6 重） |
| learnSources | 霍都敌对路线观摩并夺得扇谱后校合（maxLayer 8，**原创扩展**）；密宗 L3 经达尔巴辨伪、护法许可后传授正谱（maxLayer 10，**原创扩展**）；不是霍都专属锁定 |
| description | 把霍都扇法升为地上进阶，以铁扇遮线、贴身封门和回旋扫击取胜；暗器实体仍由装备与弹药规则处理。 |
| 招式归属 | `sk_xueshantieshan`（本卡） |

| 招式（ID） | 重 | 范围 · 射程 | 倍率 | 耗内/cd/收招 | 附带 | 核算 / MoveDef |
|---|---:|---|---:|---|---|---|
| 开扇压锋 `mv_xueshantieshan_yafeng` **（原创扩展命名）** | 1 | `aoe_cone {angle:120,r:1,dirCount:6}`·近身 | 1.00 | 8%/1/1000 | — | N=3、AF=0.85；`0.85×1.17=0.994≈1.00`；`MoveDef{unlock:1;ultimate:false;rageCost:0;mpCost:8%;cd:1;recovery:1000;projection:false;meridianRouteRef:mfr_xueshantieshan_yafeng}` |
| 隐藏扇骨 `mv_xueshantieshan_yincang` **（原创扩展命名）** | 4 | 单体·1–2·近身 | 1.15 | 8%/2/1000 | `bf_pojia` 40%·2 | `1.29−0.05（射程）−0.10×0.40=1.20`，手调 −0.05 →1.15；`MoveDef{unlock:4;ultimate:false;rageCost:0;mpCost:8%;cd:2;recovery:1000;projection:false;meridianRouteRef:mfr_xueshantieshan_yincang}` |
| 疾展封门 `mv_xueshantieshan_jizhan`（绝招，**原创扩展命名**） | 7 | 单体·1·近身 | 2.90 | 9%/—/1200 | `bf_shiheng` 70%·1；气势 100 | `3.00−0.10×0.70=2.93≈2.90`；`MoveDef{unlock:7;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;projection:false;meridianRouteRef:mfr_xueshantieshan_jizhan}` |
| 雪山回扇 `mv_xueshantieshan_huishan`（绝招，**原创扩展命名**） | 9 | `aoe_around`·近身 | 2.15 | 9%/—/1200 | `bf_pojia` 50%·2；气势 100 | N=6、AF=0.75；`3×0.75−0.10×0.50=2.20`，手调 −0.05 →2.15；`MoveDef{unlock:9;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;projection:false;meridianRouteRef:mfr_xueshantieshan_huishan}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 扇影 | `ps_xueshantieshan_shanying` | 1 | 本回合移动不超过 1 格时，本武学 `parry +5→+12` |
| 借扇回身 | `ps_xueshantieshan_huishen` | 8 | 成功招架后下一式 `ct +100`，每回合 1 次 |
| 铁扇大成 | `ps_xueshantieshan_dacheng` | 10 | 本武学施加失衡与破甲的效果命中 +10pp |

## 4. 蒙古军伍

### 4.1 `sk_caoyuanjunzhenxinfa` 草原军阵心法（9 地上 · 内功 · 蒙古军伍）

> **出处**：蒙古军阵、骑射与号令是本书时代背景；“草原军阵心法”及其招式均为**（原创扩展）**，不据此声称史实军制有同名秘传。本卡与 `skills-general` §3 的军伍百战体系、`skills-wujue` §11 的蒙古体系同源，作为 `sk_baizhanxinfa` 的 9 品进阶。

| 字段 | 值 |
|---|---|
| origin / sect / lineage | `expanded` / `sect_menggu` / 蒙古军伍百战传承 |
| sourceChapters | `[ch03_shendiao]` |
| nature · wOut/wIn · moveSlots | `yang` · `0/1` · 4 |
| meridians / InnerDef | `[mer_dumai,mer_yangqiao,mer_zuyangming]` **【建议值】**；`breathProfileRef:txp_caoyuanjunzhenxinfa`；`innerGuard:{enabled:true,reflectBp:0}`；`auxUsableMoves:[mv_caoyuanjunzhenxinfa_haohe]` |
| reqs | `attrs {bre:55,wil:45}`；`aptitude {apInner:40}`；`sect {id:sect_menggu,rank:4}`；前置为 `sk_baizhanxinfa` 7 重与 `sk_caoyuantunaxi` 5 重；`hard:[aptitude,sect,prereq]` |
| trainingAttrs | `[{layer:3,attrs:{bre:1}},{layer:6,attrs:{bre:2}},{layer:9,attrs:{bre:2}}]` |
| inner.contribution | `{mpMaxPct:34,hpMaxPct:20,attrs:{con:6,wil:5,str:3},mpRegen:2.5}`；`IP=34+20+2×(6+5+3)+5×2.5=94.5`；`stats {tough:8,resCC:7}` 合计 15 |
| 层数要点 | 1 重整旗定气；4 重号喝同袍；**7 重绝招守正如山**；8 重轮阵换位；**9 重绝招催锋并进**；10 重军阵大成 |
| setTags / conflicts | `[]` / 与现有军伍百战套装属同一体系但不加入该套装；号令增益走既有 Buff，不为无军阵目标凭空生成友军 |
| special / observable | `{fusible:true}` / `true`（观摩上限 6 重） |
| learnSources | 蒙古军伍 L4 且完成守营、整队与军令考核后传授（maxLayer 10，**原创扩展**）；缴获百户阵图并由军旅教头校合（maxLayer 8，**原创扩展**）；真实投效或战后缴获路线均可供合格人物习得 |
| description | 将军旅吐纳和百战行气提升为百户以上的军阵主运，以站稳、协同和催锋承担强度；不绑定某一首领。 |
| 招式归属 | `sk_caoyuanjunzhenxinfa`（本卡） |

| 招式（ID） | 重 | 范围 · 射程 | 倍率 | 耗内/cd/收招 | 附带 | 核算 / MoveDef |
|---|---:|---|---:|---|---|---|
| 整旗定气 `mv_caoyuanjunzhenxinfa_zhengqi` **（原创扩展）** | 1 | 自身·支援 | 0 | 8%/2/1000 | `bf_wenzhong` G=2·2 | 支援招无伤害；`MoveDef{unlock:1;ultimate:false;rageCost:0;mpCost:8%;cd:2;recovery:1000;projection:false;meridianRouteRef:mfr_caoyuanjunzhenxinfa_zhengqi}` |
| 号喝同袍 `mv_caoyuanjunzhenxinfa_haohe` **（原创扩展）** | 4 | `aoe_allies r2`·支援 | 0 | 8%/3/1000 | 友方 `bf_wenzhong` G=1·2 | 声音与军令不是离体真气；`MoveDef{unlock:4;ultimate:false;rageCost:0;mpCost:8%;cd:3;recovery:1000;projection:false;meridianRouteRef:mfr_caoyuanjunzhenxinfa_haohe}` |
| 守正如山 `mv_caoyuanjunzhenxinfa_shouzheng`（绝招，**原创扩展**） | 7 | `aoe_allies r2`·支援 | 0 | 9%/—/1200 | 友方 `bf_wenzhong` G=3·3、施术者 `bf_shoushi` G=2·2；气势 100 | 群体支援绝招以无伤害、气势和收招支付；`MoveDef{unlock:7;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;projection:false;meridianRouteRef:mfr_caoyuanjunzhenxinfa_shouzheng}` |
| 催锋并进 `mv_caoyuanjunzhenxinfa_cuifeng`（绝招，**原创扩展**） | 9 | `aoe_allies r2`·支援 | 0 | 9%/—/1200 | 友方 `bf_ruiyi` G=2·2、`bf_jixing` G=2·2；气势 100 | 号令支援不走伤害预算，也不视为外放；`MoveDef{unlock:9;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;projection:false;meridianRouteRef:mfr_caoyuanjunzhenxinfa_cuifeng}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 伍列 | `ps_caoyuanjunzhenxinfa_wulie` | 1 | 相邻友方存在时 `resCC +5→+12` |
| 轮阵换位 | `ps_caoyuanjunzhenxinfa_huanzhen` | 8 | 相邻友方离场时自身获 `bf_wenzhong` G=2·2，每回合 1 次 |
| 军阵大成 | `ps_caoyuanjunzhenxinfa_dacheng` | 10 | 本门群体支援范围 +1，但同一单位同名 Buff 仍按 06 覆盖／并存规则结算 |

## 5. 内功调息档案与护体内劲

四门内功均以 `breathProfileRef` 引用下表唯一 `BreathProfile`。输入字段顺序为 `grade/layer/nature/scope/ct/mpCostBp/outOfBattleScaleBp`；满层核算直接用 `design/21` §10.2，阴／阳 `natureBp=10000`。护体“高档”只是检索标签，实际容量仍由当次 `MeridianProfile` 计算。

| 内功 | `BreathProfile.id` | 输入 | 10 重 `reliefBp / repairUnits` | 护体内劲 |
|---|---|---|---|---|
| `sk_chiliandugong` | `txp_chiliandugong` | `9/10/yin/3/1000/0/15000` | `500+9×100+10×80=2200`；`120+9×24+10×18=516` | `guard:yin-high`；自然阴性防守路线；`reflectBp:0`；`outOfBattleScaleBp:15000` |
| `sk_jueqingbixuejue` | `txp_jueqingbixuejue` | `9/10/yin/3/1000/0/15000` | `2200 / 516` | `guard:yin-high`；自然阴性防守路线；主动护体见 `mv_jueqingbixuejue_suoyuan`；`reflectBp:0`；`outOfBattleScaleBp:15000` |
| `sk_jinganghufagong` | `txp_jinganghufagong` | `9/10/yang/3/1000/0/15000` | `2200 / 516` | `guard:yang-high`；自然阳性防守路线；主动护体见 `mv_jinganghufagong_huti`；`reflectBp:0`；`outOfBattleScaleBp:15000` |
| `sk_caoyuanjunzhenxinfa` | `txp_caoyuanjunzhenxinfa` | `9/10/yang/3/1000/0/15000` | `2200 / 516` | `guard:yang-high`；自然阳性防守路线；无主动护盾招；`reflectBp:0`；`outOfBattleScaleBp:15000` |

战斗外调息把两项恢复结果乘 `15000 bp` 后向下取整；9 级点穴仍禁止自行调息。护盾先于护体内劲，护体内劲再先于 `mpGuard`，本文不改写 `design/21` §4.8、§10 的算法与结算序。

## 6. 外放候选审计表

按 `design/21` §4.4.1 与 `design/05` 的 `MoveDef` 字段逐招判定。本文无离体真气外放招；`projection:false` 时不得填写 `projectionSpreadSteps`，经脉路线也不要求为外放而强行改走手部端点。

| 武学 | 已审计招式 | 判定 | 理由 |
|---|---|---|---|
| `sk_chiliandugong` | `tiaodu`、`cuidu`、`humai`、`duhuo` | 4/4 `projection:false` | 调息、护脉与贴身掌劲；毒效不是离体真气 |
| `sk_chilianfuchen` | `tanchen`、`huanying`、`suomai`、`chilian` | 4/4 `projection:false` | 拂尘实体挥击、卷缠与回环，不按鞭梢距离冒充外放 |
| `sk_jueqingbixuejue` | `shouxin`、`nixi`、`bixue`、`suoyuan` | 4/4 `projection:false` | 全为自身闭穴、调息与护体 |
| `sk_jindaoheijianjue` | `jinpi`、`heifeng`、`daoluan`、`heji` | 4/4 `projection:false` | 金刀、黑剑的普通兵刃挥击与双刃近战 |
| `sk_jinganghufagong` | `jingang`、`xingqi`、`huti`、`zhenmai` | 4/4 `projection:false` | 全为自身守势、行气、护体与解封 |
| `sk_xueshantieshan` | `yafeng`、`yincang`、`jizhan`、`huishan` | 4/4 `projection:false` | 折扇挥击；扇骨、毒针等实体投射也不算外放 |
| `sk_caoyuanjunzhenxinfa` | `zhengqi`、`haohe`、`shouzheng`、`cuifeng` | 4/4 `projection:false` | 自身行气与军令支援；声响不等于真气外放 |

## 7. 统计与来源扩展登记

### 7.1 统计

| 门派／来源 | 武学 | 内功 / 外功 | 招式 | 绝招 | 被动 | 外放招式 |
|---|---:|---:|---:|---:|---:|---:|
| 古墓赤练支 | 2 | 1 / 1 | 8 | 4 | 6 | 0 |
| 绝情谷 | 2 | 1 / 1 | 8 | 4 | 6 | 0 |
| 吐蕃密宗金轮一脉 | 2 | 1 / 1 | 8 | 4 | 6 | 0 |
| 蒙古军伍 | 1 | 1 / 0 | 4 | 2 | 3 | 0 |
| **合计** | **7** | **4 / 3** | **28** | **14** | **21** | **0** |

七门均为 9 品地上，严格各有 2 个绝招且在 7／9 重解锁。每条绝招路线为 `8×90=720 CT`，与 1200 收招合计 1920 CT；同门两绝招最多共享 4/8 穴位，且不存在轮换、逆序或全库完全相同路线。

### 7.2 来源扩展登记

| `sk_*` | 需加入书界 | 依据 / 处理 |
|---|---|---|
| — | — | 本任务无来源扩展待登记 |
| `sk_jiuyin`（复用） | 已含 `ch03_shendiao` | `skills-wujue` §7 已记古墓石刻与神雕来源，不另登记 |
| `sk_pojunqiangfa`（复用） | 已含神雕 | `skills-general` §3 已列神雕，不另登记 |

## 本文新增术语与 ID

| 类别 | 数量 | ID |
|---|---:|---|
| 武学 `sk_` | 7 | `sk_chiliandugong`、`sk_chilianfuchen`、`sk_jueqingbixuejue`、`sk_jindaoheijianjue`、`sk_jinganghufagong`、`sk_xueshantieshan`、`sk_caoyuanjunzhenxinfa` |
| 招式 `mv_` | 28 | 每门 4 个，完整 ID 见 §1–§4 招式表；均以所属 `sk_` 去掉前缀后的 slug 开头 |
| 被动 `ps_` | 21 | 每门 3 个，完整 ID 见 §1–§4 被动表；均以所属武学 slug 开头 |
| 路线 `mfr_` | 28 | 与 28 个 `mv_*` 一一对应，规则为 `mfr_` + 去掉 `mv_` 后的完整招式 ID；步骤唯一见 §0 |
| 调息 `txp_` | 4 | `txp_chiliandugong`、`txp_jueqingbixuejue`、`txp_jinganghufagong`、`txp_caoyuanjunzhenxinfa` |
| 新 Buff / 门派 / 装备 | 0 | 只引用既有 `bf_*`、`sect_*`、`eq_*` |

“赤练支”“霍都支”仅是同门来源分支标签，不是新 `sect_*`；“高档护体”仅为检索标签，不是固定数值或新运行态。

## 数据校验规则与测试用例

| 编号 | 输入／检查 | 期望结果 |
|---|---|---|
| B03-V01 | 全仓扫描本文 `sk_*`、`mv_*`、`ps_*`、`mfr_*`、`txp_*` | 本文定义的 ID 唯一；引用的既有 ID 均可解析 |
| B03-V02 | 按正式卡标题统计 | 恰 7 门，均为 9 地上；内功 4、外功 3 |
| B03-V03 | 逐卡统计绝招 | 每门恰 2 个，解锁层严格为 7／9；共 14 个 |
| B03-V04 | 绝招资源 | 14 招均为 `rageCost:100;mpCost:9%;cd:0;recovery:1200` |
| B03-V05 | 路线引用 | 28 招各有唯一 `mfr_<move-body>`；正文与 §0 镜像一致 |
| B03-V06 | 绝招路线 CT | 每条 `8×90=720`，故 `1200+720=1920≤2000 CT` |
| B03-V07 | 路线差异 | 同门两绝招共享穴位 ≤4/8，且不是轮换／逆序；全库无完全相同路线 |
| B03-V08 | 内功预算 | 四门均为 `34+20+2×14+5×2.5=94.5`，落在地上预算 |
| B03-V09 | 调息档案 | 四个唯一 `txp_*` 均为 `9/10/<nature>/3/1000/0/15000`，满层 `2200/516` |
| B03-V10 | 外放字段 | 28 招均显式 `projection:false` 且无 `projectionSpreadSteps` |
| B03-V11 | 习得途径 | 每门至少一条非首领专用的门派、职级、秘籍或奇遇途径 |
| B03-V12 | 主书界边界 | 不定义全真、桃花岛、铁掌帮新武学；其缺口只登记书界 02 |
| B03-V13 | 首领构建闭合 | 李莫愁、公孙止、霍都、蒙古百户各有 9 品主运，前三者另有 9 品外功；杨过复用 12 品 `sk_jiuyin` |
| B03-V14 | AR-27 门槛与修炼加成 | 七门 `reqs.attrs` 符合 `design/05` §7.3.1；资质为 `5×9−5=40`；`trainingAttrs` 仅 3/6/9 重、逐次合计 ≤4、单门合计 ≤12 |

最小回归命令：`python3 tools/lint/check_skill_catalogs.py --strict`、`python3 tools/agents/check_route_unique_for.py docs/design/catalog/skills-bulu-03-shendiao.md`、`python3 tools/agents/check_undefined_in.py docs/design/chapters/03-shendiao.md docs/design/catalog/skills-bulu-03-shendiao.md`。

## 待决事项 / 依赖

### 替下游给出的建议值

| 编号 | 下游 | 建议值 | 当前默认 |
|---|---|---|---|
| B03-S01 | `design/15` / 内容数据 | 四门内功的 `inner.meridians` 取各卡所列三脉 | 按性质与招式终点配路；下游若调整，只能保持 21 的路线合法性与首领七参不变 |
| B03-S02 | `design/17` / 本书门派表 | 赤练、绝情谷、密宗、蒙古进阶分别在支线／L4／L3／L4 开放 | 已在卡片 `learnSources` 给出可实施默认值，不设首领专用锁 |

### 本文依赖的上游事实

- 品阶、招式与内功预算、装配栏位依赖 `design/05`；Buff 外键与叠加依赖 `design/06`。
- 经脉路线、外放、调息、护体内劲和首领七参依赖 `design/21`；永久开穴仍只归 `design/15`。
- 古墓、绝情谷、吐蕃密宗、蒙古的职级和入门状态依赖 `design/17` 与 `design/chapters/03-shendiao.md`。
- 杨过 `sk_jiuyin` 与蒙古百户 `sk_pojunqiangfa` 分别引用 `skills-wujue`、`skills-general`，本文不复制定义。

### 对基准的修改提案

本任务不提出新的基准修改；七门均在现有 9 品地上、ID、预算与路线规则内闭合。

### 原著考据待办

1. 核对公孙止刀剑形制、倒乱用法与闭穴罩门的准确叙述，不补造原文或回目。
2. 核对霍都折扇、扇骨暗器与师承表现；“雪山铁扇”继续按原创扩展命名处理。
3. 核对李莫愁拂尘、毒术与《五毒秘传》的具体版本措辞；不把“赤练毒功”写成原著名目。

### 开放问题（附默认值）

| 编号 | 开放问题 | 本版默认值 |
|---|---|---|
| B03-O01 | 七门原创扩展名称是否在文本审校后统一润色？ | 先采用本文名称与 ID；仅改显示名时保持 ID 和数值不变 |
| B03-O02 | 霍都支进阶是否只准敌对残谱取得？ | 否；按作者“其他人物也有机会学”的决定，默认另开密宗 L3 辨伪正谱途径 |
| B03-O03 | 赤练支进阶是否并入古墓本脉 L4？ | 否；默认仍须 `q_03_faction_80`，避免绕过李莫愁一系的剧情与毒理门槛 |



