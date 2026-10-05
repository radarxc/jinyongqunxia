# 本任务：游戏工程 · 小修：对话 / Ink 意图执行移出首次会话静态闭包，改走对话懒加载块（AR-64 第 1 条）；首次会话回到 92 KiB 以下

本任务改加载边界。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开 pnpm store 写入。不要调用任何 Trae 技能；不改 node_modules（`_common` 第 13 条）。

先读：
- `CLAUDE.md` 的分层与性能规则；`docs/decisions/author-requirements.md` 的 AR-64：第 1 条，对话 / Ink 属于首屏用不到、要懒加载的子系统；
- `tools/perf/README.md`：首次会话闭包 = Worker 壳 + `apps/game/src/runtime/session.ts` 静态闭包 + 基础内容；子系统「对话 / Ink」从 `packages/core/src/entries/dialogue-projection.ts`、`dialogue-command.ts` 算；
- `apps/game/build/size-groups-plugin.ts`、`tools/perf/check_size.mjs`：只读，用来量；
- 报告：`tools/agents/reports/ENG-ink-intents.md`、`ENG-event-executor.md`、`ENG-event-source-trigger.md`；同类先例 `tools/agents/prompts/ENG-battle-modules-lazy.md`。

## 为什么做

- ENG-ink-intents 合入（87071d10）后，首次会话从 91.06 涨到 96.02 KiB，过了 95 的报警线。110 的门没碰到。
- 开发监督量出的来源：Worker 构建里 `event-executor` 块原始大小 4.38 → 20.96 kB，这个块在首次会话静态闭包里，因为区域事件和源事件在首次会话就要执行。
- ink-intents 把对话意图要用的动作执行（任务阶段、对话里的自动存档请求、`world/battleRequested` 等）并进了这个共用执行器，于是随区域事件一起进了首屏。
- 协调者（10-04 01:5x）：照 ENG-battle-modules-lazy 的做法挪进对话懒加载块，验收是首次会话回到 92 以下。

## 要做的事

1. **量**：先 `pnpm --filter ./apps/game build`，读 `apps/game/dist/.vite/size-groups.json` 和各块，列出首次会话静态闭包里只有对话 / Ink 意图才用到的代码。判定标准：从 `runtime/session.ts` 出发、不进对话也会执行到的，才算首次会话需要。
2. **挪**：
   - 执行器拆成两层：区域事件、源事件首屏要用的部分留在共用核心；只给对话意图用的动作与校验，随对话子系统懒加载，在对话子系统加载时注册进执行器；
   - 动作词表、OPCODES 仍是唯一登记，不复制一份；
   - 语义不变：同一快照、同一动作序列，结果、事件、拒绝原因码与改前逐字节一致；事务与回滚行为不变；
   - 对话还没加载时收到对话意图：给明确的可恢复错误，或先加载再执行，二选一，写进报告。
3. **测**：
   - 确定性：区域事件、源事件、对话意图各一组，改前改后结果一致（可用现有用例加一组对拍）；
   - 懒加载边界：对话子系统未加载时，首次会话路径不引入对话专用模块；
   - 体积：报告改前改后的首次会话合计、session static、对话子系统块。
4. **只动加载边界，不碰量具**：`tools/perf/**`、`apps/game/build/**` 的分组口径与预算一概不改。

## 约束

- 写集：`packages/core/src/**`、`apps/game/src/**`、`packages/data/src/**`（只为拆分导出边界）。写集外的改动在提交时会被丢弃。
- 不放宽任何门禁或阈值；不加「高负载跳过」逻辑（AR-33）。每次写入 ≤ 150 行；不得在 `/private/tmp` 做整仓检出（_common 规则 12）。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm content:build`
- 首次会话合计 < 92 KiB（按 `tools/perf/check_size.mjs` 的输出）
- `python3 tools/lint/check_ids.py --strict`

## 报告

≤ 40 行，写清：
- 挪了哪些模块与动作，挪前挪后各在哪个块；
- 首次会话合计、session static、对话子系统块，改前改后的数字；
- 对话未加载时收到意图怎么处理；
- 还有哪些首屏里的东西其实可以懒加载、这次没动，原因。
