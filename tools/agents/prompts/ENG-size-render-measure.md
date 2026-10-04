# 本任务：工具 · 小修：check_size 按清单定位 render 块并量静态闭包（不再按文件名前缀找），新增战斗 3D 懒加载块的预算；原有门值一条不放宽

本任务改体积门禁的测量脚本与预算登记。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。不要调用任何技能；不改 node_modules。**直接动手改代码并跑测试，不要只写计划就结束。**

## 为什么做

- ENG-battle-generic-model 合入（af1873a1）后，prod_check 报 render 从 168.86 降到 2.36 KiB，webgl total 从 207.69 降到 41.63。这不是真瘦了，是量错了：
  - `tools/perf/check_size.mjs` 用 `emittedJs.find(candidate => candidate.startsWith('render-'))` 找 render 块。现在 `assets/` 里有 `render-host-*.js`（应用侧 2.37 KiB）和 `render-*.js`（真正的 render，gzip 约 164–170 KiB）两个文件，谁先被找到取决于内容哈希的字母序。这次哈希变成 `render-zUGMoc67`，排到 `render-host` 后面，于是量成了 2.36；
  - render 现在静态引入了拆出去的 `rig-*.js`（约 14.75 KiB gzip），只量单个文件也会漏掉它；
  - 新出现了战斗 3D 懒加载块 `battle-model3d-*.js`（约 17.25 KiB gzip），目前没有任何预算管它。
- 协调者（10-04 05:1x）：被挪走的体积必须仍受门禁约束，没有就补一条预算，按实测加适当余量写明；原有门值一条也不放宽。

## 要做的事

1. **定位 render**：按 `.vite/manifest.json` 定位：取源模块 `packages/render/src/index.ts` 所在的块，或 render 入口的动态导入目标；不再按文件名前缀找。`render-webgpu`、`basis`、`devtools` 同样改成按清单定位。
2. **量静态闭包**：render 的体积 = 该块加上它静态引入的块，减去 entry 闭包已经算过的部分，gzip 计算口径照旧。webgl total = entry + render 闭包，语义与改前一致。
3. **新增预算**：`tools/perf/budgets.json` 加一条战斗 3D 懒加载块的预算，命名如 `render-model3d`。数值 24 KiB gzip，即实测约 17.25 KiB 加余量，在报告里写明理由；`check_size.mjs` 量它、超了就阻断，块不存在时显示 `not emitted`。
4. 原有各条预算（entry 170、render 180、webgl total 350、session 110 等）一条不改。
5. **测试**（`tools/perf/check_size.test.mjs`）：
   - 用造出来的清单夹具：`render-host-*` 与 `render-*` 并存时，无论哈希字母序怎样，都定位到真正的 render；
   - 闭包包含静态引入的块；
   - 新预算超了会阻断。
6. 文档：`tools/perf/README.md` 补上新预算和定位方式。

## 约束

- 写集：`tools/perf/**`、`apps/game/build/size-groups-plugin.ts`（只在定位必须时改）。写集外的改动在提交时会被丢弃。
- 不改任何业务代码与分块方式；不放宽任何门值。每次写入 ≤ 150 行。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `node --test tools/perf/check_size.test.mjs`
- `python3 tools/lint/check_ids.py --strict`

## 报告

≤ 20 行，写清：
- 定位方式；
- 改后实测：entry、render 闭包、webgl total、render-model3d、首次会话；
- 新预算的数值与理由。
