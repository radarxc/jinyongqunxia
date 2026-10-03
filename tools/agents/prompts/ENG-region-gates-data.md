# 本任务：游戏工程 · 区域门禁绑定（RegionGate binding）进内容数据：schema、按章节的内容文件、构建进章节包、运行时装载，content:validate 校验 Door.lockedBy 必须是已登记的 gateId

本任务写数据管线与运行时装配代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开 pnpm store 写入。

先读：
- 根 `CLAUDE.md`、`packages/data/CLAUDE.md`；
- 工程报告：
  - `tools/agents/reports/ENG-20a-region-core.md`：第 7.4 节下游合同；`doorGate` 与 `RegionGateBinding`；
  - `tools/agents/reports/ENG-18b-tiled-regionmap.md`；
  - `tools/agents/reports/ENG-tiled-trigger-strict.md`：本任务依赖它，它已收紧 lockedBy 的前缀校验；
  - `tools/agents/reports/ENG-entry-split.md`：区域子系统按需加载的入口；
  - `tools/agents/reports/ENG-18-content-build.md`：章节包、叶片、contentHash；
- `docs/00-canon.md` §12：门禁 ID 命名为 `gate_<NN>_<拼音>`，例如 `gate_02_zhongzhifeng`；
- `docs/tech/04-data-pipeline.md` §6.1–6.3：binding 与消费所有者。

## 为什么做

- 运行时按 `packages/core/src/world/region-runtime.ts` 的 `doorGate(content, lockedBy)`，在 `RegionRuntimeContent.gates` 里查 `gateId`，查不到就返回 `REGION_GATE_LOCKED`，门永远锁死。
- `gates` 来自 `apps/game/src/runtime/content.ts` 的 `GameContent.regionGates`，但**内容侧没有任何数据源**：没有 schema、没有内容文件、也不进章节包。
- CONTENT-ch00b-maps 第 3 轮审核因此 FAIL：C01 / C03 两扇门只能把任务 ID 填进 `lockedBy` 占位。

协调者裁定（10-03 13:16）：
- 补上门禁绑定的数据源：schema、按章节的内容文件、构建、运行时装载；
- `content:validate` 校验地图里 Door 的 `lockedBy` 必须是已登记的 `gateId`，与 ENG-tiled-trigger-strict 的前缀校验衔接。

## 要做的事

1. **schema**：在 `packages/data/src/schemas/` 新增 `region-gate.ts`。
   - `schemaVersion: 'region-gate.v1'`；
   - `gateId`：`gate_<NN>_<拼音>`，与 check_ids 的规则一致；
   - `chapter`；
   - `expression`：复用 `@tianshu/core` 的 `RegionGateExpr` 结构，即 `GateExpr | { flag } | all / any / not`；quest 状态、旗标等条件都用它表达，不另造格式；
   - `lockedTextKey`：锁住时的提示文本键，复用现有 TextKey 规则；
   - 可选 `note`。
   - `z.strictObject`；导出类型；在 `schemas/index.ts` 导出。
2. **内容位置**：`content/chapters/<ch>/gates/*.yaml`，一扇门一个文件或一章一个文件，你选一种并写进 `content/CLAUDE.md` 或 README。
   - 在 `content-registry.ts` 登记新的 kind；在 `content-index.ts` 做引用检查：quest / flag / item 引用要存在。
   - **本任务不新增正式门禁内容**，C01 / C03 的门禁由 CONTENT 任务登记；测试夹具放测试目录。
3. **构建**：把门禁绑定编进对应章节的规则包，可作为区域规则叶片的一部分或独立叶片，按 tech/04 §8.1 命名并在报告第 6 节登记。contentHash 规则不变。
4. **运行时装载**：区域子系统按需加载时（ENG-entry-split 的区域入口）一并读入该章的门禁绑定，填进 `RegionRuntimeContent.gates`。
   - 读档、新游戏、书眠走同一入口；
   - 加载失败给可恢复的错误码，不静默当作「没有门禁」。
   - **改动尽量小**：ENG-16c 与 ENG-session-base-diet 也在改 `apps/game/src/runtime/**`，只动装载门禁绑定所需的最少几处。
5. **校验**：`content:validate` 和 `pnpm content:build` 都要检查，所有 tmj 里 Door 的 `lockedBy`：
   - 必须是已登记的 `gateId`；
   - 门禁的 `chapter` 要与地图所属章节一致，或在允许的跨章引用范围内；
   - 诊断信息带文件、对象 ID、给出的值，与 ENG-tiled-trigger-strict 的诊断格式一致。
   - 现在集成分支的地图里没有 `lockedBy`，改完必须仍然全绿。
6. **测试**：
   - schema 正反例；
   - 引用不存在的 quest / flag 报错；
   - lockedBy 未登记报错、已登记通过；
   - 运行时：夹具章节包加载后 `doorGate` 按条件开 / 锁；
   - 加载失败的错误码路径。

## 约束

- 写集：
  - `packages/data/src/schemas/region-gate.ts`、`packages/data/src/schemas/index.ts`、`packages/data/src/schemas/region-map.ts`（仅在需要时引用）
  - `packages/data/src/content-registry.ts`、`packages/data/src/content-index.ts`
  - `packages/data/src/build/**`、`packages/data/scripts/**`
  - `packages/data/src/**/*.test.ts`、`packages/data/src/**/__fixtures__/**`
  - `apps/game/src/runtime/**`（最小改动）
  - `content/CLAUDE.md`、`content/chapters/README.md`（若存在，写门禁文件的位置约定）
  - 写集外的改动在提交时会被丢弃。
- 不改 `packages/core/**`：`RegionGateBinding` / `RegionGateExpr` 已有，只消费；若必须改，在报告里写清原因，交后续任务。
- 不改 `content/world/**` 地图、不改 `docs/**`、`tools/perf/**`。
- 体积：门禁绑定按章节懒加载，不得进标题页 entry 或首次会话闭包的静态部分；报告写 `pnpm size` 三层数字。
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
- schema 字段表；
- 内容文件位置约定；
- 叶片命名与大小；
- 校验诊断示例；
- `pnpm size` 三层数字。

第 6 节写新增逻辑名，交 tech/04 同步。

第 7 节写交接：交 CONTENT-ch00a / ch00b，说明 C01 / C03 门禁怎么登记、Door 的 `lockedBy` 填什么、谁负责登记。

报告 ≤ 50 行。
