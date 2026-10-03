# 本任务：游戏工程 · 招式命中附带效果：move.v1 加 `onHit`（附 Buff、击退）与 `parryable`；战斗结算消费；补 3 个 Buff 定义；序章越女剑四招填值

本任务写数据 schema、core 战斗规则与少量内容。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开 pnpm store 写入。

先读：
- 根 `CLAUDE.md`、`packages/data/CLAUDE.md`、`packages/core/CLAUDE.md`：core 只做确定性规则；
- 设计：
  - `docs/design/05-martial-arts-system.md`：MoveDef 的 `parryable`（第 537 行一带）、`BuffApply{id, chance, dur, …}`；
  - `docs/design/06-buff-system.md`：
    - §2.1 `BuffDef` 字段表、§2.5 与 05 `BuffApply` 的对接；
    - §3.1 品阶来源：招式附带的 Buff 取来源武功的 `effGrade`；
    - §5.3 攻击管线中的插入点、§6.4 效果原语；
    - 目录行：`bf_shiheng` 第 1456 行一带、`bf_pojia` 第 1288 行一带、`bf_dongyao` 第 1296 行一带；
  - `docs/design/09-combat-system.md`：击退 / 位移的落点、阻挡、场外与坠落规则（第 283、413、428 行一带）；
  - `docs/design/catalog/skills-general.md` 第 211 行一带：越女剑四招的「附带」「架」两列；
- 工程报告：`ENG-25-content-schemas-m1.md`（MoveDef）、`ENG-04-combat-core.md`（Buff 执行器）、`ENG-16b-battle-actions.md`、`ENG-16d-damage-geometry.md`、`ENG-16c-battle-session.md`、`ENG-26-encounter-builder.md`；
- 代码：`packages/data/src/schemas/move.ts`、`packages/core/src/buff/index.ts`、`packages/core/src/battle/**`（action、damage、reaction、geometry）；
- 审核意见 `.agents/reviews/CONTENT-ch00a-data.r2.md` 第 4 条与返修说明第 2 条。

## 为什么做

- 名录给招式写了命中附带效果，`move.v1` 却表达不了：
  - 命中后按概率附 Buff；
  - 击退 N 格；
  - 不可招架。
- `content/common/buffs/` 还是空的，Buff 定义只在 design/06 里。
- CONTENT-ch00a r2 因此 FAIL：越女剑四招只能保留现有 schema 能写的字段。

协调者裁定（10-03 15:16）：
- 字段名定为 `onHit.applyBuffs[{buffId, chanceBp, turns}]`、`onHit.displace{kind: knockback, cells}`、`parryable`（默认 true）；
- content:validate 校验 `buffId` 已登记；
- 本任务补 3 个 Buff 定义，并给序章四招填值；
- 排在 M1 三件之后，不算 M1 阻塞。

## 要做的事

1. **schema**（`move.ts`）：
   - `move.v1` 加可选字段，现有招式内容不用改也能通过；
     - `onHit.applyBuffs: [{ buffId, chanceBp, turns }]`：`chanceBp` 为 0–10000 的整数，`turns` 为正整数；
     - `onHit.displace: { kind: 'knockback', cells }`：`cells` 为正整数，只做击退一种；
     - `parryable: boolean`，省略即 true。
   - 和 design/05 `BuffApply` 的字段对应关系写进报告第 3 节（`id → buffId`、`chance → chanceBp`、`dur → turns`）。
   - 品阶不进字段，按 design/06 §3.1 取来源武功的 `effGrade`。
2. **Buff 定义**：
   - 新文件 `packages/data/src/schemas/buff.ts`，`BuffDef` 按 design/06 §2.1 / §6.5 写 `z.strictObject`。只实现这 3 个 Buff 用得到的字段，其余字段在报告第 4 节列为后续。
   - 在 `content-registry.ts` 登记 kind，位置 `content/common/buffs/*.yaml`。
   - 在 `content-index.ts` 校验招式 `onHit.applyBuffs[].buffId` 已登记，诊断带文件、招式 ID、给出的值。
   - 补 `bf_shiheng`、`bf_pojia`、`bf_dongyao` 三个定义，数值照 design/06 目录行，不扩其他 Buff。
   - 位置约定写进 `content/CLAUDE.md`。
3. **战斗结算**（core）：
   - 命中后，按 design/06 §5.3 的插入点逐条判定 `applyBuffs`：
     - 概率用战斗种子派生的确定性 RNG 子流，子流命名写进报告；
     - Buff 实例接现有 Buff 执行器，3 个 Buff 的属性修正要真实进入命中、招架、外防、效果抵抗的结算；
     - 失衡的「下一招收招 +20%」照 design/09。
   - `displace`：
     - 按命中方向沿格子推 N 格；遇障碍、单位、不可进入的地形就停在最后一个合法格；
     - 场外与坠落按 design/09；
     - 位移发领域事件给界面。
   - `parryable: false`：跳过招架判定，命中、伤害按不可招架处理。
   - 新增事件（如 `battle/buffApplied`、`battle/displaced`）写进报告，交界面。
4. **内容**：给序章四招填值，只改这几个字段：
   - `mv_yuenvjian_zhuying`：`bf_shiheng` 30%，1 回合；
   - `mv_yuenvjian_huizhi`：击退 1 格；
   - `mv_yuenvjian_yixian`：`bf_pojia` 40%，2 回合；
   - `mv_yuenvjian_wuhen`：`parryable: false`，`bf_dongyao` 50%，2 回合。
5. **测试**：
   - schema 正反例：概率越界、未登记 buffId、`cells` 非正都报错；省略新字段的旧招式照常通过；
   - 结算：
     - 附 Buff 的概率命中与落空；
     - 回合递减；
     - 3 个 Buff 的属性修正生效；
     - 击退遇障碍或地图边缘时停住；
     - 不可招架跳过招架；
   - 同一输入跑 100 次，hash 一致；
   - core golden 不改期望值：现有 golden 不含这些字段；确实受影响的话，在报告写清原因。

## 约束

- 写集：
  - 数据：
    - `packages/data/src/schemas/move.ts`、`packages/data/src/schemas/buff.ts`、`packages/data/src/schemas/index.ts`
    - `packages/data/src/content-registry.ts`、`packages/data/src/content-index.ts`、`packages/data/src/build/**`（Buff 定义进内容包所需的最小改动）
    - `packages/data/src/**/*.test.ts`、`packages/data/src/**/__fixtures__/**`
  - core：
    - `packages/core/src/battle/**`、`packages/core/src/buff/**`
    - `packages/core/src/testing/**`、`packages/core/src/**/*.test.ts`
  - 内容：
    - `content/common/buffs/**`
    - `content/common/moves/mv_yuenvjian_zhuying.yaml`、`mv_yuenvjian_huizhi.yaml`、`mv_yuenvjian_yixian.yaml`、`mv_yuenvjian_wuhen.yaml`
    - `content/CLAUDE.md`
  - `apps/game/src/runtime/**`：只在 Buff 定义要随战斗会话装载时动，改动最小。
  - 写集外的改动在提交时会被丢弃。
- 不改其他招式、其他 Buff、`docs/**`、`tools/perf/**`、`packages/ui/**`、`packages/render/**`。界面怎么显示附带效果，写进报告第 7 节交后续。
- 体积：
  - Buff 定义进内容包后，首次会话闭包不得超过 110 KiB；
  - 报告写 `pnpm size` 三层数字。
- 不加依赖；每次写入 ≤ 150 行；不得在 `/private/tmp` 做整仓检出（_common 规则 12）。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm content:build`
- `pnpm content:validate`
- `pnpm --filter @tianshu/data test`
- `pnpm --filter @tianshu/core test`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 3 节写：
- 新字段表，以及与 design/05 `BuffApply` 的对应；
- `BuffDef` 已实现的字段；
- 3 个 Buff 的数值与品阶来源；
- RNG 子流命名；
- 击退规则；
- 新增事件；
- `pnpm size` 三层数字。

第 4 节写 `BuffDef` 未实现的字段，以及后续 Buff 补全的建议任务。

第 7 节写交接：
- 交 CONTENT 任务：其他招式怎样写附带效果；
- 交 ENG-27a / 27b（属性 v2）：这 3 个 Buff 的属性修正接在哪里，改属性模型时要一并迁；
- 交界面：要消费的事件。

报告 ≤ 60 行。
