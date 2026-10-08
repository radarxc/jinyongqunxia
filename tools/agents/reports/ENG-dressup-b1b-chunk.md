# ENG-dressup-b1b-chunk 报告 · 3D 纸娃娃换装 · B1b · 换装运行时独立懒加载块 render-dressup、体积预算、构建期发布接线与性能门
## 1. 摘要（3–6 行）
- 完成 `render-dressup` 独立动态入口、24 KiB gzip 硬门与 PWA 首装排除，render 主块保持 166.66 KiB、净增长 0。
- 返修后 Worker 显式关闭 dressup 强制发射；尺寸门会拒绝 manifest 可达闭包外的同名前缀 JS。
- 构建期已与 VFX 同层发布 non-rejected 换装 `file / fit / report`，rejected 不复制；按需素材不进入离线全量闭包。
- 根入口仅 type export；运行时只允许 `await import('@tianshu/render/dressup')`。
- 冻结安装、`pnpm check`、游戏构建及完整 `pnpm check:perf` 均实际退出 0。
## 2. 产出（文件、行数、主要章节）
- `apps/game/build/`：`content-plugin.ts` 404 行、测试 187 行；主构建发射、Worker 禁发射、分块、VFX+换装发布及集成断言。
- `apps/game/vite.config.ts` 108 行：忽略 `render-dressup-*`；`packages/render/{package.json,src/index.ts,CLAUDE.md}`：子路径导出、根 type-only API、懒加载约定。
- `packages/render/src/dressup/performance.test.ts` 162 行：100 actor × 4 件，120 帧预热、3×600 帧、best-of-3 P95 `<2.0 ms`。
- `tools/perf/{budgets.json,check_size.mjs,check_size.test.mjs}`：24 KiB 预算，缺块/超限 fail-closed，扣除 render 与 battle-model3d 已计闭包。
- `vitest.config.ts` / 根 `package.json`：性能项只进 perf project 与 `test:perf`，不进普通 `test` / `pnpm check`。
- 实跑：冻结安装通过；`pnpm check` 183/183 files、1309/1309 tests；`pnpm --filter ./apps/game build` 通过；`pnpm check:perf` 5/5 files、9/9 tests。
- 环境：Node 22.22.1、pnpm 9.15.9；与任务附加规则的 Node≥24/pnpm12 不同，但符合仓库当前 engines/packageManager，未越权改锁文件或工具链。
## 3. 关键结论与数值
- 与文档一致：分块优先级 `battleModelLazyChunk ?? dressupLazyChunk ?? manualChunks`，`includeDependenciesRecursively:false`；GLTFLoader/SkeletonUtils 仍属 `battle-model3d`，无其他 examples 附件。
- 与文档一致：体积前→后为 render `166.66→166.66/180 KiB`、battle-model3d `17.62→17.63/24 KiB`；新增 dressup 可达闭包 `3.59/24 KiB`。
- 构建仅有可达入口壳 `0.09 KiB` 与实现 `3.50 KiB`；Worker 的 `68,428 B gzip` 孤儿副本已消失，闭包外同名前缀文件集合为空。
- 分块断言覆盖主构建 strict 发射、Worker 禁发射、优先级及 GLTFLoader 归属；尺寸夹具另覆盖孤儿同名前缀块 fail-closed。
- 发布断言验证 candidate 的 file/fit/report 全复制且登记引用，rejected 三件均跳过；真实构建 `sw.js` 不含 `render-dressup-`。
- 性能实测三轮 P95 `0.357/0.400/0.572 ms`，best `0.357 ms < 2.0 ms`；loadavg `8.21/9.54/9.96`，12 CPU，无负载跳过。
- 偏离：无规格/API/阈值偏离；为不放宽既有 8 MiB 离线单文件门，已发布的 dressup 按需素材不写入离线 copied-assets 闭包。
## 4. 开放问题（附默认值）
- 默认 dressup 素材保持联网按需读取；C1 若将所有单文件压到既有离线门内，再决定是否纳入离线闭包。
- 默认继续使用仓库锁定的 Node 22 / pnpm 9；由协调者另行统一升级，不在本任务修改 packageManager/lockfile。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；未改既有预算、性能阈值或 API 契约。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `docs/tech/11-paper-doll-3d-impl-spec.md` §9：后续维护时记录 B2 引用前即发射可计量 chunk，以及 dressup 大素材默认不进离线全量闭包。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 分块/入口：独立 `render-dressup`，根入口无运行时值；PWA 不预缓存该 JS。
- ✅ 发布：non-rejected 三联文件复制，rejected 跳过；9.60 MB 正本未靠放宽 8 MiB 门过关。
- ✅ 体积：`pnpm size` 为 `render-dressup 3.59/24 PASS`，仅两块且均可达，render 主块增长 0；孤儿夹具硬失败。
- ✅ 性能：完整 `pnpm check:perf` 通过；换装 P95 0.357 ms，无高负载条件分支。
- ✅ 验收：冻结安装、完整 check、游戏 build、diff whitespace 检查均通过；只改允许路径。
- ✅ 给 B2：页面必须 `const { createDressupActor } = await import('@tianshu/render/dressup')`，再消费 actor 的 root/equip/unequip/playClip/update/stats/dispose。
- ✅ 给 C1：每个 non-rejected manifest 的 `file / fit / report` 会按原相对路径发布；garment/hair 提供 hideRegions/neverHide，prop 提供 socket，拒绝项不会进入 public。
