# 武学补录图鉴 · 书界 08《鹿鼎记》首领缺口（`skills-bulu-08-luding`）

> **归属（基准 §18）**：`design/catalog/skills-*.md` 的书界 08 专项补录；只定义《鹿鼎记》首领与手配精英缺失的武学卡。
> **覆盖声明**：覆盖清宫 / 布库、桑结一系、王屋、平西军、神龙舰队、台湾郑氏 / 冯锡范、雅克萨守军与海大富；既有门派图鉴不在本文改写。归辛树 / 归二娘归主书界 07，不在本文造新武学。
> **上游**：`docs/00-canon.md` v1.3、作者决定与需求、`design/05`、`design/15`、`design/17`、`design/21` §4.3–§4.4/§11.9、`skills-kangxi`、`skills-xiaoyao`。
> **引用而不重定义**：武学字段与预算见 `design/05`；经脉路线、调息及外放见 `design/21`；穴位见 `design/15`；门派与职级见 `design/17`；既有武学只引用其原图鉴。
> **标注约定**：**（原创扩展）**为原著没有的武学、招名或机制；**（待考）**为三联 / 广州修订版尚待逐字核对；**【建议值】**为待上游确认的数值。
> **版本**：首领武学补录与替补替换（2026-09-28）；经脉落地终审（2026-09-29）；路线叙事第三轮（2026-09-29）。

---

## 0. 阅读指引

本册只补“来源可共享的门派 / 军伍武学”，不把每个 Boss 都写成不可学习的专属技能。除 §8 海大富个人心法外，玩家与其他人物只要满足表内门派职级、军职、秘籍或奇遇条件即可习得。品阶按鹿鼎 `G=8`：首领主运 / 主战外功取 8，手配精英主运取 7；海大富沿既有 9 品人物画像取 9。

### 0.1 绝招显式路线索引（镜像正文卡，非覆写层）

本索引只镜像正文卡；每条路线均为 8 段、每段 90 CT，风险依次 100–240，故 `1200+8×90=1920≤2000`。本文没有外放招：掌拳均为接触发力，剑 / 刺刀为普通兵刃，内功绝招为自身护体；均写 `projection:false`、`projectionSpreadSteps:[base,base,base]`。

<!-- skill-catalog-audit:start -->
| 品阶 | 武学 | MoveDef（正文卡镜像） | 路线 ID | steps（acupointRef/segmentCt/riskBp） |
|---|---|---|---|---|
| 8 地中 | `sk_aobaihengliangong` | `mv_aobaihengliangong_tieshen` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_aobaihengliangong_tieshen}` | `mfr_aobaihengliangong_tieshen` | `MeridianRouteDef{moveRef:mv_aobaihengliangong_tieshen; ultimate:true; purpose:defense}`；`ap_dumai_mingmen/90/100→ap_dumai_yinjiao/90/120→ap_zuyangming_zusanli/90/140→ap_zutaiyang_kunlun/90/160→ap_yangqiao_shenmai/90/180→ap_shouyangming_quchi/90/200→ap_shouyangming_shousanli/90/220→ap_shouyangming_hegu/90/240` |
| 8 地中 | `sk_bukuhengshuai` | `mv_bukuhengshuai_suomen` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_bukuhengshuai_suomen}` | `mfr_bukuhengshuai_suomen` | `MeridianRouteDef{moveRef:mv_bukuhengshuai_suomen; ultimate:true; purpose:attack}`；`ap_dumai_zhiyang/90/100→ap_yangwei_yamen/90/120→ap_zushaoyang_xuanzhong/90/140→ap_zutaiyang_chengshan/90/160→ap_zuyangming_fenglong/90/180→ap_shoutaiyang_wangu/90/200→ap_shouyangming_quchi/90/220→ap_shouyangming_hegu/90/240` |
| 7 地下 | `sk_bukuhutiaogong` | `mv_bukuhutiaogong_hushen` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_bukuhutiaogong_hushen}` | `mfr_bukuhutiaogong_hushen` | `MeridianRouteDef{moveRef:mv_bukuhutiaogong_hushen; ultimate:true; purpose:defense}`；`ap_renmai_qihai/90/100→ap_renmai_guanyuan/90/120→ap_zutaiyin_shangqiu/90/140→ap_zushaoyin_taixi/90/160→ap_yinwei_zhubin/90/180→ap_shoujueyin_quze/90/200→ap_shoutaiyin_chize/90/220→ap_shouyangming_hegu/90/240` |
| 8 地中 | `sk_sangjiehufagong` | `mv_sangjiehufagong_fumo` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_sangjiehufagong_fumo}` | `mfr_sangjiehufagong_fumo` | `MeridianRouteDef{moveRef:mv_sangjiehufagong_fumo; ultimate:true; purpose:defense}`；`ap_dumai_shenzhu/90/100→ap_dumai_shendao/90/120→ap_zuyangming_tianshu/90/140→ap_zushaoyang_guangming/90/160→ap_yangwei_tianliao/90/180→ap_shoushaoyang_waiguan/90/200→ap_shoujueyin_neiguan/90/220→ap_renmai_danzhong/90/240` |
| 8 地中 | `sk_xueyuhufashou` | `mv_xueyuhufashou_zhenmen` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_xueyuhufashou_zhenmen}` | `mfr_xueyuhufashou_zhenmen` | `MeridianRouteDef{moveRef:mv_xueyuhufashou_zhenmen; ultimate:true; purpose:attack}`；`ap_dumai_mingmen/90/100→ap_yangwei_yamen/90/120→ap_zuyangming_zusanli/90/140→ap_zushaoyang_xuanzhong/90/160→ap_shouyangming_quchi/90/180→ap_shoutaiyang_wangu/90/200→ap_shoujueyin_neiguan/90/220→ap_shoujueyin_laogong/90/240` |
| 7 地下 | `sk_fansenghutigong` | `mv_fansenghutigong_jingang` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_fansenghutigong_jingang}` | `mfr_fansenghutigong_jingang` | `MeridianRouteDef{moveRef:mv_fansenghutigong_jingang; ultimate:true; purpose:defense}`；`ap_renmai_zhongwan/90/100→ap_renmai_danzhong/90/120→ap_zutaiyin_taibai/90/140→ap_zushaoyin_fuliu/90/160→ap_yinwei_fuai/90/180→ap_shoujueyin_tianchi/90/200→ap_shoushaoyin_qingling/90/220→ap_shoutaiyin_yunmen/90/240` |
| 8 地中 | `sk_wangwuzhenshanxinfa` | `mv_wangwuzhenshanxinfa_jushou` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_wangwuzhenshanxinfa_jushou}` | `mfr_wangwuzhenshanxinfa_jushou` | `MeridianRouteDef{moveRef:mv_wangwuzhenshanxinfa_jushou; ultimate:true; purpose:defense}`；`ap_renmai_guanyuan/90/100→ap_chongmai_futonggu/90/120→ap_zutaiyin_diji/90/140→ap_zuyangming_zusanli/90/160→ap_zutaiyang_weizhong/90/180→ap_shoushaoyang_yangchi/90/200→ap_shoutaiyang_yanggu/90/220→ap_shouyangming_hegu/90/240` |
| 7 地下 | `sk_wangwuhushangong` | `mv_wangwuhushangong_lidao` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_wangwuhushangong_lidao}` | `mfr_wangwuhushangong_lidao` | `MeridianRouteDef{moveRef:mv_wangwuhushangong_lidao; ultimate:true; purpose:defense}`；`ap_dumai_yaoyangguan/90/100→ap_renmai_qihai/90/120→ap_zushaoyang_yanglingquan/90/140→ap_zutaiyang_chengshan/90/160→ap_yangqiao_fuyang/90/180→ap_shoutaiyang_wangu/90/200→ap_shoushaoyang_yangchi/90/220→ap_shouyangming_hegu/90/240` |
| 8 地中 | `sk_wangwudangguanjian` | `mv_wangwudangguanjian_dangguan` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_wangwudangguanjian_dangguan}` | `mfr_wangwudangguanjian_dangguan` | `MeridianRouteDef{moveRef:mv_wangwudangguanjian_dangguan; ultimate:true; purpose:attack}`；`ap_chongmai_futonggu/90/100→ap_daimai_wushu/90/120→ap_zushaoyang_guangming/90/140→ap_zutaiyang_weizhong/90/160→ap_zuyangming_fenglong/90/180→ap_shouyangming_quchi/90/200→ap_shoushaoyang_waiguan/90/220→ap_shoutaiyang_wangu/90/240` |
| 8 地中 | `sk_pingxizhentaixinfa` | `mv_pingxizhentaixinfa_shoubei` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_pingxizhentaixinfa_shoubei}` | `mfr_pingxizhentaixinfa_shoubei` | `MeridianRouteDef{moveRef:mv_pingxizhentaixinfa_shoubei; ultimate:true; purpose:defense}`；`ap_dumai_mingmen/90/100→ap_dumai_jizhong/90/120→ap_zuyangming_tianshu/90/140→ap_zushaoyang_xuanzhong/90/160→ap_yangwei_jianjing/90/180→ap_shouyangming_shousanli/90/200→ap_shoushaoyang_zhigou/90/220→ap_shoutaiyang_yanggu/90/240` |
| 7 地下 | `sk_pingxixingqijue` | `mv_pingxixingqijue_lianzhen` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_pingxixingqijue_lianzhen}` | `mfr_pingxixingqijue_lianzhen` | `MeridianRouteDef{moveRef:mv_pingxixingqijue_lianzhen; ultimate:true; purpose:defense}`；`ap_renmai_zhongji/90/100→ap_renmai_shuifen/90/120→ap_zutaiyin_xuehai/90/140→ap_zushaoyin_rangu/90/160→ap_yinqiao_zhaohai/90/180→ap_shoujueyin_quze/90/200→ap_shoushaoyin_shaohai/90/220→ap_shoutaiyin_taiyuan/90/240` |
| 8 地中 | `sk_shenlonghaichaojing` | `mv_shenlonghaichaojing_zhenzhou` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_shenlonghaichaojing_zhenzhou}` | `mfr_shenlonghaichaojing_zhenzhou` | `MeridianRouteDef{moveRef:mv_shenlonghaichaojing_zhenzhou; ultimate:true; purpose:defense}`；`ap_dumai_zhiyang/90/100→ap_yangwei_benshen/90/120→ap_zushaoyang_riyue/90/140→ap_zutaiyang_shenshu/90/160→ap_yangqiao_pucan/90/180→ap_shoushaoyang_yangchi/90/200→ap_shoutaiyang_xiaohai/90/220→ap_shouyangming_hegu/90/240` |
| 7 地下 | `sk_shenlongfanzhougong` | `mv_shenlongfanzhougong_dinglang` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_shenlongfanzhougong_dinglang}` | `mfr_shenlongfanzhougong_dinglang` | `MeridianRouteDef{moveRef:mv_shenlongfanzhougong_dinglang; ultimate:true; purpose:defense}`；`ap_renmai_shuifen/90/100→ap_chongmai_qichong/90/120→ap_daimai_daimai/90/140→ap_zushaoyang_yangbai/90/160→ap_zutaiyang_kunlun/90/180→ap_shoutaiyang_wangu/90/200→ap_shoushaoyang_waiguan/90/220→ap_shouyangming_quchi/90/240` |
| 8 地中 | `sk_yanpinghaifangxinfa` | `mv_yanpinghaifangxinfa_zhencang` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_yanpinghaifangxinfa_zhencang}` | `mfr_yanpinghaifangxinfa_zhencang` | `MeridianRouteDef{moveRef:mv_yanpinghaifangxinfa_zhencang; ultimate:true; purpose:defense}`；`ap_renmai_qihai/90/100→ap_chongmai_henggu/90/120→ap_daimai_wushu/90/140→ap_daimai_zhangmen/90/160→ap_zutaiyang_chengshan/90/180→ap_renmai_zhongwan/90/200→ap_shoushaoyang_waiguan/90/220→ap_shoutaiyang_yanggu/90/240` |
| 7 地下 | `sk_yanpingfanchaojue` | `mv_yanpingfanchaojue_hujia` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_yanpingfanchaojue_hujia}` | `mfr_yanpingfanchaojue_hujia` | `MeridianRouteDef{moveRef:mv_yanpingfanchaojue_hujia; ultimate:true; purpose:defense}`；`ap_dumai_yaoyangguan/90/100→ap_chongmai_qichong/90/120→ap_zutaiyin_gongsun/90/140→ap_zushaoyin_yongquan/90/160→ap_yinwei_zhubin/90/180→ap_shoujueyin_neiguan/90/200→ap_shoushaoyin_lingdao/90/220→ap_shoutaiyin_chize/90/240` |
| 8 地中 | `sk_yanpingzhenhaijian` | `mv_yanpingzhenhaijian_jiefeng` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_yanpingzhenhaijian_jiefeng}` | `mfr_yanpingzhenhaijian_jiefeng` | `MeridianRouteDef{moveRef:mv_yanpingzhenhaijian_jiefeng; ultimate:true; purpose:attack}`；`ap_daimai_daimai/90/100→ap_zushaoyang_zuqiaoyin/90/120→ap_zutaiyang_weizhong/90/140→ap_zuyangming_fenglong/90/160→ap_dumai_shenzhu/90/180→ap_shouyangming_hegu/90/200→ap_shoushaoyang_yangchi/90/220→ap_shoutaiyang_wangu/90/240` |
| 8 地中 | `sk_yijianxinfa` | `mv_yijianxinfa_shoucang` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_yijianxinfa_shoucang}` | `mfr_yijianxinfa_shoucang` | `MeridianRouteDef{moveRef:mv_yijianxinfa_shoucang; ultimate:true; purpose:defense}`；`ap_renmai_zhongwan/90/100→ap_chongmai_futonggu/90/120→ap_daimai_wushu/90/140→ap_zujueyin_taichong/90/160→ap_zushaoyin_taixi/90/180→ap_shoujueyin_tianchi/90/200→ap_shoushaoyin_shaofu/90/220→ap_shoutaiyin_taiyuan/90/240` |
| 8 地中 | `sk_yijianwuxue` | `mv_yijianwuxue_duoming` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_yijianwuxue_duoming}` | `mfr_yijianwuxue_duoming` | `MeridianRouteDef{moveRef:mv_yijianwuxue_duoming; ultimate:true; purpose:attack}`；`ap_yinqiao_lieque/90/100→ap_yinwei_lianquan/90/120→ap_zujueyin_zhongfeng/90/140→ap_zutaiyin_shangqiu/90/160→ap_renmai_danzhong/90/180→ap_shouyangming_quchi/90/200→ap_shoushaoyang_waiguan/90/220→ap_shoutaiyang_wangu/90/240` |
| 8 地中 | `sk_luochazhenliecao` | `mv_luochazhenliecao_hengdui` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_luochazhenliecao_hengdui}` | `mfr_luochazhenliecao_hengdui` | `MeridianRouteDef{moveRef:mv_luochazhenliecao_hengdui; ultimate:true; purpose:defense}`；`ap_dumai_shendao/90/100→ap_yangwei_yangjiao/90/120→ap_zushaoyang_guangming/90/140→ap_zuyangming_tianshu/90/160→ap_zutaiyang_shenshu/90/180→ap_shouyangming_shousanli/90/200→ap_shoushaoyang_zhigou/90/220→ap_shoutaiyang_yanggu/90/240` |
| 7 地下 | `sk_luochabujunhuxi` | `mv_luochabujunhuxi_jushou` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_luochabujunhuxi_jushou}` | `mfr_luochabujunhuxi_jushou` | `MeridianRouteDef{moveRef:mv_luochabujunhuxi_jushou; ultimate:true; purpose:defense}`；`ap_renmai_zhongji/90/100→ap_chongmai_henggu/90/120→ap_zutaiyin_taibai/90/140→ap_zushaoyin_dazhong/90/160→ap_yinqiao_jiaoxin/90/180→ap_shoujueyin_quze/90/200→ap_shoushaoyin_qingling/90/220→ap_shoutaiyin_kongzui/90/240` |
| 8 地中 | `sk_luochaciqiangshu` | `mv_luochaciqiangshu_tujin` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_luochaciqiangshu_tujin}` | `mfr_luochaciqiangshu_tujin` | `MeridianRouteDef{moveRef:mv_luochaciqiangshu_tujin; ultimate:true; purpose:attack}`；`ap_zuyangming_lidui/90/100→ap_zushaoyang_zuqiaoyin/90/120→ap_zutaiyang_zhiyin/90/140→ap_dumai_zhiyang/90/160→ap_yangwei_jinmen/90/180→ap_shouyangming_hegu/90/200→ap_shoushaoyang_yangchi/90/220→ap_shoutaiyang_wangu/90/240` |
| 9 地上 | `sk_haidafuhuagujing` | `mv_haidafuhuagujing_fumai` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_haidafuhuagujing_fumai}` | `mfr_haidafuhuagujing_fumai` | `MeridianRouteDef{moveRef:mv_haidafuhuagujing_fumai; ultimate:true; purpose:defense}`；`ap_renmai_huiyin/90/100→ap_renmai_zhongji/90/120→ap_zutaiyin_diji/90/140→ap_zushaoyin_yingu/90/160→ap_yinwei_fuai/90/180→ap_shoujueyin_tianchi/90/200→ap_shoushaoyin_yinxi/90/220→ap_shoutaiyin_yunmen/90/240` |
| 9 地上 | `sk_haidafuhuagujing` | `mv_haidafuhuagujing_cangjin` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_haidafuhuagujing_cangjin}` | `mfr_haidafuhuagujing_cangjin` | `MeridianRouteDef{moveRef:mv_haidafuhuagujing_cangjin; ultimate:true; purpose:defense}`；`ap_yinqiao_zhaohai/90/100→ap_zujueyin_ligou/90/120→ap_zushaoyin_shufu/90/140→ap_zutaiyin_gongsun/90/160→ap_renmai_qihai/90/180→ap_shoujueyin_neiguan/90/200→ap_shoushaoyin_shaofu/90/220→ap_shoutaiyin_taiyuan/90/240` |
<!-- skill-catalog-audit:end -->

### 0.2 来源扩展登记

| 武学 ID | 需加入书界 | 依据 |
|---|---|---|
| — | — | 本次复用的 `sk_dashouyin` 已在 `skills-xiaoyao` 明列 `ch08_luding`，无待统一落实项。 |

## 1. 清宫 / 布库（与 `skills-kangxi` 同属 `sect_qinggong` 体系）

### 1.1 `sk_aobaihengliangong` 鳌拜横练功（8 地中 · 内功）**（原创扩展命名）**

| 字段 | 值 |
|---|---|
| 出处 / 归属 | 鳌拜勇力与擒拿情节有原著依据，成套心法名与机制为**（原创扩展）**；`expanded / sect_qinggong / 清宫军伍横练` |
| source / nature | `[ch08_luding]`；`yang`；`wOut/wIn:0/1`；`meridians:[mer_dumai,mer_shouyangming]` |
| reqs / 习得 | `con:50,str:55,apInner:50`；清宫 L4 传授，或鳌拜案后取得校场抄本 `maxLayer:8` **（原创扩展）**；非个人独占 |
| inner.contribution | `{mpMaxPct:30,hpMaxPct:17,attrs:{con:8,str:4},mpRegen:2.4}`；`30+17+2×12+5×2.4=83` |
| 层数 / 特性 | 1 横练、4 扛势、7 绝招铁身；`setTags:[]`；`observable:true`；主运受擒拿位移 −1（最低 0） |

| 招式（ID） | 重 | 范围 / 倍率 | 资源与效果 |
|---|---:|---|---|
| 横练运息 `mv_aobaihengliangong_yunxi` **（原创扩展）** | 1 | 自身 / 0 | 7% / cd2 / 收招1000；`bf_wenzhong` 2 |
| 铁身 `mv_aobaihengliangong_tieshen`（绝招，**原创扩展**） | 7 | 自身 / 0 | `bf_hutizhenqi` 18%；`projection:false; projectionSpreadSteps:[self,self,self]`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_aobaihengliangong_tieshen}` |

### 1.2 `sk_bukuhengshuai` 布库横摔（8 地中 · 拳脚 / 擒拿）**（原创扩展）**

| 字段 | 值 |
|---|---|
| 归属 / 来源 | `expanded / sect_qinggong / 布库房`；由布库摔跤进阶；清宫 L4 教头传授或校场夺魁奇遇，玩家与侍卫均可学 |
| 性质 / 门槛 | `yang`；`wOut/wIn:0.80/0.20`；`str:50,con:45,apGrapple:50` |
| 层数 / 数值 | `layerStats:{hit:[3,8],tough:[3,7]}` 合计 15；1 抱腰、4 横拦、7 锁门；`setTags:[]` |

| 招式（ID） | 重 | 范围 / 倍率 | 资源与效果 |
|---|---:|---|---|
| 抱腰横摔 `mv_bukuhengshuai_baoyao` **（原创扩展）** | 1 | 单体近身 / 0.95 | 7% / cd1 / 1000；击退1 |
| 锁门横摔 `mv_bukuhengshuai_suomen`（绝招，**原创扩展**） | 7 | 单体近身 / 2.80 | 9%/—/1200；气势100；`bf_shouqin`（`level:6`）50%；`projection:false; projectionSpreadSteps:[single,single,single]`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_bukuhengshuai_suomen}` |

习得前置：`sk_bukushuaijiao` 布库摔跤 6 重。

### 1.3 `sk_bukuhutiaogong` 布库护腰功（7 地下 · 内功）**（原创扩展）**

`expanded / sect_qinggong / 布库房`；阳；`wOut/wIn:0/1`；`meridians:[mer_renmai,mer_shouyangming]`。`con:42,str:40,apInner:40`，清宫 L3 或布库教头传授，前置 `sk_bukushuaijiao` 4 重。贡献 `{mpMaxPct:24,hpMaxPct:12,attrs:{con:7,str:3},mpRegen:3.2}`，`24+12+2×10+5×3.2=72`。

- 护腰运息 `mv_bukuhutiaogong_yunxi`（L1，自身，7% / cd2 / 1000，`bf_wenzhong`1）。
- 护身沉腰 `mv_bukuhutiaogong_hushen`（L7 绝招，**原创扩展**）：自身护体 16%，`projection:false; projectionSpreadSteps:[self,self,self]`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_bukuhutiaogong_hushen}`。

## 2. 桑结一系（与 `skills-xiaoyao` 同属 `sect_mizong` 体系）

### 2.1 `sk_sangjiehufagong` 桑结护法功（8 地中 · 内功）**（原创扩展）**

| 字段 | 值 |
|---|---|
| 依据 / 归属 | 桑结为西藏密宗高手、大手印功夫精深见 `skills-xiaoyao`；此心法名与机制为**（原创扩展）**；`sect_mizong / 桑结一系` |
| nature / meridians | `yang`；`wOut/wIn:0/1`；`[mer_dumai,mer_yangwei]` |
| reqs / 习得 | `con:50,wil:50,apInner:50`；前置“密宗护法身”6 重（ID 见 `skills-xiaoyao` §6.4）；密宗 L4、桑结传授或五台护经奇遇 `maxLayer:8`；主角与其他门人均可学 |
| contribution | `{mpMaxPct:29,hpMaxPct:18,attrs:{con:7,wil:5},mpRegen:2.4}`；`29+18+24+12=83` |
| 层数 / 特性 | 1 持息、4 护法、7 伏魔；抗击退 + 护持；`setTags:[]`；`observable:true` |

- 护法持息 `mv_sangjiehufagong_chixi`（L1，自身，7% / cd2 / 1000，`bf_wenzhong`2）。
- 伏魔护持 `mv_sangjiehufagong_fumo`（L7 绝招，**原创扩展**）：自身与相邻友军获 `bf_shoushi`2；`projection:false; projectionSpreadSteps:[self,self,self]`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_sangjiehufagong_fumo}`。

前置 ID：`sk_mizonghufashen`（密宗护法身）6 重。

### 2.2 `sk_fansenghutigong` 番僧护体功（7 地下 · 内功）**（原创扩展）**

`expanded / sect_mizong / 后世番僧通传`；阳；`meridians:[mer_renmai,mer_dumai]`；`con:42,wil:38,apInner:40`，密宗 L3 或桑结门下传授，前置 `sk_mizonghufashen` 5 重。贡献 `{mpMaxPct:25,hpMaxPct:13,attrs:{con:6,wil:4},mpRegen:2.8}`，`25+13+20+14=72`。

- 护法铁衣 `mv_fansenghutigong_jingang`（L7 绝招，**原创扩展**）：自身护体16%；`projection:false; projectionSpreadSteps:[self,self,self]`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_fansenghutigong_jingang}`。仅改显示名以区别 `sk_jinganghufagong` 的“金刚护体”，稳定 ID 不变。
- 基础外功复用 `sk_dashouyin`：它已在 `skills-xiaoyao` 以鹿鼎桑结来源登记，并作为下节高阶护法手的习得前置。

### 2.3 `sk_xueyuhufashou` 雪域护法手（8 地中 · 拳脚 / 掌）**（原创扩展）**

`expanded / sect_mizong / 桑结一系`；阳；`wOut/wIn:0.65/0.35`。门槛 `str:48,wil:48,apFist:50`，密宗 L4、桑结传授或护经奇遇，前置 `sk_dashouyin` 6 重；主角与其他门人可学。`layerStats:{hit:[4,8],parry:[3,7]}` 合计15。

- 护法推掌 `mv_xueyuhufashou_tuizhang`（L1，单体近身，1.05，7% / cd1 / 1000，击退1）。
- 镇门手 `mv_xueyuhufashou_zhenmen`（L7 绝招，**原创扩展**）：锥2、2.40、`bf_polu`50%；接触掌击非外放，`projection:false; projectionSpreadSteps:[cone2,cone2,cone2]`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_xueyuhufashou_zhenmen}`。

## 3. 王屋派（与 `skills-kangxi` 同属 `sect_wangwu` 体系）

### 3.1 `sk_wangwuzhenshanxinfa` 王屋镇山心法（8 地中 · 内功）**（原创扩展）**

`expanded / sect_wangwu / 王屋派`；调和；`meridians:[mer_renmai,mer_chongmai]`。门槛 `con:48,wil:48,apInner:48`，王屋 L5 传授或护寨结局获掌门手录 `maxLayer:8`，前置王屋心法 6 重；非个人独占。贡献 `{mpMaxPct:31,hpMaxPct:16,attrs:{con:7,wil:5},mpRegen:2.4}`，`31+16+24+12=83`。

- 镇山运息 `mv_wangwuzhenshanxinfa_yunxi`（L1，自身，7% / cd2 / 1000，受击不退1格）。
- 据险固守 `mv_wangwuzhenshanxinfa_jushou`（L7 绝招，**原创扩展**）：自身 `bf_shoushi`3；`projection:false; projectionSpreadSteps:[self,self,self]`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_wangwuzhenshanxinfa_jushou}`。

### 3.2 `sk_wangwuhushangong` 王屋护山功（7 地下 · 内功）**（原创扩展）**

`expanded / sect_wangwu / 王屋派`；阳；`meridians:[mer_dumai,mer_yangqiao]`。门槛 `con:40,wil:38,apInner:40`，王屋 L4 传授，前置王屋心法 5 重。贡献 `{mpMaxPct:24,hpMaxPct:14,attrs:{con:6,wil:4},mpRegen:2.8}`，`24+14+20+14=72`。

- 立道护山 `mv_wangwuhushangong_lidao`（L7 绝招，**原创扩展**）：自身护体16%；`projection:false; projectionSpreadSteps:[self,self,self]`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_wangwuhushangong_lidao}`。

### 3.3 `sk_wangwudangguanjian` 王屋当关剑（8 地中 · 兵器 / 剑）**（原创扩展）**

`expanded / sect_wangwu / 王屋派`；调和；`wOut/wIn:0.75/0.25`；`weaponReq:{category:sword}`；门槛 `agi:48,wil:45,apSword:50`，王屋 L5 或司徒伯雷遗谱奇遇，前置 `sk_wangwuposhijian` 6 重；玩家与王屋门人可学。`layerStats:{hit:[4,8],parry:[3,7]}` 合计15。

- 横剑当关 `mv_wangwudangguanjian_hengjian`（L1，近身单体，1.10，7% / cd1 / 1000，招架）。
- 一剑当关 `mv_wangwudangguanjian_dangguan`（L7 绝招，**原创扩展**）：线3、2.45、`bf_polu`50%；普通兵刃非外放，`projection:false; projectionSpreadSteps:[line3,line3,line3]`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_wangwudangguanjian_dangguan}`。

## 4. 平西军（与 `skills-kangxi` 的平西王府军伍同来源）

### 4.1 `sk_pingxizhentaixinfa` 平西镇台心法（8 地中 · 内功）**（原创扩展）**

`expanded / sect:null / 平西王府武备`；阳；`meridians:[mer_dumai,mer_yangwei]`。门槛 `con:50,wil:46,apInner:48`，校尉军职传授或云南粮台缴获军册 `maxLayer:8`；不要求效忠吴三桂本人。贡献 `{mpMaxPct:29,hpMaxPct:18,attrs:{con:8,wil:4},mpRegen:2.4}`，`29+18+24+12=83`。

- 镇台持息 `mv_pingxizhentaixinfa_chixi`（L1，自身，7% / cd2 / 1000，`bf_wenzhong`2）。
- 守备不移 `mv_pingxizhentaixinfa_shoubei`（L7 绝招，**原创扩展**）：自身与相邻军伍 `bf_shoushi`2；`projection:false; projectionSpreadSteps:[self,self,self]`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_pingxizhentaixinfa_shoubei}`。

### 4.2 `sk_pingxixingqijue` 平西行气诀（7 地下 · 内功）**（原创扩展）**

`expanded / sect:null / 平西王府武备`；阳；`meridians:[mer_renmai,mer_yinwei]`。门槛 `con:40,wil:36,apInner:38`；军阵护卫岗位或反三藩支线缴获；前置 `sk_pingxituna` 5 重。贡献 `{mpMaxPct:25,hpMaxPct:13,attrs:{con:7,wil:3},mpRegen:2.8}`，`25+13+20+14=72`。

- 连阵行气 `mv_pingxixingqijue_lianzhen`（L7 绝招，**原创扩展**）：自身 `bf_wenzhong`3，相邻友方1；`projection:false; projectionSpreadSteps:[self,self,self]`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_pingxixingqijue_lianzhen}`。

## 5. 神龙舰队（与 `skills-kangxi` 同属 `sect_shenlongjiao` 体系）

### 5.1 `sk_shenlonghaichaojing` 神龙海潮经（8 地中 · 内功）**（原创扩展）**

`expanded / sect_shenlongjiao / 舰队旗主`；阳；`meridians:[mer_dumai,mer_yangwei]`。门槛 `con:48,agi:45,apInner:48`，神龙教 L4 或救俘 / 夺旗奇遇获舰队抄本 `maxLayer:8`，前置神龙蛇步 5 重；不属教主独占。贡献 `{mpMaxPct:30,hpMaxPct:15,attrs:{con:7,agi:5},mpRegen:2.8}`，`30+15+24+14=83`。

- 随浪吐息 `mv_shenlonghaichaojing_suilang`（L1，自身，7% / cd2 / 1000，甲板位移抗性）。
- 镇舟 `mv_shenlonghaichaojing_zhenzhou`（L7 绝招，**原创扩展**）：自身与相邻友方 `bf_wenzhong`2；`projection:false; projectionSpreadSteps:[self,self,self]`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_shenlonghaichaojing_zhenzhou}`。

### 5.2 `sk_shenlongfanzhougong` 神龙泛舟功（7 地下 · 内功）**（原创扩展）**

`expanded / sect_shenlongjiao / 舰队教众`；调和；`meridians:[mer_chongmai,mer_daimai]`。门槛 `con:38,agi:40,apInner:38`；神龙教 L3 舰队岗位传授，前置神龙蛇步 4 重。贡献 `{mpMaxPct:26,hpMaxPct:12,attrs:{con:5,agi:5},mpRegen:2.8}`，`26+12+20+14=72`。

- 定浪 `mv_shenlongfanzhougong_dinglang`（L7 绝招，**原创扩展**）：自身护体16%并忽略一次甲板滑移；`projection:false; projectionSpreadSteps:[self,self,self]`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_shenlongfanzhougong_dinglang}`。

## 6. 台湾郑氏与冯锡范

郑氏海防武备与冯锡范“一剑无血”个人传承分开；二者都不冒充同源。冯锡范师承昆仑的细节仍**（待考）**，故只用 `lineage`，不写入 `sect_kunlun`。

### 6.1 `sk_yanpinghaifangxinfa` 延平海防心法（8 地中 · 内功）**（原创扩展）**

`expanded / sect:null / 台湾郑氏海防武备`；调和；`meridians:[mer_chongmai,mer_daimai]`。门槛 `con:48,wil:46,apInner:48`；郑氏将领 / 水师教头传授或通吃岛双印支线军册 `maxLayer:8`；玩家与郑氏武职人物均可学。贡献 `{mpMaxPct:30,hpMaxPct:16,attrs:{con:7,wil:5},mpRegen:2.6}`，`30+16+24+13=83`。

- 舱阵吐息 `mv_yanpinghaifangxinfa_tuxi`（L1，自身，7% / cd2 / 1000，`bf_wenzhong`2）。
- 镇舱 `mv_yanpinghaifangxinfa_zhencang`（L7 绝招，**原创扩展**）：自身与相邻友方 `bf_shoushi`2；`projection:false; projectionSpreadSteps:[self,self,self]`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_yanpinghaifangxinfa_zhencang}`。

路线叙事：镇舱由任脉气海起舱，经冲脉承力、带脉横束，再以足太阳定步、任脉收中，末由手少阳、手太阳归腕，表达甲板守位而非摄心行气。

| 路线叙事第三轮同步镜像 | 模板代号 | 段数 | 路线 CT | 收招合计 | 风险列表 / 总风险 |
|---|---|---:|---:|---:|---|
| `mfr_yanpinghaifangxinfa_zhencang` | 见文首索引 | 8 | `8×90=720` | `1200+720=1920 CT` | `[100,120,140,160,180,200,220,240]` / `1360` |

### 6.2 `sk_yanpingfanchaojue` 延平泛潮诀（7 地下 · 内功）**（原创扩展）**

`expanded / sect:null / 台湾郑氏海防武备`；调和；`meridians:[mer_chongmai,mer_yinwei]`。门槛 `con:38,wil:38,apInner:38`；郑氏护卫岗位或护送支线军册；前置任一郑氏剑术 4 重。贡献 `{mpMaxPct:25,hpMaxPct:13,attrs:{con:5,wil:5},mpRegen:2.8}`，`25+13+20+14=72`。

- 护驾泛潮 `mv_yanpingfanchaojue_hujia`（L7 绝招，**原创扩展**）：自身 `bf_shoushi`3；`projection:false; projectionSpreadSteps:[self,self,self]`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_yanpingfanchaojue_hujia}`。

### 6.3 `sk_yanpingzhenhaijian` 延平镇海剑（8 地中 · 兵器 / 剑）**（原创扩展）**

`expanded / sect:null / 台湾郑氏海防武备`；调和；`wOut/wIn:0.75/0.25`；`weaponReq:{category:sword}`。门槛 `agi:50,wil:45,apSword:50`；郑氏将领 / 水师教头或护送支线剑谱；玩家与护卫可学。`layerStats:{hit:[4,8],parry:[3,7]}` 合计15。

- 甲板截锋 `mv_yanpingzhenhaijian_jiafeng`（L1，单体近身，1.10，7% / cd1 / 1000）。
- 镇海截锋 `mv_yanpingzhenhaijian_jiefeng`（L7 绝招，**原创扩展**）：线3、2.45、击退1；普通兵刃非外放，`projection:false; projectionSpreadSteps:[line3,line3,line3]`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_yanpingzhenhaijian_jiefeng}`。

### 6.4 `sk_yijianxinfa` 一剑心法（8 地中 · 内功）**（原创扩展命名）**

`expanded / sect:null / 冯锡范个人传承`；阴；`meridians:[mer_renmai,mer_yinwei]`。门槛 `agi:52,wil:50,apInner:48`；默认由冯锡范遗谱奇遇 `maxLayer:8` 或击败后获其本人认可传授，是否允许师承线完整传授需作者确认。贡献 `{mpMaxPct:31,hpMaxPct:14,attrs:{agi:7,wil:5},mpRegen:2.8}`，`31+14+24+14=83`。

- 收藏 `mv_yijianxinfa_shoucang`（L7 绝招，**原创扩展**）：自身 `bf_shoushi`2，下一剑命中 +10；`projection:false; projectionSpreadSteps:[self,self,self]`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_yijianxinfa_shoucang}`。

### 6.5 `sk_yijianwuxue` 一剑无血（8 地中 · 兵器 / 剑）**（待考）**

原著人物绰号 / 剑术用名及师承细节须核《鹿鼎记》冯锡范相关段落**（待考）**；本文暂按个人剑术登记，不反推昆仑全派共有。`canonExpanded / sect:null / 冯锡范`；阴；`wOut/wIn:0.80/0.20`；剑；`agi:55,apSword:52`；遗谱奇遇或本人传授；`layerStats:{hit:[5,9],crit:[3,6]}` 合计15。

- 无血快剑 `mv_yijianwuxue_kuaijian`（L1，单体近身，1.15，7% / cd1 / 1000）。
- 一剑夺命 `mv_yijianwuxue_duoming`（L7 绝招，**原创扩展命名**）：单体2.85、`bf_polu`50%；普通兵刃非外放，`projection:false; projectionSpreadSteps:[single,single,single]`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_yijianwuxue_duoming}`。

## 7. 雅克萨守军（罗刹军伍体系）

### 7.1 `sk_luochazhenliecao` 罗刹阵列操（8 地中 · 内功）**（原创扩展）**

`expanded / sect:null / 雅克萨守军`；阳；`meridians:[mer_dumai,mer_yangwei]`。名称是对军队呼吸、站姿与队列训练的玩法归纳，不声称原著或史料存在同名内功。门槛 `con:50,wil:45,apInner:48`；停战交换后的训练札记奇遇或守军教官传授 `maxLayer:8`，不要求屠城。贡献 `{mpMaxPct:28,hpMaxPct:19,attrs:{con:8,wil:4},mpRegen:2.4}`，`28+19+24+12=83`。

- 阵列呼吸 `mv_luochazhenliecao_huxi`（L1，自身，7% / cd2 / 1000，`bf_wenzhong`2）。
- 横队固守 `mv_luochazhenliecao_hengdui`（L7 绝招，**原创扩展**）：自身与相邻同阵营 `bf_shoushi`2；`projection:false; projectionSpreadSteps:[self,self,self]`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_luochazhenliecao_hengdui}`。

### 7.2 `sk_luochabujunhuxi` 罗刹步军呼吸（7 地下 · 内功）**（原创扩展）**

`expanded / sect:null / 雅克萨守军`；调和；`meridians:[mer_renmai,mer_yinqiao]`。门槛 `con:40,wil:36,apInner:38`；守军教官或止战支线训练札记。贡献 `{mpMaxPct:24,hpMaxPct:14,attrs:{con:6,wil:4},mpRegen:2.8}`，`24+14+20+14=72`。

- 据守呼吸 `mv_luochabujunhuxi_jushou`（L7 绝招，**原创扩展**）：自身护体16%；`projection:false; projectionSpreadSteps:[self,self,self]`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_luochabujunhuxi_jushou}`。

### 7.3 `sk_luochaciqiangshu` 罗刹刺枪术（8 地中 · 兵器 / 枪）**（原创扩展）**

`expanded / sect:null / 雅克萨守军`；阳；`wOut/wIn:0.90/0.10`；`weaponReq:{category:spear}`。门槛 `str:50,con:46,apSpear:50`；止战支线训练札记或守军教官；`layerStats:{hit:[4,8],pierce:[3,7]}` 合计15。它是本土步军兵刃武艺，不把火铳或弹药当内劲外放。

- 列队刺击 `mv_luochaciqiangshu_ciji`（L1，线2，1.05，7% / cd1 / 1000）。
- 刺枪突进 `mv_luochaciqiangshu_tujin`（L7 绝招，**原创扩展**）：线3、2.45、突进1；`projection:false; projectionSpreadSteps:[line3,line3,line3]`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_luochaciqiangshu_tujin}`。

## 8. 海大富个人传承

### 8.1 `sk_haidafuhuagujing` 海大富化骨经（9 地上 · 内功）**（原创扩展命名）**

| 字段 | 值 |
|---|---|
| 依据 / 边界 | 海大富与化骨绵掌、大慈大悲千叶手的关系见既有图鉴；原著是否存在对应具名内功无把握，故名称、运功层次与机制均为**（原创扩展）**，不再以易筋经冒充其主运 |
| 归属 / 性质 | `expanded / sect:null / 海大富个人传承`；阴；`wOut/wIn:0/1`；`meridians:[mer_renmai,mer_yinwei]` |
| reqs / 习得 | `wil:58,con:52,apInner:55`；仅限海大富秘密传授或宫中遗谱奇遇，默认不由普通清宫职级开放，需作者确认 |
| contribution | `{mpMaxPct:35,hpMaxPct:18,attrs:{wil:8,con:6},mpRegen:2.7}`；`35+18+2×14+5×2.7=94.5` |
| 层数 / 特性 | 1 伏脉、4 藏劲、7 绝招伏脉护身、9 绝招藏劲归息；`setTags:[]`；`observable:false` |

- 伏脉运息 `mv_haidafuhuagujing_yunxi`（L1，自身，8% / cd2 / 1000，驱散自身 `injury` 1）。
- 伏脉护身 `mv_haidafuhuagujing_fumai`（L7 绝招，**原创扩展**）：自身护体18%；`projection:false; projectionSpreadSteps:[self,self,self]`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_haidafuhuagujing_fumai}`。
- 藏劲归息 `mv_haidafuhuagujing_cangjin`（L9 绝招，**原创扩展**）：自身护体21.6%，并清迟滞1级；`projection:false; projectionSpreadSteps:[self,self,self]`；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_haidafuhuagujing_cangjin}`。

习得前置：`sk_huagumianzhang` 化骨绵掌 6 重。

## 9. 内功调息档案

全部取 `design/21` §10.2 通用公式，`ct=1000`、`mpCostBp=0`、`outOfBattleScaleBp=15000`；地阶 `scope=3`。护体档位高 / 中分别指地上 / 地中地下检索档，实际抵消仍由 21 计算。

| 内功 | 调息档案 | `BreathProfile` | 10 重 `reliefBp / repairUnits` | 护体内劲档位 |
|---|---|---|---|---|
| `sk_aobaihengliangong` | `txp_aobaihengliangong` | `{grade:8,layer:10,nature:yang,scope:3,ct:1000,mpCostBp:0,outOfBattleScaleBp:15000}` | `2100 / 492` | `guard:yang-mid`，`reflectBp:0` |
| `sk_bukuhutiaogong` | `txp_bukuhutiaogong` | `{grade:7,layer:10,nature:yang,scope:3,ct:1000,mpCostBp:0,outOfBattleScaleBp:15000}` | `2000 / 468` | `guard:yang-mid`，`reflectBp:0` |
| `sk_sangjiehufagong` | `txp_sangjiehufagong` | `{grade:8,layer:10,nature:yang,scope:3,ct:1000,mpCostBp:0,outOfBattleScaleBp:15000}` | `2100 / 492` | `guard:yang-mid`，`reflectBp:0` |
| `sk_fansenghutigong` | `txp_fansenghutigong` | `{grade:7,layer:10,nature:yang,scope:3,ct:1000,mpCostBp:0,outOfBattleScaleBp:15000}` | `2000 / 468` | `guard:yang-mid`，`reflectBp:0` |
| `sk_wangwuzhenshanxinfa` | `txp_wangwuzhenshanxinfa` | `{grade:8,layer:10,nature:harmony,scope:3,ct:1000,mpCostBp:0,outOfBattleScaleBp:15000}` | `2205 / 516` | `guard:harmony-mid`，`reflectBp:0` |
| `sk_wangwuhushangong` | `txp_wangwuhushangong` | `{grade:7,layer:10,nature:yang,scope:3,ct:1000,mpCostBp:0,outOfBattleScaleBp:15000}` | `2000 / 468` | `guard:yang-mid`，`reflectBp:0` |
| `sk_pingxizhentaixinfa` | `txp_pingxizhentaixinfa` | `{grade:8,layer:10,nature:yang,scope:3,ct:1000,mpCostBp:0,outOfBattleScaleBp:15000}` | `2100 / 492` | `guard:yang-mid`，`reflectBp:0` |
| `sk_pingxixingqijue` | `txp_pingxixingqijue` | `{grade:7,layer:10,nature:yang,scope:3,ct:1000,mpCostBp:0,outOfBattleScaleBp:15000}` | `2000 / 468` | `guard:yang-mid`，`reflectBp:0` |
| `sk_shenlonghaichaojing` | `txp_shenlonghaichaojing` | `{grade:8,layer:10,nature:yang,scope:3,ct:1000,mpCostBp:0,outOfBattleScaleBp:15000}` | `2100 / 492` | `guard:yang-mid`，`reflectBp:0` |
| `sk_shenlongfanzhougong` | `txp_shenlongfanzhougong` | `{grade:7,layer:10,nature:harmony,scope:3,ct:1000,mpCostBp:0,outOfBattleScaleBp:15000}` | `2100 / 492` | `guard:harmony-mid`，`reflectBp:0` |
| `sk_yanpinghaifangxinfa` | `txp_yanpinghaifangxinfa` | `{grade:8,layer:10,nature:harmony,scope:3,ct:1000,mpCostBp:0,outOfBattleScaleBp:15000}` | `2205 / 516` | `guard:harmony-mid`，`reflectBp:0` |
| `sk_yanpingfanchaojue` | `txp_yanpingfanchaojue` | `{grade:7,layer:10,nature:harmony,scope:3,ct:1000,mpCostBp:0,outOfBattleScaleBp:15000}` | `2100 / 492` | `guard:harmony-mid`，`reflectBp:0` |
| `sk_yijianxinfa` | `txp_yijianxinfa` | `{grade:8,layer:10,nature:yin,scope:3,ct:1000,mpCostBp:0,outOfBattleScaleBp:15000}` | `2100 / 492` | `guard:yin-mid`，`reflectBp:0` |
| `sk_luochazhenliecao` | `txp_luochazhenliecao` | `{grade:8,layer:10,nature:yang,scope:3,ct:1000,mpCostBp:0,outOfBattleScaleBp:15000}` | `2100 / 492` | `guard:yang-mid`，`reflectBp:0` |
| `sk_luochabujunhuxi` | `txp_luochabujunhuxi` | `{grade:7,layer:10,nature:harmony,scope:3,ct:1000,mpCostBp:0,outOfBattleScaleBp:15000}` | `2100 / 492` | `guard:harmony-mid`，`reflectBp:0` |
| `sk_haidafuhuagujing` | `txp_haidafuhuagujing` | `{grade:9,layer:10,nature:yin,scope:3,ct:1000,mpCostBp:0,outOfBattleScaleBp:15000}` | `2200 / 516` | `guard:yin-high`，`reflectBp:0` |

## 10. 外放候选审计表

| 武学 / 招式组 | 判定 | `projectionSpreadSteps` | 理由 |
|---|---|---|---|
| 本册 16 门内功招式 | 否 | `[self,self,self]` | 调息 / 护体只作用自身或相邻支援，不是离体伤害 |
| 布库横摔 | 否 | `[single,single,single]` | 接触擒拿 |
| 王屋当关剑、延平镇海剑、一剑无血 | 否 | 基础范围三项相同 | 普通兵刃挥击，不以剑气伤敌 |
| 罗刹刺枪术 | 否 | `[line3,line3,line3]` | 枪身实体刺击；不是火器，也不是内劲外放 |
| `sk_luochahuoqi`（引用） | 否 | 由原图鉴 / 装备定义 | 火铳弹丸属于实体弹药，按 21 §4.4.1 不算外放 |

结论：本册外放招式 **0**；无需手部端点白名单复核。

## 11. 统计表

| 门类 | 地上 | 地中 | 地下 | 合计 | 绝招 | 外放招式 |
|---|---:|---:|---:|---:|---:|---:|
| 内功 | 1 | 8 | 7 | 16 | 17 | 0 |
| 拳脚 / 擒拿 | 0 | 2 | 0 | 2 | 2 | 0 |
| 兵器 | 0 | 4 | 0 | 4 | 4 | 0 |
| **总计** | **1** | **14** | **7** | **22** | **23** | **0** |

绝招数算式：地上 `1×2=2`；14 门地中均按裁定判据下限 `14×1=14`；地下 `7×1=7`；总计 `2+14+7=23`。

## 12. 本文新增术语与 ID

| 类型 | ID / 术语 | 含义 |
|---|---|---|
| 武学 | `sk_aobaihengliangong`、`sk_bukuhengshuai`、`sk_bukuhutiaogong` | 鳌拜与清宫布库高阶补录 |
| 武学 | `sk_sangjiehufagong`、`sk_fansenghutigong` | 鹿鼎时期桑结一系主运补录 |
| 武学 | `sk_xueyuhufashou` | 桑结 / 番僧的地中护法掌补录 |
| 武学 | `sk_wangwuzhenshanxinfa`、`sk_wangwuhushangong`、`sk_wangwudangguanjian` | 王屋派首领 / 精英补录 |
| 武学 | `sk_pingxizhentaixinfa`、`sk_pingxixingqijue` | 平西军首领 / 护卫补录 |
| 武学 | `sk_shenlonghaichaojing`、`sk_shenlongfanzhougong` | 神龙舰队旗主 / 教众补录 |
| 武学 | `sk_yanpinghaifangxinfa`、`sk_yanpingfanchaojue`、`sk_yanpingzhenhaijian` | 台湾郑氏海防武备补录 |
| 武学 | `sk_yijianxinfa`、`sk_yijianwuxue` | 冯锡范个人传承补录 |
| 武学 | `sk_luochazhenliecao`、`sk_luochabujunhuxi`、`sk_luochaciqiangshu` | 雅克萨守军训练补录 |
| 武学 | `sk_haidafuhuagujing` | 海大富个人心法补录 |
| 调息 | `txp_aobaihengliangong`、`txp_bukuhutiaogong`、`txp_sangjiehufagong`、`txp_fansenghutigong` | 清宫与密宗补录内功的调息档案 |
| 调息 | `txp_wangwuzhenshanxinfa`、`txp_wangwuhushangong`、`txp_pingxizhentaixinfa`、`txp_pingxixingqijue` | 王屋与平西补录内功的调息档案 |
| 调息 | `txp_shenlonghaichaojing`、`txp_shenlongfanzhougong`、`txp_yanpinghaifangxinfa`、`txp_yanpingfanchaojue` | 神龙舰队与郑氏补录内功的调息档案 |
| 调息 | `txp_yijianxinfa`、`txp_luochazhenliecao`、`txp_luochabujunhuxi`、`txp_haidafuhuagujing` | 冯锡范、雅克萨与海大富补录内功的调息档案 |
| 招式 / 路线 | §0.1 所列 `mv_*`、`mfr_*` | 23 记绝招与逐招显式路线；普通招 ID 见各卡 |

## 13. 数据校验规则与测试用例

1. 22 门新武学全部 `sourceChapters:[ch08_luding]`；每门品阶与 §11 统计一致。
2. 地中 14 门各 1 绝招，地下 7 门各 1，地上 1 门 2 招；解锁层为 7 / 9，资源均为气势100、地阶耗内9%、收招1200。
3. 23 条绝招路线均为不同穴位有序元组；同门双路线仅海大富一门，共享穴位 `0/8=0%≤50%`。
4. 路线 `1200+8×90=1920≤2000`；穴位、CT、风险与用途须通过图鉴严格检查。
5. 16 门内功各有唯一 `txp_*`，且显式含 `outOfBattleScaleBp=15000`；22 门均逐招审计外放。

## 14. 待决事项 / 依赖

### 14.1 替下游给出的建议值

- 无。本册没有修改 `design/05`、`design/21` 的全局预算或公式。

### 14.2 本文依赖的上游事实

- 依赖 `skills-kangxi` 的门派基础链、`skills-xiaoyao` 的密宗通传，以及 `design/17` 的组织职级；本册只在其上补高阶来源。

### 14.3 对基准的修改提案

- 无。新增武学属于图鉴内容实例，不改变基准规则。

### 14.4 原著考据待办

- 核对冯锡范“一剑无血”的用名、剑术表现与昆仑师承；核对鳌拜横练、海大富内功是否有原著具名。未核定前均按本文标注，不写成原著招名。

### 14.5 开放问题（附默认值）

- 海大富个人心法是否可完整传授：默认仅秘密传授 / 遗谱奇遇，不随清宫职级普遍开放。
- 冯锡范个人传承是否并入昆仑派：默认不并入，待考据后再决定来源扩展。
