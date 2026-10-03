# DES-sync-design-b 报告 · 设计文档同步 B · design/03、04、05、21 接长生诀核心（Z0-CS、1:20 化解、螺旋经脉伤害、特殊功法、sxp、类别名额）
## 1. 摘要（3–6 行）
- 已将《长生诀》核心接口同步到 design/03、04、05、21；各层效果仍唯一归属 design/25，目标文档只登记消费边界。
- 已接通整数化 1:20 化解；护体内劲按 `remainMp/opponentMpCommitted` 缩放，CS-O02 与 P7 冻结顺序已闭环。
- 白马 Lv1–20 已核对为复用属性 v2 统一曲线；本轮返修补齐真元性质门控与精确 int64 类型，四项强制检查和 `git diff --check` 均通过。

## 2. 产出（文件、行数、主要章节）
| 文件 | 行数 | 主要章节 |
|---|---:|---|
| `docs/design/03-attributes.md` | 2083 | §3.3 白马曲线；§7.0 顿悟点 / 真元性质账；精确字段、V03-23、T03-28～29 |
| `docs/design/04-damage-formula.md` | 1093 | §3.5 Z0-CS；§6.2 螺旋经脉伤害；V30–V31、T47–T49 |
| `docs/design/05-martial-arts-system.md` | 3525 | §2.2.1 特殊功法；§2.6 / §3.2 累计经验；§6.1 苏醒 3+3 |
| `docs/design/21-meridian-flow-and-moves.md` | 2874 | §4.4 Z0-CS 消费；§4.8 护体预算；§4.8.1 节点分配；§12 接口 |
| `tools/agents/reports/DES-sync-design-b.md` | 45（完成时） | 结论、交接与自检 |

## 3. 关键结论与数值
- design/03 §3.3：白马 `Ce=1..20` 复用统一曲线，Lv1 / Lv20 为 `300/200/40/30`、`1948/1185/237/178`（见 design/25 §2）。
- design/03 §7.0、§11.3：`epiphany/masteryXp[*]/trueEssenceByNature[*]` 用精确非负 int64；真元总量只读为三性质账之和。第六层跨性质投放原子拒绝；第七层 `{yang:3000,yin:2000}` 可 1:1 投入 5000，账变 `{7000,5829,0}`（见 design/25 §2、§8）。
- design/04 §3.5：`SPIRAL_CANCEL_BP=200000`；`cancelCapacity=floor(spiralSpent×200000/10000)`，投入 19 对承诺 377 得容量 380、化解 377、剩余 0（见 design/25 §3）。
- design/04 §6.2、design/21 §4.8.1：`spiralMeridianDamage=floor(spiralDamageDealt×10000/10000)`；135 对三穴稳定分为 45/45/45，不复制整招 900。
- design/21 §4.4、§4.8、§12：时序为资源锁定 → Z0 → Z0-CS → Z1；`guardBudgetBp=floor(remainMp×10000/opponentMpCommitted)`，300→75 得 2500 bp，`rawOutwardQi` 1200→300，抵消 250、剩余 750。
- design/05 §2.2.1、§2.6、§3.2、§6.1：`sk_changshengjue` 为栏外 `story_art`，无普通品阶且不占名额；`eligibleSxp=max(0,cumulativeSxp-convertedSxp)`，转化率 60%–72% 唯一见 design/25 §8、design/13 §4.10；九层前保留 3 武功合计 + 3 内功，九层后全保留。

## 4. 开放问题（附默认值）
- 需作者确认：CS-O02 默认只把螺旋新增实际伤害按 10000 bp 计入经脉伤害，不复制整招（design/25 §13.5）。
- 需作者确认：第七层前真元默认按来源内功性质分账且只可投入同性质内功；第七层起才跨性质 1:1 无损（design/03 §15.5 O11）。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无新增提案：本任务仅同步 design/25 已定义接口；CS-O02 继续作为待作者确认的建议值，不越权改 Canon。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- ENG / 存档与成长：`changshengLayer`、`convertedSxp/cumulativeSxp`、`epiphany`、`masteryXp[12]`、`trueEssenceByNature.{yang,yin,harmony}`、`spendByNature`、`keptMartialIds/keptInnerIds`；XP 线格式须为原生 int64 或十进制字符串，`trueEssence` 仅作只读总和；实现七层同性质 / 跨性质门控及原子结算。
- `docs/design/02、13` / 书眠事务：把标量 `trueEssenceGained/trueEssence` 改为按来源 `nature` 入三账，并由 03 §7.0 校验投放；不得沿用“任意内功”无层数门控。
- ENG / 伤害与经脉：`ENG-CS-07 spiralSpent`、`ENG-CS-08 cancelMp`、`opponentMpCommitted/remainMp/guardBudgetBp/fullRawOutwardQi/spiralDamageDealt/spiralMeridianDamage/eligibleNodes`；序列化 `SpiralCancelSnapshot`，按 `causeId` 幂等。
- `docs/tech/04、05` / golden：补资源锁定→Z0→Z0-CS→Z1、多段共享、护体 300/75、无合格穴 `unallocated`、19/377 与 135/900。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ⚠️ 需作者确认（默认）：CS-O02 只复制螺旋新增实际伤害；第七层前真元按来源性质分账且仅同性质投放。确认前分别按 10000 bp / 七层门控执行。
- ✅ 交下游字段清单：成长侧为 `changshengLayer/convertedSxp/cumulativeSxp/epiphany/masteryXp/trueEssenceByNature/spendByNature/kept*Ids`；战斗侧为 `spiralSpent/cancelMp/spiralDamageDealt/opponentMpCommitted/remainMp/guardBudgetBp/fullRawOutwardQi/spiralMeridianDamage/eligibleNodes`。
- ✅ design/04、21 已落 Z0-CS、整数 bp 1:20、护体预算缩放与 CS-O02；P7 前冻结 `eligibleNodes`，算式可复算。
- ✅ design/05 已登记特殊功法、累计 `sxp/convertedSxp` 引用及跨类别 3+3；未复制 design/25 效果层表。
- ✅ design/03 已补顿悟 / 真元容量和投放，三类钱包均为 `bigint`，真元按性质分账并以第七层门控；已核对白马 Lv1–20，DES-attr-v2 已有内容未重写。
- ✅ 每处标明 design/25 来源；新规则配有字段、校验或测试条目，未引入废弃 ID。
- ✅ `check_ids.py --strict`、`damage_sim.py --check`、`meridian_flow_sim.py --check`、`projection_sim.py --check` 全部通过。
- ✅ 仅改四份获授权设计文档与本报告；报告不超过 50 行，无省略或待写占位。
