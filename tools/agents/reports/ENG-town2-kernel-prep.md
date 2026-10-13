# ENG-town2-kernel-prep 报告 · 城镇探索 v2 · core 内核准备（探索 / 店铺命令与拒绝码、处理器桩、行走 tick 钩子、存档 schema 4、懒加载族）
## 1. 摘要（3–6 行）
- 已定型探索/店铺命令、稳定拒绝码、总线与两个子路径，六命令均可路由到桩。
- 已接 `world/tick` 行走钩子；无行走不调用，有行走缺钩子抛内部错误，explore 入口 import 时注册空推进桩。
- `SAVE_SCHEMA` 升 4，严格加入 `walk`、`sceneMemory`、3→4 迁移及设施对话上下文；`RULES_PROTOCOL=3` 不变。
- 应用存档迁移链已登记 3→4；全部指定检查与全仓 `pnpm check` 通过。
## 2. 产出（文件、行数、主要章节）
- 新增：`world/explore/{types,tick,tick-hook,walk-validate}.ts` 59 行；`economy/shop-types.ts` 22 行；两个 handler 51 行；两个 entry 12 行；`dialogue/context-validate.ts` 18 行。
- 修改：命令联合/总线/tick、schema 4 状态/迁移/校验、包 exports、Worker 懒加载与应用存档迁移表；新增 core 2 个测试文件、runtime 1 个测试文件并扩充 state 测试。
- golden：`book-sleep.golden.json` 升 schema 4、补新中性字段并重算 3 个 checkpoint/final SHA；对应测试期望补 `sceneMemory`。
- 实测：install、core lint 通过；core test 50 文件/566 例；runtime+storage 13 文件/102 例；全仓 213 文件/1627 例均通过。
## 3. 关键结论与数值
- 类型：`Pace/TravelTarget/ExploreCommand/ExploreWalkState/SceneMemoryEntry`、`ShopCommand/ShopView/ShopRejectReason`；`HEX_STEP_MM=1155`、walk/run=`135/450 mm/tick`、路径上限 512。
- 拒绝码补齐 9 个 `SHOP_*`、`REGION_PATH_UNREACHABLE`；`MAP_NODE_CLOSED` 与 `REGION_INTERACTION_BUSY` 复用。
- 桩：buy/sell→`SHOP_UNKNOWN`；travel/meditate→`REGION_PATH_BLOCKED`；无行走 steer/stop 为零写入成功；三种忙碌态统一拒绝。
- schema 4：`mountedRegion.walk` 必填可空；`world.sceneMemory` 必填、≤16、按 sceneId 严格升序；行走 path[0] 必须等于 playerHex。
- 钩子是模块级注册点；explore entry 注册 `advanceExploreWalk`，Worker 带 walk 的 tick 先加载该族。
## 4. 开放问题（附默认值）
- 桩尚不验证命令数值/位置；默认由 shop-core、explore-walk/facility 在各自规则实现中补全。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；落实 AR-114 与 tech/15 §4.2、§4.4、§4.6–4.7。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `apps/game/src/storage/save-service.ts` / `STATE_MIGRATIONS`：已同步 `[3, migrateExploreV3]`，旧 schema 1/2/3 存档可逐级迁至 4。
- 版本产物：仅 `book-sleep.golden.json` 与 `book-sleep.test.ts` 因 schema 4 新字段更新；runtime/storage 没有硬编码 3 的测试断言需改。
- `packages/core/CLAUDE.md` / GameState 与版本：后续文档 owner 把 schema 3、world 根描述更新为 schema 4/sceneMemory/walk。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 类型、12 个指定拒绝码（含已存在复用）、六命令路由、三忙碌态、桩语义均有测试。
- ✅ 3→4 已挂载/未挂载、canonical、幂等；对话 context 正反例；严格 walk/sceneMemory 校验。
- ✅ tick 无行走固定 canonical SHA-256 向量；缺钩子回滚并抛错；注册空钩子成功；Worker shop/explore 首次加载计数通过。
- ✅ 五条指定检查均退出 0；runtime+storage 13/13 文件、102/102 例通过。
- ✅ `pnpm check`：lint/typecheck、213 文件/1627 例、内容校验/剧情编译、构建与体积门全部通过。
- ✅ 交接 shop-core：替换 `command/shop-handler.ts` 桩；保留命令类型、拒绝码和 busy 优先级。
- ✅ 交接 explore-walk：替换 `command/explore-handler.ts` 与 `world/explore/tick.ts`；入口继续用 `registerExploreTick(advanceExploreWalk)`。
- ✅ 交接 explore-facility：实现 travel target/meditate 与 facility context 生产写入；不得绕过统一 busy 拒绝。
