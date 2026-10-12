# ENG-town2-txshop 报告 · 城镇探索 v2 · P1 · 店铺界面 TxShop（买 / 卖、步进、价格与禁用原因，只发意图）
## 1. 摘要（3–6 行）
- 新增通用 `TxShop`：买卖页签、图标/品阶/价格/数量、禁用原因、忙碌态、Esc 关闭与首行聚焦。
- 组件仅维护页签和待提交数量，提交 `buy` / `sell` 意图；不修改银两、库存、持有数或传入投影。
- 新增文/两格式化和可买上限纯函数，并覆盖边界、载荷、重定价与投影只读测试。
- 本轮修复非法数量显示/载荷不一致，以及空店、全禁用店无焦点时 Esc 无法关闭的问题。
- 冻结安装、UI 专项与全仓 `pnpm check` 均通过。
## 2. 产出（文件、行数、主要章节）
- `TxShop.vue` 176 行；`TxShop.types.ts` 27 行；`TxShop.strings.ts` 17 行；`TxShop.test.ts` 148 行。
- `explore/money.ts` 22 行；`money.test.ts` 33 行。
- `pnpm install --frozen-lockfile`：通过，lockfile 最新且无需安装。
- UI 验收：12 文件 / 64 测试通过；新增专项为 2 文件 / 18 测试通过。
- `pnpm check`：通过；235 文件 / 1,871 测试，1,777 内容文件 / 1,708 对象，剧情编译、构建、体积门均通过。
## 3. 关键结论与数值
- `ShopPanelView`：`title, facilityKind, moneyWen, rows.buy, rows.sell, busy`；行字段为 `itemId, name, icon, grade, unitPriceWen, stock, owned, disabledReason`。
- 金额用整数文；`1 两 = 1000 文`：`999 → 999 文`、`1000 → 1 两`、`44977 → 44 两 977 文`。
- 买入上限 `min(stock, floor(moneyWen / unitPriceWen))`；卖出上限为 `owned`；下限为 1，无可交易数量时禁用确认。
- 与文档一致：UI 不结算，只发含当前投影单价的意图；无技术偏离。
## 4. 开放问题（附默认值）
- `facilityKind` 暂为界面标签字符串；默认由 ShopLayer 把 core 枚举映射成中文，不让通用 UI 依赖 data。
- core 只给 offers 的禁用码；默认由 ShopLayer 映射中文 `disabledReason`，sell 行当前默认 `null`。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- 无；`docs/tech/15` §7.3 已覆盖本组件契约。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 行、禁用原因、买卖页签、金额、库存/持有、步进钱/库存/持有上限均覆盖；非法数量立即恢复合法整数且提交一致。
- ✅ `buy/sell` 载荷含提交时单价；重查改价用例证明不缓存旧价；busy 禁确认。
- ✅ Esc 在数量输入聚焦时关闭；空店/全禁用店回退聚焦关闭按钮后也可关闭；点击目标至少 44×44 CSS px。
- ✅ `isReactive` 与深比较证明 props 不变；组件不发 core 命令、不改钱与库存。
- ✅ 文案独立、无新依赖、无黑底粗框、lint/typecheck/UI 验收/`pnpm check` 全绿。
- ✅ ENG-town2-shop-wire：`ShopView.money → moneyWen`；`nameKey` 本地化为 `title`；`facilityKind` 映射中文；offers 用物品目录补 `name/icon/grade`，映射 `unitBuyPrice/stock/reason`；buys 补物品并映射 `unitSellPrice/owned`、`stock:null`。
- ✅ 接事件时补 `shopKey=view.instanceKey`，`unitPriceWen → expectedUnitPrice`，分别发 `shop/buy|sell`；每次回复后重查并替换整个 `ShopPanelView`。
