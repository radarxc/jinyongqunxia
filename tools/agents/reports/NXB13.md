# NXB13 报告 · 书界 13《飞狐外传》首领所缺武学补录与替补替换

## 1. 摘要（3–6 行）

- 已新建《飞狐外传》按书补录图鉴，补齐苗家、胡家、商家堡、南海五虎、会武融汇、天龙门、药王门与八极支系共 14 门武学。
- 已将飞狐八名 Boss 与五类手配精英的临时替补换为本门 / 同来源正式武学；新增武学均可由主角和其他人物按门派、谱册、会武或奇遇途径习得，无敌人专用条目。
- 已补 15 记绝招、31 条显式路线与 8 个调息档案；41 招逐招审计均非外放，绝招路线无完全重复或 ≥80% 无理由重合。
- 正式配装后的 Boss 为 17.91–18.70 轮、精英为 8.10–8.56 轮，均落在 12–25 / 6–10 窗口，血量与防御倍率无需调整。
- 飞狐本界图鉴缺口已闭合；雪山 B01 / B02 / B04 / B05 / B07 已形成逐槽位映射，待 NXfix 接入。

## 2. 产出（文件、行数、主要章节）

| 文件 | 完稿行数 | 主要产出 |
|---|---:|---|
| `docs/design/chapters/13-feihu.md` | 1,221 | 版本行、门派学习表、Boss 武学摘要、武学来源、§12.7 正式配装、补录后缺口表与逐单位节奏 |
| `docs/design/catalog/skills-bulu-13-feihu.md` | 392 | 14 门武学卡、15 记绝招、31 条路线、8 个调息档案、外放审计、统计与校验规则 |
| `tools/agents/reports/NXB13.md` | 192 | 本报告：映射、数值、跨书接入、校验与遗留事项 |

## 3. 关键结论与数值

1. 品阶分布为地上 9 品 2 门、地下 7 品 8 门、玄上 6 品 3 门、玄中 5 品 1 门；八门内功的主运品阶可直接承接 `design/21` §11.9 七参，不再以外功或空缺兜底。
2. 绝招数按品阶严格核算：地上 `2×2=4`，地下 `8×1=8`，玄上 `3×1=3`，玄中 0，合计 15；解锁层仅为 7 / 9 重。
3. 内功贡献按 `IP=mpMaxPct+hpMaxPct+2×Σattrs+5×mpRegen` 复算：地上均 94.5，地下均 72，玄中为 48.5，精确命中 `design/05` 对应预算。
4. 15 条绝招路线与 16 条地阶普通招路线共 31 条；同门绝招共享穴位不超过较短路线 50%，全库无完全相同路线。凤家五虎拳路线改 3 穴后，跨图鉴重合低于 80%。8 个 `txp_*` 均显式登记 `outOfBattleScaleBp:15000`。
5. 41 招外放数为 0：调息 / 防守不离体，刀剑属于普通兵刃挥击，拳拿 / 点穴为接触式手法，均为 `projection:false`，无 `projectionSpreadSteps`。
6. 静态节奏统一用 `Rraw=R0×10000²/(A×D)×H`；正式值全数过窗，因此所有单位保持血量 / 防御倍率 `1.00 / 1.00`，不以压低经脉强度换轮数。

## 4. 开放问题（附默认值）

| 编号 | 开放问题 | 本版默认值 |
|---|---|---|
| NXB13-O01 | “苗家玄功 / 胡家玄功”是否保留为正式名称？ | 保留原创扩展名；若版本考据获得固定名，只做同物重命名并保留旧 ID 迁移 |
| NXB13-O02 | 袁紫衣是否改用考据确认后的师门内功？ | 继续使用不绑定个人的 `sk_huiwuguixin`；有可共享且确证的传承后再替换 |
| NXB13-O03 | 凤天南“五虎刀”、药王门内功与八极支系是否存在可直接采用的固定名称？ | 未逐字核定前保留当前原创扩展 / 原创扩展命名和 **（待考）** 标注 |
| NXB13-O04 | 三项建议机制值是否进入正式数据？ | 暂用刀拳互济 Z3 +4%、会武姿态切换 `ct +50`、八极首次碰撞回内 3% MPREF |
| NXB13-O05 | 胡斐、苗人凤 9 品主运地位下限何时进入上游名表？ | 按顶尖人物 9 品下限继续构建；由后续任务同步 `design/21` §11.9.1 |
| NXB13-O06 | 雪山何时接入本册武学？ | 由 NXfix 统一替换，不越权修改 `chapters/14-xueshan.md` |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| NXB13-P01 | 将 `catalog/skills-bulu-13-feihu.md` 纳入正式图鉴目录与构建输入 | 作者要求按主书界补缺；`design/21` 的构建闸门要求 Boss / 精英主运有可解析武学，而本任务又不得改既有 11 册门派图鉴 |

除目录接入外，本任务不提议修改书界参数、品阶公式、绝招预算、路线约束或节奏窗口。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 需同步内容 |
|---|---|---|
| `docs/design/chapters/14-xueshan.md` | §12.6 配装与图鉴缺口 | NXfix 按 §7.4 将 B01 / B02 / B04 / B05 / B07 接入本册正式武学，并写入本报告已核算的逐单位轮数 |
| `docs/design/21-meridian-flow-and-moves.md` | §11.9.1 地位下限 | 作者确认后登记胡斐、苗人凤的 9 品主运下限；不把章节建议值倒写成既成基准 |
| 图鉴目录 / 构建清单 | `skills-*.md` 收集入口 | 纳入 `skills-bulu-13-feihu.md`，保持既有 11 册不改 |
| `docs/design/09-combat-and-boss.md` 或测试资产 | 飞狐具名战回放 | 为三毒、双首领、援军、认输 / 非致死阈值补固定 RNG 实战回放 **（待实测）** |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 映射表

“原替补”取 NB4b / 原 §12.7；一行有多门时按分号位置对应。既有图鉴只复用、不修改。

| 书界 | 首领 / 模板 | 原替补 / 缺项 | 正式武学 ID（处理类型） | 所在图鉴 | 品阶 |
|---:|---|---|---|---|---|
| 13 | 商老太 | `sk_hunyuanfangzhuang` | `sk_shangjiabaoqi`（新增） | `skills-bulu-13-feihu` | 地下 7 |
| 13 | 凤天南 | `sk_hunyuanfangzhuang`；`sk_jiebiaodaofa`、`sk_tongbeijin` | `sk_nanhaiwuhuxinfa`；`sk_wuhudaofa`、`sk_fengjiawuhuquan`（新增） | `skills-bulu-13-feihu` | 地下 7；玄上 6、玄上 6 |
| 13 | 袁紫衣 | `sk_hunyuanfangzhuang` | `sk_huiwuguixin`（新增） | `skills-bulu-13-feihu` | 地下 7 |
| 13 | 苗人凤 | 缺 9 品主运 | `sk_miaojiaxuangong`（新增） | `skills-bulu-13-feihu` | 地上 9 |
| 13 | 田归农 | `sk_hunyuanfangzhuang`；`sk_junzhongdao` | `sk_tianlongmenxinfa`；`sk_tianlongzhengdao`（新增 / 升阶） | `skills-bulu-13-feihu` | 地下 7；地下 7 |
| 13 | 慕容景岳、薛鹊、石万嗔 | `sk_hunyuanfangzhuang`；`sk_tongbeijin` | `sk_yaowangneigong`；`sk_yaowanghushoufa`（新增） | `skills-bulu-13-feihu` | 地下 7；玄上 6 |
| 13 | 商家堡追兵 | `sk_jianghutuna`；跨门 `sk_tongbeijin` | `sk_shangjiabaoqi`（新增）；`sk_baguazhang`（复用） | `skills-bulu-13-feihu`；`skills-qianlong` | 地下 7；玄上 6 |
| 13 | 凤家护院 | `sk_jianghutuna`；`sk_tongbeijin` | `sk_nanhaiwuhuxinfa`；`sk_wuhudaofa`、`sk_fengjiawuhuquan`（新增） | `skills-bulu-13-feihu` | 地下 7；玄上 6、玄上 6 |
| 13 | 八极试武者 | `sk_jianghutuna` | `sk_bajixingqi`（新增） | `skills-bulu-13-feihu` | 玄中 5 |
| 13 | 药王门武学援手 | `sk_jianghutuna`；`sk_tongbeijin` | `sk_yaowangneigong`；`sk_yaowanghushoufa`（新增） | `skills-bulu-13-feihu` | 地下 7；玄上 6 |
| 13 | 天龙门亲信 | `sk_jianghutuna` | `sk_tianlongmenxinfa`、`sk_tianlongzhengdao`（新增 / 升阶） | `skills-bulu-13-feihu` | 地下 7；地下 7 |
| 14 | B01 争盒首领（天龙门槽） | `sk_hunyuanfangzhuang`；`sk_jianghubaizhanjian`、`sk_sihaibiaodao` | `sk_tianlongmenxinfa`、`sk_tianlonghezongjian`、`sk_tianlongzhengdao`（跨书界待替换） | `skills-bulu-13-feihu` | 地下 7、地下 7、地下 7 |
| 14 | B02 左童 / 右童 | `sk_hunyuanfangzhuang` | `sk_hujiaxuangong`（复用 / 跨书界待替换） | `skills-bulu-13-feihu` | 地上 9 |
| 14 | B04 胡斐 | 缺 9 品胡家主运 | `sk_hujiaxuangong`（跨书界待替换） | `skills-bulu-13-feihu` | 地上 9 |
| 14 | B05 宝洞首领（天龙门槽） | `sk_hunyuanfangzhuang`；`sk_jianghubaizhanjian`、`sk_sihaibiaodao` | `sk_tianlongmenxinfa`、`sk_tianlonghezongjian`、`sk_tianlongzhengdao`（跨书界待替换） | `skills-bulu-13-feihu` | 地下 7、地下 7、地下 7 |
| 14 | B07 苗人凤 | 缺 9 品主运；`sk_kaimenpiguaquan` | `sk_miaojiaxuangong`、`sk_miaojiazhang`（跨书界待替换） | `skills-bulu-13-feihu` | 地上 9、地下 7 |

### 7.2 新增武学清单

本轮没有把任何名称宣称为已核定的原著固定武学名；14 门均明确标为原创扩展或原创扩展命名。

| 武学 | 原著依据 / 标注 | 绝招数 | 外放数 | 正常习得途径 |
|---|---|---:|---:|---|
| `sk_miaojiaxuangong` 苗家玄功 | 苗家传承有据；名称与招式 **（原创扩展）** | 2 | 0 | 苗家 L4，或胡苗旧怨互证后获家谱内篇 |
| `sk_hujiaxuangong` 胡家玄功 | 胡家传承有据；名称与招式 **（原创扩展）** | 2 | 0 | 胡家刀谱内篇、胡斐指点或胡一刀遗泽奇遇 |
| `sk_shangjiabaoqi` 商家堡气 | 商家堡 / 八卦渊源；**（原创扩展）** | 1 | 0 | 商家堡 L4，或堡毁后获幸存者多数认可授谱 |
| `sk_huiwuguixin` 会武归心诀 | 大会会武融汇；**（原创扩展）** | 1 | 0 | 完成掌门大会会武笔记奇遇并满足多门前置 |
| `sk_nanhaiwuhuxinfa` 南海五虎心法 | 凤天南来源措辞 **（待考）**；**（原创扩展）** | 1 | 0 | 南海五虎传人或佛山案后合法移交谱册 |
| `sk_wuhudaofa` 南海五虎刀法 | “五虎刀”具体措辞 **（待考）**；**（原创扩展命名）** | 1 | 0 | 南海五虎传人、武馆谱册或不毁谱条件下获抄本 |
| `sk_fengjiawuhuquan` 凤家五虎拳 | 固定拳名无确证；**（原创扩展）** | 1 | 0 | 脱离凤天南的护院教习或凤家武馆谱册 |
| `sk_tianlongmenxinfa` 天龙门心法 | 关外天龙门体系；**（原创扩展）** | 1 | 0 | 天龙门 L4，或南北宗清理 / 和解后授谱 |
| `sk_tianlongzhengdao` 天龙正刀 | 天龙门刀路扩展；**（原创扩展）** | 1 | 0 | 天龙门 L4 清理支系授艺 |
| `sk_tianlonghezongjian` 天龙合宗剑 | 天龙门南北宗剑路互证；**（原创扩展）** | 1 | 0 | 天龙门 L4 合授，或两宗剑谱互证奇遇 |
| `sk_miaojiazhang` 苗家守正掌 | 苗家传承有据，固定掌名无确证；**（原创扩展）** | 1 | 0 | 苗家 L4，或胡苗旧怨互证后获家谱旁篇 |
| `sk_yaowangneigong` 药王内功 | 医毒传承有据，固定名 **（待考）**；**（原创扩展命名）** | 1 | 0 | 药王门 L3 且三线取二，或程灵素认可获正本 |
| `sk_yaowanghushoufa` 药王护手法 | 固定名无确证；**（原创扩展）** | 1 | 0 | 药王门 L2 或程灵素羁绊支线授谱 |
| `sk_bajixingqi` 八极行气 | 八极支系具体内功名 **（待考）**；**（原创扩展）** | 0 | 0 | 八极支系 L2 或掌门大会守约交流 |

合计：14 门武学、15 记绝招、0 招外放；全部可由玩家阵营人物学习，不设个人垄断或 `enemyOnly`。

### 7.3 来源扩展登记

| 既有武学 ID | 需加入书界 | 依据 | 结果 |
|---|---|---|---|
| — | — | 复用的既有技能已覆盖 `ch13_feihu`；新增技能直接登记原生书界 | 无来源扩展待登记 |

### 7.4 跨书界待替换

| 书界 | 人物 / 槽位 | NXfix 应接入 | 主书界与说明 |
|---:|---|---|---|
| 14 雪山 B01 | 争盒首领（天龙门槽） | 主运 `sk_tianlongmenxinfa`；剑 `sk_tianlonghezongjian`；刀 `sk_tianlongzhengdao` | 三门均为地下 7，登记 `ch14_xueshan` |
| 14 雪山 B02 | 左童 / 右童 | 主运 `sk_hujiaxuangong` | 复用地上 9；随行身份可走胡斐指点 / 家传认可链 |
| 14 雪山 B04 | 胡斐 | 主运 `sk_hujiaxuangong` | 地上 9，登记 `ch14_xueshan` |
| 14 雪山 B05 | 宝洞首领（天龙门槽） | 主运 `sk_tianlongmenxinfa`；剑 `sk_tianlonghezongjian`；刀 `sk_tianlongzhengdao` | 三门均为地下 7，登记 `ch14_xueshan` |
| 14 雪山 B07 | 苗人凤 | 主运 `sk_miaojiaxuangong`；拳掌 `sk_miaojiazhang` | 地上 9 / 地下 7，登记 `ch14_xueshan` |

本任务未改第 14 章；不存在“雪山田归农”映射。雪山其他镖局、山寨、清宫军伍与人物目录冲突不属于飞狐主书界补录范围。

### 7.5 逐单位轮数：替换前后

三段依次为“原始配装 → NB4b 临时补位 → 本任务正式补录”。`H` 为血量倍率与防御倍率之积。

| 单位 | 原始 | NB4b 临时 | 正式 | `H` | 窗口结论 |
|---|---:|---:|---:|---:|---|
| 商老太 | 17.20 | 17.97 | 17.97 | 1.00 | Boss 通过 |
| 凤天南 | 17.13 | 17.91 | 17.91 | 1.00 | Boss 通过 |
| 袁紫衣 | 17.73 | 18.22 | 18.22 | 1.00 | Boss 通过 |
| 苗人凤 | 17.74 | 18.70 | 18.70 | 1.00 | Boss 通过 |
| 田归农 | 17.54 | 18.22 | 18.22 | 1.00 | Boss 通过 |
| 慕容景岳 | 17.67 | 18.22 | 18.22 | 1.00 | Boss 通过 |
| 薛鹊 | 17.67 | 18.22 | 18.22 | 1.00 | Boss 通过 |
| 石万嗔 | 17.74 | 18.22 | 18.22 | 1.00 | Boss 通过 |
| 商家堡追兵 | 7.86 | 8.10 | 8.56 | 1.00 | 精英通过 |
| 凤家护院 | 7.86 | 8.10 | 8.56 | 1.00 | 精英通过 |
| 八极试武者 | 7.86 | 8.10 | 8.10 | 1.00 | 精英通过 |
| 药王门武学援手 | 8.10 | 8.10 | 8.56 | 1.00 | 精英通过 |
| 天龙门亲信 | 7.86 | 8.10 | 8.56 | 1.00 | 精英通过 |

商老太、凤天南没有 `twelveCycle`，故正式轮数仍为 17.97 / 17.91；其余正式值亦按各行实际里程碑输入，不以统一 15.2 近似。Boss 全部处于 12–25，精英全部处于 6–10，未调整血量、防御倍率或经脉。

雪山跨书槽位的“第 14 章临时值 → 接入本册后”复核为：B01 天龙门槽 `23.68→23.68`，B02 左童 / 右童各 `9.39→9.73`，B04 胡斐 `21.90→21.90`，B05 天龙门槽 `21.43→21.43`，B07 苗人凤 `21.90→21.90`。B01 / B05 / B07 更换的是同品阶正式来源武学，主运七参不变；B02 从 7 品调和替补改为 9 品阳性胡家玄功，仍落在精英窗口内。

### 7.6 未能补的缺口及原因

| 范围 | 未闭合项 | 原因 / 处理 |
|---|---|---|
| 飞狐本界 | 无 | 八名 Boss 与五类精英所列缺口均已正式替换 |
| 来源扩展 | 无 | 既有复用项已覆盖本界，新项直接登记来源 |
| 雪山跨书 | B01 / B02 / B04 / B05 / B07 正式武学尚未落到第 14 章 | 文件不在本任务写入范围；逐槽位映射与轮数已交 NXfix |
| 原著定名 | 凤天南五虎来源、袁紫衣师承、药王 / 八极固定内功名 | 尚未完成三联 / 广州修订版逐字核对，保留 **（待考）** 与原创标注 |
| 动态战斗验收 | 三毒、双首领、援军、非致死阈值 | 静态公式与工具门禁已过，仍需固定 RNG 实战回放 **（待实测）** |

### 7.7 需作者确认的条目

1. 是否接受“苗家玄功 / 胡家玄功”作为原创扩展正式名；默认接受并保留 ID。
2. 是否继续让袁紫衣使用可共享的大会融汇内功；默认使用 `sk_huiwuguixin`，不设人物独门门槛。
3. 是否接受刀拳互济 Z3 +4%、会武换式 `ct +50`、八极首次碰撞回内 3% MPREF 三个建议值；默认启用。
4. 是否把胡斐、苗人凤 9 品主运地位下限写入 `design/21`；本任务按 9 品继续构建。
5. 考据若确认五虎刀、药王内功或八极内功另有固定名称，是否进行同物重命名；默认保留旧 ID 迁移，不新建平行技能。

### 7.8 验收清单

- ✅ 只修改获准的三个路径；未触碰现有 11 册门派图鉴、基准、裁定、仓库任务清单或第 14 章。
- ✅ 先全库检索复用；商家堡追兵外功复用 `sk_baguazhang`，其余确实缺失项收入按书补录册。
- ✅ 14 门武学均写明门派 / 来源、同体系既有图鉴与非敌人专用习得途径。
- ✅ 绝招数量、7 / 9 重解锁、资源与路线均落盘；31 条显式路线中 15 条绝招路线通过唯一性与多样性检查。
- ✅ 9 条路线末端按 `design/21` §4.3.1 修正：`mfr_tianlonghezongjian_shouguan`、`mfr_tianlonghezongjian_dianjian`、`mfr_tianlonghezongjian_jiefeng`、`mfr_tianlongzhengdao_nanbei`、`mfr_miaojiazhang_huimian`、`mfr_miaojiazhang_tuizhang`、`mfr_miaojiazhang_huishen`、`mfr_miaojiazhang_jiewan`、`mfr_nanhaiwuhuxinfa_nachao`。
- ✅ 8 门内功均有 `txp_*`、离战倍率与内劲抵消档；41 招完成外放逐招审计。
- ✅ 飞狐配装不再保留本轮对应替补标注；七参、里程碑与逐单位轮数已重算。
- ✅ 版本行已追加“首领武学补录与替补替换（2026-09-28）”。
- ✅ 飞狐本界缺口、来源扩展与跨书接入已分开登记；雪山按 B01 / B02 / B04 / B05 / B07 给出具体映射，未把未修改的第 14 章误报为完成。
- ⚠️ 原著固定名称与师承细节仍待三联 / 广州修订版逐字考据；所有未核定内容均保留 **（待考）** 或原创标注。
- ⚠️ 静态门禁不替代固定 RNG 实战与手机端回放；相关项保持 **（待实测）**。

### 7.9 最终门禁结果

| 命令 | 结果 |
|---|---|
| `python3 tools/lint/check_ids.py --strict` | ✅ 通过；仅有基线已知 `sk_babuganchan`，新增失败 0 |
| `python3 -m unittest discover -s tools/lint -p "test_*.py"` | ✅ 105 项通过 |
| `python3 tools/lint/check_skill_catalogs.py --strict` | ✅ 12 册、错误 0；本册提示 0 |
| `python3 tools/agents/check_route_unique_for.py docs/design/catalog/skills-bulu-13-feihu.md` | ✅ 完全相同路线 0 |
| `python3 tools/agents/check_undefined_in.py docs/design/chapters/13-feihu.md docs/design/catalog/skills-bulu-13-feihu.md` | ✅ 未定义引用 0 |
| `python3 tools/balance/damage_sim.py --check` | ✅ 47 项通过 |
| `python3 tools/balance/meridian_flow_sim.py --check` | ✅ 通过 |
| `python3 tools/balance/boss_pacing.py --check` | ✅ 通过 |
| `python3 tools/balance/projection_sim.py --check` | ✅ 通过 |
| `git diff --check` | ✅ 通过 |
| 写入范围、占位词与代码围栏检查 | ✅ 仅三个允许路径；无占位词；围栏成对 |
