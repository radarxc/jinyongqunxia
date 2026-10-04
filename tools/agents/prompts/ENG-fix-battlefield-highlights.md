# 本任务：游戏工程 · 小修：集成分支红——BattleField 可达高亮用例在 16e 与 generic-model 合到一起后失败；查清 2D / 3D 两条路径下高亮怎样下发，修代码或修用例（用例要验证真实行为，不得为变绿删断言）

本任务修集成冲突。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。不要调用任何技能；不改 node_modules。**直接动手改代码并跑测试，不要只写计划就结束。**

## 为什么做

- ENG-battle-generic-model（af1873a1，05:05）先合入，ENG-16e-battle-ui-actions（ecc68454，05:08）后合入。两件各自在自己的基点上校验都过，合到一起，集成分支的 `pnpm check` 确定性失败：
  - `apps/game/src/battle/components/BattleField.test.ts` 的「shows core reachability and sends a read-only destination preview」；
  - 断言 `setHighlights` 被调用过，实际调用 0 次（第 43 行）。日志：`.agents/coord/_handoff/prod_check_post-ops-merge-ecc68454…_0508.log`。
- 开发监督初查的线索（请自己核实）：合并后的 `BattleField.vue` 在 `sync()` 里先调 `project()`，`project()` 里会调 generic-model 新加的 `renderer.projectUnit(...)`，然后才调 `highlights()`。16e 写的用例，mock 渲染器里没有 `projectUnit`，`project()` 抛错，`highlights()` 就没执行到。如果这样，生产代码里一处投影出错也会连带吞掉高亮，这一点也要看。

## 要做的事

1. 查清 2D 纸偶与 3D 模型两条渲染路径下，可达高亮、路径、落点、选中是怎样下发的，都要能工作。
2. 修复：
   - 用例的 mock 渲染器要跟上现在的 `BattleRenderer` 接口（例如补 `projectUnit`），断言照旧验证「可达格经 setHighlights 下发」「点击发只读预览」；
   - 生产代码里，一个单位的投影失败不应吞掉整轮高亮与预览；用合适的方式隔离，并加用例覆盖；
   - 不删断言、不放宽断言、不加跳过。
3. 同目录里 16e 与 generic-model 都改过的其他组件用例，一并核一遍是否只是碰巧通过。

## 约束

- 写集：`apps/game/src/battle/**`、`packages/render/src/battle/**`（只在接口必须时改）。写集外的改动在提交时会被丢弃。
- 不改 core，不改门禁与预算；每次写入 ≤ 150 行。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm --filter ./apps/game test`
- `pnpm check`
- `python3 tools/lint/check_ids.py --strict`

## 报告

≤ 15 行，写清：失败的根因，修了哪里，两条渲染路径怎样验证，新增或改了哪些用例。
