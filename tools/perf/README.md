# 性能预算

`pnpm check:perf` 包含 rig 角色 CPU、BattleSession 2000 步线性、20 回合自动战斗单次 ≤ 20 ms、事务总线提交 2000 步 ≤ 2000 ms，以及 fake-indexeddb 1 MiB 快照读取 / 写入各 < 50 ms 六项门禁；它们依赖墙钟计时、易受整机负载干扰，按 AR-33 / AR-64 在低负载时单独运行而不进入日常 `pnpm check`，断言与阈值均不放宽。

`budgets.json` 镜像 `docs/tech/01-architecture.md` §5.4，并增加协调者待作者确认的
首次会话闭包 110 KiB gzip 门禁。`tools/perf/check_size.mjs` 在 Vite 构建后逐项计算
gzip 字节并阻断超限，输出分为三层：

- 标题页 entry：沿 `.vite/manifest.json` 的唯一页面入口追踪静态闭包，继续使用
  170 KiB 预算；render、WebGL/WebGPU total 与其余既有预算保持不变。
- 首次会话：读取 Worker 构建生成的 `.vite/size-groups.json`，把 Worker 壳、
  `runtime/session.ts` 静态闭包和 `virtual:tianshu-content` 基础内容去重相加，
  对合计执行 110 KiB 门禁；任一组缺失时以 `SIZE_SESSION_GROUP_MISSING` 失败。
- 子系统：对话 / Ink、区域、战斗、城镇按源模块定位并报告相对首次会话的
  增量静态闭包，当前统一显示“未设门”，不会改变退出码。

`apps/game/build/size-groups-plugin.ts` 只读取 Rollup 输出块图并生成上述 JSON，
不改代码、分块或运行时产物。Basis、devtools、WebGPU 与书界包尚无产物时显示
`not emitted`，不得把它们并进入 entry 或首次会话闭包逃避门禁。
