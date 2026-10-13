# 本任务：城镇探索 v2 · P1 · 店铺接线——会话层 `shop/query` 与买卖命令、`shop/open` → `ShopLayer`、银两挪到顶栏、城镇投影挪进 `explore-projection.ts`

**第一个动作**：读四份交接报告的第 3、7 节：`tools/agents/reports/ENG-town2-shop-core.md`（`queryShop` 与 `ShopView`、每次交易后重查）、`ENG-town2-dialogue-facility.md`（`shop/open` 呈现步在哪个投影字段、`interlocutor` 名字从哪取）、`ENG-town2-txshop.md`（`ShopPanelView` 与 `ShopView` 的映射、事件载荷）、`DES-town2-pilot-content.md`（三城设施表与测试向量）。再打开 `apps/game/src/runtime/{session,contracts}.ts`、`apps/game/src/game-controller.ts`、`apps/game/src/App.vue`（银两显示约 L290、L393；`DialogueLayer` 约 L513）、`apps/game/src/pages/DialogueLayer.vue` 与 `apps/game/src/flow/presentation.ts`；读完直接动手，不要先写计划。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`（ui / app 只消费投影、发命令意图，不算价格、不改钱；apps/game 不得成为第二个规则层）。

## 背景
作者 AR-114（2026-10-10，逐字）：「同时，采买这些都在建筑里进行（搭配NPC对话）。」core 已能结算 `shop/buy | sell`（shop-core），对话里「看看货」会产生呈现步 `{ op: 'shop/open', shopKey }`（dialogue-facility），`TxShop` 组件已就绪（txshop），试点城的店铺与货单已在内容里（pilot-content）。本任务把它们接成一条完整流程：大理 v1 城镇 → 进药铺 → 点掌柜交谈 →「看看货」→ 店铺界面 → 买金创药，银两与背包变化全部来自 core。

## 要做的事
1. **会话层**（`apps/game/src/runtime/session.ts`、`contracts.ts`）：
   - 只读查询 `shop/query { shopKey } → ShopView`（与现有 `world/previewRegionPath` 同类的会话级只读查询；Worker 与主线程两条宿主路径都要支持，走 core 懒加载族 `@tianshu/core/shop-command`，不进 session 静态闭包）。
   - `shop/buy | sell` 命令照常经 `dispatch` 走 core；脏视图 `['hud', 'inventory']`。
2. **城镇投影挪家**：新建 `apps/game/src/runtime/explore-projection.ts`，把会话投影里城镇（v1）相关的拼装挪进来（含新增的设施信息：当前所在设施 `facility { key, kind, nameKey, shopKey } | null`），`session.ts` 只调用它；**不改** `session-projection.ts`（大地图线在用），如需从那里取数，只读调用。
   - **协调者 10-11 r1 裁定**：`session-projection.ts` 是大地图线并行在改的文件，本任务不改它；所以 v1 城镇投影暂时仍由它计算，`explore-projection.ts` **只在其结果上增补** `facility` / 店铺 / 暂停相关字段，不得再调用 `projectTown()` 重算或覆盖已有字段（杜绝双算）。报告第 4 节登记「v1 城镇投影整体迁出留给 ENG-town2-session-v2」。
3. **`ShopLayer.vue`**（`apps/game/src/pages/ShopLayer.vue`，App 层，与 `DialogueLayer` 同级）：
   - 收到 `shop/open` 呈现步时打开：先关对话层，`shop/query` 取 `ShopView` → 映射成 `ShopPanelView`（名称、图标、品阶从物品表投影取；金额全部用 core 给的单价）→ 渲染 `TxShop`（深路径 `@tianshu/ui/components/explore/TxShop.vue`）。
   - `buy / sell` 事件 → 发 `shop/buy | sell { shopKey, itemId, count, expectedUnitPrice }`；等回复期间 `busy = true`；**每次回复后重查**（成功与拒绝都重查），拒绝码映射成一行提示（`SHOP_PRICE_STALE` 提示"价钱变了，请再看一眼"等，文案放 `ShopLayer.strings.ts`）。
   - `close` / Esc → 关闭；打开期间经现有 `setSceneRunsWorldTicks` 暂停世界 tick，关闭恢复。
4. **银两挪顶栏**（`App.vue` + `style.css`）：把右上的银两显示挪到顶栏中部「时辰 · 地点 · 银两」（tech/15 §7.1；格式沿用 `formatWen` 的「两 / 文」），室内时地点显示店名；样式用现有主题变量，**不要黑底、不要粗框**（AR-48）。只改与银两 / 顶栏 / `ShopLayer` 挂载直接相关的行，App.vue 里其他线的改动一概不动。
   - **顺带修顶栏晕染底**（大地图线 10-11 转来，TODO.md 大地图段待办④）：`.topbar.halo` 的晕染底是按整条顶栏居中的径向渐变，左侧「天书录」一带几乎透明，大地图页的城名会从标题字间透出来（实测出现「天怀远书录」）。改成标题区与中部信息区都有足够遮挡的宣纸晕染底（例如标题区单独一层径向晕染，或整条顶栏底部加一道渐隐的不透明带），仍用现有主题变量、不要黑底粗框；用大地图页的 happy-dom 测试或计算样式断言标题区背景不透明度 ≥ 0.85。
5. **控制器**（`game-controller.ts`）：暴露 `queryShop(shopKey)` 与 `shopCommand(cmd)`，类型从 contracts 来。

## 测试（命名用例；`apps/**/*.test.ts` 都在根 `vitest.config.ts` 的 node 项目里跑，需要 DOM 的测试文件首行加 `// @vitest-environment happy-dom`，照 `apps/game/src/battle/BattlePage.test.ts` 的写法）
- **全流程**（happy-dom）：新档 → 进入大理 v1 城镇 → 走到药铺 → `town/interact` → 对话推进到「看看货」→ `ShopLayer` 打开且列出模板货品 → 买 1 件金创药（或该店模板里的第一件可买物品）→ 顶栏银两减少的数额 = core 给的单价、背包里多 1 件、店铺库存少 1；**存档再读档后**银两与背包仍是新值。
- 价格过期：在打开后改动定价上下文（如魅力），用旧单价买 → 收到 `SHOP_PRICE_STALE` 提示且已重查出新单价。
- 钱不够：按钮禁用原因来自 `ShopView.offers[].reason`，不是前端自己算。
- 打开 / 关闭 `ShopLayer` 时世界 tick 暂停 / 恢复。
- 会话：`shop/query` 在 Worker 宿主与主线程宿主下返回相同 `ShopView`（用现有 transport 测试的双宿主写法）；session 静态闭包不含 `economy/shop-*`（用现有闭包断言写法）。
- grep：`apps/game/src/**` 里没有任何价格公式（`round10`、`cha`、`speech` 等参与计算的代码）。

## 约束
- 只写：`apps/game/src/runtime/{session,contracts,explore-projection}.ts`、`apps/game/src/runtime/*.test.ts`（只增改与本任务直接相关的用例）、`apps/game/src/game-controller.ts`、`apps/game/src/pages/ShopLayer.vue`、`apps/game/src/pages/ShopLayer.strings.ts`、`apps/game/src/pages/ShopLayer.test.ts`、`apps/game/src/App.vue`、`apps/game/src/style.css`、`apps/game/src/flow/presentation.ts`（只许加 `shop/open` 的分派）与本任务报告。
- 不改 `session-projection.ts`、`WorldMapPage.vue`、`worldmap/**`（大地图线）、`TownPage.vue`（v1 页是下一个任务）、`packages/**`；不新增依赖。
- **协调者 10-11 r1 补充**：城内存档被判 `SAVE_WORLDMAP_INVALID` 的根因（core 用 `JSON.stringify` 比较已进场景、对键顺序敏感）已在集成分支修好（提交 aeadbb648，改为 `canonicalJson`）；`session.ts` 里的 `worldMapSceneForValidation()` 绕行必须删掉，读档语义不在本任务里改。
- 工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run apps/game/src --config vitest.config.ts --project node`
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`（含 `pnpm size` 里的应用构建）

## 报告
`tools/agents/reports/ENG-town2-shop-wire.md`（≤ 60 行）：第 3 节写会话查询路径（两种宿主）、`ShopView → ShopPanelView` 映射表、拒绝码提示表、顶栏布局改动；第 6 节写全流程测试的实测数字（单价、银两前后、库存前后）；第 7 节写给 ENG-town2-v1-page（交互条如何用 `facility`、店铺入口）与 ENG-town2-explore-page（v2 复用 `ShopLayer` 的方式）的交接。
