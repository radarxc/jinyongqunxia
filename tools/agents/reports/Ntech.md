# Ntech 报告 · 经脉系统落地 · 引擎、数据管线与性能（tech/05、04、03）

## 1. 摘要（3–6 行）

已把 `design/21` v2.0 与 AR-14 的战斗经脉契约落到玩法引擎、数据管线和移动性能三份技术规划。  
`tech/05` 已闭合逐单位实例、唯一 `battle` RNG、无副作用预估、Z4M / Z5M、护体内劲、速度 / 控制 / 调息、事务、快照、录像与黄金对拍。  
`tech/04` 已闭合路线 / 控制 / 调息 / 敌人模板 schema、`STD_meridian` 构建固化和 MF-V01～V12；`tech/03` 已闭合规模核算、七项子预算、HUD、CI 与真机门禁。  
四项强制检查均通过；实际 TypeScript 消费者、Canon v1.3 采纳和三类真机性能数据仍是后续实现或对应 owner 的工作。

## 2. 产出（文件、行数、主要章节）

| 文件 | 最终行数 | 主要章节 / 产出 |
|---|---:|---|
| `docs/tech/05-gameplay-engine.md` | 2,280 | §3.3/§3.5 状态与事务；§4.2 RNG / preview；§7–§8 时间轴、Z4M / Z5M 与护体；§11.2 模块；§14–§16 快照、录像、golden、性能 |
| `docs/tech/04-data-pipeline.md` | 1,894 | §2.5 前缀边界；§3.8.1–§3.8.3 四类 schema 与 `STD_meridian`；§4 编译；§5.4 MF-V01～V12；§11 CI |
| `docs/tech/03-mobile-performance.md` | 2,144 | §2.3.1 七项子预算与规模 / 内存核算；§8 HUD、CI 与三机门禁；§10 `R03-MF` 风险；文末实测与开放项 |
| `tools/agents/reports/Ntech.md` | 102 | 本报告：结论、开放项、提案、跨文档同步、处理总表与检查证据 |

三份既有文档均为净增长，未触及“缩短 15%”限制；版本栏均已追加“经脉系统落地（2026-09-27）”。

## 3. 关键结论与数值

| 主题 | 落地结论 / 核算 |
|---|---|
| 实例与事务 | 每个可独立施展武学的单位一份 `MeridianFlowModule`；模板只共享只读基底，动态数组独占；单位状态和 Core 事务局部 RNG 一起提交或回滚 |
| RNG / 预估 | 模块不保存或派生 RNG；合法提交只消费唯一 `tx.rng('battle')`；每个实际到达段一抽；`preview` 默认 `rollBp=9999`，0 RNG、0 写入 |
| 伤害乘区 | Z4 后插 `Z4M=meridianDefense`，Z5 后插 `Z5M=meridianAttack`，各自仅在边界向下取整；标准对标准均为 10000 bp；硬界分别 5000–13000 / 6500–22000 bp |
| 护体内劲 | 位于护体真气后、既有 `mpGuard` 前；拳脚 / 兵器 / 暗器 / 内劲外放适用率 10000 / 2500 / 0 / 4000 bp；1 内力抵 2 伤害，并保留 `damageBeforeMpGuard` 与资源守恒断言 |
| 五档锚点 | 同等 `10000 bp，849→849，TTK 5→5`；强一档 `12053，950→1145，9→7`；强两档 `14456，2574→3720，22→15`；弱一档 `9157，849→777，5→6`；高手对杂兵 `18265，849→1550，3→2` |
| 快照 / golden | `meridian-flow-state.v1` 不含 RNG；唯一四字 `battleRng` 位于 `BattleSession`；fixture/rules/rng 为 `2/2/1`，seed `20260927`，向量哈希 `af33dcd10dc196e18811fe485870666ab139c03a17342fa47113ecc19552cd76` |
| 数据入口 | `meridian-route.v1`、`meridian-control.v1`、调息档案、`meridian-unit-template.v1`；路线 1–18 段、每段 40–120 CT、风险 0–1200 bp，且 `MoveDef.recovery + ΣsegmentCt ≤ 2000` |
| 敌人 / 标准表 | 敌人 `mpRatioBp/capacityScaleBp=5000..20000`、`practiceBp=3500..9800`，`openPolicy=routeOnly|schoolCore|fullTemplate`；`STD_meridian` 按显示等级 × 书界 × 用途 × 同路线构建期固化 |
| 性能规模 | 24 单位完整 `180×24=4,320` 节点；典型 `10×12×60%×24=1,728`；一轮路线热路最多 432 节点，AI 12 候选最多 216；裸节点约 `4,320×8×4=138,240 B≈135 KiB` |
| P95 子预算 | commit / 攻防护体 / 速度 / preview / AI 12 路线 / 全场 tick / snapshot 分别 ≤0.25 / 0.08 / 0.05 / 0.15 / 2.00 / 0.50 / 1.50 ms，全部为 **【建议值】【待实测】**，且包含在既有 core / AI 总预算内 |

## 4. 开放问题（附默认值）

| 编号 | 开放问题 | 默认值 |
|---|---|---|
| NTECH-O01 | Canon v1.3 是否接纳 `mfr_* / qnl_* / dxl_* / txp_*`？ | 接纳并归 `design/21`；接纳前保留 `provisionalPrefixOwner:'design/21'`，禁止借用 `route_* / bf_* / ap_*` |
| NTECH-O02 | v1 战中经脉状态如何升到 `rulesProtocol=2`？ | 没有逐字段迁移器就拒绝半迁移，保留旧档并回到登记的战前检查点；v1 交旧 runner |
| NTECH-O03 | `settledIncoming` 是否升为跨包公共 `Settlement` 字段？ | 暂作 `tech/05` 内部派生量；跨包暴露前由 `design/04` 正式登记 |
| NTECH-O04 | 七项建议预算在三类手机上是否可达？ | 先保持当前统一绝对预算；超限先优化连续索引、SoA、稀疏物化、dirty set、scratch、缓存或 Worker，不按设备删规则或放宽确定性工作量 |
| NTECH-O05 | 经脉预览 / snapshot 是否迁入 Worker？ | 默认主线程；AI 批量预览可进现有 `ai.worker`，snapshot 仅检查点执行；以首轮三机 P95 决定，不改变 Core 结果 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| M2-P01 | Canon §12 登记 `mfr_* / qnl_* / dxl_* / txp_*` 及 `design/21` 所有权 | 四类对象需跨数据、存档与 UI 稳定引用，不能挤占地图路线、Buff 或穴位前缀 |
| M2-P03 | Canon §19 登记逐单位实例、preview 无副作用、Core 唯一 `battle` RNG、固定顺序、快照与 golden | 防止 UI、AI、存读档和录像在核心规则前分叉 |
| M3-P01 | Canon §9 插 Z4M / Z5M、固定取整点和硬界，并删除旧路线 Z3 来源 | 落实独立乘区，同时维持标准对标准零漂移 |
| M3-P02 | Canon §8 / §9 在护体真气后、`mpGuard` 前登记护体内劲、类别适用率、资源守恒与击穿迟滞 | 落实拳脚抵消并保留兵器、破气及持续压制反制 |
| M3-P03 | Canon §8 / §11 登记经脉速度、`openingQinggong` / 闪避接口与“先经脉后擒拿” | 让轻功按经脉运行，同时不重复计算基础轻功、门禁或地形成本 |
| M3-P04 | Canon §18 将战斗动态经脉、攻防 / 轻功路线、护体、控制与调息归 `design/21`，永久拓扑 / 成长仍归 `design/15` | 完整取代旧 M2-P02 的 Z3 归属，消除双重定义 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 需同步内容 |
|---|---|---|
| `docs/00-canon.md` | §8、§9、§11、§12、§18、§19 | 采纳 M2-P01/P03 与 M3-P01～P04；当前 v1.2 尚未包含这些规则 |
| `docs/tech/01-architecture.md` | Core API、`BattleState`、确定性摘要 | 登记 `meridianByUnit`、唯一 `battle` RNG 注入、preview 零副作用和协议 2 hash 域 |
| `docs/tech/08-backend-and-online.md` | TSAV / replay 版本表 | 登记 `rulesProtocol=2`、`meridian-flow-state.v1` 与检查点兼容边界；禁止静默升级 v1 战中档 |
| `docs/tech/09-roadmap.md` | 实现阶段与发布门禁 | 纳入 schema / Core / TS runner、Node + WebKit golden 和三类真机七项预算门禁 |
| `docs/design/04-damage-formula.md` | 公共 `Settlement` / Z0–Z10 | 若跨包公开 `settledIncoming`，先登记字段；持续对齐 Z4M / Z5M、护体内劲和五档 TTK |
| `docs/design/06-buff-system.md` | 控制、Buff 与事件 | 登记擒拿 / 点穴 / 胀损、击穿迟滞的正式 Buff ID 与生命周期；保持自身行动时钟 |
| `docs/design/09-combat-system.md` | 时间轴、环境行动者、CT | 对齐批量空 tick 的经脉同态推进、武学型环境单位实例、先经脉后擒拿和速度脏重算 |
| §18.6 其余 owner 文档与武学图鉴 | 各自列明位置 | 按 `design/21` §18.6 完成基础轻功、招式路线、控制、HUD、永久投影与图鉴配路；本任务未越权修改 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 `design/21` §18.6 处理总表

| §18.6 条目 | 目标文档 § | 状态 | 改动位置 / 说明 |
|---|---|---|---|
| `rulesProtocol 2` | `tech/05` §14–§15 | 已落实 | 录像、检查点、旧 runner 边界和 golden 协议均固定为 v2 |
| 攻防 / 护体 / 速度纯函数 | `tech/05` §7.2、§8.3–§8.5、§11.2 | 已落实 | 固定 Z4M / Z5M、`damageBeforeMpGuard`、速度投影、取整与调用顺序；玩法公式只引用 21 |
| 每单位状态 | `tech/05` §3.3、§7.1、§11.2 | 已落实 | 主角、同伴、敌人、召唤物及武学型环境单位逐实例；动态数组禁止共享 |
| 全局 RNG 与事务 | `tech/05` §3.5、§4.2、§11.2 | 已落实 | 复用此前已有 Core journal 与 `battle` 流，并补模块注入、消费顺序、失败回滚和 preview 零副作用 |
| 快照 / 回放 | `tech/05` §14.3–§14.4 | 已落实 | 单位 snapshot 无 RNG、外层唯一四字 `battleRng`；规范排序、hash、restore 与 v1/v2 边界完整 |
| Python 对拍 | `tech/05` §15 | 已落实 | 固定 golden 协议、seed、向量哈希、全字段比较及禁止无审阅重录 |
| 性能 | `tech/05` §16；`tech/03` §2.3.1、§8、§10 | 已落实 | 七项 P95、规模 / 内存、HUD / CI / 真机证据和不可降规则边界齐全；数值均标建议值 / 待实测 |
| 路线 / 控制 / 调息 / 模板输入（本组专项） | `tech/04` §2.5、§3.8、§4–§5、§11 | 已落实 | 四类 schema、连续索引、`STD_meridian`、MF-V01～V12 与 CI 接线完成 |

### 7.2 检查结果

| 检查 | 结果 |
|---|---|
| `git diff --check` | ✅ 退出码 0 |
| `python3 tools/lint/check_ids.py --strict` | ✅ 退出码 0；严格新增失败 0；仅仓库既有 baseline `sk_babuganchan` 未定义 |
| `python3 tools/balance/damage_sim.py --check` | ✅ 40/40 通过，known deviations 0 |
| `python3 tools/balance/meridian_flow_sim.py --check` | ✅ `meridian_flow_sim: all checks passed` |
| 文档结构 | ✅ 代码围栏成对；目录与新增章节一致；无 `TODO` / “此处省略” / “待补充”占位 |
| 修改范围 | ✅ 仅三份授权技术文档和本报告；未修改 Canon、TODO、21、模拟器或 golden |

### 7.3 遗留清单（按严重度）

- ⚠️ **高（发布前）**：实际 TypeScript schema / Core runner 尚未实现，Node + WebKit 也尚未对 golden 做跨语言逐字段运行；本任务授权范围只有规划文档，建议以 `tech/04` MF-V01～V12 和 `tech/05` §15 作为实现合并门禁。
- ⚠️ **高（发布前）**：Canon 仍为 v1.2，需对应 owner 采纳 M2-P01/P03 与 M3-P01～P04；采纳前四个新前缀只允许提案域 / fixture / schema 候选语境。
- ⚠️ **中**：七项性能预算尚无作者主力手机、中端 Android、iPad 的生产构建 P50/P95；建议每机 3 轮保留原始样本、节点 / RNG 计数、hash、build 与设备条件。
- ⚠️ **中**：§18.6 的其他设计文档、武学图鉴及 `tech/01/08/09` 仍由对应 owner 同步，具体位置见本报告 §6。
- ⚠️ **低（既有基线）**：严格 ID 检查仍报告 `sk_babuganchan` 未定义；它不由本任务引入，新增严格失败为 0。
