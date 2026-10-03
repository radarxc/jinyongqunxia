# 本任务：游戏工程 · 小修：`m1-flow.test.ts` 在全量并行时偶发失败（元素尚未渲染就同步取）

本任务只改测试。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开 pnpm store 写入。先读根 `CLAUDE.md`、`apps/game/CLAUDE.md`、报告 `tools/agents/reports/ENG-19b-ui-m1-flow.md`。

## 为什么做

10-03 09:23，集成分支 HEAD 2effff74 的 `pnpm check` 红了一条：
- 失败用例：`apps/game/src/flow/m1-flow.test.ts` › M1 application flow with fake IndexedDB › goes from character creation through skip and default allocation to the ch10 title；
- 报错：`Unable to get [data-testid=cutscene-next] within: <main class="game-shell text-scale-100">`；
- 同一份代码在 09:19 的全量检查是绿的；单独跑这个文件两次也都是 3/3 通过。说明是全量并行、机器负载高时才出现的竞态。

原因在第 134–136 行：
- `vi.waitFor(() => expect(controller.flowStage.value).toBe('skip-bridge'))` 等的是控制器状态；
- 紧接着就用 `wrapper.get('[data-testid=cutscene-next]')` 同步取元素。
- 状态变了，但 DOM 还没更新：Vue 的更新是异步的，M1 页面与组件又按 ENG-19b 的约定懒加载。负载高时，同步取就会扑空。
- 文件里其他同步 `wrapper.get(...)` 紧跟在状态等待或点击之后的地方，也有同样的隐患。

## 要做的事

1. 在 `m1-flow.test.ts` 里，凡是「等状态 / 点击之后立刻同步取新出现的元素」的地方，先用文件里已有的 `waitFor(wrapper, selector)` 等到元素出现，再交互。
   - 两次 `cutscene-next` 点击之间，如果第二次点击依赖第一次点击后的重新渲染，也要等。
   - 已经用 `waitFor` 等过的元素，同一轮里重复取不必再等。
2. 不改断言的含义，不改被测代码。
3. 不加任何「按负载跳过 / 放宽」逻辑（作者 AR-33）；不改全局 `testTimeout`；`waitFor` 的 5 s 上限保持不变。
4. 自证稳定：在本工作区把该文件连续单独跑 10 次；再在后台加负载，比如同时跑 `pnpm test`，跑 3 次。报告写通过次数。

## 约束

- 写集：`apps/game/src/flow/m1-flow.test.ts`。写集外的改动在提交时会被丢弃。
- 不改 `apps/game/src/**` 的实现、`packages/**`、`tools/perf/**`。
- 每次写入 ≤ 150 行；不加依赖。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm --filter ./apps/game test`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 3 节写：
- 改了哪几处等待；
- 单跑 10 次的通过次数；
- 加负载跑 3 次的通过次数。

报告 ≤ 30 行。
