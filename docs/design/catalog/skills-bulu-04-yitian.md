# 书界武学补录 · 04《倚天屠龙记》（`skills-bulu-04-yitian`）

> **归属（基准 §18）**：`design/catalog/skills-*.md` 的按书补录册。本文只定义《倚天屠龙记》首领配装确实缺少的武学、学习来源及其经脉接口；既有门派图鉴仍是原条目的唯一归属。
> **上游**：`docs/decisions/author-decisions.md`、`docs/decisions/author-requirements.md` AR-14/15/16、`docs/00-canon.md` §3–§5/§9/§12/§13/§16/§18/§20、`docs/decisions/rulings-v1.md`、`docs/decisions/ultimate-counts-tianzhong-dizhong.md`、`design/05`、`design/21`。
> **引用而不重定义**：既有倚天武学见 `skills-yitian.md`；少林武学见 `skills-shaolin.md`；通行武学见 `skills-general.md`；招式预算见 `design/05`；经脉路线、护体内劲与调息见 `design/21`；Buff 本体见 `design/06`；装备见 `design/10`；门派职级见 `design/17`。
> **覆盖声明**：本册补录明教 / 波斯总教、成昆旁支、昆仑、崆峒、华山倚天支与玄冥二老所缺条目，不修改十一册既有图鉴，不新增天级武学。首领只是这些武学的使用者之一；除个人旁支外，主角与其他人物均可依门派、职级、秘籍或奇遇正常习得。
> **标注约定**：**（原创扩展）**为原著没有的武学或玩法；**（原创扩展命名）**为原著有人物 / 兵器 / 劲力表现而总名或招名由本作补出；**（待考）**须以三联 / 广州修订版逐字核对；**【建议值】**为待归属文档确认的数值。
> **版本**：v1.0（首领武学补录与替补替换，2026-09-28）。

---

## 0. 阅读指引与绝招显式路线索引

本册新增 10 门地阶武学：3 门地上、7 门地中。原创地中均按统一裁定的回退下限取 1 记绝招；地上各 2 记。路线遵循 `design/21` §4.3：地阶每条 8 段、每段 90 CT，故 `1200+8×90=1920≤2000`。同门多绝招无共享穴位；所有序列均在全库查重。

<!-- skill-catalog-audit:start -->
| 品阶 | 武学 | MoveDef（正文卡镜像） | 路线 ID | steps（acupointRef/segmentCt/riskBp） |
|---|---|---|---|---|
| 9 地上 | `sk_mingjiaohujiaogong` | `mv_mingjiaohujiaogong_huguang` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_mingjiaohujiaogong_huguang; projection:false}` | `mfr_mingjiaohujiaogong_huguang` | `MeridianRouteDef{moveRef:mv_mingjiaohujiaogong_huguang; ultimate:true; purpose:defense}`；`ap_chongmai_qichong/90/100→ap_chongmai_dahe/90/110→ap_chongmai_huangshu/90/120→ap_daimai_wushu/90/130→ap_renmai_qihai/90/140→ap_renmai_guanyuan/90/150→ap_dumai_shendao/90/160→ap_dumai_baihui/90/170` |
| 9 地上 | `sk_mingjiaohujiaogong` | `mv_mingjiaohujiaogong_zhenjiao` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_mingjiaohujiaogong_zhenjiao; projection:false}` | `mfr_mingjiaohujiaogong_zhenjiao` | `MeridianRouteDef{moveRef:mv_mingjiaohujiaogong_zhenjiao; ultimate:true; purpose:defense}`；`ap_daimai_jingmen/90/100→ap_daimai_zhangmen/90/110→ap_chongmai_youmen/90/120→ap_chongmai_shiguan/90/130→ap_renmai_zhongwan/90/140→ap_renmai_danzhong/90/150→ap_shoujueyin_neiguan/90/160→ap_shoujueyin_laogong/90/170` |
| 9 地上 | `sk_huanyinxinfa` | `mv_huanyinxinfa_cangxi` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_huanyinxinfa_cangxi; projection:false}` | `mfr_huanyinxinfa_cangxi` | `MeridianRouteDef{moveRef:mv_huanyinxinfa_cangxi; ultimate:true; purpose:defense}`；`ap_yinwei_qimen/90/100→ap_yinwei_fuai/90/110→ap_yinqiao_jiaoxin/90/120→ap_yinqiao_sanyinjiao/90/130→ap_zujueyin_taichong/90/140→ap_zujueyin_ququan/90/150→ap_renmai_shenque/90/160→ap_renmai_qihai/90/170` |
| 9 地上 | `sk_huanyinxinfa` | `mv_huanyinxinfa_niliu` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_huanyinxinfa_niliu; projection:false}` | `mfr_huanyinxinfa_niliu` | `MeridianRouteDef{moveRef:mv_huanyinxinfa_niliu; ultimate:true; purpose:defense}`；`ap_zushaoyin_yongquan/90/100→ap_zushaoyin_taixi/90/110→ap_zushaoyin_yingu/90/120→ap_zutaiyin_taibai/90/130→ap_zutaiyin_yinlingquan/90/140→ap_renmai_huiyin/90/150→ap_renmai_zhongji/90/160→ap_renmai_guanyuan/90/170` |
| 9 地上 | `sk_huanyinshou` | `mv_huanyinshou_fuyin` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_huanyinshou_fuyin; projection:false}` | `mfr_huanyinshou_fuyin` | `MeridianRouteDef{moveRef:mv_huanyinshou_fuyin; ultimate:true; purpose:attack}`；`ap_yinqiao_zhaohai/90/100→ap_yinwei_zhubin/90/110→ap_zujueyin_ligou/90/120→ap_zutaiyin_xuehai/90/130→ap_shoujueyin_tianchi/90/140→ap_shoujueyin_quze/90/150→ap_shoujueyin_neiguan/90/160→ap_shoujueyin_laogong/90/170` |
| 9 地上 | `sk_huanyinshou` | `mv_huanyinshou_huisha` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_huanyinshou_huisha; projection:false}` | `mfr_huanyinshou_huisha` | `MeridianRouteDef{moveRef:mv_huanyinshou_huisha; ultimate:true; purpose:attack}`；`ap_zujueyin_dadun/90/100→ap_zujueyin_xingjian/90/110→ap_zushaoyin_fuliu/90/120→ap_renmai_zhongwan/90/130→ap_shoushaoyin_jiquan/90/140→ap_shouyangming_quchi/90/150→ap_shouyangming_shousanli/90/160→ap_shouyangming_hegu/90/170` |
| 8 地中 | `sk_jinhuazhangfa` | `mv_jinhuazhangfa_zhenzhen` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_jinhuazhangfa_zhenzhen; projection:false}` | `mfr_jinhuazhangfa_zhenzhen` | `MeridianRouteDef{moveRef:mv_jinhuazhangfa_zhenzhen; ultimate:true; purpose:attack}`；`ap_chongmai_henggu/90/100→ap_chongmai_qixue/90/110→ap_daimai_daimai/90/120→ap_yangqiao_jianyu/90/130→ap_shoushaoyang_waiguan/90/140→ap_shoushaoyang_yangchi/90/150→ap_shoutaiyang_wangu/90/160→ap_shoutaiyang_yanggu/90/170` |
| 8 地中 | `sk_jinhuabiaofa` | `mv_jinhuabiaofa_sanzhan` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_jinhuabiaofa_sanzhan; projection:false}` | `mfr_jinhuabiaofa_sanzhan` | `MeridianRouteDef{moveRef:mv_jinhuabiaofa_sanzhan; ultimate:true; purpose:attack}`；`ap_yinqiao_lieque/90/100→ap_yinwei_lianquan/90/110→ap_chongmai_siman/90/120→ap_renmai_chengjiang/90/130→ap_shoutaiyin_taiyuan/90/140→ap_shoutaiyin_yuji/90/150→ap_shouyangming_erjian/90/160→ap_shouyangming_shangyang/90/170` |
| 8 地中 | `sk_lutouzhangfa` | `mv_lutouzhangfa_hengjue` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_lutouzhangfa_hengjue; projection:false}` | `mfr_lutouzhangfa_hengjue` | `MeridianRouteDef{moveRef:mv_lutouzhangfa_hengjue; ultimate:true; purpose:attack}`；`ap_dumai_mingmen/90/100→ap_dumai_yaoyangguan/90/110→ap_yangwei_jianjing/90/120→ap_zushaoyang_yanglingquan/90/130→ap_shoushaoyang_tianjing/90/140→ap_shoushaoyang_zhigou/90/150→ap_shoutaiyang_houxi/90/160→ap_shoutaiyang_wangu/90/170` |
| 8 地中 | `sk_hezuibifa` | `mv_hezuibifa_fengxue` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_hezuibifa_fengxue; projection:false}` | `mfr_hezuibifa_fengxue` | `MeridianRouteDef{moveRef:mv_hezuibifa_fengxue; ultimate:true; purpose:attack}`；`ap_renmai_qugu/90/100→ap_chongmai_zhongzhu/90/110→ap_chongmai_yindu/90/120→ap_shoushaoyin_shenmen/90/130→ap_shoushaoyin_tongli/90/140→ap_shoujueyin_daling/90/150→ap_shoujueyin_ximen/90/160→ap_shoujueyin_zhongchong/90/170` |
| 8 地中 | `sk_kunlunliangyixinfa` | `mv_kunlunliangyixinfa_heyi` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_kunlunliangyixinfa_heyi; projection:false}` | `mfr_kunlunliangyixinfa_heyi` | `MeridianRouteDef{moveRef:mv_kunlunliangyixinfa_heyi; ultimate:true; purpose:defense}`；`ap_renmai_yinjiao/90/100→ap_renmai_shuifen/90/110→ap_chongmai_shangqu/90/120→ap_chongmai_huangshu/90/130→ap_daimai_zulinqi/90/140→ap_daimai_weidao/90/150→ap_shoujueyin_jianshi/90/160→ap_shoujueyin_neiguan/90/170` |
| 8 地中 | `sk_kongtongwuxingxinfa` | `mv_kongtongwuxingxinfa_guyuan` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_kongtongwuxingxinfa_guyuan; projection:false}` | `mfr_kongtongwuxingxinfa_guyuan` | `MeridianRouteDef{moveRef:mv_kongtongwuxingxinfa_guyuan; ultimate:true; purpose:defense}`；`ap_zutaiyin_dadu/90/100→ap_zutaiyin_diji/90/110→ap_chongmai_futonggu/90/120→ap_chongmai_qichong/90/130→ap_renmai_shimen/90/140→ap_renmai_zhongji/90/150→ap_shoushaoyin_shaohai/90/160→ap_shoushaoyin_shenmen/90/170` |
| 8 地中 | `sk_huashanliangyixinfa04` | `mv_huashanliangyixinfa04_huanyuan` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_huashanliangyixinfa04_huanyuan; projection:false}` | `mfr_huashanliangyixinfa04_huanyuan` | `MeridianRouteDef{moveRef:mv_huashanliangyixinfa04_huanyuan; ultimate:true; purpose:defense}`；`ap_yangqiao_fuyang/90/100→ap_yangqiao_shenmai/90/110→ap_yangwei_benshen/90/120→ap_yangwei_tianliao/90/130→ap_dumai_shenzhu/90/140→ap_dumai_zhiyang/90/150→ap_shouyangming_quchi/90/160→ap_shouyangming_hegu/90/170` |
<!-- skill-catalog-audit:end -->

路线命名均为 `mfr_<move suffix>`。绝招动作末端分别服从内功护体、掌、杖、暗器、笔的叙事终点；实体暗器和普通兵刃招均不算真气外放。

---

## 1. 明教、金花婆婆与波斯总教

### 1.1 `sk_mingjiaohujiaogong` 明教护教功（9 地上 · 内功 · 调和）**（原创扩展）**

> **来源归属**：据明教四大护教法王的组织地位与中土、波斯两支传承扩写；原著未见同名成套心法。与 `skills-yitian.md` 的明教 / 波斯总教体系同属一脉，但不改变既有 `sk_qiankun`、`sk_guangmingxinfa` 的定义。

| 字段 | 值 |
|---|---|
| 基础字段 | `category:inner`；`subType:inner`；`grade:9`；`origin:expanded`；`sect:sect_mingjiao`；`lineage: 明教护教法王传承`；`sourceChapters:[ch04_yitian]`；`nature:harmony`；`wOut/wIn:0/1`；`moveSlots:4` |
| meridians / breathProfileRef | `[mer_chongmai,mer_daimai]` **【建议值】** / `txp_mingjiaohujiaogong` |
| reqs | `attrs {con:48,wil:48,wis:42}`；`aptitude {apInner:50}`；`sect {id:sect_mingjiao,rank:4}`；`prereq [{skill:sk_guangmingxinfa,layer:7}]`；`hard:[sect,prereq]` |
| inner.contribution | `{mpMaxPct:34,hpMaxPct:20,attrs:{con:5,wil:5,wis:4},mpRegen:2.5}`；`IP=34+20+2×14+5×2.5=94.5`；`stats {resCC:8,resMind:7}` 合计 15 |
| 层数要点 | 1 重守明吐纳；4 重火云护脉；**7 重绝招护光**；**9 重绝招镇教**；10 重护教圆满 |
| setTags / conflicts | `[]` / 与阴、阳主运的相性只按 `design/05` §5.4；不提供毒、寒或点穴免疫 |
| special / observable | `{fusible:true}` / `true` |
| learnSources | 明教 L4 护教考校可学至 10 重；波斯总教译经或黛绮丝支线演授可学至 8 重。均是正常传承，不限首领专用 |
| description | 把护教法王用于守坛、护脉、稳住同伴的运劲法整理为调和内功；组织功能有据，固定功名、招名与数值为本作扩展 |

| 招式（ID；归属 `sk_mingjiaohujiaogong`） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 守明吐纳 `mv_mingjiaohujiaogong_shouming` **（原创扩展）** | 1 | 自身·支援 | 0 | 7%/3/900 | `bf_huinei` G=2·2 | — | `power=0`；回内由无伤害、cd3 支付；`MoveDef{unlock:1; ultimate:false; rageCost:0; mpCost:7%; cd:3; recovery:900; projection:false}` |
| 火云护脉 `mv_mingjiaohujiaogong_huoyun` **（原创扩展）** | 4 | 友方单体·0–2·支援 | 0 | 8%/3/1000 | 移除 1 层可驱散 `cold/poison` | — | `power=0`；单体驱散由无伤害、cd3 支付；`MoveDef{unlock:4; ultimate:false; rageCost:0; mpCost:8%; cd:3; recovery:1000; projection:false}` |
| 护光 `mv_mingjiaohujiaogong_huguang`（绝招，**原创扩展**） | 7 | 自身·支援 | 0 | 9%/—/1200 | `bf_hutizhenqi` 100%·3，护体=`hpMax×18%×1.2=21.6%`；气势 100 | — | 地阶单体治疗基准 18% 等价护体 ×1.2；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_mingjiaohujiaogong_huguang; projection:false}` |
| 镇教 `mv_mingjiaohujiaogong_zhenjiao`（绝招，**原创扩展**） | 9 | 自身及相邻友方·支援 | 0 | 9%/—/1200 | `bf_shoushi` 100%·3；气势 100 | — | 群体守势由无伤害、贴身范围与气势 100 支付；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_mingjiaohujiaogong_zhenjiao; projection:false}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 护教 | `ps_mingjiaohujiaogong_hujiao` | 3 | 相邻友方存在时 `resMind +4→+10` |
| 光明同守 | `ps_mingjiaohujiaogong_guangming` | 6 | 对友方施放支援招后自身获 `bf_wenzhong` G=1·2，每 2 回合 1 次 |
| 护教圆满 | `ps_mingjiaohujiaogong_dacheng` | 10 | 本功护体量 +10%，不改变 `design/21` 的内劲抵消率与资源守恒 |

### 1.2 `sk_jinhuazhangfa` 金花杖法（8 地中 · 兵器 / 杖 · 调和）**（原创扩展命名）**

> **来源归属**：金花婆婆持杖对敌及其具体招路须核对《倚天屠龙记》三联 / 广州修订版**（待考）**；成套武学名与招名均为本作命名。归入 `skills-yitian.md` 的明教 / 波斯总教体系，不借白驼山杖法。

| 字段 | 值 |
|---|---|
| 基础字段 | `category:weapon`；`subType:staff`；`grade:8`；`origin:canonExpanded`；`sect:sect_mingjiao`；`lineage: 紫衫龙王黛绮丝的中土化杖术`；`sourceChapters:[ch04_yitian]`；`nature:harmony`；`wOut/wIn:0.65/0.35`；`weaponReq:{category:staff}`；`moveSlots:4` |
| reqs | `attrs {str:40,agi:43,wis:38}`；`aptitude {apStaff:45}`；`sect {id:sect_mingjiao,rank:3}`；`prereq [{skill:sk_guangmingquan,layer:5}]`；`hard:[sect,prereq]` |
| layerStats | `{hit:[2,7],parry:[3,8]}`，第 10 重合计 15 |
| 层数要点 | 1 重点花；3 重横枝；5 重拨雾；**7 重绝招金花阵阵**；10 重花影归杖 |
| setTags / conflicts | `[]` / 普通杖击不因搭配阴性内功自动变成寒毒或真气外放 |
| special / observable | `{fusible:true}` / `true` |
| learnSources | 明教 L3 杖术考校、灵蛇岛留谱或黛绮丝支线演授，分别可至 8 / 10 / 10 重；玩家和其他合格角色均可学 |
| description | 以长杖点、挑、扫、拨掩护暗器换手；人物与兵器表现待考，玩法套路不宣称原著另有秘籍 |

| 招式（ID；归属 `sk_jinhuazhangfa`） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 点花 `mv_jinhuazhangfa_dianhua` **（原创扩展命名）** | 1 | 单体·1·近身 | 1.10 | 7%/1/1000 | — | 可 | `1×(1+0.12)=1.12≈1.10`；`MoveDef{unlock:1; ultimate:false; rageCost:0; mpCost:7%; cd:1; recovery:1000; projection:false}` |
| 横枝 `mv_jinhuazhangfa_hengzhi` **（原创扩展命名）** | 3 | `aoe_cone {angle:120,r:1,dirCount:6}`·近身 | 1.00 | 8%/2/1000 | — | 可 | N=3、AF=.85；`.85×(1+.24+.05)=1.0965≈1.10`，杖身换手手调 −.10 → 1.00；`MoveDef{unlock:3; ultimate:false; rageCost:0; mpCost:8%; cd:2; recovery:1000; projection:false}` |
| 拨雾 `mv_jinhuazhangfa_bowu` **（原创扩展命名）** | 5 | 单体·1·近身 | 1.05 | 8%/1/1000 | 击退 1；自身后撤 1 | 可 | `1×(1+.12+.05)−.05−.10=1.02≈1.05`；`MoveDef{unlock:5; ultimate:false; rageCost:0; mpCost:8%; cd:1; recovery:1000; projection:false}` |
| 金花阵阵 `mv_jinhuazhangfa_zhenzhen`（绝招，**原创扩展命名**） | 7 | `aoe_cone {angle:120,r:1,dirCount:6}`·近身 | 2.50 | 9%/—/1200 | `bf_shiheng` 50%·1；气势 100 | 可 | N=3、AF=.85；`3×.85−.10×.50=2.50`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_jinhuazhangfa_zhenzhen; projection:false}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 花影换手 | `ps_jinhuazhangfa_huanying` | 3 | 杖招后下一记暗器招命中 +5→+12；重复杖招不叠层 |
| 杖护周身 | `ps_jinhuazhangfa_zhanghu` | 6 | 本回合未移动时招架 +4→+10 |
| 花影归杖 | `ps_jinhuazhangfa_dacheng` | 10 | 成功招架后下一杖 Z3 +8%，每回合 1 次 |

### 1.3 `sk_jinhuabiaofa` 金花镖法（8 地中 · 暗器 · 阴）**（原创扩展命名）**

> **来源归属**：金花婆婆以金花状暗器示警、伤敌的细节与材质须核对修订版**（待考）**；“金花镖法”及以下招名均为本作命名。它是紫衫龙王一系对波斯总教投掷法的中土化整理，与 `skills-yitian.md` 的明教 / 波斯总教体系同源。

| 字段 | 值 |
|---|---|
| 基础字段 | `category:hidden`；`subType:hidden`；`hiddenKind:dart`；`grade:8`；`origin:canonExpanded`；`sect:sect_mingjiao`；`lineage: 紫衫龙王黛绮丝`；`sourceChapters:[ch04_yitian]`；`nature:yin`；`wOut/wIn:0.80/0.20`；`moveSlots:4` |
| reqs | `attrs {agi:45,wis:40}`；`aptitude {apHidden:46}`；`sect {id:sect_mingjiao,rank:3}`；`prereq [{skill:sk_shenghuotunajue,layer:5}]`；`hard:[aptitude,prereq]` |
| layerStats | `{hit:[3,9],crit:[2,6]}`，第 10 重合计 15 |
| 层数要点 | 1 重飞花；3 重错影；5 重回首；**7 重绝招金花三绽**；10 重花落无声 |
| setTags / conflicts | `[]` / 使用实体暗器与暗器囊；不因远射而算真气外放，弹药耗用归 `design/10` |
| special / observable | `{fusible:true}` / `true` |
| learnSources | 黛绮丝支线亲授可至 10 重；灵蛇岛留谱可至 8 重；明教 L3 经护教法王许可可至 7 重。均允许合格角色正常习得 |
| description | 以花形小镖错落投出，先扰视线与步点，再借杖势掩护换手；不把玩法中的连投招名冒充原著原句 |

| 招式（ID；归属 `sk_jinhuabiaofa`） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 飞花 `mv_jinhuabiaofa_feihua` **（原创扩展命名）** | 1 | 单体·1–4·实体投射 | 1.00 | 7%/1/1000 | — | 可 | `1×(1+.12)×.92=1.0304≈1.00`；`MoveDef{unlock:1; ultimate:false; rageCost:0; mpCost:7%; cd:1; recovery:1000; projection:false}` |
| 错影 `mv_jinhuabiaofa_cuoying` **（原创扩展命名）** | 3 | 乱击 n3 r4·实体投射 | 1.00 | 8%/2/1000 | — | 可 | AF=.85；`.85×(1+.24+.05)×.92=1.0088≈1.00`；`MoveDef{unlock:3; ultimate:false; rageCost:0; mpCost:8%; cd:2; recovery:1000; projection:false}` |
| 回首 `mv_jinhuabiaofa_huishou` **（原创扩展命名）** | 5 | 单体·1–3·实体投射 | 1.05 | 8%/2/1000 | 后撤 1；`bf_shiheng` 40%·1 | 可 | `1×(1+.24+.05)×.92−.10−.10×.40=1.0468≈1.05`；`MoveDef{unlock:5; ultimate:false; rageCost:0; mpCost:8%; cd:2; recovery:1000; projection:false}` |
| 金花三绽 `mv_jinhuabiaofa_sanzhan`（绝招，**原创扩展命名**） | 7 | 乱击 n3 r4·实体投射 | 2.25 | 9%/—/1200 | `bf_mabi` 30%·1；气势 100 | 可 | AF=.85；`3×.85×.92−.25×.30=2.271≈2.25`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_jinhuabiaofa_sanzhan; projection:false}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 杖影藏花 | `ps_jinhuabiaofa_canghua` | 3 | 杖招命中后下一记本功效果命中 +5→+12；不要求装配特定人物 |
| 花落听声 | `ps_jinhuabiaofa_tingsheng` | 6 | 对本回合已移动目标命中 +4→+10 |
| 花落无声 | `ps_jinhuabiaofa_dacheng` | 10 | 每回合首枚暗器的射程惩罚减半；不增加基础射程 |

波斯三使的 10 品主运未补。`sk_qiankun` 是明教 L5 教主镇教心法，非教主经张无忌私传也只到 8 重；三使不满足 9 重主运条件。波斯总教遣黛绮丝来中土求取心法、三使以圣火令武功见长的原著前提**（待考）**，也不支持直接复用；天级 51 门闭集不得新增，故按章节 §12.5 维持地位兜底并阻断正式构建。

---

## 2. 成昆旁支

### 2.1 `sk_huanyinxinfa` 幻阴心法（9 地上 · 内功 · 阴）**（原创扩展命名）**

> **来源归属**：成昆以幻阴指暗袭明教众人的人物与阴寒劲力有原著依据，具体回目**（待考）**；原著未见“幻阴心法”这一独立名称。本作将其作为成昆个人旁支的运劲根基，与 `skills-shaolin.md` 收录的 `sk_huanyinzhi` 同源，不归少林普授。

| 字段 | 值 |
|---|---|
| 基础字段 | `category:inner`；`subType:inner`；`grade:9`；`origin:expanded`；`sect:null`；`lineage: 成昆个人旁支`；`sourceChapters:[ch04_yitian]`；`nature:yin`；`wOut/wIn:0/1`；`moveSlots:4` |
| meridians / breathProfileRef | `[mer_yinwei,mer_yinqiao]` **【建议值】** / `txp_huanyinxinfa` |
| reqs | `attrs {con:48,wil:52,wis:45}`；`aptitude {apInner:50}`；`prereq [{skill:sk_huanyinzhi,layer:6}]`；`hard:[aptitude,prereq]` |
| inner.contribution | `{mpMaxPct:34,hpMaxPct:20,attrs:{con:5,wil:6,wis:3},mpRegen:2.5}`；`IP=34+20+2×14+5×2.5=94.5`；`stats {effHit:8,resCold:7}` 合计 15 |
| 层数要点 | 1 重敛阴；4 重潜息；**7 重绝招藏息**；**9 重绝招逆流**；10 重幻阴圆满 |
| setTags / conflicts | `[]` / 阴性主运相性按 `design/05` §5.4；不等于玄冥传承，也不授寒毒免疫 |
| special / observable | `{fusible:false}` / `false` |
| learnSources | 邪线由成昆受控同行时私授可至 10 重；`q_04_qiyu_83`“圆真遗册”复核后可至 8 重并沿既有选择承担品德代价。个人独门来源是否允许玩家满层，见 §11.5，默认保留该路径 |
| description | 以敛息、藏劲与逆转受力为核心的阴性内功，是为闭合成昆合法画像所作的个人旁支扩展；不把“混元霹雳手”称号另建武学 |

| 招式（ID；归属 `sk_huanyinxinfa`） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 敛阴 `mv_huanyinxinfa_lianyin` **（原创扩展）** | 1 | 自身·支援 | 0 | 7%/3/900 | `bf_wenzhong` G=1·2 | — | `power=0`；自用防势由无伤害、cd3 支付；`MoveDef{unlock:1; ultimate:false; rageCost:0; mpCost:7%; cd:3; recovery:900; projection:false}` |
| 潜息 `mv_huanyinxinfa_qianxi` **（原创扩展）** | 4 | 自身·支援 | 0 | 8%/3/1000 | `bf_piaohu` G=1·2 | — | `power=0`；闪避增益由无伤害、cd3 支付；`MoveDef{unlock:4; ultimate:false; rageCost:0; mpCost:8%; cd:3; recovery:1000; projection:false}` |
| 藏息 `mv_huanyinxinfa_cangxi`（绝招，**原创扩展**） | 7 | 自身·支援 | 0 | 9%/—/1200 | `bf_piaohu` G=3·3；气势 100 | — | 支援绝招以气势 100、地阶基准耗内 +2pp 与收招 1200 支付；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_huanyinxinfa_cangxi; projection:false}` |
| 逆流 `mv_huanyinxinfa_niliu`（绝招，**原创扩展**） | 9 | 自身·支援 | 0 | 9%/—/1200 | `bf_hutizhenqi` 100%·3，护体=`hpMax×18%×1.2=21.6%`；气势 100 | — | 地阶单体治疗基准 18% 等价护体 ×1.2；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_huanyinxinfa_niliu; projection:false}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 隐劲 | `ps_huanyinxinfa_yinjin` | 3 | 本回合未移动时幻阴系招式效果命中 +4→+10 |
| 藏锋 | `ps_huanyinxinfa_cangfeng` | 6 | 成功闪避后下一记幻阴系外功 Z3 +6%，每回合 1 次 |
| 幻阴圆满 | `ps_huanyinxinfa_dacheng` | 10 | 气血低于 35% 时本功护体量 +10%；不改变内劲抵消档位 |

### 2.2 `sk_huanyinshou` 幻阴手（9 地上 · 拳脚 / 掌 · 阴）**（原创扩展命名）**

> **来源归属**：本作从成昆的幻阴指与阴寒暗袭表现扩写为近身掌手体系；原著未见“幻阴手”这一成套武学名及以下招名。它与 `skills-shaolin.md` 的 `sk_huanyinzhi` 同属成昆个人旁支，不是少林门人通学。

| 字段 | 值 |
|---|---|
| 基础字段 | `category:unarmed`；`subType:fist`；`grade:9`；`origin:expanded`；`sect:null`；`lineage: 成昆个人旁支`；`sourceChapters:[ch04_yitian]`；`nature:yin`；`wOut/wIn:0.30/0.70`；`moveSlots:4` |
| reqs | `attrs {agi:46,wil:48}`；`aptitude {apFist:48,apInner:48}`；`prereq [{skill:sk_huanyinzhi,layer:6},{skill:sk_huanyinxinfa,layer:6}]`；`hard:[prereq]` |
| layerStats | `{effHit:[3,9],pierce:[2,6]}`，第 10 重合计 15 |
| 层数要点 | 1 重阴掌；4 重错步回身；**7 重绝招伏阴**；**9 重绝招回煞**；10 重幻手无迹 |
| setTags / conflicts | `[]` / 不继承 `sk_xuanming` 的寒毒与双老协同；普通掌劲不判真气外放 |
| special / observable | `{fusible:false}` / `false` |
| learnSources | 与 `sk_huanyinxinfa` 相同：成昆私授可至 10 重；`q_04_qiyu_83` 遗册复核可至 8 重。是否保留满层玩家来源由 §11.5 请求确认 |
| description | 以贴身阴劲、错身暗袭补足成昆 9 品外功画像；它不覆盖既有幻阴指，也不把成昆称号注册为另一门武学 |

| 招式（ID；归属 `sk_huanyinshou`） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 阴掌 `mv_huanyinshou_yinzhang` **（原创扩展）** | 1 | 单体·1·近身 | 1.15 | 8%/1/1000 | `bf_neishang` 40%·2 | 可 | `1×(1+.12+.05)−.10×.40=1.13≈1.15`；`MoveDef{unlock:1; ultimate:false; rageCost:0; mpCost:8%; cd:1; recovery:1000; projection:false}` |
| 错步回身 `mv_huanyinshou_cuobu` **（原创扩展）** | 4 | `aoe_behind`·1·近身 | 1.00 | 8%/2/1000 | 绕背；`bf_shiheng` 40%·1 | 可 | AF=.90；`.90×(1+.24+.05)−.15−.10×.40=0.971≈1.00`；`MoveDef{unlock:4; ultimate:false; rageCost:0; mpCost:8%; cd:2; recovery:1000; projection:false}` |
| 伏阴 `mv_huanyinshou_fuyin`（绝招，**原创扩展**） | 7 | 单体·1·近身 | 2.90 | 9%/—/1200 | `bf_neishang` 100%·3；气势 100 | 可 | `3.00−.10=2.90`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_huanyinshou_fuyin; projection:false}` |
| 回煞 `mv_huanyinshou_huisha`（绝招，**原创扩展**） | 9 | 直线 n2·近身 | 2.50 | 9%/—/1200 | `bf_xueweishoufeng(level:8,acupointRef:sourcePrimary)` 25%·1；气势 100 | 可 | AF=.85；`3×.85−.20×.25=2.50`；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_huanyinshou_huisha; projection:false}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 暗袭 | `ps_huanyinshou_anxi` | 3 | 从侧后方出招时命中 +4→+10 |
| 阴劲入里 | `ps_huanyinshou_ruli` | 6 | 对已有 `injury` 标签减益的目标 Z3 +4%→+10% |
| 幻手无迹 | `ps_huanyinshou_dacheng` | 10 | 每战第一次被招架时，自身后撤 1 格并获得 `bf_piaohu` G=1·1 |

---

## 3. 玄冥二老

### 3.1 `sk_lutouzhangfa` 鹿头杖法（8 地中 · 兵器 / 杖 · 阴）**（原创扩展命名）**

> **来源归属**：鹿杖客以鹿角杖为兵器有原著依据，固定杖法名与招名未见，故为本作扩展命名；具体交手段落**（待考）**。与 `skills-yitian.md` 的玄冥二老传承同属一系，专用名器 `eq_luzhang` 已由 `design/10` 定义。

| 字段 | 值 |
|---|---|
| 基础字段 | `category:weapon`；`subType:staff`；`grade:8`；`origin:canonExpanded`；`sect:null`；`lineage: 玄冥传承·鹿杖客支`；`sourceChapters:[ch04_yitian]`；`nature:yin`；`wOut/wIn:0.70/0.30`；`weaponReq:{category:staff,altItems:[eq_luzhang]}`；`moveSlots:4` |
| reqs | `attrs {str:44,con:40}`；`aptitude {apStaff:45}`；`prereq [{skill:sk_xuanmingxinfa,layer:5}]`；`hard:[aptitude,prereq]` |
| layerStats | `{parry:[3,8],hit:[2,7]}`，第 10 重合计 15 |
| 层数要点 | 1 重角顶；3 重横扫；5 重缠地；**7 重绝招鹿角横绝**；10 重寒杖归一 |
| setTags / conflicts | `[]` / `eq_luzhang` 的玄冥寒气特效归装备；此卡不重复施加，也不把杖击标为外放 |
| special / observable | `{fusible:true}` / `true` |
| learnSources | 鹿杖客羁绊或换俘支线可至 10 重；汝阳王府武库残谱可至 8 重。个人分支是否允许满层玩家来源见 §11.5，默认保留 |
| description | 以鹿角挂、顶、扫、压构成的沉重杖路；不持鹿杖时仍可用普通杖，但失去名器特效 |

| 招式（ID；归属 `sk_lutouzhangfa`） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 鹿角顶 `mv_lutouzhangfa_jiaoding` **（原创扩展命名）** | 1 | 单体·1·近身 | 1.10 | 7%/1/1000 | 击退 1 | 可 | `1×(1+.12)−.05=1.07≈1.10`；`MoveDef{unlock:1; ultimate:false; rageCost:0; mpCost:7%; cd:1; recovery:1000; projection:false}` |
| 横扫 `mv_lutouzhangfa_hengsao` **（原创扩展命名）** | 3 | `aoe_cone {angle:120,r:1,dirCount:6}`·近身 | 1.05 | 8%/2/1000 | — | 可 | N=3、AF=.85；`.85×(1+.24+.05)=1.0965≈1.10`，重杖转势手调 −.05 → 1.05；`MoveDef{unlock:3; ultimate:false; rageCost:0; mpCost:8%; cd:2; recovery:1000; projection:false}` |
| 缠地 `mv_lutouzhangfa_chandi` **（原创扩展命名）** | 5 | 单体·1·近身 | 1.05 | 8%/2/1000 | `bf_jiansu` 60%·2 | 可 | `1×(1+.24+.05)−.10×.60=1.23`，钩足稳定性手调 −.18 → 1.05；`MoveDef{unlock:5; ultimate:false; rageCost:0; mpCost:8%; cd:2; recovery:1000; projection:false}` |
| 鹿角横绝 `mv_lutouzhangfa_hengjue`（绝招，**原创扩展命名**） | 7 | 直线 n3·近身 | 2.45 | 9%/—/1200 | 击退 2；气势 100 | 可 | AF=.85；`3×.85−.05×2=2.45`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_lutouzhangfa_hengjue; projection:false}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 鹿角挂兵 | `ps_lutouzhangfa_lujiao` | 3 | 对持械目标招架 +4→+10 |
| 玄寒入杖 | `ps_lutouzhangfa_hanjin` | 6 | 装备 `eq_luzhang` 时只启用该装备既有“玄冥寒气”，不追加第二次概率 |
| 寒杖归一 | `ps_lutouzhangfa_dacheng` | 10 | 成功击退目标后下一杖 Z3 +8%，每回合 1 次 |

### 3.2 `sk_hezuibifa` 鹤嘴笔法（8 地中 · 兵器 / 奇门（笔）· 阴）**（原创扩展命名）**

> **来源归属**：鹤笔翁使用鹤嘴双笔有原著依据，固定成套笔法名与以下招名未见；具体交手与点穴表现**（待考）**。与 `skills-yitian.md` 的玄冥二老传承同属一系，`eq_hebi` 已由 `design/10` 定义。

| 字段 | 值 |
|---|---|
| 基础字段 | `category:weapon`；`subType:exotic`；`grade:8`；`origin:canonExpanded`；`sect:null`；`lineage: 玄冥传承·鹤笔翁支`；`sourceChapters:[ch04_yitian]`；`nature:yin`；`wOut/wIn:0.60/0.40`；`weaponReq:{category:exotic,kinds:[brush],dual:true,altItems:[eq_hebi]}`；`moveSlots:4` |
| reqs | `attrs {agi:44,wis:42}`；`aptitude {apExotic:45}`；`prereq [{skill:sk_xuanmingxinfa,layer:5}]`；`hard:[aptitude,prereq]` |
| layerStats | `{seal:[3,9],hit:[2,6]}`，第 10 重合计 15 |
| 层数要点 | 1 重啄脉；3 重双分；5 重回笔；**7 重绝招鹤嘴封穴**；10 重双笔归一 |
| setTags / conflicts | `[]` / 点穴均用 `bf_xueweishoufeng`；`eq_hebi` 的 10% 九级点穴为装备效果，不与本卡同名效果重复触发 |
| special / observable | `{fusible:true}` / `true` |
| learnSources | 鹤笔翁羁绊或换俘支线可至 10 重；王府缴获笔谱可至 8 重。个人分支是否允许满层玩家来源见 §11.5，默认保留 |
| description | 双笔一架一啄，以短促手法寻隙点穴；不持成对判官笔仍可改单笔施展，但失去双分与名器特效 |

| 招式（ID；归属 `sk_hezuibifa`） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 啄脉 `mv_hezuibifa_dianmai` **（原创扩展命名）** | 1 | 单体·1·近身 | 1.05 | 7%/1/1000 | `bf_xueweishoufeng(level:7,acupointRef:sourcePrimary)` 30%·1 | 可 | `1×(1+.12)−.20×.30=1.06≈1.05`；`MoveDef{unlock:1; ultimate:false; rageCost:0; mpCost:7%; cd:1; recovery:1000; projection:false}` |
| 双笔分门 `mv_hezuibifa_shuangfen` **（原创扩展命名）** | 3 | 乱击 n2 r1·近身 | 1.05 | 8%/2/1000 | — | 可 | AF=.90；`.90×(1+.24+.05)=1.161`，双手命中分摊手调 −.11 → 1.05；`MoveDef{unlock:3; ultimate:false; rageCost:0; mpCost:8%; cd:2; recovery:1000; projection:false}` |
| 回笔护门 `mv_hezuibifa_huibi` **（原创扩展命名）** | 5 | 单体·1·近身 | 1.05 | 8%/1/1000 | 自身 `bf_shoushi` G=1·1 | 可 | `1×(1+.12+.05)−.10=1.07≈1.05`；`MoveDef{unlock:5; ultimate:false; rageCost:0; mpCost:8%; cd:1; recovery:1000; projection:false}` |
| 鹤嘴封穴 `mv_hezuibifa_fengxue`（绝招，**原创扩展命名**） | 7 | 单体·1·近身 | 2.80 | 9%/—/1200 | `bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)` 100%·1；气势 100 | 可 | `3.00−.20=2.80`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_hezuibifa_fengxue; projection:false}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 认穴 | `ps_hezuibifa_renxue` | 3 | 本功点穴效果命中 +4→+10pp |
| 双笔分守 | `ps_hezuibifa_shuangbi` | 6 | 满足 `weaponReq.dual` 时招架 +4→+10 |
| 双笔归一 | `ps_hezuibifa_dacheng` | 10 | 对已有穴位受封的目标 Z3 +8%；不提高封穴等级 |

**未闭合主运**：现有 `sk_xuanmingxinfa` 仅 6 品，`sk_xuanming` 是 10 品外功。天级武学只能来自 Canon 闭集，故本册不能为二老另造 10 品内功；§11.5 与书界 §12.5 继续保留 `10/9/yin` 地位兜底并阻断正式画像。

---

## 4. 昆仑、崆峒与华山倚天支

### 4.1 `sk_kunlunliangyixinfa` 昆仑两仪心法（8 地中 · 内功 · 调和）**（原创扩展）**

> **来源归属**：依昆仑派正两仪剑法的阴阳协同扩写，原著未见同名独立心法。与 `skills-yitian.md` 的昆仑体系同属一门，是 `sk_kunlunxinfa` 到 `sk_zhengliangyi` 之间的高阶运劲课。

| 字段 | 值 |
|---|---|
| 基础字段 | `category:inner`；`subType:inner`；`grade:8`；`origin:expanded`；`sect:sect_kunlun`；`lineage: 昆仑两仪剑理`；`sourceChapters:[ch04_yitian]`；`nature:harmony`；`wOut/wIn:0/1`；`moveSlots:4` |
| meridians / breathProfileRef | `[mer_chongmai,mer_daimai]` **【建议值】** / `txp_kunlunliangyixinfa` |
| reqs | `attrs {con:42,wis:45,wil:40}`；`aptitude {apInner:45}`；`sect {id:sect_kunlun,rank:4}`；`prereq [{skill:sk_kunlunxinfa,layer:7},{skill:sk_yudafeihuajian,layer:5}]`；`hard:[sect,prereq]` |
| inner.contribution | `{mpMaxPct:30,hpMaxPct:18,attrs:{agi:4,wis:5,wil:3},mpRegen:2.2}`；`IP=30+18+2×12+5×2.2=83`；`stats {parry:8,resCold:7}` 合计 15 |
| 层数要点 | 1 重阴阳吐纳；3 重转仪；5 重守正；**7 重绝招两仪合一**；10 重六十四变 |
| setTags / conflicts | `[]` / 只强化昆仑同门运劲，不把两人夹击改写成强制合击 |
| special / observable | `{fusible:true}` / `true` |
| learnSources | 昆仑 L4 掌剑 / 执事考校可至 10 重；何太冲或班淑娴个人授艺可至 10 重；光明顶两仪观摩仅可至 6 重。主角与其他门人均按正常途径可学 |
| description | 以正反、进退互换稳定剑势的高阶心法；两仪思想与正两仪招理有据，独立心法及主动招均为玩法扩展 |

| 招式（ID；归属 `sk_kunlunliangyixinfa`） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 阴阳吐纳 `mv_kunlunliangyixinfa_tuna` **（原创扩展）** | 1 | 自身·支援 | 0 | 7%/3/900 | `bf_huinei` G=1·2 | — | `power=0`；回内由无伤害、cd3 支付；`MoveDef{unlock:1; ultimate:false; rageCost:0; mpCost:7%; cd:3; recovery:900; projection:false}` |
| 转仪 `mv_kunlunliangyixinfa_huanzhuan` **（原创扩展）** | 3 | 自身·支援 | 0 | 7%/3/1000 | 移除 1 个可驱散 `cold/heat` | — | `power=0`；单体自净由无伤害、cd3 支付；`MoveDef{unlock:3; ultimate:false; rageCost:0; mpCost:7%; cd:3; recovery:1000; projection:false}` |
| 守一 `mv_kunlunliangyixinfa_shouyi` **（原创扩展）** | 5 | 自身·支援 | 0 | 8%/3/1000 | `bf_dingxin` G=2·2 | — | `power=0`；心神增益由无伤害、cd3 支付；`MoveDef{unlock:5; ultimate:false; rageCost:0; mpCost:8%; cd:3; recovery:1000; projection:false}` |
| 两仪合一 `mv_kunlunliangyixinfa_heyi`（绝招，**原创扩展**） | 7 | 自身·支援 | 0 | 9%/—/1200 | `bf_hutizhenqi` 100%·3，护体=`hpMax×18%×1.2=21.6%`；气势 100 | — | 地阶单体治疗基准 18% 等价护体 ×1.2；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_kunlunliangyixinfa_heyi; projection:false}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 两仪根基 | `ps_kunlunliangyixinfa_liangyi` | 3 | 昆仑剑法修炼效率 +5%→+12% |
| 雪峰定息 | `ps_kunlunliangyixinfa_xuefeng` | 6 | 高寒地形中 `resCold +4→+10` |
| 六十四变 | `ps_kunlunliangyixinfa_dacheng` | 10 | 连续使用不同昆仑招式时第二招招架 +8；重复招式清除 |

### 4.2 `sk_kongtongwuxingxinfa` 崆峒五行心法（8 地中 · 内功 · 调和）**（原创扩展）**

> **来源归属**：七伤拳以人体阴阳五行、五脏七伤立论有原著依据，安全调养的独立高阶心法名未见，故为本作扩展。与 `skills-yitian.md` 的崆峒体系同属一门，承接 `sk_kongtongyangshenggong`，不重写 `sk_qishangquan` 的自伤规则。

| 字段 | 值 |
|---|---|
| 基础字段 | `category:inner`；`subType:inner`；`grade:8`；`origin:expanded`；`sect:sect_kongtong`；`lineage: 崆峒五行养脏一系`；`sourceChapters:[ch04_yitian]`；`nature:harmony`；`wOut/wIn:0/1`；`moveSlots:4` |
| meridians / breathProfileRef | `[mer_renmai,mer_chongmai]` **【建议值】** / `txp_kongtongwuxingxinfa` |
| reqs | `attrs {con:46,wil:42,wis:40}`；`aptitude {apInner:45}`；`sect {id:sect_kongtong,rank:4}`；`prereq [{skill:sk_kongtongyangshenggong,layer:7},{skill:sk_qishangchujue,layer:6}]`；`hard:[sect,prereq]` |
| inner.contribution | `{mpMaxPct:30,hpMaxPct:18,attrs:{con:6,wil:4,wis:2},mpRegen:2.2}`；`IP=30+18+2×12+5×2.2=83`；`stats {resInjury:10,tough:5}` 合计 15 |
| 层数要点 | 1 重调和五脏；3 重养脏；5 重换劲；**7 重绝招五行固元**；10 重五行圆满 |
| setTags / conflicts | `[]` / 只降低七伤训练风险，不免除 `design/05` §9.1.1 的主运与品阶条件；本任务不越权修改既有正式套装成员 |
| special / observable | `{fusible:true}` / `true` |
| learnSources | 崆峒 L4 五老共同考校可至 10 重；救治走火弟子与归还拳谱线索后可至 8 重。是门派正常高阶传承，非首领专用 |
| description | 先调五脏、再换七劲的护脉心法；用于让崆峒高阶弟子安全承接七伤拳，而非无条件抹除其代价 |

| 招式（ID；归属 `sk_kongtongwuxingxinfa`） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 调和五脏 `mv_kongtongwuxingxinfa_tiaohe` **（原创扩展）** | 1 | 自身·支援 | 0 | 7%/3/900 | 移除 1 层可驱散 `injury` | — | `power=0`；单层自净由无伤害、cd3 支付；`MoveDef{unlock:1; ultimate:false; rageCost:0; mpCost:7%; cd:3; recovery:900; projection:false}` |
| 养脏 `mv_kongtongwuxingxinfa_yangzang` **（原创扩展）** | 3 | 自身·支援 | 0 | 7%/3/1000 | `bf_wenzhong` G=2·2 | — | `power=0`；稳态增益由无伤害、cd3 支付；`MoveDef{unlock:3; ultimate:false; rageCost:0; mpCost:7%; cd:3; recovery:1000; projection:false}` |
| 换劲 `mv_kongtongwuxingxinfa_huanjin` **（原创扩展）** | 5 | 自身·支援 | 0 | 8%/4/1000 | 下一记崆峒拳招效果命中 +15pp | — | `power=0`；单次条件增益由无伤害、cd4 支付；`MoveDef{unlock:5; ultimate:false; rageCost:0; mpCost:8%; cd:4; recovery:1000; projection:false}` |
| 五行固元 `mv_kongtongwuxingxinfa_guyuan`（绝招，**原创扩展**） | 7 | 自身·支援 | 0 | 9%/—/1200 | 清除 2 层可驱散 `injury`，获 `bf_hutizhenqi`（12% hpMax）3 回合；气势 100 | — | 标准 18% 治疗价值折为 12% 护体并支付双层自净；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_kongtongwuxingxinfa_guyuan; projection:false}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 五行调息 | `ps_kongtongwuxingxinfa_wuxing` | 3 | 战外疗伤对自身的 `repairUnits +1`；仍由调息档案结算 |
| 护脏 | `ps_kongtongwuxingxinfa_huzang` | 6 | 七伤类自伤概率 −5→−12pp；不得低于 `design/05` 的最低代价 |
| 五行圆满 | `ps_kongtongwuxingxinfa_dacheng` | 10 | 每战首次新建 `bf_neishang` 时少 1 层，最低 0 |

### 4.3 `sk_huashanliangyixinfa04` 华山两仪心法（倚天支）（8 地中 · 内功 · 调和）**（原创扩展）**

> **来源归属**：依华山倚天支反两仪刀法的刚柔逆转扩写，原著未见同名独立心法。与 `skills-yitian.md` 的华山倚天支同属一门；后缀 `04` 用来避免把本条误当笑傲或碧血时代传承，不建立废弃门派 ID。

| 字段 | 值 |
|---|---|
| 基础字段 | `category:inner`；`subType:inner`；`grade:8`；`origin:expanded`；`sect:sect_huashan`；`lineage: 华山倚天支两仪刀理`；`sourceChapters:[ch04_yitian]`；`nature:harmony`；`wOut/wIn:0/1`；`moveSlots:4` |
| meridians / breathProfileRef | `[mer_dumai,mer_yangwei]` **【建议值】** / `txp_huashanliangyixinfa04` |
| reqs | `attrs {con:43,str:42,wil:42}`；`aptitude {apInner:45}`；`sect {id:sect_huashan,rank:4}`；`prereq [{skill:sk_huashanxinfa04,layer:7},{skill:sk_liangyidaojia,layer:6}]`；`hard:[sect,prereq]` |
| inner.contribution | `{mpMaxPct:30,hpMaxPct:18,attrs:{con:4,str:4,wil:4},mpRegen:2.2}`；`IP=30+18+2×12+5×2.2=83`；`stats {parry:8,resCC:7}` 合计 15 |
| 层数要点 | 1 重抱元；3 重回转；5 重互易；**7 重绝招反正还元**；10 重两仪圆满 |
| setTags / conflicts | `[]` / 仅限倚天时代分支；不向后世华山气宗、剑宗自动继承 |
| special / observable | `{fusible:true}` / `true` |
| learnSources | 华山倚天支 L4 长老 / 堂主考校可至 10 重；完成险峰护送与两仪化四象协同考校可至 8 重。主角与其他本支门人均可学 |
| description | 以刚柔、进退和高低两式相换为主的倚天支内功；只补该时代战斗链，不证明跨时代同名师承 |

| 招式（ID；归属 `sk_huashanliangyixinfa04`） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 抱元 `mv_huashanliangyixinfa04_baoyuan` **（原创扩展）** | 1 | 自身·支援 | 0 | 7%/3/900 | `bf_wenzhong` G=1·2 | — | `power=0`；防势由无伤害、cd3 支付；`MoveDef{unlock:1; ultimate:false; rageCost:0; mpCost:7%; cd:3; recovery:900; projection:false}` |
| 阴阳回转 `mv_huashanliangyixinfa04_huizhuan` **（原创扩展）** | 3 | 自身·支援 | 0 | 7%/3/1000 | 本回合刀招招架 +8 | — | `power=0`；限时单类增益由无伤害、cd3 支付；`MoveDef{unlock:3; ultimate:false; rageCost:0; mpCost:7%; cd:3; recovery:1000; projection:false}` |
| 高低互易 `mv_huashanliangyixinfa04_huyi` **（原创扩展）** | 5 | 自身·支援 | 0 | 8%/3/1000 | 下一记华山倚天支刀招命中 +10 | — | `power=0`；单次条件增益由无伤害、cd3 支付；`MoveDef{unlock:5; ultimate:false; rageCost:0; mpCost:8%; cd:3; recovery:1000; projection:false}` |
| 反正还元 `mv_huashanliangyixinfa04_huanyuan`（绝招，**原创扩展**） | 7 | 自身·支援 | 0 | 9%/—/1200 | `bf_hutizhenqi` 100%·3，护体=`hpMax×18%×1.2=21.6%`；气势 100 | — | 地阶单体治疗基准 18% 等价护体 ×1.2；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_huashanliangyixinfa04_huanyuan; projection:false}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 两仪根基 | `ps_huashanliangyixinfa04_liangyi` | 3 | 华山倚天支刀法修炼效率 +5%→+12% |
| 险峰立势 | `ps_huashanliangyixinfa04_xianfeng` | 6 | 高处或窄道格中招架 +4→+10 |
| 两仪圆满 | `ps_huashanliangyixinfa04_dacheng` | 10 | 成功招架后下一记反两仪刀招 Z3 +8%，每回合 1 次 |

---

## 5. 来源扩展登记

本任务没有只缺 `sourceChapters` 的复用项；下列两项已由原图鉴原生登记 `ch04_yitian`，故不产生待 NXfix 落实的来源扩展。波斯三使主运未补，不把 `sk_qiankun` 登记为复用项：

| 武学 | 本书用途 | 原图鉴与依据 | 处理 |
|---|---|---|---|
| `sk_jingangbuhuai` | 三渡主运，10 品阳 | `skills-shaolin.md`；原生书界含倚天且已有渡厄授艺来源 | 直接复用 |
| `sk_huanyinzhi` | 成昆旧有辅外功 / 新增两门前置 | `skills-shaolin.md`；成昆个人旁支，原生倚天 | 直接复用 |

---

## 6. 外放候选审计表

| 武学 / 招式组 | 投送介质 | `projection` | 判定 |
|---|---|---:|---|
| `sk_mingjiaohujiaogong`、`sk_huanyinxinfa` 的支援招 | 护体、回内、驱散或姿态 | `false` | 纯支援 / 纯护体不是真气离体伤敌 |
| `sk_huanyinshou` | 近身掌手 | `false` | 全部接触命中；“阴劲”性质不等于外放 |
| `sk_jinhuazhangfa`、`sk_lutouzhangfa`、`sk_hezuibifa` | 杖、鹿杖、鹤嘴双笔的实体挥击 | `false` | 普通兵刃挥击不算外放 |
| `sk_jinhuabiaofa` | 实体花形暗器 | `false` | 暗器投掷即使有 4 格射程也不算真气外放 |
| 昆仑 / 崆峒 / 华山三门新增内功 | 护体、运劲、驱散 | `false` | 无离体伤害段 |

因此本册新增 40 个 `MoveDef` 全为 `projection:false`，不填写 `projectionSpreadSteps`；13 条绝招路线无需满足外放手部端点条件。

---

## 7. 内功调息档案与护体内劲

字段和算法唯一见 `design/21` §10；本册只登记实例。五门内功均为满 10 重、`scope:3`、`ct:1000`、`mpCostBp:0`、`outOfBattleScaleBp:15000`。9 品非调和为 `2200/516`，调和乘 10500 bp 为 `2310/541`；8 品非调和为 `2100/492`，调和为 `2205/516`。

| 内功 | breathProfileRef / 正式档案 | `relief/repair` | innerGuard |
|---|---|---|---|
| `sk_mingjiaohujiaogong` | `txp_mingjiaohujiaogong` `BreathProfile{grade:9;layer:10;nature:harmony;scope:3;ct:1000;mpCostBp:0;outOfBattleScaleBp:15000}` | `floor((500+100×9+80×10)×1.05)=2310` / `floor((120+24×9+18×10)×1.05)=541` | `{enabled:true,guard:harmony-high,reflectBp:0}`；自然 `K-HN2`；`mv_mingjiaohujiaogong_huguang→K-HD4` |
| `sk_huanyinxinfa` | `txp_huanyinxinfa` `BreathProfile{grade:9;layer:10;nature:yin;scope:3;ct:1000;mpCostBp:0;outOfBattleScaleBp:15000}` | `500+100×9+80×10=2200` / `120+24×9+18×10=516` | `{enabled:true,guard:yin-high,reflectBp:0}`；自然 `K-YN2`；`mv_huanyinxinfa_niliu→K-YD4` |
| `sk_kunlunliangyixinfa` | `txp_kunlunliangyixinfa` `BreathProfile{grade:8;layer:10;nature:harmony;scope:3;ct:1000;mpCostBp:0;outOfBattleScaleBp:15000}` | `floor((500+100×8+80×10)×1.05)=2205` / `floor((120+24×8+18×10)×1.05)=516` | `{enabled:true,guard:harmony-high,reflectBp:0}`；自然 `K-HN2`；`mv_kunlunliangyixinfa_heyi→K-HD4` |
| `sk_kongtongwuxingxinfa` | `txp_kongtongwuxingxinfa` `BreathProfile{grade:8;layer:10;nature:harmony;scope:3;ct:1000;mpCostBp:0;outOfBattleScaleBp:15000}` | `2205/516` | `{enabled:true,guard:harmony-high,reflectBp:0}`；自然 `K-HN2`；`mv_kongtongwuxingxinfa_guyuan→K-HD4` |
| `sk_huashanliangyixinfa04` | `txp_huashanliangyixinfa04` `BreathProfile{grade:8;layer:10;nature:harmony;scope:3;ct:1000;mpCostBp:0;outOfBattleScaleBp:15000}` | `2205/516` | `{enabled:true,guard:harmony-high,reflectBp:0}`；自然 `K-HN2`；`mv_huashanliangyixinfa04_huanyuan→K-HD4` |

护体仍须合法自然短路或 `purpose:defense` 路线；1 MP 抵消 2 伤害、适用率、击穿迟滞和结算顺序均不在本册重定义。

---

## 8. 统计表

| 归属 | 9 地上 | 8 地中 | 内功 | 拳脚 | 兵器 | 暗器 | 合计 |
|---|---:|---:|---:|---:|---:|---:|---:|
| 明教 / 波斯总教 | 1 | 2 | 1 | 0 | 1 | 1 | 3 |
| 成昆个人旁支 | 2 | 0 | 1 | 1 | 0 | 0 | 2 |
| 玄冥二老 | 0 | 2 | 0 | 0 | 2 | 0 | 2 |
| 昆仑 / 崆峒 / 华山倚天支 | 0 | 3 | 3 | 0 | 0 | 0 | 3 |
| **合计** | **3** | **7** | **5** | **1** | **3** | **1** | **10** |

| 指标 | 结果 | 判定 |
|---|---|---|
| 绝招 | 地上 `3×2=6`；地中 `7×1=7`；合计 13 | ✅ 地中未列逐门裁定，按回退下限 1 |
| 招式 / 被动 | `10×4=40` 个可施放招式，其中 13 绝招；`10×3=30` 个被动 | ✅ 每门总招式 4，地阶栏位 4 |
| 天级闭集 | 新增 0；只引用 `sk_jingangbuhuai` | ✅ 不突破 Canon §4 / §13；三使主运未补 |
| 内功 IP | 地上 `2×94.5`；地中 `3×83` | ✅ 精确命中 `design/05` §5.5 |
| 路线 CT | `13×(8×90)`；单招完整收招 `1200+720=1920` | ✅ 不超过 2000 |
| 真气外放 | 0 / 40 | ✅ 全部逐招显式 `projection:false` |
| 敌人专用 | 0 | ✅ 均有玩家 / 其他角色可达来源；个人旁支另待作者确认满层路径 |
| 来源扩展待登记 | 0 | ✅ 两门复用项原生均含倚天；三使主运不作不合法复用 |

---

## 9. 本文新增术语与 ID

| 类别 | 新增 ID |
|---|---|
| 武学 `sk_*` | `sk_mingjiaohujiaogong`、`sk_jinhuazhangfa`、`sk_jinhuabiaofa`、`sk_huanyinxinfa`、`sk_huanyinshou`、`sk_lutouzhangfa`、`sk_hezuibifa`、`sk_kunlunliangyixinfa`、`sk_kongtongwuxingxinfa`、`sk_huashanliangyixinfa04` |
| 绝招 `mv_*` | 文首索引 13 项；其余普通招式见各卡，共 40 项 |
| 路线 `mfr_*` | 文首索引 13 项，与绝招一一对应 |
| 调息档案 `txp_*` | `txp_mingjiaohujiaogong`、`txp_huanyinxinfa`、`txp_kunlunliangyixinfa`、`txp_kongtongwuxingxinfa`、`txp_huashanliangyixinfa04` |
| 被动 `ps_*` | 各卡 3 项，共 30 项 |

本册不新增 `sect_*`、`eq_*`、`bf_*` 或天级 `sk_*`；所有引用均复用其唯一归属。

---

## 10. 数据校验规则与测试用例

### 10.1 构建期校验

| 编号 | 校验 | 通过条件 | 失败级别 |
|---|---|---|---|
| `B04-V01` | ID 唯一 | 10 个 `sk_*`、40 个 `mv_*`、30 个 `ps_*`、13 个 `mfr_*` 与 5 个 `txp_*` 均在全仓唯一 | error |
| `B04-V02` | 天级闭集 | 本册 `grade>=10` 定义为 0；只引用既有 `sk_jingangbuhuai`；三使主运显式未补并阻断正式构建 | error |
| `B04-V03` | 品阶与绝招 | 地上 3 门各 2 记绝招且在 7 / 9 重解锁；地中 7 门各 1 记且在 7 重解锁 | error |
| `B04-V04` | 卡片容量 | 每门恰有 4 个招式和 3 个被动；绝招计入 4 个招式 | error |
| `B04-V05` | 绝招资源 | 13 招均为 `rageCost:100;mpCost:9%;cd:0;recovery:1200` | error |
| `B04-V06` | 路线闭合 | 13 个正文绝招与索引一一镜像；每路 8 段、每段 90 CT、穴位不自复用，完整收招 1920 CT | error |
| `B04-V07` | 路线唯一 | 不与全仓既有路线完全相同；同门两招共享穴位不超过 50%，且不以轮换或逆序伪造差异 | error |
| `B04-V08` | 外放判定 | 40 招均显式 `projection:false`，且不存在 `projectionSpreadSteps`；暗器实体和普通兵刃挥击不误判外放 | error |
| `B04-V09` | 内功预算 | 地上两门 IP 各 94.5；地中三门 IP 各 83；贡献项和 `stats` 均不越 `design/05` §5.5 | error |
| `B04-V10` | 调息 | 5 门内功各有唯一 `txp_*`；`scope:3;ct:1000;mpCostBp:0;outOfBattleScaleBp:15000` | error |
| `B04-V11` | 来源可达 | 门派武学均有正常门派 / 职级 / 秘籍 / 奇遇路径；个人旁支有默认玩家路径并在 §11.5 请求确认 | error |
| `B04-V12` | 原著边界 | 原著无固定名称者标原创扩展或原创扩展命名；待核动作不写引文、回目号或伪招名 | error |

### 10.2 最小测试向量

| 用例 | 输入 / 操作 | 精确期望 |
|---|---|---|
| `B04-T01` 数量 | 扫描正式武学卡标题 | 地 / 玄 / 黄 / 天为 `10/0/0/0`；地上 / 地中为 `3/7` |
| `B04-T02` 绝招 | 对照正文卡与文首索引 | `6+7=13` 个唯一绝招与 13 个唯一 `mfr_*`，无隐式路线 |
| `B04-T03` 路线 CT | 任取一记绝招 | `1200+8×90=1920≤2000` |
| `B04-T04` 同门差异 | 比较明教护教功、幻阴心法、幻阴手各自两路 | 各对共享穴位 ≤4，且序列不构成轮换或逆序 |
| `B04-T05` 调和地上 IP | `34+20+2×14+5×2.5` | `94.5` |
| `B04-T06` 阴性地上 IP | `34+20+2×14+5×2.5` | `94.5` |
| `B04-T07` 调和地中 IP | `30+18+2×12+5×2.2` | `83` |
| `B04-T08` 地上调息 | 阴性档；调和档再乘 1.05 向下取整 | 阴 `2200/516`；调和 `2310/541` |
| `B04-T09` 地中调息 | 8 品调和、10 重 | `floor(2100×1.05)=2205` / `floor(492×1.05)=516` |
| `B04-T10` 暗器外放 | 施放 `mv_jinhuabiaofa_sanzhan` | 由实体暗器完成投送；`projection=false`，不建立真气扩散路线 |
| `B04-T11` 玩家可学 | 用合格明教 L4 角色完成护教考校 | 可取得 `sk_mingjiaohujiaogong` 并练至 10 重，不要求 Boss 身份 |
| `B04-T12` 个人旁支 | 走成昆遗册而非私授 | 两门幻阴旁支最高 8 重；不因拾取遗册自动补满 |

---

## 11. 待决事项 / 依赖

### 11.1 替下游给出的建议值

| 编号 | 本文建议值 | 下游归属 / 回填要求 |
|---|---|---|
| `B04-S01` | 门派考校 / 亲授可至 10 重，观摩或残谱多限 6–8 重 | `design/12` / `chapters/04`：落正式 `LearnSource` 时保留层数差，不把首领配装转成掉落 |
| `B04-S02` | 个人独门满层默认只走本人私授、受控同行或羁绊 / 换俘；遗册最高 8 重 | `design/12`：作者确认前按此实现，并保证主角与其他合格角色均可走来源 |
| `B04-S03` | 五门内功的调息档案与护体路线按 §7、文首索引接线 | `design/21` / 数据管线：固定 RNG 回放后只调遭遇 HP / 防御，不压低主运品阶 |

### 11.2 本文依赖的上游事实

- 天级闭集、品阶与本土书界依赖 Canon §4 / §13；本册不新增或改名天级武学。
- 武学字段、IP、招式容量、绝招资源与 Buff 引用依赖 `design/05`、`design/06`；路线、调息、护体及外放依赖 `design/21`。
- 既有明教 / 波斯总教、六派、玄冥与成昆条目依赖 `skills-yitian.md`、`skills-shaolin.md`；两项合规复用来源见 §5，三使主运缺口见章节 §12.5。
- 门派职级、任务来源、装备兼容与人物主记录分别依赖 `design/17`、`design/12`、`design/10`、`design/18`。

### 11.3 对基准的修改提案

| 编号 | 提案 | 理由 |
|---|---|---|
| `B04-P01` | 在 Canon §13 的非天级图鉴入口登记按书补录册为正式武学定义来源 | 当前十一册门派图鉴之外需要按书补缺；若不登记，构建器无法区分正式补录与章节临时配置 |
| `B04-P02` | 明确地位兜底不能替代合法主运武学外键，正式构建遇空主运须报错 | 玄冥二老虽可用 `10/9/yin` 估算节奏，仍没有 10 品内功实体，不能把七参数当作武学定义 |
| `B04-P03` | 若采纳崆峒五行心法为套装件，在 `design/07` 的 `set_kongtong_qishang` 成员表补入该 ID | 本册不能单向写 `setTags`；未双向登记会违反套装闭合校验，故当前默认不加入 |

### 11.4 原著考据待办

1. 核对金花婆婆持杖、使用金花状暗器的动作、介质与人物在场，不预写回目号或逐字引文。
2. 核对成昆以幻阴指暗袭的动作与阴寒表现；“幻阴心法”“幻阴手”继续只作原创扩展命名。
3. 核对鹿杖客的鹿角杖、鹤笔翁的鹤嘴双笔及相关交手表现；固定成套武学名与招名均不冒充原著。
4. 核对昆仑正两仪、华山反两仪与崆峒七伤体系的传承边界；本册三门内功仍按玩法扩写处理。

### 11.5 开放问题（附默认值）

| 编号 | 问题 | 本文默认值 | 影响 |
|---|---|---|---|
| `B04-O01` | 成昆个人旁支能否由玩家练满？ | 可以，但只限成昆私授 / 受控同行；遗册最高 8 重且承担品德代价 | 玩家收集、邪线奖励 |
| `B04-O02` | 鹿杖客、鹤笔翁的个人兵器分支能否由其他人物练满？ | 可以，经本人羁绊或换俘授艺至 10 重；缴获残谱最高 8 重 | 王府支线、非敌专约束 |
| `B04-O03` | 玄冥二老的 10 品主运如何闭合？ | 不新增天级武学；保留 `10/9/yin` 地位估算但正式构建阻断，等待从既有 51 门天级闭集找到有据内功或由作者另行裁定 | 首领画像、构建门禁 |
| `B04-O04` | “明教护教功”是否改为更具原著依据的名称？ | 保留明确标注的原创扩展名，不宣称原著有同名秘籍 | 本地化、图鉴命名 |
| `B04-O05` | 崆峒五行心法是否加入既有崆峒七伤套装？ | 默认不加入，保持 `setTags:[]`；若作者采纳，须由 `design/07` 同步正式成员与本卡反向标签 | 套装闭合、ID lint |
