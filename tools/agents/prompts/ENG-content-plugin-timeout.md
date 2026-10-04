# 本任务：游戏工程 · 小修：content-plugin 的「town integration」集成用例加显式超时（60 秒），免得高负载下误报超时

本任务只改一个测试文件。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开 pnpm store 写入。

## 为什么做

- `apps/game/build/content-plugin.test.ts` 的「emits authored NPC presence and event-anchor registries with town data」要构建整份内容：`virtual:tianshu-content`、`virtual:tianshu-towns`、`virtual:tianshu-town/city_dali`。
- 机器负载在 30–50 时，它会超过 vitest 默认的 5 秒超时。集成分支的 prod_check 和 ENG-event-executor 的校验都因此误报「Test timed out in 5000ms」。
- 协调者裁定（10-03 18:45）：这条断言的是功能，不是速度，给它设显式超时不算放宽性能门。

## 要做的事

1. 给这条用例加显式超时 60 秒，写成 `it(name, async () => { … }, 60_000)`，并加一行注释说明原因。
2. 断言一条都不改，不改其他测试，不改 vitest 全局配置（`testTimeout`）。
3. 同一文件里若还有同类、要构建内容的用例，同样加 60 秒显式超时，并在报告里列出。
4. **不要动** `packages/core/bench/**` 的计时断言：那是性能门，要不要挪到 `check:perf` 由作者定。

## 约束

- 写集：`apps/game/build/content-plugin.test.ts`。写集外的改动在提交时会被丢弃。
- 不加依赖；不调用任何 Trae 技能；不得在 `/private/tmp` 做整仓检出（_common 规则 12）。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm --filter ./apps/game typecheck`
- `pnpm --filter ./apps/game test`
- `python3 tools/lint/check_ids.py --strict`

## 报告

≤ 20 行，写清：
- 改了哪几条用例、超时设多少；
- 本机实跑这条用例的耗时，并注明当时的负载。
