# 门派武学图鉴补录 · 飞狐外传（`skills-bulu-13-feihu`）

> **归属（基准 §18）**：`design/catalog/skills-*.md` 的《飞狐外传》按书补录册；只定义本轮首领 / 精英缺口所需武学与学习来源，不改写既有 11 册图鉴。
> **覆盖声明**：本册覆盖苗家、胡家、商家堡、天龙门、药王门、南海五虎来源、掌门大会会武融汇与八极拳支系；均与 `skills-qianlong` 的对应门派体系共用前置，主角及其他人物可循门派传授、秘籍或奇遇习得。
> **上游**：`docs/decisions/author-requirements.md` AR-14～AR-16、`docs/00-canon.md`、`docs/decisions/rulings-v1.md`、`docs/decisions/ultimate-counts-tianzhong-dizhong.md`、`design/05`、`design/15`、`design/17`、`design/21` 与 `design/chapters/13-feihu.md`。
> **引用而不重定义**：字段、预算与习得规则见 `design/05`；穴位事实见 `design/15`；路线、调息、护体内劲、外放与首领主运见 `design/21`；门派组织见 `design/17`；既有同门基础武学见 `skills-qianlong`。
> **标注约定**：**（原创扩展）**为原著没有的武学、招名或机制；**（待考）**须按三联 / 广州修订版逐字核对；**【建议值】**为待唯一归属文档确认的数值。
> **版本**：首领武学补录与替补替换（2026-09-28）；经脉落地终审（2026-09-29）；路线叙事第三轮（2026-09-29）；阴阳性质落地 AR-18（2026-09-29）。

---

## 0. 阅读指引与统一记法

### 绝招显式路线索引（镜像正文卡，非覆写层；2026-09-28）

本索引只镜像正文卡的最终绝招。每条路线按“出招方式定末端、性质定经脉族、门派定核心脉”配路；同门多绝招共享穴位不超过较短路线 50%，也不使用轮换或逆序。

<!-- skill-catalog-audit:start -->
| 品阶 | 武学 | MoveDef（正文卡镜像） | 路线 ID | steps（acupointRef/segmentCt/riskBp） |
|---|---|---|---|---|
| 9 地上 | `sk_miaojiaxuangong` | `mv_miaojiaxuangong_jinmian` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_miaojiaxuangong_jinmian}` | `mfr_miaojiaxuangong_jinmian` | `MeridianRouteDef{moveRef:mv_miaojiaxuangong_jinmian; ultimate:true; purpose:defense; requiredNature:[harmony]}`；`ap_chongmai_qixue/90/100→ap_chongmai_huangshu/90/120→ap_renmai_qihai/90/150→ap_renmai_danzhong/90/180→ap_shoujueyin_tianchi/90/240→ap_shoujueyin_quze/90/180→ap_shoujueyin_neiguan/90/140→ap_shoujueyin_laogong/90/120` |
| 9 地上 | `sk_miaojiaxuangong` | `mv_miaojiaxuangong_kongming` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_miaojiaxuangong_kongming}` | `mfr_miaojiaxuangong_kongming` | `MeridianRouteDef{moveRef:mv_miaojiaxuangong_kongming; ultimate:true; purpose:defense; requiredNature:[harmony]}`；`ap_daimai_zulinqi/90/100→ap_daimai_weidao/90/120→ap_daimai_daimai/90/160→ap_dumai_mingmen/90/220→ap_dumai_shendao/90/190→ap_shoushaoyin_jiquan/90/240→ap_shoushaoyin_shenmen/90/150→ap_shoushaoyin_shaochong/90/110` |
| 9 地上 | `sk_hujiaxuangong` | `mv_hujiaxuangong_xueye` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_hujiaxuangong_xueye}` | `mfr_hujiaxuangong_xueye` | `MeridianRouteDef{moveRef:mv_hujiaxuangong_xueye; ultimate:true; purpose:defense; requiredNature:[yang,harmony]}`；`ap_dumai_changqiang/90/100→ap_dumai_yaoshu/90/120→ap_dumai_yaoyangguan/90/150→ap_dumai_mingmen/90/190→ap_dumai_zhiyang/90/210→ap_dumai_shendao/90/230→ap_shoutaiyang_yanggu/90/160→ap_shoutaiyang_wangu/90/120` |
| 9 地上 | `sk_hujiaxuangong` | `mv_hujiaxuangong_guanshan` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_hujiaxuangong_guanshan}` | `mfr_hujiaxuangong_guanshan` | `MeridianRouteDef{moveRef:mv_hujiaxuangong_guanshan; ultimate:true; purpose:defense; requiredNature:[yang,harmony]}`；`ap_yangqiao_fuyang/90/100→ap_yangqiao_shenmai/90/120→ap_yangwei_jinmen/90/150→ap_yangwei_yangjiao/90/180→ap_chongmai_qichong/90/220→ap_dumai_baihui/90/200→ap_shoushaoyang_waiguan/90/160→ap_shoushaoyang_yangchi/90/120` |
| 7 地下 | `sk_shangjiabaoqi` | `mv_shangjiabaoqi_tieting` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_shangjiabaoqi_tieting}` | `mfr_shangjiabaoqi_tieting` | `MeridianRouteDef{moveRef:mv_shangjiabaoqi_tieting; ultimate:true; purpose:defense; requiredNature:[yang,harmony]}`；`ap_zuyangming_zusanli/90/100→ap_zuyangming_fenglong/90/120→ap_zuyangming_tianshu/90/160→ap_renmai_zhongwan/90/210→ap_dumai_jizhong/90/250→ap_shouyangming_quchi/90/200→ap_shouyangming_shousanli/90/150→ap_shouyangming_hegu/90/110` |
| 7 地下 | `sk_nanhaiwuhuxinfa` | `mv_nanhaiwuhuxinfa_guichao` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_nanhaiwuhuxinfa_guichao}` | `mfr_nanhaiwuhuxinfa_guichao` | `MeridianRouteDef{moveRef:mv_nanhaiwuhuxinfa_guichao; ultimate:true; purpose:defense; requiredNature:[yang,harmony]}`；`ap_zushaoyang_fengshi/90/100→ap_zushaoyang_yanglingquan/90/130→ap_yangqiao_pucan/90/180→ap_yinwei_daheng/90/210→ap_renmai_danzhong/90/240→ap_shoushaoyang_waiguan/90/200→ap_shoushaoyang_yangchi/90/150→ap_shoushaoyang_guanchong/90/110` |
| 7 地下 | `sk_huiwuguixin` | `mv_huiwuguixin_baimen` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_huiwuguixin_baimen}` | `mfr_huiwuguixin_baimen` | `MeridianRouteDef{moveRef:mv_huiwuguixin_baimen; ultimate:true; purpose:defense; requiredNature:[yin,harmony]}`；`ap_chongmai_henggu/90/100→ap_chongmai_qixue/90/130→ap_chongmai_huangshu/90/160→ap_chongmai_shiguan/90/200→ap_renmai_zhongwan/90/230→ap_shoujueyin_jianshi/90/190→ap_shoujueyin_daling/90/150→ap_shoujueyin_laogong/90/120` |
| 7 地下 | `sk_tianlongmenxinfa` | `mv_tianlongmenxinfa_hezong` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_tianlongmenxinfa_hezong}` | `mfr_tianlongmenxinfa_hezong` | `MeridianRouteDef{moveRef:mv_tianlongmenxinfa_hezong; ultimate:true; purpose:defense; requiredNature:[harmony]}`；`ap_dumai_changqiang/90/100→ap_dumai_yaoshu/90/130→ap_dumai_jizhong/90/180→ap_dumai_shenzhu/90/230→ap_shoushaoyang_tianjing/90/220→ap_shoushaoyang_waiguan/90/180→ap_shoushaoyang_yangchi/90/140→ap_shoushaoyang_guanchong/90/100` |
| 7 地下 | `sk_yaowangneigong` | `mv_yaowangneigong_baicao` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_yaowangneigong_baicao}` | `mfr_yaowangneigong_baicao` | `MeridianRouteDef{moveRef:mv_yaowangneigong_baicao; ultimate:true; purpose:defense; requiredNature:[yin,harmony]}`；`ap_zutaiyin_yinbai/90/100→ap_zutaiyin_taibai/90/120→ap_zutaiyin_gongsun/90/150→ap_zutaiyin_yinlingquan/90/190→ap_renmai_shuifen/90/230→ap_shoujueyin_ximen/90/200→ap_shoujueyin_neiguan/90/160→ap_shoujueyin_laogong/90/120` |
| 7 地下 | `sk_tianlonghezongjian` | `mv_tianlonghezongjian_shouguan` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_tianlonghezongjian_shouguan}` | `mfr_tianlonghezongjian_shouguan` | `MeridianRouteDef{moveRef:mv_tianlonghezongjian_shouguan; ultimate:true; purpose:attack}`；`ap_zujueyin_dadun/90/100→ap_zujueyin_xingjian/90/130→ap_zujueyin_ququan/90/170→ap_yinwei_zhubin/90/210→ap_yinwei_qimen/90/230→ap_shoujueyin_tianquan/90/190→ap_shoushaoyang_waiguan/90/150→ap_shoushaoyang_yangchi/90/110` |
| 7 地下 | `sk_tianlongzhengdao` | `mv_tianlongzhengdao_guifeng` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_tianlongzhengdao_guifeng}` | `mfr_tianlongzhengdao_guifeng` | `MeridianRouteDef{moveRef:mv_tianlongzhengdao_guifeng; ultimate:true; purpose:attack}`；`ap_zuyangming_fenglong/100/100→ap_dumai_zhiyang/100/170→ap_yangwei_jianjing/100/230→ap_shoutaiyang_xiaohai/100/200→ap_shoutaiyang_yanggu/100/150→ap_shoutaiyang_wangu/100/110` |
| 7 地下 | `sk_miaojiazhang` | `mv_miaojiazhang_huimian` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_miaojiazhang_huimian}` | `mfr_miaojiazhang_huimian` | `MeridianRouteDef{moveRef:mv_miaojiazhang_huimian; ultimate:true; purpose:attack}`；`ap_chongmai_henggu/90/100→ap_chongmai_dahe/90/130→ap_chongmai_huangshu/90/170→ap_renmai_qihai/90/210→ap_shoujueyin_tianquan/90/230→ap_shouyangming_quchi/90/190→ap_shoujueyin_neiguan/90/150→ap_shoujueyin_laogong/90/110` |
| 6 玄上 | `sk_wuhudaofa` | `mv_wuhudaofa_suoguan` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_wuhudaofa_suoguan}` | `mfr_wuhudaofa_suoguan` | `MeridianRouteDef{moveRef:mv_wuhudaofa_suoguan; ultimate:true; purpose:attack}`；`ap_zuyangming_zusanli/100/100→ap_zuyangming_liangqiu/100/140→ap_yangwei_jianjing/100/220→ap_shoushaoyang_tianjing/100/210→ap_shoushaoyang_waiguan/100/170→ap_shoushaoyang_yangchi/100/120` |
| 6 玄上 | `sk_fengjiawuhuquan` | `mv_fengjiawuhuquan_heshi` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_fengjiawuhuquan_heshi}` | `mfr_fengjiawuhuquan_heshi` | `MeridianRouteDef{moveRef:mv_fengjiawuhuquan_heshi; ultimate:true; purpose:attack}`；`ap_zuyangming_zusanli/100/100→ap_zushaoyang_yanglingquan/100/180→ap_yangwei_jianjing/100/230→ap_shouyangming_quchi/100/200→ap_shoujueyin_daling/100/150→ap_shouyangming_hegu/100/110` |
| 6 玄上 | `sk_yaowanghushoufa` | `mv_yaowanghushoufa_fengmen` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_yaowanghushoufa_fengmen}` | `mfr_yaowanghushoufa_fengmen` | `MeridianRouteDef{moveRef:mv_yaowanghushoufa_fengmen; ultimate:true; purpose:attack}`；`ap_zutaiyin_diji/100/100→ap_zutaiyin_yinlingquan/100/150→ap_shoujueyin_quze/100/220→ap_shoujueyin_ximen/100/200→ap_shouyangming_quchi/100/170→ap_shouyangming_hegu/100/120` |
<!-- skill-catalog-audit:end -->

#### 天 / 地阶普通招式显式路线（只在此定义）

| 武学 / 性质 | moveRef | 路线 ID | MeridianRouteDef | steps（acupointRef/segmentCt/riskBp） | 配路说明 |
|---|---|---|---|---|---|
| `sk_miaojiaxuangong` / 和 | `mv_miaojiaxuangong_shouzheng` | `mfr_miaojiaxuangong_shouzheng` | `moveRef:mv_miaojiaxuangong_shouzheng; ultimate:false; purpose:defense; requiredNature:[harmony]` | `ap_chongmai_dahe/80/80→ap_chongmai_qixue/80/100→ap_renmai_guanyuan/80/140→ap_renmai_danzhong/80/160→ap_shoujueyin_neiguan/80/120` | 苗家调和底子由冲脉承接任脉，收于内关护中 |
| `sk_hujiaxuangong` / 阳 | `mv_hujiaxuangong_cangfeng` | `mfr_hujiaxuangong_cangfeng` | `moveRef:mv_hujiaxuangong_cangfeng; ultimate:false; purpose:defense; requiredNature:[yang,harmony]` | `ap_dumai_yaoshu/80/80→ap_dumai_mingmen/80/120→ap_dumai_zhiyang/80/160→ap_shoutaiyang_yanggu/80/140→ap_shoutaiyang_wangu/80/100` | 督脉蓄劲后转持刀腕穴，表达藏刀守势 |
| `sk_shangjiabaoqi` / 阳 | `mv_shangjiabaoqi_shoubao` | `mfr_shangjiabaoqi_shoubao` | `moveRef:mv_shangjiabaoqi_shoubao; ultimate:false; purpose:defense; requiredNature:[yang,harmony]` | `ap_zuyangming_fenglong/80/80→ap_zuyangming_tianshu/80/120→ap_dumai_jizhong/80/160→ap_shouyangming_quchi/80/140→ap_shouyangming_hegu/80/100` | 足阳明立稳、督脉提气，再以手阳明护门 |
| `sk_nanhaiwuhuxinfa` / 阳 | `mv_nanhaiwuhuxinfa_nachao` | `mfr_nanhaiwuhuxinfa_nachao` | `moveRef:mv_nanhaiwuhuxinfa_nachao; ultimate:false; purpose:defense; requiredNature:[yang,harmony]` | `ap_zushaoyang_guangming/80/80→ap_zushaoyang_yanglingquan/80/120→ap_dumai_mingmen/80/170→ap_shoushaoyang_waiguan/80/140→ap_shoushaoyang_yangchi/80/100` | 少阳起落接督脉命门调息，再归持刀腕穴 |
| `sk_huiwuguixin` / 阴 | `mv_huiwuguixin_dingxin` | `mfr_huiwuguixin_dingxin` | `moveRef:mv_huiwuguixin_dingxin; ultimate:false; purpose:defense; requiredNature:[yin,harmony]` | `ap_chongmai_henggu/80/80→ap_chongmai_qichong/80/120→ap_chongmai_shiguan/80/150→ap_renmai_zhongwan/80/140→ap_shoujueyin_daling/80/100` | 冲脉汇合多门运劲，任脉守中，收于大陵定心 |
| `sk_tianlongmenxinfa` / 和 | `mv_tianlongmenxinfa_nanbei` | `mfr_tianlongmenxinfa_nanbei` | `moveRef:mv_tianlongmenxinfa_nanbei; ultimate:false; purpose:defense; requiredNature:[harmony]` | `ap_chongmai_qichong/80/80→ap_chongmai_shangqu/80/120→ap_dumai_jizhong/80/160→ap_shoushaoyang_waiguan/80/140→ap_shoushaoyang_yangchi/80/100` | 冲脉承南北两宗，督脉提劲并归兵器腕穴 |
| `sk_yaowangneigong` / 阴 | `mv_yaowangneigong_bianxi` | `mfr_yaowangneigong_bianxi` | `moveRef:mv_yaowangneigong_bianxi; ultimate:false; purpose:defense; requiredNature:[yin,harmony]` | `ap_zutaiyin_yinbai/80/80→ap_zutaiyin_taibai/80/100→ap_zutaiyin_gongsun/80/130→ap_renmai_shuifen/80/160→ap_shoujueyin_neiguan/80/120` | 足太阴辨息接任脉，再归内关护息 |
| `sk_tianlongzhengdao` / 阳 | `mv_tianlongzhengdao_zhengmen` | `mfr_tianlongzhengdao_zhengmen` | `moveRef:mv_tianlongzhengdao_zhengmen; ultimate:false; purpose:attack` | `ap_zuyangming_zusanli/80/80→ap_dumai_mingmen/80/120→ap_dumai_shenzhu/80/160→ap_shoutaiyang_yanglao/80/140→ap_shoutaiyang_wangu/80/100` | 足阳明立势、督脉催刀，经养老收于持刀腕穴 |
| `sk_tianlongzhengdao` / 阳 | `mv_tianlongzhengdao_jiedao` | `mfr_tianlongzhengdao_jiedao` | `moveRef:mv_tianlongzhengdao_jiedao; ultimate:false; purpose:attack` | `ap_zushaoyang_yanglingquan/80/80→ap_dumai_zhiyang/80/120→ap_shoushaoyang_tianjing/80/160→ap_shoushaoyang_waiguan/80/140→ap_shoushaoyang_yangchi/80/100` | 少阳转督脉截势，再循手少阳落腕 |
| `sk_tianlongzhengdao` / 阳 | `mv_tianlongzhengdao_nanbei` | `mfr_tianlongzhengdao_nanbei` | `moveRef:mv_tianlongzhengdao_nanbei; ultimate:false; purpose:attack` | `ap_chongmai_qichong/80/80→ap_dumai_jizhong/80/120→ap_yangwei_jianjing/80/160→ap_shoujueyin_jianshi/80/140→ap_shouyangming_hegu/80/100` | 冲督合力表达南北回锋，由间使承接至合谷控刀 |
| `sk_tianlonghezongjian` / 和 | `mv_tianlonghezongjian_dianjian` | `mfr_tianlonghezongjian_dianjian` | `moveRef:mv_tianlonghezongjian_dianjian; ultimate:false; purpose:attack` | `ap_zujueyin_taichong/80/80→ap_yinwei_qimen/80/120→ap_renmai_danzhong/80/160→ap_shoujueyin_neiguan/80/140→ap_shoutaiyang_yanggu/80/100` | 足厥阴接阴维、任脉，由内关承接至阳谷点剑 |
| `sk_tianlonghezongjian` / 和 | `mv_tianlonghezongjian_jiefeng` | `mfr_tianlonghezongjian_jiefeng` | `moveRef:mv_tianlonghezongjian_jiefeng; ultimate:false; purpose:attack` | `ap_zujueyin_ligou/80/80→ap_zujueyin_zhongfeng/80/120→ap_yinwei_daheng/80/160→ap_shoujueyin_quze/80/140→ap_shoutaiyang_wangu/80/100` | 厥阴承接阴维后由曲泽过腕骨，以持剑腕穴接锋 |
| `sk_tianlonghezongjian` / 和 | `mv_tianlonghezongjian_hengjian` | `mfr_tianlonghezongjian_hengjian` | `moveRef:mv_tianlonghezongjian_hengjian; ultimate:false; purpose:attack` | `ap_chongmai_henggu/80/80→ap_chongmai_huangshu/80/120→ap_renmai_zhongwan/80/160→ap_shoutaiyang_yanggu/80/140→ap_shoutaiyang_wangu/80/100` | 冲任运劲后归手太阳腕穴横剑守关 |
| `sk_miaojiazhang` / 和 | `mv_miaojiazhang_tuizhang` | `mfr_miaojiazhang_tuizhang` | `moveRef:mv_miaojiazhang_tuizhang; ultimate:false; purpose:attack` | `ap_chongmai_qichong/80/80→ap_chongmai_shangqu/80/120→ap_renmai_guanyuan/80/160→ap_shoujueyin_neiguan/80/140→ap_shoujueyin_laogong/80/100` | 冲任守正，再由内关贯至劳宫推出正门掌 |
| `sk_miaojiazhang` / 和 | `mv_miaojiazhang_jiewan` | `mfr_miaojiazhang_jiewan` | `moveRef:mv_miaojiazhang_jiewan; ultimate:false; purpose:attack` | `ap_chongmai_henggu/80/80→ap_renmai_guanyuan/80/120→ap_shouyangming_quchi/80/160→ap_shouyangming_shousanli/80/140→ap_shouyangming_hegu/80/100` | 冲任定身，再循手阳明由曲池至合谷擒腕拆招 |
| `sk_miaojiazhang` / 和 | `mv_miaojiazhang_huishen` | `mfr_miaojiazhang_huishen` | `moveRef:mv_miaojiazhang_huishen; ultimate:false; purpose:attack` | `ap_daimai_zulinqi/80/80→ap_daimai_weidao/80/120→ap_renmai_danzhong/80/160→ap_shoujueyin_neiguan/80/140→ap_shoujueyin_laogong/80/100` | 带脉转身、任脉守中，再由内关扫至劳宫发掌 |

### 0.1 配额、预算与外放口径

- 地上两记绝招在 7 / 9 重解锁，地下与玄上各一记在 7 重解锁；本册无地中 / 天中新增条目，不进入 F/M/T 二选判定。
- 绝招均为气势 100、`cd:0`、收招 1200；地阶耗内 9%，玄上耗内 8%。八穴地阶路线为 `1200+8×90=1920 CT`，六穴玄上路线为 `1200+6×100=1800 CT`。
- 内功贡献统一按 `IP=mpMaxPct+hpMaxPct+2×Σattrs+5×mpRegen` 核算；地下 / 地上 / 玄中预算依次为 72 / 94.5 / 48.5。
- 本册所有招式逐招复核均为 `projection:false`：内功招是调息 / 护体，刀拳招是普通兵刃挥击或近身拳拿；故均不得填写 `projectionSpreadSteps`。

### 0.2 来源扩展登记

| 既有武学 ID | 需加入书界 | 依据 | 状态 |
|---|---|---|---|
| — | — | 本轮复用项在既有图鉴中均已覆盖 `ch13_feihu`；新定义直接登记自身原生书界 | 无待登记项 |

---

## 1. 苗家与胡家地上主运

### 1.1 `sk_miaojiaxuangong` 苗家玄功（9 地上 · 内功 · 调和）**（原创扩展）**

- **来源归属**：苗家 `sect_miaojia`；与 `skills-qianlong` 的 `sk_miaojiajian`、`sk_miaojiaxinfa` 同属苗家体系。名称、运功招与数值为原创扩展，不冒充原著固定武学名。
- **字段**：`sourceChapters:[ch13_feihu,ch14_xueshan]`；`nature:harmony`；`inner.meridians:[mer_renmai,mer_shoujueyin,mer_dumai,mer_shouyangming]`；`breathProfileRef:txp_miaojiaxuangong`；`moveSlots:4`；`setTags:[]`；`conflicts:[]`。主修承接苗家心法的任脉、手厥阴守中，并加入督脉、手阳明衔接拳剑攻防；阴二票、阳二票，故取调和。
- **reqs**：`attrs {con:50,wis:50,wil:45}`；`aptitude {apInner:50}`；`prereq [{skill:sk_miaojiaxinfa,layer:8},{skill:sk_miaojiajian,layer:7}]`；常规途径为苗家 L4 后由家主传授，或完成胡苗旧怨互证后获家谱内篇；`hard:[sect,prereq]`。主角与其他人物均可循此途径习得。
- **内功贡献**：`mpMaxPct:34; hpMaxPct:20; attrs:{con:5,agi:4,wis:3,wil:2}; mpRegen:2.5`，故 `34+20+2×14+5×2.5=94.5`，精确命中地上预算；`stats:{parry:8,resMind:7}`（15）。
- **层数**：1 守正｜3 守正调息｜5 拳剑相参｜7 绝招·金面守心｜9 绝招·空明照隙｜10 大成。

| 招式 | ID | 层 | 类型 / 效果 | 资源与路线 |
|---|---|---:|---|---|
| 守正调息 | `mv_miaojiaxuangong_shouzheng` | 3 | 自身调息；驱散 1 个 `mind`，获得 `bf_huinei` 2 回合 | `MoveDef{unlock:3; ultimate:false; mpCost:7%; cd:2; recovery:900; projection:false; meridianRouteRef:mfr_miaojiaxuangong_shouzheng}` |
| 金面守心 **（原创扩展）** | `mv_miaojiaxuangong_jinmian` | 7 | 防守绝招；自身 `bf_shoushi` 2 回合并援护相邻友方 1 次 | `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_miaojiaxuangong_jinmian}` |
| 空明照隙 **（原创扩展）** | `mv_miaojiaxuangong_kongming` | 9 | 防守绝招；驱散自身 2 个 `mind/control`，获得 `bf_dongxi` 2 回合 | `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_miaojiaxuangong_kongming}` |

- **被动**：`ps_miaojiaxuangong_shouzheng` 守正（正面招架 +5%→10%）；`ps_miaojiaxuangong_xiangcan` 相参（同装苗家拳 / 剑时两门 Z3 各 +4%）；`ps_miaojiaxuangong_dacheng` 大成（每战首次解除心神控制后 `ct +100`）。
- **外放判定**：3 招均为自身调息 / 防守，`projection:false`；无外放招式。

### 1.2 `sk_hujiaxuangong` 胡家玄功（9 地上 · 内功 · 阳）**（原创扩展）**

- **来源归属**：辽东胡家 `sect_hujia`；与 `skills-qianlong` 的 `sk_hujiadao`、`sk_hujiaquan`、`sk_hujiadaoxinfa` 同属胡家体系。名称、运功招与数值均为原创扩展。
- **字段**：`sourceChapters:[ch13_feihu,ch14_xueshan]`；`nature:yang`；`inner.meridians:[mer_dumai,mer_shouyangming]`；`breathProfileRef:txp_hujiaxuangong`；`moveSlots:4`；`setTags:[]`；`conflicts:[]`。主修沿用胡家心法的督脉蓄劲、手阳明出刀与拳刀互济，两脉均投阳票，故取阳。
- **reqs**：`attrs {str:50,con:50,wil:45}`；`aptitude {apInner:50}`；`prereq [{skill:sk_hujiadaoxinfa,layer:8},{skill:sk_hujiadao,layer:7}]`；由胡家刀谱内篇、胡斐指点或胡一刀遗泽奇遇传承；`hard:[prereq]`。不是胡斐个人专属，满足家传认可者均可学。
- **内功贡献**：`mpMaxPct:34; hpMaxPct:20; attrs:{str:5,con:4,wil:3,agi:2}; mpRegen:2.5`，故 `34+20+2×14+5×2.5=94.5`；`stats:{crit:8,resInjury:7}`（15）。
- **层数**：1 藏锋｜3 藏锋调息｜5 刀拳互济｜7 绝招·雪夜护刀｜9 绝招·关山回气｜10 大成。

| 招式 | ID | 层 | 类型 / 效果 | 资源与路线 |
|---|---|---:|---|---|
| 藏锋调息 | `mv_hujiaxuangong_cangfeng` | 3 | 自身调息；获得 `bf_wenzhong` 2 回合 | `MoveDef{unlock:3; ultimate:false; mpCost:7%; cd:2; recovery:900; projection:false; meridianRouteRef:mfr_hujiaxuangong_cangfeng}` |
| 雪夜护刀 **（原创扩展）** | `mv_hujiaxuangong_xueye` | 7 | 防守绝招；获得 `bf_shoushi` 与 `bf_huinei` 各 2 回合 | `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_hujiaxuangong_xueye}` |
| 关山回气 **（原创扩展）** | `mv_hujiaxuangong_guanshan` | 9 | 防守绝招；清 1 个自身 `control`，下一次刀招不因受击中断蓄势 | `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_hujiaxuangong_guanshan}` |

- **路线叙事与同步镜像**：“关山回气”改由阳跷起步、阳维提势，经冲脉承接、督脉百会归护，仍以外关、阳池归于持刀腕部。体段计票由阴 4 / 阳 2 改为阴 0 / 阳 7；仍为 8 段、路线 CT `720`、收招合计 `1920`，风险列表仍为 `[100,120,150,180,220,200,160,120]`，总风险 `1250`。

- **被动**：`ps_hujiaxuangong_cangfeng` 藏锋（持刀且本回合未攻击，回合末获 `bf_xushi`）；`ps_hujiaxuangong_huji` 互济（胡家刀 / 拳修炼 +8%→15%）；`ps_hujiaxuangong_dacheng` 大成（每战第一次刀招被招架时获 `bf_wenzhong` 1 回合）。
- **外放判定**：3 招均为自身调息 / 防守，`projection:false`；无外放招式。

---

## 2. 商家堡与掌门会武主运

### 2.1 `sk_shangjiabaoqi` 商家堡气（7 地下 · 内功 · 阳）**（原创扩展）**

- **来源归属**：商家堡 `sect_shangjiabao`，并承认其与八卦门的既有渊源；与 `skills-qianlong` 的 `sk_shangjiadao`、`sk_shangjiaquan` 同一体系，不把它改写成八卦门通用高阶内功。
- **字段**：`sourceChapters:[ch13_feihu]`；`nature:yang`；`inner.meridians:[mer_zuyangming,mer_dumai,mer_shouyangming]`；`breathProfileRef:txp_shangjiabaoqi`；`moveSlots:4`；`setTags:[]`。主修取足阳明立桩、督脉提气与手阳明护门，服务刀拳并用和铁厅拒敌，三脉均投阳票，故取阳。
- **reqs**：`attrs {str:40,con:40,wil:35}`；`aptitude {apInner:40}`；`prereq [{skill:sk_shangjiadao,layer:6},{skill:sk_shangjiaquan,layer:5}]`；商家堡 L4 或堡毁后由幸存者多数认可授谱；`hard:[sect,prereq]`。主角与非商氏人物均可经认可学习。
- **内功贡献**：`mpMaxPct:26; hpMaxPct:16; attrs:{str:4,con:3,wil:3}; mpRegen:2.0`，`26+16+2×10+5×2=72`；`stats:{defOut:8,resInjury:7}`（15）。
- **招式与绝招**：守堡运气 `mv_shangjiabaoqi_shoubao`（3 重，自身 `bf_wenzhong` 2）；铁厅拒敌 `mv_shangjiabaoqi_tieting`（7 重，防守绝招，自身 `bf_shoushi` 2，首次被近身命中后反推 1 格）。二式均 `projection:false`，路线见 §0。
- **绝招机器字段**：`mv_shangjiabaoqi_tieting` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_shangjiabaoqi_tieting}`。
- **被动**：`ps_shangjiabaoqi_baomen` 堡门（邻墙时外防 +5%→10%）；`ps_shangjiabaoqi_bagua` 八卦渊源（同装 `sk_baguadao` 时招架 +5%）；`ps_shangjiabaoqi_dacheng` 大成（每战第一次成功架刀后获 `bf_gongshi`）。

### 2.2 `sk_huiwuguixin` 会武归心诀（7 地下 · 内功 · 阴）**（原创扩展）**

- **来源归属**：掌门人大会“多门会武融汇”的散传，不归八仙剑或袁紫衣个人所有；与 `skills-qianlong` 的 `sk_zhangmenboyi` 同属大会学习线。袁紫衣具体师承与所会门数仍 **（待考）**。
- **字段**：`sect:null`；`sourceChapters:[ch13_feihu]`；`nature:yin`；`inner.meridians:[mer_chongmai,mer_renmai,mer_shoujueyin]`；`breathProfileRef:txp_huiwuguixin`；`moveSlots:4`；`setTags:[]`。主修取两条既有路线共同呈现的冲脉汇劲，并以任脉守中、手厥阴定心收束；冲脉不投票，任脉与手厥阴各投阴一票，故取阴。经脉组合是本作依据“多门会武融汇、守中定心”机制所作的**（原创扩展）**，不宣称原著记载袁紫衣修习这些经脉。
- **reqs**：`attrs {wis:45,wil:40,agi:35}`；`aptitude {apInner:40}`；`lore {min:45}`；`prereq [{skill:sk_zhangmenboyi,layer:7},{anyOf:[{skill:sk_baxianjian,layer:5},{skill:sk_bajiquan,layer:5},{skill:sk_tianlongjian,layer:5}]}]`；完成掌门大会会武笔记奇遇；`hard:[prereq]`。任何满足条件者可学，不设袁紫衣专属门槛。
- **内功贡献**：`mpMaxPct:26; hpMaxPct:16; attrs:{wis:4,wil:3,agi:3}; mpRegen:2.0`，`26+16+2×10+5×2=72`；`stats:{parry:8,effRes:7}`（15）。
- **招式与绝招**：会武定心 `mv_huiwuguixin_dingxin`（3 重，驱散自身 1 个 `mind`，`bf_dongxi` 1）；百门归一 `mv_huiwuguixin_baimen`（7 重，防守绝招，切换姿态时保留当前气势且获 `bf_youshi` 2）。均 `projection:false`，路线见 §0。
- **绝招机器字段**：`mv_huiwuguixin_baimen` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_huiwuguixin_baimen}`。
- **被动**：`ps_huiwuguixin_bojian` 博见（每战首次看见新门派招式时效果抵抗 +5%）；`ps_huiwuguixin_huanshi` 换式（连续使用不同类别外功时第二招 Z3 +6%）；`ps_huiwuguixin_dacheng` 大成（每轮至多一次姿态切换 `ct +50`）。

---

## 3. 南海五虎来源

本节不新建 `sect_*`；原著中的组织名、凤天南与“五虎刀”措辞须在三联 / 广州修订版逐字核对 **（待考）**。三门武学均按“南海五虎来源”登记，不等同通行 `sk_wuhuduandandao`，也不设凤天南个人专属。

### 3.1 `sk_nanhaiwuhuxinfa` 南海五虎心法（7 地下 · 内功 · 阳）**（原创扩展）**

- **来源归属**：`sect:null` / `lineage:南海五虎`；与本节五虎刀、凤家拳同体系。`sourceChapters:[ch13_feihu]`；`nature:yang`；`inner.meridians:[mer_zushaoyang,mer_dumai,mer_shoushaoyang]`；`breathProfileRef:txp_nanhaiwuhuxinfa`；`moveSlots:4`。主修以足少阳起落、督脉提势、手少阳承接刀拳，三脉均投阳票，故取阳。
- **reqs**：`attrs {str:40,con:38,wil:35}`；`aptitude {apInner:40}`；`prereq [{skill:sk_wuhudaofa,layer:6}]`；可由南海五虎传人授艺，或佛山案后从合法移交的武馆谱册学习；`hard:[prereq]`。
- **内功贡献**：`mpMaxPct:26; hpMaxPct:16; attrs:{str:4,con:4,wil:2}; mpRegen:2.0`，`26+16+2×10+5×2=72`；`stats:{defOut:8,resMind:7}`。
- **招式与绝招**：纳潮运气 `mv_nanhaiwuhuxinfa_nachao`（3 重，自身 `bf_wenzhong` 2）；五虎归潮 `mv_nanhaiwuhuxinfa_guichao`（7 重，防守绝招，获得 `bf_shoushi` 2，并令下一记本源刀 / 拳命中 +10%）。均 `projection:false`，路线见 §0。
- **绝招机器字段**：`mv_nanhaiwuhuxinfa_guichao` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_nanhaiwuhuxinfa_guichao}`。
- **被动**：`ps_nanhaiwuhuxinfa_hushi` 虎势（相邻友方持本源武学时外防 +5%）；`ps_nanhaiwuhuxinfa_daoquan` 刀拳互济（同装五虎刀 / 拳时 Z3 +4%）**【建议值】**；`ps_nanhaiwuhuxinfa_dacheng` 大成（每战首次脱离包围后 `ct +100`）。
- **路线叙事与同步镜像**：“五虎归潮”改由足少阳起势，经阳跷转身、阴维与任脉束潮，原末三段外关、阳池、关冲不变，以少阳腕指出劲承接下一记刀 / 拳。体段计票由阴 5 / 阳 3 改为阴 2 / 阳 6；仍为 8 段、路线 CT `720`、收招合计 `1920`，风险列表 `[100,130,180,210,240,200,150,110]` 与总风险 `1320` 均不变。

### 3.2 `sk_wuhudaofa` 南海五虎刀法（6 玄上 · 兵器 / 刀 · 阳）**（原创扩展命名）**

- **来源归属**：`sect:null` / `lineage:南海五虎`；“凤天南—五虎刀”的准确原著措辞 **（待考）**，故名称只作来源清晰的图鉴统称。`sourceChapters:[ch13_feihu]`；`weaponReq:{category:blade}`；`layerStats:{hit:6,parry:4}`。
- **reqs / 获取**：`attrs {str:35,agi:30}`；`aptitude {apBlade:35}`；`prereq [{skill:sk_nanhaiwuhuxinfa,layer:4}]`；南海五虎传人 / 武馆谱册，或制伏凤家护院后以不毁谱为条件获抄本；均非敌人专用。

| 招式 | ID | 层 | 范围与倍率 | 核算 / 字段 |
|---|---|---:|---|---|
| 截门刀 **（原创扩展）** | `mv_wuhudaofa_jiemen` | 1 | 单体 1.00 | 玄阶基准；`MoveDef{unlock:1; ultimate:false; mpCost:6%; cd:0; recovery:1000; projection:false}` |
| 赶步横刀 **（原创扩展）** | `mv_wuhudaofa_ganbu` | 3 | 线 2，1.00 | `0.90×(1+cd1×0.12)=1.008≈1.00`；`projection:false` |
| 回身拦刀 **（原创扩展）** | `mv_wuhudaofa_huilan` | 5 | 单体 1.10 | `1+0.12=1.12≈1.10`；cd1 |
| 五虎锁关 **（原创扩展）** | `mv_wuhudaofa_suoguan` | 7 | 线 3，2.35；自身 `bf_wenzhong` 2 | `3×0.85−0.20=2.35`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_wuhudaofa_suoguan}` |

- **被动**：`ps_wuhudaofa_jiexiang` 截巷（窄路命中 +5%）；`ps_wuhudaofa_hushi` 虎势（相邻同源使用者存在时招架 +5%）；`ps_wuhudaofa_dacheng` 大成（回身拦刀成功后下一招 Z3 +6%）。普通兵刃挥击均非外放。

### 3.3 `sk_fengjiawuhuquan` 凤家五虎拳（6 玄上 · 拳脚 / 拳掌 · 阳）**（原创扩展）**

- **来源归属**：`sect:null` / `lineage:南海五虎·凤家支`；与本节心法、刀法同体系，不宣称原著存在此固定拳名。`sourceChapters:[ch13_feihu]`；`layerStats:{hit:5,defOut:5}`。
- **reqs / 获取**：`attrs {str:35,con:30}`；`aptitude {apFist:35}`；`prereq [{skill:sk_nanhaiwuhuxinfa,layer:4}]`；由愿意脱离凤天南的护院教习传授，或从凤家武馆谱册学习。
- **招式**：虎步冲拳 `mv_fengjiawuhuquan_hubu`（1 重，单体 1.00）；擒腕拦身 `mv_fengjiawuhuquan_qinwan`（3 重，单体 0.90，`bf_shouqin(level:4,holdRange:1)` 40%·1）；连环逼门 `mv_fengjiawuhuquan_bimen`（5 重，横扫 1.00，7% 内 / cd1）；五虎合势 `mv_fengjiawuhuquan_heshi`（7 重，绝招单体 2.90，`bf_shiheng` 100%·1，`3.00−0.10=2.90`）。
- **绝招机器字段**：`mv_fengjiawuhuquan_heshi` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_fengjiawuhuquan_heshi}`。四式均为近身拳拿，`projection:false`。
- **被动**：`ps_fengjiawuhuquan_hubu` 虎步（突进后命中 +5%）；`ps_fengjiawuhuquan_huyuan` 护院（相邻友方受击时每轮一次援护）；`ps_fengjiawuhuquan_dacheng` 大成（成功擒拿后外防 +8% 至下次行动）。

---

## 4. 天龙门与苗家雪山跨书外功

### 4.1 `sk_tianlongmenxinfa` 天龙门心法（7 地下 · 内功 · 调和）**（原创扩展）**

- **来源归属**：关外天龙门 `sect_tianlongmen`，与大理天龙寺无关；与 `skills-qianlong` 的 `sk_tianlongjian`、`sk_tianlongbeidao`、`sk_guanwaixinfa` 同体系。
- **字段**：`sourceChapters:[ch13_feihu,ch14_xueshan]`；`nature:harmony`；`inner.meridians:[mer_chongmai,mer_dumai,mer_renmai]`；`breathProfileRef:txp_tianlongmenxinfa`；`moveSlots:4`；`setTags:[]`。主修以冲脉承南北两宗、任督分别收放剑刀之气；冲脉不投票，任督一阴一阳平票，故取调和。
- **reqs / 获取**：`attrs {con:40,wil:40,wis:35}`；`aptitude {apInner:40}`；`prereq [{skill:sk_guanwaixinfa,layer:7},{anyOf:[{skill:sk_tianlongjian,layer:6},{skill:sk_tianlongbeidao,layer:6}]}]`；天龙门 L4 传授，或完成南北宗清理 / 和解后由门中长老授谱；`hard:[sect,prereq]`。
- **内功贡献**：`mpMaxPct:26; hpMaxPct:16; attrs:{con:4,wil:3,wis:3}; mpRegen:2.0`，`26+16+2×10+5×2=72`；`stats:{parry:8,resMind:7}`。
- **招式与绝招**：南北调息 `mv_tianlongmenxinfa_nanbei`（3 重，自身 `bf_huinei` 2）；南北合宗 `mv_tianlongmenxinfa_hezong`（7 重，防守绝招，获得 `bf_shoushi` 2，剑刀切换不清当前姿态）。均 `projection:false`，路线见 §0。
- **绝招机器字段**：`mv_tianlongmenxinfa_hezong` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_tianlongmenxinfa_hezong}`。
- **被动**：`ps_tianlongmenxinfa_nanbei` 南北各长（剑 / 刀各 +4%）；`ps_tianlongmenxinfa_shouguan` 守关（正面招架 +5%）；`ps_tianlongmenxinfa_dacheng` 大成（每轮第一次剑刀切换 `ct +50`）。

### 4.2 `sk_tianlongzhengdao` 天龙正刀（7 地下 · 兵器 / 刀 · 阳）**（原创扩展）**

- **来源归属**：关外天龙门 `sect_tianlongmen`；与 `skills-qianlong` 的天龙北刀属于同门不同刀路，用于取代田归农的跨门军中刀代理。`sourceChapters:[ch13_feihu,ch14_xueshan]`；`weaponReq:{category:blade}`；`layerStats:{hit:8,crit:7}`，合计 15。
- **reqs / 获取**：`attrs {str:40,agi:35}`；`aptitude {apBlade:40}`；`prereq [{skill:sk_tianlongbeidao,layer:6},{skill:sk_tianlongmenxinfa,layer:4}]`；天龙门 L4 由清理支系授艺，田归农控制支可持有但不垄断。
- **招式**：正门劈刀 `mv_tianlongzhengdao_zhengmen`（1 重，单体 1.00）；守关截刀 `mv_tianlongzhengdao_jiedao`（3 重，单体 1.05，击退 1，cd1，`1+.12−.05=1.07≈1.05`）；南北回锋 `mv_tianlongzhengdao_nanbei`（5 重，横扫 1.00，7% 内 / cd1）；天龙归锋 `mv_tianlongzhengdao_guifeng`（7 重，绝招单体 2.90，`bf_pozhao` 100%·1，`3−.10=2.90`）。
- **绝招机器字段**：`mv_tianlongzhengdao_guifeng` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_tianlongzhengdao_guifeng}`。四式均为普通持刀伤害，`projection:false`。
- **被动**：`ps_tianlongzhengdao_zhengmen` 正门（正面命中 +5%）；`ps_tianlongzhengdao_huzheng` 剑刀互证（同装天龙剑时 Z3 +6%）；`ps_tianlongzhengdao_dacheng` 大成（成功破招后获 `bf_gongshi`）。

### 4.3 `sk_tianlonghezongjian` 天龙合宗剑（7 地下 · 兵器 / 剑 · 调和）**（原创扩展）**

- **来源归属**：关外天龙门 `sect_tianlongmen`；与 `skills-qianlong` 的 `sk_tianlongjian`、`sk_tianlongrumenjian` 同体系，与大理天龙寺无关。`sourceChapters:[ch13_feihu,ch14_xueshan]`；`weaponReq:{category:sword}`；`layerStats:{hit:8,parry:7}`。
- **reqs / 获取**：`attrs {agi:40,wis:35}`；`aptitude {apSword:40}`；`prereq [{skill:sk_tianlongjian,layer:6},{skill:sk_tianlongmenxinfa,layer:5}]`；天龙门 L4 由南北宗清理 / 和解后的教习合授，或完成两宗剑谱互证奇遇后获谱；非掌门独占。
- **招式**：关外点剑 `mv_tianlonghezongjian_dianjian`（1 重，单体 1.00）；南北接锋 `mv_tianlonghezongjian_jiefeng`（3 重，单体 1.10，7% 内 / cd1，`1×1.12≈1.10`）；回关横剑 `mv_tianlonghezongjian_hengjian`（5 重，线 2，1.10，8% 内 / cd2，`0.90×1.29≈1.15` 下调至 1.10）；合宗守关 `mv_tianlonghezongjian_shouguan`（7 重，绝招单体 2.90，`bf_pozhao` 100%·1，`3−.10=2.90`）。
- **绝招机器字段**：`mv_tianlonghezongjian_shouguan` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_tianlonghezongjian_shouguan}`。四式均为普通持剑伤害，`projection:false`。
- **被动**：`ps_tianlonghezongjian_jiefeng` 接锋（正面招架 +5%）；`ps_tianlonghezongjian_huzheng` 剑刀互证（同装天龙刀时 Z3 +6%）；`ps_tianlonghezongjian_dacheng` 合宗（每轮首次切换剑刀后 `ct +50`）。

### 4.4 `sk_miaojiazhang` 苗家守正掌（7 地下 · 拳脚 / 拳掌 · 调和）**（原创扩展）**

- **来源归属**：苗家 `sect_miaojia`；与 `skills-qianlong` 的 `sk_miaojiaquan`、`sk_miaojiaxinfa` 同属苗家体系。原著未见此固定掌名，故名称、招式与机制均标原创。`sourceChapters:[ch13_feihu,ch14_xueshan]`；`layerStats:{hit:7,parry:8}`。
- **reqs / 获取**：`attrs {str:38,agi:38,wil:35}`；`aptitude {apFist:40}`；`prereq [{skill:sk_miaojiaquan,layer:6},{skill:sk_miaojiaxinfa,layer:6}]`；苗家 L4 由家主或教习传授，或完成胡苗旧怨互证后获家谱拳理旁篇；主角与其他获认可者均可学。
- **招式**：正门推掌 `mv_miaojiazhang_tuizhang`（1 重，单体 1.00）；听风截腕 `mv_miaojiazhang_jiewan`（3 重，单体 0.95，`bf_pozhao` 50%·1，`1−.10×.5=.95`）；守正回身 `mv_miaojiazhang_huishen`（5 重，横扫 1.00，7% 内 / cd1）；回面守隙 `mv_miaojiazhang_huimian`（7 重，绝招单体 2.90，`bf_shoushi` 2 回合，`3−.10=2.90`）。
- **绝招机器字段**：`mv_miaojiazhang_huimian` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_miaojiazhang_huimian}`。四式均为近身掌法，`projection:false`。
- **被动**：`ps_miaojiazhang_shouzheng` 守正（正面招架 +5%）；`ps_miaojiazhang_quanjian` 拳剑相参（同装苗家剑时两门 Z3 各 +4%）；`ps_miaojiazhang_dacheng` 大成（每战首次成功破招后获 `bf_dongxi` 1 回合）。

---

## 5. 药王门主运与护手

### 5.1 `sk_yaowangneigong` 药王内功（7 地下 · 内功 · 阴）**（原创扩展命名）**

- **来源归属**：药王门 `sect_yaowangmen`；与 `skills-qianlong` 的 `sk_yaowangdujing`、`sk_qixinhaitang`、`sk_yaowangzhenfa`、`sk_yaowangtuna` 同体系。药王门传承与医毒根基有原著依据，固定内功名与本卡招式 **（待考）**，因此不冒充原著定名。
- **字段**：`sourceChapters:[ch13_feihu,ch14_xueshan]`；`nature:yin`；`inner.meridians:[mer_shoujueyin,mer_renmai]`；`breathProfileRef:txp_yaowangneigong`；`moveSlots:4`；`setTags:[]`。主修承接药王吐纳的手厥阴辨息，并以任脉护中配合医毒调理，两脉均投阴票，故取阴。
- **reqs / 获取**：`attrs {con:38,wis:42,wil:35}`；`aptitude {apInner:40}`；`skills {med:35,poi:35}`；`prereq [{skill:sk_yaowangtuna,layer:7},{anyOf:[{skill:sk_yaowangzhenfa,layer:6},{skill:sk_yaowangdujing,layer:5}]}]`；药王门 L3 且医 / 毒 / 解毒三线至少两线合格，或程灵素认可后获正本；叛徒持有不影响玩家正途可学。
- **内功贡献**：`mpMaxPct:26; hpMaxPct:16; attrs:{con:4,wis:4,wil:2}; mpRegen:2.0`，`26+16+2×10+5×2=72`；`stats:{resPoison:10,healPower:5}`。
- **招式与绝招**：辨息调息 `mv_yaowangneigong_bianxi`（3 重，清自身 1 层毒并获 `bf_huinei` 1）；百草护脉 `mv_yaowangneigong_baicao`（7 重，防守绝招，友方半径 1 各清 1 个 `poison`，自身获 `bf_shoushi` 2）。均 `projection:false`，路线见 §0。
- **绝招机器字段**：`mv_yaowangneigong_baicao` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_yaowangneigong_baicao}`。
- **被动**：`ps_yaowangneigong_bianyao` 辨药（药物效果 +8%→15%）；`ps_yaowangneigong_yidu` 医毒同源（医或毒技能较低者获得较高者 20% 的检定补偿，上限 +10）；`ps_yaowangneigong_dacheng` 大成（每战首次驱散毒后目标获 `bf_wenzhong` 1）。不提供现实毒理步骤。

### 5.2 `sk_yaowanghushoufa` 药王护手法（6 玄上 · 拳脚 / 擒拿 · 阴）**（原创扩展）**

- **来源归属**：药王门 `sect_yaowangmen`；是与既有针法、护手基础配套的近身制敌法，不宣称原著有此固定名称。`sourceChapters:[ch13_feihu,ch14_xueshan]`；`layerStats:{hit:5,effRes:5}`。
- **reqs / 获取**：`attrs {agi:32,wis:35}`；`aptitude {apFist:35}`；`skills {med:25}`；`prereq [{skill:sk_yaowanghushou,layer:6},{skill:sk_yaowangzhenfa,layer:5}]`；药王门 L2 传授或程灵素羁绊支线授谱。
- **招式**：探脉手 `mv_yaowanghushoufa_tanmai`（1 重，单体 1.00）；卸腕 `mv_yaowanghushoufa_xiewan`（3 重，0.90，`bf_shouqin(level:4,holdRange:1)` 40%·1）；引手错身 `mv_yaowanghushoufa_cuoshen`（5 重，绕背 0.95，cd2，`0.90×1.24−.15=.966≈.95`）；封门护脉 `mv_yaowanghushoufa_fengmen`（7 重，绝招 2.90，`bf_xueweishoufeng(level:6,acupointRef:targetPrimaryRouteKey)` 50%·1，按封穴成本 `3−.20×.5=2.90`）。
- **绝招机器字段**：`mv_yaowanghushoufa_fengmen` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_yaowanghushoufa_fengmen}`。四式均为接触式手法，非暗器、非离体劲气，`projection:false`。
- **被动**：`ps_yaowanghushoufa_renxue` 认穴（点穴效果命中 +5%）；`ps_yaowanghushoufa_hushou` 护手（成功驱散穴封后招架 +8% 至下次行动）；`ps_yaowanghushoufa_dacheng` 大成（每轮首次擒拿失败返还 20% 本招内力）。

---

## 6. 八极拳支系精英主运

### 6.1 `sk_bajixingqi` 八极行气（5 玄中 · 内功 · 阳）**（原创扩展）**

- **来源归属**：八极拳 `sect_bajiquan`；与 `skills-qianlong` 的 `sk_bajiquan`、`sk_tieshankao`、`sk_bajizhuang` 同体系。小说中具体内功名、传承人与动作均 **（待考）**。
- **字段**：`sourceChapters:[ch13_feihu]`；`nature:yang`；`inner.meridians:[mer_dumai,mer_zuyangming]`；`breathProfileRef:txp_bajixingqi`；`moveSlots:3`；`setTags:[]`。主修承接八极桩的督脉整劲，并以足阳明稳桩发力，两脉均投阳票，故取阳。
- **reqs / 获取**：`attrs {str:28,con:28}`；`aptitude {apInner:30}`；`prereq [{skill:sk_bajizhuang,layer:6},{skill:sk_bajiquan,layer:5}]`；八极拳支系 L2 传授，或掌门大会守约会武后交流获得。
- **内功贡献**：`mpMaxPct:17; hpMaxPct:10; attrs:{str:3,con:3,wil:1}; mpRegen:1.5`，`17+10+2×7+5×1.5=48.5`；`stats:{defOut:5,resInjury:5}`。
- **招式 / 被动**：沉桩行气 `mv_bajixingqi_chenzhuang`（3 重，自身 `bf_wenzhong` 2，6% 内 / cd2 / 收招 900，`projection:false`）；`ps_bajixingqi_zhengjin` 整劲（未移动时拳招 Z3 +5%）；`ps_bajixingqi_kaimen` 开门（突进后效果抵抗 +5%）；`ps_bajixingqi_dacheng` 大成（每战首次击退碰撞后回复 3% MPREF）。玄中无绝招，符合配额 0。

---

## 7. 调息档案与护体内劲

字段与算法只引用 `design/21` §10.2、§12。地阶 / 玄阶 `scope` 分别为 3 / 2；全部 `ct:1000`、`mpCostBp:0`、`outOfBattleScaleBp:15000`。护体档名仅供内容检索，实际容量仍由当次 `MeridianProfile` 计算；本册无反震语义，统一 `reflectBp:0`。

| 内功 | `BreathProfile.id` | 正式字段 `grade/layer/nature/scope/ct/mpCostBp/outOfBattleScaleBp` | 10 重 `reliefBp / repairUnits` 核算 | 内劲抵消档位 |
|---|---|---|---|---|
| `sk_miaojiaxuangong` | `txp_miaojiaxuangong` | `9/10/harmony/3/1000/0/15000`；`outOfBattleScaleBp:15000` | `floor((500+900+800)×10500/10000)=2310` / `floor((120+216+180)×10500/10000)=541` | 地调和档；拳脚 / 兵器 / 暗器 / 内劲外放适用率 `10000/2500/0/4000 bp`；`reflectBp:0` |
| `sk_hujiaxuangong` | `txp_hujiaxuangong` | `9/10/yang/3/1000/0/15000`；`outOfBattleScaleBp:15000` | `2200 / 516` | 地阳档；`10000/2500/0/4000 bp`；`reflectBp:0` |
| `sk_shangjiabaoqi` | `txp_shangjiabaoqi` | `7/10/yang/3/1000/0/15000`；`outOfBattleScaleBp:15000` | `(500+700+800)=2000` / `(120+168+180)=468` | 地阳档；`10000/2500/0/4000 bp`；`reflectBp:0` |
| `sk_nanhaiwuhuxinfa` | `txp_nanhaiwuhuxinfa` | `7/10/yang/3/1000/0/15000`；`outOfBattleScaleBp:15000` | `2000 / 468` | 地阳档；`10000/2500/0/4000 bp`；`reflectBp:0` |
| `sk_huiwuguixin` | `txp_huiwuguixin` | `7/10/yin/3/1000/0/15000`；`outOfBattleScaleBp:15000` | `2000 / 468` | 地阴档；`10000/2500/0/4000 bp`；`reflectBp:0` |
| `sk_tianlongmenxinfa` | `txp_tianlongmenxinfa` | `7/10/harmony/3/1000/0/15000`；`outOfBattleScaleBp:15000` | `2100 / 491` | 地调和档；`10000/2500/0/4000 bp`；`reflectBp:0` |
| `sk_yaowangneigong` | `txp_yaowangneigong` | `7/10/yin/3/1000/0/15000`；`outOfBattleScaleBp:15000` | `2000 / 468` | 地阴档；`10000/2500/0/4000 bp`；`reflectBp:0` |
| `sk_bajixingqi` | `txp_bajixingqi` | `5/10/yang/2/1000/0/15000`；`outOfBattleScaleBp:15000` | `(500+500+800)=1800` / `(120+120+180)=420` | 玄阳档；`10000/2500/0/4000 bp`；`reflectBp:0` |

战斗外结果统一再乘 `15000 bp`，但不把换算结果缓存回档案；1 MP 抵 2 伤害，结算顺序为护体真气 → 护体内劲 → 既有 `mpGuard` → 气血。

---

## 8. 外放候选审计表

| 武学 | 逐招审计 | 外放数 | 结论 |
|---|---|---:|---|
| 苗家玄功 | `shouzheng/jinmian/kongming` | 0 | 调息、防守，不离体伤敌 |
| 胡家玄功 | `cangfeng/xueye/guanshan` | 0 | 调息、防守，不离体伤敌 |
| 商家堡气 | `shoubao/tieting` | 0 | 护体、拒敌架势 |
| 会武归心诀 | `dingxin/baimen` | 0 | 心法与姿态切换 |
| 南海五虎心法 | `nachao/guichao` | 0 | 调息与护体 |
| 南海五虎刀法 | `jiemen/ganbu/huilan/suoguan` | 0 | 全是普通兵刃挥击 |
| 凤家五虎拳 | `hubu/qinwan/bimen/heshi` | 0 | 近身拳拿 |
| 天龙门心法 | `nanbei/hezong` | 0 | 调息与护体 |
| 天龙正刀 | `zhengmen/jiedao/nanbei/guifeng` | 0 | 全是普通兵刃挥击 |
| 天龙合宗剑 | `dianjian/jiefeng/hengjian/shouguan` | 0 | 全是普通兵刃挥击 |
| 苗家守正掌 | `tuizhang/jiewan/huishen/huimian` | 0 | 近身拳掌与架势 |
| 药王内功 | `bianxi/baicao` | 0 | 调息、解毒与护体 |
| 药王护手法 | `tanmai/xiewan/cuoshen/fengmen` | 0 | 接触式拳拿 / 点穴，不是隔空指力 |
| 八极行气 | `chenzhuang` | 0 | 调息架势 |

因此本册 41 招均显式或按卡级口径判为 `projection:false`，外放招式 0；不存在 `projectionSpreadSteps`，也无需外放路线端点白名单复核。

---

## 9. 统计表

### 9.1 品阶与类别

| 类别 | 地上 9 | 地下 7 | 玄上 6 | 玄中 5 | 合计 |
|---|---:|---:|---:|---:|---:|
| 内功 | 2 | 5 | 0 | 1 | 8 |
| 兵器 | 0 | 2 | 1 | 0 | 3 |
| 拳脚 | 0 | 1 | 2 | 0 | 3 |
| **合计** | **2** | **8** | **3** | **1** | **14** |

### 9.2 绝招、来源与学习

| 统计项 | 数量 | 核对 |
|---|---:|---|
| 武学 | 14 | 全部新增且可由玩家正常学习；无 `enemyOnly` |
| 绝招 | 15 | 地上 `2×2=4`；地下 `8×1=8`；玄上 `3×1=3`；玄中 0 |
| 显式最终路线 | 15 | 与绝招一一对应；另有 16 条地阶普通招路线 |
| 内功调息档案 | 8 | 与 8 门内功一一对应，均含 `outOfBattleScaleBp:15000` |
| 外放招式 | 0 | 普通兵刃 / 近身拳拿 / 防守调息不算外放 |
| 原著固定名称 | 0 | 不把待考来源包装成原著招名 |
| 原创扩展 / 原创扩展命名 | 14 | 均明确标注；其中五虎刀、药王内功的来源名目仍待逐字考据 |

### 9.3 主书界复用边界

| 本册来源 | 飞狐使用 | 雪山后续可用 | 同体系既有图鉴 |
|---|---|---|---|
| 苗家 | 苗人凤 | B07 苗人凤：`sk_miaojiaxuangong`、`sk_miaojiazhang` | `skills-qianlong` |
| 胡家 | 本章不占首领槽 | B02 左童 / 右童与 B04 胡斐：`sk_hujiaxuangong` | `skills-qianlong` |
| 天龙门 | 田归农、亲信 | B01 / B05 天龙门槽：`sk_tianlongmenxinfa`、`sk_tianlonghezongjian`、`sk_tianlongzhengdao` | `skills-qianlong` |
| 药王门 | 三名首领、援手 | 同门剧情如需 | `skills-qianlong` |
| 商家堡 / 南海五虎 / 会武 / 八极 | 本章使用 | 无强制复用 | `skills-qianlong` 提供相邻基础链 |

---

## 本文新增术语与 ID

### 新增术语

- **按书补录册**：在不改既有门派图鉴的前提下，由门派主书界补齐首领 / 精英构筑缺口的正式图鉴；其 `sk_*` 对玩家与 NPC 使用同一规则。
- **南海五虎来源**：本册对凤天南相关刀拳传承的中性归属称呼 **（待考）**；不是新建门派 ID，也不等同通行五虎断门刀。
- **会武融汇散传**：经多门派合法交流与笔记归纳形成的可学传承 **（原创扩展）**，不绑定袁紫衣个人。

### 武学 ID（14）

| 品阶 | ID |
|---|---|
| 地上 9 | `sk_miaojiaxuangong`、`sk_hujiaxuangong` |
| 地下 7 | `sk_shangjiabaoqi`、`sk_nanhaiwuhuxinfa`、`sk_huiwuguixin`、`sk_tianlongmenxinfa`、`sk_yaowangneigong`、`sk_tianlongzhengdao`、`sk_tianlonghezongjian`、`sk_miaojiazhang` |
| 玄上 6 | `sk_wuhudaofa`、`sk_fengjiawuhuquan`、`sk_yaowanghushoufa` |
| 玄中 5 | `sk_bajixingqi` |

### 招式、被动、路线与调息 ID

- `mv_*`：41 个；其中绝招 15 个。
- `ps_*`：42 个，每门 3 个。
- `mfr_*`：31 个，其中最终绝招路线 15 个、地阶普通招路线 16 个。
- `txp_*`：8 个，与 8 门内功一一对应。

---

## 数据校验规则与测试用例

| 编号 | 校验 | 期望 |
|---|---|---|
| FB13-V01 | `sk_*`、`mv_*`、`ps_*`、`mfr_*`、`txp_*` 全仓唯一且引用可解析 | 无重名、无本册未定义引用 |
| FB13-V02 | 绝招数与解锁层 | 地上 2（7/9）；地下、玄上各 1（7）；其余 0 |
| FB13-V03 | 路线结构 | 1–18 穴且不重复；CT 40–120；风险 0–1200；`recovery+ΣCT≤2000` |
| FB13-V04 | 路线多样性 | 同武学共享穴位 ≤50%；跨武学无完全同序列 |
| FB13-V05 | 内功 IP | 地上 94.5、地下 72、玄中 48.5，逐式复算一致 |
| FB13-V06 | 调息 | 8 个 `txp_*` 唯一；离战倍率均 15000 |
| FB13-V07 | 外放 | 41 招外放数为 0；无招式保留 `projectionSpreadSteps` |
| FB13-V08 | 习得 | 每门有门派 / 谱册 / 会武 / 奇遇路径；无个人独占与敌人专用 |
| FB13-V09 | 来源 | 飞狐所用皆包含 `ch13_feihu`；苗 / 胡 / 天龙 / 药王跨书项含 `ch14_xueshan` |

最小测试：分别构建苗人凤、胡斐、田归农、药王门首领与五类精英；验证主运品阶取自实际武学，绝招只按 `MoveDef.ultimate` 识别，调息不推进永久经脉；对所有绝招做固定 RNG 路线回放，并运行 `check_route_unique_for.py`。

---

## 待决事项 / 依赖

### 替下游给出的建议值

- 南海五虎心法“刀拳互济”暂取 Z3 +4% **【建议值】**；下游不得与其他同名乘区重复叠加。
- 会武归心诀的姿态切换 `ct +50`、八极行气的首次碰撞回内 3% MPREF 均为可用默认值 **【建议值】**。

### 本文依赖的上游事实

- 品阶、招式预算、内功 IP 与学习规则依赖 `design/05`；穴位登记依赖 `design/15`；路线、调息、外放与首领主运依赖 `design/21`。
- 门派组织与职级称谓沿用 `design/17`；本册不新增 `sect_*`，也不修改 `skills-qianlong` 的既有条目。

### 对基准的修改提案

- FB13-P01：将本册作为《飞狐外传》主书界的正式按书补录图鉴纳入目录；理由是 AR-15 构建闸门要求 Boss / 精英主运必须有可解析武学，且现有 11 册图鉴不可在本任务越权修改。

### 原著考据待办

- 核对《飞狐外传》中凤天南与“五虎刀”具体措辞、传承组织及是否另有拳法 / 内功定名；若无固定名，保留当前原创扩展命名。
- 核对袁紫衣实际师承、所会门派与内功描写；在此之前，会武归心诀只作为不绑定门派的原创融汇传承。
- 核对药王门、八极拳相关人物是否出现固定内功名称；无确证不得移除原创标注。

### 开放问题（附默认值）

- 是否保留“苗家玄功 / 胡家玄功”名称：默认保留为易辨识的原创扩展名；若考据发现正式名，仅做同物重命名并保留旧 ID 迁移。
- 袁紫衣最终是否改用其确证师门内功：默认本轮使用 `sk_huiwuguixin`，待考据获得可共享的正式传承后再替换；不把任何武学设为她的个人专属。
- 雪山书界何时替换主书界 13 的全部槽位：默认由 NXfix 按 §9.3 的 B01 / B02 / B04 / B05 / B07 映射统一接入，本任务不越权修改第 14 章。
