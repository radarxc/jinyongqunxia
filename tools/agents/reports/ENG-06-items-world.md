# ENG-06-items-world 报告 · 游戏工程 · 物品运行时（物品栏 / 装备 / 全局物品与藏品 / 店铺供货 / 药材强化 / 制式盔甲通缉）

## 1. 摘要（3–6 行）

- 已完成纯 TypeScript `economy` 运行时：背包、消耗品、十一槽装备、世界物品、商店和官甲执法。
- 规则状态保持规范 JSON；`Map` / `Set` 仅作运行时索引，背包与单项供货查询 O(1)，世界物品按场景分桶。
- 已从 11 份名录机器行生成并校验 366 个预排序 `item.v1` YAML；361 个在新目录，5 个保留原路径。
- 第 2 次运行已修复五处文件删除：保留上一轮名录数据，移回 `content/common/items/` 并同步生成器；其余已有实现未改。
- 未新增依赖，`pnpm-lock.yaml` 未改；未引入需联网核实的版本、API、价格或限额事实。

## 2. 产出（文件、行数、主要章节）

- `packages/core/src/economy/`：8 个运行时/出口文件共 987 行；背包、消耗品、装备、世界物、商店、官甲与 DTO。
- `packages/core/src/economy/*.test.ts`：3 个新增测试文件共 379 行；覆盖不变量、效果、经脉、装备、补货、交易与通缉。
- `tools/content/items_from_catalog.py`：494 行；解析、投影、确定性排序、逐文件写入和 `--check` 漂移校验；五个既有 ID 固定输出到原路径。
- `content/items/*.yaml` 361 文件 + `content/common/items/` 5 个名录生成物，共 366 文件、10,477 行；每个 ID 仅一份定义。
- `packages/core/CLAUDE.md`：新增 23 行 ENG-07 / 08 / 09 接口与持久化约定。

## 3. 关键结论与数值

- 十一槽固定为主手 / 副手 / 头 / 身 / 内甲 / 手 / 护肩 / 披风 / 腰 / 鞋 / 饰品；成对兵器占主副手，双手兵器仅兼容暗器载具副手。
- 城镇主品阶为 `floor((147 + 22 * (townLevel - 1)) / 98)`，限制 1–12；HIGH 上限 6/7/7，MID 5/6/7，LOW 4/5/6（普通/名店/黑市）。
- 买卖价先合并全部 bp 因子，再以 `10 * floor((x + 5) / 10)` 统一取整，避免逐乘截断。
- 消耗品最终治疗才向下取整；永久经脉强化唯一调用 ENG-03 `applyMeridianBoost()`；同 ID 冷却 2 表示行动 `k+1`、`k+2` 禁用，`k+3` 可用。
- 官甲暴露事件固定六字段 `{equipId, wearerId, lawProfile, exposure, locationId, time}`；默认每件未授权可见官甲通缉 `+1` 并设置普通城门拦截，脱甲不自动洗除。

## 4. 开放问题（附默认值）

- 名录机器行当前没有 `meridianTemper`：默认不臆造物品；运行时与合法 fixture 已验证，待内容侧给出正式条目。
- `ItemDef` 尚不能结构化完整装备修饰、`lawProfile`、世界锚点及部分药材生服效果：默认保留原描述和 `runtimeProjection`，由 `EquipmentRule` / `WorldItemRule` 等显式注入。
- 战斗普通道具“全场总次数”默认由 ENG-09 `BattleInventoryState` 校验；本模块只维护单品每战次数、同 ID 行动冷却和章节唯一使用。
- 官甲多件同时暴露默认逐件累计通缉；后续身份系统若要求单次曝光封顶，应由 ENG-08 传入聚合策略后再改。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- ENG06-P01 / 为物品 schema 增加装备槽、完整修饰与官甲 `lawProfile` / 消除内容描述到运行时规则的手工投影。
- ENG06-P02 / 在药材或丹药机器行正式增加至少一个 `meridianTemper` 条目 / 让 AR-19 的永久经脉强化有可发布内容，而不只具备运行时能力。
- ENG06-P03 / 明确同次官甲暴露是逐件累计还是单次封顶 / 当前默认逐件 `+1` 可确定回放，但会影响通缉强度。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `packages/data` schema / 物品定义 / 评估纳入 ENG06-P01；本任务按权限未修改。
- ENG-07 背包与装备 UI / 接口接入 / 只提交 `snapshot()`；展示 `query()`、换装返回态及 `UseConsumableResult`。
- ENG-08 探索与城镇 / 拾取与入城 / 使用场景查询、原子拾取、官甲事件和 `canEnterNormalCityGate()`。
- ENG-09 战斗 / 道具行动 / 传自身正常行动 `battleTurnToken`，持久化返回账本，并另行限制全场总使用次数。
- `docs/design/10-items-and-equipment.md` / 数据落地说明 / 登记名录 `meridianTemper` 与 schema 投影缺口；本任务按权限未修改。

## 7. 自检（验收标准、接口清单、统计、测试与下游交接）

- ✅ 接口清单：`InventoryRuntime`、`addInventory`、`removeInventory`、`useConsumable`；`equipItem`、`unequipItem`、`deriveEquipmentPanel`；`WorldItemsRuntime`、`isWorldItemVisible`、`pickupWorldItem`；`ShopRuntime`、`restockShop`、`calculateBuyPrice`、`calculateSellPrice`；`checkUniformExposure`、`equippedUniformRules`、`canEnterNormalCityGate`。
- ✅ 生成按目录：accessories 48、armor 8、belts 26、clothing 30、food 28、hidden-weapons 24、innerarmor 8、manuals 18、medicine 32、shoes 26、weapons 118，共 366。
- ✅ 生成按类：ammo 4、armor 146、dish 6、food 10、hidden 20、manual 18、material 24、pill 10、poison 2、tonic 8、weapon 118。
- ✅ 生成按品阶：1:19、2:19、3:51、4:17、5:24、6:56、7:35、8:41、9:58、10:38、11:3、12:5。
- ✅ 测试摘要（本轮重跑）：全仓 lint（含 Core 包级规则）、typecheck 通过；常规 32 文件 179 测试及性能 1 文件 2 测试通过；覆盖数量非负/堆叠、消费效果与经脉调用、冷却、装备重算、补货、价格和通缉。
- ✅ 下游交接：ENG-07 / 08 / 09 的调用、账本、快照及事件约定已写入 `packages/core/CLAUDE.md`。
- ✅ 内容与约束：生成器 `--check` 通过；确定性预排序；无 UI、DOM、网络、墙钟、隐式随机、浮点除法或新依赖。
- ✅ 最终验收：`pnpm install --frozen-lockfile`、`pnpm check`、生成器 `--check`、严格 ID 检查均通过；严格 ID 检查仅报告既有基线未定义 `sk_babuganchan`。
- ✅ 续作修复：`content/common/items/` 下 `eq_qinggangjian.yaml`、`it_jinchuangyao.yaml`、`it_jingmi.yaml`、`it_miji_taizuchangquan.yaml`、`it_xiaohuandan.yaml` 全部存在；与上一轮对应生成物逐字一致，新目录同 ID 副本已移除。
- ✅ 内容校验：374 文件 / 374 对象通过；物品共 367 个唯一 ID（366 名录生成物 + 既有 `it_dahuandan`），重复为 0；生成器继续检查原路径缺失、内容漂移与新目录多余副本。
- ✅ 续作范围：只调整上述五个物品的路径、生成器和本报告；未新增依赖、未改锁文件或核心接口，`git diff --check` 通过。
- ⚠️ 构建仍提示 render 压缩前 chunk 超过 500 kB；项目 gzip 预算全部通过（entry 103.29/170 KiB，render 129.44/180 KiB，总计 232.73/350 KiB），本轮未修改渲染代码。
