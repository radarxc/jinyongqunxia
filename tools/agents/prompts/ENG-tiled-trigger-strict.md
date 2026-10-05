# 本任务：游戏工程 · 小修：Tiled Trigger 的 action 按已登记动作名大小写敏感校验；Door 的 lockedBy 不得填任务 ID

本任务写校验代码与测试。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开 pnpm store 写入。

先读：
- 根 `CLAUDE.md`、`packages/data/CLAUDE.md`；
- 工程报告 `tools/agents/reports/ENG-18b-tiled-regionmap.md`（Tiled 编译与校验）、`ENG-20a-region-core.md` 第 7.4 节（Trigger / Door 的下游合同）；
- 审核意见 `.agents/reviews/CONTENT-ch00b-maps.r3.md`。

## 为什么做

CONTENT-ch00b-maps 第 3 轮审核 FAIL，暴露了两个校验漏洞，都让错误的地图数据混过了 `content:validate`：

1. **Trigger 的 `action` 大小写**：
   - `packages/data/src/schemas/region-map.ts` 第 202 行用的是全小写正则 `^[a-z][a-z0-9]*(?:/[a-z0-9]+)+$`；
   - 结果写错的 `party/giveitem`、`story/requesttransmission`、`ui/openallocation`、`ui/showtitlecard` 都能通过；
   - 而仓库真正登记的动作名，也就是 `packages/data/src/build/ink.ts` 的 `OPCODES`，是驼峰的：`party/giveItem`、`party/takeItem`、`story/requestTransmission`、`ui/openAllocation`、`ui/showTitleCard`、`save/autosave`、`flag/set`、`quest/advance`、`battle/start`、`world/openEntrance`、`tutorial/mark`、`dialogue/speaker`；
   - 写对的驼峰名反而会被这条正则拒掉。
2. **Door 的 `lockedBy`**：地图把任务 ID（如 `q_00_main_c_03`）填进了 `lockedBy`。运行时 `packages/core/src/world/region-runtime.ts` 的 `doorGate` 按 RegionGate binding 的 `gateId` 查找，查不到就永远锁死。

协调者裁定（10-03 13:06）：改成大小写敏感的白名单校验；能做到的话，再校验 Door 的 `lockedBy` 必须是已登记的 RegionGate ID。

## 要做的事

1. **action 白名单**：
   - Trigger 的 `action` 必须**逐字**等于已登记的动作名，大小写敏感。
   - 动作名来源：从 `ink.ts` 导出 `OPCODES` 的键集合（只加导出，不改表的内容），或者抽一个共享常量，让 Ink 与 Tiled 两处共用同一份。**不得另抄一份清单。**
   - 不在白名单里的，报诊断错误：带文件、对象 ID、给出的值；若存在仅大小写不同的合法名，附上「你是不是想写 X」。
   - 同步修正 `region-map.ts` 里 `action` 的 schema：不能拒绝合法的驼峰名。
2. **lockedBy**：
   - 先查清 RegionGate binding 的登记位置：现在运行时从 `apps/game/src/runtime/content.ts` 的 `regionGates` 读，内容侧可能还没有正式的数据源。
   - **若内容侧已有可读的 binding 登记**：校验 `lockedBy` 必须是其中已登记的 `gateId`。
   - **若还没有**：至少做两件事：
     - 拒绝明显不是门禁 ID 的值，例如以 `q_`、`st_`、`fl_` 等前缀开头的任务 / 阶段 / 旗标 ID；
     - 在报告第 6、7 节写清楚：binding 应登记在哪里、由谁登记，交 ENG / CONTENT 后续。
   - **不要自己发明一套 gate 数据格式。**
3. **测试**（`packages/data` 内，夹具放测试目录，不放进 `content/`）：
   - 驼峰合法名通过；
   - `party/giveitem` 这类大小写错误报错，并带建议；
   - 未知动作报错；
   - `lockedBy` 填任务 ID 报错；
   - 合法 gate ID 通过（若有登记源）。
4. 集成分支现有的 `content/world/regions/**/*.tmj` 里目前没有 `action`、`lockedBy`。改完后 `pnpm content:validate` 必须仍然全绿。

## 约束

- 写集：
  - `packages/data/src/schemas/region-map.ts`
  - `packages/data/src/build/tiled-*.ts`
  - `packages/data/src/build/ink.ts`（只加导出或抽共享常量，不改 OPCODES 内容）
  - `packages/data/src/build/index.ts`（只在需要导出时）
  - `packages/data/src/**/*.test.ts`、`packages/data/src/**/__fixtures__/**`
  - 写集外的改动在提交时会被丢弃。
- 不改 `content/**`（地图由 CONTENT 任务修）、`packages/core/**`、`apps/**`、`docs/**`、`tools/perf/**`。
- 不加依赖；每次写入 ≤ 150 行；不得在 `/private/tmp` 做整仓检出（_common 规则 12）。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm content:validate`
- `pnpm --filter @tianshu/data test`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 3 节写：
- 白名单来源，以及它和 Ink OPCODES 怎样保持唯一；
- 大小写错误的诊断示例；
- lockedBy 的校验程度：是查登记源，还是只做前缀拒绝。

第 6、7 节写 RegionGate binding 的登记位置与交接（交 CONTENT-ch00b / ch00a / ch10）。

报告 ≤ 40 行。
