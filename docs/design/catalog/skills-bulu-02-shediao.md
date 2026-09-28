# 门派武学图鉴补录 · 02《射雕英雄传》（`skills-bulu-02-shediao`）

> **归属（基准 §18）**：`design/catalog/skills-*.md` 的《射雕英雄传》按书补录册；只定义本轮首领 / 精英缺口所需武学，并登记跨书界复用与来源扩展，不改写既有 11 册图鉴。
> **覆盖声明**：本册覆盖九阴下卷邪练支、丐帮、铁掌帮与全真教；新增武学与 `skills-wujue` / `skills-daojia` 的对应体系共用前置。武学不是首领专属，主角及其他合资格人物均可循门派传授、秘籍或奇遇习得。
> **上游**：作者决定与 `docs/decisions/author-requirements.md` AR-14～AR-16、`docs/00-canon.md`、`docs/decisions/rulings-v1.md`、`docs/decisions/ultimate-counts-tianzhong-dizhong.md`、`design/05`、`design/15`、`design/17`、`design/21`、`design/chapters/02-shediao.md`。
> **引用而不重定义**：字段、预算与习得规则见 `design/05`；穴位事实见 `design/15`；路线、调息、护体内劲、外放与首领主运见 `design/21`；组织与职级见 `design/17`；同体系既有武学见 `skills-wujue` / `skills-daojia`。
> **标注约定**：**（原创扩展）**为原著没有的武学、招名或机制；**（待考）**须按三联 / 广州修订版逐字核对；**（待核实）**为尚未联网确认的技术事实；**（待实测）**为需实机回放；**【建议值】**为待唯一归属文档确认的数值。
> **版本**：首领武学补录与替补替换（2026-09-28）。

---

## 0. 阅读指引与统一记法

### 绝招显式路线索引（镜像正文卡，非覆写层；2026-09-28）

本索引只镜像正文卡的最终绝招。每条路线按“出招方式定末端、性质定经脉族、门派定核心脉”配路；同门多绝招共享穴位不超过较短路线 50%，也不使用轮换或逆序。

<!-- skill-catalog-audit:start -->
| 品阶 | 武学 | MoveDef（正文卡镜像） | 路线 ID | steps（acupointRef/segmentCt/riskBp） |
|---|---|---|---|---|
| 9 地上 | `sk_jiuyinxieliangong` | `mv_jiuyinxieliangong_cuimai` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_jiuyinxieliangong_cuimai}` | `mfr_jiuyinxieliangong_cuimai` | `MeridianRouteDef{moveRef:mv_jiuyinxieliangong_cuimai; ultimate:true; purpose:defense; requiredNature:[yang,harmony]; innerGuard:{enabled:true,reflectBp:0}}`；`ap_dumai_changqiang/90/120→ap_dumai_yaoshu/90/160→ap_dumai_yaoyangguan/90/220→ap_dumai_mingmen/90/320→ap_yangqiao_pucan/90/420→ap_yangqiao_fuyang/90/480→ap_yangqiao_jianyu/90/620→ap_shouyangming_hegu/90/540` |
| 9 地上 | `sk_jiuyinxieliangong` | `mv_jiuyinxieliangong_huizhen` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_jiuyinxieliangong_huizhen}` | `mfr_jiuyinxieliangong_huizhen` | `MeridianRouteDef{moveRef:mv_jiuyinxieliangong_huizhen; ultimate:true; purpose:defense; requiredNature:[yang,harmony]; innerGuard:{enabled:true,reflectBp:0}}`；`ap_zuyangming_zusanli/90/110→ap_zuyangming_fenglong/90/150→ap_zuyangming_tianshu/90/210→ap_dumai_jizhong/90/340→ap_dumai_shenzhu/90/260→ap_renmai_qihai/90/460→ap_shoujueyin_neiguan/90/560→ap_shoujueyin_laogong/90/500` |
| 7 地下 | `sk_gaibangjuyigong` | `mv_gaibangjuyigong_tongpao` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_gaibangjuyigong_tongpao}` | `mfr_gaibangjuyigong_tongpao` | `MeridianRouteDef{moveRef:mv_gaibangjuyigong_tongpao; ultimate:true; purpose:defense; requiredNature:[yang,harmony]; innerGuard:{enabled:true,reflectBp:0}}`；`ap_chongmai_henggu/90/100→ap_chongmai_qixue/90/130→ap_chongmai_huangshu/90/170→ap_dumai_jizhong/90/230→ap_dumai_shenzhu/90/280→ap_shouyangming_quchi/90/220→ap_shouyangming_shousanli/90/170→ap_shouyangming_hegu/90/120` |
| 9 地上 | `sk_tiezhangyunqigong` | `mv_tiezhangyunqigong_lianbi` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_tiezhangyunqigong_lianbi}` | `mfr_tiezhangyunqigong_lianbi` | `MeridianRouteDef{moveRef:mv_tiezhangyunqigong_lianbi; ultimate:true; purpose:defense; requiredNature:[yang,harmony]; innerGuard:{enabled:true,reflectBp:0}}`；`ap_zuyangming_liangqiu/90/100→ap_zuyangming_zusanli/90/140→ap_zuyangming_fenglong/90/180→ap_dumai_yaoyangguan/90/240→ap_dumai_zhiyang/90/300→ap_shouyangming_quchi/90/240→ap_shouyangming_yangxi/90/180→ap_shouyangming_hegu/90/120` |
| 9 地上 | `sk_tiezhangyunqigong` | `mv_tiezhangyunqigong_shoufeng` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_tiezhangyunqigong_shoufeng}` | `mfr_tiezhangyunqigong_shoufeng` | `MeridianRouteDef{moveRef:mv_tiezhangyunqigong_shoufeng; ultimate:true; purpose:defense; requiredNature:[yang,harmony]; innerGuard:{enabled:true,reflectBp:0}}`；`ap_yangqiao_shenmai/90/100→ap_yangqiao_juliao/90/140→ap_yangwei_jianjing/90/200→ap_dumai_mingmen/90/260→ap_dumai_shendao/90/320→ap_shoushaoyang_tianjing/90/230→ap_shoushaoyang_waiguan/90/170→ap_shoushaoyang_yangchi/90/120` |
| 9 地上 | `sk_quanzhenzhoutiangong` | `mv_quanzhenzhoutiangong_sanyuan` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_quanzhenzhoutiangong_sanyuan}` | `mfr_quanzhenzhoutiangong_sanyuan` | `MeridianRouteDef{moveRef:mv_quanzhenzhoutiangong_sanyuan; ultimate:true; purpose:defense; requiredNature:[yang,harmony]; innerGuard:{enabled:true,reflectBp:0}}`；`ap_renmai_huiyin/90/100→ap_renmai_zhongji/90/140→ap_renmai_guanyuan/90/180→ap_renmai_qihai/90/220→ap_dumai_mingmen/90/280→ap_dumai_zhiyang/90/230→ap_dumai_shendao/90/170→ap_dumai_baihui/90/120` |
| 9 地上 | `sk_quanzhenzhoutiangong` | `mv_quanzhenzhoutiangong_qixing` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_quanzhenzhoutiangong_qixing}` | `mfr_quanzhenzhoutiangong_qixing` | `MeridianRouteDef{moveRef:mv_quanzhenzhoutiangong_qixing; ultimate:true; purpose:defense; requiredNature:[yang,harmony]; innerGuard:{enabled:true,reflectBp:0}}`；`ap_dumai_changqiang/90/100→ap_dumai_yaoshu/90/140→ap_dumai_jizhong/90/180→ap_yangqiao_jianyu/90/300→ap_yangqiao_jugu/90/220→ap_shoushaoyang_zhigou/90/360→ap_shoushaoyang_yifeng/90/240→ap_shoushaoyin_shenmen/90/440` |
<!-- skill-catalog-audit:end -->

#### 天 / 地阶普通招式显式路线（只在此定义）

| 武学 / 性质 | moveRef | 路线 ID | MeridianRouteDef | steps（acupointRef/segmentCt/riskBp） | 配路说明 |
|---|---|---|---|---|---|
| `sk_jiuyinxieliangong` / 阳 | `mv_jiuyinxieliangong_niyun` | `mfr_jiuyinxieliangong_niyun` | `moveRef:mv_jiuyinxieliangong_niyun; ultimate:false; purpose:defense; requiredNature:[yang,harmony]; innerGuard:{enabled:true,reflectBp:0}` | `ap_dumai_changqiang/80/100→ap_dumai_yaoshu/80/140→ap_yangqiao_shenmai/80/280→ap_yangqiao_juliao/80/200→ap_shoushaoyang_yangchi/80/340` | 督脉催息转入阳跷，再换手少阳归腕，表达错练强催与敛息 |
| `sk_gaibangjuyigong` / 阳 | `mv_gaibangjuyigong_jieyi` | `mfr_gaibangjuyigong_jieyi` | `moveRef:mv_gaibangjuyigong_jieyi; ultimate:false; purpose:defense; requiredNature:[yang,harmony]; innerGuard:{enabled:true,reflectBp:0}` | `ap_dumai_changqiang/80/80→ap_dumai_mingmen/80/120→ap_dumai_zhiyang/80/160→ap_shoushaoyang_waiguan/80/140→ap_shoushaoyang_yangchi/80/100` | 督脉提气后归手少阳腕穴，便于持棍守中 |
| `sk_tiezhangyunqigong` / 阳 | `mv_tiezhangyunqigong_yunzhang` | `mfr_tiezhangyunqigong_yunzhang` | `moveRef:mv_tiezhangyunqigong_yunzhang; ultimate:false; purpose:defense; requiredNature:[yang,harmony]; innerGuard:{enabled:true,reflectBp:0}` | `ap_dumai_changqiang/80/80→ap_dumai_yaoshu/80/120→ap_dumai_jizhong/80/160→ap_shouyangming_shousanli/80/140→ap_shouyangming_shangyang/80/100` | 督脉起劲、手阳明收于掌指，表达运掌蓄力 |
| `sk_quanzhenzhoutiangong` / 阳 | `mv_quanzhenzhoutiangong_shouyi` | `mfr_quanzhenzhoutiangong_shouyi` | `moveRef:mv_quanzhenzhoutiangong_shouyi; ultimate:false; purpose:defense; requiredNature:[yang,harmony]; innerGuard:{enabled:true,reflectBp:0}` | `ap_renmai_qugu/80/80→ap_renmai_shimen/80/120→ap_renmai_shenque/80/160→ap_renmai_zhongwan/80/140→ap_renmai_danzhong/80/100` | 任脉由下而上守中，表现全真吐纳而非攻击 |

### 0.1 配额、预算与外放口径

- 地上每门两记绝招，在 7 / 9 重解锁；地下每门一记绝招，在 7 重解锁。本册无地中 / 天中新增项，不进入 F/M/T 二选判定。
- 七记绝招均为气势 100、耗内 9%、`cd:0`、收招 1200；各路线 `flowCt=8×90=720`，故 `recovery+flowCt=1200+720=1920≤2000 CT`。
- 四记地阶普通招路线均为 5 段、每段 80 CT；正文收招 900，故 `900+5×80=1300≤2000 CT`。
- 内功贡献统一按 `IP=mpMaxPct+hpMaxPct+2×Σattrs+5×mpRegen` 核算；地下 / 地上预算分别为 72 / 94.5。
- 本册 11 招逐招复核均为运功、调息或护体，全部 `projection:false`；无招式填写 `projectionSpreadSteps`。

### 0.2 来源扩展登记

| 既有武学 ID | 需加入书界 | 依据 | 状态 |
|---|---|---|---|
| `sk_tiezhang` | `ch03_shendiao` | 裘千尺承铁掌帮家传，神雕画像需 10 品门派外功；本武学现归 `skills-wujue`，本任务不改既有图鉴 | 来源扩展待登记；由 NXfix 统一写回 |

## 1. 铁掌帮

### 1.1 `sk_tiezhangyunqigong` 铁掌运气功（9 地上 · 内功 · 阳）**（原创扩展）**

| 字段 | 值 |
|---|---|
| 出处与边界 | 原著写裘千仞以铁掌与轻功成名，也写裘千尺为其妹；没有“铁掌运气功”这一固定名目。名称、招式、机制与数值均 **（原创扩展）**；裘千尺伤前承得的具体层级须核对《神雕侠侣》绝情谷叙述 **（待考）** |
| `origin / sect / lineage` | `expanded / sect_tiezhangbang / 铁掌帮高阶运劲`；与 `skills-wujue` §8 的铁掌功、铁掌心法、铁掌吐纳诀同一门派体系 |
| `sourceChapters` | `[ch02_shediao,ch03_shendiao]` |
| `category / subType / grade` | `inner / xinfa / 9`（地上） |
| 品阶依据 | 神雕裘千尺为地位画像，目标主运 9；射雕裘千仞的地位下限 10 高于普通地阶上限，故本功只补齐门派最高地阶链与裘千尺，不冒充裘千仞的 10 品主运 |
| `nature · wOut/wIn · moveSlots` | `yang` · `0/1` · `4` |
| `inner` | `contribution:{mpMaxPct:34,hpMaxPct:20,attrs:{str:5,con:5,wil:2,agi:2},mpRegen:2.5,stats:{defOut:8,resInjury:7}}`；`meridians:[mer_dumai,mer_shouyangming]`；`breathProfileRef:txp_tiezhangyunqigong`；`innerGuard:{enabled:true,reflectBp:0}` |
| IP 核算 | `34+20+2×(5+5+2+2)+5×2.5=94.5`，精确命中地上预算；`stats=8+7=15` |
| `reqs` | `attrs:{str:50,con:50,wil:40}`；`aptitude:{apInner:48}`；`prereq:[{skill:sk_tiezhangxinfa,layer:8},{skill:sk_tiezhang,layer:5}]`；`sect:{id:sect_tiezhangbang,rank:4}`；`hard:[sect,prereq]` |
| `layers` | 1 运掌；3 运掌凝劲；5 铁臂；7 绝招·连臂归气；9 绝招·守峰定息；10 铁掌运气圆成 |
| `setTags / conflicts` | `[] / []` |
| `special / observable` | `{fusible:true}` / `true`；观摩至 6 重，不设 `enemyOnly` |
| `learnSources` | 射雕：铁掌 L4 且完成 `q_02_faction_05` 后由裘千仞或帮中遗谱传授至 10 重；神雕：慈恩印证或铁掌旧寨完整遗谱传授至 10 重。两书中主角与其他满足门规 / 遗谱前置者均可学 |
| 路线归属 | `sk_tiezhangyunqigong`；用于把下列 `MoveDef` 与本卡绑定，不另生规则 |

| 招式 | ID | 层 | 类型 / 效果 | 资源与路线 |
|---|---|---:|---|---|
| 运掌凝劲 **（原创扩展）** | `mv_tiezhangyunqigong_yunzhang` | 3 | 自身运劲；获得 `bf_waigong_sheng` 2 回合 | `MoveDef{unlock:3; ultimate:false; mpCost:7%; cd:2; recovery:900; projection:false; meridianRouteRef:mfr_tiezhangyunqigong_yunzhang}` |
| 连臂归气 **（原创扩展）** | `mv_tiezhangyunqigong_lianbi` | 7 | 防守绝招；自身获得 `bf_tiebi`、`bf_renjin` 各 2 回合 | `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_tiezhangyunqigong_lianbi}` |
| 守峰定息 **（原创扩展）** | `mv_tiezhangyunqigong_shoufeng` | 9 | 防守绝招；自身获得 `bf_shoushi` 2 回合并清 1 个 `injury` | `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_tiezhangyunqigong_shoufeng}` |

- **被动**：`ps_tiezhangyunqigong_yunzhang` 运掌（铁掌帮拳掌 Z3 +4%→10%）；`ps_tiezhangyunqigong_wengu` 稳骨（受到击退距离 −1）；`ps_tiezhangyunqigong_yuanman` 圆成（10 重时每战首次护体内劲被击穿，获得 `bf_renjin` 1 回合）。
- **外放判定**：3 招均为近身运劲、护臂或守势，`projection:false`；“铁掌”门派名不等同隔空掌力。

---

## 2. 全真教

### 2.1 `sk_quanzhenzhoutiangong` 全真周天功（9 地上 · 内功 · 阳）**（原创扩展）**

| 字段 | 值 |
|---|---|
| 出处与边界 | 原著有全真玄门内功与马钰夜授郭靖的呼吸吐纳，但没有“全真周天功”这一固定武学名。名称、招式、机制与数值均 **（原创扩展）**；不得把本功名称当作角色已经取得 `design/15` 小周天里程碑 |
| `origin / sect / lineage` | `expanded / sect_quanzhen / 全真高阶周天运功`；与 `skills-daojia` §2 的全真心法、金关玉锁二十四诀、天罡北斗阵同一门派体系 |
| `sourceChapters` | `[ch02_shediao,ch03_shendiao]` |
| `category / subType / grade` | `inner / xinfa / 9`（地上） |
| 品阶依据 | 神雕重阳七星阵首为手配精英，目标主运 9；既有 `sk_jinguanyusuo` 只有 8，`sk_xiantiangong` 11 又属王重阳遗传来源，不宜批量配置给阵首，故补全真 L4 可共享的地上主运 |
| `nature · wOut/wIn · moveSlots` | `yang` · `0/1` · `4` |
| `inner` | `contribution:{mpMaxPct:34,hpMaxPct:20,attrs:{con:4,wil:5,wis:3,agi:2},mpRegen:2.5,stats:{resSeal:8,resMind:7}}`；`meridians:[mer_renmai,mer_dumai]`；`breathProfileRef:txp_quanzhenzhoutiangong`；`innerGuard:{enabled:true,reflectBp:0}` |
| IP 核算 | `34+20+2×(4+5+3+2)+5×2.5=94.5`，精确命中地上预算；`stats=8+7=15` |
| `reqs` | `attrs:{wil:50,wis:45,con:45}`；`aptitude:{apInner:48}`；`prereq:[{skill:sk_quanzhenxinfa,layer:8},{skill:sk_jinguanyusuo,layer:6}]`；`sect:{id:sect_quanzhen,rank:4}`；`hard:[sect,prereq]` |
| `layers` | 1 守一；3 守一调息；5 任督相接；7 绝招·三元归一；9 绝招·七星守宫；10 周流圆成 |
| `setTags / conflicts` | `[] / []`；本功不擅自加入既有北斗套装成员表 |
| `special / observable` | `{fusible:true}` / `true`；观摩至 6 重，不设 `enemyOnly` |
| `learnSources` | 射雕 / 神雕全真 L4 经掌教或都讲考核可学至 10 重；射雕须先完成 `q_02_faction_01` 的七处阵位修复，神雕须完成重阳宫解围与门规复核。主角与其他合资格门人同路可学 |
| 路线归属 | `sk_quanzhenzhoutiangong`；用于把下列 `MoveDef` 与本卡绑定，不另生规则 |

| 招式 | ID | 层 | 类型 / 效果 | 资源与路线 |
|---|---|---:|---|---|
| 守一调息 **（原创扩展）** | `mv_quanzhenzhoutiangong_shouyi` | 3 | 自身调息；获得 `bf_shouyi` 2 回合 | `MoveDef{unlock:3; ultimate:false; mpCost:7%; cd:2; recovery:900; projection:false; meridianRouteRef:mfr_quanzhenzhoutiangong_shouyi}` |
| 三元归一 **（原创扩展）** | `mv_quanzhenzhoutiangong_sanyuan` | 7 | 防守绝招；自身获得 `bf_huinei`、`bf_jiangu` 各 2 回合 | `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_quanzhenzhoutiangong_sanyuan}` |
| 七星守宫 **（原创扩展）** | `mv_quanzhenzhoutiangong_qixing` | 9 | 防守绝招；自身与相邻全真阵员获得 `bf_shoushi` 2 回合；不新增阵法人数或追击 | `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_quanzhenzhoutiangong_qixing}` |

- **被动**：`ps_quanzhenzhoutiangong_shouyi` 守一（主运时 `resMind +4→10`）；`ps_quanzhenzhoutiangong_tongqi` 同气（相邻全真阵员存在时 `resSeal +3→8`）；`ps_quanzhenzhoutiangong_yuanman` 周流圆成（10 重时调息 `repairUnits +10%`，只向下取整一次）。
- **外放判定**：3 招均为自身 / 近邻阵员调息与护体，`projection:false`；没有外放伤害段。

---

## 3. 九阴下卷邪练支

### 3.1 `sk_jiuyinxieliangong` 九阴邪练功（9 地上 · 内功 · 阳）**（原创扩展）**

| 字段 | 值 |
|---|---|
| 出处与边界 | 黑风双煞盗得《九阴真经》下卷、误解经义而练成九阴白骨爪与摧心掌是原著事实；原著是否另有一门可独立命名的运气法、其具体阴阳与行功文字均 **（待考）**。本作把二人强催邪练与横练护身所需的主运抽象成此功，名称、招式和数值均 **（原创扩展）** |
| `origin / sect / lineage` | `expanded / null / 九阴真经·下卷邪练支`；与 `skills-wujue` §7 的九阴系同一来源体系，不是桃花岛正传 |
| `sourceChapters` | `[ch02_shediao]` |
| `category / subType / grade` | `inner / xinfa / 9`（地上） |
| 品阶依据 | 陈玄风、梅超风在 `design/21` §11.9.1 的地位下限均为 9；两人共享同一盗经、错练来源，故补一门可共享地上主运，不分别造角色专属功 |
| `nature · wOut/wIn · moveSlots` | `yang` · `0/1` · `4`；阳性只表示本作“逆意强催、横练护体”的战斗性质，不声称原著如此分类 |
| `inner` | `contribution:{mpMaxPct:34,hpMaxPct:20,attrs:{con:5,str:4,agi:3,wil:2},mpRegen:2.5,stats:{tough:8,resInjury:7}}`；`meridians:[mer_dumai,mer_yangqiao]`；`breathProfileRef:txp_jiuyinxieliangong`；`innerGuard:{enabled:true,reflectBp:0}` |
| IP 核算 | `34+20+2×(5+4+3+2)+5×2.5=94.5`，精确命中地上预算；`stats=8+7=15`，不越地阶上限 |
| `reqs` | `attrs:{con:45,str:40,wil:40}`；`aptitude:{apInner:45}`；`prereq:[{skill:sk_tongshihenglian,layer:6},{skill:sk_jiuyinbaigu,layer:5}]`；`hard:[prereq]` |
| `layers` | 1 逆意行气；3 逆运敛息；5 强催；7 绝招·催脉护身；9 绝招·回真敛息；10 邪练圆成 |
| `setTags / conflicts` | `[] / []`；既有黑风双煞套装仅是候选，未进入正式注册表 |
| `special / observable` | `{fusible:false,evilTraining:true}` / `true`；观摩仅至 6 重，不因首领使用而设 `enemyOnly` |
| `learnSources` | 陈玄风、梅超风依既有盗经背景掌握 9 重；主角或其他人物须在 `q_02_bond_05` 后获梅超风认可亲授，或持 `it_miji_jiuyin_xia` 完成“误读真经”危险奇遇，前者 `maxLayer:10`、后者 `maxLayer:8`；两路都须满足前置并承受 `design/05` §9.1.2 邪练代价 |
| 路线归属 | `sk_jiuyinxieliangong`；用于把下列 `MoveDef` 与本卡绑定，不另生规则 |

| 招式 | ID | 层 | 类型 / 效果 | 资源与路线 |
|---|---|---:|---|---|
| 逆运敛息 **（原创扩展）** | `mv_jiuyinxieliangong_niyun` | 3 | 自身运劲；获得 `bf_renjin` 2 回合 | `MoveDef{unlock:3; ultimate:false; mpCost:7%; cd:2; recovery:900; projection:false; meridianRouteRef:mfr_jiuyinxieliangong_niyun}` |
| 催脉护身 **（原创扩展）** | `mv_jiuyinxieliangong_cuimai` | 7 | 防守绝招；自身获得 `bf_tiebi`、`bf_jiangu` 各 2 回合 | `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_jiuyinxieliangong_cuimai}` |
| 回真敛息 **（原创扩展）** | `mv_jiuyinxieliangong_huizhen` | 9 | 调息绝招；驱散自身 1 个 `injury`，获得 `bf_huinei` 2 回合 | `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_jiuyinxieliangong_huizhen}` |

- **被动**：`ps_jiuyinxieliangong_qiangcui` 强催（主运且气血低于 50% 时 `resInjury +5→10`）；`ps_jiuyinxieliangong_henglian` 横练同源（同装 `sk_tongshihenglian` 时护体内劲容量 +5%，只取一次）；`ps_jiuyinxieliangong_yuanman` 邪练圆成（10 重时每战首次调息额外清 1 个 `injury`）。
- **外放判定**：3 招均为自身运劲、护体或调息，`projection:false`；无离体劲力和外放扩张。

---

## 4. 丐帮射雕一系

### 4.1 `sk_gaibangjuyigong` 丐帮聚义功（7 地下 · 内功 · 阳）**（原创扩展）**

| 字段 | 值 |
|---|---|
| 出处与边界 | 原著有丐帮袋制、帮众聚义与君山大会；没有“丐帮聚义功”这一固定武学名。名称、招式、运功机制与数值均 **（原创扩展）**，不冒充洪七公个人独门 |
| `origin / sect / lineage` | `expanded / sect_gaibang / 丐帮射雕一系`；与 `skills-wujue` §2 的丐帮吐纳、护心法、九袋行功同一门派体系 |
| `sourceChapters` | `[ch02_shediao,ch03_shendiao]` |
| `category / subType / grade` | `inner / xinfa / 7`（地下） |
| 品阶依据 | 射雕本界 `G=8`，君山阵首为手配精英，最低主运 `G−1=7`；现有丐帮最高可共享内功 `sk_jiudaixingong` 为 6，故补地下门派主运 |
| `nature · wOut/wIn · moveSlots` | `yang` · `0/1` · `4` |
| `inner` | `contribution:{mpMaxPct:26,hpMaxPct:16,attrs:{con:4,str:3,wil:3},mpRegen:2.0,stats:{resCC:8,tough:7}}`；`meridians:[mer_dumai,mer_chongmai]`；`breathProfileRef:txp_gaibangjuyigong`；`innerGuard:{enabled:true,reflectBp:0}` |
| IP 核算 | `26+16+2×(4+3+3)+5×2.0=72`，精确命中地下预算；`stats=8+7=15` |
| `reqs` | `attrs:{con:40,wil:35}`；`aptitude:{apInner:40}`；`prereq:[{skill:sk_jiudaixingong,layer:7}]`；`sect:{id:sect_gaibang,rank:4,bagCount:7}`；`hard:[sect,prereq]` |
| `layers` | 1 聚息；3 结义守中；5 众志；7 绝招·同袍聚气；10 聚义圆成 |
| `setTags / conflicts` | `[] / []` |
| `special / observable` | `{fusible:true}` / `true`；观摩至 6 重，不设 `enemyOnly` |
| `learnSources` | 丐帮 L4、七袋以上且完成 `q_02_faction_02` 后，由洪七公、黄蓉或九袋传功长老传授至 10 重；失去职级后可凭既有真层继续运用。主角与其他满足门规者均可学习 |
| 路线归属 | `sk_gaibangjuyigong`；用于把下列 `MoveDef` 与本卡绑定，不另生规则 |

| 招式 | ID | 层 | 类型 / 效果 | 资源与路线 |
|---|---|---:|---|---|
| 结义守中 **（原创扩展）** | `mv_gaibangjuyigong_jieyi` | 3 | 自身运劲；获得 `bf_jiangu` 2 回合 | `MoveDef{unlock:3; ultimate:false; mpCost:7%; cd:2; recovery:900; projection:false; meridianRouteRef:mfr_gaibangjuyigong_jieyi}` |
| 同袍聚气 **（原创扩展）** | `mv_gaibangjuyigong_tongpao` | 7 | 防守绝招；自身与相邻友方获得 `bf_xieli` 2 回合，自身另获 `bf_shoushi` 2 回合 | `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_gaibangjuyigong_tongpao}` |

- **被动**：`ps_gaibangjuyigong_tongpao` 同袍（相邻有友方时 `resCC +4→10`）；`ps_gaibangjuyigong_jiefeng` 接风（使用丐帮棍掌招后，自身下一次调息 `ct−50`，每回合至多一次）；`ps_gaibangjuyigong_yuanman` 聚义圆成（10 重时援护触发后回复 2% `mpMax`，每回合一次）。
- **外放判定**：2 招均为自身 / 近邻友方运劲，不产生离体伤害，`projection:false`。

---

## 5. 调息档案与护体内劲

字段与算法只引用 `design/21` §10.2、§12。四门均为地阶，故 `scope:3`；全部 `ct:1000`、`mpCostBp:0`、`outOfBattleScaleBp:15000`。护体容量仍由当次 `MeridianProfile` 计算；本册没有反震语义，统一 `innerGuard:{enabled:true,reflectBp:0}`。

| 内功 → 调息档案 | 正式字段 | 10 重 `reliefBp / repairUnits` 核算 | 内劲抵消档位 |
|---|---|---|---|
| `sk_tiezhangyunqigong → txp_tiezhangyunqigong` | `BreathProfile{grade:9;layer:10;nature:yang;scope:3;ct:1000;mpCostBp:0;outOfBattleScaleBp:15000;innerGuard:{enabled:true,reflectBp:0}}` | `(500+900+800)=2200` / `(120+216+180)=516` | 地阳档；拳脚 / 兵器 / 暗器 / 内劲外放适用率 `10000/2500/0/4000 bp` |
| `sk_quanzhenzhoutiangong → txp_quanzhenzhoutiangong` | `BreathProfile{grade:9;layer:10;nature:yang;scope:3;ct:1000;mpCostBp:0;outOfBattleScaleBp:15000;innerGuard:{enabled:true,reflectBp:0}}` | `2200 / 516` | 地阳档；`10000/2500/0/4000 bp` |
| `sk_jiuyinxieliangong → txp_jiuyinxieliangong` | `BreathProfile{grade:9;layer:10;nature:yang;scope:3;ct:1000;mpCostBp:0;outOfBattleScaleBp:15000;innerGuard:{enabled:true,reflectBp:0}}` | `2200 / 516` | 地阳档；`10000/2500/0/4000 bp` |
| `sk_gaibangjuyigong → txp_gaibangjuyigong` | `BreathProfile{grade:7;layer:10;nature:yang;scope:3;ct:1000;mpCostBp:0;outOfBattleScaleBp:15000;innerGuard:{enabled:true,reflectBp:0}}` | `(500+700+800)=2000` / `(120+168+180)=468` | 地阳档；`10000/2500/0/4000 bp` |

战斗外结果统一再乘 `15000 bp`，但不把换算结果缓存回档案；结算顺序与“1 MP 抵 2 伤害”规则均见 `design/21` §12，不在本册重定义。

---

## 6. 外放候选审计表

| 武学 | 逐招审计 | 外放数 | 结论 |
|---|---|---:|---|
| 铁掌运气功 | `yunzhang/lianbi/shoufeng` | 0 | 运掌、护臂、守势；“铁掌”门派名不构成离体劲力 |
| 全真周天功 | `shouyi/sanyuan/qixing` | 0 | 调息、护体与近邻阵员协同，不离体伤敌 |
| 九阴邪练功 | `niyun/cuimai/huizhen` | 0 | 自身运劲、护体、调息 |
| 丐帮聚义功 | `jieyi/tongpao` | 0 | 自身与相邻友方聚气，无伤害投射物 |

因此本册 11 招全部 `projection:false`，外放招式为 0；不存在 `projectionSpreadSteps`，也无需外放端点白名单复核。

---

## 7. 统计表

### 7.1 品阶与类别

| 类别 | 地上 9 | 地下 7 | 合计 |
|---|---:|---:|---:|
| 内功 | 3 | 1 | 4 |
| **合计** | **3** | **1** | **4** |

### 7.2 绝招、路线与来源

| 统计项 | 数量 | 核对 |
|---|---:|---|
| 武学 | 4 | 均为可学习新增武学；无 `enemyOnly` |
| 招式 / 被动 | 11 / 12 | 每门 2–3 招、固定 3 被动 |
| 绝招 | 7 | 地上 `3×2=6`；地下 `1×1=1` |
| 显式路线 | 11 | 绝招 7 条、地阶普通招 4 条；步骤只在文首定义 |
| 内功调息档案 | 4 | 与四门内功一一对应，均含 `outOfBattleScaleBp:15000` |
| 外放招式 | 0 | 调息 / 运劲 / 护体不算外放 |
| 原创扩展命名 | 4 | 未把门派背景或待考行功包装成原著固定武学名 |
| 来源扩展待登记 | 1 | `sk_tiezhang → ch03_shendiao` |

### 7.3 主书界复用边界

| 本册来源 | 射雕用途 | 神雕后续用途 | 同体系既有图鉴 |
|---|---|---|---|
| 九阴下卷邪练支 | 陈玄风、梅超风主运 | 无强制复用 | `skills-wujue` |
| 丐帮射雕一系 | 君山阵首主运 | 射雕一系丐帮人物如需 | `skills-wujue` |
| 铁掌帮 | 补齐门派地阶传承 | 裘千尺主运；`sk_tiezhang` 外功 | `skills-wujue` |
| 全真教 | 补齐门派地阶传承 | 重阳七星阵首主运；`sk_tiangang` 外功 | `skills-daojia` |

---

## 本文新增术语与 ID

### 新增术语

- **按书补录册**：不改既有门派图鉴，由门派主书界补齐首领 / 精英构筑缺口的正式图鉴；其 `sk_*` 对玩家与 NPC 使用同一规则。
- **九阴下卷邪练支**：本作对黑风双煞盗经、错练所形成传承的中性来源称呼 **（原创扩展）**；不等同桃花岛正传，也不声称原著如此命名。
- **来源扩展登记**：既有武学本身无需重定义，只需给原图鉴增加可得书界；本册登记后由 NXfix 统一落实。

### 武学 ID（4）

| 品阶 | ID |
|---|---|
| 地上 9 | `sk_tiezhangyunqigong`、`sk_quanzhenzhoutiangong`、`sk_jiuyinxieliangong` |
| 地下 7 | `sk_gaibangjuyigong` |

### 招式、被动、路线与调息 ID

- `mv_*`：11 个，其中绝招 7 个。
- `ps_*`：12 个，每门 3 个。
- `mfr_*`：11 个，其中绝招路线 7 个、地阶普通招路线 4 个。
- `txp_*`：4 个，与四门内功一一对应。

---

## 数据校验规则与测试用例

| 编号 | 校验 | 期望 |
|---|---|---|
| SB02-V01 | `sk_*`、`mv_*`、`ps_*`、`mfr_*`、`txp_*` 全仓唯一且引用可解析 | 无重名、无本册未定义引用 |
| SB02-V02 | 绝招数与解锁层 | 地上每门 2（7/9）；地下每门 1（7） |
| SB02-V03 | 路线结构 | 1–18 穴且不重复；CT 40–120；风险 0–1200；`recovery+ΣCT≤2000` |
| SB02-V04 | 路线多样性 | 同武学共享穴位 ≤50%；跨全库无完全相同序列；不是轮换或逆序 |
| SB02-V05 | 内功 IP | 三门地上均 94.5，地下为 72，逐式复算一致 |
| SB02-V06 | 调息 | 4 个 `txp_*` 唯一；`scope:3`；离战倍率均 15000；护体不反震 |
| SB02-V07 | 外放 | 11 招外放数为 0；无 `projectionSpreadSteps` |
| SB02-V08 | 习得 | 四门均有门派 / 秘籍 / 奇遇路径；无首领专属与敌人专用 |
| SB02-V09 | 跨书界 | 铁掌 / 全真新功含 `ch03_shendiao`；既有 `sk_tiezhang` 单列来源扩展 |

最小测试：构建陈玄风、梅超风、君山阵首、裘千尺与重阳七星阵首；验证主运取自实际武学，绝招只按 `MoveDef.ultimate` 识别，调息不推进永久经脉；对七记绝招做固定 RNG 路线回放，并运行 `check_route_unique_for.py`。

---

## 待决事项 / 依赖

### 替下游给出的建议值

- 神雕裘千尺：主运 `sk_tiezhangyunqigong` 9 重、外功 `sk_tiezhang` 10 重，七参性质改为 `yang`；来源扩展落盘前保持“待书界 02 补录”标记。
- 神雕重阳七星阵首：主运 `sk_quanzhenzhoutiangong` 9 重、外功复用 `sk_tiangang` 10 重。

### 本文依赖的上游事实

- 普通武学 51 / 169 / 459 / 459 的总量与普通天级 51 门闭集，依赖 `docs/00-canon.md` §2、§5 及 `rulings-v1.md` 的裁定。
- 绝招配额、经脉路线、调息、护体内劲与首领主运筛选依赖 `design/05`、`design/21`，本文不重定义。
- 铁掌、全真、丐帮与九阴既有基础链依赖 `skills-wujue` / `skills-daojia`。

### 对基准的修改提案

- **SB02-P01**：将“普通天级 51 门闭集”与顶尖首领地位下限的冲突明确裁定为：四档真实主运均失败时，可以使用 `design/21` §11.9.1 的地位下限兜底画像，但必须保留缺口登记；不为单个首领虚增天级武学。理由：黄药师、裘千仞及神雕黄药师目前均无可共享的达标主运，强行新增会破坏基准闭集。

### 原著考据待办

- 核对《射雕英雄传》中黑风双煞所获下卷内容、错练方式与横练表现，确认“邪练主运”只作系统抽象，不误写成原著固定名。
- 核对《神雕侠侣》绝情谷有关裘千尺伤前武功传承的叙述，确认铁掌家传范围；不编造回目号。

### 开放问题（附默认值）

- 黄药师（射雕 10 / 神雕 11）与裘千仞（射雕 10）的可共享真实主运仍缺。默认：保持地位下限兜底，不新增普通天级武学，待作者在“调整闭集 / 指定既有同来源武学 / 保持兜底”三者中裁定。
- `sk_tiezhang` 的神雕来源扩展由谁落盘尚未写入既有图鉴。默认：NXfix 按本册 §0.2 写回 `skills-wujue`，本任务不越权修改。

