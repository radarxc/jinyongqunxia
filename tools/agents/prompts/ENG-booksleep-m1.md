# 本任务：游戏工程 · 书眠与章节切换（M1：序章结束 → 长白山初眠配点 → 白马（唐）冷入口）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。

先读：
- 根 `CLAUDE.md`、`packages/core/CLAUDE.md`、`apps/game/CLAUDE.md`；
- 报告 `tools/agents/reports/ENG-17a-newrun-dialogue.md`（新游戏入口、对话与剧情命令、序章模式回执）、`ENG-15-core-bus.md`、`ENG-18-content-build.md`：第 7 节交给本任务的接口必须照做——命令总线、`CoreTransaction`、MetaState 版本字段、迁移链、书界包、`contentHash`、`fixupContentRefs`；
- 设计报告 `DES-changsheng-core.md`、`DES-prologue-v2.md`、`DES-attr-v2.md`、`DES-baima-tang.md`（均在 `tools/agents/reports/`）。

## 为什么做

作者决定（`docs/decisions/author-requirements.md` AR-26 / AR-27 / AR-29）：M1 终点是「书眠进入白马（唐）冷入口」。路线图 `docs/tech/09-roadmap.md` §3.1 / §3.3 / §3.5 的 M1 行。

M1 只需要这一段：序章结束（阿青传《长生诀》第一层）→ 长白山雪崩初眠 → 沉睡中六项属性配点 → 在白马（唐）最前期苏醒。

一般书眠（保留 3 武功 + 3 内功、60% 转化、各书休眠事件、同伴、经济钩子）本任务只声明类型，不实现。

现状（集成分支实测；开工先自己核对一遍，以实际代码为准）：
- 新游戏写死天龙：`packages/core/src/api/index.ts` 的 `createCore` 用 `'ch01_tianlong'` / `'epoch_ch01'` / 1093；`apps/game/src/runtime/bootstrap.ts` 也写死 ch01；`quest/runtime.ts` 默认 1093。
- 没有书眠、`changshengLayer`、`sleepPoints` 的任何代码；`sleep` 只出现在 `sleepAtInn`。
- `innate` 只有七项，没有内息（`bre`，见 DES-attr-v2）。
- `content/` 下没有 `chapters/ch00_yuenv`、`ch10_baima`；`content/world/ch10/map.yaml` 是旧的清初版，不在本任务范围。

## 规格（照这些写，不自创）

- `docs/design/25-changshengjue.md`《长生诀》：
  - §1：`sk_changshengjue` 是 `story_art`，不占 3+3，第一层由阿青传授；序章的九层预览离章即失效；
  - §2：层数与书眠预算；§8 苏醒取舍（第一步是六项配点）；§11 存档字段 `changshengLayer`；§12 校验。
- `docs/00-canon.md`：
  - §1 书眠、识海、时代图层；§2 书序（白马第一）；
  - §3 规则 6：书眠清空金钱、普通物品、门派、资源、任务、在队同伴，属性保留；
  - §6 先天属性与可配点集合。
- `docs/design/02-timeline-and-world-tiers.md`：
  - §1.2 ch00 特例：levelCap 10、layerCap 9、`countsRealLevel:false`、跳过路径、初眠；§1.5 `ChapterDef.gameYear`；
  - §4.2 BS_COMMIT 是唯一原子写，`plan.id` 幂等；§4.3 BS_ALLOC；§4.5 存档槽与草稿；
  - §4.6 `BookSleepPlan` / `BookSleepResult` 与 `commitBookSleep`；
  - **§4.7 ch00→ch10 特殊过渡：只做六项配点，不做 3+3 与转化，在唐代白马最前期苏醒**；§9 R02-V09。
- `docs/design/13-progression-and-endings.md` §6.2 书眠保留与清空；§9.1 `save_wake_chNN`；§9.4 MetaProfile 是账号级，不进 GameState。
- `docs/design/01-vision-and-core-loop.md` §8.4–§8.5：序章教学武学全部销毁；完整 / 摘要 / 跳过三条路都走到同一个配点与第一层。
- `docs/design/11-open-world.md` §1.6：先卸旧时代、挂目标区域，挂载成功后才写 `save_wake`；§12.5 EraLayer。
- `docs/design/03-attributes.md` §2.4.1：初眠预算（DES-attr-v2 合入后的版本）。
- `docs/design/chapters/00-yuenv.md`（DES-prologue-v2 合入后的版本）：`sc_00_changbai_cave`、`TRANSMISSION_COMMIT` 与 `FIRST_SLEEP_COMMIT` 两个事务、模式 full / summarized / skipped、配点来源 manual / balanced / default、YAML 闭包夹具。
- `docs/design/chapters/10-baima.md` §2.2 苏醒点、§2.7 品德保留 / 名望重置；`docs/design/story/10-baima.md` §2.4 M1 停点。
- `docs/tech/05-gameplay-engine.md`：
  - §2.1 书眠归 `progression/`；§3.1 MetaState；§3.2 章节态，及书眠前 `battle` / `dialogue` 必须为 null；§3.3 `world.navigation`；
  - §3.4 不提供公开的「给予 / 授予」命令；§3.6 大事务整份检查点；
  - §4.2 五流 RNG 跨书延续、不重播种；§5.3 书眠时重建纪元、不补跑；
  - §5.4 `world/eraChanged` 在书眠事务内发出：宿主预载书界包，事务内不联网；挂载失败留待处理状态，不重做书眠；
  - 测试 W-07、W-11、N-06；§14.1–§14.2 读档与迁移顺序；§15 必须有书眠 golden。
- `docs/tech/08-backend-and-online.md` §3.2 存档头 `contentHash` = `meta.contentHash`；§3.5 迁移链；§3.6 `fixupContentRefs`。

## 两处裁定（协调者 10-02，作者可推翻）

1. **白马年份**：以 chapters/10 的 702–703 为准（canon 等处的 640–641 由文档同步任务改）。本任务**一律从 `ChapterDef.gameYear` 读，不写死任何年份**；ch10 章节定义写 702–703，测试用夹具值。
2. **初眠前存档**：只做一次自动存档，不新增 `save_booksleep_ch00` 槽位；`save_wake_ch10` 照 design/13 §9.1 写。

## 要做的事

1. **章节定义**：`ChapterDef` 最小 schema，可扩展现有未用的 `book-world.v1`。字段：时代图层、`gameYear`、`worldTier`、levelCap、layerCap、外来压制、起始 tick、苏醒点 `{regionId, sceneId, spawnId}`。在 `content/chapters/ch00_yuenv/`、`ch10_baima/` 各放一份章节定义。
2. **新游戏入口已由 ENG-17a 提供**：本任务在它之上补章节定义，并让新档的章节取 `ch00_yuenv` 的定义；不另做新游戏流程。
3. **状态**：
   - `profile.progression` 加 `changshengLayer`（0–9）、`sleepPoints`、`bookSleepLog[]`；
   - 加序章模式回执；
   - `chapter` 加 `eraLayerId`、`worldTier`；
   - DES-attr-v2 已合入时，`innate` 加 `bre`，只加键，不加公式；
   - `saveSchema` 升一版，挂纯函数迁移补默认值。
4. **第一层的授予**：完整 / 摘要 / 跳过三条路都经内容授权路径得到第一层，不开公开的授予命令。
5. **`chapter/bookSleep { plan: BookSleepPlan }`**，本任务只接受 ch00→ch10 特殊过渡：
   - `plan.id` 幂等；要求 `battle` / `dialogue` 为 null，且层数 ≥ 1；
   - 恰好六个键，预算与范围取规则表，并记录规则版本；
   - 销毁序章教学武学；清空背包、装备、金钱；
   - 切换章节、时代、时钟与 `worldTick`；重置章节子树；
   - `world.navigation` 指向苏醒点（待挂载）；`meta.contentHash` 设为 ch10 包的值；
   - 发事件 `chapter/bookSleepCommitted`、`world/eraChanged`、`chapter/woke`；
   - **不消耗 RNG**。其他过渡一律拒绝 `BOOK_SLEEP_UNSUPPORTED`，一般书眠只声明类型。
6. **配点查询**（只读）：规则版本、可配的键、底值、上下限、预算、当前草稿、预设（一键均衡）、锁定的键（福缘 / 魅力）。不写死 300 / 50 / 6。提交带配点来源 manual / balanced / default（chapters/00 §7.4），写进回执。
7. **宿主薄接线**：
   - dispatch 前预载并校验 ch10 书界包；
   - 挂载成功后写 `save_wake_ch10`；
   - 初眠前自动存档；
   - 存档页显示书眠 / 苏醒槽。配点界面归 ENG-19，本任务只给查询与命令。
8. **测试**：
   - 同状态 + [跳过, 书眠] → 规范 hash 一致 100 次，主线程宿主 = Worker 宿主；
   - 提交与配点查询都不动五流 RNG；
   - 非法配点（总和不对、越界、含福缘 / 魅力、七个键）被拒，状态无差异、版本不变；
   - 重复 `plan.id` 无操作；
   - `worldTick == elapsedTicks`、`worldYear == gameYear.start`、时代为 ch10、不补跑；
   - 完整与跳过两条路只差模式回执；
   - 清空项与层数 1、福缘 / 魅力不变；
   - 迁移夹具 n→n+1 两次逐字节相同；
   - 初眠 golden 照 tech/05 §4.6 格式；
   - `meta.contentHash` 等于 ch10 清单 hash，且存档头一致。

约束：
- 写集：
  - core：`packages/core/src/{progression,state,command,api,world}/**`、`packages/core/src/quest/runtime.ts`（只改纪元默认值）、`packages/core/CLAUDE.md`；
  - data / 内容：`packages/data/src/schemas/**`、`packages/data/src/content-index.ts`、`packages/data/src/content-registry.ts`、`content/chapters/ch00_yuenv/**`、`content/chapters/ch10_baima/**`；
  - 应用：`apps/game/src/runtime/**`、`apps/game/src/storage/**`、`apps/game/src/core-host.ts`、`apps/game/src/core-worker.ts`、`apps/game/src/game-controller.ts`、`apps/game/CLAUDE.md`；
  - `packages/platform/src/storage/records.ts`（只在槽位规则要改时）。
  - 写集外的改动在提交时会被丢弃。
- **不改**：
  - `packages/core/src/{battle,buff,ai,replay,testing}/**`、`packages/core/bench/**`；
  - `apps/game/src/battle/**`、`apps/game/src/render-host.ts`、`packages/render/**`、`packages/ui/src/i18n.ts`；
  - `docs/**`、`content/story/**`、`content/world/**`。
  - 命令注册表只加一行。
- core 禁浮点、禁 DOM、禁墙钟、禁 `Math.random`；每次写入 ≤ 150 行；不加依赖。
- 不得放宽、跳过或改写任何门禁测试。rig 100 角色性能门禁已移出 `pnpm check`（作者 AR-33），改由 `pnpm check:perf` 在负载低时单独跑；不得在测试里加任何「高负载跳过」逻辑，不得改阈值。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm content:build`
- `pnpm --filter @tianshu/core test`
- `pnpm --filter ./apps/game test`
- `pnpm --filter ./apps/game build`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：
- 状态字段新旧对照、`saveSchema` 与迁移；
- `chapter/bookSleep` 的校验与拒绝码表、事件表；
- 两处裁定的落实；
- 测试与 golden；
- 文档漂移清单（tech/05 §3.4 的命令形状、design/14 仍写天龙与 3/3/3、canon §6 内息 ID、`content/world/ch10/map.yaml` 过时、白马难度 3 与 D2 不一致）；
- 交给 ENG-19（配点界面要用的查询与命令）、CONTENT-ch00 / ch10（章节定义字段）的接口。

报告 ≤ 100 行。
