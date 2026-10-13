# ENG-town2-shop-wire 报告 · 城镇探索 v2 · P1 · 店铺接线（会话 shop/query 与买卖命令、shop/open → ShopLayer、银两挪顶栏、城镇投影挪进 explore-projection）
## 1. 摘要（3–6 行）
- 已打通“设施对话 → `shop/open` → `ShopLayer` → core 买卖 → 重查 → 存读档”完整链路。
- `shop/query` 经主线程/Worker 同一 dispatch 契约，并动态加载 `@tianshu/core/shop-command`；交易只脏 `hud`、`inventory`。
- `explore-projection.ts` 只在既有 v1 town 结果上增补 `facility` / 暂停字段，不重算城镇；读档绕行已删除。
- 银两移入顶栏“时辰 · 地点 · 银两”，室内显示设施名；标题区/中部各加宣纸晕染底。
## 2. 产出（文件、行数、主要章节）
- 运行时：`session.ts` 683 行、`contracts.ts` 77 行、`explore-projection.ts` 60 行；控制器 `game-controller.ts` 980 行；分派 `presentation.ts` 104 行。
- UI：`ShopLayer.vue` 104 行、`ShopLayer.strings.ts` 24 行；`App.vue`/`style.css` 仅改顶栏与浮层挂载相关行。
- 测试：`shop-session.test.ts` 117 行、`shop-flow.test.ts` 148 行、`shop-topbar.test.ts` 36 行、`ShopLayer.test.ts` 66 行。
- `pnpm install --frozen-lockfile`：通过（Already up to date，636 ms，锁文件未变）。
- 应用 Vitest：54 文件 / 348 测试通过；`pnpm check`：245 文件 / 2018 测试通过。
- 内容/构建：1793 文件、1720 对象、4 Ink、65 地图有效；入口 38.58/170 KiB，首次会话 102.95/110 KiB，dev chunks PASS。
## 3. 关键结论与数值
- 查询路径：主线程走 `createProjectionMainThreadHost`；Worker 测试用 `MessageChannel + Comlink.expose + createProjectionWorkerHost` 真实 RPC；同档逐字段相等，session 动态 import `@tianshu/core/shop-command`。
- `ShopView → ShopPanelView`：`nameKey→文本目录 title`；`facilityKind→设施文案`；`money→moneyWen`；`offers/buys→物品投影的名称/图标/品阶 + core 单价/库存/持有量/禁用原因`。
- 拒绝提示：`SHOP_PRICE_STALE→价钱变了，请再看一眼`；`SHOP_MONEY_INSUFFICIENT→身上银两不够`；`SHOP_STOCK_INSUFFICIENT→货架上的存货不够`；其余逐码映射，未知码兜底“这笔买卖未能成交”。
- 成功和拒绝回复都在 `finally` 重查；等待时 `busy=true`；前端不计算价格、不改钱或库存。
- 打开保存原 tick 状态并暂停，关闭/Esc 恢复；重复打开不覆盖原恢复值。
- 顶栏居中显示日期、设施/地点、`两 / 文`；标题元素用宣纸实底和 88% 晕染外沿，中部另有 94%/86% 晕染；happy-dom 计算标题最终 alpha=1.00（门槛 ≥0.85），无黑底粗框。
## 4. 开放问题（附默认值）
- `@tianshu/ui` 未导出 money formatter 子路径；默认在 App 保留等价的纯展示 `formatWen`，不触及结算。
- 按协调者 r1 过渡裁定，v1 town 仍由 `session-projection.ts` 计算；默认由 ENG-town2-session-v2 完成整体迁出，本任务包装层只增补、不覆盖既有城镇字段。
- happy-dom 会记录 localhost:3000 图片请求拒绝与 WebGL 上下文噪声；默认视为既有测试环境日志，断言与门禁均通过。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；本任务只落实既定 core、呈现步与顶栏契约。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- 作者货单首个可买项 `it_gancao`：core 单价 100 文；银两 10000→9900；背包 0→1；库存 10→9。
- 再买一次临时到 9800 文；读取 `save_manual_01` 后恢复 9900 文、背包 1、库存 9。
- 真实价格过期向量：魅力 50→0，旧价 200、新价 230；旧价交易拒绝 `SHOP_PRICE_STALE`，重查显示 230。
- 文档无需改；后续页面任务按下节代码交接接入。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 冻结安装、应用全测、`TIANSHU_VITEST_MAX_WORKERS=2 pnpm check` 全通过；`git diff --check` 通过。
- ✅ 真实 Worker transport 与主线程宿主得到相同 `ShopView`；静态闭包无 `economy/shop-*`；应用无店铺价格公式；禁用因来自 core。
- ✅ `explore-projection` 不含/不调用 `projectTown`，只增补 `facility`/暂停；`session-projection.ts` 零差异；通用读档绕行不存在。
- ✅ happy-dom 计算样式断言标题区 alpha≥0.85；交易持久化、成功/拒绝后重查、tick 暂停恢复均覆盖。
- ENG-town2-v1-page：交互条读取 `controller.town.value?.facility`；`shopKey` 非空时仍先走设施 NPC 对话，入口由 `shop/open` 自动唤起全局层。
- ENG-town2-explore-page：复用 App 已挂载的 `ShopLayer`；只需让 v2 对话事件产生 `{ op:'shop/open', shopKey }`，不要另算价格或另建店铺状态。
