# 本任务：游戏工程 · 小修：战斗控制器懒加载期间宿主被替换时不再订阅已销毁的宿主（消除 main-flow 测试里偶发的 HOST_DISPOSED 未处理 rejection）

本任务写界面装配代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开 pnpm store 写入。不要调用任何 Trae 技能。

## 为什么做

- `apps/game/src/main-flow.test.ts` 的用例「continues a formal save, then replaces a failed host and restores the latest auto save」偶发失败。vitest 捕获一个未处理的 rejection：
  - 报错：`Error: HOST_DISPOSED`；
  - 位置：`packages/platform/src/host/projection-host.ts:56` 的 `subscribe`；
  - 调用链：`createBattleController`（`apps/game/src/battle/controller.ts:65`）← `game-controller.ts:70`。
  - 测试全过，但 `pnpm check` 因此退出码为 1。
- 原因：`game-controller.ts` 的 `ensureBattle()` 用 `import('./battle/controller')` 懒加载。import 还没完成时宿主已被替换并销毁，完成后 `createBattleController(host)` 去订阅已销毁的宿主而抛错；这个 promise 没人接，就成了未处理的 rejection。
- 单独跑这个测试文件 3 次，复现 1 次。所有任务的 `pnpm check` 都会随机栽在这里。

## 要做的事

协调者裁定（10-03 19:10）的两条要求必须做到：

1. **修在产品代码里，不只是让测试安静**。线上换宿主时一样会碰到这个竞态。
   - `ensureBattle()` 在 import 完成后，先确认宿主还是当前那个、没被销毁；
   - 宿主已变或已销毁：丢弃这次加载，不订阅旧宿主，清掉 `battleLoading`，下次对新宿主重新加载；
   - 所有调用方都要接住这个 promise，不留未处理的 rejection，失败转成可恢复的状态。
   - 宿主「当前 / 已销毁」怎么判定由你定，比如用 controller 内的代数计数或宿主身份比较。写进报告，不改 `packages/platform/**`。
2. **回归测试要确定性地复现**：
   - 用可控的 deferred import（测试注入的加载函数，或可手动放行的 promise）卡住加载；
   - 在加载中途替换并销毁宿主，再放行；
   - 断言没有未处理的 rejection，且新宿主上的 `ensureBattle()` 照常可用、战斗控制器订阅的是新宿主。
   - **不许靠重试、加长超时或跳过**（AR-33）。
   - 为了能注入加载函数而给 `createGameController` 加的可选参数，只用于测试注入，默认行为不变。
3. 不改宿主替换、自动存档恢复的既有语义。
4. 把 `pnpm --filter ./apps/game exec vitest run src/main-flow.test.ts --configLoader runner` 连跑 10 次，全部无 Errors，在报告里写出结果。

## 约束

- 写集：
  - `apps/game/src/game-controller.ts`、`apps/game/src/battle/controller.ts`
  - `apps/game/src/**/*.test.ts`
  - 写集外的改动在提交时会被丢弃。
- 不改 `packages/**`、`content/**`、`tools/perf/**`。
- 不加依赖；每次写入 ≤ 150 行；不得在 `/private/tmp` 做整仓检出（_common 规则 12）。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm --filter ./apps/game test`
- `python3 tools/lint/check_ids.py --strict`

## 报告

≤ 30 行，写清：
- 竞态原因与修法；
- 回归测试；
- 10 次连跑结果；
- 有无其他调用方同样不接 promise。
