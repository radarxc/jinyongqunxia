# 本任务：游戏工程 · 新游戏入口与对话 / 剧情命令（身份、难度、序章模式、Ink 对话进 core；StoryRuntime 事务化，代码审计 H6）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。

先读：
- 根 `CLAUDE.md`、`packages/core/CLAUDE.md`、`apps/game/CLAUDE.md`；
- 报告 `tools/agents/reports/ENG-15-core-bus.md`（命令总线、根 `dialogue` 槽、`WORLD_PAUSED`）、`ENG-18-content-build.md`（Ink 编译、`storyHash`、文本分片）、`ENG-08b-worldmap-page.md`、`DES-prologue-v2.md`；
- 审计报告 `tools/agents/reports/AUDIT-code-20261002.md` §3.2 H6。

## 为什么做

M1 玩家路径从「新游戏」开始（`docs/tech/09-roadmap.md` §3.1）。现在：
- 没有新游戏：`createCore` 写死天龙，应用启动永远进演示会话；
- 没有对话与剧情命令：`Core.dispatch` 只接受世界命令，`InkJsDialogueBridge` 与 `StoryRuntime` 只在 core 测试里用；
- `dialogue/index.ts` 的说话人恒为 narrator，并把原文塞进 `textKey`；
- 审计 H6：`quest/runtime.ts` 的 `choose()` 先执行 `#complete` 再在 `STORY_CHOICE_EDGE` 处抛错，`#stabilize` 也可能推进到一半就抛 `STORY_STABILIZE_LIMIT`，抛错后实例处于半提交状态。

本任务补 core 侧。界面由 ENG-19b 做；书眠由 ENG-17 在本任务之上接。

## 规格（照这些写，不自创）

- `docs/design/01-vision-and-core-loop.md`：§4.1 身份（姓名、性别、外观、称谓、声线）；§4.3 五种现代身份 `origin_*`；§8.2 / §8.4–§8.5 序章三条路。
- `docs/design/03-attributes.md`（DES-attr-v2 合入后的版本）§2.4：创角只定身份 / 外观 / 福缘与魅力初档，**不配战斗属性**（配点在初眠）。天赋三选一要 RNG，M1 不做，报告列出。
- `docs/design/13-progression-and-endings.md` §5.1 难度 `diff_jianghu / diff_xiake / diff_zongshi`；§5.4 战斗外随时可切，写 `difficultyLog`；§9.1 对话与书眠事务中不许存档。
- `docs/tech/05-gameplay-engine.md`：
  - §3.4 命令：`dialogue/choose{choiceIndex}`、`quest/choose`、`rules/setDifficulty`；
  - §3.8 三类错误；§5.2 对话与菜单不推进时间；
  - §10.3 `DialogueState{storyId, storyHash, entryKey, storyJsonState, randomSeed, pendingIntents, consumedTagKeys}`。
- `docs/tech/04-data-pipeline.md` §7.1：Ink 写作约定与 `#ts:` 标签。没有说话人约定：本任务定一个最小约定（例如 `#ts:speaker <npcId>`），写进报告交文档同步与内容任务。
- `docs/design/chapters/00-yuenv.md` §7.1、§7.3；`docs/design/story/00-yuenv.md` §2.1（`dc_00_01` 的 full / summary / skip）、§3.1 knot 表、§5.4 回执。

## 要做的事

1. **新游戏**：
   - 新命令（或 core 工厂 + 宿主入口）创建新档：宿主生成 `masterSeed`；身份 `{name, gender, appearance, pronoun, originId}`；难度；ch00 初始状态。
   - 去掉 `createCore` 里的 ch01 / 1093 写死；演示会话改成只在开发 / 演示模式下出现。
   - 章节定义由 ENG-17 补，本任务用最小夹具。
2. **难度**：`rules/setDifficulty`，战斗中拒绝，写 `difficultyLog`。
3. **对话**：
   - `dialogue/start`、`dialogue/continue`、`dialogue/choose`，经 `InkJsDialogueBridge` 读 ENG-18 编译的 Story JSON；
   - 对话中根 `dialogue` 非空，`world/tick` 返回 `WORLD_PAUSED`；
   - 投影给 `DialogueView`：说话人、文本 key、选项及不可选原因、历史；
   - 说话人取标签，没有就是旁白。
4. **剧情**：
   - `quest/choose` 接 `dc_00_01` 这类选择节点；序章模式（full / summarized / skipped）写回执；跳过路径要走到同一个出口；
   - **StoryRuntime 事务化**（审计 H6）：在局部快照上运算，最后一次性提交；任何异常都不留半提交状态。
5. **错误分类**：领域拒绝码进 `RejectReason` 白名单，内部错误上抛（与 ENG-15 的分类一致）。
6. **宿主**：新游戏流程的薄接线放 `apps/game/src/runtime/**`（不写界面）。
7. **测试**：
   - 新游戏确定：同身份、同种子得到相同规范 hash；
   - 难度切换与战斗中拒绝；
   - 对话：开始 → 继续 → 选择，事件与投影正确，对话中世界暂停；
   - 选择抛错时状态与 RNG 完全回滚；
   - `quest/choose` 的三条序章路径回执；
   - 夹具 Ink 故事端到端（编译产物 → bridge → 选择）。

约束：
- 写集：
  - core：`packages/core/src/{quest,dialogue,progression,state,command,api,world}/**`、`packages/core/CLAUDE.md`；
  - 应用：`apps/game/src/runtime/**`、`apps/game/src/core-host.ts`、`apps/game/src/core-worker.ts`、`apps/game/CLAUDE.md`；
  - 界面：`packages/ui/src/projections.ts`、`packages/ui/src/ui-bus.ts`（只改类型）。
  - 写集外的改动在提交时会被丢弃。
- **不改**：`packages/core/src/{battle,buff,ai,replay}/**`、`apps/game/src/battle/**`、`packages/render/**`、`packages/data/**`、`apps/game/build/**`、`docs/**`、`content/**`（夹具放测试目录）。
- core 禁浮点、禁 DOM、禁墙钟、禁 `Math.random`；每次写入 ≤ 150 行；不加依赖。
- 不得放宽、跳过或改写任何门禁测试。若只因机器负载挂在 rig 门禁，在报告写明负载与数值即可。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm --filter @tianshu/core test`
- `pnpm --filter ./apps/game test`
- `pnpm --filter ./apps/game build`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：
- 新命令表（命令 → 校验 → 拒绝码 → 事件）；
- `DialogueView` 与新游戏参数结构；
- 说话人标签约定；
- StoryRuntime 事务化前后对照与测试；
- 交给 ENG-17（书眠接在哪个事件 / 回执之后）、ENG-19a / 19b（界面要用的查询、命令、投影）、CONTENT-ch00（Ink 标签与回执写法）的接口。

报告 ≤ 90 行。
