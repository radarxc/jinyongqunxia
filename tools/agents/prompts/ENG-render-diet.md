# 本任务：游戏工程 · render 瘦身：静态闭包从 179.41 KiB 降到 170 以下，留约 10 KiB 余量；挪出去的块都要有预算管

本任务改渲染包的导入与分块。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开 pnpm store 写入。不要调用任何技能；不改 node_modules。**直接动手改代码并跑测试，不要只写计划就结束。**

先读：`CLAUDE.md` 性能规则；`tools/perf/README.md`；`tools/perf/budgets.json`；ENG-size-render-measure 的报告（render 现在按清单定位、量静态闭包）。

## 为什么做

- ENG-size-render-measure 合入后口径改对了：render 静态闭包实测 179.41 KiB，门是 180，只剩 0.59 KiB。下一件往 render 加东西的任务就会撞门。门值不放宽。
- 协调者（10-04 06:5x）：先把 render 降到 170 以下。

## 要做的事

1. **先查构成**，写进报告：
   - three 是否按需引入，有没有整包进来，例如 `import * as THREE`、examples 全量；
   - rig 块（`rig-*.js`，约 14.75 KiB）能不能改成懒加载，或者只在用到时加载；
   - 调试与开发代码有没有混进产物：试点场景、性能基准、devtools、日志、断言辅助；
   - 其他大块的来源。
2. **瘦身**，到 render 静态闭包 < 170 KiB：
   - 按需引入、懒加载、去掉产物里的调试代码，行为不变；
   - **不能把东西挪到不受预算管的新块里躲门**：挪出去的块都要在 `tools/perf/budgets.json` 有预算，`check_size.mjs` 量得到。新预算按实测加适当余量，在报告里写明数值与理由；
   - 原有门值一条不改。
3. **测试**：渲染相关单测照过；懒加载的部分补「首次进战斗 / 进区域时能正确加载」的用例；`pnpm check:perf` 的 rig 门不受影响，报告写实测（注明负载）。

## 约束

- 写集：`packages/render/src/**`、`apps/game/src/**`（只为懒加载接线）、`apps/game/vite.config.ts`（只在分块必须时改）、`tools/perf/budgets.json`、`tools/perf/check_size.mjs`、`tools/perf/check_size.test.mjs`、`tools/perf/README.md`（只为新块补预算与量法）。写集外的改动在提交时会被丢弃。
- 不放宽任何门禁或阈值；不加「高负载跳过」逻辑（AR-33）。每次写入 ≤ 150 行。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- render 静态闭包 < 170 KiB（按 `tools/perf/check_size.mjs` 的输出）
- `python3 tools/lint/check_ids.py --strict`

## 报告

≤ 30 行，写清：render 构成（改前）、各项措施与各自省下的体积、改后 entry / render / webgl total / 各新块的数字与预算、check:perf 的结果。
