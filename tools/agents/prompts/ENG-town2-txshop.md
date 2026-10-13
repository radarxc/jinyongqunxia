# 本任务：城镇探索 v2 · P1 · 店铺界面 `TxShop`（买 / 卖页签、数量步进、价格与禁用原因；只发意图不改钱）

**第一个动作**：打开 `packages/ui/src/components/TxInventory.vue` 与其测试 `packages/ui/src/components/panels.test.ts`（看物品行、图标、品阶的现有呈现和测试写法），再读 `docs/tech/15-town-explore-v2-spec.md` §7.3，读完直接动手；不要先写计划。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`（ui 只消费投影、发命令意图，禁止直接改 GameState）。

## 背景
作者 AR-114（2026-10-10，逐字）：「采买这些都在建筑里进行（搭配NPC对话）。」流程：进店 → 点店主 → 设施对话 →「看看货」→ 店铺界面；买卖由 core 的 `shop/buy|sell` 结算。现在城镇的「市肆采买」是页面里写死的模拟（假银两、不存在的物品）。本任务只做 `packages/ui` 里的通用店铺组件；App 层的 `ShopLayer`（查询 / 发命令 / 重查）是后续任务 ENG-town2-shop-wire。

## 要做的事
1. `packages/ui/src/components/explore/TxShop.vue`：
   - props：`view: ShopPanelView`（本组件自有的界面类型，定义在 `TxShop.types.ts`）——`{ title, facilityKind, moneyWen, rows: { buy: ShopRow[]; sell: ShopRow[] }, busy: boolean }`；`ShopRow = { itemId, name, icon: string | null, grade: number, unitPriceWen: number, stock: number | null /* 卖出页为 null */, owned: number, disabledReason: string | null }`。
   - 两个页签「买」「卖」；每行：图标、名称、品阶、单价（按「两 / 文」显示：1 两 = 1000 文，例 `44 两 977 文`；纯文不足 1 两只显示文）、库存或持有数、数量步进（`−` / 数字 / `+`，下限 1，上限 = 买：`min(库存, floor(银两 / 单价))`；卖：持有数）、确认按钮；`disabledReason` 非空时整行禁用并显示原因。
   - emits：`buy({ itemId, count, unitPriceWen })`、`sell({ itemId, count, unitPriceWen })`、`close()`；**组件自己不改钱、不改库存、不改 props**（提交后等调用方给新 `view`）；`busy` 为真时所有确认按钮禁用。
   - Esc 关闭（组件内监听 keydown，聚焦在输入框时也生效）；首次打开焦点落在第一个可交互行；所有可点元素 ≥ 44×44 CSS px。
   - 样式沿用 `packages/ui/src/theme.css` 变量与 `TxPanel` / `TxModal` 风格，**不要黑底、不要粗框**（AR-48）。
2. 文案放 `packages/ui/src/components/explore/TxShop.strings.ts`（不改 `packages/ui/src/i18n.ts`）。
3. 金额格式化放 `packages/ui/src/explore/money.ts`：`formatWen(wen: number): string` 与 `maxAffordable(moneyWen, unitPriceWen, stock): number`，纯函数、整数运算。
4. 测试（ui 项目 happy-dom，`packages/ui/src/components/explore/TxShop.test.ts`、`packages/ui/src/explore/money.test.ts`）命名用例至少：行渲染与禁用原因；步进上下限（钱不够、库存不够、持有数）；买 / 卖发出的载荷含当时单价；`busy` 禁用确认；Esc 发 `close`；不修改 props（`isReactive` / 深比较前后一致）；`formatWen` 边界（0、999、1000、44977、负数报错）；`maxAffordable` 边界。

## 约束
- 只写：`packages/ui/src/components/explore/TxShop*`、`packages/ui/src/explore/money*` 与本任务报告。不改 `packages/ui/src/index.ts`（调用方用 `@tianshu/ui/components/explore/TxShop.vue` 深路径导入）。
- 不新增依赖；工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run packages/ui --config vitest.config.ts --project ui`（包内 `pnpm --filter @tianshu/ui test` 缺 Vue 插件跑不通，用根配置的 ui 项目）
- `pnpm check`

## 报告
`tools/agents/reports/ENG-town2-txshop.md`（≤ 50 行）：第 3 节写 `ShopPanelView` 字段与金额显示规则；第 7 节写给 ENG-town2-shop-wire 的接入说明（core `ShopView` → `ShopPanelView` 怎么映射、事件怎么接 `shop/buy|sell` 的 `expectedUnitPrice`）。
