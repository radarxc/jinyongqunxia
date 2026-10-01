# DES-combat 报告 · 设计同步 · 战斗按 AR-19 补全（攻击位置、外放抵消、透劲入体与消化、打穴、负面效果、自动战斗、战斗设置）

## 1. 摘要（3–6 行）

- 已补齐 `body/hand/leg` 攻击位置、整数位置抗性，以及 AR-19 唯一外放抵消链。
- 已建模透劲注入、逐 tick 消化 / 逆流、丹田受损、斗转反引与打穴占穴，并明确经脉快照是真值。
- 已补无站位“一拳一眼”模拟和按进入上下文冻结的 `BattleSetup`；手动 / 自动共享同一结算。
- 已给 `tech/04` 严格 schema、迁移、事件与校验契约；生产 Core、Zod 和 protocol 3 golden 仍交 ENG-02～ENG-04。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要章节 |
|---|---:|---|
| `docs/design/04-damage-formula.md` | 901 | Z4 位置抗性、AR-19 settle、守恒与回归 |
| `docs/design/05-martial-arts-system.md` | 3371 | §4.2.3 招式字段、§5.8.1 / §5.10 内功接口 |
| `docs/design/06-buff-system.md` | 2355 | §8.14 经脉状态与负面效果总表 |
| `docs/design/09-combat-system.md` | 3629 | §2.12 `BattleSetup`、§5.11 命中区、§8.12 自动模拟 |
| `docs/design/21-meridian-flow-and-moves.md` | 2702 | §4.4.3 透劲、§4.8 外放、§9 打穴、运行态 / 测试 |
| `docs/tech/04-data-pipeline.md` | 2203 | §3.6、§3.8.4–§3.8.6 schema / 事件、MF-V25～V28 |
| `tools/agents/reports/DES-combat.md` | 以终检 `wc -l` 为准（≤120） | 本交付报告 |

## 3. 关键结论与数值

1. 位置抗性为 `clamp(Astr×str+Atough×tough+floor(Aqi×zoneFlowBp/10000),0,1800)`；body 系数 `2/6/800`，hand `6/3/600`，leg `5/4/700`。
2. 外放阈值默认命中区承载的 5000 bp；攻击内劲最多抵 100%、外劲最多抵 5000 bp；真气差为负时仅以 5000 bp 抵基础伤害。
3. 透劲比较量唯一为攻方付完本招成本后的当前 MP 与守方该段命中前 MP，须严格大于；注入量 / 速度逐字等于 `releasedQi/qiSpeedBp`。
4. `digestRatioBp=10000..100000`：普通 1:1、上限 10:1；每 tick 从真实 MP 支付，未消化包阻塞当前穴及全部共享路线。
5. 丹田冲击按 500/1500/3000 bp 分四级；伤害为 2%/5%/9%/15% `hpMax`，产气惩罚 15%/30%/50%/75%，持续 2/3/4/6 次自身行动。
6. `reverseQi` 以 1 点 MP 引 1 点异种气，再按 1:2 得临时反击气；超过反向路线通量 / 承载的余量仍逆流并可伤丹田。
7. 打穴沿用 AR-14c 点穴 1–9 级；二次高精度检定成功才占穴，消化效率为透劲的 5000 bp，即消化同量需两倍 MP。
8. 自动模拟不保存任何位置替代量；逐 CT 行动共享 F0–F2、Z0–Z10、Buff 与经脉 settle，缺省范围目标 2，行动上限 `min(2000,max(60,n×40))`。
9. `BattleSetup` 由模板、进入上下文和世界快照一次解析、排序、哈希并冻结；战中不得扫描世界补人。

## 4. 开放问题（附默认值）

| 问题 | 本次默认值 |
|---|---|
| 外放门槛是否调整 | 命中区承载 5000 bp；保持整数门槛 |
| 三个命中区缺省注入穴 | body 膻中、hand 合谷、leg 足三里；均为原创扩展锚点 |
| 内功凝练与反引逐卡值 | 九阳 / 化功 / 北冥 10000，幻阴指 100000；仅 `sk_douzhuan` 建议 `reverseQi=true` |
| 岔气是否按攻击强弱分档 | 首版固定 3 次自身行动、产气 5000 bp且禁急性聚气 |
| 正式工程何时切 protocol 3 | ENG-02～ENG-04 完成 runner、迁移和跨引擎 golden 后一次切换 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| AR19-P01 | Canon §8–§9 登记命中区 5000 bp 门槛与内劲全抵 / 外劲半抵，取代 AR-14f 旧适用率 | 消除两套护体公式与资源双扣 |
| AR19-P02 | Canon §8 / §18 登记透劲、来源消化比、逆流丹田伤害、斗转 1:2 与占穴真值归 21 | 防止 Buff、伤害层和经脉层重复存态 |
| P-09-13 | Canon §8 登记冻结 `battle-setup.v1` 与无站位逐行动模拟 | 固定参战者、终局条件和回放输入 |
| E1-P04 | Canon §8、§19 登记 protocol 3、经脉快照 v2 和 `BattleEventV3` | 避免旧录像被新规则静默重解释 |
| P-19 | Canon §8 / §18 登记 `MoveDef` 命中区 / 透劲 / 打穴及 `InnerDef` 消化 / 反引字段 | 固化 05 静态字段与 21 运行算法边界 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 需同步内容 |
|---|---|---|
| `docs/00-canon.md` | §8–§9、§18–§19 | 接纳 §5 提案，旧 AR-14f 仅保留协议 2 回放 |
| `docs/tech/05-gameplay-engine.md` | 战斗 Core、事件、存档、golden | 实装共享 settle、v2 经脉快照、自动模拟、setup 冻结和 protocol 3 runner |
| `docs/tech/01-architecture.md` | 命令 / 事件 / hash / Worker | 登记十类事件、自动模拟暂停续算及 `setupHash/policyHash` |
| `docs/design/14-ui-ux.md` | 战斗 HUD、日志、设置 | 命中区气量、四条外放文案、异种气 / 占穴 / 丹田状态和自动镜头 |
| 武学图鉴 | 各招式 / 内功卡 | 物化 `hitZone`、穴位、透劲 / 打穴、`digestRatioBp/reverseQi/autoTargetCap`；本任务依约未改图鉴 |
| 城镇 / 事件归属文档 | 打坐被袭入口 | 生成 `meditationAmbush` 上下文，只给确在打坐者岔气，不扫描临近 NPC |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 新增 / 改写的小节清单

- ✅ 09 §2.12 / §5.11 / §8.12；21 §4.4.3 / §4.8 / §9 / §11–§12 / §14.10；06 §8.14 / §8.14.5。
- ✅ 05 §4.2.3 / §5.8.1 / §5.10；04 §4.4、§6、§12；tech/04 §3.6、§3.8.4–§3.8.6 与校验表。

### 7.2 AR-14f / AR-16 合并裁定

- ✅ AR-14f 四类适用率、1 MP 抵 2 伤害、击穿迟滞只供 `rulesProtocol≤2`；protocol 3 唯一使用 AR-19 外放抵消。
- ✅ AR-16 仍唯一决定外放射程 / 范围 / 成本与 Z5M；AR-19 只增加命中区防护和透劲后效，不重复乘算。

### 7.3 透劲入体状态机图（文字）

`候选 → 门槛通过 → 注入穴位/阻塞 → 每 tick {斗转反引? → 消化 → 逆向推进} → 全消化/反引则清除；抵丹田仍有余量 → 丹田受损 → 清除`

### 7.4 交 ENG-04 的字段与事件清单

- ✅ 字段：`BattleSetupV1`、`BattleInitialEffect`、`HitZone`、`AutoPolicy/AutoBattleState`、`ForeignQiRuntime`、`AcupointOccupancyRuntime`、`OutwardQiResult`、`digestRatioBp/reverseQi`。
- ✅ 事件：`battle/setupResolved`、`battle/outwardQiCancelled`、`battle/foreignQiInjected`、`battle/foreignQiDigested`、`battle/dantianDamaged`、`battle/acupointOccupied`、`battle/reverseQiReleased`、`battle/autoSimulationStarted`、`battle/autoExchangeResolved`、`battle/autoSimulationEnded`。

### 7.5 需作者确认与机器检查

- ⚠️ 需确认：§4 的外放阈值、注入穴锚点、逐内功凝练值、斗转标记、岔气强度及自动上限；均已有可执行默认。
- ✅ 全部公式使用整数 / bp、稳定排序和显式取整；无站位模拟拒绝坐标、前后排、距离、LOS、ZOC、高差和路径字段。
- ✅ `python3 tools/lint/check_ids.py --strict`：strict failure count 0；仅既有 baseline `sk_babuganchan` 未定义。
- ✅ `git diff --check`、改动路径、代码围栏和新增占位词检查均通过；只改允许的 7 个文件。
- ⚠️ 本任务未实现生产 Zod / Core / 跨引擎 golden，也未做真机与完整战斗平衡实测；已交 ENG-02～ENG-04。
