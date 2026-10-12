# ENG-town2-shop-core 报告 · 城镇探索 v2 · core 店铺结算（shop/buy|sell、定价上下文、店铺查询、补货、ShopLocator v1）
## 1. 摘要（3–6 行）
- 已实现 core 权威买卖：价格、库存、银两、背包和 `economy/shopBought|shopSold` 事件同事务结算。
- 已实现纯读 `queryShop`、按 `instanceKey` 交易时懒建、3 日无 RNG 补货与 ShopLocator v1。
- 本轮按协调者裁定保留自动价 0 不可交易与斜杠实例键，并补强全过程 RNG、卖出事件断言及显式键兼容。
- QST-T21/T22 仍逐文命中 44,977 / 19,912；四条指定检查全部退出 0。

## 2. 产出（文件、行数、主要章节）
- `economy/shop-{pricing,query,locator,types}.ts`（328 行）：参考价/上下文、稳定索引、运行时装配、查询、v1 定位和公开类型。
- `command/shop-handler.ts`（124 行）、`entries/shop-command.ts`（3 行）：校验顺序、事务写入、懒加载导出。
- 两个 economy 测试、handler 测试与 schema 解析夹具（323 行）：零价、复杂度、懒建、补货、拒绝、回滚、确定性、回购。
- 验收：冻结安装、core lint 均退出 0；core test 54 文件/584 例通过。
- 验收：`env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check` 退出 0；225 文件/1,696 例、1,777 内容文件/1,708 对象、4 个剧情编译测试、构建/体积门通过。

## 3. 关键结论与数值
- 定价上下文：`worldTier=ChapterDef.worldTier`；`townLevel=当前 WorldMap 节点 levelRange[0]`；`cha=主角 innate.cha`；`speech=主角可选字段，当前状态无该字段故默认 0`；店类取设施 `shop.kind`。
- `'auto'` 由 `item.kind → category → byGrade[grade-1]`；按 tech/15 §4.4 与 shop-schema §4，表值 0 表示无参考价；数字（含 0）直用；`null` 不可交易。
- 查询只在内存拼初始状态，交易才把店铺写入 `chapter.shops`；初始库存=`baseStock`、`lastRestockDay=当天`；补货按 `clock.dayIndex`/既有 `ShopRuntime.restock`，不读 RNG。
- `CoreContent` 首次使用时建稳定 Map 索引；热路径按店铺货单/相关背包行组装运行时，不遍历全物品、设施或店铺目录。
- 拒绝顺序：忙碌→UNKNOWN→NOT_HERE→（CLOSED 预留，当前恒开）→ITEM_UNAVAILABLE→库存/持有→银两→PRICE_STALE→背包容量；溢出继续上抛内部错误。
- 契约适配：为逐文满足 QST-T21/T22，参考价先放大 10 倍复用既有 `round10`，再用整数除法回到文；实例键集中优先读未来 `shop.instanceKey`，当前 schema 回退 `<layoutKey>/<facilityKey>`。
- 当前持久状态尚无正式 `arts.speech`，仅此字段偏离理想来源，按任务默认 0；所有写入仍经一个 `CoreTransaction`。

## 4. 开放问题（附默认值）
- `TownFacilitiesSchema` 当前没有 `shop.instanceKey`；默认并实测使用 `${layoutKey}/${facility.key}`，上游补字段后由同一函数优先读取显式键，既有存档迁移仍待另案。
- `CharacterState` 当前没有正式口才技艺字段；默认 0，并兼容未来主角 `speech` 整数字段。正式 `arts.speech` 落位后应改为该来源。
- `SHOP_CLOSED` 已保留拒绝码但营业暂恒开；默认不解释 `hours`，待 P4 时间营业规则。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；本任务实现既定 tech/15 契约，不新增原著或玩法事实。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `packages/data/src/schemas/facility.ts` / `TownFacilitySchema.shop`：若决定补显式 `instanceKey`，需同步 core 回退键与既有存档迁移；本轮夹具严格通过当前 schema。
- QST-T21 实测：`referencePrice=46,851, cha=50, speech=40` → 44,977 文；QST-T22 → 19,912 文，均逐文通过。
- `docs/tech/15` §4.4：后续可记载既有 `round10` 在 10 倍文精度复用后回除，才能同时满足逐文向量。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 数字/auto/null 定价、auto 表值 0 买卖拒绝、QST-T21/T22、世界/城镇/角色/店类上下文均覆盖。
- ✅ 查询纯读且深冻结状态可调用；首次交易懒建；offers/buys/stock 码点排序。
- ✅ 从第 0 天买入前到买空、第 2 天查询、第 3 天补满并实际交易后，五路世界 RNG 逐字段不变。
- ✅ UNKNOWN、两种 NOT_HERE、UNAVAILABLE、STOCK、MONEY、STALE、FULL、忙碌各有用例；数量/持有数/溢出也覆盖。
- ✅ 注入“背包写入后抛错”证明银两/背包/库存整体回滚；相同状态命令 canonical 状态相同；卖出事件四字段与回购守恒均显式断言。
- ✅ 真实 `TownFacilitiesSchema` 夹具与 `city_dali__ch01/yaopu_01` 覆盖 resolve/locator/懒建/事件；索引复用计数证明后续校验/查询零目录下标读取。
- ✅ ENG-town2-shop-wire：从懒入口调用 `queryShop(state, content, shopKey)`；offers 是出售库存/买价/品阶/禁用因，buys 是玩家持有/卖价，交易后必须重查。
- ✅ ENG-town2-explore-facility：在 `shop-locator.ts` 的 `locateShop()` 按 town 引擎版本分派；保留 `isShopHereV1()`，新增 v2 建筑内/服务格两格判定。
- ⚠️ 全仓测试打印既有 localhost:3000 `ECONNREFUSED` 与缺素材警告，但汇总 225/1,696 通过且最终退出 0。
