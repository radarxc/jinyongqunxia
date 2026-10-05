# ENG-15-core-bus 报告 · 游戏工程 · core 命令总线与状态归位（Command 联合 / 事务 journal / GameState 补 saveSchema·位置·账本·对话与战斗槽 / 10 Hz 探索驱动 / 去 ui-session 边车）

## 1. 摘要（3–6 行）

- 非战斗玩法的 15 类命令已统一进入 core 判别联合与事务总线；拒绝不改状态，内部错误回滚后上抛。
- `GameState` 已补协议元数据、世界位置/待推进时间、根对话/战斗槽及章节 NPC/道具账本，运行时快照只剩该状态树。
- 已登记 `saveSchema 1 -> 2` 的纯迁移，并区分较新存档、协议不兼容、损坏与迁移失败。
- app 已接入带暂停、背压和积压丢弃的 10 Hz 世界驱动；全部指定安装、检查、测试、构建与 ID 门禁通过。

## 2. 产出（文件、行数、主要章节）

- 命令总线：`command/index.ts` 59 行、`bus.ts` 106 行、`transaction.ts` 84 行、`handlers.ts` 227 行；事务/handler 测试 290 行。
- 状态：`models.ts` 68 行、`initial.ts` 41 行、`migrations.ts` 96 行、`summary.ts` 21 行、`json.ts` 9 行；同步更新严格解析与状态测试。
- app：`loop.ts` 90 行、`loop.test.ts` 58 行；重构 session/controller/bootstrap/projection/main/App 与相关测试，新增 72 行宿主一致性测试。
- 续作完整性：`contracts/item-adapter/session/validate/state-index` 为 48/37/194/100/28 行；结构化展开且恢复成对装备校验，未恢复边车。
- 存档/platform：更新 `save-service.ts`、`runtime/validate.ts`、storage error/store/tests，兼容 TSAV 与旧 TSUI 导入。
- 性能：新增 `bench/world-tick.test.ts` 27 行；文档同步 core/game/platform 三份 CLAUDE 及 platform README。
- 共触及 52 个写集内路径（38 个已有文件、14 个新文件，含本报告）；未改 battle/data/render 禁区。

## 3. 关键结论与数值

- 固定协议：`SAVE_SCHEMA=2`、`RULES_PROTOCOL=3`、`RNG_PROTOCOL=2`、`CORE_BUILD=20261002-core-bus`；`runId` 由 `masterSeed` 确定生成。
- 时钟：`TICK_HZ=10`、`TICK_MS=100`、`TICKS_PER_SHICHEN=1200`；帧间隔封顶 250 ms，每帧最多提交 5 tick。
- 成功结果为 `{ok:true,stateVersion,events}`，拒绝为 `{ok:false,reason,at?}`；事件连续编号并携带版本、`版本:命令序号` causeId、parentSeq 与 JSON payload。
- 存档摘要真实读取地点、`floor(worldTick/10)` 游玩秒数、队伍和 debug 状态；尚无规范字段的等级/余韵/天书/命数/难度暂用 1/0/默认难度。
- world tick 单进程 best-of-5（每轮预热 500、采样 2000）：P50 0.0070 ms，P95 0.0075 ms；P95 低于 0.5 ms。
- core 的 quest 深拷贝改用受检 JSON clone；battle 禁区内既有 `structuredClone` 未动。

## 4. 开放问题（附默认值）

1. ENG-18 接入内容管线前，新游戏 `contentHash` 默认 64 个 `0`；旧档迁移优先保留存档头 hash。
2. 正式新游戏暂无 bootstrap/debug 命令；默认仅 preview 直接装配 core 初态夹具并置 `debugTainted=true`，交 ENG-19。
3. 旧档非空 `battleUses` 无可安全归属的活动战斗；默认报 `MIGRATION_BATTLE_USES_ACTIVE`，不静默丢失，交 ENG-16c。
4. 摘要缺少正式等级/余韵/天书/命数/难度来源；默认使用中性值，待对应状态所有者补字段后替换。
5. AR-21 已做到无整树 clone、journal 仅首次写、投影仅脏分支；既有不可变规则及事务/事件仍分配小对象，尚非字面“零分配”。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| ENG15-P01 | tech/05 §3.3 登记 M1 过渡结构：`chapter.worldMap/town` 保留，`world.navigation` 为稳定位置摘要 | 避免后续代理误判为已完成完整 WorldState 搬迁 |
| ENG15-P02 | tech/05/08 补存档摘要字段的唯一状态来源与缺省规则 | 消除等级、天书等 UI 元数据再次成为边车的风险 |
| ENG15-P03 | tech/05 §3.6 将“零分配”细化为预算及测量口径 | 当前纯函数不可变更新必然产生小对象，应以基准和 profile 验收 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 同步内容 |
|---|---|---|
| `docs/tech/05-gameplay-engine.md` | §3.1/3.3/3.4/14 | `saveSchema=2`、`RULES_PROTOCOL=3`、M1 位置摘要、稳定错误与迁移失败语义 |
| `docs/tech/01-architecture.md` | §6.2/6.9 | hidden/暂停/背压清积压、250 ms/5 tick 上限及迁移后摘要重算 |
| `docs/tech/08-backend-and-online.md` | §3.5 | schema 1→2 注册项；较新/协议错误不触发三代损坏回退 |
| `docs/tech/09-roadmap.md` | §3.3 | 标记非战斗命令总线与 10 Hz 驱动完成，战斗仍归 ENG-16c |
| ENG-16c/17/19/22 任务说明 | 接口交接 | 采用下节列出的事务、bootstrap 与录像契约 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 命令表

| 命令 | handler | 稳定拒绝原因 | 事件 |
|---|---|---|---|
| `world/tick` | `handlers.ts:worldTickHandler` | `WORLD_PAUSED` | `world/ticked`、`world/timeBoundary` |
| `worldmap/travel/step/cancel/resume/enter/leave` | `worldMapHandler` | `MAP_*`、`TOWN_UNAVAILABLE` | 既有 `worldmap/*`、`world/*`、时间边界 |
| `town/move/settle-building/exit-building/interact/meditate` | `townHandler` | `TOWN_*` | accepted/moved/anchor/shop/dialogue/meditation/battleRequested |
| `inventory/equip/unequip/use` | `inventoryHandler` | `EQUIPMENT_*`、`INVENTORY_*`、`ITEM_*`、`CONSUMABLE_*` | `economy/*`、progression/时间边界 |
| 未知判别值 | handler 表入口 | `COMMAND_UNKNOWN@t` | 无 |

### 7.2 事务、状态与迁移

- ✅ 七步流为查表→validate→建事务→apply→事件校验/RNG 提交→版本与信封→规范状态校验；异常/abort 逆序 journal 回滚，丢 RNG 副本与事件。测试逐字段核对五流 RNG、版本、事件序号及第 k 步写后失败。
- ✅ `meta` 新增 saveSchema/masterSeed/contentHash/rulesProtocol/coreBuild/debugTainted；`dialogue`/`battle` 移至根，pendingTimeAdvance 与 navigation 移至 world，删除 transient。
- ✅ 边车归位：`known→chapter.npcs`（§3.2/§12.1）；`chapterUses→chapter.itemChapterUses`（§3.2）；`battleUses→活动 BattleState`（本阶段非空拒迁移）；`itemTargets→CharacterState.consumable`（可推导字段冲突即失败）；显示 `location` 不存，由 navigation 投影（§3.3）。
- ⚠️ `chapter.worldMap/town` 按任务要求暂不搬家；与 §3.3 完整 WorldState 仍有差异。schema 1/`ui-session.v1` 经 `CORE_STATE_MIGRATIONS[1]` 纯迁移到 schema 2。

### 7.3 驱动、兼容、测试与下游接口

- ✅ host 暂停：hidden、场景禁 tick、菜单/loading/saving/busy/battle/worldPaused/sessionFailed；core 暂停：dialogue、battle、pendingTimeAdvance、城镇淡入淡出。往返未完成不叠发，暂停/背压/超 5 tick 均清积压。
- ✅ W-01：1200 tick 恰一时辰；W-02：hidden 30 分钟补跑 0；W-06：对话中 `WORLD_PAUSED` 且版本/序号不变；W-09：一帧 5 次与五帧各 1 次的版本、事件、RNG、规范 hash 相同。
- ✅ 低 schema 走迁移；高 schema=`SAVE_TOO_NEW`，协议不合=`SAVE_PROTOCOL_UNSUPPORTED`，缺链/不支持/不可用均不当损坏回退；TypeError/越界/溢出上抛并终止玩法会话。主线程与 Worker 克隆边界同命令序列 hash 相同。
- ✅ `pnpm install --frozen-lockfile`、`pnpm check`（98 文件/573 测试及 rig 2/2）、core test（38/342）、performance（4/4）、game build（289 modules）、严格 ID 检查全部通过；ID 工具仅报告基线已有 `sk_babuganchan`，新增失败 0。
- ✅ ENG-16c：扩 `Command`/根 battle；创建战斗时以 `tx.rng('world')` 同事务抽 seed，battleUses 归 BattleState；测 seed/RNG/状态一体回滚后移除 Legacy/BattleRuntime 旁路。ENG-17：新增 `chapter/bookSleep` handler，battle/dialogue 为空时原子重建 chapter/navigation/time并测失败回滚。
- ✅ ENG-19：补正式 bootstrap 端口，替换 preview 对象夹具；UI 只发 Command、消费 projection/GameUpdate。ENG-22：记录已接受 Command、CommittedDomainEvent、协议五元组与规范 hash；拒绝不入前缀，复用跨宿主 hash 测试。
- ✅ 在线核实（访问 2026-10-02）：[requestAnimationFrame](https://developer.mozilla.org/docs/Web/API/Window/requestAnimationFrame)、[Page Visibility](https://developer.mozilla.org/docs/Web/API/Page_Visibility_API)、[performance.now](https://developer.mozilla.org/docs/Web/API/Performance/now)。
