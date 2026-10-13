# 本任务：城镇探索 v2 · core 店铺结算——`shop/buy | sell` 处理器、定价上下文、店铺查询、补货、ShopLocator v1

**第一个动作**：读 `tools/agents/reports/ENG-town2-kernel-prep.md` 第 3、7 节（`shop-handler.ts` 桩、`shop-types.ts` 的 `ShopCommand` / `ShopView` / 拒绝码、懒加载入口 `entries/shop-command.ts`）与 `tools/agents/reports/ENG-town2-shop-schema.md` 第 3、7 节（`shop-template.v1` / `price-table.v1` / `town-facilities.v1` 字段），再打开 `packages/core/src/economy/shop.ts`（现有 `ShopRuntime`、`calculateBuyPrice / calculateSellPrice`、`restockShop`）与 `docs/tech/15-town-explore-v2-spec.md` §4.4；读完直接动手，不要先写计划。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md` 与 `packages/core/CLAUDE.md`（core 只用整数、禁 `/`、禁墙钟与隐式随机；validate 只读；写入只经事务；协议变更要补固定向量）。

## 背景
作者 AR-114（2026-10-10，逐字）：「采买这些都在建筑里进行（搭配NPC对话）。」流程：进店 → 点店主 → 设施对话 →「看看货」→ 店铺界面 → 发 `shop/buy | sell`。现在城镇的采买是页面写死的模拟（假银两、不存在的物品）；本任务让 core 成为买卖的唯一权威：价格、库存、银两、背包全部由 core 结算。界面（`TxShop` / `ShopLayer`）和对话入口（`facility/openShop`）是别的任务。

## 要做的事
1. **定价** `packages/core/src/economy/shop-pricing.ts`（纯函数）：
   - 参考价：物品 `price` 为数字直接用；`'auto'` 按 `price-table.v1`（物品种类 → 列、品阶 → 行，单位文）解析，**价目表单元为 0 表示该品类 / 品阶无参考价**（design/10 §13.2 的「—」，ENG-town2-shop-schema 报告 §4），按不可买卖处理；`null` → 不可买卖（报 `SHOP_ITEM_UNAVAILABLE`）。
   - 定价上下文：`worldTier` 取当前章节 `ChapterDef.worldTier`；`townLevel` 取当前所在大地图节点的 `levelRange[0]`；魅力、口才取主角（口才缺省 0）；店类倍率沿用现有 `ShopRuntime` 的 `shopKind`（模板给 `normal | famous | blackMarket`）。
   - 买价 / 卖价**复用**现有 `calculateBuyPrice / calculateSellPrice`（`round10` 取整已在其中），不要另写一套公式。
   - 测试向量：design/12 QST-T21（`cha=50, speech=40`，买价 44,977 文）、QST-T22（卖价 19,912 文）——在单测里用与设计文档同样的参考价构造，逐文断言。
2. **运行时店铺** `packages/core/src/economy/shop-query.ts` + `shop-locator.ts`：
   - 店铺实例键 `instanceKey`（按 tech/15 §2.3 为 `<layoutKey>/<facilityKey>`，如 `city_dali__ch01/yaopu_01`；设施条目若有显式 `shop.instanceKey` 优先用它，否则由一个集中函数派生）；状态按 `instanceKey` **懒建**在 `chapter.shops`（首次查询或交易时建，初始库存 = 模板 `baseStock`，`lastRestockDay` = 当天）；运行时用「模板 + 章节上下文」拼出 `ShopDef` 交给 `ShopRuntime`，取代 `ShopDef.chapterId` 的硬检查（只在拼装处做，不改 `shop.ts` 的既有行为和测试）。
   - 补货沿用 `ShopRuntime.restock` 节奏（按 `clock.dayIndex`，**不耗 RNG**）。
   - `queryShop(state, content, shopKey): ShopView`（只读，不写状态）：`offers`（库存、单价、`maxGrade`、禁用原因 `SHOP_STOCK_INSUFFICIENT | SHOP_MONEY_INSUFFICIENT | null`）、`buys`（玩家持有且该店收购的物品、持有数、卖价）、`money`、`nextRestockDay`；行按 `itemId` 码点序。
   - **ShopLocator v1**（过渡，随 v1 退役删除）：`chapter.town.buildingPhase === 'inside'`，且设施文件把（当前布局，当前 `buildingId`）映射到该 `shopKey`；否则 `SHOP_NOT_HERE`。v2 的定位（在设施所属建筑内或服务格 2 格内）由 ENG-town2-explore-facility 加到同一文件，本任务留一个按引擎分派的入口函数。
3. **处理器** `packages/core/src/command/shop-handler.ts`（替换 kernel-prep 的桩）：
   - validate（只读、O(1) 到 O(行数)）：店铺存在（`SHOP_UNKNOWN`）、在店里（`SHOP_NOT_HERE`）、营业（暂恒开，`SHOP_CLOSED` 预留）、物品可售（`SHOP_ITEM_UNAVAILABLE`）、库存（`SHOP_STOCK_INSUFFICIENT`）、银两（`SHOP_MONEY_INSUFFICIENT`）、`expectedUnitPrice` 与当前单价不符（`SHOP_PRICE_STALE`）、背包容量（`SHOP_INVENTORY_FULL`）、对话 / 战斗中（`SHOP_BUSY` 或沿用 kernel-prep 定的忙碌拒绝码，以报告为准）。
   - apply：一个事务内完成扣钱 / 加钱、背包增减、库存变化与事件（`economy/shopBought | shopSold`）；任一步失败整体回滚（**原子性**用一个中途抛错的用例证明状态哈希不变）。
   - `count` 必须为正整数；卖出数量 ≤ 持有数；金额溢出走现有 `SHOP_MONEY_OVERFLOW / SHOP_STOCK_OVERFLOW` 内部错误。
4. **入口** `packages/core/src/entries/shop-command.ts`：导出处理器与 `queryShop`（会话层 `shop/query` 用），保持懒加载族边界（不得被 session 静态闭包引入）。

## 测试（`packages/core/src/economy/shop-*.test.ts`、`packages/core/src/command/shop-handler.test.ts`，命名用例）
- QST-T21 买价 44,977 文；QST-T22 卖价 19,912 文；`'auto'` 参考价按价目表解析；`null` 价物品拒绝。
- 懒建：首次查询不写状态、首次交易才建；建好后快照字段齐全且按码点序。
- 补货：第 0 天买空 → 第 2 天仍空 → 第 3 天回到 `baseStock`（按模板节奏）；整个过程世界 RNG 状态不变。
- 拒绝码逐个一例：`UNKNOWN`、`NOT_HERE`（不在店内 / 在别的店）、`ITEM_UNAVAILABLE`、`STOCK_INSUFFICIENT`、`MONEY_INSUFFICIENT`、`PRICE_STALE`、`INVENTORY_FULL`、忙碌。
- 原子回滚：注入在加背包后抛错 → 银两、库存、背包均不变。
- 确定性：同状态同命令两次 apply 的结果状态哈希相同；`queryShop` 不修改输入（冻结对象上调用不抛）。
- 卖出后再买回：价格差符合买 / 卖公式；库存与持有数守恒。

## 约束
- 只写：`packages/core/src/economy/shop-{pricing,query,locator,types}.ts`（`shop-types.ts` 只可新增字段 / 类型，不改 kernel-prep 已定的命令形状与拒绝码）、上述文件的 `*.test.ts`、`packages/core/src/command/shop-handler.ts`（+ 测试）、`packages/core/src/entries/shop-command.ts` 与本任务报告。
- 不改 `packages/core/src/economy/shop.ts` 既有导出的行为（可新增导出）；不改 `command/{index,bus,handlers}.ts`（kernel-prep 已注册）；不改 `packages/core/src/index.ts` 导出布局；不新增依赖。
- core 只用整数（无 `/`，用 `floorDivInt` / `ceilDivInt`）、无墙钟、无隐式随机、排序必须带比较器；工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。
- 测试夹具里的价目表 / 模板写在测试内或 `packages/core/src/economy/__fixtures__/`（新建），不要依赖 `content/` 里尚未合入的试点内容。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm --filter @tianshu/core lint`
- `pnpm --filter @tianshu/core test`
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`

## 报告
`tools/agents/reports/ENG-town2-shop-core.md`（≤ 70 行）：第 3 节写定价上下文取值来源、懒建与补货规则、拒绝码判定顺序；第 6 节列 QST-T21 / T22 实测；第 7 节写给 ENG-town2-shop-wire（会话层怎么调 `queryShop`、`ShopView` 字段含义、每次交易后要重查）与 ENG-town2-explore-facility（ShopLocator v2 加在哪个函数、如何分派引擎）的交接。
