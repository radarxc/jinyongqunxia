# ENG-event-executor 报告 · 游戏工程 · EventDef 动作执行器：区域 Trigger 触发的一次性事件真正生效（旗标 / 发放物品 / 基础补给 / 自动存档 / 开入口），演出类动作作为领域事件交界面；动作词表与 Ink OPCODES 共用登记
## 1. 摘要（3–6 行）
EventDef 已从松散 `record[]` 收紧为非空、严格判别联合；同一登记表派生 Ink/Tiled OPCODE 白名单，未知动作及多余/错误参数在内容构建前拒绝。
区域 walk/interact 的 Trigger 在原命令事务内校验章节、once、condition 并按序执行；失败回滚移动、状态、receipt 与领域事件。
状态动作已落地旗标、给/收物品、基础补给、开入口与自动存档请求；表现动作仅聚合为 `world/eventPresented`。
章节 base rules leaf 会随章节按需装入 EventDef；ch10 已合入集成分支，挪基点后其 op 迁名由开发监督按对照表机械完成（见第 3 节）。
## 2. 产出（文件、行数、主要章节）
| 文件组 | 文件数 / 行数 | 主要内容 |
|---|---:|---|
| `packages/data/src/**`（不含夹具） | 9 / +189−28 | 20 动作登记、严格 EventDef、Ink 共源、内联正文拆分、schema/build/validate 测试 |
| `packages/core/src/{event,command,world}/**` | 7 / +338−18 | 事务执行器、6 个拒绝码、Trigger 接线、持久 flag gate、执行器回归 |
| `apps/game/src/runtime/**` | 5 / +30−9 | 章节 EventDef 加载、core 注入与 loader 回归 |
| `packages/data/src/build/__fixtures__/**` | 4 / +10−6 | 旧夹具迁移；未登记动作的 validate 反例 |
| `content/chapters/ch10_baima/events/**`、ch10 Ink | 8 / +12−12 | 7 个 EventDef 动作迁名与 1 个 Ink 参数迁名 |
| 本报告 | 1 / 42 | 七节交付、自检与下游交接 |
## 3. 关键结论与数值
- 状态类：`flag/set {flagId,value=true}`；`party/giveItem|takeItem {item,count}`；`party/restore {mode:full_once}`；`world/openEntrance {entranceId}`；`save/autosave {reason}`；`quest/advance {quest,stage}` 已登记但因尚无正式 QuestInstance 持久命令，区域执行稳定拒绝 `REGION_EVENT_ACTION`。
- 演出类：`battle/start {encounter}`、`tutorial/mark {tutorial,state}`、`story/requestTransmission {skill,source}`、`ui/openAllocation {mode}`、`ui/showTitleCard {card}`、`dialogue/speaker {speaker}`、`dialogue/start {storyId,knot,presentation?,skippable?,durationSeconds?}`、`ui/showText {textKey|text}`、`ui/revealText {textKey}`、`ui/observeOnly {startsQuest?,givesItem?}`、`world/loadScene {regionId,sceneId,spawnId}`。基础设施 `rig/loadClipMap`、`vfx/loadRuntimeData` 仍严格解析，但不开放给区域执行。
- 旧→新：`startStory→dialogue/start`、`showText→ui/showText`、`revealText→ui/revealText`、`loadScene→world/loadScene`、`restoreBasicSurvival→party/restore`、`observeOnly→ui/observeOnly`；Ink `world/openEntrance entrance→entranceId`。
- 迁移落地（开发监督 10-03 18:08）：CONTENT-ch10 已合入集成分支，本任务挪基点到 f24cbc6b 后，ch10 events 的 op 迁名由开发监督按本任务对照表机械完成（7 个 EventDef，只改 op 名，参数不变）；ch10 Ink `world/openEntrance entrance=` 同步改为 `entranceId=`（1 处）。
- 顺序/回滚：章节→once receipt→condition→动作可执行性→原序状态动作→receipt→演出事件；任一条件/引用/库存/动作失败，连同 walk、consume、已发事件全部回滚。receipt 与旗标写入 `profile.replayRules.switches`，读档保留并参与确定性 hash。
- 演出边界：`world/eventPresented {eventId,steps[]}`；`steps` 保持原 EventDef 顺序且只含演出动作，core 不调用 DOM、存储或场景/对话界面。`save/autosave` 仅发既有口径的 `world/autosaveRequested`。
- `pnpm size`：标题页 entry 38.80/170 KiB；WebGL total 207.66/350 KiB；首次会话 88.87/110 KiB；区域子系统 45.22 KiB（报告项，无预算门）。
## 4. 开放问题（附默认值）
- EventDef `timeWindow` 依赖故事 eventTicks/deadline/延期 receipt，区域状态无该容器；默认本执行器只判 `condition`，待正式故事时窗端口接入后再执行。
- 入口及表现引用尚无统一 entrance/encounter/scene/Ink 运行时登记源；默认入口只校验 `ent_*` 并置位，表现引用校验形状后透传，由内容闭合校验与 ENG-19e 消费端核对资源。
- `condition.sourceEvent` 属非区域事件入口；默认区域 Trigger 不匹配并返回 `REGION_EVENT_CONDITION`，由后续故事事件调度器执行。
- ch10 `first_talk` 是 NpcSpawn/dialogue binding，不是带 `eventId` 的 Trigger；默认由正式对话绑定启动，不能把该 EventDef 误报为本执行器可触发。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- EVE-P01 / 登记 `profile.replayRules.switches[ev_*]` 为一次性 EventDef receipt / 无需改存档 schema，且读档与确定性 hash 天然覆盖。
- EVE-P02 / 为 EventDef 规定 state、presentation、infrastructure 三类动作及 `world/eventPresented` 边界 / 防止 core 执行演出或基础设施载入。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `docs/tech/04-data-pipeline.md` / EventDef：登记共源动作表、章节 base leaf 装载、严格失败口径与内联 `ui/showText` 文本拆分。
- `docs/tech/05-gameplay-engine.md` / 区域 Trigger：登记同事务执行、receipt、6 个 `REGION_EVENT_*` reason 与 `world/eventPresented`。
- ENG-region-gates-data / `runtime/session.ts`、`item-content.ts`：按合入顺序保留双方的 events 与 region bindings 加载，避免覆盖。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ schema 正反例、未知动作拒绝、Ink 参数、内联文本拆分；`content:build` 1169 对象/15 章节，`content:validate` 1176 文件/1110 对象/2 Ink/62 地图。
- ✅ once 跨读档、condition/递归 flag gate、给/收物品、补给、开入口、自动存档、演出聚合、失败全回滚及同输入 100 次同 hash；未改 core golden。
- ✅ 冻结安装；`pnpm check` 146/146 文件、1046/1046 测试；core 43/472、data 14/190、game 31/105；strict ID 新增失败 0；全部体积门通过。
- ✅ 仅改写集，无依赖或锁文件变更；`git diff --check` 通过；正式命令借本地 tsx 无 IPC 启动包装绕过沙箱 Unix socket `EPERM`，结束前已恢复原包装器。
- ⚠️ ENG-19e-m1-order：订阅 `world/eventPresented`，按 `steps` 原序映射 UI/Dialogue/Scene；成功展示不得回写 core，失败/重试策略由界面层定义。
- ✅ CONTENT-ch10：op 迁名与 Ink `entranceId` 已由开发监督按对照表机械完成（见第 3 节）。⚠️ CONTENT-ch00 及后续：EventDef 只由带同名 `eventId` 的 Trigger 执行；按上述旧→新迁移，Ink 的 `entrance` 改 `entranceId`；首谈继续用 NpcSpawn/dialogue binding。
