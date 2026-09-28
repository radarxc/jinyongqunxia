# 门派武学补录图鉴 · 书界 07《碧血剑》（`skills-bulu-07-bixue`）

> **归属（基准 §18）**：`design/catalog/skills-*.md` 的《碧血剑》首领缺口增量。本册只定义本轮新增的七门内功、对应招式 / 路线 / 调息实例，以及来源扩展登记；既有 44 门本土武学仍唯一见 `design/catalog/skills-xiake-bixue.md`。
> **上游**：`docs/decisions/author-decisions.md`、`docs/decisions/author-requirements.md` AR-14–AR-16、`docs/00-canon.md` §3–§5/§9/§12/§16/§18、`docs/decisions/rulings-v1.md`、`docs/decisions/ultimate-counts-tianzhong-dizhong.md`、`design/05`、`design/15`、`design/17`、`design/21`。
> **引用而不重定义**：武学字段、品阶、招式 / 内功预算与学习规则见 `design/05`；Buff 本体见 `design/06`；门派 ID、职级与时代状态见 `design/17`；经脉 / 穴位见 `design/15`；战斗经脉路线、外放、调息和护体内劲见 `design/21`；原图鉴已有条目均只引用。
> **覆盖声明**：本册是 `skills-xiake-bixue` 的追加册，不覆写、不升阶、不重复定义既有 `sk_*`。华山（碧血一系）、铁剑门、石梁温家、仙都派、山宗 / 闯军及金龙帮在其他书界复现时复用本册 ID；明宫护院仅属明代宫禁来源，不反推清宫传承。
> **标注约定**：**（原创扩展）**为原著没有的武学、招名或机制；**（原创扩展命名）**为人物、组织或武学表现有依据但名称未见原著明载；**（待考）**须以三联 / 广州修订版逐字核对；**【建议值】**为待唯一归属文档确认的数值。
> **版本**：v1.0（首领武学补录，2026-09-28）。

---

## 0. 阅读指引与路线索引

### 0.1 绝招显式路线索引（镜像正文卡，非覆写层；2026-09-28）

本索引镜像正文卡的 `MoveDef` 真值，并在全册唯一一次展开绝招路线。八条路线均为**（原创扩展）**；每段 `segmentCt=90`，故路线 CT 为 `8×90=720`，与收招合计 `1200+720=1920≤2000`。

<!-- skill-catalog-audit:start -->
| 品阶 | 武学 | MoveDef（正文卡镜像） | 路线 ID | steps（acupointRef/segmentCt/riskBp） |
|---|---|---|---|---|
| 7 地下 | `sk_shanzongzhengqigong` | `mv_shanzongzhengqigong_shouzhen` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_shanzongzhengqigong_shouzhen}` | `mfr_shanzongzhengqigong_shouzhen` | `MeridianRouteDef{moveRef:mv_shanzongzhengqigong_shouzhen; ultimate:true; purpose:defense}`；`ap_dumai_changqiang/90/100→ap_dumai_yaoshu/90/110→ap_dumai_mingmen/90/120→ap_dumai_jizhong/90/130→ap_dumai_zhiyang/90/140→ap_dumai_shendao/90/150→ap_dumai_shenzhu/90/160→ap_dumai_baihui/90/170` |
| 8 地中 | `sk_shiliangwuxinggong` | `mv_shiliangwuxinggong_hezhen` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_shiliangwuxinggong_hezhen}` | `mfr_shiliangwuxinggong_hezhen` | `MeridianRouteDef{moveRef:mv_shiliangwuxinggong_hezhen; ultimate:true; purpose:defense}`；`ap_daimai_zulinqi/90/100→ap_daimai_weidao/90/110→ap_daimai_daimai/90/120→ap_daimai_wushu/90/130→ap_daimai_zhangmen/90/140→ap_daimai_jingmen/90/150→ap_renmai_qihai/90/180→ap_renmai_guanyuan/90/190` |
| 7 地下 | `sk_jinlongbangxinfa` | `mv_jinlongbangxinfa_dingzhuang` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_jinlongbangxinfa_dingzhuang}` | `mfr_jinlongbangxinfa_dingzhuang` | `MeridianRouteDef{moveRef:mv_jinlongbangxinfa_dingzhuang; ultimate:true; purpose:defense}`；`ap_chongmai_qichong/90/100→ap_chongmai_qixue/90/110→ap_chongmai_siman/90/120→ap_chongmai_zhongzhu/90/130→ap_chongmai_huangshu/90/140→ap_chongmai_shangqu/90/150→ap_chongmai_shiguan/90/160→ap_chongmai_youmen/90/170` |
| 7 地下 | `sk_xianduyunqi` | `mv_xianduyunqi_shouzheng` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_xianduyunqi_shouzheng}` | `mfr_xianduyunqi_shouzheng` | `MeridianRouteDef{moveRef:mv_xianduyunqi_shouzheng; ultimate:true; purpose:defense}`；`ap_renmai_huiyin/90/100→ap_renmai_qugu/90/110→ap_renmai_zhongji/90/120→ap_renmai_shimen/90/130→ap_renmai_qihai/90/140→ap_renmai_shenque/90/150→ap_renmai_shuifen/90/160→ap_renmai_zhongwan/90/170` |
| 7 地下 | `sk_huashanqigong07` | `mv_huashanqigong07_yangzhang` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_huashanqigong07_yangzhang}` | `mfr_huashanqigong07_yangzhang` | `MeridianRouteDef{moveRef:mv_huashanqigong07_yangzhang; ultimate:true; purpose:attack}`；`ap_dumai_mingmen/90/100→ap_dumai_jizhong/90/110→ap_dumai_zhiyang/90/120→ap_dumai_shendao/90/130→ap_dumai_shenzhu/90/140→ap_shouyangming_quchi/90/180→ap_shouyangming_shousanli/90/190→ap_shouyangming_hegu/90/200` |
| 9 地上 | `sk_tiejianxuangong` | `mv_tiejianxuangong_guiyi` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_tiejianxuangong_guiyi}` | `mfr_tiejianxuangong_guiyi` | `MeridianRouteDef{moveRef:mv_tiejianxuangong_guiyi; ultimate:true; purpose:defense}`；`ap_renmai_huiyin/90/100→ap_renmai_zhongji/90/110→ap_renmai_qihai/90/120→ap_renmai_danzhong/90/130→ap_shoujueyin_tianchi/90/150→ap_shoujueyin_quze/90/160→ap_shoujueyin_neiguan/90/170→ap_shoujueyin_laogong/90/180` |
| 9 地上 | `sk_tiejianxuangong` | `mv_tiejianxuangong_huanfeng` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_tiejianxuangong_huanfeng}` | `mfr_tiejianxuangong_huanfeng` | `MeridianRouteDef{moveRef:mv_tiejianxuangong_huanfeng; ultimate:true; purpose:attack}`；`ap_dumai_changqiang/90/100→ap_dumai_yaoshu/90/110→ap_dumai_yaoyangguan/90/120→ap_dumai_yinjiao/90/140→ap_shoushaoyang_tianjing/90/160→ap_shoushaoyang_waiguan/90/170→ap_shoushaoyang_yangchi/90/180→ap_shoutaiyang_wangu/90/190` |
| 7 地下 | `sk_minggonghuyuangong` | `mv_minggonghuyuangong_gongwei` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_minggonghuyuangong_gongwei}` | `mfr_minggonghuyuangong_gongwei` | `MeridianRouteDef{moveRef:mv_minggonghuyuangong_gongwei; ultimate:true; purpose:defense}`；`ap_yangwei_jinmen/90/100→ap_yangwei_yangjiao/90/110→ap_yangwei_toulinqi/90/120→ap_yangwei_benshen/90/130→ap_yangwei_tianliao/90/140→ap_yangwei_jianjing/90/150→ap_yangwei_fengfu/90/160→ap_yangwei_yamen/90/170` |
<!-- skill-catalog-audit:end -->

路线叙事：山宗、华山、明宫三门阳性内功分别以督脉守阵、督脉蓄劲后整臂发掌、阳维护卫线表达不同动作；温家以带脉横向轮转、金龙帮以冲脉盘旋承接、仙都以任脉守中；铁剑玄功的“归一”由任脉收于掌心，“还锋”则由督脉转手三阳至持械腕端。铁剑两绝招共享穴位为 `0/8`，满足同门 ≤50%；八条序列均非轮换或逆序。

正文路线注册表声明 `ultimate` 布尔真值；上方索引仅镜像完整实例：

| 武学 | moveRef → routeRef / ultimate / purpose / steps |
|---|---|
| `sk_shanzongzhengqigong` | `mv_shanzongzhengqigong_shouzhen→mfr_shanzongzhengqigong_shouzhen/true/defense/显式（见文首索引）` |
| `sk_shiliangwuxinggong` | `mv_shiliangwuxinggong_hezhen→mfr_shiliangwuxinggong_hezhen/true/defense/显式（见文首索引）` |
| `sk_jinlongbangxinfa` | `mv_jinlongbangxinfa_dingzhuang→mfr_jinlongbangxinfa_dingzhuang/true/defense/显式（见文首索引）` |
| `sk_xianduyunqi` | `mv_xianduyunqi_shouzheng→mfr_xianduyunqi_shouzheng/true/defense/显式（见文首索引）` |
| `sk_huashanqigong07` | `mv_huashanqigong07_yangzhang→mfr_huashanqigong07_yangzhang/true/attack/显式（见文首索引）` |
| `sk_tiejianxuangong` | `mv_tiejianxuangong_guiyi→mfr_tiejianxuangong_guiyi/true/defense/显式（见文首索引）`；`mv_tiejianxuangong_huanfeng→mfr_tiejianxuangong_huanfeng/true/attack/显式（见文首索引）` |
| `sk_minggonghuyuangong` | `mv_minggonghuyuangong_gongwei→mfr_minggonghuyuangong_gongwei/true/defense/显式（见文首索引）` |

### 0.2 非绝招显式路线索引

以下路线同样只在本节展开一次；正文卡仅用 `meridianRouteRef` 引用。全部招式均为贴身运劲、调息或守势，`projection:false`，不保存 `projectionSpreadSteps`。

| 武学 | moveRef | 路线 ID | MeridianRouteDef 与 steps（`ap_*/CT/风险`） |
|---|---|---|---|
| `sk_shanzongzhengqigong` | `mv_shanzongzhengqigong_zhengxi` | `mfr_shanzongzhengqigong_zhengxi` | `MeridianRouteDef{moveRef:mv_shanzongzhengqigong_zhengxi; ultimate:false; purpose:defense}`；`ap_dumai_changqiang/90/70→ap_dumai_yaoshu/90/80→ap_dumai_mingmen/90/90→ap_dumai_jizhong/90/100` |
| 〃 | `mv_shanzongzhengqigong_huzhen` | `mfr_shanzongzhengqigong_huzhen` | `MeridianRouteDef{moveRef:mv_shanzongzhengqigong_huzhen; ultimate:false; purpose:defense}`；`ap_yangwei_jinmen/90/80→ap_yangwei_yangjiao/90/90→ap_yangwei_tianliao/90/100→ap_yangwei_jianjing/90/110` |
| 〃 | `mv_shanzongzhengqigong_tiqi` | `mfr_shanzongzhengqigong_tiqi` | `MeridianRouteDef{moveRef:mv_shanzongzhengqigong_tiqi; ultimate:false; purpose:attack}`；`ap_dumai_mingmen/90/80→ap_dumai_zhiyang/90/100→ap_shouyangming_quchi/90/110→ap_shouyangming_hegu/90/120` |
| `sk_shiliangwuxinggong` | `mv_shiliangwuxinggong_naqi` | `mfr_shiliangwuxinggong_naqi` | `MeridianRouteDef{moveRef:mv_shiliangwuxinggong_naqi; ultimate:false; purpose:defense}`；`ap_renmai_huiyin/90/70→ap_renmai_zhongji/90/80→ap_renmai_qihai/90/90→ap_renmai_guanyuan/90/100` |
| 〃 | `mv_shiliangwuxinggong_lunzhuan` | `mfr_shiliangwuxinggong_lunzhuan` | `MeridianRouteDef{moveRef:mv_shiliangwuxinggong_lunzhuan; ultimate:false; purpose:defense}`；`ap_daimai_zulinqi/90/80→ap_daimai_weidao/90/90→ap_daimai_wushu/90/100→ap_daimai_zhangmen/90/110` |
| 〃 | `mv_shiliangwuxinggong_tuishou` | `mfr_shiliangwuxinggong_tuishou` | `MeridianRouteDef{moveRef:mv_shiliangwuxinggong_tuishou; ultimate:false; purpose:attack}`；`ap_chongmai_qichong/90/80→ap_chongmai_qixue/90/90→ap_shoujueyin_neiguan/90/110→ap_shoujueyin_laogong/90/120` |
| `sk_jinlongbangxinfa` | `mv_jinlongbangxinfa_panxi` | `mfr_jinlongbangxinfa_panxi` | `MeridianRouteDef{moveRef:mv_jinlongbangxinfa_panxi; ultimate:false; purpose:defense}`；`ap_chongmai_henggu/90/70→ap_chongmai_dahe/90/80→ap_chongmai_qixue/90/90→ap_chongmai_huangshu/90/100` |
| 〃 | `mv_jinlongbangxinfa_shoushi` | `mfr_jinlongbangxinfa_shoushi` | `MeridianRouteDef{moveRef:mv_jinlongbangxinfa_shoushi; ultimate:false; purpose:defense}`；`ap_daimai_jingmen/90/80→ap_daimai_zhangmen/90/90→ap_daimai_wushu/90/100→ap_daimai_daimai/90/110` |
| 〃 | `mv_jinlongbangxinfa_tuizhang` | `mfr_jinlongbangxinfa_tuizhang` | `MeridianRouteDef{moveRef:mv_jinlongbangxinfa_tuizhang; ultimate:false; purpose:attack}`；`ap_renmai_qihai/90/80→ap_chongmai_zhongzhu/90/100→ap_shouyangming_shousanli/90/110→ap_shouyangming_hegu/90/120` |
| `sk_xianduyunqi` | `mv_xianduyunqi_qingxin` | `mfr_xianduyunqi_qingxin` | `MeridianRouteDef{moveRef:mv_xianduyunqi_qingxin; ultimate:false; purpose:defense}`；`ap_renmai_huiyin/90/70→ap_renmai_qihai/90/80→ap_renmai_danzhong/90/90→ap_renmai_chengjiang/90/100` |
| 〃 | `mv_xianduyunqi_baoyuan` | `mfr_xianduyunqi_baoyuan` | `MeridianRouteDef{moveRef:mv_xianduyunqi_baoyuan; ultimate:false; purpose:defense}`；`ap_chongmai_henggu/90/80→ap_chongmai_siman/90/90→ap_chongmai_shangqu/90/100→ap_chongmai_youmen/90/110` |
| 〃 | `mv_xianduyunqi_huyin` | `mfr_xianduyunqi_huyin` | `MeridianRouteDef{moveRef:mv_xianduyunqi_huyin; ultimate:false; purpose:attack}`；`ap_renmai_guanyuan/90/80→ap_renmai_zhongwan/90/90→ap_shoujueyin_quze/90/110→ap_shoujueyin_laogong/90/120` |
| `sk_huashanqigong07` | `mv_huashanqigong07_tiaoxi` | `mfr_huashanqigong07_tiaoxi` | `MeridianRouteDef{moveRef:mv_huashanqigong07_tiaoxi; ultimate:false; purpose:defense}`；`ap_dumai_changqiang/90/70→ap_dumai_mingmen/90/80→ap_dumai_zhiyang/90/90→ap_dumai_baihui/90/100` |
| 〃 | `mv_huashanqigong07_tuizhang` | `mfr_huashanqigong07_tuizhang` | `MeridianRouteDef{moveRef:mv_huashanqigong07_tuizhang; ultimate:false; purpose:attack}`；`ap_dumai_zhiyang/90/80→ap_dumai_shenzhu/90/90→ap_shouyangming_quchi/90/110→ap_shouyangming_hegu/90/120` |
| 〃 | `mv_huashanqigong07_baoyuan` | `mfr_huashanqigong07_baoyuan` | `MeridianRouteDef{moveRef:mv_huashanqigong07_baoyuan; ultimate:false; purpose:defense}`；`ap_renmai_huiyin/90/70→ap_renmai_zhongji/90/80→ap_dumai_mingmen/90/100→ap_dumai_shendao/90/110` |
| `sk_tiejianxuangong` | `mv_tiejianxuangong_yunqi` | `mfr_tiejianxuangong_yunqi` | `MeridianRouteDef{moveRef:mv_tiejianxuangong_yunqi; ultimate:false; purpose:defense}`；`ap_renmai_huiyin/90/70→ap_renmai_qihai/90/80→ap_dumai_mingmen/90/100→ap_yangwei_yamen/90/110` |
| 〃 | `mv_tiejianxuangong_tiebi` | `mfr_tiejianxuangong_tiebi` | `MeridianRouteDef{moveRef:mv_tiejianxuangong_tiebi; ultimate:false; purpose:defense}`；`ap_yangwei_jinmen/90/80→ap_yangwei_yangjiao/90/90→ap_yangwei_jianjing/90/100→ap_yangwei_fengfu/90/110` |
| `sk_minggonghuyuangong` | `mv_minggonghuyuangong_shoumen` | `mfr_minggonghuyuangong_shoumen` | `MeridianRouteDef{moveRef:mv_minggonghuyuangong_shoumen; ultimate:false; purpose:defense}`；`ap_dumai_changqiang/90/70→ap_dumai_yaoshu/90/80→ap_dumai_mingmen/90/90→ap_yangwei_yamen/90/110` |
| 〃 | `mv_minggonghuyuangong_huanqi` | `mfr_minggonghuyuangong_huanqi` | `MeridianRouteDef{moveRef:mv_minggonghuyuangong_huanqi; ultimate:false; purpose:defense}`；`ap_renmai_huiyin/90/70→ap_renmai_qihai/90/80→ap_renmai_danzhong/90/90→ap_yangwei_tianliao/90/110` |
| 〃 | `mv_minggonghuyuangong_humen` | `mfr_minggonghuyuangong_humen` | `MeridianRouteDef{moveRef:mv_minggonghuyuangong_humen; ultimate:false; purpose:attack}`；`ap_dumai_shendao/90/80→ap_yangwei_jianjing/90/100→ap_shouyangming_quchi/90/110→ap_shouyangming_hegu/90/120` |

### 0.3 本轮覆盖表

| 来源体系 | 新增武学 | 解决的首领缺口 | 与既有图鉴关系 |
|---|---|---|---|
| 山宗 / 闯军 | `sk_shanzongzhengqigong` | 山宗追兵 7 品主运 | 与 `skills-xiake-bixue` §13 同体系 |
| 石梁温家 | `sk_shiliangwuxinggong` | 温家五老五个 8 品主运 | 与该册 §10 同体系 |
| 金龙帮 | `sk_jinlongbangxinfa` | 焦公礼 7 品主运 | 接该册 §13 的江湖盟友来源 |
| 仙都派 | `sk_xianduyunqi` | 闵子华 7 品主运 | 与该册 §12 同体系；人物归属仍**（待考）** |
| 华山·碧血支 | `sk_huashanqigong07` | 孙仲君 L3 的 7 品主运 | 与该册 §8 同体系 |
| 铁剑门 | `sk_tiejianxuangong` | 玉真子 9 品主运 | 与该册 §9 同体系 |
| 明代宫禁 | `sk_minggonghuyuangong` | 内监亲随首领 7 品主运 | 本书新来源，不并入 `skills-kangxi` 的清宫体系 |

## 1. 山宗 / 闯军与金龙帮

### 1.1 `sk_shanzongzhengqigong` 山宗正气功（7 地下 · 内功 · 山宗 / 闯军）**（原创扩展命名）**

| 项 | 内容 |
|---|---|
| 基础字段 | `category:inner`；`subType:inner`；`grade:7`；`origin:expanded`；`sect:sect_chuangwangjun`；`lineage:山宗 / 闯军教头传承`；`sourceChapters:[ch07_bixue]` |
| 来源归属 | 与 `skills-xiake-bixue` §13 的山宗 / 闯军体系相同。山宗人物与军中传承有原著背景，独立心法名与招式名未见明载。 |
| 性质 / 权重 / 栏位 | `yang`；`wOut/wIn:0.15/0.85`；`moveSlots:4` |
| reqs | `attrs:{con:35,wil:35}; aptitude:{apInner:30}; sect:{id:sect_chuangwangjun,rank:3}; prereq:[{skill:sk_shanzongxinfa,layer:6}]; hard:[sect,prereq]` |
| inner.contribution | `{mpMaxPct:26,hpMaxPct:16,attrs:{str:3,con:4,wil:3},mpRegen:2.0}`；`IP=26+16+2×10+5×2=72`，恰等于地下预算；`stats:{defOut:8,resInjury:7}`，合计 15 |
| 经脉 / 调息 / 护体 | `meridians:[mer_dumai,mer_yangwei]`；`breathProfileRef:txp_shanzongzhengqigong`；`innerGuard:{enabled:true,reflectBp:0}` |
| layerStats | —（内功不用 `layerStats`；成长由 `inner.contribution` 按层缩放） |
| 层数要点 | 1 重正息；4 重护阵；7 重绝招正气守阵；10 重军心不坠 |
| learnSources | `master`：山宗 / 闯军第三职级正常传授，`maxLayer:10`；`manual`：完成军纪整顿并获教头认可后取得公传抄本，`maxLayer:8`，仅覆写门派项并保留前置。正式任务 / 物品 ID 由 `design/12` 分配。主角与其他人物均可学。 |
| setTags / conflicts | `[]` / `[]`；无逐门额外冲突，主辅运性质关系仍统一见 `design/05` §5.2–§5.4 |
| special / observable | `{fusible:true}` / `true` |
| 图鉴文本 | 由山宗心法进阶的守阵行功，以督脉提气、阳维护阵；不把“正气”解释成阵营善恶。 |

| 招式（ID） | 重 | 范围 / 倍率 | 资源 | 效果、外放与路线 |
|---|---:|---|---|---|
| 正息 `mv_shanzongzhengqigong_zhengxi` **（原创扩展）** | 1 | 自身 / 0 | 7%/3/900 | 获 `bf_wenzhong`·承·2；`projection:false`；`meridianRouteRef:mfr_shanzongzhengqigong_zhengxi` |
| 护阵 `mv_shanzongzhengqigong_huzhen` **（原创扩展）** | 4 | 自身及相邻友军 / 0 | 7%/2/1000 | 自身 `bf_shoushi`·承·2，相邻友军 `bf_dingxin`·承·1；`projection:false`；`meridianRouteRef:mfr_shanzongzhengqigong_huzhen` |
| 提气冲拳 `mv_shanzongzhengqigong_tiqi` **（原创扩展）** | 5 | 单体·1·近身 / 1.00 | 7%/1/1000 | 标准单体 `1.00`；`projection:false`；`meridianRouteRef:mfr_shanzongzhengqigong_tiqi` |
| **正气守阵** `mv_shanzongzhengqigong_shouzhen` **（原创扩展）** | 7 | 自身及相邻友军 / 0 | 9%/0/1200，气势100 | 自身 `bf_shoushi`·承·3，相邻友军 `bf_dingxin`·承·2；支援绝招以资源支付预算；`projection:false`；`meridianRouteRef:mfr_shanzongzhengqigong_shouzhen`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_shanzongzhengqigong_shouzhen}` |

被动：守线 `ps_shanzongzhengqigong_shouxian`（2 重，未离开出生侧半场时 parry +4）；耐战 `ps_shanzongzhengqigong_naizhan`（5 重，首次内力低于 30% 时获 `bf_huinei`·承·2）；军心不坠 `ps_shanzongzhengqigong_buzhui`（10 重，每战首次受强制位移时距离 −1）。

### 1.2 `sk_jinlongbangxinfa` 金龙帮心法（7 地下 · 内功 · 金龙帮）**（原创扩展命名）**

| 项 | 内容 |
|---|---|
| 基础字段 | `category:inner`；`subType:inner`；`grade:7`；`origin:expanded`；`sect:null`；`lineage:焦公礼一系 / 金龙帮`；`sourceChapters:[ch07_bixue]` |
| 来源归属 | 接 `skills-xiake-bixue` §13 的江湖盟友来源。焦公礼及金龙帮有原著依据，独立心法名、盘龙意象与招式层次为本作补名。 |
| 性质 / 权重 / 栏位 | `harmony`；`wOut/wIn:0.20/0.80`；`moveSlots:4` |
| reqs | `attrs:{con:35,wil:30}; aptitude:{apInner:30}; prereq:[{skill:sk_zhuangxingong,layer:5}]; hard:[prereq]`；帮中第三职级来源另校验组织资格，不新造 `sect_*` |
| inner.contribution | `{mpMaxPct:26,hpMaxPct:16,attrs:{con:4,wil:3,agi:3},mpRegen:2.0}`；`IP=26+16+2×10+5×2=72`；`stats:{parry:8,effRes:7}`，合计 15 |
| 经脉 / 调息 / 护体 | `meridians:[mer_chongmai,mer_daimai]`；`breathProfileRef:txp_jinlongbangxinfa`；`innerGuard:{enabled:true,reflectBp:0}` |
| layerStats | —（内功不用 `layerStats`；成长由 `inner.contribution` 按层缩放） |
| 层数要点 | 1 重盘息；4 重守势；7 重绝招盘龙定桩；10 重回环不散 |
| learnSources | `master`：金龙帮第三职级传授，`maxLayer:10`；`manual`：焦宅止斗且帮争平息后取得合规秘籍，`maxLayer:8`。正式任务 / 物品 ID 由 `design/12` 分配。主角与其他满足前置者均可修习，不绑定焦公礼本人。 |
| setTags / conflicts | `[]` / `[]`；无逐门额外冲突，主辅运性质关系仍统一见 `design/05` §5.2–§5.4 |
| special / observable | `{fusible:true}` / `true` |
| 图鉴文本 | 以冲脉纵贯、带脉横束表现帮会护阵与盘桩，服务于调停和守护，不是敌方首领专用能力。 |

| 招式（ID） | 重 | 范围 / 倍率 | 资源 | 效果、外放与路线 |
|---|---:|---|---|---|
| 盘息 `mv_jinlongbangxinfa_panxi` **（原创扩展）** | 1 | 自身 / 0 | 7%/3/900 | 获 `bf_shouyi`·承·2；`projection:false`；`meridianRouteRef:mfr_jinlongbangxinfa_panxi` |
| 盘龙守势 `mv_jinlongbangxinfa_shoushi` **（原创扩展）** | 4 | 自身 / 0 | 7%/2/1000 | 获 `bf_shoushi`·承·2；`projection:false`；`meridianRouteRef:mfr_jinlongbangxinfa_shoushi` |
| 回身推掌 `mv_jinlongbangxinfa_tuizhang` **（原创扩展）** | 5 | 单体·1·近身 / 1.00 | 7%/1/1000 | 标准单体 `1.00`；`projection:false`；`meridianRouteRef:mfr_jinlongbangxinfa_tuizhang` |
| **盘龙定桩** `mv_jinlongbangxinfa_dingzhuang` **（原创扩展）** | 7 | 自身 / 0 | 9%/0/1200，气势100 | 获 `bf_wenzhong`·承·3；支援绝招以资源支付预算；`projection:false`；`meridianRouteRef:mfr_jinlongbangxinfa_dingzhuang`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_jinlongbangxinfa_dingzhuang}` |

被动：盘根 `ps_jinlongbangxinfa_pangen`（2 重，相邻友军存在时 parry +4）；回环 `ps_jinlongbangxinfa_huihuan`（5 重，切换攻击 / 防守招式后下一次耗内 −5%）；守义 `ps_jinlongbangxinfa_shouyi`（10 重，每战首次援护后获 `bf_huinei`·承·1）。

## 2. 石梁温家

### `sk_shiliangwuxinggong` 石梁五行功（8 地中 · 内功 · 石梁温家）**（原创扩展命名）**

| 项 | 内容 |
|---|---|
| 基础字段 | `category:inner`；`subType:inner`；`grade:8`；`origin:expanded`；`sect:sect_shiliang`；`lineage:石梁温家五老传承`；`sourceChapters:[ch07_bixue]` |
| 来源归属 | 与 `skills-xiake-bixue` §10 同属石梁温家。五老合阵有原著依据，独立内功名、行功层次和招式名未见明载。 |
| 性质 / 权重 / 栏位 | `harmony`；`wOut/wIn:0.20/0.80`；`moveSlots:4` |
| reqs | `attrs:{con:40,wil:40}; aptitude:{apInner:35}; sect:{id:sect_shiliang,rank:4}; prereq:[{skill:sk_wenjiagong,layer:6}]; hard:[sect,prereq]` |
| inner.contribution | `{mpMaxPct:30,hpMaxPct:18,attrs:{con:4,wil:4,agi:4},mpRegen:2.2}`；`IP=30+18+2×12+5×2.2=83`，恰等于地中预算；`stats:{parry:8,effRes:7}`，合计 15 |
| 经脉 / 调息 / 护体 | `meridians:[mer_renmai,mer_daimai,mer_chongmai]`；`breathProfileRef:txp_shiliangwuxinggong`；`innerGuard:{enabled:true,reflectBp:0}` |
| layerStats | —（内功不用 `layerStats`；成长由 `inner.contribution` 按层缩放） |
| 层数要点 | 1 重纳气；4 重五气轮转；7 重绝招五行合阵；10 重一人成阵 |
| learnSources | `master`：石梁温家第四职级正常传授，`maxLayer:10`；`manual`：旧案和解且族议认可后取得公传抄本，`maxLayer:8`。正式任务 / 物品 ID 由 `design/12` 分配。主角和其他人物均须满足门派或明确来源，不因击败五老直接夺得。 |
| setTags / conflicts | `[]` / `[]`；邻接同门增益受卡内上限约束，主辅运性质关系见 `design/05` §5.2–§5.4 |
| special / observable | `{fusible:true}` / `true` |
| 图鉴文本 | 以任脉守中、带脉横向轮转、冲脉承接掌劲的合阵内功；邻接同门可增强收益，但一人也能完整运转。 |

| 招式（ID） | 重 | 范围 / 倍率 | 资源 | 效果、外放与路线 |
|---|---:|---|---|---|
| 纳气归中 `mv_shiliangwuxinggong_naqi` **（原创扩展）** | 1 | 自身 / 0 | 7%/3/900 | 获 `bf_shouyi`·承·2；`projection:false`；`meridianRouteRef:mfr_shiliangwuxinggong_naqi` |
| 五气轮转 `mv_shiliangwuxinggong_lunzhuan` **（原创扩展）** | 4 | 自身 / 0 | 8%/2/1000 | 获 `bf_yuanzhuan`·承·2；`projection:false`；`meridianRouteRef:mfr_shiliangwuxinggong_lunzhuan` |
| 承势推手 `mv_shiliangwuxinggong_tuishou` **（原创扩展）** | 5 | 单体·1·近身 / 1.00 | 8%/1/1000 | 标准单体 `1.00`；`projection:false`；`meridianRouteRef:mfr_shiliangwuxinggong_tuishou` |
| **五行合阵** `mv_shiliangwuxinggong_hezhen` **（原创扩展）** | 7 | 自身及相邻友军 / 0 | 9%/0/1200，气势100 | 自身 `bf_shoushi`·承·3；每名相邻同门使本次效果等级 +1，至多 +2，但邻接不是发动条件；`projection:false`；`meridianRouteRef:mfr_shiliangwuxinggong_hezhen`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_shiliangwuxinggong_hezhen}` |

被动：步位 `ps_shiliangwuxinggong_buwei`（2 重，每名相邻同门 parry +2，至多 +6）；生克 `ps_shiliangwuxinggong_shengke`（5 重，连续使用不同招式时下一次 Z3 +5%）；一人成阵 `ps_shiliangwuxinggong_yirenchengzhen`（10 重，无相邻友军时 hit / parry 各 +4）。

地中绝招数取 1：本功名声局限于温家、功能浑厚而非多套著名绝学，按 `ultimate-counts-tianzhong-dizhong.md` 的 F/M/T 判据取下限；待裁定表纳入该新增 ID 后以其为准。

## 3. 仙都派

### `sk_xianduyunqi` 仙都运气诀（7 地下 · 内功 · 仙都派）**（原创扩展）**

| 项 | 内容 |
|---|---|
| 基础字段 | `category:inner`；`subType:inner`；`grade:7`；`origin:expanded`；`sect:sect_xiandu`；`lineage:仙都派门内传承`；`sourceChapters:[ch07_bixue]` |
| 来源归属 | 与 `skills-xiake-bixue` §12 的仙都体系相同。仙都派及闵子华关系仍须核对原著**（待考）**；武学名和招式均不冒充原著名。 |
| 性质 / 权重 / 栏位 | `harmony`；`wOut/wIn:0.15/0.85`；`moveSlots:4` |
| reqs | `attrs:{con:35,wil:35}; aptitude:{apInner:30}; sect:{id:sect_xiandu,rank:3}; prereq:[{skill:sk_xianduxinfa,layer:6}]; hard:[sect,prereq]` |
| inner.contribution | `{mpMaxPct:26,hpMaxPct:16,attrs:{con:3,wil:4,agi:3},mpRegen:2.0}`；`IP=26+16+2×10+5×2=72`；`stats:{parry:8,resMind:7}`，合计 15 |
| 经脉 / 调息 / 护体 | `meridians:[mer_renmai,mer_chongmai]`；`breathProfileRef:txp_xianduyunqi`；`innerGuard:{enabled:true,reflectBp:0}` |
| layerStats | —（内功不用 `layerStats`；成长由 `inner.contribution` 按层缩放） |
| 层数要点 | 1 重清心；4 重抱元；7 重绝招清元守正；10 重气息圆融 |
| learnSources | `master`：仙都派第三职级正常传授，`maxLayer:10`；`manual`：错谱争端和解后取得校正抄本，`maxLayer:8`，仅覆写门派项。正式任务 / 物品 ID 由 `design/12` 分配。主角与其他人物均可按正常途径习得。 |
| setTags / conflicts | `[]` / `[]`；无逐门额外冲突，主辅运性质关系仍统一见 `design/05` §5.2–§5.4 |
| special / observable | `{fusible:true}` / `true` |
| 图鉴文本 | 仙都派由基础心法进阶的调和运气法，以任脉守中、冲脉承接拳剑；不据名称推断现实道门谱系。 |

| 招式（ID） | 重 | 范围 / 倍率 | 资源 | 效果、外放与路线 |
|---|---:|---|---|---|
| 清心运息 `mv_xianduyunqi_qingxin` **（原创扩展）** | 1 | 自身 / 0 | 7%/3/900 | 驱散自身 1 个 `mind` 类可驱散减益；`projection:false`；`meridianRouteRef:mfr_xianduyunqi_qingxin` |
| 抱元 `mv_xianduyunqi_baoyuan` **（原创扩展）** | 4 | 自身 / 0 | 7%/2/1000 | 获 `bf_shouyi`·承·2；`projection:false`；`meridianRouteRef:mfr_xianduyunqi_baoyuan` |
| 护印掌 `mv_xianduyunqi_huyin` **（原创扩展）** | 5 | 单体·1·近身 / 1.00 | 7%/1/1000 | 标准单体 `1.00`；`projection:false`；`meridianRouteRef:mfr_xianduyunqi_huyin` |
| **清元守正** `mv_xianduyunqi_shouzheng` **（原创扩展）** | 7 | 自身 / 0 | 9%/0/1200，气势100 | 获 `bf_dingxin`·承·3；支援绝招以资源支付预算；`projection:false`；`meridianRouteRef:mfr_xianduyunqi_shouzheng`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_xianduyunqi_shouzheng}` |

被动：清静 `ps_xianduyunqi_qingjing`（2 重，`resMind +4`）；拳剑相济 `ps_xianduyunqi_quanjian`（5 重，拳脚后下一记剑招或剑招后下一记拳脚 Z3 +5%）；圆融 `ps_xianduyunqi_yuanrong`（10 重，每战首次驱散减益后获 `bf_huinei`·承·1）。

## 4. 华山·碧血支

### `sk_huashanqigong07` 华山养气功·碧血（7 地下 · 内功 · 华山）**（原创扩展命名）**

| 项 | 内容 |
|---|---|
| 基础字段 | `category:inner`；`subType:inner`；`grade:7`；`origin:expanded`；`sect:sect_huashan`；`lineage:穆人清—归辛树一系 / 华山碧血支`；`sourceChapters:[ch07_bixue]` |
| 来源归属 | 与 `skills-xiake-bixue` §8 同体系。华山重视由外而内的练法见既有图鉴，本名称和分层为本作补录。 |
| 性质 / 权重 / 栏位 | `yang`；`wOut/wIn:0.20/0.80`；`moveSlots:4` |
| reqs | `attrs:{con:35,wil:35}; aptitude:{apInner:30}; sect:{id:sect_huashan,rank:3}; prereq:[{skill:sk_huashantuna07,layer:6}]; hard:[sect,prereq]` |
| inner.contribution | `{mpMaxPct:26,hpMaxPct:16,attrs:{str:3,con:4,wil:3},mpRegen:2.0}`；`IP=26+16+2×10+5×2=72`；`stats:{defOut:8,resInjury:7}`，合计 15 |
| 经脉 / 调息 / 护体 | `meridians:[mer_renmai,mer_dumai]`；`breathProfileRef:txp_huashanqigong07`；`innerGuard:{enabled:true,reflectBp:0}` |
| layerStats | —（内功不用 `layerStats`；成长由 `inner.contribution` 按层缩放） |
| 层数要点 | 1 重调息；4 重推掌养气；7 重绝招养气成掌；10 重内外相济 |
| learnSources | `master`：华山碧血支第三职级正常传授，`maxLayer:10`；`master`：穆人清 / 归辛树认可授艺，`maxLayer:10`，可覆写门派项但不清除吐纳前置。正式任务来源 ID 由 `design/12` 分配。主角及其他合格人物均可学。 |
| setTags / conflicts | `[]` / `[]`；无逐门额外冲突，主辅运性质关系仍统一见 `design/05` §5.2–§5.4 |
| special / observable | `{fusible:true}` / `true` |
| 图鉴文本 | 介于入门吐纳与长老级混元功之间的门内养气法，让 L3 中坚有合法地阶主运；不提前授予 L4 混元功。 |

| 招式（ID） | 重 | 范围 / 倍率 | 资源 | 效果、外放与路线 |
|---|---:|---|---|---|
| 华山调息 `mv_huashanqigong07_tiaoxi` **（原创扩展）** | 1 | 自身 / 0 | 7%/3/900 | 获 `bf_huinei`·承·1；`projection:false`；`meridianRouteRef:mfr_huashanqigong07_tiaoxi` |
| 养气推掌 `mv_huashanqigong07_tuizhang` **（原创扩展）** | 4 | 单体·1·近身 / 1.00 | 7%/1/1000 | 标准单体 `1.00`；`projection:false`；`meridianRouteRef:mfr_huashanqigong07_tuizhang` |
| 抱元护身 `mv_huashanqigong07_baoyuan` **（原创扩展）** | 5 | 自身 / 0 | 7%/2/1000 | 获 `bf_shouyi`·承·2；`projection:false`；`meridianRouteRef:mfr_huashanqigong07_baoyuan` |
| **养气成掌** `mv_huashanqigong07_yangzhang` **（原创扩展）** | 7 | 单体·1·近身 / 3.00 | 9%/0/1200，气势100 | 无附带，绝招基准 `3.00`；`projection:false`；`meridianRouteRef:mfr_huashanqigong07_yangzhang`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_huashanqigong07_yangzhang}` |

被动：养掌 `ps_huashanqigong07_yangzhang`（2 重，拳掌招式耗内 −5%）；沉稳 `ps_huashanqigong07_chenwen`（5 重，未移动时 parry +4）；内外相济 `ps_huashanqigong07_neiwai`（10 重，拳掌命中后下一次本功调息效果 +10%）。

## 5. 铁剑门

### `sk_tiejianxuangong` 铁剑玄功（9 地上 · 内功 · 铁剑门）**（原创扩展命名）**

| 项 | 内容 |
|---|---|
| 基础字段 | `category:inner`；`subType:inner`；`grade:9`；`origin:expanded`；`sect:sect_tiejian`；`lineage:木桑道人一系 / 铁剑门`；`sourceChapters:[ch07_bixue]` |
| 来源归属 | 与 `skills-xiake-bixue` §9 同体系。木桑、玉真子与铁剑门关系有原著依据，独立高阶内功名和招式名未见明载。 |
| 性质 / 权重 / 栏位 | `harmony`；`wOut/wIn:0.15/0.85`；`moveSlots:4` |
| reqs | `attrs:{con:40,agi:40,wil:40}; aptitude:{apInner:40}; sect:{id:sect_tiejian,rank:4}; prereq:[{skill:sk_tiejianxinfa,layer:8}]; hard:[sect,prereq]` |
| inner.contribution | `{mpMaxPct:34,hpMaxPct:20,attrs:{con:5,agi:5,wil:4},mpRegen:2.5}`；`IP=34+20+2×14+5×2.5=94.5`，恰等于地上预算；`stats:{eva:8,effRes:7}`，合计 15 |
| 经脉 / 调息 / 护体 | `meridians:[mer_renmai,mer_dumai,mer_yangwei]`；`breathProfileRef:txp_tiejianxuangong`；`innerGuard:{enabled:true,reflectBp:0}` |
| layerStats | —（内功不用 `layerStats`；成长由 `inner.contribution` 按层缩放） |
| 层数要点 | 1 重玄门运气；4 重铁壁护身；7 重绝招玄门归一；9 重绝招铁壁还锋；10 重内外圆融 |
| learnSources | `master`：铁剑门第四职级正常传授，`maxLayer:10`；`manual`：木桑手录奇遇，`maxLayer:10`，可覆写门派项但不清除铁剑心法 8 重前置。正式任务 / 物品 ID 由 `design/12` 分配。主角与其他人物均可按同一规则习得。 |
| setTags / conflicts | `[]` / `[]`；反击绝招仍服从通用反击触发限制，主辅运性质关系见 `design/05` §5.2–§5.4 |
| special / observable | `{fusible:true}` / `true` |
| 图鉴文本 | 铁剑门高阶行功，以任督收放与阳维护身衔接持械反击；玉真子只是使用者之一，不拥有排他的个人专属版本。 |

| 招式（ID） | 重 | 范围 / 倍率 | 资源 | 效果、外放与路线 |
|---|---:|---|---|---|
| 玄门运气 `mv_tiejianxuangong_yunqi` **（原创扩展）** | 1 | 自身 / 0 | 7%/3/900 | 获 `bf_shouyi`·承·2；`projection:false`；`meridianRouteRef:mfr_tiejianxuangong_yunqi` |
| 铁壁护身 `mv_tiejianxuangong_tiebi` **（原创扩展）** | 4 | 自身 / 0 | 8%/2/1000 | 获 `bf_hutizhenqi`·承·2，护体按 6% hpMax 覆写；`projection:false`；`meridianRouteRef:mfr_tiejianxuangong_tiebi` |
| **玄门归一** `mv_tiejianxuangong_guiyi` **（原创扩展）** | 7 | 自身 / 0 | 9%/0/1200，气势100 | 获 `bf_shouyi`·承·3；支援绝招以资源支付预算；`projection:false`；`meridianRouteRef:mfr_tiejianxuangong_guiyi`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_tiejianxuangong_guiyi}` |
| **铁壁还锋** `mv_tiejianxuangong_huanfeng` **（原创扩展）** | 9 | 单体·1·近身 / 2.90 | 9%/0/1200，气势100 | 本回合先受近战伤害才可用；`3.00+反击条件0.15−前置限制折价0.25=2.90`；`projection:false`；`meridianRouteRef:mfr_tiejianxuangong_huanfeng`；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_tiejianxuangong_huanfeng}` |

被动：观局 `ps_tiejianxuangong_guanju`（2 重，未移动时 effRes +4）；铁壁 `ps_tiejianxuangong_tiebi`（5 重，护体存在时 parry +5）；局外一步 `ps_tiejianxuangong_juwai`（8 重，首次成功反击后可移动 1 格）；圆融 `ps_tiejianxuangong_yuanrong`（10 重，交替使用防守 / 攻击招式时下一招耗内 −5%）。

## 6. 明代宫禁

### `sk_minggonghuyuangong` 明宫护院功（7 地下 · 内功 · 明代宫禁）**（原创扩展）**

| 项 | 内容 |
|---|---|
| 基础字段 | `category:inner`；`subType:inner`；`grade:7`；`origin:expanded`；`sect:null`；`lineage:明代宫禁护院训练`；`sourceChapters:[ch07_bixue]` |
| 来源归属 | 仅用于本作对宫门护卫共通训练的抽象；原著无同名武学，不建立门派 ID，也不与 `skills-kangxi` 的清宫武学合并。 |
| 性质 / 权重 / 栏位 | `yang`；`wOut/wIn:0.20/0.80`；`moveSlots:4` |
| reqs | `attrs:{con:35,str:30}; aptitude:{apInner:30}; prereq:[{skill:sk_jindunxinfa,layer:5}]; hard:[prereq]`；合法宫禁武册来源可覆写前置，不覆写属性 / 资质 |
| inner.contribution | `{mpMaxPct:26,hpMaxPct:16,attrs:{str:4,con:4,wil:2},mpRegen:2.0}`；`IP=26+16+2×10+5×2=72`；`stats:{defOut:8,resInjury:7}`，合计 15 |
| 经脉 / 调息 / 护体 | `meridians:[mer_dumai,mer_yangwei,mer_renmai]`；`breathProfileRef:txp_minggonghuyuangong`；`innerGuard:{enabled:true,reflectBp:0}` |
| layerStats | —（内功不用 `layerStats`；成长由 `inner.contribution` 按层缩放） |
| 层数要点 | 1 重守门；4 重换气；5 重护门；7 重绝招拱卫宫门；10 重宫墙不退 |
| learnSources | `manual`：碧血宫禁调查线取得护院武册，`maxLayer:8`；`master`：非击杀处理内监亲随首领后由其传授，`maxLayer:10`。武册可覆写前置而不覆写属性 / 资质；正式任务 / 物品 ID 由 `design/12` 分配。主角与其他满足条件者均可学，且不授予清代宫廷身份。 |
| setTags / conflicts | `[]` / `[]`；无逐门额外冲突，主辅运性质关系仍统一见 `design/05` §5.2–§5.4 |
| special / observable | `{fusible:true}` / `true` |
| 图鉴文本 | 明末宫禁守门、换气与援护的共通训练法，只表达本作战斗体系，不把跨朝代制度或真实史料写成武学源流。 |

| 招式（ID） | 重 | 范围 / 倍率 | 资源 | 效果、外放与路线 |
|---|---:|---|---|---|
| 守门调息 `mv_minggonghuyuangong_shoumen` **（原创扩展）** | 1 | 自身 / 0 | 7%/3/900 | 获 `bf_wenzhong`·承·2；`projection:false`；`meridianRouteRef:mfr_minggonghuyuangong_shoumen` |
| 护院换气 `mv_minggonghuyuangong_huanqi` **（原创扩展）** | 4 | 自身 / 0 | 7%/2/1000 | 驱散自身 1 个 `injury` 类可驱散减益；`projection:false`；`meridianRouteRef:mfr_minggonghuyuangong_huanqi` |
| 护门拳 `mv_minggonghuyuangong_humen` **（原创扩展）** | 5 | 单体·1·近身 / 1.00 | 7%/1/1000 | 标准单体 `1.00`；`projection:false`；`meridianRouteRef:mfr_minggonghuyuangong_humen` |
| **拱卫宫门** `mv_minggonghuyuangong_gongwei` **（原创扩展）** | 7 | 自身及相邻友军 / 0 | 9%/0/1200，气势100 | 自身及相邻友军获 `bf_shoushi`·承·2；支援绝招以资源支付预算；`projection:false`；`meridianRouteRef:mfr_minggonghuyuangong_gongwei`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_minggonghuyuangong_gongwei}` |

被动：守门 `ps_minggonghuyuangong_shoumen`（2 重，相邻门墙时 parry +4）；护院 `ps_minggonghuyuangong_huyuan`（5 重，援护后回复 2% 内力，每回合 1 次）；不退 `ps_minggonghuyuangong_butui`（10 重，每战首次被击退时距离 −1）。

## 7. 调息档案与护体内劲

每门内功各绑定一个稳定 `txp_*`。字段顺序为 `id/grade/layer/nature/scope/ct/mpCostBp/outOfBattleScaleBp`，统一 `layer:10, scope:3, ct:1000, mpCostBp:0, outOfBattleScaleBp:15000`；地阶护体为 III 档，`reflectBp:0`。调息公式唯一见 `design/21` §10.2：阳性 7 品为 `500+100×7+80×10=2000`、`120+24×7+18×10=468`；调和再乘 `10500/10000` 并向下取整。

| 内功 → 调息档案 | 完整字段值 | 满层 `relief/repair` | 内劲抵消档位 |
|---|---|---|---|
| `sk_shanzongzhengqigong → txp_shanzongzhengqigong` | `7/10/yang/3/1000/0/15000` | `2000/468` | III；`innerGuard:{enabled:true,reflectBp:0}`；`outOfBattleScaleBp:15000` |
| `sk_shiliangwuxinggong → txp_shiliangwuxinggong` | `8/10/harmony/3/1000/0/15000` | `floor(2100×1.05)=2205/floor(492×1.05)=516` | III；`innerGuard:{enabled:true,reflectBp:0}`；`outOfBattleScaleBp:15000` |
| `sk_jinlongbangxinfa → txp_jinlongbangxinfa` | `7/10/harmony/3/1000/0/15000` | `floor(2000×1.05)=2100/floor(468×1.05)=491` | III；`innerGuard:{enabled:true,reflectBp:0}`；`outOfBattleScaleBp:15000` |
| `sk_xianduyunqi → txp_xianduyunqi` | `7/10/harmony/3/1000/0/15000` | `2100/491` | III；`innerGuard:{enabled:true,reflectBp:0}`；`outOfBattleScaleBp:15000` |
| `sk_huashanqigong07 → txp_huashanqigong07` | `7/10/yang/3/1000/0/15000` | `2000/468` | III；`innerGuard:{enabled:true,reflectBp:0}`；`outOfBattleScaleBp:15000` |
| `sk_tiejianxuangong → txp_tiejianxuangong` | `9/10/harmony/3/1000/0/15000` | `floor(2200×1.05)=2310/floor(516×1.05)=541` | III；`innerGuard:{enabled:true,reflectBp:0}`；`outOfBattleScaleBp:15000` |
| `sk_minggonghuyuangong → txp_minggonghuyuangong` | `7/10/yang/3/1000/0/15000` | `2000/468` | III；`innerGuard:{enabled:true,reflectBp:0}`；`outOfBattleScaleBp:15000` |

护体抵消顺序、类别适用率、`1 MP:2 伤害`、击穿迟滞和离战 1.5 倍只引用 `design/21`；本册不另写算法。

## 8. 外放候选审计表

| 武学 | 招式范围 | 判定 | `projectionSpreadSteps` | 理由 |
|---|---:|---|---|---|
| 七门新增内功的 28 记招式 | 自身 / 相邻支援或单体 1 格近身 | 全部 `projection:false` | 不填写 | 调息、守势、护体与近身掌拳均无离体真气伤害；支援范围不等于外放。 |

审计结果：外放候选 0，外放招式 0。不存在实体暗器、飞刀、弓弩或普通兵刃挥击被误标为外放的情形，也无需校验外放端点白名单。

## 9. 来源扩展登记

| `sk_*` | 需加入的书界 | 依据 | 状态 |
|---|---|---|---|
| — | — | 本轮配装所用既有武学均已覆盖 `ch07_bixue`；七门新武学已在各卡直接登记 `[ch07_bixue]` | 无来源扩展待登记 |

本书是华山（碧血一系）/ 归辛树、归二娘的主书界；鹿鼎书界二人已直接复用既有 `sk_hunyuangong`，本轮不另造同物 ID，也不产生跨书界待替换项。

## 10. 统计表

### 10.1 门派 / 来源 × 品阶

| 门派 / 来源 | 地下 7 | 地中 8 | 地上 9 | 合计 |
|---|---:|---:|---:|---:|
| 山宗 / 闯军 | 1 | 0 | 0 | 1 |
| 石梁温家 | 0 | 1 | 0 | 1 |
| 金龙帮 | 1 | 0 | 0 | 1 |
| 仙都派 | 1 | 0 | 0 | 1 |
| 华山·碧血支 | 1 | 0 | 0 | 1 |
| 铁剑门 | 0 | 0 | 1 | 1 |
| 明代宫禁 | 1 | 0 | 0 | 1 |
| **合计** | **5** | **1** | **1** | **7** |

### 10.2 招式、路线与可习得性

| 项 | 数量 | 核对 |
|---|---:|---|
| 新增内功 | 7 | 全为首领所缺主运；无人物排他武学 |
| 新增普通招式 | 20 | 地下 / 地中各卡 3，地上卡 2；与绝招合计均在 4–7 招范围 |
| 新增绝招 | 8 | 地下 `5×1=5`；地中 `1×1=1`；地上 `1×2=2` |
| 显式绝招路线 | 8 | 每招独立 `mfr_*`；每条 8 段；`1200+720=1920≤2000` |
| 显式普通路线 | 20 | 每招独立 `mfr_*`；每条 4 段；普通收招与路线 CT 之和不超过 1560 |
| 调息档案 | 7 | 均有 `outOfBattleScaleBp:15000` 与内劲抵消 III 档 |
| 外放招式 | 0 | 28 招逐招审计，均 `projection:false` |
| 门派正常途径 | 7 | 职级传授或非排他秘籍 / 奇遇；主角与其他合格人物都可学 |

新增七门是首领缺口增量，不修改 `skills-xiake-bixue` 已锁定的 44 门本土池统计；全项目统计需要把本册作为追加册合并计算，不能误报为原册仍只有 44 门。

## 11. 本文新增术语与 ID

| 类型 | 数量 | ID |
|---|---:|---|
| 武学 `sk_*` | 7 | `sk_shanzongzhengqigong`、`sk_shiliangwuxinggong`、`sk_jinlongbangxinfa`、`sk_xianduyunqi`、`sk_huashanqigong07`、`sk_tiejianxuangong`、`sk_minggonghuyuangong` |
| 招式 `mv_*` | 28 | 各卡“招式”表所列 20 记普通招与 8 记绝招 |
| 被动 `ps_*` | 22 | 六门各 3 个；铁剑玄功 4 个 |
| 路线 `mfr_*` | 28 | 与 28 个 `mv_*` 去掉前缀后一一同名 |
| 调息档案 `txp_*` | 7 | 与七个 `sk_*` 去掉前缀后一一同名 |

`mfr_*` / `txp_*` 的 schema 与运行算法仍归 `design/21`；本册只定义逐武学实例。

## 12. 数据校验规则与测试用例

| ID | 校验 | 期望 |
|---|---|---|
| BX07-SK-T01 | 统计所有正式 `sk_*` 卡 | 7 门且全为内功；品阶 7/8/9 为 5/1/1 |
| BX07-SK-T02 | 逐卡复算 IP | 地下 72、地中 83、地上 94.5，且 `stats` 合计不超过 15 |
| BX07-SK-T03 | 绝招数量与解锁层 | 地下各 1、地中 1、地上 2；按 7 / 9 重解锁 |
| BX07-SK-T04 | 绝招资源与路线时长 | 气势 100、耗内 9%、cd 0、收招 1200；每条 `1200+8×90=1920≤2000` |
| BX07-SK-T05 | 路线合法性 | 每条穴位不重复；绝招路线两两不完全相同；铁剑两路共享 0/8；所有穴位可在 `design/15` 解析 |
| BX07-SK-T06 | 外放字段 | 28 招均 `projection:false`，无 `projectionSpreadSteps` |
| BX07-SK-T07 | 调息与护体 | 七个 `txp_*` 均为 10 重、scope 3、CT 1000、耗内 0、离战倍率 15000；innerGuard III 且反震 0 |
| BX07-SK-T08 | 可习得性 | 每卡至少有门派职级或合规秘籍 / 奇遇来源；不存在 Boss-only 或人物专属硬条件 |
| BX07-SK-T09 | 重复与引用 | `sk_* / mv_* / ps_* / mfr_* / txp_*` 全仓唯一；旧图鉴只被引用，不被重定义 |

## 13. 待决事项 / 依赖

### 替下游给出的建议值

| 编号 | 下游 / 归属 | 本文采用 | 回填条件 |
|---|---|---|---|
| BX07-SK-D01 | `design/12` / 具体任务数据 | 公传抄本、校正抄本、宫禁武册等只作为 `LearnSource` 叙事，不新造任务 / 物品 ID | 下游分配正式来源 ID 后改为“已解决”并引用 |

### 本文依赖的上游事实

| 上游 | 状态与本文采用 |
|---|---|
| `design/05` / `21` | **已解决：**采用地阶招式数、绝招数 / 解锁层、9% 耗内、IP、路线和调息规则 |
| `skills-xiake-bixue` | **已解决：**复用六组既有基础 / 进阶前置，不升阶或重定义旧 ID |
| `design/17` | **部分解决：**华山、铁剑、石梁、仙都、闯军 ID 与职级可引用；金龙帮和明宫只作来源，不新建门派 ID |

### 对基准的修改提案

| 编号 | 提案 | 理由 |
|---|---|---|
| BX07-SK-P01 | 无新增基准修改 | 本轮只补图鉴实例，全部字段与数值可由现行基准、05、15、21 推出 |

### 原著考据待办

| 编号 | 待办 | 当前默认 |
|---|---|---|
| BX07-SK-K01 | 核对山宗人物、组织称谓及可确认的内功描述 | 保留山宗 / 闯军来源，武学与招名标原创扩展命名 |
| BX07-SK-K02 | 核对温家五老合阵的称谓、席位与行功描写 | 只采用“五老合阵”背景，不写回目与引文 |
| BX07-SK-K03 | 核对焦公礼、金龙帮可确认的武艺源流 | 保留帮会归属，心法名和盘龙招名标原创扩展命名 |
| BX07-SK-K04 | 核对闵子华与仙都派关系、仙都武学名称 | 关系继续标（待考），本卡明确为原创扩展 |
| BX07-SK-K05 | 核对木桑—玉真子一脉可确认的内功称谓与传授边界 | 保留铁剑门关系，高阶心法与招名标原创扩展命名 |

### 开放问题（附默认值）

| 编号 | 需作者 / 上游拍板 | 本版默认值 / 理由 |
|---|---|---|
| BX07-SK-O01 | 新增地中 `sk_shiliangwuxinggong` 取一记还是两记绝招 | 默认 1 记；门派知名度与招式丰富度不支持上浮，且符合地中 1–2 范围 |
| BX07-SK-O02 | 明宫护院是否日后建立正式门派 / 组织 ID | 默认不建；它是明代宫禁来源标签，避免和清宫体系混同 |
| BX07-SK-O03 | 金龙帮是否日后建立正式门派 ID | 默认不建；沿 `skills-xiake-bixue` §13 作为江湖盟友学习来源即可 |
