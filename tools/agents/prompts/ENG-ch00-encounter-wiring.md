# 本任务：游戏工程 · 序章三战接线（M1）：ch00 三场遭遇从草案转为生产内容，接上开战（world/battleRequested → 遭遇 → BattleSetup）、参战者解析、救场 / 提示 / 示范、连败计数与结果旗标，打完回到原场景

本任务写引擎与装配代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开 pnpm store 写入。不要调用任何 Trae 技能；不改 node_modules（`_common` 第 13 条）。**直接动手改代码并跑测试，不要只写计划就结束。**

先读：
- `docs/design/chapters/00-yuenv.md`：序章三战（竹林、白猿切磋、边道）的规则，§5.4 胜后双演示；
- CONTENT-ch00c-encounters 的产物：`content/chapters/ch00_yuenv/encounters/README.md` 与 `_drafts/` 下三份 YAML（`enc_00_zhulin`、`enc_00_baiyuan`、`enc_00_biandao`），以及报告 `tools/agents/reports/CONTENT-ch00c-encounters.md` 第 4、6、7 节列的引擎缺口；
- 已合入的引擎：
  - ENG-26：`packages/data/src/schemas/encounter.ts`、`packages/core/src/battle/encounter/builder.ts`、`battle/script/index.ts`（脚本节拍、`scriptContext.lossStreak`）；
  - ENG-ink-intents：对话意图会发 `world/battleRequested`；
  - ENG-event-executor / ENG-region-gates-data：区域事件同样会发 `world/battleRequested`；
  - ENG-16c：BattleSession 在 core，实战即回放；
  - ENG-npc-species-roleslot：白猿 species 与三个角色槽。
- 现状：core 会发 `world/battleRequested`（`packages/core/src/command/region-handler.ts`、`event/event-executor.ts`），但 `apps/game/src/runtime/session.ts` 只消费 `town/battleRequested`（冥想战）。所以序章的战斗现在打不起来。

## 要做的事

1. **遭遇转生产**：三份草案移出 `_drafts/`，进 `content/chapters/ch00_yuenv/encounters/`，去掉草案标记，能编进章节包；data 侧的字段分类（如 `CONTENT_FIELD_REGISTRY`）补上 encounter，内容构建与校验认它。
2. **开战接线**：
   - game 会话消费 `world/battleRequested`：取遭遇 ID，用参战者解析（source resolver：主角、NPC、角色槽模板到参战单位）和 ENG-26 的 `buildEncounter` 建出 BattleSetup，经 core 开战；
   - 打完按遭遇的 outcome 回到发起的场景与锚点，和冥想战走同一套进出战斗流程。
3. **救场 / 提示 / 示范、连败、结果**，按设计与遭遇 YAML：
   - 竹林：HP 低于 45% 触发一次救场事件；连败 2 次给提示，3 次提供示范；
   - 连败计数持久化为 `fl_00_zhulin_loss_streak3` 一类旗标，Ink 里 `get_flag(...)` 能读到；
   - 白猿：命中 1 次或坚持 2 轮判胜，认输可推进，失败回到选择；
   - 边道：AI 越卒同战、允许留手；
   - 胜负、认输写结果旗标，供任务与 Ink 推进；胜后双演示按 §5.4。
4. **测试**：三场遭遇各一条从请求到结算的确定性流程测试（真会话、固定种子）：开战 → 结束 → 旗标与任务阶段变化 → 回到场景；救场只触发一次；连败计数跨读档保留；同一输入两次跑结果逐字节一致。

## 约束

- 写集：`packages/core/src/**`、`packages/data/src/**`、`apps/game/src/**`、`content/chapters/ch00_yuenv/encounters/**`、`content/chapters/ch00_yuenv/quests/**`（只为结果旗标挂钩）。写集外的改动在提交时会被丢弃。
- core 保持确定性，不引入墙钟和随机；不改性能门与预算；首次会话闭包不得变大：战斗相关代码走战斗懒加载块（AR-64），报告写实测。
- 每次写入 ≤ 150 行；不得在 `/private/tmp` 做整仓检出（_common 规则 12）。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm content:build`
- `pnpm content:validate`
- `pnpm --filter ./apps/game test`
- `python3 tools/lint/check_ids.py --strict`

## 报告

≤ 50 行，写清：
- 开战接线的路径，与冥想战的异同；
- 参战者解析规则；
- 救场、提示、示范、连败、结果旗标各自的落点；
- 三场遭遇的测试；
- 首次会话与战斗块的体积数字；
- M1 序章还剩的缺口（应为零，如有写明）。
