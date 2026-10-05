# ENG-17-booksleep-m1 报告 · 游戏工程 · 书眠与章节切换 M1（序章结束 → 长白山初眠配点 → 白马（唐）冷入口）

## 1. 摘要（3–6 行）

- 已实现唯一受支持的 `ch00_yuenv → ch10_baima` 初眠事务：三种序章模式均由内容结算路径授《长生诀》第一层，再汇入同一六项配点与唐代冷入口。
- `chapter/bookSleep` 原子清理序章资产、切换章节 / 纪元 / 时钟 / 内容 hash，并保持五流 RNG 原样；重复同计划幂等。
- 宿主在 dispatch 前预载并校验目标书界包，只在挂载成功后写 `save_wake_ch10`；挂载失败保留初眠前自动档与原状态。
- schema 3、纯迁移、章节定义、查询接口、主线程 / Worker 传输、golden 与存档头一致性均已落地。

## 2. 产出（文件、行数、主要章节）

| 范围 | 文件 / 规模 | 主要产出 |
|---|---:|---|
| core | `packages/core/src/{progression,command,state,api,world}/**` 等 | 初眠规则 / 查询、事务处理器、状态 / 迁移 / 校验、内容授权授层 |
| data / content | schema、索引 / 注册表、两份 `chapter.yaml` | 严格 `ChapterDef`；保留既有 `BookWorldDef`；ch00 与 702–703 年 ch10 定义 |
| game | runtime、host、controller、storage | 目标包预载 / 原子挂载、内容修复、前存后醒、槽位展示、Worker 按需分包 |
| 测试 | core / game 共 7 个相关测试文件 + golden | 非法输入回滚、100 次跨宿主 hash、迁移、挂载失败、TSAV 头 |
| 合计 | 45 个实现 / 测试路径，约 +1113 / −111 行；另加本报告 | 未改依赖、门禁、超时或性能阈值 |

## 3. 关键结论与数值

- `first-sleep.v1` 可配 `str/con/bre/wis/agi/wil`，锁定 `luk/cha`；底值 35、预算 90、范围 20–80，总和 `6×35+90=300`，均衡 / 默认均为六项 50。
- ch00：`−482`、LOW、Lv10 / 层9、外来压制4、`countsRealLevel=false`；ch10：`702–703`、LOW、Lv20 / 层8、外来压制4。
- 苏醒点为 `rg_xiyu_beijiang / sc_10_fengshi_feiyi / cold_open`；事务从 `ChapterDef.gameYear.start` 取年，不写死 702。
- 事务销毁全部序章技能，清背包 / 装备 / 金钱 / 同伴并重建章节子树；保留《长生诀》层数及福缘 / 魅力。
- `worldTick = clock.elapsedTicks = ChapterDef.startTick`，不补跑、不消耗 RNG；`meta.contentHash` 与目标包清单及 TSAV 头一致。

## 4. 开放问题（附默认值）

- CONTENT-ch10 尚无权威 spawn ID；本任务默认 `cold_open`，内容任务可在发布前以稳定 ID 替换章节定义。
- 权威初眠事件 ID 尚未进入内容；测试 / golden 默认 `slp_first_changbai`，正式内容须提供并沿用同一 `slp_*` 约束。
- 一般书眠仅声明 `BookSleepPlan` / `BookSleepResult`；默认继续拒绝除 ch00→ch10 外的过渡为 `BOOK_SLEEP_UNSUPPORTED`。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无；实现服从现行初眠特例与协调者两项裁定，不以代码反改基准。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `docs/tech/05-gameplay-engine.md` §3.4：同步实际命令形状 `chapter/bookSleep {plan}` 及内容预载边界。
- `docs/design/14`：移除仍以天龙开局与旧 3/3/3 为入口的描述，改为白马第一书及 3 武功 + 3 内功。
- `docs/00-canon.md` §6：统一内息稳定键为 `bre`；`content/world/ch10/map.yaml`：1725–1726 年旧清初地图另行迁移 / 淘汰。
- 白马文档：统一“难度 3”与现行 D2；不得用实现私自选择其中一方。
- CONTENT-ch00 / ch10：每包必须发布唯一 `book-world.v1` 叶，含时代、年份、tier、上限、压制、tick、实等级计数与 wake 三元组。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 状态、版本与迁移

| schema 2 旧态 | schema 3 新态 |
|---|---|
| 先天七键 | 加 `bre`；迁移默认 0，不引入公式 |
| 无持久进度树 | `progression.{changshengLayer,sleepPoints,bookSleepLog,changshengLayerReceipts,prologueModeReceipt}` |
| 章节无时代 / tier | `chapter.{eraLayerId,worldTier}` |
| 导航无挂载态 | `world.navigation.pendingMount` |

- ✅ `SAVE_SCHEMA=3`；迁移链 1→2→3，2→3 为纯函数，连续执行两次逐字节一致，不凭旧档猜造回执。
- ✅ 续作校验已修复：`schemas/world.ts` 恢复为基线 40 行及原 `BookWorldDef` 契约；新增章节叶由注册表显式交给 `ChapterDefSchema`，不再覆盖旧 schema。

### 命令校验、拒绝码与事件

| 拒绝码 | 条件 |
|---|---|
| `BOOK_SLEEP_UNSUPPORTED` | 非 ch00→ch10 或源章节不符 |
| `BOOK_SLEEP_BUSY` | battle / dialogue 非空 |
| `BOOK_SLEEP_NOT_READY` | 未获第一层、序章未结算或无主角 |
| `BOOK_SLEEP_PLAN_INVALID` | ID / 规则版 / 来源 / 列表形状不合法，或初眠携带一般书眠选择 |
| `BOOK_SLEEP_PLAN_CONFLICT` | 同 `plan.id` 的规范计划不同；完全相同则无操作 |
| `BOOK_SLEEP_ALLOCATION_INVALID` | 非恰好六键、含锁定键、越界、非整数或总和不符 |
| `BOOK_SLEEP_CONTENT_UNAVAILABLE` | 目标定义、tier 或 64 位内容 hash 缺失 / 不符 |

- ✅ 成功依次发 `chapter/bookSleepCommitted`、`world/eraChanged`、`chapter/woke`；事务失败状态与版本均不变。
- ✅ 完整 / 摘要 / 跳过均经 `story/prologueRouteSettled` 内容授权授第一层；完整与跳过最终只差模式回执。
- ✅ 查询 `Core.firstSleepAllocation(draft?)` 返回规则版、键、底值、上下限、预算、总和、草稿、balanced 预设和锁定键；命令记录 `manual|balanced|default`。

### 裁定、宿主、测试与交接

- ✅ 年份只读 `ChapterDef.gameYear.start`；夹具断言 ch10 为 702、`worldTick==elapsedTicks`，不补跑。
- ✅ 初眠前只写一次普通自动档，不建 `save_booksleep_ch00`；挂载成功后才写 `save_wake_ch10`，失败不写醒档。
- ✅ 100 次“跳过 + 书眠”主线程 / Worker 规范 hash 相同；配点查询和提交均保持五流 RNG；非法六类配点回滚。
- ✅ golden 三检查点 hash：`d0c3acc6…`、`8098e31d…`、终态 `912e9608…`；覆盖清空、层1、锁定属性、动态年份 / tick 与事件。
- ✅ 六条指定命令均原样通过，未设置 `VITEST_MAX_WORKERS`：`pnpm check` 默认并发通过 121 文件 / 845 项（8.54s），内容校验 925 文件，构建与体积门禁通过；独立复跑内容构建 922 对象 / 15 章、core 42 文件 / 451 项、game 21 文件 / 76 项、game build 与严格 ID 检查也均通过。
- ✅ 本轮返修确认集成分支的夹具化数据构建测试消除了固定 5 秒冷启动超时；未修改测试、超时阈值、跳过逻辑或已通过的书眠实现。
- ✅ 体积门禁通过：entry 167.53/170 KiB、webgl 330.55/350 KiB；Worker 工厂按需分包，未改预算。
- ✅ ENG-19 只需消费 `firstSleepAllocation` 投影并提交上述命令，不自行写状态；CONTENT-ch00 / ch10 按 §6 的 `ChapterDef` 契约交付。
- ⚠️ 文档漂移清单已在 §6 完整登记；`cold_open` 与 `slp_first_changbai` 仍待内容负责人定权威值。
