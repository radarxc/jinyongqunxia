# ENG-town2-txminimap 报告 · 城镇探索 v2 · P1 · 右上小地图 TxMinimap + 交互条 TxContextActions + 小地图数学
## 1. 摘要（3–6 行）
- 完成双 canvas `TxMinimap`、`TxContextActions`、纯数学与最小 2D painter；未修改 props、全局主题或入口导出。
- 覆盖跟镜头 / 上北下南、底图变换、路径 / 玩家 / 终点 / 视野 / 标记、点击寻路、悬停 300 ms、全城图与键盘可达性。
- 本任务定向 26/26、规定的根配置 UI 全套 45/45、typecheck / lint 均通过。
- 裸 `pnpm check` 全门禁通过；本轮以 `shallowRef` 修复同一 marker 内移动反复重启 dwell，并补回归。
## 2. 产出（文件、行数、主要章节）
- `packages/ui/src/explore/`：`minimap-math.ts` 79 行、`minimap-painter.ts` 156 行、测试 185 行。
- `packages/ui/src/components/explore/`：`TxMinimap.vue` 321 行、测试 196 行、strings 23 行；`TxContextActions.vue` 44 行、测试 27 行、strings 4 行。
- 新增代码与测试合计 1035 行；本报告不计。
- `pnpm install --frozen-lockfile`：通过；8 个 workspace，lockfile 已是最新且无变化。
- `pnpm exec vitest run packages/ui --config vitest.config.ts --project ui`：9 文件 / 45 测试通过；本任务定向 26 测试。
- scoped ESLint 与 `pnpm --filter @tianshu/ui typecheck`：通过。
- 裸 `pnpm check`：通过；199 文件 / 1446 测试，内容 1777 文件 / 1708 对象 / 2 Ink / 65 地图有效，构建和包体门均 PASS。
## 3. 关键结论与数值
- 坐标：世界 `+x=东、+z=南`；canvas 左上原点、`+y=下`；中心 `h=sizePx/2`。
- basis：`[rx,rz,ux,uz]` 分别是屏幕右 / 上在 XZ 的单位向量；北向上强制 `(1,0,0,-1)`。
- `px=h+dot(world-center,right)/mpp`，`py=h-dot(world-center,up)/mpp`；逆变换用 2×2 行列式，四偏航往返误差 `<1e-6`。
- 世界北 `(0,-1)` 的 canvas 角公式为 `atan2(uz,-rz)`；45/135/225/315° 均有测试。
- 鼠标 / 触屏命中半径为 44 / 60 CSS px；同距保留下标较小者；marker 缓冲只在容量不足时翻倍。
- painter 预热后 HeapProfiler 每窗 600 次重画，10 窗内须连续 3 窗零增长；本轮定向与全门禁采样均为 `0,0,0 B`。
- 与文档一致：UI 只发意图；绘制 props 精确 watch，hover 不重画；expanded 强制北向上；未引入依赖或全局变量。
- 同引用 basis 由无分配 RAF 四元素检测；内容变化时同轮刷新底图、标记层与指北针。
- 同引用 `viewQuad` 在同一 RAF 做八元素检测，任何朝向均生效；变化仅重画标记层，底图不重画。
- hover 用 `shallowRef` 保留 marker 原始引用；同一 marker 内连续移动不重复 hover、不重启 300 ms dwell。
- 保守默认：spec 无独立小地图比例 prop，视图 m/px 取 `base.metresPerPx`；`zoom` 仅向装配层发 `±1`。
## 4. 开放问题（附默认值）
- `package.json` 的 UI 包内 test 脚本仍不加载根 Vue plugin；本任务规定使用已通过的根 `vitest.config.ts --project ui`，默认后续单独修脚本。
- basis / viewQuad 原地写入均支持；装配层可复用 4 / 8 元素缓冲，并按文档 ≤10 Hz 更新。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；实现遵循 AR-48、AR-114 与 tech/15 §7.1–7.3。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `packages/ui/package.json` / scripts.test：加载根 Vue Vitest 配置（不在本任务写入范围）。
- `ENG-town2-v1-page`、`ENG-town2-explore-page`：按 §7 接入底图、render basis / quad 与 travel 命令。
## 7. 自检（验收标准 + 页面装配接入）
- ✅ 数学：两种朝向、四偏航往返 / 指北针、半径边界 / 平局；✅ painter 各图元与零分配。
- ✅ 交互：空地点、标记 target、触屏 60、expanded 北向、props 不变；dwell 在 `t=299 ms` 同 marker 再移动后仍于 `t=300 ms` 恰发一次，切 marker 才重计时。
- ✅ 可达性 / 样式：隐藏 focus 列表、Enter / Space、≥44 px、宣纸羽化、无黑底外框、文案归档、现有主题变量。
- ✅ 记录上下文验证 hover 0 次、原地 basis 两层各 1 次；原地 quad 仅标记层 1 次且新坐标生效。
- ✅ 冻结安装、规定 UI 命令 9 文件 / 45 测试、裸 `pnpm check` 199 文件 / 1446 测试均原样通过。
- 接入：调用方预分配 4 / 8 长 `Float32Array`，分别喂 `render.getCameraBasis(out)` / `getViewGroundQuad(out)`；两者均可同引用原地更新。
- 底图：传上北下南、左上对应 `(minX,minZ)` 的 bitmap，像素世界尺寸填 `metresPerPx`（约定生成值 0.25 m/px、≤640 px）。
- 事件：`travel(point|anchor|building)` 转 `world/travelTo`（v1 转 `town/move`）；`dwell` 转 `world/previewTravel`；`hover(null)` 清预览；其余接 M、ZoomController 与设置。
