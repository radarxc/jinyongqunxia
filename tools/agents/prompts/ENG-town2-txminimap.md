# 本任务：城镇探索 v2 · P1 · 右上小地图 `TxMinimap` + 交互条 `TxContextActions` + 小地图数学

**第一个动作**：打开 `docs/tech/15-town-explore-v2-spec.md` §7.1–7.3 与 `packages/ui/src/components/TxHud.vue`（看现有组件写法、主题变量与测试方式），读完直接动手；不要先写计划，改完一处就跑对应测试。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`（ui 只消费投影、发意图；热路径不分配）。

## 背景
作者 AR-114（2026-10-10，逐字）：「右上方应该提供小地图，点击小地图可以自动寻路。」作者拍板：小地图**跟镜头转**（上方 = 屏幕上方，角上指北针；设置可改上北下南）。本任务只做 `packages/ui` 里的通用组件与纯数学；底图生成、与 core 的 `travelTo` 对接、页面装配是后续任务（ENG-town2-v1-page / ENG-town2-explore-page）。

## 要做的事
1. **`packages/ui/src/explore/minimap-math.ts`**（纯函数，零 DOM，零分配：结果写进调用方给的 `out`）：
   - `MinimapView = { centerX, centerZ, metresPerPx, sizePx, northUp: boolean, basis: Float32Array | null }`。`basis` = `[rightX, rightZ, upX, upZ]`，是 render 给的屏幕右 / 屏幕上在地面（XZ，x 东、z 南）上的单位向量；`northUp` 为真时忽略 `basis`，固定右 = 东（+x）、上 = 北（−z）。
   - `worldToMinimap(x, z, view, out: Float32Array /* [px, py] */)` 与 `minimapToWorld(px, py, view, out /* [x, z] */)`：互为逆运算，画布原点在左上、y 向下，中心 = `sizePx/2`。
   - `compassAngleRad(view)`：指北针在画布上应指向的角度（世界北 −z 在小地图上的方向）。
   - `hitMarker(px, py, markersXY: Float32Array, count, radiusPx): number`：返回最近且在半径内的标记下标，没有则 −1；同距离取下标小者。
2. **`packages/ui/src/components/explore/TxMinimap.vue`**：props / emits 严格按 spec §7.2（`base`、`player`、`basis`、`viewQuad`、`markers`、`path`、`destination`、`northUp`、`expanded`、`sizePx`；emits `travel`、`toggleExpanded`、`zoom(±1)`、`toggleNorthUp`），另加 `hover(target | null)` 与 `dwell(target)`（悬停 > 300 ms，用于路线预览）。
   - 两张 canvas：底图层（`base.bitmap` 按 view 变换绘制，只在 view 变化时重画）与标记层（玩家箭头随 `headingRad`、路径折线、终点旗、视野四边形、各类标记图标）；标记层只在 props 变化或 `basis` 变化时重画（调用方 ≤ 10 Hz），**重画零分配**（预分配 `Float32Array` 缓冲，按 `markers.length` 扩容时一次性加倍）。
   - 绘制逻辑放 `packages/ui/src/explore/minimap-painter.ts`：接收一个最小的 2D 上下文接口（`beginPath/moveTo/lineTo/arc/fill/stroke/drawImage/setTransform/save/restore/fillText` 与样式属性），组件里传真实 `CanvasRenderingContext2D`；happy-dom 下 `getContext` 可能为 null，组件要安全跳过绘制，测试直接用记录型假上下文测 painter。
   - 点击：命中标记 → `travel(marker.target)`；否则 → `travel({ kind: 'point', x, z })`（世界米）。命中半径：鼠标 44 px、触屏（`pointerType === 'touch'`）60 px。
   - 外圈：指北针（按 `compassAngleRad`）、`+` / `−`（发 `zoom`）、展开按钮（发 `toggleExpanded`，提示键 M）、朝向切换（发 `toggleNorthUp`）。
   - `expanded = true` 时为全城图样式：强制上北下南、尺寸放大到容器宽高的较小值、右侧显示图例与可点击的设施列表（列表项回车即 `travel`）。
   - 可达性：标记同时渲染为隐藏的可聚焦列表（`role="list"`，回车 / 空格 → `travel`）；每个可点元素 ≥ 44×44 CSS px。
   - 样式：宣纸墨晕圆盘、羽化边缘，**不要黑底、不要框**（AR-48）；颜色用 `packages/ui/src/theme.css` 已有变量，不新增全局变量。
3. **`packages/ui/src/components/explore/TxContextActions.vue`**：入参 `actions: { id, verb, label, enabled, reason, hotkey }[]`（≤ 3 个，按顺序），发 `act(id)`；禁用项显示 `reason`；`hotkey` 显示成键帽（如 F）；对话中由调用方隐藏，组件不判断。
4. **文案** 放 `packages/ui/src/components/explore/TxMinimap.strings.ts`、`TxContextActions.strings.ts`（不改 `packages/ui/src/i18n.ts`）。
5. **测试**（`packages/ui/src/explore/*.test.ts` 与 `packages/ui/src/components/explore/*.test.ts`，ui 项目 happy-dom）命名用例至少：两种朝向下 world ↔ minimap 往返误差 < 1e-6（四个偏航的 basis 各一组：45° / 135° / 225° / 315°，basis 由偏航角算出写在测试里）；四个偏航下指北针角度；`hitMarker` 半径边界与同距平局；点击空地发出的世界点与 `minimapToWorld` 一致；点击标记发 `marker.target`；触屏命中半径 60；`dwell` 在 300 ms 后才发（用假定时器）；`expanded` 时强制北向上；painter 在记录型假上下文上画出玩家箭头 / 路径 / 终点 / 视野四边形；**painter 重画零分配**（照 `packages/render/src/dressup/actor-runtime.test.ts` 的 `node:inspector/promises` HeapProfiler 采样做法：预热后连续窗口采样字节不增长）；组件不修改 props。

## 约束
- 只写：`packages/ui/src/components/explore/{TxMinimap*,TxContextActions*}`、`packages/ui/src/explore/**` 与本任务报告。不改 `packages/ui/src/index.ts`（调用方用 `@tianshu/ui/components/explore/TxMinimap.vue` 深路径导入，`package.json` 已有 `./components/*` 导出）。
- 不新增依赖（不要 three，不要 fast-check）；工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 里的 Node 24 / pnpm 12 / fast-check 不适用；随机用例用测试内固定种子 mulberry32。
- 不改门禁阈值；不加"高负载跳过"。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run packages/ui --config vitest.config.ts --project ui`（包内 `pnpm --filter @tianshu/ui test` 缺 Vue 插件跑不通，用根配置的 ui 项目）
- `pnpm check`

## 报告
`tools/agents/reports/ENG-town2-txminimap.md`（≤ 60 行）：第 3 节写数学约定（坐标系、basis 定义、指北针角公式）与零分配测试的采样结果；第 7 节写给页面装配任务的接入说明（props 从哪来：`render.getCameraBasis()` / `getViewGroundQuad()`、底图 bitmap 规格、事件怎么接 `world/travelTo`）。
