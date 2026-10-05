# ENG-19b-ui-m1-flow 报告 · 游戏工程 · UI 主流程 B：M1 路径界面（创角、开场、序章模式、对话框、任务、初眠配点、白马题卡）

## 1. 摘要（3–6 行）

- 已接通标题后的正式创角、首帧可跳开场、`dc_00_01` 三模式、摘要 / 跳过收束、C04 导出、初眠配点、苏醒与白马题卡。
- Ink 对话具备逐字显示、整页揭示后翻页、历史、选择 / 禁用原因及读屏全文；任务日志、HUD、城镇反馈只显示玩家可读名称。
- 初眠六项完全消费 core 查询，确认无需长按；对话与配点查询生效至书眠提交期间均禁止手动保存，导出仍可用。
- M1 页面、组件与章节文本加载器均首次使用懒加载；正式内容缺失时明确降级，不伪造生产剧情。

## 2. 产出（文件、行数、主要章节）

| 文件组                                                                                                                                              |              行数 / 变更 | 主要内容                                                |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | -----------------------: | ------------------------------------------------------- |
| `packages/ui/src/components/Tx{CharacterCreation,Cutscene,FlowChoice,SummaryCards,ExportPrompt,SleepAllocation,SleepConfirmation,ChapterTitle}.vue` |                      230 | 纯展示流程组件、无障碍语义与稳定选择器                  |
| `TxDialoguePanel.vue`、`TxQuest{Log,Tracker}.vue`、`projections.ts`、`i18n-flow.ts`、`index.ts`                                                     |                 +207/−14 | 对话分页 / 历史 / 禁选原因、任务 testid、DTO 与流程文案 |
| `apps/game/src/pages/*`、`App.vue`、`TownPage.vue`                                                                                                  |   新增 249；既有 +73/−36 | 12 个懒加载流程页 / 层、壳接线、城镇名称化              |
| `apps/game/src/flow/*.ts`、`game-controller.ts`                                                                                                     | 新增 550；既有 +456/−105 | 流程阶段、配点草稿、文本目录、可读投影、命令与存档边界  |
| `m1-flow.test.ts`、`content-text.test.ts`、`apps/game/CLAUDE.md`                                                                                    |             431；+24/−22 | 组件 / fake-indexeddb / 目录测试与接入约定              |

## 3. 关键结论与数值

- 初眠查询实测：`base=35`、`min=20`、`max=80`、`budget=90`，总和 `6×35+90=300`；均衡为六项 `300÷6=50`，福缘 / 魅力锁定。
- `manual|balanced|default` 与 `allocationRuleVersion` 原样发 core；默认 / 均衡均用查询 preset，不在 UI 复制规则。
- 题卡年份来自 `world/eraChanged.worldYear`；实测显示「长安二年（702）·西州以北」，不把 702 存为 UI 状态真值。
- `pnpm size`：entry `162.90/170 KiB`、render `160.53/180 KiB`、WebGL total `323.43/350 KiB`，均通过且未改预算。
- 章节文字经 manifest / hash 校验后按需读取；流程卡键为 `flow.<chapter>.<scene>.<三位序号>.(title|body)`，完整键对数即卡数。

## 4. 开放问题（附默认值）

- 正式 full 路线需 ch00 内容在实际终点调用 settle；默认不由 UI 伪造推进。
- `sleepEventId` 暂沿上游夹具 `slp_first_changbai`；默认保留，待内容 / core 提供权威查询字段。
- 重载后的中途演出阶段尚无持久 sidecar；默认依据 core 的对话 / 初眠投影恢复，其他演出回游戏态。
- 浏览器触控、150% 文字、读屏、减少动态及完整 12 组走查均**（待实测）**，交 ENG-24 / 协调者在沙箱外执行。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无；实现只消费 AR-26 / 27 / 29 与现有 core 契约，不新增玩法规则。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 任务   | 位置                      | 同步内容                                                                                                     |
| ------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------ |
| CONTENT-ch00  | Ink / zh-Hans 文本包      | 提供 Ink key；提供 `flow.ch00.opening`、`.summary`、`.skipBridge` 的有序 title/body 键对；摘要张数由内容决定 |
| CONTENT-ch10  | zh-Hans 文本包 / 题卡数据 | 提供 `flow.ch10.wake` 键对；继续由 core 时代事件给年份，并确认白马题卡地点 / 卷名数据归属                    |
| ENG-17 / core | 初眠查询                  | 把权威 `sleepEventId` 纳入查询，并定义非对话中途演出的恢复阶段（如需跨刷新）                                 |
| ENG-24        | M1 冒烟                   | 复用下节选择器；覆盖三模式、三难度、触控 / 键鼠、两种默认性别、150% / 读屏 / 减少动态                        |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 流转图：`标题→创角→开场→模式→full:游戏内容 / summary:卡片 / skip:不可跳传功+雪崩→C04 导出→配点→确认→初眠→西行→白马题卡→游戏`。
- ✅ 命令 / 查询：创角 `run/create`；模式 select / settle=`quest/choose`；对话=`dialogue/continue|choose`；配点读 `firstSleepAllocation`、交 `chapter/bookSleep`；题卡读时代事件；任务只读投影 / 本地追踪。
- ✅ testid：创角 `character-*`；过场 `cutscene-*`；模式 `prologue-mode/mode-*`；摘要 `summary-*`；对话 `dialogue-*`；任务 `quest-*`；导出 `export-*`；配点 `sleep-*/allocation-*`；题卡 `baima-*`；正文通用 `flow-text`。
- ✅ 组件测试 5 项：整页揭示 / 翻页、`choose`、禁选原因、任务无原始 ID、步进边界 / 均衡 / 重置 / 普通点击确认；内容目录 1 项验证文本与动态卡数。
- ✅ fake-indexeddb 3 项：新游戏→skip→默认配点→ch10；被拒选择不改投影；对话、书眠事务及配点待确认期拒绝手动保存。
- ✅ 全量门禁：冻结锁文件安装；`pnpm check` 131 文件 / 931 项、925/925 内容、511 modules 与体积全过；应用 27 文件 / 92 项；严格 ID 新增失败 0；`git diff --check` 通过。
- ✅ 单测技能 Step 7：`utree flush` 成功；本次新增 9 项有效用例，最终 9/9 通过，修复的高置信缺陷均已回归，无遗留 P0/P1/P2。
- ⚠️ 正式 ch00 Ink / 流程卡和 ch10 过场文本当前内容包为空，界面显示“正式文本尚未装载”；接口已交 CONTENT-ch00 / ch10，不以本地剧情冒充。
- ⚠️ Chromium 被沙箱阻止，未做浏览器完整走查；未运行非必跑 `pnpm check:perf`，且未改阈值或加入负载跳过。
