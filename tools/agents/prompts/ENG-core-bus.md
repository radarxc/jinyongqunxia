# 本任务：游戏工程 · core 命令总线与状态归位（Command 联合与事务 journal / GameState 补字段 / 10 Hz 探索驱动 / 去掉 ui-session 边车）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。

先读：
- 根 `CLAUDE.md`、`packages/core/CLAUDE.md`、`apps/game/CLAUDE.md`、`packages/platform/CLAUDE.md`；
- 报告 `tools/agents/reports/ENG-02-models.md`、`ENG-05-story-time.md`、`ENG-06-items-world.md`、`ENG-08-worldmap.md`、`ENG-09-town-scene.md`、`ENG-13-save-formal.md`。ENG-13 报告第 7 节"交给 core 命令总线 / saveSchema 任务的接口"必须照做。

## 为什么做

路线图 `docs/tech/09-roadmap.md` §3.3 core 行，M1 要求"单线程状态树、命令 / 事件、10 Hz……存读档"。

M1 玩家路径是新游戏 → 序章 → 书眠。后续的战斗补全（ENG-16）、书眠与章节切换（ENG-17）、UI 主流程（ENG-19）、整局录像（ENG-22）都需要同一个入口：
- 所有玩法写入经 core 的一个命令总线，在一个可回滚事务里提交；
- 存档只存 `GameState`。

现状（集成分支实测；开工先自己核对一遍，以实际代码为准）：
- `packages/core/src/command/index.ts` 的 `Command` 只有 `WorldTickCommand`。
- `packages/core/src/api/index.ts` 的 `Core.dispatch` 只接 `world/tick`，返回 `{ accepted, events }`；没有事务、没有 journal、没有拒绝原因。
- 规则写入实际发生在应用层：`apps/game/src/runtime/session.ts` 自己拼 `world/tick`、`worldmap/*`、`inventory/*` 的新状态（ENG-09 合入后还有城镇命令），自己加 `stateVersion` / `nextEventSeq`。应用层成了第二个规则入口。
- `GameState`（`packages/core/src/state/models.ts`）：
  - 缺 tech/05 §3.1 的 `saveSchema`、`masterSeed`、`contentHash`、`debugTainted`；
  - 没有玩家位置；
  - `transient.dialogue`、`transient.battle` 与根 `battle` 重复，且恒为 null。
- 相遇（`known`）、道具用量（`usage`）、道具目标（`itemTargets`）、位置文字（`location`）放在应用侧边车 `SessionSnapshot` 里（`schema: 'ui-session.v1'`，见 `apps/game/src/runtime/contracts.ts`）。存档存的也是这个边车。
- 没有 10 Hz 探索驱动。全仓只有 `main.ts` 里 30 s 自动存档的 `setInterval`；世界时间只靠手动发 `world/tick` 或大地图步进。

## 规格（照这些写，不自创）

- `docs/tech/05-gameplay-engine.md`：
  - §3.1 根状态与 `MetaState`；
  - §3.2 生命周期表（字段放哪个根）；
  - §3.3 `WorldState.navigation` 与 `pendingTimeAdvance`；
  - §3.4 命令、事件与 `DispatchResult`；
  - §3.5 命令事务：7 步流程、journal、RNG 局部副本、失败全回滚；
  - §3.6 可变策略：生产环境不整树深拷贝；
  - §3.7 快照与投影；
  - §3.8 `causeId` / `parentSeq` 与三类错误；
  - §5.1 `TICK_HZ` 等常量；
  - §5.2 单 tick 事务、`WORLD_PAUSED`、每帧至多 5 tick、积压丢弃；
  - §5.8 世界时间测试 W-01、W-02、W-06、W-09；
  - §10.3 `DialogueState` 字段；
  - §12.1 NPC 运行态。
- `docs/tech/01-architecture.md`：
  - §6.2 主循环（`apps/game/src/loop.ts` 累加器示意）；
  - §6.9 存档时机。
- `docs/tech/08-backend-and-online.md` §3.5：schema 版本与迁移链，`saveSchema` 的登记与升级。

## 要做的事

1. **命令总线（core）**
   - `packages/core/src/command/` 的 `Command` 联合收编现有全部**非战斗**玩法命令：`world/tick`、`worldmap/*`、`inventory/equip|unequip|use`，以及 ENG-09 的城镇 / 打坐命令（以合入后的实际命令为准）。
   - 每类命令一个 handler：`validate(read, cmd)` 返回拒绝原因或 null；`apply(tx, cmd)` 写状态。按判别字段查表，未知命令拒绝。
   - `CoreTransaction` 提供：只读 `state`；`set` / `splice`（首次写入时把旧值登记进 journal）；`rng(stream)`（五流局部副本，成功才提交）；`emit`；`abort(reason, at?)`。
   - 流程照 §3.5 七步。异常或 `abort` 时逆序回滚 journal，丢弃 RNG 副本与暂存事件，版本不变。
   - `Core.dispatch` 返回 §3.4 的 `{ ok: true, stateVersion, events } | { ok: false, reason, at? }`。
   - 事件带 `seq`、`stateVersion`、`causeId = stateVersion:commandOrdinal`、`parentSeq`、`payload`；`RejectReason` 是稳定代码，不含本地化文本。
   - 现有 worldmap、inventory、城镇 runtime 的纯函数保留，handler 只把它们包进事务，不复制公式。
   - **战斗命令本任务不收编**：`apps/game/src/battle/**` 不动（ENG-11 特效在改），战斗进总线由 ENG-16 做。session 里的 `battle/*` 仍转给现有 `BattleRuntime`。
2. **状态归位（core）**
   - `MetaState` 补 §3.1 的 `saveSchema`、`masterSeed`、`contentHash`、`debugTainted`。内容管线（ENG-18）接入前，`contentHash` 用固定占位，报告写明。`runId` 能确定性生成就补，否则报告说明。
   - 代码审计 S2 追加（`tools/agents/reports/AUDIT-code-20261002.md` §3.1）：
     - `MetaState` 再补 `rulesProtocol`、`coreBuild`（tech/05 §14）；
     - core 导出常量 `RULES_PROTOCOL`，当前为 3（design/21 §12），回放与存档都从这里取，不再由调用方随手填。
   - 根结构对齐 §3.1：
     - 根 `battle: … | null`、根 `dialogue: DialogueState | null`（§10.3 字段）；
     - 删掉 `transient.dialogue` / `transient.battle` 的重复占位；
     - `pendingTimeAdvance` 和玩家位置（§3.3 `world.navigation` 的 M1 子集）进 `world` 根；
     - 已有的 `chapter.worldMap` 与 ENG-09 城镇态**不搬家**，报告列出它们与 §3.3 的差异。
   - 边车四个字段按 §3.2 生命周期表与 §12.1 放进正式子树：
     - `known`（相遇 / 结交 / 好感）是当界 NPC 运行态；
     - `usage` 里 `chapterUses` 随 chapter，`battleUses` 只在战斗内存在；
     - `itemTargets` 能由角色状态推导的就不另存；
     - `location` 显示串不存，由 `world.navigation` 投影出来。
     - 报告给逐字段归位表与依据章节。
   - `createInitialGameState`、`parseGameState`、`assertCanonicalGameState` 同步更新。
   - `saveSchema` 升一版，在迁移链登记一个纯函数迁移：旧 `ui-session.v1` 负载（ENG-13 合入前后的本地档与导出档）→ 新 `GameState`，边车字段搬到新位置；迁移失败给枚举错误，不静默丢数据。迁移挂进 ENG-13 的迁移注册表（看它的报告与代码）。
3. **10 Hz 探索驱动（apps/game）**
   - 新建 `apps/game/src/loop.ts`，照 tech/01 §6.2：
     - `requestAnimationFrame` 帧里按 `TICK_MS = 100` 累加，每帧最多 5 个 `world/tick`，仍有积压就丢弃；`dt` 上限 250 ms；
     - 页面 hidden，或菜单 / 对话 / 战斗 / 加载 / 存档进行中时，host 不发 tick；
     - Worker 往返期间不叠发：上一个 tick 没返回就不发下一个（背压），积压按丢弃处理。
   - core 侧 `world/tick` 的 `validate`：`dialogue` 或 `battle` 非空，或处于 §5.2 表里不推进的状态时，返回 `WORLD_PAUSED`，不改版本与事件序号。
   - 场景自己声明是否跑世界 tick。大地图旅行按 ENG-08 / 09 的实际行为接入，不改里程规则。
   - UI 现在手动发 `world/tick` 的入口，改为由驱动推进，或只留作开发调试入口。
   - 墙钟只在 app 层；core 不接收 `dt`。
4. **去边车（apps/game）**
   - `SessionSnapshot` 只剩 `GameState`。`preview` 这类应用元数据放存档头或存档元数据，不进规则状态。`ui-session.v1` 只出现在迁移代码和测试里。
   - `session.ts` 改成薄适配：命令转给 `core.dispatch`，按事件 / 脏分支更新投影，不再自己改 `stateVersion` / `nextEventSeq`。
   - `createPreviewSession` 改为由 core 初始状态加夹具命令构造，仍标明是演示夹具。
   - `GameUpdate` 对外形状（`accepted` / `changes` / `events` / `error`）保持不变，UI 组件不改。`packages/ui/src/ui-bus.ts` 的命令类型随 core 联合调整，只改类型。
5. **版本兼容与错误分类**（代码审计 S2、H6、L6、L8，见审计报告 §3）
   - **读档不再要求严格相等**：`apps/game/src/runtime/validate.ts:24-25` 现在要求 `coreVersion`、`rngProtocol` 严格相等。改为：
     - 存档版本较低：走迁移链；
     - 存档版本较高：返回专门的「存档较新」错误码；
     - 版本不兼容用专门的 `StorageErrorCode`，`packages/platform/src/storage` 的三代回退据此**不把它当作损坏**去回退。
   - **错误分类**：只有白名单里的 `RejectReason` 返回 `ok:false`。`TypeError`、越界、`INT_OVERFLOW` 这类内部错误要上抛，中止当前会话，并显示为内部错误，不能伪装成「操作无效」。
     - 本任务改 `packages/core/src/progression/index.ts:45-48` 和 `apps/game/src/runtime/session.ts:122-124` 两处 catch-all。
     - 战斗与经脉里的同类代码归 ENG-16 系列，不改。
   - **存档摘要**：`apps/game/src/storage/save-service.ts:50-73` 的 `playTimeSec`、`lr / ld`、`gameTime` 都是占位值，改为取 core 提供的真实摘要投影。
   - **core 里的 `structuredClone`**：`quest/runtime.ts:49` 这一处，换成 core 内的 JSON 深拷贝工具，或者显式允许并写进 `packages/core/CLAUDE.md`，二选一，报告说明。`battle/**` 里的两处不改。
6. **测试**
   - 事务：第 k 步写入后抛错，状态、五流 RNG、版本、事件序号逐字段回到命令前；`abort` 同理；未知命令被拒绝。
   - 每个收编命令：一条成功路径、至少一条拒绝路径；事件 `seq` 连续，`causeId` / `parentSeq` 正确。
   - §5.8：W-01（1200 tick 恰好一时辰）、W-02（hidden 30 分钟，0 次补跑）、W-06（对话停时 tick 不变）、W-09（一帧补 5 次与 5 帧各 1 次，版本 / 事件 / RNG / 规范 hash 相同）。
   - 迁移：旧 `ui-session.v1` 夹具 → 新状态，四个边车字段逐一核对。
   - 版本：低版本存档走迁移后读入；高版本得到「存档较新」错误码，且不触发三代回退；内部错误不会被吞成拒绝。
   - 同一命令序列在主线程回退宿主与 Worker 宿主得到同一规范 hash。
   - 性能：Node 下单次 `world/tick` dispatch（不含 Worker 往返）记录 P50 / P95，写成 `packages/core/bench/*.test.ts`。`test:performance` 按目录自动收入（不用改 `package.json`），根 `pnpm test` 也会跑到它，所以照 `combat.test.ts` 的写法：best-of-N，硬断言只设留足余量的上限；P95 > 0.5 ms 时在报告里给出原因，不作硬断言。机器高负载下不得放宽或跳过已有的性能门禁。

约束：
- 写集：`packages/core/src/**`、`packages/core/bench/**`、`apps/game/src/*.ts`、`apps/game/src/App.vue`、`apps/game/src/runtime/**`、`apps/game/src/storage/**`、`apps/game/src/scenes/**`、`apps/game/src/selectors/**`、`apps/game/src/pages/**`、`packages/platform/src/storage/**`（只为在 ENG-13 的迁移链登记迁移，以及版本不兼容错误码与三代回退的区分）、`packages/platform/README.md`、`packages/platform/CLAUDE.md`、`packages/ui/src/projections.ts`、`packages/ui/src/ui-bus.ts`（这两个只改类型）、`packages/core/CLAUDE.md`、`apps/game/CLAUDE.md`。写集外的改动在提交时会被丢弃，所以不要改写集外的文件。
- 迁移函数本身是纯 JSON → JSON（tech/05 §14.2 的 `StateMigration`），按 GameState 结构写在 core；platform 那边只做登记与调用。
- `loop.ts` 只驱动世界 tick，不接管渲染循环；`render-host.ts` 不改。
- **不改**：`packages/core/src/battle/**`（ENG-14 / ENG-16 的范围）、`apps/game/src/battle/**`、`apps/game/build/**`、`packages/data/**`（ENG-18 在改）、`packages/render/**`。确实需要改这些才能完成的，在报告里写明需要什么，不要改。
- `App.vue` 改动 ≤ 30 行。
- 分层：规则只进 core；app 只装配、计时、转发；core 禁浮点、禁 DOM、禁墙钟。
- 每次写入 ≤ 150 行；不加新依赖；不改根 `packages/core/src/index.ts` 的导出布局，新导出走子目录 index。

性能是作者硬要求（AR-21「性能要最好」）：热路径零分配，journal 只记首次写入，投影只更新脏分支。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm --filter @tianshu/core test`
- `pnpm --filter @tianshu/core test:performance`
- （apps/game 的测试由根 `pnpm check` 覆盖。包内 `pnpm --filter ./apps/game test` 加载 `vite.config.ts` 会失败：`packages/data/src/tooling.ts` 的无后缀 ESM 导入。这是集成分支的已知问题，另有任务修，不在本任务范围，不要改。）
- `pnpm --filter ./apps/game build`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：
- 命令表：命令 → handler 文件 → 拒绝原因 → 事件；
- 事务与 journal 设计，回滚测试结果；
- GameState 新旧字段对照，含边车四字段的归位表与依据章节；`saveSchema` 版本与迁移；
- 10 Hz 驱动：暂停条件表、背压与丢积压策略、W-01 / 02 / 06 / 09 结果；
- 性能数据；
- 版本字段、`RULES_PROTOCOL`、读档兼容规则与错误码表；
- 交给 ENG-16c（战斗进总线；战斗创建时在同一事务里从 world 流抽 seed 的接口）、ENG-17（书眠 / 章节切换）、ENG-19（UI 主流程）、ENG-22（整局录像）的接口：放哪、怎么测、接口名。

报告 ≤ 100 行。
