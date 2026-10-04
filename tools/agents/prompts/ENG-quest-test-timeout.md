# 本任务：游戏工程 · 小修：quest 的 runtime-regression 功能用例加显式超时（照 content-plugin 先例），止住负载高时 5 秒默认超时误报

本任务只改一个测试文件。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。不要调用任何技能。

## 为什么做

- `packages/core/src/quest/runtime-regression.test.ts` 的「does not publish quest-port effects before a failed stabilization commits」是功能用例，断言的是规则，不是速度。
- 机器负载 25 以上时，它会超过 vitest 默认的 5 秒超时（10-03 21:58 ENG-23a 的 finish 校验栽在这里）。
- 协调者裁定（10-03 22:08）：照 content-plugin 的先例加显式超时，不算放宽性能门。

## 要做的事

1. 给这条用例加显式超时 30 秒，加一行注释说明原因。断言不改。
2. 同文件里若还有同类、偏重的功能用例，同样处理，并在报告里列出。
3. 不改 vitest 全局配置；不碰 `packages/core/bench/**`，那是性能门，另有任务。

## 约束

- 写集：`packages/core/src/quest/runtime-regression.test.ts`。
- 每次写入 ≤ 150 行。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm --filter @tianshu/core test`
- `python3 tools/lint/check_ids.py --strict`

## 报告

≤ 15 行，写清改了哪几条用例，以及本机实跑耗时（注明负载）。
