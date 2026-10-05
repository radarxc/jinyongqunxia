# 本任务：游戏工程 · 区域绑定数据：门禁（gate）、对话（dialogue）、掉落（loot）三类 binding 进内容数据——schema、按章节的内容文件、编进章节包、区域按需装载；content:validate 校验地图引用都已登记

本任务写数据管线与运行时装配代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开 pnpm store 写入。

先读：
- 根 `CLAUDE.md`、`packages/data/CLAUDE.md`；
- 工程报告：
  - `tools/agents/reports/ENG-20a-region-core.md` 第 7.4 节（下游合同）；
  - `tools/agents/reports/ENG-18b-tiled-regionmap.md`；
  - `tools/agents/reports/ENG-tiled-trigger-strict.md`：本任务依赖它，它已收紧 action / lockedBy 校验；
  - `tools/agents/reports/ENG-entry-split.md`：区域子系统按需加载的入口；
  - `tools/agents/reports/ENG-18-content-build.md`：章节包、叶片、contentHash；
  - `tools/agents/reports/ENG-content-validate-inkmeta.md`：Ink 与 inkmeta 的校验；
- 运行时消费点：`packages/core/src/world/region-runtime.ts` 的 `doorGate`，`packages/core/src/command/region-handler.ts` 里 NpcSpawn 查 `runtime.dialogues`、Chest 查 `runtime.loot`，以及 `packages/core/src/world/region-types.ts` 里的 `RegionGateBinding`、`RegionDialogueBinding`、`RegionLootBinding`；
- `docs/00-canon.md` §12：门禁 ID 写作 `gate_<NN>_<拼音>`；
- `docs/tech/04-data-pipeline.md` §6.1–6.3：binding 与消费所有者。

## 为什么做

- 区域运行时已经会读三类 binding：
  - Door 按 `lockedBy` 查 `gates`，查不到就返回 `REGION_GATE_LOCKED`，门永远锁死；
  - NpcSpawn 互动按场景 + 锚点查 `dialogues`；
  - Chest 按 `lootRef` 查 `loot`。
- 但 `apps/game/src/runtime/content.ts` 的 `GameContent.regionGates`、`regionDialogues`、`regionLoot` **从来没有被赋值过**：内容侧没有 schema、没有内容文件，也不进章节包。
- 后果：CONTENT-ch00b-maps r3、CONTENT-ch10-cold-entry r1 都因此 FAIL。门只能拿 quest ID 占位；首谈 Trigger 和 NPC 对话接不上故事。

协调者裁定（10-03 13:16、13:26）：三类 binding 用**同一套** schema 约定、目录与校验一并补齐；`content:validate` 校验地图里的引用必须已登记。

## 要做的事

1. **schema**（`packages/data/src/schemas/region-binding.ts`，新文件），三个 `z.strictObject`，各有自己的 `schemaVersion`：
   - `region-gate.v1`：
     - `gateId`：`gate_<NN>_<拼音>`，与 check_ids 一致；
     - `chapter`；
     - `expression`：复用 core 的 `RegionGateExpr` 结构，即 `GateExpr | { flag } | all / any / not`，quest 状态、旗标都用它表达，不另造格式；
     - `lockedTextKey`；
     - 可选 `note`。
   - `region-dialogue.v1`：
     - `chapter`、`sceneId`、`anchorId`；
     - `storyId`：必须是已登记的 Ink story；
     - `entryKey`：必须在该 story 的 inkmeta `entryKnots` 里；
     - 可选 `condition`，结构同 `RegionGateExpr`。
     - 同时覆盖 NpcSpawn 互动，以及 Trigger 触发的对话（例如 ch10 的 `first_talk`）。Trigger 怎样触发对话，以 ENG-event-executor 的接口为准：本任务只提供 binding 数据与查询，不实现 Trigger 执行。
   - `region-loot.v1`：
     - `lootRef`、`chapter`；
     - `items`：`[{ itemId, count }]`，物品必须已登记。
   - 都导出类型，并在 `schemas/index.ts` 导出。
2. **内容位置**：`content/chapters/<ch>/bindings/{gates,dialogues,loot}/*.yaml`。
   - 在 `content-registry.ts` 登记三个 kind；在 `content-index.ts` 做引用检查：quest / flag / item / story / knot 都要存在。
   - 位置约定写进 `content/CLAUDE.md`。
   - **本任务不新增正式 binding 内容**，唯一例外是下文「集成分支现状」一节的 ch10 照抄；ch00 的 binding 由 CONTENT 任务登记；测试夹具放测试目录。
3. **构建**：三类 binding 编进对应章节的规则包，作为区域规则叶片的一部分或独立叶片，按 tech/04 §8.1 命名，在报告第 6 节登记。contentHash 规则不变。
4. **运行时装载**：区域子系统按需加载时（ENG-entry-split 的区域入口），一并读入该章的三类 binding，填进 `RegionRuntimeContent.gates`、`dialogues`、`loot`。
   - 读档、新游戏、书眠走同一入口；
   - 加载失败给可恢复的错误码，不静默当作「没有绑定」。
   - **改动尽量小**：ENG-16c、ENG-session-base-diet、ENG-event-executor 也在改 `apps/game/src/runtime/**`，只动装载绑定所需的最少几处。
5. **校验**：`content:validate` 和 `pnpm content:build` 都要检查所有 tmj：
   - Door 的 `lockedBy` 必须是已登记的 gateId；
   - NpcSpawn 必须有对应的 dialogue binding，或者显式标注为「无对话」，标注方式你定，写进报告；
   - Chest 的 `lootRef` 必须已登记；
   - 所有 binding 引用的 sceneId / anchorId 必须真实存在于地图。
   - 诊断带文件、对象 ID、给出的值，格式与 ENG-tiled-trigger-strict 一致。
   - 现在集成分支的地图若因「NpcSpawn 必须有绑定」变红，就给这条加「仅对声明了 bindings 目录的章节生效」的过渡规则，并在报告写清。**不得放宽其他检查。**
6. **测试**：
   - 三类 schema 的正反例；
   - 引用不存在的 quest / flag / item / story / knot 报错；
   - 地图引用未登记的 binding 报错，已登记的通过；
   - 运行时：用夹具章节包加载后，`doorGate` 能按条件开或锁，NpcSpawn 互动进入正确的 story / knot，Chest 发放正确物品；
   - 加载失败走错误码路径。

## 集成分支现状（10-03 14:40 开发监督补）

CONTENT-ch10-cold-entry 已合入（38a746bf）。集成分支上已有：
- `content/world/regions/rg_xiyu_beijiang/sc_10_fengshi_feiyi.tmj`：
  - 东门 Door `lockedBy: gate_10_fengshi_dongmen`；
  - NpcSpawn 三个：`first_talk`（沈青禾）、`li_wenxiu`、`postman`。
- ch10 报告 `tools/agents/reports/CONTENT-ch10-cold-entry.md` 第 4 节 O3 与第 6 节给出了交接 binding：
  - gate：`{gateId: gate_10_fengshi_dongmen, expression: {flag: fl_10_cold_entry_talked}}`，锁住提示文本键 `ch10.coldEntry.interact.eastGateLocked`；
  - dialogue：`{sceneId: sc_10_fengshi_feiyi, anchorId: first_talk, storyId: story_ch10_cold_entry, entryKey: fengshi_first_talk}`；
  - 李文秀、驿卒两个锚点没有独立对话。

本任务新增的「Door 的 lockedBy 必须是已登记的 gateId」是硬规则，不得放宽。不处理的话，本任务合入后集成分支的 `content:validate` 会红。所以：
- 把上面三项交接**照抄**成正式 binding 文件，放在 `content/chapters/ch10_baima/bindings/{gates,dialogues}/`；
  - 只誊写，不做内容取舍；
  - 字段对不上 schema 时，以 schema 为准做最小转写，并在报告第 7 节逐项写明。
- 「无对话」标注放在章节 binding 文件里，不改地图（地图不在写集），这样李文秀、驿卒两个锚点不必动 tmj。
- 若要在 `apps/game/src/runtime/**` 删掉写死的 `regionGates`，以合入后的内容文件为准。
- 报告第 7 节写明 ch10 的三项 binding 已登记，交 ENG-19e 与验收任务直接使用。

## 约束

- 写集：
  - `packages/data/src/schemas/region-binding.ts`、`packages/data/src/schemas/index.ts`、`packages/data/src/schemas/region-map.ts`（仅在需要时引用）
  - `packages/data/src/content-registry.ts`、`packages/data/src/content-index.ts`
  - `packages/data/src/build/**`、`packages/data/scripts/**`
  - `packages/data/src/**/*.test.ts`、`packages/data/src/**/__fixtures__/**`
  - `apps/game/src/runtime/**`（最小改动）
  - `content/CLAUDE.md`
  - `content/chapters/ch10_baima/bindings/**`（只照抄 ch10 报告的交接 binding，见上节）
  - 写集外的改动在提交时会被丢弃。
- 不改 `packages/core/**`：三类 binding 的类型已有，只消费；若必须改，在报告里写清原因，交 ENG-event-executor 或后续任务。
- 不改 `content/world/**` 地图；`content/chapters/**` 正式内容只按上节照抄 ch10 的 binding，其余不改；不改 `docs/**`、`tools/perf/**`。
- 体积：binding 按章节懒加载，不得进标题页 entry 或首次会话闭包的静态部分；报告写 `pnpm size` 三层数字。
- 不加依赖；每次写入 ≤ 150 行；不得在 `/private/tmp` 做整仓检出（_common 规则 12）。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm content:build`
- `pnpm content:validate`
- `pnpm --filter @tianshu/data test`
- `pnpm --filter ./apps/game test`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 3 节写：
- 三类 schema 的字段表；
- 内容目录约定；
- 叶片命名与大小；
- 校验诊断示例；
- 过渡规则（若有）；
- `pnpm size` 三层数字。

第 6 节写新增逻辑名，交 tech/04 同步。

第 7 节写交接：
- 交 CONTENT-ch00a / ch00b / ch10：C01 / C03 门禁、ch10 东出口门禁、`first_talk` 与各 NPC 对话、宝箱掉落分别怎么登记，Door / NpcSpawn / Chest 字段填什么；
- 交 ENG-event-executor：对话型 Trigger 怎样查 dialogue binding。

报告 ≤ 60 行。
