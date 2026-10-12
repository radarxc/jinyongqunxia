# 本任务：城镇探索 v2 · P1 · 现有城镇页（v1）收尾——删模拟店铺与对话、交互条、经店员对话真实购买（小地图与缩放已由 ENG-town2-v1-minimap 接好）

**第一个动作**：读六份交接报告的第 3、7 节：`tools/agents/reports/ENG-town2-v1-minimap.md`（小地图与缩放已接好的部分）、`tools/agents/reports/ENG-town2-txminimap.md`（`TxMinimap` / `TxContextActions` 的 props、事件、底图规格）、`ENG-town2-actionmap.md`（ActionMap 语境注册 `useActionContext()`、`ZoomController`、v1 缩放换算位置）、`ENG-town2-heights.md`（页面怎么传 `playerHeightM`）、`ENG-town2-shop-wire.md`（`facility` 投影、`ShopLayer` 入口）、`ENG-town2-input-port.md`（输入层）。再打开 `apps/game/src/pages/TownPage.vue`（模拟银两 `1280` 约 L68、李文秀对话约 L93–141、40 ms 定时器约 L262、缩放滑杆约 L290–306、侧栏 `town-panel` 约 L312–343、店铺弹窗约 L394）与 `docs/tech/15-town-explore-v2-spec.md` §6.2–6.3、§7、§8；读完直接动手，不要先写计划。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`（页面只消费投影、发命令意图；寻路、可达、交互合法性与价格都在 core）。

## 背景
作者 AR-114（2026-10-10，逐字）：「小地图探索中，人物大小和建筑不匹配……右上方应该提供小地图，点击小地图可以自动寻路。缩放要支持键盘快捷键」「深入规划一下，小地图探索之前做的比较粗糙，需要全面升级。」作者拍板小地图**跟镜头转**（设置可改上北下南）。3D 古建（P2）上线前，先在现有城镇页（v1，45° 贴图）把能做的全部做好：删掉写死的模拟、接上真实的店铺流程、小地图点击寻路、缩放快捷键。人物按数据身高：**正确身高的人站在按真实尺寸画的建筑旁边会显得小，这是对的**，不要为了"看着合适"缩放主角。

## 要做的事
1. **删模拟**（tech/15 §7.4）：本地货品与银两 `1280`、开场即弹的李文秀对话、「市肆采买 / 与同行交谈 / 打开店铺」三个按钮与其弹窗、对话 article、40 ms `setInterval` 渲染兜底、对 `/img/li*.webp` 与 `/img/hero_cutout.png` 的引用、侧栏 `town-panel` 与 `town-help` 文字、页内统计行（挪开发面板，若开发面板没有现成位置就只删不挪并在报告说明）。验收：这些标识在 `apps/game/src/pages/TownPage.vue` 与 `apps/game/src/explore/**` 里 grep 为零。
2. **缩放**：已由 ENG-town2-v1-minimap 完成（读其报告第 3、7 节），本任务不重做；只确认删模拟后缩放键与滚轮仍正常。
3. **右上小地图**：已由 ENG-town2-v1-minimap 接好（v1 适配器 `apps/game/src/explore/v1-minimap.ts`）；本任务只把 `facility` 投影里的设施补成小地图标记（店名、设施类图标），点设施标记走到其入口格后可接交互条的「交谈」。
4. **交互条**：右下 `TxContextActions`，把锚点 + 设施（`facility` 投影）映射成 ≤ 3 个动词（交谈 / 进入 / 出城 / 打坐 / 查看），`F` / 空格 / 回车触发；对话中隐藏；店里「交谈」对象是设施店员 → 发 `town/interact` → 设施对话 → 「看看货」→ `ShopLayer`（shop-wire 已接）。
5. **身高**：已由 ENG-town2-heights / ENG-town2-v1-minimap 处理，本任务不改。
6. **测试**（`apps/game/src/pages/town-input.test.ts`、`apps/game/src/explore/*.test.ts`、`apps/game/src/settings.test.ts`，需 DOM 的文件首行 `// @vitest-environment happy-dom`）命名用例：
   - 模拟标识 grep 为零（读源码文本断言）。
   - 删模拟后缩放键与小地图点击寻路仍工作（复用 v1-minimap 的测试夹具做一条冒烟用例）。
   - 小地图上的设施标记来自 `facility` 投影（店名与图标），点击后走到入口格。
   - 经店员对话真实购买（复用 shop-wire 的全流程夹具，从页面交互条触发）。

## 约束
- 只写：`apps/game/src/pages/TownPage.vue`、`apps/game/src/pages/town-input.ts`（+ 测试）、`apps/game/src/explore/**`、`apps/game/src/settings.ts`（+ 测试）与本任务报告。
- 不改 `packages/**`、`App.vue`（全局键已由 actionmap 迁入）、`session*.ts`、`WorldMapPage.vue`、`worldmap/**`；不新增依赖。若必须改写集外文件，停在报告里说明原因与建议，不要自行扩大写集。
- 新界面文案放 `<组件>.strings.ts`（或 `apps/game/src/explore/*.strings.ts`）；样式用现有主题变量，不要黑底、不要粗框（AR-48）。
- 工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run apps/game/src --config vitest.config.ts --project node`
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`（含 `pnpm size` 里的应用构建）

## 报告
`tools/agents/reports/ENG-town2-v1-page.md`（≤ 60 行）：第 3 节列删除的模拟清单（每项 grep 结果）、缩放档与换算、小地图底图规格与生成耗时、交互条映射表；第 7 节写给协调者 G0 验收（5173 上的手动检查步骤）与 ENG-town2-explore-page（v2 页可复用的 `apps/game/src/explore/**` 模块）的交接。
