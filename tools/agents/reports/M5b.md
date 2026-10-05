# M5b 报告 · 外放加持（AR-16）的规则与技术文档同步（05 / 09 / 14 / tech/04 / tech/05 / 基准）

## 1. 摘要（3–6 行）

已将 AR-16 从经脉算法归属文档接入武学 schema、六角战斗、移动端预览、构建管线、玩法引擎与 Canon v1.5；外放仍是逐招事实，不按整门武学或旧远程标签推断。
射程、范围与额外耗内按 0 / 1 / 2 档绑定，点穴、迟滞或胀损造成的降档会使旧预览失效；玩家、敌人、召唤物与 AI 同规。
tech/05 已同时落实 NA1 的绝招 F2 / E2 时序、四段统一候选过滤、零副作用拒绝及 `query.moveAvailability` 同源契约。
05 已落实作者对“九品玄”和绝招数量的决定，并将龙爪手补齐为两记绝招；逐招外放清单仍按分工交 M5c。
四项强制检查与最终格式审计结果见 §7；AR-16a / b 数值继续作为可执行默认，保留作者确认入口。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要章节 / 改动 |
|---|---:|---|
| `docs/design/05-martial-arts-system.md` | 2,983 | v1.5；§3.5 绝招决定、§4 `MoveDef` / 外放判据、§13.7 龙爪手、V34–V36 / T33–T35 |
| `docs/design/09-combat-system.md` | 3,365 | v1.4；§3.6 F2/E2、§5 外放六角范围 / 选目标、§8.2 AI、§13 命令与查询 |
| `docs/design/14-ui-ux-mobile.md` | 1,480 | v1.4；出招前档位 / 射程 / 范围 / 成本预览、降档提示与重选 |
| `docs/tech/04-data-pipeline.md` | 1,934 | v1.4；`MoveDefSchema`、MF-V13～V15、覆盖率产物与 `TS-CONTENT-MFR-013` |
| `docs/tech/05-gameplay-engine.md` | 2,360 | v1.4；F0 / F2 / E2、统一候选过滤、可用性 DTO、AI、回放与副作用守卫 |
| `docs/00-canon.md` | 883 | v1.5；V15-01～V15-04、§4 / §8 / §9 / §18 / §19、校验与待决追溯 |
| `docs/decisions/canon-proposals-v1.2.md` | 370 | v1.5 追加处置：作者确认与 M6-P01～P03 |
| `tools/agents/reports/M5b.md` | 110 | 本报告：结论、数值、提案、下游同步清单与门禁证据 |

## 3. 关键结论与数值

| 项 | 结论 / 核算 |
|---|---|
| 内容真值 | 仅 `MoveDef.projection:true` 表示外放；`range` / `aoe` 保存 0 档基础值，`projectionSpreadSteps` 恰有三项且第 0 项规范化后深等于 `aoe` |
| 判定 | 明确以真气催动离体指力、掌力、剑气、刀罡等才可标；弹指神通、独孤九剑明确剑气招、降龙十八掌掌力招是示例，剑气表现为**（原创扩展）** |
| 三档 | 标准 / 高 / 顶尖对应射程 `+0/+2/+4`、范围模板 `[0]/[1]/[2]`、额外耗内 `0/200/400 bp × MPREF`；显式非法档拒绝，不静默降档 |
| Lv35 成本 | `MPREF=4697`；高档 `round(4697×0.02)=94`，顶尖档 `round(4697×0.04)=188`，先独立 half-up 后与原招成本相加 |
| 三例 | 弹指神通 5 / 7 / 9 格且均单体；独孤九剑剑气招 1 / 3 / 5 格、直线 n1 / n2 / n3；利涉大川 4 / 6 / 8 格、直线 n4 / n5 / n6 |
| 旧 Buff | `bf_zhenqiwaifang` 与 AR-16 射程增量取较大值、不相加；其他独立射程修正仍按 09 的固定顺序结算 |
| 威力 | 外放曲线替代普通 Z5M，不叠乘、不新建乘区；标准 10,000 bp，总硬界 6,500–22,000 bp，范围选档不再乘威力 |
| 绝招时序 | F2 原子支付并置 `ultimateCooldown=1`；本次 E2 不减，紧接下一次自身正常行动全程禁用并在其 E2 清零 |
| 候选过滤 | 自身冷却 → 本门共享冷却 → 禁止连续同招 → 路线硬封；通过后才检查外放档、资源、目标 / 范围 / LOS；拒绝不扣资源、不耗 RNG、不写事件 |
| 龙爪手 | 地中按裁定取两记：`mv_longzhaoshou_sanshiliu` 7 重、`mv_longzhaoshou_daoxu` 9 重；第二记复用既有 `mfr_longzhaoshou_daoxu` |

## 4. 开放问题（附默认值）

| 编号 | 开放问题 | 本次执行默认 |
|---|---|---|
| M5-O01 | 三档范围与扩张成本是否最终采用 | 射程 `+0/+2/+4`、范围 `+0/+1/+2` 档、额外 `0/2%/4% MPREF`；继续执行，待作者确认 |
| M5-O02 | 外放 Z5M 曲线陡度与替代方式是否最终采用 | 替代普通 Z5M、不叠乘，总界 6,500–22,000 bp；继续执行，待作者确认 |
| M5-O03 | 独孤九剑哪些具体招式采用剑气表现 | M5c 仅标明确剑气招并写**（原创扩展）**；破剑、破刀等近身式不因门名批量外放 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 处理结果 / 落点 | 理由 |
|---|---|---|
| M6-P01 | 已接纳为 Canon v1.5 V15-02；三档数值仍标“⚠️ 待作者确认”并按默认执行 | 外放的逐招身份、范围硬边界和成本是规则 / UI / 引擎共同依赖 |
| M6-P02 | 已接纳为 Canon v1.5 V15-03；曲线仍标“⚠️ 待作者确认”并按默认执行 | 只占唯一 Z5M，防止经脉优势双算并保持标准输入零漂移 |
| M6-P03 | 已接纳为 Canon v1.5 V15-04 | 固定 05 / 图鉴、21、09、04 的唯一归属，避免复制公式与格集合 |

本任务未新增 M6-P01～P03 之外的基准提案；作者“九品玄按玄上”另以 V15-01 结案。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 需同步内容 |
|---|---|---|
| `docs/design/catalog/skills-*.md` | 全部招式条目；M5c | 逐招填写 `projection`、基础 `range/aoe` 与三项 `projectionSpreadSteps`，并生成 / 维护 `projection-coverage.json`；不得整门批量标记 |
| `docs/design/06-buff-system.md` | `bf_zhenqiwaifang` | 明确旧 Buff 与 AR-16 所选档射程增量取较大值、不相加；非外放旧内容继续按原定义迁移 |
| `docs/design/21-meridian-flow-and-moves.md` | 绝招时序与支付措辞 | 将旧“绝招结算后置共享冷却”及“P1 原子预扣”统一为 F2 原子支付并设置、本次 E2 不减 |
| `docs/tech/01-architecture.md` | `BattleActionPlan` / `battle/act` | 确认导入的 `BattleAction` 对 skill 与 dual 两段均保留 `projectionStep`，拒绝原因与 tech/05 同源 |
| `docs/tech/08-backend-and-online.md` | 命令、录像与 hash DTO | 明确 `projectionStep` 随合法命令进入 replay/hash；不持久化推导格集为第二事实源 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 处理总表

| 来源 | 条目 | 目标文档与节 | 状态 |
|---|---|---|---|
| AR-16 / M5 | 逐招外放字段、判据与基础形态 | 05 §4.2 / §4.2.2、校验与测试 | ✅ 已同步；实例清单留 M5c |
| AR-16 / M5 | 六角射程、形状、遮挡 / 地形、选目标、AI、敌我同规 | 09 §5.2.1 / §5.4 / §8.2、§13 | ✅ 已同步 |
| AR-16 / M5 | 当前档预览、来源、成本与经脉异常降档提示 | 14 战斗 HUD / 招式面板、校验与测试 | ✅ 已同步 |
| AR-16 / M5 | schema、合法区间、路线端点、协议与覆盖率 | tech/04 `MoveDefSchema`、MF-V13～V15 | ✅ 已同步 |
| AR-16 / M5 | 纯预估、F0 冻结、F2 支付、AI、回放 / hash | tech/05 Core、查询、AI、replay | ✅ 已同步 |
| NA1 | F2 设置、E2 递减、四段过滤、`query.moveAvailability` | 09 §3.6 / §5.1 / §13；tech/05 | ✅ 已对齐 |
| 作者决定 | “九品玄”按玄上；天中 2–3、地中 1–2，四图鉴统一 | 05 §3.5 / §4.8 / V9；Canon V15-01 | ✅ 原文照录并引用统一裁定表 |
| NU5p 裁定 | 龙爪手取两记，补捣虚式 9 重 | 05 §13.7 | ✅ 复用既有招式与路线 ID |
| M6-P01～P03 | 范围 / 成本、唯一 Z5M、归属 | Canon V15-02～V15-04；提案表 v1.5 | ✅ 已处置，前两项保留确认入口 |

### 7.2 新增字段、接口与校验项

| 类别 | 新增 / 对齐内容 | 校验 |
|---|---|---|
| 静态招式 | `projection?: boolean`、`projectionSpreadSteps?: readonly [HexShape, HexShape, HexShape]`；既有 `range/aoe` 为基础档 | 三项完整、`[0]` 深等于 `aoe`；非外放不得携带；外放伤害段须用既有 `projected`，反向不推断 |
| 战斗命令 | skill 与 dual 两段的 `projectionStep?: 0\|1\|2` | 非外放必须省略；外放缺省 0；显式越界返回 `PROJECTION_STEP_UNAVAILABLE` |
| 经脉端口 | `projectProjection(input): ProjectionResult` | 纯函数；返回档位上限、射程、范围、额外耗内与唯一 Z5M，不改状态 / RNG / 队列 |
| 查询 DTO | `ProjectionStepAvailability`、`MoveAvailabilityEntry`、`MoveAvailabilityView` | 每档返回 `available/disabledReasons/extraMpCost/totalMpCost/effectiveRange/spread`，玩家 / AI / 重复命令同源 |
| 构建产物 | `projection-coverage.json`、`TS-CONTENT-MFR-013` | 13 个外放端点白名单、路线要求、协议常量、逐招覆盖缺口均可审计 |
| 运行校验 | V34–V38、MF-V13～V15 及对应 T 用例 | 覆盖取整、形状裁剪、降档拒绝、敌我 AI、F2/E2 与 replay 一致性 |

### 7.3 留给 M5c 的逐招标记规则摘要

- 先逐招判断是否有真气离体表现；不得按 `SkillDef`、`delivery:ranged`、招名或 `DamageKind='projected'` 反推整门外放。
- 命中判据的招写 `projection:true`，保留 0 档 `range/aoe`，并提供恰三项、已人工预审的 `projectionSpreadSteps`；不得运行时插值形状。
- 外放伤害段使用既有 `DamageKind='projected'`；只有旧通道而无 AR-16 语义的招不自动补标。
- 优先覆盖弹指神通、独孤九剑明确剑气招、降龙十八掌掌力招，以及 M5 清单中的六脉神剑、一阳指、劈空掌等；独孤剑气必须标**（原创扩展）**。
- 每个外放候选招写入 `projection-coverage.json` 的“已标 / 已审不标 / 待考”结论；不得以缺资料为由批量默认 `true`。

### 7.4 门禁、范围与完整性

- ✅ `python3 tools/lint/check_ids.py --strict`：退出 0；仅输出仓库基线已知的 `docs/README.md` / `sk_babuganchan` 提示，新增 strict failure 为 0。
- ✅ `python3 -m unittest discover -s tools/lint -p "test_*.py"`：56 项通过。
- ✅ `python3 tools/balance/damage_sim.py --check`：47 项通过。
- ✅ `python3 tools/balance/projection_sim.py --check`：全部通过。
- ✅ `git diff --check` 通过；仅修改 / 创建 8 个授权路径，未改图鉴、21、06、tech/01、tech/08、进度清单或其他文件。
- ✅ 版本 / 变更记录、文末术语 / 校验 / 依赖顺序已复核；无截断句、未闭合代码围栏或占位文本，文件均未缩短 15% 以上。
- ⚠️ M5-O01 / O02 是作者尚未确认的执行默认；M5-O03 与逐招覆盖必须由 M5c 完成，均不阻断本任务规则和技术接线。
