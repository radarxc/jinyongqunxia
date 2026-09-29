# 《侠客行》首领武学补录图鉴（`skills-bulu-06-xiake`）

> **归属（基准 §18）**：`design/catalog/skills-*.md` 武学图鉴补录册。本文只定义《侠客行》书界首领缺口所需的新增武学、学习关系与逐招数据；不改写 `skills-xiake-bixue` 已有定义。
> **上游**：`docs/decisions/author-decisions.md`、`docs/decisions/author-requirements.md` AR-14～16、`docs/00-canon.md` §3～§5、§9、§12、§16、§18、`docs/decisions/rulings-v1.md`、`design/05`、`design/15`、`design/21` v2.4、`chapters/06-xiake`。
> **引用而不重定义**：武学字段、层数、招式预算与内功贡献见 `design/05`；穴位注册见 `design/15`；路线、护体内劲、调息与外放见 `design/21`；Buff 见 `design/06`；门派职级见 `design/17`；任务来源与投放见 `chapters/06-xiake` §6～§9。
> **标注约定**：**（原创扩展）**为原著没有的武学、招名或机制；**（原创扩展命名）**为人物、门派或技艺来源有据而名称未获原著逐字确认；**（待考）**须以三联 / 广州修订版逐字核对；**【建议值】**为待唯一归属文档确认的数值。本文不编造引文、回目号或原著招名。
> **覆盖声明**：本册补齐谢烟客、丁不四、白自在、张三、李四、龙岛主、木岛主的主运或外功缺口。雪山派、侠客岛与丁氏家传武学均可由主角及其他合资格人物按职级、家传认可或秘籍途径学习；只有谢烟客的个人传承另列取得条件。六门均与 `skills-xiake-bixue` 属同一《侠客行》体系。
> **版本**：首领武学补录与替补替换（2026-09-28）；经脉落地终审（2026-09-29）。

---

## 0. 阅读指引与路线索引

### 0.1 绝招显式路线索引（镜像正文卡，非覆写层；2026-09-28）

本册新增 **6 门地阶武学**：地下 5、地中 1。依 `design/05` §3.5 与 `ultimate-counts-tianzhong-dizhong.md`，地下固定 1 记绝招；原创地中因 `F=0` 取下限 1 记，故共 6 记，全部在 7 重解锁。索引是正文卡的机器镜像，不覆写正文；每条路线只在此定义一次。

<!-- skill-catalog-audit:start -->
| 品阶 | 武学 | MoveDef（正文卡镜像） | 路线 ID | steps（acupointRef/segmentCt/riskBp） |
|---|---|---|---|---|
| 7 地下 | `sk_motianyunqi` | `mv_motianyunqi_zhentian` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_motianyunqi_zhentian}` | `mfr_motianyunqi_zhentian` | `MeridianRouteDef{moveRef:mv_motianyunqi_zhentian; ultimate:true; purpose:defense; requiredNature:[harmony]}`；`ap_chongmai_zhongzhu/90/100→ap_daimai_zhangmen/90/140→ap_zutaiyang_shenshu/90/240→ap_dumai_yaoshu/90/260→ap_dumai_zhiyang/90/160→ap_renmai_danzhong/90/180→ap_renmai_yinjiao/90/220→ap_renmai_guanyuan/90/120` |
| 7 地下 | `sk_motianzhang` | `mv_motianzhang_lingyun` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:true; projectionSpreadSteps:[aoe_single,aoe_single,aoe_single]; DamageKind:projected; meridianRouteRef:mfr_motianzhang_lingyun}` | `mfr_motianzhang_lingyun` | `MeridianRouteDef{moveRef:mv_motianzhang_lingyun; ultimate:true; purpose:attack; requiredNature:[harmony]}`；`ap_zushaoyin_yongquan/90/100→ap_daimai_daimai/90/180→ap_yangqiao_jugu/90/260→ap_dumai_shenzhu/90/220→ap_shoutaiyin_yunmen/90/320→ap_shouyangming_pianli/90/180→ap_shoujueyin_neiguan/90/160→ap_shoujueyin_laogong/90/120` |
| 7 地下 | `sk_dingshixinfa` | `mv_dingshixinfa_shuanghuan` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_dingshixinfa_shuanghuan}` | `mfr_dingshixinfa_shuanghuan` | `MeridianRouteDef{moveRef:mv_dingshixinfa_shuanghuan; ultimate:true; purpose:defense; requiredNature:[harmony]}`；`ap_renmai_qugu/90/100→ap_chongmai_futonggu/90/140→ap_daimai_daimai/90/220→ap_zujueyin_ligou/90/260→ap_zutaiyin_xuehai/90/180→ap_shoujueyin_ximen/90/240→ap_shoushaoyin_shaofu/90/180→ap_renmai_shuifen/90/120` |
| 7 地下 | `sk_dingshiqinnashou` | `mv_dingshiqinna_suomai` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_dingshiqinna_suomai}` | `mfr_dingshiqinna_suomai` | `MeridianRouteDef{moveRef:mv_dingshiqinna_suomai; ultimate:true; purpose:attack; requiredNature:[yin,yang,harmony]}`；`ap_zushaoyin_yongquan/90/100→ap_chongmai_shiguan/90/140→ap_daimai_jingmen/90/220→ap_renmai_shenque/90/180→ap_shoujueyin_jianshi/90/300→ap_shoushaoyang_zhigou/90/260→ap_shouyangming_shousanli/90/160→ap_shouyangming_hegu/90/120` |
| 8 地中 | `sk_xiakedaoqigong` | `mv_xiakedaoqigong_shuangling` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_xiakedaoqigong_shuangling}` | `mfr_xiakedaoqigong_shuangling` | `MeridianRouteDef{moveRef:mv_xiakedaoqigong_shuangling; ultimate:true; purpose:defense; requiredNature:[harmony]}`；`ap_chongmai_futonggu/90/100→ap_chongmai_youmen/90/140→ap_daimai_zhangmen/90/180→ap_zushaoyang_guangming/90/260→ap_zutaiyang_feishu/90/220→ap_dumai_shendao/90/180→ap_shoutaiyang_xiaohai/90/240→ap_renmai_danzhong/90/120` |
| 7 地下 | `sk_lingxiaozhenyuegong` | `mv_lingxiaozhenyuegong_zhenyue` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_lingxiaozhenyuegong_zhenyue}` | `mfr_lingxiaozhenyuegong_zhenyue` | `MeridianRouteDef{moveRef:mv_lingxiaozhenyuegong_zhenyue; ultimate:true; purpose:defense; requiredNature:[yang,harmony]}`；`ap_zutaiyang_chengshan/90/100→ap_zushaoyang_fengshi/90/140→ap_yangwei_jinmen/90/180→ap_yangqiao_shenmai/90/220→ap_dumai_jizhong/90/180→ap_dumai_shendao/90/160→ap_shoutaiyang_tianzong/90/240→ap_dumai_baihui/90/120` |
<!-- skill-catalog-audit:end -->

六条绝招均为 8 段、路线 CT `8×90=720`，与收招合计 `1200+720=1920≤2000`。掌法外放路线以劳宫为末端；擒拿路线以手三里、合谷收束；内功防守路线以任督、冲带或雪山阳脉为躯干。六条有序穴位序列互不相同，也不是轮换或逆序；连同普通招按摩天、丁氏、侠客岛、雪山四个来源体系两两复核，共享穴位均不超过较短路线的 50%。

正文路线注册表只声明引用关系与 `ultimate` 布尔值；穴位序列仍只在上表定义：

| 武学 | moveRef → routeRef / ultimate / purpose / steps |
|---|---|
| `sk_motianyunqi` | `mv_motianyunqi_zhentian→mfr_motianyunqi_zhentian/true/defense/显式（见文首索引）` |
| `sk_motianzhang` | `mv_motianzhang_lingyun→mfr_motianzhang_lingyun/true/attack/显式（见文首索引）` |
| `sk_dingshixinfa` | `mv_dingshixinfa_shuanghuan→mfr_dingshixinfa_shuanghuan/true/defense/显式（见文首索引）` |
| `sk_dingshiqinnashou` | `mv_dingshiqinna_suomai→mfr_dingshiqinna_suomai/true/attack/显式（见文首索引）` |
| `sk_xiakedaoqigong` | `mv_xiakedaoqigong_shuangling→mfr_xiakedaoqigong_shuangling/true/defense/显式（见文首索引）` |
| `sk_lingxiaozhenyuegong` | `mv_lingxiaozhenyuegong_zhenyue→mfr_lingxiaozhenyuegong_zhenyue/true/defense/显式（见文首索引）` |

### 0.2 非绝招显式路线索引

以下 18 条路线也只在本节展开；正文卡只引用 `mfr_*`。每条 4 段、每段 90 CT，普通招总硬直至多 `1100+4×90=1460`。除正文明确的外放绝招外，本表均 `projection:false`。

| 武学 | moveRef | 路线 ID | MeridianRouteDef 与 steps（`ap_*/CT/风险`） |
|---|---|---|---|
| `sk_motianyunqi` | `mv_motianyunqi_yunxi` | `mfr_motianyunqi_yunxi` | `MeridianRouteDef{moveRef:mv_motianyunqi_yunxi; ultimate:false; purpose:defense; requiredNature:[harmony]}`；`ap_chongmai_henggu/90/70→ap_chongmai_qixue/90/80→ap_renmai_guanyuan/90/90→ap_renmai_qihai/90/100` |
| 〃 | `mv_motianyunqi_huya` | `mfr_motianyunqi_huya` | `MeridianRouteDef{moveRef:mv_motianyunqi_huya; ultimate:false; purpose:defense; requiredNature:[harmony]}`；`ap_daimai_jingmen/90/80→ap_daimai_zhangmen/90/90→ap_dumai_yaoshu/90/100→ap_dumai_shenzhu/90/110` |
| 〃 | `mv_motianyunqi_cuijin` | `mfr_motianyunqi_cuijin` | `MeridianRouteDef{moveRef:mv_motianyunqi_cuijin; ultimate:false; purpose:attack; requiredNature:[harmony]}`；`ap_renmai_qihai/90/80→ap_dumai_mingmen/90/90→ap_shoujueyin_neiguan/90/110→ap_shoujueyin_laogong/90/120` |
| `sk_motianzhang` | `mv_motianzhang_shizhang` | `mfr_motianzhang_shizhang` | `MeridianRouteDef{moveRef:mv_motianzhang_shizhang; ultimate:false; purpose:attack; requiredNature:[harmony]}`；`ap_zushaoyin_yongquan/90/80→ap_dumai_yaoyangguan/90/90→ap_shouyangming_quchi/90/110→ap_shoujueyin_laogong/90/120` |
| 〃 | `mv_motianzhang_yazhang` | `mfr_motianzhang_yazhang` | `MeridianRouteDef{moveRef:mv_motianzhang_yazhang; ultimate:false; purpose:attack; requiredNature:[harmony]}`；`ap_daimai_zulinqi/90/80→ap_yangqiao_jianyu/90/90→ap_shoutaiyin_chize/90/110→ap_shoujueyin_laogong/90/120` |
| 〃 | `mv_motianzhang_huishen` | `mfr_motianzhang_huishen` | `MeridianRouteDef{moveRef:mv_motianzhang_huishen; ultimate:false; purpose:attack; requiredNature:[harmony]}`；`ap_chongmai_dahe/90/80→ap_daimai_weidao/90/90→ap_shoujueyin_quze/90/110→ap_shouyangming_hegu/90/120` |
| `sk_dingshixinfa` | `mv_dingshixinfa_naxi` | `mfr_dingshixinfa_naxi` | `MeridianRouteDef{moveRef:mv_dingshixinfa_naxi; ultimate:false; purpose:defense; requiredNature:[harmony]}`；`ap_renmai_huiyin/90/70→ap_chongmai_qixue/90/80→ap_renmai_shimen/90/90→ap_renmai_zhongwan/90/100` |
| 〃 | `mv_dingshixinfa_humai` | `mfr_dingshixinfa_humai` | `MeridianRouteDef{moveRef:mv_dingshixinfa_humai; ultimate:false; purpose:defense; requiredNature:[harmony]}`；`ap_zujueyin_taichong/90/80→ap_zutaiyin_diji/90/90→ap_daimai_wushu/90/100→ap_shoujueyin_tianchi/90/110` |
| 〃 | `mv_dingshixinfa_huanzhang` | `mfr_dingshixinfa_huanzhang` | `MeridianRouteDef{moveRef:mv_dingshixinfa_huanzhang; ultimate:false; purpose:attack; requiredNature:[harmony]}`；`ap_chongmai_siman/90/80→ap_renmai_shenque/90/90→ap_shoushaoyin_shaofu/90/110→ap_shoujueyin_laogong/90/120` |
| `sk_dingshiqinnashou` | `mv_dingshiqinna_kouwan` | `mfr_dingshiqinna_kouwan` | `MeridianRouteDef{moveRef:mv_dingshiqinna_kouwan; ultimate:false; purpose:attack; requiredNature:[yin,yang,harmony]}`；`ap_daimai_weidao/90/80→ap_shoujueyin_quze/90/90→ap_shoushaoyang_waiguan/90/110→ap_shouyangming_hegu/90/120` |
| 〃 | `mv_dingshiqinna_suozhou` | `mfr_dingshiqinna_suozhou` | `MeridianRouteDef{moveRef:mv_dingshiqinna_suozhou; ultimate:false; purpose:attack; requiredNature:[yin,yang,harmony]}`；`ap_chongmai_dahe/90/80→ap_shoutaiyin_chize/90/90→ap_shouyangming_quchi/90/110→ap_shouyangming_shousanli/90/120` |
| 〃 | `mv_dingshiqinna_fanguan` | `mfr_dingshiqinna_fanguan` | `MeridianRouteDef{moveRef:mv_dingshiqinna_fanguan; ultimate:false; purpose:attack; requiredNature:[yin,yang,harmony]}`；`ap_renmai_qihai/90/80→ap_shoujueyin_tianchi/90/90→ap_shoutaiyang_wangu/90/110→ap_shoushaoyang_yangchi/90/120` |
| `sk_xiakedaoqigong` | `mv_xiakedaoqigong_tuna` | `mfr_xiakedaoqigong_tuna` | `MeridianRouteDef{moveRef:mv_xiakedaoqigong_tuna; ultimate:false; purpose:defense; requiredNature:[harmony]}`；`ap_chongmai_henggu/90/70→ap_chongmai_huangshu/90/80→ap_renmai_danzhong/90/90→ap_renmai_qihai/90/100` |
| 〃 | `mv_xiakedaoqigong_zhouliu` | `mfr_xiakedaoqigong_zhouliu` | `MeridianRouteDef{moveRef:mv_xiakedaoqigong_zhouliu; ultimate:false; purpose:defense; requiredNature:[harmony]}`；`ap_daimai_daimai/90/80→ap_zushaoyang_yanglingquan/90/90→ap_zutaiyang_shenshu/90/100→ap_dumai_zhiyang/90/110` |
| 〃 | `mv_xiakedaoqigong_tuishou` | `mfr_xiakedaoqigong_tuishou` | `MeridianRouteDef{moveRef:mv_xiakedaoqigong_tuishou; ultimate:false; purpose:attack; requiredNature:[harmony]}`；`ap_chongmai_shangqu/90/80→ap_shoutaiyang_tianzong/90/90→ap_shouyangming_quchi/90/110→ap_shoujueyin_laogong/90/120` |
| `sk_lingxiaozhenyuegong` | `mv_lingxiaozhenyuegong_zhenxi` | `mfr_lingxiaozhenyuegong_zhenxi` | `MeridianRouteDef{moveRef:mv_lingxiaozhenyuegong_zhenxi; ultimate:false; purpose:defense; requiredNature:[yang]}`；`ap_zutaiyang_kunlun/90/70→ap_dumai_yaoyangguan/90/80→ap_dumai_shenzhu/90/90→ap_dumai_baihui/90/100` |
| 〃 | `mv_lingxiaozhenyuegong_huti` | `mfr_lingxiaozhenyuegong_huti` | `MeridianRouteDef{moveRef:mv_lingxiaozhenyuegong_huti; ultimate:false; purpose:defense; requiredNature:[yang]}`；`ap_zushaoyang_xuanzhong/90/80→ap_yangwei_yangjiao/90/90→ap_yangqiao_naoshu/90/100→ap_shoutaiyang_tianzong/90/110` |
| 〃 | `mv_lingxiaozhenyuegong_yunzhang` | `mfr_lingxiaozhenyuegong_yunzhang` | `MeridianRouteDef{moveRef:mv_lingxiaozhenyuegong_yunzhang; ultimate:false; purpose:attack; requiredNature:[yang]}`；`ap_dumai_mingmen/90/80→ap_yangwei_jianjing/90/90→ap_shouyangming_shousanli/90/110→ap_shouyangming_hegu/90/120` |

## 1. 新增武学总览

| 武学 | 名称 | 品阶 / 类别 | 门派 / 来源归属 | 与既有图鉴的关系 | 主要使用者 |
|---|---|---|---|---|---|
| `sk_motianyunqi` | 摩天崖运气法 | 7 地下 / 内功·调和 | 谢烟客个人传承 | 同 `skills-xiake-bixue` §2 谢烟客体系 | 谢烟客 |
| `sk_motianzhang` | 摩天掌 | 7 地下 / 拳脚·掌 | 谢烟客个人传承 | 同 `skills-xiake-bixue` §2 谢烟客体系 | 谢烟客 |
| `sk_dingshixinfa` | 丁氏心法 | 7 地下 / 内功·调和 | 丁氏家传 | 同 `skills-xiake-bixue` 的侠客书界人物传承 | 丁不四、丁氏门人 |
| `sk_dingshiqinnashou` | 丁氏擒拿手 | 7 地下 / 拳脚·擒拿 | 丁氏家传 | 同 `skills-xiake-bixue` 的侠客书界人物传承 | 丁不四、丁氏门人 |
| `sk_xiakedaoqigong` | 侠客岛气功 | 8 地中 / 内功·调和 | `sect_xiakedao` | 同 `skills-xiake-bixue` §2 侠客岛体系 | 张三、李四、龙岛主、木岛主 |
| `sk_lingxiaozhenyuegong` | 凌霄镇岳功 | 7 地下 / 内功·阳 | `sect_xueshan` | 同 `skills-xiake-bixue` §3 雪山派体系 | 白自在、雪山高阶门人 |

六个武学总名及本文招式名均为**（原创扩展）**或**（原创扩展命名）**，不冒充原著具名招式。`sk_wuwangshengong` 保持既有 6 玄上定义，只作白自在辅运；不以本补录册越权升品。

## 2. 谢烟客个人传承

### 2.1 `sk_motianyunqi` 摩天崖运气法（7 地下 · 内功 · 谢烟客）**（原创扩展命名）**

| 项 | 内容 |
|---|---|
| 来源归属 | `canonExpanded` / `sect:null` / 谢烟客个人传承 / `[ch06_xiake]`；与 `skills-xiake-bixue` §2 的控鹤功、摩天崖人物体系相同。谢烟客及摩天崖有原著依据，独立内功名、层次与招式名未见原著明载。 |
| 性质 / 权重 / 栏位 | `harmony`；`wOut/wIn:0.15/0.85`；`moveSlots:4` |
| reqs | `attrs:{con:35,wil:35}; aptitude:{apInner:30}; prereq:[{skill:sk_konghegong,layer:5}]; hard:[prereq]` |
| inner.contribution | `{mpMaxPct:26,hpMaxPct:16,attrs:{con:4,wil:4,wis:2},mpRegen:2.0}`；`IP=26+16+2×10+5×2.0=72`，恰等于地下预算；`stats:{effRes:8,resMind:7}`，合计 15 |
| 经脉 / 调息 / 护体 | `meridians:[mer_renmai,mer_dumai,mer_chongmai]`；`breathProfileRef:txp_motianyunqi`；`innerGuard:{enabled:true,reflectBp:0}` |
| 层数要点 | 1 重运息；4 重护崖；5 重催劲；7 重绝招震天护气；10 重崖上自如 |
| 习得途径 | 谢烟客本人指点，或完成玄铁令守诺后取得其手录**【建议值】**；两条来源都保留属性、资质与控鹤功前置。主角与其他人物可按相同条件修习，不设 Boss-only 条件。 |
| 图鉴文本 | 谢烟客在摩天崖调息、护身与催劲的个人运气法。它不等同《太玄经》或罗汉伏魔神功，也不以人物强度倒推出原著具名心法。 |

| 招式（ID） | 重 | 范围 / 倍率 | 资源 | 效果、外放与路线 |
|---|---:|---|---|---|
| 崖巅运息 `mv_motianyunqi_yunxi` **（原创扩展）** | 1 | 自身 / 0 | 7%/3/900 | 获 `bf_shouyi`·承·2；`projection:false`；`meridianRouteRef:mfr_motianyunqi_yunxi` |
| 护崖凝气 `mv_motianyunqi_huya` **（原创扩展）** | 4 | 自身 / 0 | 7%/2/1000 | 获 `bf_wenzhong`·承·2；`projection:false`；`meridianRouteRef:mfr_motianyunqi_huya` |
| 催劲推掌 `mv_motianyunqi_cuijin` **（原创扩展）** | 5 | 单体·1·近身 / 1.00 | 7%/1/1000 | 标准单体 `1.00`；`projection:false`；`meridianRouteRef:mfr_motianyunqi_cuijin` |
| **震天护气** `mv_motianyunqi_zhentian` **（原创扩展）** | 7 | 自身 / 0 | 9%/0/1200，气势 100 | 获 `bf_hutizhenqi`·承·3，护体按 12% hpMax 覆写；支援绝招以资源支付预算；`projection:false`；`meridianRouteRef:mfr_motianyunqi_zhentian`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_motianyunqi_zhentian}` |

被动：崖定 `ps_motianyunqi_yading`（2 重，未移动时 `effRes +4`）；气返 `ps_motianyunqi_qifan`（5 重，每战首次内力低于 30% 时获 `bf_huinei`·承·2）；自如 `ps_motianyunqi_ziru`（10 重，护体存在时 `resMind +5`）。

### 2.2 `sk_motianzhang` 摩天掌（7 地下 · 拳脚/掌 · 谢烟客）**（原创扩展命名）**

| 项 | 内容 |
|---|---|
| 来源归属 | `canonExpanded` / `sect:null` / 谢烟客个人传承 / `[ch06_xiake]`；与 `skills-xiake-bixue` §2 的谢烟客体系相同。谢烟客掌力表现须逐字核对**（待考）**；“摩天掌”及各招均为本作补名。 |
| 性质 / 权重 / 栏位 | `harmony`；`wOut/wIn:0.60/0.40`；`moveSlots:4` |
| reqs | `attrs:{str:35,wil:35}; aptitude:{apFist:30}; prereq:[{skill:sk_motianyunqi,layer:5}]; hard:[prereq]` |
| layerStats | `{hit:[3,8],pierce:[2,7]}`，满层合计 `8+7=15`，不超过地阶上限 |
| 经脉 | `meridians:[mer_dumai,mer_daimai,mer_yangqiao,mer_shoujueyin]`；路线由足底起势、腰背蓄力至掌心，只有绝招凌云掌明确离体 |
| 层数要点 | 1 重试掌；3 重压掌；5 重回身；7 重绝招凌云掌；10 重摩天劲成 |
| 习得途径 | 同摩天崖运气法：谢烟客本人指点，或玄铁令守诺后取得手录**【建议值】**。主角与其他人物满足前置即可学，不因击败谢烟客掉落完整秘籍。 |
| 图鉴文本 | 以崖壁试掌、俯势压掌与回身发劲串成谢烟客的掌法；唯一外放招以掌心离体劲力表现，属于游戏机制扩写。 |

| 招式（ID） | 重 | 范围 / 倍率 | 资源 | 效果、外放与路线 |
|---|---:|---|---|---|
| 石壁试掌 `mv_motianzhang_shizhang` **（原创扩展）** | 1 | 单体·1·近身 / 1.00 | 7%/0/1000 | 标准单体 `1.00`；`projection:false`；`meridianRouteRef:mfr_motianzhang_shizhang` |
| 崖势压掌 `mv_motianzhang_yazhang` **（原创扩展）** | 3 | 单体·1·近身 / 1.10 | 8%/1/1000 | `bf_shiheng` 30%·1；`1×(1+0.12+0.05)−0.25×0.30=1.095≈1.10`；`projection:false`；`meridianRouteRef:mfr_motianzhang_yazhang` |
| 回身接掌 `mv_motianzhang_huishen` **（原创扩展）** | 5 | 单体·1·近身 / 1.15 | 8%/1/1000 | 须本回合先移动；`1×(1+0.12+0.05)=1.17≈1.15`；`projection:false`；`meridianRouteRef:mfr_motianzhang_huishen` |
| **凌云掌** `mv_motianzhang_lingyun` **（原创扩展）** | 7 | 单体·1–3·离体掌力 / 3.00 | 9%/0/1200，气势 100 | 单体绝招基准 `3.00`；`projection:true`；`projectionSpreadSteps:[aoe_single,aoe_single,aoe_single]`；伤害段 `DamageKind:projected`；`meridianRouteRef:mfr_motianzhang_lingyun`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:true; projectionSpreadSteps:[aoe_single,aoe_single,aoe_single]; DamageKind:projected; meridianRouteRef:mfr_motianzhang_lingyun}` |

被动：立崖 `ps_motianzhang_liya`（2 重，相邻不可通行地形时 `parry +4`）；压势 `ps_motianzhang_yashi`（5 重，对本回合已位移目标 `hit +5`）；摩天劲成 `ps_motianzhang_jingcheng`（10 重，本武学外放招的额外耗内 −1pp，最低不低于标准档耗内）。

## 3. 丁氏家传

### 3.1 `sk_dingshixinfa` 丁氏心法（7 地下 · 内功 · 丁氏家传）**（原创扩展）**

| 项 | 内容 |
|---|---|
| 来源归属 | `expanded` / `sect:null` / 丁氏家传 / `[ch06_xiake]`；与 `skills-xiake-bixue` 的《侠客行》人物传承同属一册体系。丁氏人物与家族关系有原著依据，成套心法名和招式名未见明载。 |
| 性质 / 权重 / 栏位 | `harmony`；`wOut/wIn:0.20/0.80`；`moveSlots:4` |
| reqs | `attrs:{con:35,wil:35}; aptitude:{apInner:30}; prereq:[{skill:sk_jianghutuna,layer:5}]; hard:[prereq]` |
| inner.contribution | `{mpMaxPct:26,hpMaxPct:16,attrs:{con:4,wil:3,agi:3},mpRegen:2.0}`；`IP=26+16+2×10+5×2.0=72`；`stats:{parry:8,resInjury:7}`，合计 15 |
| 经脉 / 调息 / 护体 | `meridians:[mer_renmai,mer_chongmai,mer_daimai]`；`breathProfileRef:txp_dingshixinfa`；`innerGuard:{enabled:true,reflectBp:0}` |
| 层数要点 | 1 重纳息；4 重护脉；5 重环掌；7 重绝招双环守脉；10 重回环自守 |
| 习得途径 | 丁氏家传认可后正常传授；完成 `q_06_bond_02` 且以非伤害方式化解舟行冲突，可获家传校注抄本**（原创扩展）**。主角与其他获认可者均可学。 |
| 图鉴文本 | 为丁氏人物补足吐纳、护脉和环转掌劲的家传内功；不把玄冰碧火酒的物品效果改写成心法能力。 |

| 招式（ID） | 重 | 范围 / 倍率 | 资源 | 效果、外放与路线 |
|---|---:|---|---|---|
| 丁门纳息 `mv_dingshixinfa_naxi` **（原创扩展）** | 1 | 自身 / 0 | 7%/3/900 | 获 `bf_shouyi`·承·2；`projection:false`；`meridianRouteRef:mfr_dingshixinfa_naxi` |
| 回环护脉 `mv_dingshixinfa_humai` **（原创扩展）** | 4 | 自身 / 0 | 7%/2/1000 | 获 `bf_yuanzhuan`·承·2；`projection:false`；`meridianRouteRef:mfr_dingshixinfa_humai` |
| 环劲推掌 `mv_dingshixinfa_huanzhang` **（原创扩展）** | 5 | 单体·1·近身 / 1.00 | 7%/1/1000 | 标准单体 `1.00`；`projection:false`；`meridianRouteRef:mfr_dingshixinfa_huanzhang` |
| **双环守脉** `mv_dingshixinfa_shuanghuan` **（原创扩展）** | 7 | 自身 / 0 | 9%/0/1200，气势 100 | 获 `bf_yuanzhuan`·承·3与 `bf_dingxin`·承·2；支援绝招以资源支付预算；`projection:false`；`meridianRouteRef:mfr_dingshixinfa_shuanghuan`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_dingshixinfa_shuanghuan}` |

被动：回环 `ps_dingshixinfa_huihuan`（2 重，交替使用攻击 / 防守招式时下一招耗内 −5%）；护亲 `ps_dingshixinfa_huqin`（5 重，援护同伴后 `parry +4` 至下次行动）；自守 `ps_dingshixinfa_zishou`（10 重，每战首次受擒时使其等级 −1，最低为 1）。

### 3.2 `sk_dingshiqinnashou` 丁氏擒拿手（7 地下 · 拳脚/擒拿 · 丁氏家传）**（原创扩展）**

| 项 | 内容 |
|---|---|
| 来源归属 | `expanded` / `sect:null` / 丁氏家传 / `[ch06_xiake]`；与上节同源。丁氏人物有追逐、捆缚等情节背景，独立“丁氏擒拿手”及招式层次均为本作归纳，不宣称是原著专名。 |
| 性质 / 权重 / 栏位 | `neutral`；`wOut/wIn:0.55/0.45`；`moveSlots:4` |
| reqs | `attrs:{str:35,agi:35}; aptitude:{apGrapple:30}; prereq:[{skill:sk_dingshixinfa,layer:5}]; hard:[prereq]` |
| layerStats | `{hit:[3,8],seal:[2,7]}`，满层合计 `8+7=15` |
| 经脉 | `meridians:[mer_daimai,mer_chongmai,mer_shouyangming,mer_shoujueyin]`；三记近身拿法分别收于腕、肘、肩臂，绝招仍是接触型擒拿 |
| 层数要点 | 1 重扣腕；3 重锁肘；5 重反关；7 重绝招回环锁脉；10 重擒纵随心 |
| 习得途径 | 丁氏家传认可或 `q_06_bond_02` 的非伤害解决路线授艺**（原创扩展）**；主角与其他人物只要满足来源和心法前置均可学。 |
| 图鉴文本 | 以扣腕、锁肘和反关节限制行动的近身擒拿；“锁脉”是战斗状态命名，不声称原著有同名招式。 |

| 招式（ID） | 重 | 范围 / 倍率 | 资源 | 效果、外放与路线 |
|---|---:|---|---|---|
| 扣腕 `mv_dingshiqinna_kouwan` **（原创扩展）** | 1 | 单体·1·近身 / 0.95 | 7%/0/1000 | `bf_shouqin(level:4,holdRange:1)` 20%·1；`1.00−0.25×0.20=0.95`；`projection:false`；`meridianRouteRef:mfr_dingshiqinna_kouwan` |
| 锁肘 `mv_dingshiqinna_suozhou` **（原创扩展）** | 3 | 单体·1·近身 / 1.00 | 7%/1/1000 | `bf_shouqin(level:4,holdRange:1)` 40%·1；`1.00×(1+0.12)−0.25×0.40=1.02≈1.00`；`projection:false`；`meridianRouteRef:mfr_dingshiqinna_suozhou` |
| 反关 `mv_dingshiqinna_fanguan` **（原创扩展）** | 5 | 单体·1·近身 / 1.15 | 8%/2/1000 | 无附带；`1.00×(1+0.24)=1.24`，以短控连段上限手调为 `1.15`；`projection:false`；`meridianRouteRef:mfr_dingshiqinna_fanguan` |
| **回环锁脉** `mv_dingshiqinna_suomai` **（原创扩展）** | 7 | 单体·1·近身 / 2.75 | 9%/0/1200，气势 100 | `bf_shouqin(level:7,holdRange:1)` 100%·1；`3.00−0.25×1.00=2.75`；`projection:false`；`meridianRouteRef:mfr_dingshiqinna_suomai`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_dingshiqinna_suomai}` |

被动：近拿 `ps_dingshiqinna_jinna`（2 重，对相邻目标 `hit +4`）；借势 `ps_dingshiqinna_jieshi`（5 重，对已有 `bf_shouqin` 的目标 Z3 +5%）；随心 `ps_dingshiqinna_suixin`（10 重，本武学擒拿效果命中 +6pp）。

## 4. 侠客岛

### `sk_xiakedaoqigong` 侠客岛气功（8 地中 · 内功 · 侠客岛）**（原创扩展）**

| 项 | 内容 |
|---|---|
| 来源归属 | `expanded` / `sect_xiakedao` / 侠客岛公传 / `[ch06_xiake]`；与 `skills-xiake-bixue` §2 的岛上拳基、赏善罚恶手及侠客岛掌法同一门派体系。它是岛使和护法的常规内功，不等于石壁《太玄经》。 |
| 性质 / 权重 / 栏位 | `harmony`；`wOut/wIn:0.10/0.90`；`moveSlots:4` |
| reqs | `attrs:{con:40,wil:40}; aptitude:{apInner:35}; sect:{id:sect_xiakedao,rank:4}; prereq:[{skill:sk_xiakedaoshangshanshou,layer:6}]; hard:[sect,prereq]` |
| inner.contribution | `{mpMaxPct:30,hpMaxPct:18,attrs:{con:4,wil:4,wis:4},mpRegen:2.2}`；`IP=30+18+2×12+5×2.2=83`，恰等于地中预算；`stats:{effRes:8,resMind:7}`，合计 15 |
| 经脉 / 调息 / 护体 | `meridians:[mer_renmai,mer_chongmai,mer_daimai,mer_dumai]`；`breathProfileRef:txp_xiakedaoqigong`；`innerGuard:{enabled:true,reflectBp:0}` |
| 层数要点 | 1 重岛上吐纳；4 重周流；5 重承势推手；7 重绝招双令调息；10 重刚柔并济 |
| 习得途径 | 侠客岛 L4 护法正常传授；完成自愿归返与赏罚复核后可获岛主授艺来源。主角与其他合格人物均可学；不要求、也不授予 `sk_taixuan` 或 `sk_luohanfumo`。 |
| 图鉴文本 | 侠客岛使者与护法共用的调和气功，为赏罚、护送与合守提供内息基础；二岛主只是最高层使用者，不拥有排他版本。 |

| 招式（ID） | 重 | 范围 / 倍率 | 资源 | 效果、外放与路线 |
|---|---:|---|---|---|
| 岛上吐纳 `mv_xiakedaoqigong_tuna` **（原创扩展）** | 1 | 自身 / 0 | 7%/3/900 | 获 `bf_shouyi`·承·2；`projection:false`；`meridianRouteRef:mfr_xiakedaoqigong_tuna` |
| 刚柔周流 `mv_xiakedaoqigong_zhouliu` **（原创扩展）** | 4 | 自身 / 0 | 8%/2/1000 | 获 `bf_yuanzhuan`·承·2；`projection:false`；`meridianRouteRef:mfr_xiakedaoqigong_zhouliu` |
| 承势推手 `mv_xiakedaoqigong_tuishou` **（原创扩展）** | 5 | 单体·1·近身 / 1.00 | 8%/1/1000 | 标准单体 `1.00`；`projection:false`；`meridianRouteRef:mfr_xiakedaoqigong_tuishou` |
| **双令调息** `mv_xiakedaoqigong_shuangling` **（原创扩展）** | 7 | 自身及相邻友军 / 0 | 9%/0/1200，气势 100 | 自身获 `bf_shouyi`·承·3，相邻友军获 `bf_dingxin`·承·2；支援绝招以资源支付预算；`projection:false`；`meridianRouteRef:mfr_xiakedaoqigong_shuangling`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_xiakedaoqigong_shuangling}` |

被动：验心 `ps_xiakedaoqigong_yanxin`（2 重，`resMind +4`）；同舟 `ps_xiakedaoqigong_tongzhou`（5 重，相邻友军存在时 `parry +4`）；并济 `ps_xiakedaoqigong_bingji`（10 重，交替使用刚性攻击与柔性防守招时下一招耗内 −5%）。

地中绝招数取 1：本功是原创门派公传，知名度 `F=0`，按 `ultimate-counts-tianzhong-dizhong.md` §3.1B 的逐门裁定取下限；该 ID 已显式入表。

## 5. 雪山派

### `sk_lingxiaozhenyuegong` 凌霄镇岳功（7 地下 · 内功 · 雪山派）**（原创扩展）**

| 项 | 内容 |
|---|---|
| 来源归属 | `expanded` / `sect_xueshan` / 雪山派高阶公传 / `[ch06_xiake]`；与 `skills-xiake-bixue` §3 的凌霄吐纳、无妄神功和雪山剑法同一门派体系。原著无此武学名。 |
| 性质 / 权重 / 栏位 | `yang`；`wOut/wIn:0.15/0.85`；`moveSlots:4` |
| reqs | `attrs:{con:35,wil:35}; aptitude:{apInner:30}; sect:{id:sect_xueshan,rank:4}; prereq:[{skill:sk_wuwangshengong,layer:8}]; hard:[sect,prereq]` |
| inner.contribution | `{mpMaxPct:26,hpMaxPct:16,attrs:{str:3,con:4,wil:3},mpRegen:2.0}`；`IP=26+16+2×10+5×2.0=72`；`stats:{defOut:8,resInjury:7}`，合计 15 |
| 经脉 / 调息 / 护体 | `meridians:[mer_dumai,mer_yangwei,mer_yangqiao]`；`breathProfileRef:txp_lingxiaozhenyuegong`；`innerGuard:{enabled:true,reflectBp:0}` |
| 层数要点 | 1 重镇息；4 重雪岭护体；5 重运掌；7 重绝招镇岳守城；10 重凌霄不退 |
| 习得途径 | 雪山派 L4 气寒堂长老正常传授；完成门规修复与寒地守望后可获门内抄本。主角和其他满足职级 / 前置的人物均可学，不绑定白自在。 |
| 图鉴文本 | 由无妄神功进阶的雪山高阶守城内功，以足太阳、阳维、阳跷和督脉承接寒地立桩；不并入史小翠的金乌个人传承。 |

| 招式（ID） | 重 | 范围 / 倍率 | 资源 | 效果、外放与路线 |
|---|---:|---|---|---|
| 凌霄镇息 `mv_lingxiaozhenyuegong_zhenxi` **（原创扩展）** | 1 | 自身 / 0 | 7%/3/900 | 获 `bf_wenzhong`·承·2；`projection:false`；`meridianRouteRef:mfr_lingxiaozhenyuegong_zhenxi` |
| 雪岭护体 `mv_lingxiaozhenyuegong_huti` **（原创扩展）** | 4 | 自身 / 0 | 7%/2/1000 | 获 `bf_hutizhenqi`·承·2，护体按 8% hpMax 覆写；`projection:false`；`meridianRouteRef:mfr_lingxiaozhenyuegong_huti` |
| 镇岳运掌 `mv_lingxiaozhenyuegong_yunzhang` **（原创扩展）** | 5 | 单体·1·近身 / 1.00 | 7%/1/1000 | 标准单体 `1.00`；`projection:false`；`meridianRouteRef:mfr_lingxiaozhenyuegong_yunzhang` |
| **镇岳守城** `mv_lingxiaozhenyuegong_zhenyue` **（原创扩展）** | 7 | 自身及相邻友军 / 0 | 9%/0/1200，气势 100 | 自身获 `bf_shoushi`·承·3，相邻友军获 `bf_wenzhong`·承·2；支援绝招以资源支付预算；`projection:false`；`meridianRouteRef:mfr_lingxiaozhenyuegong_zhenyue`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_lingxiaozhenyuegong_zhenyue}` |

被动：立雪 `ps_lingxiaozhenyuegong_lixue`（2 重，未移动时 `defOut +4`）；守城 `ps_lingxiaozhenyuegong_shoucheng`（5 重，相邻友军受击后自身 `parry +4` 至下次行动）；不退 `ps_lingxiaozhenyuegong_butui`（10 重，每战首次被击退时距离 −1）。

## 6. 调息档案与护体内劲

四门新增内功各绑定一个稳定 `txp_*`。字段顺序为 `id/grade/layer/nature/scope/ct/mpCostBp/outOfBattleScaleBp`，统一 `layer:10, scope:3, ct:1000, mpCostBp:0, outOfBattleScaleBp:15000`；地阶护体均为 III 档，`reflectBp:0`。调息公式只引用 `design/21` §10.2。

| 内功 → 调息档案 | 完整字段值 | 满层 `relief/repair` 核算 | 内劲抵消档位 |
|---|---|---|---|
| `sk_motianyunqi → txp_motianyunqi` | `7/10/harmony/3/1000/0/15000`；`outOfBattleScaleBp:15000` | 阳性基值 `500+100×7+80×10=2000`、`120+24×7+18×10=468`；调和乘 1.05，得 `2100/491` | III；`innerGuard:{enabled:true,reflectBp:0}` |
| `sk_dingshixinfa → txp_dingshixinfa` | `7/10/harmony/3/1000/0/15000`；`outOfBattleScaleBp:15000` | `floor(2000×1.05)=2100/floor(468×1.05)=491` | III；`innerGuard:{enabled:true,reflectBp:0}` |
| `sk_xiakedaoqigong → txp_xiakedaoqigong` | `8/10/harmony/3/1000/0/15000`；`outOfBattleScaleBp:15000` | 阳性基值 `2100/492`；调和乘 1.05，得 `2205/516` | III；`innerGuard:{enabled:true,reflectBp:0}` |
| `sk_lingxiaozhenyuegong → txp_lingxiaozhenyuegong` | `7/10/yang/3/1000/0/15000`；`outOfBattleScaleBp:15000` | `2000/468` | III；`innerGuard:{enabled:true,reflectBp:0}` |

护体抵消顺序、类别适用率、`1 MP:2 伤害`、击穿迟滞和离战 1.5 倍只引用 `design/21`；本册不另写运行算法。

## 7. 外放候选审计表

| 武学 / 招式 | 判定 | `projectionSpreadSteps` | 理由 |
|---|---|---|---|
| `sk_motianzhang` / `mv_motianzhang_lingyun` | `projection:true`；伤害段 `DamageKind:projected` | `[aoe_single,aoe_single,aoe_single]` | 明确为离体掌力；基础范围是单体，三档只扩射程；路线经过白名单端点 `ap_shoujueyin_laogong` |
| 其余 23 记新增招式 | `projection:false` | 不填写 | 调息、护体、支援或 1 格接触型拳掌 / 擒拿；范围支援和兵刃动作都不等于真气外放 |

审计结果：候选 1，确认外放 1；逐招覆盖 `24/24`。本册无暗器、飞刀、弓弩或普通兵刃挥击被误标为外放。

## 8. 来源扩展登记

| `sk_*` | 需加入的书界 | 依据 | 状态 |
|---|---|---|---|
| — | — | 六门新武学已在各卡直接登记 `[ch06_xiake]`；配装所用旧武学本就属于侠客书界 | 无来源扩展待登记 |

本书不涉及主书界表中的外来门派，故没有跨书界待替换。六门都由本书自行补录。

## 9. 统计表

### 9.1 门派 / 来源 × 品阶

| 门派 / 来源 | 地下 7 | 地中 8 | 合计 |
|---|---:|---:|---:|
| 谢烟客个人传承 | 2 | 0 | 2 |
| 丁氏家传 | 2 | 0 | 2 |
| 侠客岛 | 0 | 1 | 1 |
| 雪山派 | 1 | 0 | 1 |
| **合计** | **5** | **1** | **6** |

### 9.2 招式、路线与可习得性

| 项 | 数量 | 核对 |
|---|---:|---|
| 新增内功 / 外功 | 4 / 2 | 每门均为 4 招、3 被动 |
| 新增普通招式 / 绝招 | 18 / 6 | 地下各 1 绝招；地中按裁定判据取 1 |
| 显式普通 / 绝招路线 | 18 / 6 | 一招一路；绝招各 8 段且总硬直 1920 |
| 调息档案 | 4 | 均含 `outOfBattleScaleBp:15000` 和内劲抵消 III |
| 外放招式 | 1 | `mv_motianzhang_lingyun`；端点与三档范围均闭合 |
| 门派 / 家传正常途径 | 4 门 | 丁氏、侠客岛、雪山派均可供其他合资格人物学习 |
| 个人传承途径 | 2 门 | 谢烟客指点或玄铁令守诺手录，待作者确认具体投放 |

新增六门是 `skills-xiake-bixue` 已锁定 44 门之外的增量；合并后《侠客行》本土池为 `2 天+12 地+18 玄+18 黄=50`。

## 10. 本文新增术语与 ID

| 类型 | 数量 | ID |
|---|---:|---|
| 武学 `sk_*` | 6 | `sk_motianyunqi`、`sk_motianzhang`、`sk_dingshixinfa`、`sk_dingshiqinnashou`、`sk_xiakedaoqigong`、`sk_lingxiaozhenyuegong` |
| 招式 `mv_*` | 24 | 各卡招式表中的 18 记普通招与 6 记绝招 |
| 被动 `ps_*` | 18 | 六门各 3 个 |
| 路线 `mfr_*` | 24 | 与 24 个 `mv_*` 去掉前缀后一一同名 |
| 调息档案 `txp_*` | 4 | `txp_motianyunqi`、`txp_dingshixinfa`、`txp_xiakedaoqigong`、`txp_lingxiaozhenyuegong` |

`mfr_*` / `txp_*` 的 schema 与算法仍归 `design/21`；本册只定义实例。`DamageKind:projected`、`projection` 和 `projectionSpreadSteps` 是 schema 值，不登记为全局 ID。

## 11. 数据校验规则与测试用例

| ID | 校验 | 期望 |
|---|---|---|
| XK06-SK-T01 | 正式 `sk_*` 卡统计 | 6 门；地下 5、地中 1；内功 4、拳脚 2 |
| XK06-SK-T02 | 内功贡献与属性 | 地下 IP 72、地中 IP 83；各卡 `stats` 合计 15 |
| XK06-SK-T03 | 绝招配额与解锁 | 每门 1 记，均 7 重；气势 100、耗内 9%、cd 0、收招 1200 |
| XK06-SK-T04 | 绝招路线 | 六路各 8 个不重复穴位；`1200+8×90=1920≤2000`；跨图鉴无完全同序列 |
| XK06-SK-T05 | 普通路线 | 18 招各有唯一四段 `mfr_*`，每段 CT 90；正文不重复展开穴位；同来源任意两路共享穴位不超过 50% |
| XK06-SK-T06 | 外放字段 | 凌云掌同时满足 `projection:true`、三项范围、projected 伤害与劳宫端点；其余 23 招为 false |
| XK06-SK-T07 | 调息与护体 | 4 个 `txp_*` 均含离战 15000 bp；护体 III、反震 0 |
| XK06-SK-T08 | 可习得性 | 门派 / 家传武学不绑定首领；谢烟客个人传承有独立取得条件 |
| XK06-SK-T09 | 旧定义保护 | `sk_wuwangshengong` 仍为 6 玄上；不覆写 `skills-xiake-bixue` |

## 12. 待决事项 / 依赖

### 替下游给出的建议值

| 编号 | 下游 / 归属 | 本文采用 | 回填条件 |
|---|---|---|---|
| XK06-SK-D01 | `design/12` / 具体任务与 LearnSource | 谢烟客手录、丁氏校注抄本、侠客岛授艺、雪山门内抄本只作来源叙事，不新造物品 ID | 下游分配正式来源 ID 后改为“已解决”并引用 |
| XK06-SK-D02 | `chapters/06` §7 / 职级开放 | **已解决：**侠客岛气功与凌霄镇岳功分别追加至 L4；不改变既有职级称谓 | 已同步至 `chapters/06-xiake.md` §7.4、§7.6 |

### 本文依赖的上游事实

| 上游 | 状态与本文采用 |
|---|---|
| `design/05` / `21` | **已解决：**采用地阶招式、绝招预算、路线、调息、护体与逐招外放规则 |
| `skills-xiake-bixue` | **已解决：**复用控鹤功、赏善罚恶手、无妄神功等前置；不升阶、不重定义旧 ID |
| `design/17` | **已解决：**复用 `sect_xiakedao`、`sect_xueshan` 及其五级称谓；丁氏与摩天崖不虚造门派 ID |

### 对基准的修改提案

| 编号 | 提案 | 理由 |
|---|---|---|
| XK06-SK-P01 | 无新增基准修改 | 六门均是补录实例，字段与数值可由现行基准及 05 / 15 / 21 推出 |

### 原著考据待办

| 编号 | 待办 | 当前默认 |
|---|---|---|
| XK06-SK-K01 | 核对谢烟客内功、掌力的原著描述与是否存在可用原名 | 总名和招名保留“原创扩展命名”，不写回目或引文 |
| XK06-SK-K02 | 核对丁不三、丁不四的明确武技、兵刃和传授关系 | 只保留丁氏家传背景，心法 / 擒拿名均标原创扩展 |
| XK06-SK-K03 | 核对侠客岛二使、二岛主除石壁参研外的常规行功描述 | 以公传气功补闭主运，不推定任何人已悟太玄 / 罗汉伏魔 |
| XK06-SK-K04 | 核对无妄神功的传授层级和白自在所用内功描述 | 保持既有无妄 6 品，新增高阶门内功明确标原创扩展 |

### 开放问题（附默认值）

| 编号 | 需作者 / 上游拍板 | 本版默认值 / 理由 |
|---|---|---|
| XK06-SK-O01 | 谢烟客个人传承的正式取得方式 | 默认“本人指点，或完成玄铁令守诺后取得手录”；符合个人独门另设条件，又让主角与其他人物可学 |
| XK06-SK-O02 | **已解决：**`sk_xiakedaoqigong` 的地中绝招数 | 取 1；原创公传 `F=0`，已由 `ultimate-counts-tianzhong-dizhong.md` §3.1B 显式裁定 |
| XK06-SK-O03 | 丁氏家传是否日后建立正式组织 ID | 默认不建；家族传承不等于可加入门派，沿现有 `sect:null` 即可 |
