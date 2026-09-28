# 书界补录武学图鉴 · 05《笑傲江湖》

> **归属（基准 §18）**：`design/catalog/skills-*.md` 的按书补录册；本文只定义书界 05 首领画像缺少、且既有 11 册门派图鉴无法复用的武学、招式、路线与调息档案。
> **覆盖声明**：不改写 `skills-wuyue.md`；七门补录分别归入该册既有的华山、嵩山、日月神教与青城体系。主角及其他合格人物可按门派职级、传授、秘籍或奇遇习得；仅个人独门另列条件。
> **上游**：`docs/decisions/author-decisions.md`、`docs/decisions/author-requirements.md` AR-15、`docs/00-canon.md` §3–§5/§9/§12–§13/§16/§18、`docs/decisions/rulings-v1.md`、`docs/decisions/ultimate-counts-tianzhong-dizhong.md`、`design/05`、`design/15`、`design/17`、`design/21`。
> **引用而不重定义**：品阶、招式预算与 `MoveDef` 见 `design/05`；Buff 见 `design/06`；门派边界见 `design/17`；穴位、路线、护体内劲、外放与调息见 `design/15`、`design/21`。
> **标注约定**：**（原创扩展）**为原著没有的武学或机制；**（原创扩展命名）**为原著有人物或动作依据、但名称非原著定名；**（待考）**须按三联 / 广州修订版逐字核对；**【建议值】**为待唯一归属文档确认的数值。
> **版本**：首领所缺武学补录（2026-09-28）。

---

## 0. 阅读指引与逐招路线索引

路线按“动作末端 → 明示内功 → 性质经脉族 → 战术职责”配置。每条路线只在本节定义一次；正文卡只以 `meridianRouteRef` 引用。普通招取 4–6 段，绝招取 8 段；绝招统一满足 `1200 + 8×80/85 ≤ 2000 CT`。所有名称、效果和路线均为游戏化扩展，不宣称现实经络疗效。

### 0.1 绝招显式路线索引（镜像正文卡，非覆写层）

<!-- skill-catalog-audit:start -->
| 品阶 | 武学 | MoveDef（正文卡镜像） | 路线 ID | steps（acupointRef/segmentCt/riskBp） |
|---|---|---|---|---|
| 8 地中 | `sk_qingchengyunqi` | `mv_qingchengyunqi_cuixin` `MoveDef{unlock:7;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;meridianRouteRef:mfr_qingchengyunqi_cuixin;projection:false}` | `mfr_qingchengyunqi_cuixin` | `MeridianRouteDef{moveRef:mv_qingchengyunqi_cuixin;ultimate:true;purpose:defense}`；`ap_renmai_qihai/85/100→ap_yinwei_daheng/85/120→ap_zujueyin_taichong/85/140→ap_zushaoyin_taixi/85/160→ap_shoujueyin_neiguan/85/180→ap_renmai_danzhong/85/200→ap_dumai_baihui/85/220→ap_renmai_guanyuan/85/240` |
| 8 地中 | `sk_songshanzhenqi` | `mv_songshanzhenqi_songyue` `MoveDef{unlock:7;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;meridianRouteRef:mfr_songshanzhenqi_songyue;projection:false}` | `mfr_songshanzhenqi_songyue` | `MeridianRouteDef{moveRef:mv_songshanzhenqi_songyue;ultimate:true;purpose:defense}`；`ap_dumai_mingmen/85/100→ap_dumai_zhiyang/85/120→ap_yangwei_fengfu/85/140→ap_yangwei_jianjing/85/160→ap_zuyangming_zusanli/85/180→ap_shouyangming_quchi/85/200→ap_dumai_shenzhu/85/220→ap_renmai_qihai/85/240` |
| 8 地中 | `sk_jianzongxingqi` | `mv_jianzongxingqi_yujian` `MoveDef{unlock:7;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;meridianRouteRef:mfr_jianzongxingqi_yujian;projection:false}` | `mfr_jianzongxingqi_yujian` | `MeridianRouteDef{moveRef:mv_jianzongxingqi_yujian;ultimate:true;purpose:attack}`；`ap_chongmai_qichong/85/100→ap_daimai_wushu/85/120→ap_dumai_shenzhu/85/140→ap_yangqiao_jianyu/85/160→ap_zushaoyang_fengshi/85/180→ap_shoushaoyang_waiguan/85/200→ap_shoutaiyang_wangu/85/220→ap_shouyangming_hegu/85/240` |
| 8 地中 | `sk_heimuxuangong` | `mv_heimuxuangong_shouya` `MoveDef{unlock:7;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;meridianRouteRef:mfr_heimuxuangong_shouya;projection:false}` | `mfr_heimuxuangong_shouya` | `MeridianRouteDef{moveRef:mv_heimuxuangong_shouya;ultimate:true;purpose:defense}`；`ap_chongmai_huangshu/85/100→ap_daimai_daimai/85/120→ap_yinwei_qimen/85/140→ap_zujueyin_ququan/85/160→ap_zutaiyin_xuehai/85/180→ap_renmai_zhongwan/85/200→ap_renmai_danzhong/85/220→ap_renmai_guanyuan/85/240` |
| 8 地中 | `sk_songshankaihezhang` | `mv_songshankaihezhang_yazhen` `MoveDef{unlock:7;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;meridianRouteRef:mfr_songshankaihezhang_yazhen;projection:false}` | `mfr_songshankaihezhang_yazhen` | `MeridianRouteDef{moveRef:mv_songshankaihezhang_yazhen;ultimate:true;purpose:attack}`；`ap_dumai_mingmen/85/100→ap_yangwei_benshen/85/120→ap_zushaoyang_yanglingquan/85/140→ap_zuyangming_fenglong/85/160→ap_shouyangming_quchi/85/180→ap_shouyangming_shousanli/85/200→ap_shoujueyin_neiguan/85/220→ap_shoujueyin_laogong/85/240` |
| 9 地上 | `sk_renwoxingzhang` | `mv_renwoxingzhang_zhenbi` `MoveDef{unlock:7;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;meridianRouteRef:mfr_renwoxingzhang_zhenbi;projection:false}` | `mfr_renwoxingzhang_zhenbi` | `MeridianRouteDef{moveRef:mv_renwoxingzhang_zhenbi;ultimate:true;purpose:attack}`；`ap_zujueyin_taichong/80/100→ap_zushaoyin_taixi/80/120→ap_renmai_danzhong/80/140→ap_dumai_zhiyang/80/160→ap_shoushaoyin_shaohai/80/180→ap_shoutaiyin_chize/80/200→ap_shoujueyin_neiguan/80/220→ap_shoujueyin_laogong/80/240` |
| 9 地上 | `sk_renwoxingzhang` | `mv_renwoxingzhang_tunajin` `MoveDef{unlock:9;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;meridianRouteRef:mfr_renwoxingzhang_tunajin;projection:false}` | `mfr_renwoxingzhang_tunajin` | `MeridianRouteDef{moveRef:mv_renwoxingzhang_tunajin;ultimate:true;purpose:attack}`；`ap_chongmai_qichong/80/110→ap_daimai_wushu/80/130→ap_renmai_zhongwan/80/150→ap_yinwei_zhubin/80/170→ap_shoushaoyin_shenmen/80/190→ap_shoutaiyin_taiyuan/80/210→ap_shoujueyin_neiguan/80/230→ap_shoujueyin_laogong/80/250` |
| 9 地上 | `sk_kuihuafeizhen` | `mv_kuihuafeizhen_duoming` `MoveDef{unlock:7;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;meridianRouteRef:mfr_kuihuafeizhen_duoming;projection:false}` | `mfr_kuihuafeizhen_duoming` | `MeridianRouteDef{moveRef:mv_kuihuafeizhen_duoming;ultimate:true;purpose:attack}`；`ap_renmai_qihai/80/100→ap_yinwei_qimen/80/120→ap_zujueyin_ququan/80/140→ap_shoujueyin_neiguan/80/160→ap_shoujueyin_daling/80/180→ap_shoushaoyin_shenmen/80/200→ap_shoushaoyang_yangchi/80/220→ap_shoujueyin_zhongchong/80/240` |
| 9 地上 | `sk_kuihuafeizhen` | `mv_kuihuafeizhen_wuying` `MoveDef{unlock:9;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;meridianRouteRef:mfr_kuihuafeizhen_wuying;projection:false}` | `mfr_kuihuafeizhen_wuying` | `MeridianRouteDef{moveRef:mv_kuihuafeizhen_wuying;ultimate:true;purpose:attack}`；`ap_zushaoyin_yongquan/80/110→ap_yinqiao_zhaohai/80/130→ap_yangqiao_jianyu/80/150→ap_dumai_baihui/80/170→ap_shoutaiyin_kongzui/80/190→ap_shoushaoyang_waiguan/80/210→ap_shoutaiyang_wangu/80/230→ap_shoushaoyang_guanchong/80/250` |
<!-- skill-catalog-audit:end -->

同一武学的两条地上绝招路线仅共享掌法的 `内关→劳宫` 两穴，或针法 0 穴；均为 `2/8=25%`、`0/8=0%`，不超过 50%。同门不同武学只保留必要的任督 / 门派核心段，动作末端分别落到掌心、持械腕穴或指端；完整有序序列均不得与全仓既有路线相同。

### 0.2 非绝招逐招显式路线索引

下表的 `false` 是路线事实；正文的普通 `MoveDef` 仍是招式真值。`projection:false` 时按 `design/05` V34 省略 `projectionSpreadSteps`。

| 武学 | MoveDef | 路线 ID | 路线用途与 steps（acupointRef/segmentCt/riskBp） |
|---|---|---|---|
| `sk_qingchengyunqi` | `mv_qingchengyunqi_yunxi` | `mfr_qingchengyunqi_yunxi` | `MeridianRouteDef{moveRef:mv_qingchengyunqi_yunxi;ultimate:false;purpose:defense}`；`ap_zushaoyin_taixi/90/80→ap_yinwei_zhubin/90/100→ap_renmai_qihai/90/120→ap_renmai_guanyuan/90/140` |
| 〃 | `mv_qingchengyunqi_cangjin` | `mfr_qingchengyunqi_cangjin` | `MeridianRouteDef{moveRef:mv_qingchengyunqi_cangjin;ultimate:false;purpose:defense}`；`ap_zujueyin_zhongdu/90/100→ap_yinwei_qimen/90/120→ap_renmai_danzhong/90/140→ap_shoujueyin_neiguan/90/160` |
| 〃 | `mv_qingchengyunqi_huqi` | `mfr_qingchengyunqi_huqi` | `MeridianRouteDef{moveRef:mv_qingchengyunqi_huqi;ultimate:false;purpose:defense}`；`ap_zutaiyin_xuehai/90/100→ap_yinwei_daheng/90/120→ap_renmai_zhongwan/90/140→ap_dumai_shenzhu/90/180` |
| 〃 | `mv_qingchengyunqi_zhangzhu` | `mfr_qingchengyunqi_zhangzhu` | `MeridianRouteDef{moveRef:mv_qingchengyunqi_zhangzhu;ultimate:false;purpose:defense}`；`ap_renmai_qihai/90/100→ap_zujueyin_ququan/90/120→ap_shoujueyin_neiguan/90/140→ap_shoujueyin_laogong/90/180` |
| `sk_songshanzhenqi` | `mv_songshanzhenqi_yunqi` | `mfr_songshanzhenqi_yunqi` | `MeridianRouteDef{moveRef:mv_songshanzhenqi_yunqi;ultimate:false;purpose:defense}`；`ap_dumai_mingmen/90/80→ap_dumai_zhiyang/90/100→ap_dumai_shenzhu/90/120→ap_renmai_qihai/90/160` |
| 〃 | `mv_songshanzhenqi_liyue` | `mfr_songshanzhenqi_liyue` | `MeridianRouteDef{moveRef:mv_songshanzhenqi_liyue;ultimate:false;purpose:defense}`；`ap_zuyangming_zusanli/90/100→ap_yangwei_jianjing/90/120→ap_dumai_baihui/90/140→ap_renmai_guanyuan/90/180` |
| 〃 | `mv_songshanzhenqi_huyue` | `mfr_songshanzhenqi_huyue` | `MeridianRouteDef{moveRef:mv_songshanzhenqi_huyue;ultimate:false;purpose:defense}`；`ap_yangqiao_jianyu/90/100→ap_shouyangming_quchi/90/120→ap_dumai_shenzhu/90/140→ap_renmai_danzhong/90/180` |
| 〃 | `mv_songshanzhenqi_jiehan` | `mfr_songshanzhenqi_jiehan` | `MeridianRouteDef{moveRef:mv_songshanzhenqi_jiehan;ultimate:false;purpose:defense}`；`ap_zushaoyang_yanglingquan/90/100→ap_yangwei_fengfu/90/120→ap_dumai_zhiyang/90/140→ap_renmai_zhongwan/90/180` |
| `sk_jianzongxingqi` | `mv_jianzongxingqi_tiqi` | `mfr_jianzongxingqi_tiqi` | `MeridianRouteDef{moveRef:mv_jianzongxingqi_tiqi;ultimate:false;purpose:defense}`；`ap_chongmai_qichong/90/80→ap_daimai_daimai/90/100→ap_dumai_shenzhu/90/120→ap_renmai_qihai/90/160` |
| 〃 | `mv_jianzongxingqi_suijian` | `mfr_jianzongxingqi_suijian` | `MeridianRouteDef{moveRef:mv_jianzongxingqi_suijian;ultimate:false;purpose:attack}`；`ap_daimai_wushu/90/100→ap_yangqiao_jianyu/90/120→ap_shoushaoyang_waiguan/90/140→ap_shoutaiyang_wangu/90/180` |
| 〃 | `mv_jianzongxingqi_cuifeng` | `mfr_jianzongxingqi_cuifeng` | `MeridianRouteDef{moveRef:mv_jianzongxingqi_cuifeng;ultimate:false;purpose:attack}`；`ap_dumai_mingmen/90/100→ap_zushaoyang_fengshi/90/120→ap_shoushaoyang_yangchi/90/140→ap_shouyangming_hegu/90/180` |
| 〃 | `mv_jianzongxingqi_huanqi` | `mfr_jianzongxingqi_huanqi` | `MeridianRouteDef{moveRef:mv_jianzongxingqi_huanqi;ultimate:false;purpose:defense}`；`ap_chongmai_huangshu/90/100→ap_daimai_daimai/90/120→ap_renmai_zhongwan/90/140→ap_dumai_baihui/90/180` |
| `sk_heimuxuangong` | `mv_heimuxuangong_xuanxi` | `mfr_heimuxuangong_xuanxi` | `MeridianRouteDef{moveRef:mv_heimuxuangong_xuanxi;ultimate:false;purpose:defense}`；`ap_zushaoyin_yongquan/90/80→ap_chongmai_qichong/90/100→ap_chongmai_huangshu/90/120→ap_renmai_qihai/90/160` |
| 〃 | `mv_heimuxuangong_zhentan` | `mfr_heimuxuangong_zhentan` | `MeridianRouteDef{moveRef:mv_heimuxuangong_zhentan;ultimate:false;purpose:defense}`；`ap_daimai_daimai/90/100→ap_yinwei_qimen/90/120→ap_renmai_danzhong/90/140→ap_dumai_shenzhu/90/180` |
| 〃 | `mv_heimuxuangong_hushen` | `mfr_heimuxuangong_hushen` | `MeridianRouteDef{moveRef:mv_heimuxuangong_hushen;ultimate:false;purpose:defense}`；`ap_zujueyin_ququan/90/100→ap_zutaiyin_xuehai/90/120→ap_renmai_zhongwan/90/140→ap_renmai_guanyuan/90/180` |
| 〃 | `mv_heimuxuangong_dingxin` | `mfr_heimuxuangong_dingxin` | `MeridianRouteDef{moveRef:mv_heimuxuangong_dingxin;ultimate:false;purpose:defense}`；`ap_yinwei_zhubin/90/100→ap_shoushaoyin_shenmen/90/120→ap_shoujueyin_neiguan/90/140→ap_renmai_danzhong/90/180` |
| `sk_songshankaihezhang` | `mv_songshankaihezhang_kaimen` | `mfr_songshankaihezhang_kaimen` | `MeridianRouteDef{moveRef:mv_songshankaihezhang_kaimen;ultimate:false;purpose:attack}`；`ap_dumai_mingmen/90/100→ap_shouyangming_quchi/90/120→ap_shouyangming_shousanli/90/140→ap_shoujueyin_laogong/90/180` |
| 〃 | `mv_songshankaihezhang_heyue` | `mfr_songshankaihezhang_heyue` | `MeridianRouteDef{moveRef:mv_songshankaihezhang_heyue;ultimate:false;purpose:attack}`；`ap_yangwei_jianjing/90/100→ap_zuyangming_fenglong/90/120→ap_shoujueyin_neiguan/90/140→ap_shoujueyin_laogong/90/180` |
| 〃 | `mv_songshankaihezhang_tuizhen` | `mfr_songshankaihezhang_tuizhen` | `MeridianRouteDef{moveRef:mv_songshankaihezhang_tuizhen;ultimate:false;purpose:attack}`；`ap_zushaoyang_yanglingquan/90/100→ap_yangqiao_jianyu/90/120→ap_shouyangming_shousanli/90/140→ap_shoujueyin_laogong/90/180` |
| 〃 | `mv_songshankaihezhang_shouyue` | `mfr_songshankaihezhang_shouyue` | `MeridianRouteDef{moveRef:mv_songshankaihezhang_shouyue;ultimate:false;purpose:defense}`；`ap_dumai_zhiyang/90/100→ap_shoushaoyin_shaohai/90/120→ap_shoujueyin_neiguan/90/140→ap_shoujueyin_laogong/90/180` |
| `sk_renwoxingzhang` | `mv_renwoxingzhang_zhiqu` | `mfr_renwoxingzhang_zhiqu` | `MeridianRouteDef{moveRef:mv_renwoxingzhang_zhiqu;ultimate:false;purpose:attack}`；`ap_zujueyin_taichong/90/100→ap_shoutaiyin_chize/90/120→ap_shoujueyin_neiguan/90/140→ap_shoujueyin_laogong/90/180` |
| 〃 | `mv_renwoxingzhang_huizhen` | `mfr_renwoxingzhang_huizhen` | `MeridianRouteDef{moveRef:mv_renwoxingzhang_huizhen;ultimate:false;purpose:attack}`；`ap_dumai_zhiyang/90/100→ap_shoushaoyin_shaohai/90/120→ap_shoujueyin_neiguan/90/140→ap_shoujueyin_laogong/90/180` |
| 〃 | `mv_renwoxingzhang_pozhen` | `mfr_renwoxingzhang_pozhen` | `MeridianRouteDef{moveRef:mv_renwoxingzhang_pozhen;ultimate:false;purpose:attack}`；`ap_chongmai_huangshu/90/100→ap_shouyangming_quchi/90/120→ap_shouyangming_shousanli/90/140→ap_shoujueyin_laogong/90/180` |
| 〃 | `mv_renwoxingzhang_shouna` | `mfr_renwoxingzhang_shouna` | `MeridianRouteDef{moveRef:mv_renwoxingzhang_shouna;ultimate:false;purpose:defense}`；`ap_yinwei_qimen/90/100→ap_shoushaoyin_shenmen/90/120→ap_shoujueyin_neiguan/90/140→ap_shoujueyin_laogong/90/180` |
| `sk_kuihuafeizhen` | `mv_kuihuafeizhen_zhuying` | `mfr_kuihuafeizhen_zhuying` | `MeridianRouteDef{moveRef:mv_kuihuafeizhen_zhuying;ultimate:false;purpose:attack}`；`ap_yinwei_qimen/90/100→ap_shoujueyin_neiguan/90/120→ap_shoushaoyang_yangchi/90/140→ap_shoujueyin_zhongchong/90/180` |
| 〃 | `mv_kuihuafeizhen_lianzhui` | `mfr_kuihuafeizhen_lianzhui` | `MeridianRouteDef{moveRef:mv_kuihuafeizhen_lianzhui;ultimate:false;purpose:attack}`；`ap_zujueyin_zhongdu/90/100→ap_shoutaiyin_taiyuan/90/120→ap_shoushaoyang_waiguan/90/140→ap_shoushaoyang_guanchong/90/180` |
| 〃 | `mv_kuihuafeizhen_huishen` | `mfr_kuihuafeizhen_huishen` | `MeridianRouteDef{moveRef:mv_kuihuafeizhen_huishen;ultimate:false;purpose:attack}`；`ap_zushaoyin_yongquan/90/100→ap_yangqiao_jianyu/90/120→ap_shoutaiyang_wangu/90/140→ap_shoutaiyang_shaoze/90/180` |
| 〃 | `mv_kuihuafeizhen_suoyin` | `mfr_kuihuafeizhen_suoyin` | `MeridianRouteDef{moveRef:mv_kuihuafeizhen_suoyin;ultimate:false;purpose:attack}`；`ap_renmai_danzhong/90/100→ap_shoujueyin_daling/90/120→ap_shoushaoyin_shenmen/90/140→ap_shoujueyin_zhongchong/90/180` |

### 0.3 绝招正文引用索引

| 武学 | 绝招 | 路线 | 显式终局 |
|---|---|---|---|
| `sk_qingchengyunqi` | `mv_qingchengyunqi_cuixin` | `mfr_qingchengyunqi_cuixin` | 是／见 §0.1；`ultimate:true` |
| `sk_songshanzhenqi` | `mv_songshanzhenqi_songyue` | `mfr_songshanzhenqi_songyue` | 是／见 §0.1；`ultimate:true` |
| `sk_jianzongxingqi` | `mv_jianzongxingqi_yujian` | `mfr_jianzongxingqi_yujian` | 是／见 §0.1；`ultimate:true` |
| `sk_heimuxuangong` | `mv_heimuxuangong_shouya` | `mfr_heimuxuangong_shouya` | 是／见 §0.1；`ultimate:true` |
| `sk_songshankaihezhang` | `mv_songshankaihezhang_yazhen` | `mfr_songshankaihezhang_yazhen` | 是／见 §0.1；`ultimate:true` |
| `sk_renwoxingzhang` | `mv_renwoxingzhang_zhenbi` | `mfr_renwoxingzhang_zhenbi` | 是／见 §0.1；`ultimate:true` |
| 〃 | `mv_renwoxingzhang_tunajin` | `mfr_renwoxingzhang_tunajin` | 是／见 §0.1；`ultimate:true` |
| `sk_kuihuafeizhen` | `mv_kuihuafeizhen_duoming` | `mfr_kuihuafeizhen_duoming` | 是／见 §0.1；`ultimate:true` |
| 〃 | `mv_kuihuafeizhen_wuying` | `mfr_kuihuafeizhen_wuying` | 是／见 §0.1；`ultimate:true` |

## 1. 华山剑宗补录

### 1.1 `sk_jianzongxingqi` 剑宗行气诀（8 地中 · 内功 · 华山剑宗）**（原创扩展）**

| 字段 | 值 |
|---|---|
| 出处 | 据华山剑宗重招式、以气催剑的门派分支需求作系统化补足；原著无此正式武学名，故总名、招名与效果均为**（原创扩展）** |
| origin / sect / branch | `expanded` / `sect_huashan` / `jianzong`；与 `skills-wuyue.md` 华山体系同门 |
| sourceChapters | `[ch05_xiaoao]` |
| nature · wOut/wIn · moveSlots | `harmony` · `0.25/0.75` · 5 |
| meridians / breathProfileRef | `[mer_chongmai,mer_daimai,mer_dumai]` / `txp_jianzongxingqi` |
| reqs | `attrs:{agi:40,wil:35}; aptitude:{apInner:35}; sect:{id:sect_huashan,rank:4}; prereq:[{skill:sk_kuangfengkuaijian,layer:7}]; hard:[sect,prereq]` |
| inner.contribution | `{mpMaxPct:30,hpMaxPct:18,attrs:{agi:5,wil:4,con:3},mpRegen:2.2}`；`IP=30+18+2×(5+4+3)+5×2.2=83` |
| inner.stats / layerStats | `{hit:8,parry:7}`，合计 15 / —（内功不用 `layerStats`） |
| 层数要点 | 1 重提气；3 重随剑；5 重催锋；6 重换气；**7 重绝招行气驭剑**；10 重气剑相承 |
| setTags / conflicts | `[]` / 与偏阴、偏阳主运的冲突只按 `design/05` §5.4 |
| special / observable | `{fusible:true}` / `true` |
| learnSources | 华山剑宗第四职级传授 `maxLayer:10`；剑宗支线武册 `maxLayer:8`；主角与其他满足条件者均可学 |
| description | 以冲、带承接转腰，再由督脉提劲至持剑手腕；是剑宗公传进阶行气法，不专属于某位首领。 |

#### `sk_jianzongxingqi` 剑宗行气诀

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 / 外放 | 架 | 核算与 MoveDef |
|---|---:|---|---:|---|---|---|---|
| 提气 `mv_jianzongxingqi_tiqi` **（原创扩展）** | 1 | 自身·支援 | 0 | 7%/1/900 | 下次剑招命中 +5；`projection:false` | — | 支援招不走伤害预算；`MoveDef{unlock:1;ultimate:false;mpCost:7%;cd:1;recovery:900;meridianRouteRef:mfr_jianzongxingqi_tiqi;projection:false}` |
| 随剑 `mv_jianzongxingqi_suijian` **（原创扩展）** | 3 | 单体·1·近身 | 1.00 | 7%/0/1000 | 须装备剑；`projection:false` | 可 | 标准单体 `1.00`；`MoveDef{unlock:3;ultimate:false;mpCost:7%;cd:0;recovery:1000;meridianRouteRef:mfr_jianzongxingqi_suijian;projection:false}` |
| 催锋 `mv_jianzongxingqi_cuifeng` **（原创扩展）** | 5 | 单体·1·近身 | 1.10 | 7%/1/1000 | 上一式为剑招时命中 +5；`projection:false` | 可 | `1×(1+0.12)=1.12≈1.10`；`MoveDef{unlock:5;ultimate:false;mpCost:7%;cd:1;recovery:1000;meridianRouteRef:mfr_jianzongxingqi_cuifeng;projection:false}` |
| 换气 `mv_jianzongxingqi_huanqi` **（原创扩展）** | 6 | 自身·支援 | 0 | 7%/2/900 | 回复已损内力 5%；`projection:false` | — | 支援招以 cd2 支付；`MoveDef{unlock:6;ultimate:false;mpCost:7%;cd:2;recovery:900;meridianRouteRef:mfr_jianzongxingqi_huanqi;projection:false}` |
| 行气驭剑 `mv_jianzongxingqi_yujian`（绝招，**原创扩展**） | 7 | 单体·1·近身 | 2.90 | 9%/0/1200 | 命中后自身 `bf_ruiyi` 1 层·2；气势 100；`projection:false` | 可 | `3.00−0.10=2.90`；`MoveDef{unlock:7;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;meridianRouteRef:mfr_jianzongxingqi_yujian;projection:false}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 随剑 | `ps_jianzongxingqi_suijian` | 2 | 装备剑时，本武学支援效果命中 +5 |
| 催锋 | `ps_jianzongxingqi_cuifeng` | 5 | 每回合首个华山剑招命中后回复已损内力 2% |
| 气剑相承 | `ps_jianzongxingqi_heyi` | 10 | 行气驭剑所得 `bf_ruiyi` 延长 1 回合，不提高层数上限 |

## 2. 嵩山派补录

### 2.1 `sk_songshanzhenqi` 嵩山真气（8 地中 · 内功 · 嵩山派）**（原创扩展）**

| 字段 | 值 |
|---|---|
| 出处 | 为嵩山门人在嵩阳心法与寒冰真气之间补足的公传高阶主运；原著无此正式武学名，故为**（原创扩展）** |
| origin / sect / lineage | `expanded` / `sect_songshan` / 嵩山公传；与 `skills-wuyue.md` 嵩山体系同门 |
| sourceChapters | `[ch05_xiaoao]` |
| nature · wOut/wIn · moveSlots | `yang` · `0.15/0.85` · 5 |
| meridians / breathProfileRef | `[mer_dumai,mer_yangwei]` / `txp_songshanzhenqi` |
| reqs | `attrs:{con:40,str:35}; aptitude:{apInner:35}; sect:{id:sect_songshan,rank:4}; prereq:[{skill:sk_songyangxinfa,layer:7}]; hard:[sect,prereq]` |
| inner.contribution | `{mpMaxPct:30,hpMaxPct:18,attrs:{con:5,str:4,wil:3},mpRegen:2.2}`；`IP=30+18+2×(5+4+3)+5×2.2=83` |
| inner.stats / layerStats | `{defOut:8,resCold:7}`，合计 15 / —（内功不用 `layerStats`） |
| 层数要点 | 1 重运气；3 重立岳；5 重护岳；6 重解寒；**7 重绝招嵩岳镇气**；10 重真气圆成 |
| setTags / conflicts | `[]` / 阴阳相冲只按 `design/05` §5.4；不等同 `sk_hanbingzhenqi` |
| special / observable | `{fusible:true}` / `true` |
| learnSources | 嵩山第四职级正常传授 `maxLayer:10`；护山武册 `maxLayer:8`；主角与其他门人可学 |
| description | 取嵩山厚重、立岳之势的常规高阶运气法，用于堂主与使者主运，不占左冷禅的寒冰传承。 |

#### `sk_songshanzhenqi` 嵩山真气

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 / 外放 | 架 | 核算与 MoveDef |
|---|---:|---|---:|---|---|---|---|
| 运气 `mv_songshanzhenqi_yunqi` **（原创扩展）** | 1 | 自身·支援 | 0 | 7%/1/900 | 回复已损内力 4%；`projection:false` | — | 支援招不走伤害预算；`MoveDef{unlock:1;ultimate:false;mpCost:7%;cd:1;recovery:900;meridianRouteRef:mfr_songshanzhenqi_yunqi;projection:false}` |
| 立岳 `mv_songshanzhenqi_liyue` **（原创扩展）** | 3 | 自身·支援 | 0 | 7%/2/900 | `bf_wenzhong` 1 层·2；`projection:false` | — | 支援招以 cd2 支付；`MoveDef{unlock:3;ultimate:false;mpCost:7%;cd:2;recovery:900;meridianRouteRef:mfr_songshanzhenqi_liyue;projection:false}` |
| 护岳 `mv_songshanzhenqi_huyue` **（原创扩展）** | 5 | 自身·支援 | 0 | 7%/2/900 | `bf_shoushi` 2；`projection:false` | — | 支援招以降速与 cd2 支付；`MoveDef{unlock:5;ultimate:false;mpCost:7%;cd:2;recovery:900;meridianRouteRef:mfr_songshanzhenqi_huyue;projection:false}` |
| 解寒 `mv_songshanzhenqi_jiehan` **（原创扩展）** | 6 | 自身·支援 | 0 | 7%/3/900 | 降低自身寒气 1 层；`projection:false` | — | 只减 1 层且 cd3；`MoveDef{unlock:6;ultimate:false;mpCost:7%;cd:3;recovery:900;meridianRouteRef:mfr_songshanzhenqi_jiehan;projection:false}` |
| 嵩岳镇气 `mv_songshanzhenqi_songyue`（绝招，**原创扩展**） | 7 | 自身·支援 | 0 | 9%/0/1200 | `bf_wenzhong` 2 层·3；气势 100；`projection:false` | — | 支援绝招以气势与资源支付；`MoveDef{unlock:7;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;meridianRouteRef:mfr_songshanzhenqi_songyue;projection:false}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 立岳 | `ps_songshanzhenqi_liyue` | 2 | 每回合首次受击后获得 `bf_wenzhong` 1 层 |
| 寒脉 | `ps_songshanzhenqi_hanmai` | 5 | 主运时寒气抗性按本武学品阶参与对抗 |
| 真气圆成 | `ps_songshanzhenqi_yuancheng` | 10 | 嵩岳镇气持续期间招架 +8 |

### 2.2 `sk_songshankaihezhang` 嵩山开合掌（8 地中 · 拳脚/掌 · 嵩山派）**（原创扩展）**

| 字段 | 值 |
|---|---|
| 出处 | 依嵩山剑路开阔厚重与门派拳掌链作战斗化补足；原著无此正式掌法名，故为**（原创扩展）** |
| origin / sect / lineage | `expanded` / `sect_songshan` / 嵩山公传；与 `skills-wuyue.md` 嵩山体系同门 |
| sourceChapters | `[ch05_xiaoao]` |
| nature · wOut/wIn · moveSlots | `yang` · `0.70/0.30` · 5 |
| reqs | `attrs:{str:40,con:35}; aptitude:{apFist:35}; sect:{id:sect_songshan,rank:4}; prereq:[{skill:sk_dayinyangshou,layer:6}]; hard:[sect,prereq]` |
| layerStats | `{hit:[3,8],pierce:[2,7]}`，合计 15 |
| 层数要点 | 1 重开门；3 重合岳；5 重推阵；6 重守岳；**7 重绝招压阵**；10 重开合圆成 |
| setTags / conflicts | `[]` / 无 |
| special / observable | `{fusible:true}` / `true` |
| learnSources | 嵩山第四职级正常传授 `maxLayer:10`；并派大会护场武册 `maxLayer:8` **（原创扩展）**；不限定左冷禅 |
| description | 以掌心大开大合压缩敌方阵位的嵩山高阶掌路，用于补齐掌门与使者可共享的外功。 |

#### `sk_songshankaihezhang` 嵩山开合掌

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 / 外放 | 架 | 核算与 MoveDef |
|---|---:|---|---:|---|---|---|---|
| 开门 `mv_songshankaihezhang_kaimen` **（原创扩展）** | 1 | 单体·1·近身 | 1.00 | 7%/0/1000 | `projection:false` | 可 | 标准单体 `1.00`；`MoveDef{unlock:1;ultimate:false;mpCost:7%;cd:0;recovery:1000;meridianRouteRef:mfr_songshankaihezhang_kaimen;projection:false}` |
| 合岳 `mv_songshankaihezhang_heyue` **（原创扩展）** | 3 | 单体·1·近身 | 1.10 | 7%/1/1000 | `projection:false` | 可 | `1×(1+0.12)=1.12≈1.10`；`MoveDef{unlock:3;ultimate:false;mpCost:7%;cd:1;recovery:1000;meridianRouteRef:mfr_songshankaihezhang_heyue;projection:false}` |
| 推阵 `mv_songshankaihezhang_tuizhen` **（原创扩展）** | 5 | `aoe_knock n1`·1·近身 | 1.20 | 8%/2/1100 | 击退 1；`projection:false` | 可 | `0.95×(1+0.24+0.05+0.07)−0.05=1.24≈1.20`；`MoveDef{unlock:5;ultimate:false;mpCost:8%;cd:2;recovery:1100;meridianRouteRef:mfr_songshankaihezhang_tuizhen;projection:false}` |
| 守岳 `mv_songshankaihezhang_shouyue` **（原创扩展）** | 6 | 单体·1·近身 | 1.20 | 8%/2/1000 | 命中后自身 `bf_shoushi` 1；`projection:false` | 可 | `1×(1+0.24+0.05)−0.10=1.19≈1.20`；`MoveDef{unlock:6;ultimate:false;mpCost:8%;cd:2;recovery:1000;meridianRouteRef:mfr_songshankaihezhang_shouyue;projection:false}` |
| 压阵 `mv_songshankaihezhang_yazhen`（绝招，**原创扩展**） | 7 | `aoe_cone {angle:120,r:2,dirCount:6}`·近身 | 2.35 | 9%/0/1200 | 击退 1；气势 100；`projection:false` | 可 | N=4、AF=0.80；`3×0.80−0.05=2.35`；`MoveDef{unlock:7;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;meridianRouteRef:mfr_songshankaihezhang_yazhen;projection:false}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 开门 | `ps_songshankaihezhang_kaimen` | 2 | 每回合首掌命中 +5 |
| 合劲 | `ps_songshankaihezhang_hejin` | 5 | 本武学击退目标后获得 `bf_wenzhong` 1 层 |
| 压阵 | `ps_songshankaihezhang_yazhen` | 10 | 压阵命中后获得 `bf_shoushi` 1 回合 |

## 3. 青城派补录

### 3.1 `sk_qingchengyunqi` 青城运气诀（8 地中 · 内功 · 青城派）**（原创扩展）**

| 字段 | 值 |
|---|---|
| 出处 | 为青城掌剑链补足可公传的高阶运劲法；原著无此正式武学名，故为**（原创扩展）** |
| origin / sect / lineage | `expanded` / `sect_qingcheng` / 青城公传；与 `skills-wuyue.md` 青城体系同门 |
| sourceChapters | `[ch05_xiaoao]` |
| nature · wOut/wIn · moveSlots | `yin` · `0.15/0.85` · 5 |
| meridians / breathProfileRef | `[mer_renmai,mer_yinwei,mer_zujueyin]` / `txp_qingchengyunqi` |
| reqs | `attrs:{con:40,agi:35}; aptitude:{apInner:35}; sect:{id:sect_qingcheng,rank:4}; prereq:[{skill:sk_qingchengxinfa,layer:7}]; hard:[sect,prereq]` |
| inner.contribution | `{mpMaxPct:30,hpMaxPct:18,attrs:{con:5,agi:4,wil:3},mpRegen:2.2}`；`IP=30+18+2×(5+4+3)+5×2.2=83` |
| inner.stats / layerStats | `{eva:8,effRes:7}`，合计 15 / —（内功不用 `layerStats`） |
| 层数要点 | 1 重运息；3 重藏劲；5 重护气；6 重掌助；**7 重绝招摧心运气**；10 重青城圆成 |
| setTags / conflicts | `[]` / 无；不把阴性写成毒功 |
| special / observable | `{fusible:true}` / `true` |
| learnSources | 青城第四职级正常传授 `maxLayer:10`；门派赎罪线秘籍 `maxLayer:8` **（原创扩展）**；主角与其他门人可学 |
| description | 由任脉蓄气、阴维藏劲，再接掌心发力；服务青城掌剑高阶循环而不限定余沧海本人。 |

#### `sk_qingchengyunqi` 青城运气诀

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 / 外放 | 架 | 核算与 MoveDef |
|---|---:|---|---:|---|---|---|---|
| 运息 `mv_qingchengyunqi_yunxi` **（原创扩展）** | 1 | 自身·支援 | 0 | 7%/1/900 | 回复已损内力 4%；`projection:false` | — | 支援招不走伤害预算；`MoveDef{unlock:1;ultimate:false;mpCost:7%;cd:1;recovery:900;meridianRouteRef:mfr_qingchengyunqi_yunxi;projection:false}` |
| 藏劲 `mv_qingchengyunqi_cangjin` **（原创扩展）** | 3 | 自身·支援 | 0 | 7%/2/900 | 下次青城掌法效果命中 +8；`projection:false` | — | 支援招以 cd2 支付；`MoveDef{unlock:3;ultimate:false;mpCost:7%;cd:2;recovery:900;meridianRouteRef:mfr_qingchengyunqi_cangjin;projection:false}` |
| 护气 `mv_qingchengyunqi_huqi` **（原创扩展）** | 5 | 自身·支援 | 0 | 7%/2/900 | `bf_shoushi` 1；`projection:false` | — | 支援招以降速与 cd2 支付；`MoveDef{unlock:5;ultimate:false;mpCost:7%;cd:2;recovery:900;meridianRouteRef:mfr_qingchengyunqi_huqi;projection:false}` |
| 掌助 `mv_qingchengyunqi_zhangzhu` **（原创扩展）** | 6 | 自身·支援 | 0 | 7%/2/900 | 下次青城掌法 Z3 +5%；`projection:false` | — | 一次性小幅增伤以 cd2 支付；`MoveDef{unlock:6;ultimate:false;mpCost:7%;cd:2;recovery:900;meridianRouteRef:mfr_qingchengyunqi_zhangzhu;projection:false}` |
| 摧心运气 `mv_qingchengyunqi_cuixin`（绝招，**原创扩展**） | 7 | 自身·支援 | 0 | 9%/0/1200 | 下次青城掌法效果命中 +15；气势 100；`projection:false` | — | 支援绝招以气势与资源支付；`MoveDef{unlock:7;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;meridianRouteRef:mfr_qingchengyunqi_cuixin;projection:false}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 运息 | `ps_qingchengyunqi_yunxi` | 2 | 每回合末回复已损内力 2% |
| 藏劲 | `ps_qingchengyunqi_cangjin` | 5 | 从目标背后使用青城掌法时效果命中 +5 |
| 摧心 | `ps_qingchengyunqi_cuixin` | 10 | `sk_qingchengcuixinzhang` 封脉失败时改施加 `bf_xuruo` 1 层，每目标每战 1 次 |

## 4. 日月神教补录

### 4.1 `sk_heimuxuangong` 黑木玄功（8 地中 · 内功 · 日月神教）**（原创扩展）**

| 字段 | 值 |
|---|---|
| 出处 | 为日月神教护法、堂主补足不占教主秘典的常规高阶内功；原著无此正式武学名，故为**（原创扩展）** |
| origin / sect / lineage | `expanded` / `sect_riyue` / 黑木崖公传；与 `skills-wuyue.md` 日月神教体系同门 |
| sourceChapters | `[ch05_xiaoao]` |
| nature · wOut/wIn · moveSlots | `yin` · `0.15/0.85` · 5 |
| meridians / breathProfileRef | `[mer_chongmai,mer_daimai,mer_yinwei]` / `txp_heimuxuangong` |
| reqs | `attrs:{con:40,wil:35}; aptitude:{apInner:35}; sect:{id:sect_riyue,rank:4}; prereq:[{skill:sk_riyuexinfa,layer:7}]; hard:[sect,prereq]` |
| inner.contribution | `{mpMaxPct:30,hpMaxPct:18,attrs:{con:5,wil:4,wis:3},mpRegen:2.2}`；`IP=30+18+2×(5+4+3)+5×2.2=83` |
| inner.stats / layerStats | `{effRes:8,resMind:7}`，合计 15 / —（内功不用 `layerStats`） |
| 层数要点 | 1 重玄息；3 重镇坛；5 重护身；6 重定心；**7 重绝招守崖玄气**；10 重黑木圆成 |
| setTags / conflicts | `[]` / 不替代、不稀释 `sk_xixing`、`sk_kuihua` |
| special / observable | `{fusible:true}` / `true` |
| learnSources | 日月神教第四职级常规传授 `maxLayer:10`；黑木崖教务武册 `maxLayer:8` **（原创扩展）**；不要求教主身份 |
| description | 以冲、带转气并由阴维守心的堂主级内功；其定位是常规组织传承，不把所有高阶教众都写成吸星或葵花传人。 |

#### `sk_heimuxuangong` 黑木玄功

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 / 外放 | 架 | 核算与 MoveDef |
|---|---:|---|---:|---|---|---|---|
| 玄息 `mv_heimuxuangong_xuanxi` **（原创扩展）** | 1 | 自身·支援 | 0 | 7%/1/900 | 回复已损内力 4%；`projection:false` | — | 支援招不走伤害预算；`MoveDef{unlock:1;ultimate:false;mpCost:7%;cd:1;recovery:900;meridianRouteRef:mfr_heimuxuangong_xuanxi;projection:false}` |
| 镇坛 `mv_heimuxuangong_zhentan` **（原创扩展）** | 3 | 自身·支援 | 0 | 7%/2/900 | 效果抵抗 +8·2 回合；`projection:false` | — | 支援招以 cd2 支付；`MoveDef{unlock:3;ultimate:false;mpCost:7%;cd:2;recovery:900;meridianRouteRef:mfr_heimuxuangong_zhentan;projection:false}` |
| 护身 `mv_heimuxuangong_hushen` **（原创扩展）** | 5 | 自身·支援 | 0 | 7%/2/900 | `bf_shoushi` 1；`projection:false` | — | 支援招以降速与 cd2 支付；`MoveDef{unlock:5;ultimate:false;mpCost:7%;cd:2;recovery:900;meridianRouteRef:mfr_heimuxuangong_hushen;projection:false}` |
| 定心 `mv_heimuxuangong_dingxin` **（原创扩展）** | 6 | 自身·支援 | 0 | 7%/3/900 | 清除 1 层可驱散心神减益；`projection:false` | — | 单层且 cd3；`MoveDef{unlock:6;ultimate:false;mpCost:7%;cd:3;recovery:900;meridianRouteRef:mfr_heimuxuangong_dingxin;projection:false}` |
| 守崖玄气 `mv_heimuxuangong_shouya`（绝招，**原创扩展**） | 7 | 自身·支援 | 0 | 9%/0/1200 | `bf_shoushi` 3；气势 100；`projection:false` | — | 支援绝招以气势与资源支付；`MoveDef{unlock:7;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;meridianRouteRef:mfr_heimuxuangong_shouya;projection:false}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 玄息 | `ps_heimuxuangong_xuanxi` | 2 | 每回合末回复已损内力 2% |
| 守崖 | `ps_heimuxuangong_shouya` | 5 | 每回合首次受控后效果抵抗 +8，持续至本回合末 |
| 黑木圆成 | `ps_heimuxuangong_yuancheng` | 10 | 守崖玄气期间心神抗性 +10 |

### 4.2 `sk_renwoxingzhang` 任我行掌法（9 地上 · 拳脚/掌 · 任我行个人传承）**（原创扩展命名）**

| 字段 | 值 |
|---|---|
| 出处 | 依任我行的掌力与运劲特征形成个人传承；原著是否给相关掌招正式名称**（待考）**，本卡总名与全部招名均为**（原创扩展命名）** |
| origin / sect / lineage | `expanded` / `sect_riyue` / 任我行个人传承；与 `skills-wuyue.md` 日月神教体系同源，但不是门派公传 |
| sourceChapters | `[ch05_xiaoao]` |
| nature · wOut/wIn · moveSlots | `yin` · `0.45/0.55` · 6 |
| reqs | `attrs:{str:45,wil:45}; aptitude:{apFist:40}; prereq:[{skill:sk_xixing,layer:7}]; hard:[prereq]` |
| layerStats | `{hit:[3,8],pierce:[2,7]}`，合计 15 |
| 层数要点 | 1 重直取；3 重回震；5 重破阵；6 重收纳；**7 重绝招震壁雄掌**；**9 重绝招吞纳回劲**；10 重雄掌大成 |
| setTags / conflicts | `[]` / 吸内仍受 `sk_xixing` 的异种真气规则，不另开第二套吸星状态 |
| special / observable | `{fusible:false}` / `false` |
| learnSources | 任我行合法指点 `maxLayer:10`；梅庄脱困后手录奇遇 `maxLayer:8` **（原创扩展、需作者确认）**；非敌人专用 |
| description | 以刚猛掌击承载任我行的个人运劲习惯；只有获得本人指点或遗谱者可学，不把个人独门下放为日月常规职级奖励。 |

#### `sk_renwoxingzhang` 任我行掌法

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 / 外放 | 架 | 核算与 MoveDef |
|---|---:|---|---:|---|---|---|---|
| 直取 `mv_renwoxingzhang_zhiqu` **（原创扩展命名）** | 1 | 单体·1·近身 | 1.00 | 7%/0/1000 | `projection:false` | 可 | 标准单体 `1.00`；`MoveDef{unlock:1;ultimate:false;mpCost:7%;cd:0;recovery:1000;meridianRouteRef:mfr_renwoxingzhang_zhiqu;projection:false}` |
| 回震 `mv_renwoxingzhang_huizhen` **（原创扩展命名）** | 3 | 单体·1·近身 | 1.00 | 7%/1/1000 | 命中后自身 `bf_shoushi` 1；`projection:false` | 可 | `1×(1+0.12)−0.10=1.02≈1.00`；`MoveDef{unlock:3;ultimate:false;mpCost:7%;cd:1;recovery:1000;meridianRouteRef:mfr_renwoxingzhang_huizhen;projection:false}` |
| 破阵 `mv_renwoxingzhang_pozhen` **（原创扩展命名）** | 5 | `aoe_line n2`·近身 | 1.20 | 8%/2/1100 | `bf_shiheng` 40%·1；`projection:false` | 可 | N=2、AF=.90；`.90×(1+.24+.05+.07)−.10×.40=1.184≈1.20`；`MoveDef{unlock:5;ultimate:false;mpCost:8%;cd:2;recovery:1100;meridianRouteRef:mfr_renwoxingzhang_pozhen;projection:false}` |
| 收纳 `mv_renwoxingzhang_shouna` **（原创扩展命名）** | 6 | 单体·1·近身 | 1.20 | 8%/2/1000 | 命中回复本招实扣内力 10%；`projection:false` | 可 | `1×(1+.24+.05)−.10=1.19≈1.20`；`MoveDef{unlock:6;ultimate:false;mpCost:8%;cd:2;recovery:1000;meridianRouteRef:mfr_renwoxingzhang_shouna;projection:false}` |
| 震壁雄掌 `mv_renwoxingzhang_zhenbi`（绝招，**原创扩展命名**） | 7 | 单体·1·近身 | 2.90 | 9%/0/1200 | 命中后自身 `bf_shoushi` 1；气势 100；`projection:false` | 可 | `3.00−0.10=2.90`；`MoveDef{unlock:7;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;meridianRouteRef:mfr_renwoxingzhang_zhenbi;projection:false}` |
| 吞纳回劲 `mv_renwoxingzhang_tunajin`（绝招，**原创扩展命名**） | 9 | 单体·1·近身 | 2.75 | 9%/0/1200 | 吸取本招伤害等价 5% 内力，上限为目标当前内力 10%；气势 100；`projection:false` | 可 | `3.00−0.25=2.75`；`MoveDef{unlock:9;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;meridianRouteRef:mfr_renwoxingzhang_tunajin;projection:false}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 雄劲 | `ps_renwoxingzhang_xiongjin` | 2 | 每回合首掌命中 +5 |
| 回震 | `ps_renwoxingzhang_huizhen` | 5 | 招架后下一掌 Z3 +5%，每回合 1 次 |
| 吞纳 | `ps_renwoxingzhang_tunna` | 10 | 每战首次吸内成功返还自身已损内力 2%；不清除异种真气 |

### 4.3 `sk_kuihuafeizhen` 葵花飞针（9 地上 · 暗器/针 · 葵花传承）**（原创扩展命名）**

| 字段 | 值 |
|---|---|
| 出处 | 《笑傲江湖》中东方不败以绣花针交战；具体动作细节**（待考）**。“葵花飞针”总名与全部招名均为**（原创扩展命名）** |
| origin / sect / lineage | `canonExpanded` / `sect_riyue` / 葵花传承针术；与 `skills-wuyue.md` 日月神教、`sk_kuihua` 同源 |
| sourceChapters | `[ch05_xiaoao]` |
| nature · wOut/wIn · moveSlots | `yin` · `0.65/0.35` · 6 |
| reqs | `attrs:{agi:50,wil:45}; aptitude:{apHidden:45}; prereq:[{skill:sk_kuihua,layer:7}]; hard:[prereq]`；装备针类暗器 |
| layerStats | `{hit:[3,8],pierce:[2,7]}`，合计 15 |
| 层数要点 | 1 重逐影；3 重连缀；5 重回身；6 重索隙；**7 重绝招夺命绣针**；**9 重绝招无影针雨**；10 重针意通神 |
| setTags / conflicts | `[]` / 不与 `sk_kuihua` 的“以针代剑”重复给倍率；实体绣花针不算真气外放 |
| special / observable | `{fusible:false,equipmentRequired:true}` / `false` |
| learnSources | 黑木崖秘库针谱 `maxLayer:8` 或特殊授艺 `maxLayer:10` **（原创扩展、需作者确认）**；主角与其他满足葵花前置者可学 |
| description | 将原著明确使用的绣花针动作独立为可装配外功；每招投送的是实体针，故 `projection:false`，不提供 `projectionSpreadSteps`。 |

#### `sk_kuihuafeizhen` 葵花飞针

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 / 外放 | 架 | 核算与 MoveDef |
|---|---:|---|---:|---|---|---|---|
| 飞针逐影 `mv_kuihuafeizhen_zhuying` **（原创扩展命名）** | 1 | 单体·1–5·实体暗器 | 0.80 | 7%/0/1000 | 不可招架；`projection:false` | 否 | `1×0.92×0.85=0.782≈0.80`；`MoveDef{unlock:1;ultimate:false;mpCost:7%;cd:0;recovery:1000;meridianRouteRef:mfr_kuihuafeizhen_zhuying;projection:false}` |
| 连缀三针 `mv_kuihuafeizhen_lianzhui` **（原创扩展命名）** | 3 | 单体·1–4·实体暗器 3 段 | 1.00 | 8%/1/1100 | 不可招架；`projection:false` | 否 | `1×1.24×0.92×0.85=0.970≈1.00`；`MoveDef{unlock:3;ultimate:false;mpCost:8%;cd:1;recovery:1100;meridianRouteRef:mfr_kuihuafeizhen_lianzhui;projection:false}` |
| 回身针 `mv_kuihuafeizhen_huishen` **（原创扩展命名）** | 5 | 单体·1–4·实体暗器 | 0.95 | 8%/2/1100 | 后撤 2；`projection:false` | 否 | `1×(1+.24+.05+.07)×.92×.85−.10=.964≈.95`；`MoveDef{unlock:5;ultimate:false;mpCost:8%;cd:2;recovery:1100;meridianRouteRef:mfr_kuihuafeizhen_huishen;projection:false}` |
| 索隙针 `mv_kuihuafeizhen_suoyin` **（原创扩展命名）** | 6 | 单体·1–4·实体暗器 | 1.00 | 8%/2/1000 | `bf_shimang` 30%·1；不可招架；`projection:false` | 否 | `1×(1+.24+.05)×.92×.85−.10×.30=.979≈1.00`；`MoveDef{unlock:6;ultimate:false;mpCost:8%;cd:2;recovery:1000;meridianRouteRef:mfr_kuihuafeizhen_suoyin;projection:false}` |
| 夺命绣针 `mv_kuihuafeizhen_duoming`（绝招，**原创扩展命名**） | 7 | 单体·1–5·实体暗器 | 2.30 | 9%/0/1200 | `bf_shimang` 50%·1；不可招架；气势 100；`projection:false` | 否 | `3×.92×.85−.10×.50=2.296≈2.30`；`MoveDef{unlock:7;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;meridianRouteRef:mfr_kuihuafeizhen_duoming;projection:false}` |
| 无影针雨 `mv_kuihuafeizhen_wuying`（绝招，**原创扩展命名**） | 9 | `aoe_chain n5`·1–4·实体暗器 | 1.80 | 9%/0/1200 | 后撤 1；不可招架；气势 100；`projection:false` | 否 | N=5、AF=.80；`3×.80×.92×.85−.10=1.777≈1.80`；`MoveDef{unlock:9;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;meridianRouteRef:mfr_kuihuafeizhen_wuying;projection:false}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 以针代剑 | `ps_kuihuafeizhen_yizhen` | 2 | 针类暗器命中 `+5→+10`；不重复读取 `sk_kuihua` 同类倍率 |
| 鬼魅针影 | `ps_kuihuafeizhen_guimei` | 5 | 本回合移动 ≥3 格后，首针 Z3 +8% |
| 针意通神 | `ps_kuihuafeizhen_tongshen` | 10 | 每战首次针类绝招结算后返还该招实扣内力 20% |

## 5. 调息档案

四门内功各绑定一个 `txp_*`。字段口径见 `design/21` §10 / §12.1；统一 `layer:10,scope:3,ct:1000,mpCostBp:0,outOfBattleScaleBp:15000`，9 级点穴禁止自调息。满层验算为：

```text
relief = floor((500 + 100×8 + 80×10) × natureBp / 10000)
repair = floor((120 + 24×8 + 18×10) × natureBp / 10000)
```

| 内功 | breathProfileRef / 档案 | innerGuard | 满层 `relief/repair` |
|---|---|---|---|
| `sk_qingchengyunqi` | `txp_qingchengyunqi {grade:8,layer:10,nature:yin,scope:3,ct:1000,mpCostBp:0,outOfBattleScaleBp:15000}` | `{enabled:true,reflectBp:0}` | `2100/492` |
| `sk_songshanzhenqi` | `txp_songshanzhenqi {grade:8,layer:10,nature:yang,scope:3,ct:1000,mpCostBp:0,outOfBattleScaleBp:15000}` | `{enabled:true,reflectBp:0}` | `2100/492` |
| `sk_jianzongxingqi` | `txp_jianzongxingqi {grade:8,layer:10,nature:harmony,scope:3,ct:1000,mpCostBp:0,outOfBattleScaleBp:15000}` | `{enabled:true,reflectBp:0}` | `floor(2100×1.05)=2205 / floor(492×1.05)=516` |
| `sk_heimuxuangong` | `txp_heimuxuangong {grade:8,layer:10,nature:yin,scope:3,ct:1000,mpCostBp:0,outOfBattleScaleBp:15000}` | `{enabled:true,reflectBp:0}` | `2100/492` |

`enabled:true` 只表示主运具备护体档，仍须合法自然护体短路或 defense 路线；四门均无固定伤害反震语义，故 `reflectBp:0`。内劲抵消继续按 `design/21` §4.8：拳脚、兵器、暗器、外放分别读既定适用率，以 `1 MP : 2 伤害` 结算，不在本文另定倍率。

## 6. 来源扩展登记

| `sk_*` | 需加入的书界 | 依据 | 状态 |
|---|---|---|---|
| — | — | 本轮七门均原生登记 `[ch05_xiaoao]`；所复用武学也已覆盖笑傲 | 无来源扩展待登记 |

其他书界若出现日月神教、五岳剑派或青城派人物，应按“主书界 05”规则复用本文 ID，不在他书重复造武学；实际替换留给跨书界收尾任务。

## 7. 外放候选审计表

| 武学 / 招式范围 | 判定 | `projectionSpreadSteps` | 理由 |
|---|---|---|---|
| 四门内功全部 20 招 | `projection:false` | 省略 | 调息、护体、运气或近身持剑动作；没有明确离体劲力伤害 |
| `sk_songshankaihezhang` 全部 5 招 | `projection:false` | 省略 | 掌心近身击打 / 推阵；没有设定劈空掌力 |
| `sk_renwoxingzhang` 全部 6 招 | `projection:false` | 省略 | 均为接触掌击；个人掌劲强不自动等于离体外放 |
| `sk_kuihuafeizhen` 全部 6 招 | `projection:false` | 省略 | 投送实体绣花针，按 `design/21` §4.4.1 明确不算外放 |

结论：本轮 37 招中外放候选为 **0**；因此没有外放路线端点检查项，也不得为实体针误填 `projectionSpreadSteps`。持针路线仍以腕 / 指端表达动作，但这只是动作末端，不改变外放判定。

## 8. 统计表

| 项 | 数量 | 核算 |
|---|---:|---|
| 新增武学 | 7 | 内功 4、拳掌 2、暗器 / 针 1 |
| 品阶 | 地中 5、地上 2 | `5+2=7`；不增加 Canon §13 天级闭集 |
| 招式 | 37 | 四门内功 `4×5=20`；嵩山掌 5；任掌 6；飞针 6 |
| 绝招 | 9 | 五门地中各 1；两门地上各 2 |
| 绝招解锁 | L7 7、L9 2 | 每门第一绝招 L7；两门地上第二绝招 L9 |
| 显式路线 | 37 | 每招一路；其中绝招 9、普通招 28 |
| 调息档案 | 4 | 与四门内功一一对应 |
| 外放招式 | 0 | 实体暗器、近身掌击、支援与普通持械均不算外放 |
| 来源扩展 | 0 | 七门均原生 `[ch05_xiaoao]` |
| 跨书界待补 | 0 | 日月、五岳与青城均以 05 为主书界 |

地中绝招数依 `ultimate-counts-tianzhong-dizhong.md` 判据：五门均为原创扩展，原著明示套路 F=0，取 1 招；地上固定 2 招。地阶绝招均耗内 9%、气势 100、`cd:0`、收招 1200。

## 9. 本文新增术语与 ID

| 类别 | 数量 | ID / 说明 |
|---|---:|---|
| 武学 `sk_*` | 7 | `sk_jianzongxingqi`、`sk_songshanzhenqi`、`sk_songshankaihezhang`、`sk_qingchengyunqi`、`sk_heimuxuangong`、`sk_renwoxingzhang`、`sk_kuihuafeizhen` |
| 招式 `mv_*` | 37 | 以所属武学 ID 为前缀；完整清单见 §1–§4 |
| 被动 `ps_*` | 21 | 每门 3 个；完整清单见 §1–§4 |
| 路线 `mfr_*` | 37 | 与招式一一对应；对象唯一归属仍是 `design/21`，本文为内容实例 |
| 调息档案 `txp_*` | 4 | `txp_jianzongxingqi`、`txp_songshanzhenqi`、`txp_qingchengyunqi`、`txp_heimuxuangong` |
| 新 Buff / 门派 / 套装 | 0 | 只引用既有 `bf_*`、`sect_*`、`set_*` |

## 10. 数据校验规则与测试用例

### 10.1 构建期校验规则

1. 七个 `sk_*`、37 个 `mv_*`、21 个 `ps_*`、37 个 `mfr_*` 与四个 `txp_*` 必须全仓唯一；正文引用不得悬空。
2. 五门地中各有 1 个 L7 绝招，两门地上各有 L7、L9 两个绝招；所有绝招均为气势 100、耗内 9%、`cd:0`、收招 1200。
3. 每个 `MoveDef` 必须且只能引用一条本文路线；绝招路线固定 8 段，普通路线 4 段，任一路线不得与全仓既有有序序列完全相同。
4. 同一武学多条绝招的穴位集合交集不得超过任一集合的 50%，且不得只靠轮换或逆序制造差异。
5. 四门 8 品内功的 `IP` 均须等于 `30+18+2×12+5×2.2=83`，并各自绑定唯一调息档案；调息档案必须显式含 `outOfBattleScaleBp:15000`。
6. 37 招均须显式 `projection:false` 且省略 `projectionSpreadSteps`；若以后把任一招改为外放，必须另过手部端点白名单与扩散模拟。
7. 公传武学必须保留门派职级或秘籍途径，使主角及其他合格人物可学；个人传承不得降格为击败首领必掉。

### 10.2 验收用例

| 用例 | 输入 / 操作 | 预期 |
|---|---|---|
| `CAT05-01` ID 完整性 | 对本册与 `chapters/05-xiaoao.md` 跑严格 ID / 未定义引用检查 | 无本轮新增重复定义或悬空引用 |
| `CAT05-02` 绝招配额 | 汇总七张卡的 `ultimate:true` 与解锁层 | 地中 `5×1=5`；地上 `2×2=4`；合计 9 |
| `CAT05-03` 路线唯一 | 对本册运行路线唯一性检查 | 完全相同路线 0；同武学共享率均 ≤50% |
| `CAT05-04` 内功预算 | 逐张复算四门内功贡献 | 每门 `IP=83`，品阶与 8 地中预算一致 |
| `CAT05-05` 调息满层 | 以 8 品、10 重和阴阳 / 调和倍率代入 §5 公式 | 阴 / 阳 `2100/492`；调和 `2205/516` |
| `CAT05-06` 外放审计 | 扫描 37 个 `MoveDef` 及 `projectionSpreadSteps` | 37 个 `projection:false`；外放 0；扩散字段 0 |
| `CAT05-07` 可得性 | 用非首领同门角色验证公传来源，以非葵花角色验证飞针前置 | 公传可按职级 / 武册取得；飞针未满足 `sk_kuihua` L7 时拒绝 |

## 11. 待决事项 / 依赖

### 替下游给出的建议值

| 项 | 本文默认值 | 下游回填 |
|---|---|---|
| 四门门派公传 | 第四职级传授至 10 重；支线 / 武册至 8 重 **【建议值】** | `design/17` 与书界任务配置确认职级名、贡献门槛和互斥 |
| 两门个人传承 | 任我行指点 / 梅庄后手录；黑木崖秘库针谱 / 特殊授艺 **【建议值】** | `design/12` 登记任务、唯一物权与错过回收，不设击败必掉 |

### 本文依赖的上游事实

- 品阶、IP、绝招预算与招式倍率只依 `design/05`；经脉路线、护体内劲、调息和外放只依 `design/21`。
- 门派层级与教学权限依 `design/17`；若职级表调整，只改习得门槛，不改变七门武学的来源归属。
- 五门地中尚未列入 `ultimate-counts-tianzhong-dizhong.md` 的逐门裁定表；本文按其 fallback 判据取每门 1 个绝招，待裁定表同步后移除工具提示。

### 对基准的修改提案

- 本册不另立基准提案。岳不群 10 品主运缺口涉及 Canon §13 固定天级闭集，沿用 `chapters/05-xiaoao.md` 的 `D05-B09`，未获作者裁定前不在本册增设天级内功。

### 原著考据待办

- 核对任我行在相关交手中的掌击动作与版本差异；本文只采用人物擅掌的概括，不把原创招名冒充原著术语。
- 核对东方不败以绣花针交手的动作边界与版本差异；本文只确认实体针性质，不编造回目号或逐字引文。

### 开放问题（附默认值）

| 编号 | 问题 | 默认值 |
|---|---|---|
| `BL05-O01` | 任我行个人掌法是否允许玩家取得？ | 允许，但只经本人指点或唯一后手录奇遇，最高 10 重且不可击败掉落 |
| `BL05-O02` | 葵花飞针是否独立于葵花宝典装配？ | 独立外功，但硬前置 `sk_kuihua` 7 重与针类暗器 |
| `BL05-O03` | 五门地中绝招数是否保持 fallback 结果？ | 保持每门 1 招，直至裁定表显式收录 |
