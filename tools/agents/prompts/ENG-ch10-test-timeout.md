# 本任务：游戏工程 · 小修：item-content 的 ch10 真产物集成用例写固定超时 60 秒（照 waitfor / role-slot 先例；断言不动），同文件其他读真实产物的用例一并查

本任务只改一个测试文件。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。不要调用任何技能；不改 node_modules。**直接动手，不要只写计划就结束。**

## 为什么做

- `apps/game/src/runtime/item-content.test.ts` 的「loads the real compiled ch10 DTO and creates the preview session」是加载真实 ch10 编译产物的集成用例，本来就重。
- 10-04 05:47 起，负载 35–40 时它在 15 秒超时内跑不完，连着拖红了集成分支和三件任务的校验。
- 开发监督在负载 13–15 时单跑三次都过，耗时 3.1、2.6、2.8 秒，所以不是退化，是负载导致的超时。
- 协调者裁定：照 ENG-waitfor-timeout、role-slot 的先例，给这条写固定超时 60 秒。

## 要做的事

1. 这条用例的超时改为固定 60 秒，加一行注释说明：加载真实 ch10 产物的集成用例，负载高时偏重。断言不动。
2. 同文件里其他读真实编译产物的用例，一并查：偏重又没写超时的，同样给固定超时，在报告里列出。
3. 不加任何按负载判断的分支；不改 vitest 全局配置；不碰性能门。

## 约束

- 写集：`apps/game/src/runtime/item-content.test.ts`。写集外的改动在提交时会被丢弃。
- 每次写入 ≤ 150 行。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm --filter ./apps/game test`
- `pnpm check`
- `python3 tools/lint/check_ids.py --strict`

## 报告

≤ 10 行，写清改了哪几条用例，以及本机实跑耗时（注明负载）。
