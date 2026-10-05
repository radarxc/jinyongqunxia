# 本任务：游戏工程 · 属性 v2（三）：protocol 4 的 Python 参考 runner 与十四书 42 格节奏锁（design/04 §9.3.1、T45；DES-attr-v2 的 ENG-GOLD-01）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。

先读：
- 根 `CLAUDE.md`、`packages/core/CLAUDE.md`、`tools/balance/README.md`；
- 设计报告 `tools/agents/reports/DES-attr-v2.md`：§3「十四书节奏」、§7「工程交接清单」的 `ENG-GOLD-01`；
- 工程报告第 7 节交给本任务的输入与接口（都在 `tools/agents/reports/`）：
  - `ENG-27b-attr-v2-combat.md`：protocol 4 的 Z1 / Z2 / Z4M / Z5M 与 `spd` 实现位置，逐书 / N-E-B 的 `durabilityBp`、`attackBudgetBp` 读取点；
  - `ENG-14b-meridian-golden-v3.md`：Python 参考与生产 runtime 的对拍做法；
  - `ENG-28b-spiral-qi.md`：螺旋内力对伤害链的影响，节奏锁不含螺旋。

## 为什么做

ENG-27b 用文档里的字面向量（§8.8–§8.10、T41–T44、T46）实现了 rules protocol 4。

但 design/04 §9.3.1 的十四书 42 格节奏闭环（T45）只在文档里算过，「当前尚无仓库实现」：
- 现有 `tools/balance/damage_sim.py`、`projection_sim.py` 只证明 protocol ≤ 3 零漂移；
- 以后谁改 protocol 4 的公式或遭遇预算，42 格会悄悄漂出窗口，没有门禁拦住。

本任务补 Python 参考 runner 与 golden，并让生产 runtime 逐格对拍。

## 规格（照这些写，不自创）

**数值来源**：只引用 design/03、04、05、21（DES-attr-v2 4e9daeb2 已合入，经审核），不自创数值、不改阈值。作者原话（AR-27）：
- 「速度是 身法 * 轻功系数（轻功基本系数 * 对应经脉强度带来的增幅）」；
- 「攻击是臂力 * 武功硬功 + 武功外放 * 对应经脉运转计算出的系数」；
- 「硬功防御（根骨）和内劲抵抗机制」。

文档算式是这几句的落地。文档与原话看似冲突时，不自行改数，在报告第 7 节登记。

- `docs/design/04-damage-formula.md`：
  - §9.1 假设与复现；
  - §9.3.1 protocol 4 十四书界校准基线：`R0`、`targetRound`、`durabilityBp`、`attackBudgetBp` 的算法，逐书逐类的期望伤害 / 命中率表，两组校准 bp 全表；
  - §9.4.1 运转与周天接线回归；
  - §10 / §11 测试表 T45（逐格等于 §9.3.1；普通 `3.47–4.75`、精英 `7.33–9.50`、Boss `15.31–24.00`）。
- `docs/design/03-attributes.md` §3.5 标准主角模型 `STD(Ce)`、§2.9.1 书界期望。
- `docs/design/21-meridian-flow-and-moves.md` §14.12～§14.13（protocol 4 运转合成）。

## 要做的事

1. **Python 参考**：新建 `tools/balance/protocol4_sim.py`，只实现 protocol 4，不改 `damage_sim.py` / `projection_sim.py`。
   - 整数式与取整点逐字照 04 §1.3、§4.1、§4.2、§4.4.1、§4.5.1；
   - `--check` 对 golden 逐字段比较，不一致就失败；
   - `--write-golden` 只供人工重录，CI 和检查命令里不得调用。
2. **golden**：`tools/balance/protocol4_golden.json`。
   - 每格存输入：书、类别、`HP0`、`oldEnemyRound`、`R0`、两组 bp、目标命中数；
   - 存输出：玩家轮数、敌轮数、`HP`、命中数误差；
   - 另存版本头：`rulesProtocol: 4`、生成脚本 hash。
3. **单测**：`tools/balance/test_protocol4_sim.py`。
   - 42 格逐格等于 §9.3.1 表；
   - 三类范围；
   - 射雕 Boss 示例：`R0=43.78 → durabilityBp=5481 → HP=53598 → 24.00`；
   - 白马行标「旧 LOW 默认」。
4. **生产对拍**：在 `packages/core` 加一个测试，读同一 golden，用生产 protocol 4 runtime 复算每格的命中后期望伤害与轮数，逐字段相等。
   - 只读 golden，测试里不得重写 golden；
   - 不一致时报出书 / 类别 / 字段。
5. **README**：`tools/balance/README.md` 记两套参考的分工：protocol ≤ 3 用旧脚本，protocol 4 用本脚本；写清重录流程。

## 约束

- 写集：`tools/balance/protocol4_sim.py`、`tools/balance/protocol4_golden.json`、`tools/balance/test_protocol4_sim.py`、`tools/balance/README.md`、`packages/core/src/testing/**`、`packages/core/src/battle/damage/*.test.ts`、`packages/core/CLAUDE.md`。写集外的改动在提交时会被丢弃。
- **不改**：
  - `tools/balance/damage_sim.py`、`projection_sim.py`、`meridian_flow_sim.py` 及其 golden；
  - `packages/core/src/**` 的非测试代码：发现生产实现与文档不符时只写失败用例和报告，不改实现，交后续任务；
  - `docs/**`、`content/**`。
- 不加依赖（Python 只用标准库）；每次写入 ≤ 150 行。
- 不得放宽、跳过或改写任何门禁测试，不得为通过测试改 golden 或阈值。rig 100 角色性能门禁已移出 `pnpm check`（作者 AR-33），改由 `pnpm check:perf` 在负载低时单独跑；不得在测试里加任何「高负载跳过」逻辑。

检查：以下命令必须全部通过。
- `python3 tools/balance/protocol4_sim.py --check`
- `python3 tools/balance/damage_sim.py --check`
- `python3 tools/balance/meridian_flow_sim.py --check`
- `python3 -m unittest discover -s tools -p "test_*.py"`
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm --filter @tianshu/core test`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：
- 42 格对拍结果表（摘要）；
- 生产实现与文档不符的条目（如有）及建议的修复任务；
- golden 重录流程；
- 白马唐代参数定稿后的重跑方法。

报告 ≤ 60 行。
