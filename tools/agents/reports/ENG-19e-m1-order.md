# ENG-19e-m1-order 报告 · 游戏工程 · M1 白马冷入口页面流：过场 → 场景载入 → 移动 → 首谈 → 东出口点亮 → 自动档 → 题卡 → 自由操作；演出事件上屏；说话人标签取自 NPC 内容

## 1. 摘要（3–6 行）

白马冷入口现按八步执行，不再由西行过场直接跳题卡；UI 只消费 core 领域事件并按 `world/eventPresented.steps` 原序排队。
场景载入、移动、首谈、开门及自动档均等待对应领域事实；题卡在自动档真实写入后出现。
NPC 说话人由经 manifest/hash 校验的章节文本叶片解析；未知 NPC 显示精确缺失键，不再回退“江湖人物”。
新增真实 App + fake IndexedDB 端到端用例，覆盖八态顺序、锚点交互、东门投影与 `save_auto_1`。

## 2. 产出（文件、行数、主要章节）

- `apps/game/src/game-controller.ts`（865 行）、`flow/{stage,event-presentation,content-text,presentation}.ts`（329 行）：冷入口状态机、演出队列、文本与 speaker 投影。
- `flow/{m1-flow,event-presentation,presentation}.test.ts`（515 行）、`runtime/test-fixture.ts`（115 行）：端到端、边界解析与三名 NPC 叶片测试。
- 本报告（≤50 行）。

## 3. 关键结论与数值

- 八步推进：① `world/eventPresented(ev_10_cold_entry_arrival)` 开西行过场；② 过场完成后消费 `ui/revealText` 与 `world/loadScene`，由 `world/regionMounted` 确认载入；③ `world/walked` 证明移动；④ dialogue binding 的 `dialogue/started(story_ch10_cold_entry/fengshi_first_talk)` 进入首谈；⑤ `world/entranceOpened(ent_10_fengshi_east)` 点亮东出口；⑥ `world/autosaveRequested` 触发并等待 IndexedDB 自动档；⑦ `world/eventPresented` 的 `ui/showTitleCard(ch10_volume_one)` 上题卡；⑧题卡继续这一 UI 完成信号进入 `free`（规则可操作性仍以 core 投影为准）。
- 演出边界校验 11 种 `EventPresentationAction`，拒绝未知/缺字段动作；文字、题字、Ink、场景与题卡按领域事件原序消费，沿用现有懒加载 `WakePage`、`DialogueLayer`、`RegionPage`、`BaimaTitlePage`。
- speaker 来源：`chNN.text.zh-Hans.base.json` 内 `npc.<npcId>.identity.name`（由 NPC `identity.name` 编译）；旁白/玩家/书灵保留。实测沈青禾、李文秀、无名驿卒及缺键提示。
- 测试：game 37 文件 / 139 项全过；其中八步用真实 App、键盘移动、锚点按钮与 fake IndexedDB，所有异步交互先等元素出现；未加高负载跳过。
- `pnpm size`：标题 entry `38.83/170 KiB gzip`；WebGL total `207.68/350 KiB`（render `168.86/180`）；首次会话 `91.06/110 KiB`，均 PASS；子系统仅报告：对话 35.43、区域 37.54、战斗 73.27、城镇 80.60 KiB。

## 4. 开放问题（附默认值）

- 当前工作副本未含已审核的 `ENG-ink-intents` 提交 `87071d108e03`；默认集成后由真实 Ink 标签发出开门、自动档与题卡事件，本任务测试以严格同契约脚本宿主覆盖页面装配。
- 浏览器 GPU/触控及刷新中途恢复未在沙箱实测；默认本任务验收走一次无刷新冷入口，恢复能力另案处理。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无；本任务落实既有冷入口顺序与 core/UI 边界。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- 集成分支 / 合入顺序：须先含 `ENG-ink-intents` `87071d108e03`，否则首谈后的三个 Ink 状态/演出意图不会由真实 core 发出。
- ENG-24 / M1 浏览器验收：纳入下节完整冷入口走查与中途刷新恢复后续项。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 浏览器走查：新游戏→创角→跳过/完成开场→选序章路线并收束→导出稍后→默认配点确认→等待西行过场→跳过/播完→确认风蚀废驿载入与年代题字→WASD/方向键移动→点击 `first_talk`→走完首谈→确认东门解除锁定→确认自动保存完成→继续第一卷题卡→确认仍在场景且可自由移动。
- ✅ 顺序、领域事件、真实自动档、演出原序、三 NPC 名称、缺键诊断与懒加载约束均有实现/测试；未新增组件或依赖。
- ✅ `pnpm install --frozen-lockfile`、游戏测试、游戏 build、strict ID、`pnpm size`、ESLint 与 `git diff --check` 通过。
- ⚠️ 根 `pnpm check` 的 lint/typecheck/165 文件 1196 测试已通过，随后 `content:validate` 因沙箱 `tsx` Unix socket `listen EPERM` 中止；未改 `node_modules` 绕过，交沙箱外校验。
- ✅ 仅改允许写集；未改 core/data/content、预算、锁文件或 git 状态。
