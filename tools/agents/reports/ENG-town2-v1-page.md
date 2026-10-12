# ENG-town2-v1-page 报告 · 城镇探索 v2 · P1 · 现有城镇页收尾（删模拟店铺与对话、交互条、经店员对话真实购买）
## 1. 摘要（3–6 行）
- 现有城镇页已删除模拟银两、货品、李文秀开场对白、三个模拟按钮/弹窗、侧栏/帮助/统计和 40 ms 渲染兜底。
- 右下 `TxContextActions` 现由 core 锚点与 `facility` 投影生成；F/空格/回车触发首个可用动作，对话时隐藏。
- 小地图设施标记已以设施投影补全店名与类别图标，目标仍是 core 编译的真实入口格。
- 已从页面交互条实测“交谈 → 设施 Ink → 看看货 → ShopLayer → core 购买”，并保留既有小地图、缩放和身高接线。
## 2. 产出（文件、行数、主要章节）
- 页面/输入：`TownPage.vue` 381 行，`town-input.ts` 53 行，测试 148 行；删模拟 UI，接交互条，位移节拍统一 140 ms。
- explore：新增 `v1-context-actions.ts`/文案 80/18 行、`v1-shop-flow.test.ts` 99 行；修改 `v1-minimap.ts`/测试 359/255 行。
- `settings.ts`/测试无需修改：基点已有 `minimapNorthUp` 及持久化覆盖；无新增依赖、lockfile 未变。
- `pnpm install --frozen-lockfile`：通过（567 packages，lockfile 未变）。
- 应用验收：55 个测试文件、370 条测试全过；完整 `pnpm check`：247 个测试文件、2057 条测试全过。
- 完整检查另含内容 1793 文件/1720 对象/4 Ink/65 地图、story gates、应用构建、dev chunks 与 size，均通过。
## 3. 关键结论与数值
- 删除 grep：`shopItems=0; playerSilver=0; 1280=0; activeDialogue=0; showShopModal=0`。
- 删除 grep：`市肆采买=0; 与同行交谈=0; 打开店铺=0; town-panel=0; town-help=0; setInterval=0`。
- 删除 grep：`/img/li.webp=0; /img/li_cutout.png=0; /img/hero_cutout.png=0; town-street-dialogue=0; town-stats=0`。
- 页内统计只删未挪：当前写集内没有开发面板入口；没有在页面重建另一份调试状态。
- 缩放沿用四档 `[48,64,80,96]` px/m、连续 `[40,112]`、复位 80；v1 换算为 `px/m × 18 / canvasHeight`，720 高四档 `1.20/1.60/2.00/2.40`。
- 小地图底图沿用 0.25 m/px、长边 ≤640；大理 384×384；交接热测 20 次 median 1.336 ms、p95 5.082 ms。
- 交互映射：室内设施→交谈；当前格 NPC/建筑/禅修/地点→交谈/进入/打坐/查看；室内尾项→出门，否则可离城→出城；最多 3 项。
- 首个 enabled 动作标 F，ActionMap 同时接受 F/空格/回车；对话投影存在时整条隐藏。页面只发 `town/*` 意图，寻路、可达、价格与购买合法性仍由 core 决定。
- 真实购买夹具：钱 `10000 → 9900`，`it_gancao` 库存 `0 → 1`；UI 未计算价格。减少动效开/关均使用 140 ms 逐格节拍。
- size 门通过：`explore-ui 17.93/45 KiB`、`render-town-legacy 7.60/14`、`webglExploreRoute 240.46/420`、session total `102.95/110`。
## 4. 开放问题（附默认值）
- 尚未在真实浏览器肉眼实走；默认由协调者按第 7 节 G0 手检。
- `TxContextActions` 最多三项时保留设施交谈与出门/出城，当前格其余动作按 core 投影顺序截取；默认 v2 延续该优先级。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；本实现遵循 tech/15 与 AR-114/AR-116 的既定契约。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- 无必须同步项；`ENG-town2-explore-page` 可直接复用第 7 节所列适配器。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 模拟标识源码断言与终端 grep 均为零；`git diff --check` 通过；只改写集内文件。
- ✅ 缩放键/滚轮、小地图点击寻路、设施投影名称/图标/入口格、≤3 交互动作均有命名回归。
- ✅ 整页测试从右下“交谈 F”进入真实设施对白、“看看货”、ShopLayer 并由 core 成交。
- ✅ 三条验收命令均亲自运行通过；构建仅有既有 `ASSET_SOURCE_MISSING` 警告，不影响退出码。
- ⚠️ G0 5173 手检：进大理 → 看右上小地图不压顶栏/司南 → 点药铺标记走到入口 → 入店 → 右下交谈 → 看看货 → 买甘草；再验 `=`/`-`/`0`、滚轮、M/Esc、F/空格/回车及对白时交互条隐藏。
- ✅ 交给 `ENG-town2-explore-page`：复用 `v1-context-actions.ts` 的纯映射、`facilityPresentation`、`v1-minimap.ts` 的投影覆盖和 `v1-shop-flow.test.ts` 全流程夹具；v2 页面继续只消费投影并发命令。
