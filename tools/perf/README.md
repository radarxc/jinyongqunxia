# 性能预算

`pnpm check:perf` 自动收集 `packages/**/*performance.test.ts`；同名文件自动从
日常 `pnpm check` 排除。当前包含 rig / dressup / VFX 角色与特效 CPU、
BattleSession 线性、自动战斗 / 事务总线和存储计时门；后续城镇寻路、tick、区域帧、
生成器与人物门只须遵守该后缀。它们依赖墙钟计时，按 AR-33 / AR-64 在低负载时
单独运行，断言与阈值均不放宽。

`budgets.json` 镜像 `docs/tech/01-architecture.md` §5.4，并增加协调者待作者确认的
首次会话闭包 110 KiB gzip 门禁。`tools/perf/check_size.mjs` 在 Vite 构建后逐项计算
gzip 字节并阻断超限，输出分为三层：

- 标题页 entry：沿 `.vite/manifest.json` 的唯一页面入口追踪静态闭包，继续使用
  170 KiB 预算；render 拆分实测 151.85 KiB 后由 180 收紧为 170，WebGL/WebGPU
  total 与其余既有预算保持不变。render、
  `render-webgpu`、Basis 与 devtools 均按清单中的源模块或动态导入边定位，不再
  以输出文件名前缀猜块；render 计入静态 import 闭包，并扣除 entry 已计文件。
- 战斗 3D：清单中的 `battle-model3d` 动态块作为 `render-model3d` 计量；扣除
  entry 与 render 已计静态闭包后执行 24 KiB gzip 门禁。该值由当前实测约
  17.25 KiB 加约 6.75 KiB（39%）余量得出；未构建该块时显示 `not emitted`。
- 角色 rig：清单中的 `rig` 动态块作为 `render-rig` 计量；扣除 entry 与
  render 已计静态闭包后执行 20 KiB gzip 门禁。该值由拆分后实测约 14.95 KiB
  加约 5.05 KiB（34%）余量得出；首次进入战斗、区域、城镇或大地图时加载。
- 城镇探索：`render-explore` 32、`render-town-legacy` 14、`render-buildgen` 40、
  `render-buildgen-worker` 24、`render-actor3d` 16、`render-meshopt` 8 KiB；未落地的
  后续目录显示 0 并 PASS。`render` 的静态模块闭包禁止含这些目录；
  `webglExploreRoute` 对 entry + render + rig + explore + buildgen + actor3d + meshopt +
  dressup 去重后执行 420 KiB 门。
- 城镇 UI / core：应用构建输出的 `explore-ui` 文件组执行 45 KiB 门；Worker 输出中
  `core-explore` / `core-shop` 入口的完整静态闭包分别执行 24 / 8 KiB 门，扣除
  session 已计文件；入口自身很小也不能漏掉拆出的共享依赖块。目录 / 入口尚无
  产物时以 0 KiB PASS；session 的模块闭包零例外禁止静态包含
  `world/explore/` 和 `economy/shop-`。
- buildgen Worker：Worker 构建输出 `.vite/buildgen-worker-size-groups.json`，登记入口及
  沿静态 import 可达的全部 JS 块；相对 session 去重后执行 24 KiB 门，不能只按
  `render-buildgen-worker-*` 文件名前缀计入口。Worker 尚未落地时为 0 KiB PASS。
- 首次会话：读取 Worker 构建生成的 `.vite/size-groups.json`，把 Worker 壳、
  `runtime/session.ts` 静态闭包和 `virtual:tianshu-content` 基础内容去重相加，
  对合计执行 110 KiB 门禁；任一组缺失时以 `SIZE_SESSION_GROUP_MISSING` 失败。
- 子系统：对话 / Ink、区域、战斗、城镇按源模块定位并报告相对首次会话的
  增量静态闭包，当前统一显示“未设门”，不会改变退出码。

`apps/game/build/size-groups-plugin.ts` 只读取 Rollup 输出块图并生成上述 JSON，
不改代码、分块或运行时产物。Basis、devtools、WebGPU、战斗 3D 与书界包尚无
产物时显示 `not emitted`，不得把它们并进入 entry 或首次会话闭包逃避门禁。
