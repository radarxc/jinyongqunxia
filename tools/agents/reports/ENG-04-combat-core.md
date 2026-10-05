# ENG-04-combat-core 报告 · 游戏工程 · 战斗核心（速度条六角、攻击位置、外放抵消、透劲入体、打穴、负面效果、自动战斗、战斗设置）

## 1. 摘要（3–6 行）

- 已实现同步、整数、确定性的 CT 战斗核心，并接入 ENG-03 的逐 tick 运气与急性聚气适配器。
- 已实现六角范围、完整伤害链、命中区防护、外放抵消、异种气 / 点穴 / 丹田后效及负面 Buff 子集。
- 已实现三种战斗入口、冻结 `BattleSetup`、终局、无站位自动战斗及宿主注入 SHA-256 的重放协议。
- ENG-04 专项 84 项、Core 158 项、仓库 246 项测试全绿；冻结安装、性能、benchmark、ID 与 diff 门禁均通过。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要产出 |
|---|---:|---|
| `packages/core/src/{hex,battle,buff,ai,replay}/`（ENG-04 15 文件） | 1,616 | 六角 / 阵形、CT、伤害与经脉后效、Buff、遭遇、自动与回放 |
| `packages/core/src/**/*test.ts`（ENG-04 11 文件） | 820 | 84 项专项断言，含 200 seeds 与黄金回放 |
| `packages/core/bench/combat.*` | 37 | 双人 20 回合 = 40 行动性能门禁与 benchmark |
| `packages/core/CLAUDE.md`、`package.json` | 99 | ENG-09 / ENG-10 接口、事件、性能命令 |
| `pnpm-lock.yaml` | 未改 | 未新增依赖；`packages/core/src/index.ts` 未改 |

## 3. 关键结论与数值

1. CT 为 `[-1000,1299]`，1000 就绪，`spd` 钳 `[30,300]`；硬控跳过固定收招 1000，主角离场后轮锚切至首位存活友方。
2. 首轮键为 `openingQinggong→spd→agi→openingPriority→先机方→unitIndex`；半径 0–6 圆盘预计算，支持点 / 自身 / 环 / 面 / 辐条 / 线 / 6 或 12 向扇。
3. 伤害样例核得 `atkMix=1040, defMix=607, Z1=1289, Z2=867, Z5=849`；命中区 body / hand / leg 抗性为 `728/714/752 bp`。
4. 外放门槛 `ceil(carry×5000/10000)`；内劲 100%、外劲 50%，负差按 50% 抵基础伤害；兼容事件显示“真气鼓荡震开攻击”。
5. 透劲须外放、来源品阶 ≥4 且付费后攻方 MP 严格大于守方命中前 MP；消化普通 1:1、特殊至 10:1，斗转 1 MP 引 1 气并反向输出 50%。
6. 打穴标准样例 7200 bp，消化成本为透劲两倍，最多 3 穴；丹田四级伤害 200/500/900/1500 bp，产气罚 1500/3000/5000/7500 bp。
7. 自动上限 `min(2000,max(60,人数×40))`，连续五轮无有效变化判平；正式结算与手动战共用 `resolveBattleAction()`。

## 4. 开放问题（附默认值）

| 问题 | 默认值 / 当前边界 |
|---|---|
| 完整行动联合 | 首版只开放 `battle/act`（招式）与 `battle/wait`；道具、运劲、救护、撤退等由后续任务扩展同一 resolver |
| 急性聚气聚合 | 保留 `acuteQiGather(unit,context,routeId)`；待 `BattleState.meridianByUnit` 落地后并入可重放命令 |
| 完整 Buff DSL | 本次执行中毒、流血、内伤、眩晕、岔气、丹田受损、穴封所需子集；其余 opcode / 品阶对抗继续走后续通用执行器 |
| 审计信封 | Core 保持精简同步事件；`setupHash`、`endRulesHash`、`BattleEventV3` 由数据规范化层与宿主注入 SHA-256 后封装 |
| 热路径分配 | 20 回合门禁已通过；当前仍有目标排序、事件数组、状态哈希分配，默认后续以对象池 / 增量哈希继续优化 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无。实现沿用 AR-19、`design/04`、`design/06`、`design/09`、`design/21` 与 `tech/05`，未新增玩法事实。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 改什么 |
|---|---|---|
| `packages/data` / `packages/spec` | `battle-setup.v1` | 规范化后计算 `setupHash/endRulesHash`，封装 `battle/setupResolved` 与 V3 payload |
| `docs/tech/05-gameplay-engine.md` | §3.5、§7 | 将完整命令 journal、异常回滚和其余 `BattleAction` 接至本 resolver；禁止失败后残留状态 / RNG |
| ENG-10 战斗 UI | HUD / 日志 | 消费 Core 范围格和事件；兼容显示 `combat.qiRepel`，业务识别 `battle/outwardQiCancelled` |
| ENG-09 城镇打坐 | 被袭入口 | 仅传实际打坐者，调用中断后创建 `meditationAmbush`，不扫描附近 NPC |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 模块 / 函数 / 事件清单

- ✅ `timeline`: `createOpeningOrder/nextTimelineEntry/settleTimelineAction/acuteQiGather`；`hex/formation`: `hexDistance/hexDisk/hexRing/hexLine/hexCone/resolveAreaCells/matchFormation`。
- ✅ `damage`: `resolveDamage/settleDamage/settleOutwardQi/injectPenetratingQi/tickHostileMeridianEffects/applyAcupointStrike/blockedRouteRefs`；`buff`: `executeBuffHook/endOwnAction/qiProductionBp`。
- ✅ `encounter/action`: 三入口工厂、`createBattleState/advanceBattleToReady/resolveBattleAction/evaluateBattleEnd`；`ai/replay`: `simulateAbstractBattle/runBattleReplay/hashBattleReplay`。
- ✅ 事件：伤害、外放、注入 / 消化 / 反引 / 丹田 / 占穴、Buff、倒地 / 终局、自动开始 / 逐拳 / 结束；数值载荷均为整数。

### 文档节号 → 函数对照

- ✅ `design/09` §1.3/§3 → timeline + round anchor；§2.11–2.12 → encounter；§5/`tech/05` §6 → hex + formation；§8.7 → ai。
- ✅ `design/04` §2–§4 → `calculateJudgeChances/calculateDamage/resolveDamage`；`design/21` §4.4.3/§4.8–§4.10 → settlement + meridian-effects。
- ✅ `design/06` §5.2/§8.5/§8.7/§8.14 → Buff hook、DOT 12% 上限、硬控、岔气 / 丹田 / 穴封生命周期。

### 测试覆盖、下游接口与需作者确认

- ✅ 公式表、外放、透劲、斗转、打穴、Buff 时序、深冻结、回合切锚、200 seeds、拒绝零副作用与 SHA-256 golden 均有断言；专项 84/84，Core 158/158，仓库 246/246。
- ✅ `pnpm install --frozen-lockfile`、`pnpm check`、`test:performance`、`bench`、`check_ids.py --strict`、`git diff --check` 全通过；20 回合断言 ≤20 ms。
- ✅ ENG-10 使用 `resolveAreaCells/resolveBattleAction/events`；ENG-09 使用 `createMeditationAmbushBattleSetup`；回放宿主注入 SHA-256。
- ⚠️ 需作者确认：沿用设计默认外放 5000 bp 门槛、命中区默认穴位、岔气 3 行动、自动上限 2000；完整动作 / Buff DSL / V3 信封按上表后续接入。
- ⚠️ 项目无覆盖率阈值，按单测工作流跳过覆盖率数字；benchmark 有 Vitest export-getter 提示，但性能断言通过。
