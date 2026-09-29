# 武学补录图鉴 · 书界 14《雪山飞狐》（`skills-bulu-14-xueshan`）

> **归属（基准 §18）**：`design/catalog/skills-*.md` 的书界补录图鉴。本文只定义书界 14 首领缺口中新建的个人散承武学，并登记本界对既有武学的来源扩展请求。
> **上游**：`docs/decisions/author-decisions.md`、`docs/decisions/author-requirements.md` AR-14/15/16、`docs/00-canon.md` §3–§5/§9/§12/§13/§16/§18、`docs/decisions/rulings-v1.md`、`docs/decisions/ultimate-counts-tianzhong-dizhong.md`、`design/05`、`design/21`、`design/catalog/npcs-ch14-xueshan.md`。
> **引用而不重定义**：武学字段、预算与招式公式见 `design/05`；经脉路线、外放、护体内劲与调息见 `design/21`；穴位见 `design/15`；Buff 见 `design/06`；既有乾隆医毒、军伍与通行武学分别见 `skills-qianlong.md`、`skills-general.md`。
> **覆盖声明**：本文不修改现有门派图鉴。胡家、苗家、天龙门与药王门的缺口由主书界 13 负责；本文只为无门派的宝树 / 阎基补两门个人散承；清廷军伍来源扩展已由通行册落实。
> **标注约定**：**（原创扩展）**为原著没有的武学、招名或机制；**（待考）**为尚须按三联 / 广州修订版逐字核对的原著事实；**【建议值】**为等待归属文档确认但可先生产的数值。
> **版本**：首领武学补录与替补替换（2026-09-28）；经脉落地终审（2026-09-29）；路线叙事第三轮（2026-09-29）。

---

## 0. 绝招显式路线索引

本索引镜像正文卡，不是覆写层。两条路线均按 `design/21` §4.3.1–§4.3.4 先定动作末端，再按阴性个人散承选六阴 / 阴跷 / 阴维骨架；正文与本表不一致即为构建错误。

<!-- skill-catalog-audit:start -->
| 品阶 | 武学 | MoveDef（正文卡镜像） | 路线 ID | steps（acupointRef/segmentCt/riskBp） |
|---|---|---|---|---|
| 7 地下 | `sk_cangfengxingqi` | `mv_cangfengxingqi_huming` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_cangfengxingqi_huming; projection:false; projectionSpreadSteps:[]}` | `mfr_cangfengxingqi_huming` | `MeridianRouteDef{moveRef:mv_cangfengxingqi_huming; ultimate:true; purpose:defense; requiredNature:[yin,harmony]; allowOpposedNature:true}`；`ap_zushaoyin_taixi/90/100→ap_zutaiyin_yinlingquan/90/120→ap_zujueyin_ququan/90/140→ap_yinwei_zhubin/90/160→ap_renmai_guanyuan/90/180→ap_renmai_qihai/90/200→ap_dumai_mingmen/90/220→ap_dumai_shenzhu/90/240` |
| 7 地下 | `sk_cuomaifanzhang` | `mv_cuomaifanzhang_fanmai` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_cuomaifanzhang_fanmai; projection:false; projectionSpreadSteps:[]}` | `mfr_cuomaifanzhang_fanmai` | `MeridianRouteDef{moveRef:mv_cuomaifanzhang_fanmai; ultimate:true; purpose:attack; requiredNature:[yin,harmony]}`；`ap_yinqiao_zhaohai/90/100→ap_zushaoyin_fuliu/90/120→ap_zutaiyin_xuehai/90/140→ap_shoujueyin_quze/90/160→ap_shoujueyin_ximen/90/180→ap_shoujueyin_jianshi/90/200→ap_shoujueyin_neiguan/90/220→ap_shoujueyin_laogong/90/240` |
<!-- skill-catalog-audit:end -->

两路共享穴位 `0/8=0%≤50%`，既非轮换也非逆序。`藏锋护命` 由足三阴蓄息，经任脉丹田转督脉护背；末两段跨入阳性督脉，故显式 `allowOpposedNature:true` 并提高风险。`翻掌错脉` 从阴跷起势，经足三阴转入手厥阴，以“曲泽 → 郄门 → 间使 → 内关 → 劳宫”完成接触掌击。每路 `flowCt=8×90=720`，与绝招收招合计 `1200+720=1920≤2000`。

| 路线叙事第三轮同步镜像 | 模板代号 | 段数 | 路线 CT | 收招合计 | 风险列表 / 总风险 |
|---|---|---:|---:|---:|---|
| `mfr_cuomaifanzhang_fanmai` | 见文首索引 | 8 | `8×90=720` | `1200+720=1920 CT` | `[100,120,140,160,180,200,220,240]` / `1360` |

## 1. 补录边界与来源扩展登记

### 1.1 宝树个人散承边界

人物目录把 `npc_baoshu` 定为“无门派 / 医者伪装”。原著骨架可确认宝树即阎基、与旧案毒谋有关；其固定成套内功、拳掌名与传承谱系均无可靠原著名称，故本文两门均为**（原创扩展）**，`sect:null`。它们与 `skills-qianlong.md` 的乾隆医毒入门池共享医毒能力前置，但**不属于药王门，也不证明阎基师承药王门**。

### 1.2 来源扩展登记

| 既有武学 | 需加入书界 | 依据 | 本文处理 |
|---|---|---|---|
| `sk_baizhanxinfa` | `ch14_xueshan` | 本界有清廷围捕、军伍精英与赛总管；既有卡定位为历代军伍行气法汇编，非特定朝代门派 | **已解决：**通行册已落实 `ch14_xueshan` 来源 |
| `sk_pojunqiangfa` | `ch14_xueshan` | 同一清廷军伍来源；既有卡定位为历代军镇重枪破阵总名 | **已解决：**通行册已落实 `ch14_xueshan` 来源 |

`sk_hunyuanfangzhuang`、`sk_sihaibiaodao`、`sk_huweiyingqiang` 等既有卡已经覆盖雪山，不再登记。胡家、苗家和天龙门的高阶缺口只保留跨书界替补，待主书界 13 补录。

## 2. 宝树 / 阎基个人散承武学

### 2.1 `sk_cangfengxingqi` 藏锋行气（7 地下 · 内功 · 个人医毒散承）**（原创扩展）**

| 字段 | 值 |
|---|---|
| 出处 | 原著有宝树即阎基及其涉入毒谋的人物事实；“藏锋行气”与全部招式、数值均为**（原创扩展）**，不冒充原著武学名 |
| origin / sect / lineage | `expanded` / `null` / 宝树（阎基）个人医毒散承；与乾隆医毒体系相接但不归药王门 |
| 图鉴体系关系 | 与 `skills-qianlong.md` 共用医毒能力与基础吐纳前置，但并非该册任何门派的同门武学；来源归属仅为宝树 / 阎基个人散承 |
| sourceChapters | `[ch14_xueshan]` |
| nature · wOut/wIn · moveSlots | `yin` · `0/1` · 4 |
| meridians | `[mer_zushaoyin,mer_zutaiyin,mer_zujueyin,mer_renmai]` **【建议值】**；绝招末段为护背跨督脉，见显式路线 |
| reqs | `attrs {con:42,wis:45,wil:38}`；`aptitude {apInner:40}`；`skills {med:35,poi:45}`；`prereq [{skill:sk_yaowangtuna,layer:5}]`；`hard:[prereq,skills.poi]`；个人来源可按下列 `reqsOverride` 解除药王吐纳前置 |
| inner.contribution | `{mpMaxPct:26,hpMaxPct:16,attrs:{con:4,wis:3,wil:3},mpRegen:2.0}`；`IP=26+16+2×(4+3+3)+5×2.0=72` |
| inner.stats | `{resPoison:9,effRes:6}`，合计 15；不是无条件毒免 |
| layerStats / 层数 | `null`；1 重敛息，3 重辨息，5 重藏锋，**7 重绝招藏锋护命**，10 重息隐 |
| setTags / conflicts | `[]` / 阴性主运与阳性内功相冲仍按 `design/05` §5.4；不授予药王门职级或套装标签 |
| special / observable | `{fusible:false}` / `false`；个人独门不可仅靠战斗观摩学会 |
| learnSources | 宝树在受控同行期主动传授 `master npc_baoshu maxLayer:10 reqsOverride {prereq:[],hard:[skills.poi]}`；或完成其处置后取得未命名旧稿 `manual maxLayer:8 reqsOverride {prereq:[],hard:[skills.poi]}` **（原创扩展；载体待物品归属文档登记）** |
| description | 将识毒、敛息和护住要害编成阴性行气法，适合伪装身份与危局自保；不提供现实用药或行气指导。 |
| inner.breathProfileRef / inner.innerGuard | `txp_cangfengxingqi` / `{enabled:true,reflectBp:0}`；自然护体与绝招防守路线可启用 III 档护体内劲，绝不反震 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 敛息 `mv_cangfengxingqi_lianxi` **（原创扩展）** | 1 | 自身·支援 | 0 | 6%/2/900 | 清 1 层普通中毒；仅品阶对抗成功时生效 | — | `power=0`；驱散效果按 `design/06` 品阶规则 |
| 辨息 `mv_cangfengxingqi_biandu` **（原创扩展）** | 3 | 自身·支援 | 0 | 6%/2/900 | `bf_bidu` 2 | — | `power=0`；短时抗毒而非免疫 |
| 护脉 `mv_cangfengxingqi_humai` **（原创扩展）** | 5 | 自身·支援 | 0 | 7%/3/1000 | `bf_shoushi` 2 | — | `power=0`；防守招以 cd 与行动机会定价 |
| 藏锋护命 `mv_cangfengxingqi_huming`（`sk_cangfengxingqi` 绝招，**原创扩展**） | 7 | 自身·支援 | 0 | 9%/0/1200 | `bf_hutizhenqi` 100%·2，护体=`hpMax×14%×1.2=16.8%`；气势 100 | — | 地阶标准治疗 18% 等价护体 ×1.2 后按兼具清毒的防守复合效用折至 14% 基值；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_cangfengxingqi_huming; projection:false; projectionSpreadSteps:[]}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 藏锋 | `ps_cangfengxingqi_cangfeng` | 2 | 本行动未主动攻击时 `effRes +4→+10`，只作用下一次效果对抗 |
| 辨毒 | `ps_cangfengxingqi_biandu` | 4 | 战斗外识毒检定 +10→+25；不直接展示毒物配方 |
| 护脉 | `ps_cangfengxingqi_humai` | 6 | 自身中毒时护体内劲容量 +5%→+12%，仍受 `design/21` 容量与内力守恒式限制 |
| 息隐 | `ps_cangfengxingqi_xiyin` | 10 | 每战第一次降至 30% 气血时获得 `bf_shoushi` 2；每战 1 次 |

#### 调息档案

| 武学 | BreathProfile | `grade/layer/nature/scope/ct/mpCostBp` | innerGuard | 满层验算 |
|---|---|---|---|---|
| `sk_cangfengxingqi` | `txp_cangfengxingqi` | `7/10/yin/3/1000/0` | `{enabled:true,reflectBp:0}` | `reliefBp=500+7×100+10×80=2000`；`repairUnits=120+7×24+10×18=468`；`outOfBattleScaleBp:15000` |

### 2.2 `sk_cuomaifanzhang` 错脉翻掌（7 地下 · 拳脚/掌 · 个人医毒散承）**（原创扩展）**

| 字段 | 值 |
|---|---|
| 出处 | 据宝树 / 阎基涉入毒谋的角色能力作玩法扩写；原著没有“错脉翻掌”名称及以下招式，全部为**（原创扩展）** |
| origin / sect / lineage | `expanded` / `null` / 宝树（阎基）个人医毒散承；与乾隆医毒前置相接但不归药王门 |
| 图鉴体系关系 | 与 `skills-qianlong.md` 共用医毒能力与基础护手前置，但并非该册任何门派的同门武学；来源归属仅为宝树 / 阎基个人散承 |
| sourceChapters | `[ch14_xueshan]` |
| nature · wOut/wIn · moveSlots | `yin` · `0.55/0.45` · 4；`aptitude:apFist` |
| reqs | `attrs {agi:40,wis:45}`；`aptitude {apFist:40}`；`skills {med:30,poi:45}`；`prereq [{skill:sk_yaowanghushou,layer:5}]`；`hard:[prereq,skills.poi]`；个人来源可按下列 `reqsOverride` 解除药王护手前置 |
| layerStats | `{effHit:[3,8],hit:[2,7]}`，合计 15（地阶上限） |
| 层数要点 | 1 重探脉，3 重扣腕，5 重藏毒，**7 重绝招翻掌错脉**，10 重掌随脉转 |
| setTags / conflicts | `[]` / 毒与点穴各走 `design/06` 的叠层、品阶及免疫规则；不自动穿透护体 |
| special / observable | `{fusible:false}` / `false`；个人独门不可仅靠观摩习得 |
| learnSources | 在 `q_14_main_z_03` 完成当面对质并保全旧稿，或在 `q_14_main_x_03` 履行与宝树的交换后，由 `npc_baoshu` 传授 `maxLayer:10 reqsOverride {prereq:[],hard:[skills.poi]}`；处置线旧稿只授至 8 重 **（原创扩展；不预建物品 ID）** |
| description | 以诊脉的触手位置反作扣腕、错劲和接触施毒，依赖近身判断；不是隔空点穴，也不提供现实伤害手法。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 探脉掌 `mv_cuomaifanzhang_tanmai` **（原创扩展）** | 1 | 单体·1·近身 | 1.00 | 7%/0/1000 | — | 可 | `1.00×(1+0)×1×1−0=1.00` |
| 扣腕翻掌 `mv_cuomaifanzhang_kouwan` **（原创扩展）** | 3 | 单体·1·近身 | 1.10 | 7%/1/1000 | `bf_shiheng` 30%·1 | 可 | `1×(1+0.12)−0.10×0.30=1.09≈1.10` |
| 袖底藏毒 `mv_cuomaifanzhang_cangdu` **（原创扩展）** | 5 | 单体·1·近身 | 1.25 | 8%/2/1000 | `bf_zhongdu` 50%·1 层 | 可 | `1×(1+0.24+0.05)−0.10×0.50=1.24≈1.25` |
| 翻掌错脉 `mv_cuomaifanzhang_fanmai`（`sk_cuomaifanzhang` 绝招，**原创扩展**） | 7 | 单体·1·近身 | 2.85 | 9%/0/1200 | `bf_zhongdu` 100%·1 层；`bf_xueweishoufeng(level:6,acupointRef:targetPrimary)` 30%·2 次自身行动；气势 100 | 可 | `3.00−0.10−0.20×0.30=2.84≈2.85`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_cuomaifanzhang_fanmai; projection:false; projectionSpreadSteps:[]}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 识脉 | `ps_cuomaifanzhang_shimai` | 2 | 对已有中毒目标，本武学效果命中 +4pp→+10pp |
| 藏毒 | `ps_cuomaifanzhang_cangdu` | 5 | 战斗开始可把一份已持有合法毒物交给 `poisonCoat`；不凭空生成毒药 |
| 反制 | `ps_cuomaifanzhang_fanzhi` | 8 | 成功招架近身拳脚后，本武学下一招命中 +5→+12；每回合 1 次 |
| 掌随脉转 | `ps_cuomaifanzhang_dacheng` | 10 | 对有穴位受封的目标 Z3 +8%；不升级封穴等级 |

## 3. 外放候选审计表

| 武学 / 招式 | 候选原因 | `projection` | `projectionSpreadSteps` | 判定 |
|---|---|---:|---|---|
| `mv_cangfengxingqi_lianxi` | 自身清毒支援 | `false` | `[]` | 真气不离体；清毒不是外放 |
| `mv_cangfengxingqi_biandu` | 自身抗毒支援 | `false` | `[]` | 只改变自身抗性 |
| `mv_cangfengxingqi_humai` | 自身防守支援 | `false` | `[]` | 只改变自身守势 |
| `mv_cangfengxingqi_huming` | 自身护体绝招 | `false` | `[]` | 护体不离体伤敌，不是外放 |
| `mv_cuomaifanzhang_tanmai` | 近身掌击 | `false` | `[]` | 接触探脉，不是掌风 |
| `mv_cuomaifanzhang_kouwan` | 扣腕错劲 | `false` | `[]` | 必须近身接触 |
| `mv_cuomaifanzhang_cangdu` | 实体毒物随掌接触 | `false` | `[]` | 实体毒具不因附在攻击上成为真气外放 |
| `mv_cuomaifanzhang_fanmai` | 掌击并施毒 / 封穴 | `false` | `[]` | 劳宫只是掌击动作末端；没有离体掌力叙事 |

本册外放招式 `0/8`。外放白名单只在 `projection:true` 时构成附加硬约束；本册绝招虽经过劳宫等手部穴位，仍不得据此反推为外放。

## 4. 统计表

| 口径 | 内功 | 拳脚 | 合计 |
|---|---:|---:|---:|
| 新增武学 | 1 | 1 | 2 |
| 7 地下 | 1 | 1 | 2 |
| 原著有固定武学名 | 0 | 0 | 0 |
| 原创扩展武学 | 1 | 1 | 2 |
| 正文招式 | 4 | 4 | 8 |
| 绝招 | 1 | 1 | 2 |
| 外放招式 | 0 | 0 | 0 |
| `txp_*` 调息档案 | 1 | 0 | 1 |

绝招数量核算：两门均为地下 7，按 `ultimate-counts-tianzhong-dizhong.md` 与 `design/21` §4.2 各恰有 1 记，均在 7 重解锁；合计 `2×1=2`。两条绝招路线均为 8 段，资源均为气势 100、耗内 9%、`cd:0`、收招 1200。

## 本文新增术语与 ID

| 类型 | ID | 名称 / 用途 |
|---|---|---|
| 武学 | `sk_cangfengxingqi` | 藏锋行气；宝树 / 阎基个人医毒散承内功 **（原创扩展）** |
| 武学 | `sk_cuomaifanzhang` | 错脉翻掌；宝树 / 阎基个人医毒散承拳掌 **（原创扩展）** |
| 招式 | `mv_cangfengxingqi_lianxi`、`mv_cangfengxingqi_biandu`、`mv_cangfengxingqi_humai`、`mv_cangfengxingqi_huming` | 藏锋行气四招 |
| 招式 | `mv_cuomaifanzhang_tanmai`、`mv_cuomaifanzhang_kouwan`、`mv_cuomaifanzhang_cangdu`、`mv_cuomaifanzhang_fanmai` | 错脉翻掌四招 |
| 被动 | `ps_cangfengxingqi_cangfeng`、`ps_cangfengxingqi_biandu`、`ps_cangfengxingqi_humai`、`ps_cangfengxingqi_xiyin` | 藏锋行气四被动 |
| 被动 | `ps_cuomaifanzhang_shimai`、`ps_cuomaifanzhang_cangdu`、`ps_cuomaifanzhang_fanzhi`、`ps_cuomaifanzhang_dacheng` | 错脉翻掌四被动 |
| 路线 | `mfr_cangfengxingqi_huming`、`mfr_cuomaifanzhang_fanmai` | 两记绝招的显式经脉路线；对象 schema 归 `design/21` |
| 调息 | `txp_cangfengxingqi` | 藏锋行气调息档案；对象 schema 归 `design/21` |

遗稿载体尚未建立正式物品 ID；物品归属文档接纳前，任务数据只以学习解锁动作表达，不得生成悬空引用。

## 数据校验规则与测试用例

| ID | 输入 / 操作 | 期望 |
|---|---|---|
| XSBL-T01 | 统计两门正式武学 | 均为 7 品、各 4 招、各 1 绝招；无天级闭集变化 |
| XSBL-T02 | 编译两条绝招路线 | 各 8 个已登记且不重复的 `ap_*`；`1200+8×90=1920≤2000` |
| XSBL-T03 | 比较两路线 | 共享 `0/8=0%≤50%`；非循环轮换、非逆序，且全局无完全相同序列 |
| XSBL-T04 | 以阴性主运执行 `mfr_cangfengxingqi_huming` | 因 `allowOpposedNature:true` 可合法跨督脉；风险按后段递增结算 |
| XSBL-T05 | 以普通毒具使用藏毒掌 | `projection:false`，实体毒具按 `poisonCoat` 结算，不获得外放档位 |
| XSBL-T06 | 满层运行 `txp_cangfengxingqi` | `reliefBp=2000`、`repairUnits=468`、战外倍率 `15000 bp` |
| XSBL-T07 | 未持合法毒物触发 `ps_cuomaifanzhang_cangdu` | 不生成涂毒状态，也不凭空创建消耗品 |
| XSBL-T08 | 非宝树来源角色学习两门武学 | 满足医毒 / 属性 / 前置即可正常习得；不要求成为 Boss，不授药王门身份 |

## 待决事项 / 依赖

### 替下游给出的建议值

| 编号 | 下游 / 归属 | 本文采用的建议值 | 回填条件 |
|---|---|---|---|
| XSBL-D01 | `design/15` / 人物与武学经脉配表 | `sk_cangfengxingqi` 取足三阴与任脉为核心，护命招跨督脉 | 正式数据入库并经固定种子实战后确认 |
| XSBL-D02 | `design/10` / 物品图鉴 | 宝树处置线可有“藏锋行气遗稿”，暂不登记 `it_*` | 物品归属文档确认载体、唯一性和掉落后再建 ID |

### 本文依赖的上游事实

| 上游 | 状态与本文采用 |
|---|---|
| `catalog/npcs-ch14-xueshan.md` | **已解决：**宝树为无门派 / 医者伪装，本文不把两门武学写成药王门传承 |
| `skills-qianlong.md` | **已解决：**只复用 `sk_yaowangtuna`、`sk_yaowanghushou` 作公共医毒学习前置，不改其归属 |
| `skills-general.md` | **已解决：**`sk_baizhanxinfa`、`sk_pojunqiangfa` 的 `sourceChapters` 已由通行册加入雪山；见 §1.2 |

### 对基准的修改提案

无。本文没有新增天级、枚举、通用公式或 ID 前缀。

### 原著考据待办

| 编号 | 待办 | 当前默认 |
|---|---|---|
| XSBL-K01 | 核三联 / 广州修订版中阎基 / 宝树明确展示的武学、医术与用毒动作，确认是否存在可采用的固定武学名 | 在可靠原文名出现前，两门及全部招名均保留“原创扩展” |

### 开放问题（附默认值）

| 编号 | 需作者 / 上游拍板 | 本版默认值 / 理由 |
|---|---|---|
| XSBL-O01 | 两门个人散承的永久获取是否允许 | 默认允许：完成宝树当面对质 / 交易可传至 10 重，处置后旧稿至 8 重；符合“Boss 武学也可由主角与他人正常习得” |
| XSBL-O02 | 旧稿是否建立正式物品 ID | 默认暂不建立；在 `design/10` 确认前以任务奖励动作直接开学习来源，避免越权定义物品 |
