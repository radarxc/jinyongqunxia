# ENG-17a-newrun-dialogue 报告 · 游戏工程 · 新游戏入口与对话 / 剧情命令（身份、难度、序章模式、Ink 对话进 core；StoryRuntime 事务化，审计 H6）

## 1. 摘要（3–6 行）

- 正式会话现从规范 ch00 新档开始；宿主生成种子，core 原子写入身份、难度与序章初态。
- 非战斗总线新增难度、Ink 对话与 `dc_00_01` 三路选择；对话会暂停世界并阻止手动存档。
- Ink JSON、`storyHash`、说话人和历史已进入 core 状态 / 投影，产品宿主仅做内容与熵源接线。
- 三路各在内容终点写路径回执，再汇合 `first_sleep_to_baima`；重放不重复结算。
- 审计 H6 已修复：状态 / deadline 用副本运算，quest-port 以单个原子批次提交。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 / 变更 | 主要内容 |
|---|---:|---|
| `packages/core/src/state/new-game.ts` | 48 | 规范新档、身份 / origin / seed 校验 |
| `packages/core/src/dialogue/state.ts` | 50 | 对话持久态、session 转换、`DialogueView` |
| `packages/core/src/command/story-handlers.ts` | 145 | 对话、难度、序章选择 / 结算处理器 |
| `packages/core/src/command/new-run-dialogue.test.ts` | 204 | 新档、对话、难度、三路结算回归 |
| `packages/core/src/quest/{runtime.ts,runtime-models.ts,deadlines.ts}`、回归测试 | 4 文件 | H6 原子批提交、快照 / deadline 回滚 |
| `packages/core/src/{api,command,dialogue,state,world}/**`、`CLAUDE.md` | 多文件 | 工厂、总线、模型、迁移、校验与约定 |
| `apps/game/src/runtime/new-game.ts`、测试 | 24 + 78 | 浏览器熵源、宿主新档与 Ink 端到端 |
| `apps/game/src/{runtime/**,core-host.ts,core-worker.ts}`、`CLAUDE.md` | +97 / −32 | 正式 / 演示启动、传输、投影与存档门禁 |
| `packages/ui/src/projections.ts` | +10 | 对话投影类型 |

## 3. 关键结论与数值

- 新档为 `ch00_yuenv / epoch_ch00_yuenv / −482 / sc_00_zhulin`；`masterSeed` 是 uint32，五种 `origin_*` 严格白名单。
- 创角六项战斗底子均为 0，等待初眠配点；福缘 / 魅力初档均为 50。相同参数与种子的规范 hash 相同。
- 三档难度为 `diff_jianghu / diff_xiake / diff_zongshi`；每次成功切换追加 world tick 与 revision 日志。
- `dc_00_01` 的 `select` 只锁定 full→`n_c01`、summary→`n_summary`、skip→`n_skip_direct`；不提前发奖励。
- 各路到 `n_full_complete / n_summary_complete / n_skip_complete` 后调用 `settle`，写唯一 `*/settled` 与共同 `dc_00_01/first_sleep_to_baima` 回执。

## 4. 开放问题（附默认值）

- 天赋三选一需要 RNG，M1 本任务不做；默认不分配天赋，留后续创角 / 初眠实现。
- 正式 ch00 Ink JSON 尚待内容构建注册；默认未知 story 返回 `DIALOGUE_STORY_UNKNOWN`，不使用演示内容兜底。
- 第一层、初眠配点及实际 ch10 切章待 ENG-17；默认只在本文共同出口回执后接入，不在模式选择时提前发奖。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无。实现遵循既有身份、属性、难度、序章与存档事务边界。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `docs/tech/04-data-pipeline.md` §7.1：登记 `#ts:dialogue/speaker speaker=<npcId|player|narrator|book_spirit>`；缺省旁白。
- CONTENT-ch00：构建并注册 `story_ch00_main` 的 JSON / hash；每个发言行写上述标签，intent 回执仍按既有 `#ts:` 幂等约定。
- CONTENT-ch00：三路实际走到各自 `n_*_complete` 后才发 `quest/choose{phase:settle,completionNodeId}`；不得在选择页结算。
- ENG-17：监听 `story/prologueRouteSettled` / 共同回执 `dc_00_01/first_sleep_to_baima`；此后授第一层并进入初眠，summary / skip 另记 `fx_skip_bridge`。
- ENG-19a / 19b：消费 `dialogue` 投影；选择页发 `select`，内容终点适配器发 `settle`，界面不得自行写回执。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 新命令表

| 命令 | 校验 | 拒绝码 | 成功事件 |
|---|---|---|---|
| `dialogue/start` | 无活动对话、story 存在 | `DIALOGUE_ACTIVE` / `DIALOGUE_STORY_UNKNOWN` | `dialogue/started` |
| `dialogue/continue` | 活动、hash 相同、可继续或终止 | `DIALOGUE_INACTIVE` / `DIALOGUE_CONTINUE_UNAVAILABLE` | `dialogue/continued` / `dialogue/completed` |
| `dialogue/choose` | 活动、hash 相同、选项可选 | `DIALOGUE_INACTIVE` / `DIALOGUE_CHOICE_UNAVAILABLE` | `dialogue/choiceCommitted`，终止时再发 `dialogue/completed` |
| `quest/choose` `select` | ch00、合法模式、尚未选择 | `QUEST_CHOICE_UNKNOWN` / `QUEST_CHOICE_COMMITTED` | `story/choiceCommitted` + `story/prologueRouteSelected` |
| `quest/choose` `settle` | 已选同路且到对应 `completionNodeId` | `QUEST_ROUTE_NOT_SELECTED` / `QUEST_ROUTE_MISMATCH` / `QUEST_CHOICE_COMMITTED` | `story/prologueRouteSettled` |
| `rules/setDifficulty` | 三档之一、战斗为空 | `RULES_DIFFICULTY_INVALID` / `RULES_BATTLE_ACTIVE` | `rules/changed` |

- ✅ 新游戏参数：`{masterSeed, identity:{name,gender,appearance,pronoun,originId}, difficulty, contentHash?, coreVersion?, coreBuild?}`；应用传输省略 seed，由宿主补。
- ✅ `DialogueView`：`{storyId,storyHash,entryKey,speakerId,textKey,choices[{choiceIndex,textKey,unavailableReason}],history[{speakerId,textKey}]}`。
- ✅ 说话人约定已实现并测试；缺标签投影 `narrator`，文本规范态去掉一个末尾换行。
- ✅ 对话 start → continue → choose、事件、历史、世界暂停和存档门禁均有 compiled-Ink 端到端测试。
- ✅ 内部 `DIALOGUE_STORY_HASH`、Ink 异常、`STORY_STABILIZE_LIMIT` 继续上抛；领域拒绝仅用白名单码。
- ✅ H6 前后：旧 `choose/stabilize` 会先改实例再抛错；现于 snapshot / deadline 副本运算，quest port 只接受原子 `commit(effects[])`。
- ✅ H6 测试覆盖缺失 edge、稳定化上限及至少两个 effect 的批次第二项失败；异常后快照、deadline、RNG / 外部效果均不变。
- ✅ full / summary / skip 均推进到各自 completion，断言路径回执、共同回执 / 出口、错路拒绝与重复结算幂等。
- ✅ 正式宿主默认 ch00；仅 DEV `?demo` 启用 ch01 演示，且沿用独立预览存储。
- ✅ 无 DOM、墙钟、浮点或 `Math.random` 进入 core；未增加依赖，技术来源于 MDN 与 inkjs 2.4.0 registry（2026-10-02）。
- ✅ `pnpm install --frozen-lockfile` 通过。
- ✅ `pnpm check` 通过：112 个测试文件、699 项测试；构建与体积门禁通过。
- ✅ `pnpm --filter @tianshu/core test` 通过：39 个文件、365 项测试。
- ✅ `pnpm --filter ./apps/game test` 通过：20 个文件、64 项测试。
- ✅ `pnpm --filter ./apps/game build` 通过：307 modules；仅既有 >500 KiB 非阻断提示。
- ✅ `python3 tools/lint/check_ids.py --strict` 通过；仅基线未定义 `sk_babuganchan`，本任务新增失败为 0。
- ⚠️ CONTENT-ch00 正式 Ink 产物尚未进入当前只读内容插件；夹具已证明编译产物 → bridge → 选择路径。
