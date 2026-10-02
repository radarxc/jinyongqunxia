# 本任务：游戏工程 · 小修：CT 速度单点钳制与零速度栈溢出（代码审计 H5）

本任务写代码，改动要小。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。

先读：
- 根 `CLAUDE.md`、`packages/core/CLAUDE.md`；
- 审计报告 `tools/agents/reports/AUDIT-code-20261002.md` §3.2 H5。

## 为什么做

代码审计（10-02）用探针复现了三个问题：
- spd=10 时首动等了 100 tick，设计应为 34；
- spd=400 时 ct 到了 1299，设计应为 1200，会影响溢出裁决；
- spd=0 时 `RangeError: Maximum call stack size exceeded`，战斗直接崩溃。

原因：
- `packages/core/src/battle/timeline/index.ts:85` 算等待时用 `clampInt(unit.spd, 30, 300)`，第 97 行推进 CT 却用未钳制的 `unit.spd * delta`。
- `nextTimelineEntry` 推进后递归调用自己：速度为 0 时 CT 永远不涨，于是无限递归。

规格：`docs/design/09-combat-system.md` §3.1。`ctGain = spd`，最终仍钳在 `[30, 300]`（表格第 513 行与第 529 行）。

## 要做的事

1. 在 timeline 里定义唯一的 `ctGain(unit) = clampInt(unit.spd, 30, 300)`，等待计算和 CT 推进都用它。全仓 grep 一遍还有没有别处用原始 `spd` 推进 CT，有就一并改。
2. `nextTimelineEntry` 的递归改成循环，并加进度守卫：每轮必须让 tick 前进，否则返回 `stalled`，或抛带领域码的错误。不允许死循环。
3. 原始 `spd` 照旧存着：界面显示与 Buff 计算要用。钳制只用在 CT 增益上。
4. **测试**（`timeline/index.test.ts` 或同目录新文件）：
   - spd=10 首动等 34 tick；
   - spd=400 推进后 ct=1200；
   - spd=0 不崩溃，按 30 处理；
   - spd 为负、为极大值都有用例；
   - 在 [30, 300] 内的速度结果与改前逐字节相同。现有战斗 golden 与回放 hash 不应变化；若变了，在报告里逐项说明原因。
5. ENG-04 报告里写的「spd 钳 [30, 300]」与实现不符的事，在本报告里写一句「已对齐」。

约束：
- 写集：`packages/core/src/battle/timeline/**`、`packages/core/src/battle/encounter/**`（只在必须时改）。写集外的改动在提交时会被丢弃。
- ENG-16b 正在改 `battle/**` 的其他部分（行动、经脉、聚气）。本任务只动 `nextTimelineEntry` 附近与速度相关的几行，**不碰聚气适配（timeline 第 115 行一带）**，以减少合入冲突。
- core 禁浮点、禁 DOM、禁墙钟、禁 `Math.random`；每次写入 ≤ 150 行；不加依赖。
- 不得放宽、跳过或改写任何门禁测试。若 `pnpm check` 只因 rig 100 角色性能门禁失败（机器负载），在报告里写明负载与数值即可。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm --filter @tianshu/core test`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：
- 改了哪几行；
- 新测试与结果；
- golden / 回放 hash 是否变化；
- 交给 ENG-16b / 16c：速度钳制的唯一入口是什么函数。

报告 ≤ 40 行。
