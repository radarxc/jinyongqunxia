# ENG-08b-worldmap-page 报告 · 游戏工程 · 小修：大地图页挂载竞态与投影瘦身（审计 H3、M1）
## 1. 摘要（3–6 行）
- `WorldMapPage` 已在动态导入、场景创建和 actor 初始化三个异步边界后检查卸载状态，迟到场景立即释放。
- 大地图静态几何拆为 `worldmapStatic`，常规步进的 `worldmap` 只传位置、行程与可达集。
- 可达集按地图对象及位置所在连通分量缓存，未改变道路、里程、排序或可达结果。
- 新增 5 个聚焦用例；安装、全量检查、core/game 测试、game 构建与严格 ID 门禁全部通过。
## 2. 产出（文件、行数、主要章节）
- 页面与投影：`WorldMapPage.vue` 178 行，`projection.ts` 116 行；生命周期守卫、静态几何消费、窄步进补丁。
- 契约与会话：`runtime/contracts.ts` 50 行，`runtime/session.ts` 198 行，core `worldmap-state.ts` 151 行、`worldmap-types.ts` 64 行，UI 类型 130 行。
- 测试：`worldmap-page.test.ts` 101 行（2 例），`worldmap-projection.test.ts` 83 行（3 例）。
## 3. 关键结论与数值
- 改前 `worldmap={map,mapTextureUrl,point,reachableNodeIds,positionNodeId,journey,scene,law,lastMessage}`；改后静态为 `worldmapStatic={map,mapTextureUrl}`，普通 step 为 `worldmap={point,journey,reachableNodeIds}`，场景/遭遇/城门终态仍发完整动态状态。
- ch01 为 201 节点、90 路；改前实测 10 步共 1,291,748 B，改后 35,988 B，减少 `1,291,748-35,988=1,255,760 B`，即 97.2%；一次性静态投影当前为 143,754 B。
- 缓存为 `WeakMap<WorldMapRuntimeDefinition, Map<nodeId, sortedIds>>`；同一连通分量各位置复用同一只读数组，路上位置以当前 leg 的 `from` 查找。
## 4. 开放问题（附默认值）
- 真浏览器快速切页与 GPU 上下文回收仍待实测；默认以 happy-dom 生命周期回归和现有 `dispose()` 契约作为本任务门禁。
- `renderer.forceContextLoss()` 按任务边界留给 ENG-21b，本任务未改 `packages/render/**`。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；本次仅修复实现竞态与传输开销，不改变玩法规则。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `apps/game/CLAUDE.md` / 投影边界：后续登记 `worldmapStatic` 一次性几何与三字段步进补丁契约。
- ENG-21b / WebGL 释放：保留大地图 renderer 的 `forceContextLoss()` 工作项。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ H3：三个 `await` 后均有守卫；两例分别覆盖创建迟到和 actor 初始化迟到，均断言只释放一次、无 observer、无 rAF。
- ✅ M1：静态/动态形状及十步字节见 §3；测试逐步核对三字段、可达结果、完整 query 与终点完整投影。
- ✅ 缓存：按地图弱引用、按位置节点命中并复用连通分量数组；core 无 DOM、墙钟或浮点新增。
- ✅ 门禁：`pnpm install --frozen-lockfile`；`pnpm check`（105 文件/624 例）；core（38/349）、game（19/60）、game build（293 modules）、严格 ID 均退出 0；无覆盖率卡口，统计按规范跳过。
- ✅ 写集：仅修改许可路径；未改 render、依赖、锁文件、门禁阈值或寻路/里程规则；`git diff --check` 通过。
- ✅ 技术核实（访问 2026-10-02）：[ResizeObserver.disconnect](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)、[cancelAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/cancelAnimationFrame)。
