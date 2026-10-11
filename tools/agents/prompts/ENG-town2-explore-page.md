# 本任务：城镇探索 v2 · 探索页 `ExplorePage.vue`（v2 城镇 + 遗迹，开关后）——按住走、点地 / 点人 / 点楼、Q/E、缩放、F、M、跟镜头转的小地图、交互条、店铺

**第一个动作**：读 `tools/agents/reports/ENG-town2-session-v2.md`、`ENG-town2-render-ports.md`、`ENG-town2-render-core.md`、`ENG-town2-v1-page.md`、`ENG-town2-actionmap.md`、`ENG-town2-shop-wire.md` 的第 7 节，再打开 `apps/game/src/pages/RegionPage.vue`（现有区域页，本页取代它渲染 v2 城镇与遗迹）、`apps/game/src/explore/**`（v1 页的小地图 / 缩放 / 交互条模块）、`apps/game/src/App.vue` 里页面路由与 `RegionPage` 的挂载处，以及 `docs/tech/15-town-explore-v2-spec.md` §6、§7；读完直接动手，不要先写计划。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`（页面只消费投影、发命令意图；寻路、可达、交互合法性、价格与"是否在屋内"都由 core 决定）。

## 背景
作者 AR-114（2026-10-10，逐字）：「小地图探索中，人物大小和建筑不匹配，希望用threejs做一个能进入建筑的游戏体验。同时，采买这些都在建筑里进行（搭配NPC对话）。右上方应该提供小地图，点击小地图可以自动寻路。缩放要支持键盘快捷键」。作者拍板：Q/E 四向转镜头；小地图跟镜头转（设置可改上北下南）。本任务做 v2 的完整页面：从大地图进城 → 在城门内出生 → 走路（按住 WASD、点地、点小地图）→ 走进药铺（屋顶与朝镜头的墙剖开，由 core 投影 `insideBuildingId` 驱动）→ 点掌柜交谈 → 看看货 → 买 → 出城。建筑与人物先用 render 的占位端口，正式 3D 古建与人物在试点整合时换端口。

## 要做的事
1. **`apps/game/src/pages/ExplorePage.vue`**（v2 城镇与遗迹共用；`townEngine = v2` 且挂载的是区域场景时由 App 路由到本页，v1 城仍走 `TownPage`，非城镇遗迹的 `RegionPage` 行为在开关为 v1 时不变）：
   - 输入：ActionMap `explore` 语境——按住 WASD / 方向键 → 屏幕向量 → `screenVectorToHexDir(v, cameraBasis)` → `world/steer`（只在方向变化时发、转镜头后重发、松开发 `null`）；点地 → `world/travelTo { hex }`；点人 → `travelTo { anchor, thenInteract: true }`；点楼 → `travelTo { building }`；画布右键 → `world/stop`；Q/E 转镜头（`allowRotation = false` 时弹提示）；`+ / - / 0` 与滚轮 / 捏合缩放（`ZoomController`，室内缺省 96、街巷 80）；F / 空格 / 回车交互；M 全城图；Esc 先关最上层。
   - 场景：`render.setWalk(walk, worldTickAtMs)`、`setInsideBuilding(insideBuildingId 对应的单元号)`、`setPreviewPath`（悬停节流 8 Hz 调 `previewTravel`）、`setDestination`；读 `getCameraBasis / getViewGroundQuad` 给小地图（每帧写进预分配数组，不分配）。
   - 小地图 v2 适配器 `apps/game/src/explore/v2-minimap.ts`：底图在挂载后空闲回调里生成一次（chunk `surface / blocked / building` 层 + 方案占地按设施类着色，0.25 m/px、≤ 640 px）；跟镜头转（`basis`）或上北下南（设置 `minimapNorthUp`）；点空地 → `travelTo { hex }`，点标记 → 走到建筑 / 人；悬停 > 300 ms 预览路线。
   - 交互条：投影 `interactables`（≤ 8）取前 ≤ 3 个映射成动词（交谈 / 进入 / 出城 / 打坐 / 查看 / 打开），对话中隐藏。
   - 顶栏中部显示时辰 · 地点（室内显示店名）· 银两；店铺沿用 `ShopLayer`；全城图 / 店铺 / 菜单打开时经 `setSceneRunsWorldTicks` 暂停世界 tick。
2. **App 路由**（`App.vue`）：只加 ExplorePage 的路由分支与懒加载（`explore-ui` 尺寸组，按 chunks 任务的分组规则），其他行不动。

## 测试（`apps/game/src/pages/ExplorePage.test.ts`、`apps/game/src/explore/*.test.ts`，需 DOM 的首行 `// @vitest-environment happy-dom`）
命名用例：
- **脚本流程**：`?town=v2` 新档 → 进大理 v2 → 出生在南门内 → 点药铺 → 走到门口（若干 tick）→ 进屋（`insideBuildingId` 变化、场景收到 `setInsideBuilding`）→ 点掌柜（`thenInteract`）→ 对话推进「看看货」→ 买一件 → 走出 → 点城门出城 → 回到大地图节点。
- 按住 W 只发一次 `steer`、松开发 `steer null`；按住时按 Q 转镜头后重发一次新方向；输入框聚焦时不响应。
- 小地图：跟镜头转与上北下南两种设置下，点同一屏幕点发出的世界格不同且都与 `minimapToWorld` 一致；点设施标记发 `travelTo { building }`。
- 缩放：进屋自动切到 96、出屋回 80；手动缩放后保持到语境变化。
- 页面不含任何寻路 / 价格 / 可达计算（grep `findPath`、`astar`、`round10` 等为零）。

## 约束
- 只写：`apps/game/src/pages/ExplorePage.vue`、`apps/game/src/pages/ExplorePage.test.ts`、`apps/game/src/pages/ExplorePage.strings.ts`、`apps/game/src/explore/**`（v1 页已有模块只做向后兼容的扩充）、`apps/game/src/App.vue`（只加路由分支）与本任务报告。
- 不改 `packages/**`、`runtime/**`（会话接口不够用时写进报告第 7 节）、`TownPage.vue`、`RegionPage.vue`、`WorldMapPage.vue`；不新增依赖。样式用现有主题变量，不要黑底、不要粗框（AR-48）。
- 工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run apps/game/src --config vitest.config.ts --project node`
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`（含 `pnpm size`：`explore-ui` 尺寸组 ≤ 45 KiB gzip）

## 报告
`tools/agents/reports/ENG-town2-explore-page.md`（≤ 60 行）：第 3 节列输入映射表、页面订阅的投影字段、小地图底图规格与生成耗时、`explore-ui` 尺寸；第 7 节写给试点整合（换正式建筑层 / 人物端口的位置、要截图验收的路线）与闸门 C（作者实玩步骤）的交接。
