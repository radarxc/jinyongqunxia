# 性能预算

`budgets.json` 镜像 `docs/tech/01-architecture.md` §5.4。`tools/perf/check_size.mjs`
在 Vite 构建后按 manifest 追踪入口与懒加载渲染依赖，逐项计算 gzip 字节并阻断超限。
Basis、devtools、WebGPU 与书界包尚无产物时显示 `not emitted`，不得把它们并进入 entry 逃避门禁。
