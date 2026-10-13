VERDICT: FAIL

## 逐项结论

- 写集：通过 —— 相对基点仅修改任务允许的 13 个文件，无素材或写集外改动。
- 主线程分块规则：通过 —— `battleModelLazyChunk(id) ?? dressupLazyChunk(id) ?? manualChunks(id)` 顺序正确，`includeDependenciesRecursively:false`；GLTFLoader、SkeletonUtils 仍归 `battle-model3d`。
- Worker 分块与实际构建产物：不通过 —— [content-plugin.ts](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-b1b-chunk/apps/game/build/content-plugin.ts:372) 在 `buildStart` 无条件 `emitFile('@tianshu/render/dressup')`，而 [vite.config.ts](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-b1b-chunk/apps/game/vite.config.ts:80) 也给 Worker 构建实例化了该插件。实际 `dist/assets` 因而额外生成 `render-dressup-VigI-hFg.js`：259,274 B 原始、68,428 B gzip，源码映射显示它包含 `three.core.js`、BufferGeometryUtils、SkeletonUtils、GLTFLoader 和 dressup runtime。该文件未被其他产物引用，是 Worker 构建误发射的孤儿入口，明显超过 24 KiB。
- 体积门：不通过 —— [check_size.mjs](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-b1b-chunk/tools/perf/check_size.mjs:253) 只从主 manifest 定位入口壳及其静态闭包，报告 `render-dressup 3.59/24 KiB`，没有发现上述 68,428 B gzip 的同名孤儿块。因此当前门禁存在漏检，不能证明实际发布产物满足 24 KiB 预算。
- 构建期素材发布：通过 —— 与 VFX 同层调用 `publishDressupAssets`；集成测试验证 candidate 的 file/fit/report 全部复制和登记，rejected 的三项均未进入 copied 集合。
- 入口与根导出：通过 —— `./dressup` 指向 `runtime.ts`；根入口只有六个 `export type`，没有静态导出运行时值。
- PWA：通过 —— `globIgnores` 已覆盖 `**/assets/render-dressup-*.js`；但这只能避免预缓存，不能弥补 Worker 孤儿块和体积门漏检。
- 性能门：通过 —— 100 actor × 4 件装备、120 帧预热、3×600 帧、best-of-3，显式执行 `actor.update()` 与 `skeleton.update()`；执行日志为 P95 `0.244/0.232/0.280 ms`，无负载跳过。
- 门禁执行：通过 —— 监督日志记录冻结安装、`pnpm check` 1308/1308、游戏构建及 `pnpm check:perf` 9/9 通过；本次只读审核的 Vitest复跑因沙箱禁止写 `node_modules/.vite-temp` 而未执行。
- 报告：不通过 —— [ENG-dressup-b1b-chunk.md](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-b1b-chunk/tools/agents/reports/ENG-dressup-b1b-chunk.md:17) 只报告 3.59 KiB 主 manifest 闭包，并声称无偏离，遗漏实际构建中的 68,428 B gzip Worker 副本。
- 禁区与既有阈值：通过 —— 未修改 B1a 源码、既有预算或性能阈值，也没有高负载跳过、骨骼缩放配对、固定颈环等禁区实现。

## 返修说明

1. 让 Worker 构建不执行 dressup 强制发射。可为 `gameContentPlugin` 增加显式选项，主构建保持开启，在 `worker.plugins` 的实例中关闭；不要依赖产物后清理。
2. 增加回归测试：关闭该选项时 `buildStart` 不调用 dressup `emitFile`，主构建仍严格发射该入口。
3. 加固尺寸门：若 `dist/assets` 存在不属于已定位 dressup 静态闭包的 `render-dressup-*.js`，必须 FAIL；补“孤儿同名前缀块即失败”夹具，避免门禁再次漏掉 Worker/多环境副本。
4. 重新构建后确认仅保留主 manifest 可达的入口壳和实现块，不再出现包含 Three 核心的孤儿副本；重新报告整个可达 dressup 闭包的 gzip 体积。
5. 重新运行冻结安装、`pnpm check`、游戏构建及 `pnpm check:perf`，并修正报告中的体积和分块结论。

## 需作者确认

无。