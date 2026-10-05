# 本任务：游戏工程 · 小修：apps/game 功能用例里用默认 1 秒超时的 vi.waitFor 加显式超时（照 content-plugin / quest 先例），止住负载高时的误报

本任务只改测试文件。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。不要调用任何技能。

## 为什么做

- `apps/game/src/app-flow.test.ts` 的「accepts a second user command while a real IndexedDB autosave is committing」是功能用例：断言的是第二条命令能在自动存档提交期间被接受，不是速度。
- 用例里 `vi.waitFor(...)` 没给超时，用的是 vitest 默认的 1 秒。机器负载 30 左右时，提交开始要 1.9 秒，用例失败（10-04 00:02 集成分支 prod_check，ENG-26 重合后）；同一时刻单独跑三次全过，单跑耗时约 0.7 秒。
- 照先例：ENG-content-plugin-timeout（60 秒）、ENG-quest-test-timeout（30 秒）都是给功能用例加显式超时，协调者裁定不算放宽性能门。

## 要做的事

1. `apps/game/src/**/*.test.ts` 里所有没给 `timeout` 的 `vi.waitFor(...)`，统一加 `{ timeout: 10_000 }`，加一行注释说明原因。断言、轮询内容一概不改。
2. 用例本身若可能超过 vitest 默认的 5 秒，同样给用例加显式超时 30 秒。
3. 不改 vitest 全局配置，不碰性能门（`packages/core/bench/**`、`packages/render/src/rig/performance.test.ts`），也不碰别的包。

## 约束

- 写集：`apps/game/src/**/*.test.ts`。写集外的改动在提交时会被丢弃。
- 每次写入 ≤ 150 行。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm --filter ./apps/game test`
- `pnpm check`
- `python3 tools/lint/check_ids.py --strict`

## 报告

≤ 15 行，写清改了哪些文件、几处 `vi.waitFor`，以及本机实跑耗时（注明负载）。
