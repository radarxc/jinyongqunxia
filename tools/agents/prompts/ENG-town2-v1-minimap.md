# 本任务：城镇探索 v2 · P1 · 现有城镇页（v1）先接上新小地图与缩放快捷键——右上 `TxMinimap`（点击寻路、跟镜头转 / 上北下南、M 全城图）、`=`/`-`/`0` 与滚轮缩放档位、按性别身高

**第一个动作**：读 `tools/agents/reports/ENG-town2-txminimap.md`（第 3 节数学约定、第 7 节接入说明：底图规格、`basis` / `viewQuad` 预分配数组、`travel` / `dwell` / `hover` 事件）、`ENG-town2-actionmap.md`（`useActionContext()`、explore 语境、`ZoomController`、v1 缩放换算放哪）、`ENG-town2-heights.md`（页面怎么传 `playerHeightM`）的第 3、7 节；再打开 `apps/game/src/pages/TownPage.vue`（缩放 `ref(2.2)` 约 L18、`createTownScene` 约 L244、`setZoom` 约 L291、滑杆与帮助文字约 L306–308）、`packages/render/src/town/{scene,types}.ts`（v1 城镇场景：`setZoom`、`pickPoint`、`project`、固定 yaw 45° / pitch 30°）与 `docs/tech/15-town-explore-v2-spec.md` §6.2–6.3、§7.1–7.2、§8；读完直接动手，不要先写计划。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`（页面只消费投影、发命令意图；寻路与可达由 core 判定，页面不算路径）。

## 背景
作者 AR-114（2026-10-10，逐字）：「右上方应该提供小地图，点击小地图可以自动寻路。缩放要支持键盘快捷键」；作者拍板小地图**跟镜头转**（设置可改上北下南）。作者 10-11 又说「现在小地图还是老的」——新小地图组件 `TxMinimap` 已经做好，但还没接进城镇页。本任务**先把看得见的部分接进现有城镇页**（v1，45° 贴图城镇），尽快并主干让作者在 5173 上看到；删模拟店铺、交互条、经店员对话真实购买留给后面的 ENG-town2-v1-page。人物按数据身高：**正确身高的人站在按真实尺寸画的建筑旁会显得小，这是对的**，不要为了"看着合适"缩放主角。

## 要做的事
1. **右上小地图**（v1 适配器 `apps/game/src/explore/v1-minimap.ts` + 在 `TownPage.vue` 挂 `TxMinimap`，深路径 `@tianshu/ui/components/explore/TxMinimap.vue`）：
   - 底图：挂载后在空闲回调（`requestIdleCallback`，不支持时 `setTimeout`）里**生成一次**：用城镇投影里的地面（`groundRuns` 或同等数据）与建筑占地，按街道 / 院落 / 建筑 / 水面着色，设施建筑（店、客栈、药铺等，按建筑类型）用醒目色；0.25 m/px、长边 ≤ 640 px；上北下南，左上角对应 `(minX, minZ)`。生成函数是纯函数（输入投影、输出像素数组或 canvas），可在 Node 测试。
   - 跟镜头转：v1 城镇镜头固定 yaw 45° / pitch 30°，`basis` 由 45° 算出（纯数学，写在适配器里）；设置 `minimapNorthUp`（`apps/game/src/settings.ts`，缺省 `false` = 跟镜头转）为真时传 `northUp`。
   - 玩家箭头、路径、终点来自投影；视野四边形用场景的 `pickPoint` 取画布四角落地点（拾取不到的角用相邻角外推，取不到就传 `null`），每帧写进预分配的 8 长 `Float32Array`，不分配。
   - 点空地 → 换算成 v1 城镇格 → 发 `town/move`（core 判可达，页面不判）；点建筑 / 设施标记 → 走到其入口格；悬停显示名称与直线距离；`M` 展开全城图（上北下南、图例、设施列表可点、Esc 关闭）。
2. **缩放**：ActionMap 的 explore 语境 + `ZoomController`：`=`（含 Shift 即 `+`）/ 小键盘 + 放大一档，`-` / 小键盘 − 缩小一档，`0` / 小键盘 0 复位（街巷 80）；滚轮与触控板捏合在 40–112 连续（捏合按手势接：平台 `createPointerGestures` 的 `onPinchStart` → `zoom.pinchStart()`、`onPinch` → `zoom.pinch(scale)`、`onPinchEnd` → `zoom.pinchEnd()`，同一手势内比例相对起点）；带 Ctrl / Meta / Alt 不拦截（保留浏览器缩放）；输入框 / 输入法组字时不响应。px/m 档位换算成 v1 `setZoom` 比例的函数放 `apps/game/src/explore/v1-zoom.ts`（退役即删）。**删掉旧滑杆**，小地图外圈的 `+` / `−` 接同一个 `ZoomController`。
3. **身高**：主角按性别传 `playerHeightM`（取 `packages/render/src/actors/heights.ts` 的缺省表，不写死数字；若 heights 任务已在页面里传了，就保持）。
4. **帮助文字**：删掉 `town-help`（"点击地面寻路 · …"），快捷键提示改由小地图外圈与 ActionMap 的提示负责。

## 测试（`apps/game/src/explore/*.test.ts`、`apps/game/src/pages/town-input.test.ts`、`apps/game/src/settings.test.ts`；需要 DOM 的文件首行 `// @vitest-environment happy-dom`，照 `apps/game/src/battle/BattlePage.test.ts`）
命名用例：
- 底图生成：小夹具城镇的像素颜色（街道 / 建筑 / 设施 / 水面）、尺寸与 `metresPerPx`；同输入两次逐字节相同。
- 45° `basis` 为单位正交向量；跟镜头转与上北下南两种设置下，点同一画布点得到的世界点都与 `minimapToWorld` 一致，且换算到 v1 格后派发 `town/move { destination }`。
- 点设施标记 → 派发走向其入口格的 `town/move`；`M` 打开 / Esc 关闭全城图。
- 缩放：`=`、Shift+`=`、小键盘 + 各放大一档；`-` 缩小；`0` 复位到 80；Ctrl+`=` 不拦截；输入框聚焦时不响应；滚轮 deltaMode 0 / 1 连续缩放并夹到 40–112；v1 换算在 48 / 64 / 80 / 96 四档的比例。
- 设置 `minimapNorthUp` 读写与缺省值。
- 页面里没有路径 / 可达计算（grep `findPath`、`astar` 为零）；旧滑杆与 `town-help` 的标识 grep 为零。

## 约束
- 只写：`apps/game/src/pages/TownPage.vue`、`apps/game/src/pages/town-input.ts`（+ 测试）、`apps/game/src/explore/**`、`apps/game/src/settings.ts`（+ 测试）与本任务报告。
- 不改 `packages/**`（render 接口不够用时写进报告第 7 节）、`App.vue`、`session*.ts`、`WorldMapPage.vue`、`worldmap/**`；不动页面里的模拟店铺与对话（留给 ENG-town2-v1-page）；不新增依赖。
- 新界面文案放 `apps/game/src/explore/*.strings.ts`；样式用现有主题变量，不要黑底、不要粗框（AR-48）。
- 工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run apps/game/src --config vitest.config.ts --project node`
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`（含 `pnpm size` 里的应用构建）

## 报告
`tools/agents/reports/ENG-town2-v1-minimap.md`（≤ 50 行）：第 3 节列底图规格与生成耗时、`basis` 数值、缩放档与 v1 换算表、点击换算规则；第 7 节写给协调者（5173 上的手动检查步骤：进大理城 → 右上小地图 → 点空地走过去 → `=`/`-`/`0` 与滚轮缩放 → M 全城图 → 设置里切上北下南）与 ENG-town2-v1-page（交互条与店铺接在哪里）的交接。
