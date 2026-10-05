# ENG-19a-ui-shell 报告 · 游戏工程 · UI 主流程 A：标题、设置、错误恢复与命令排队（审计 M4、L1）

## 1. 摘要（3–6 行）

- 启动改为先打开 IndexedDB、迁移设置与枚举存档，再显示标题；继续、新游戏、设置和 DEV 演示均由异步页面承载。
- 设置补齐字号、减少动态、字幕、分类音量、画质和难度；错误进入不依赖画布的恢复页，可离线导出全部存档或重建宿主后读最近自动档。
- M4 已修复：用户命令进入 FIFO，自动存档独立执行，不再占用 `busy` 或吞掉点击；Worker 每次调用增加 10 秒看门狗。
- 新增对话/任务纯展示组件但未接线；两处 L1 死代码已删除，并把 `/rig-demo` 限于 DEV。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 / 变更 | 主要内容 |
|---|---:|---|
| `apps/game/src/main.ts`、`pages/{Title,Settings,Recovery}Page.vue` | 166 | 启动/标题/会话/恢复状态机，页面异步加载 |
| `apps/game/src/game-controller.ts`、`settings.ts`、`recovery.ts` | 452 | FIFO、独立自动存档、故障冻结、设置迁移、离线导出/恢复 |
| `packages/ui/src/components/Tx{Title,Settings,Recovery,RotateHint}*` | 157 | 四类纯 DOM 流程组件及 happy-dom 测试 |
| `packages/ui/src/components/Tx{Dialogue,Quest}*`、`projections.ts`、导出/i18n | 282 | ENG-19b 用纯展示组件、DTO 与独立流程文案 |
| `packages/platform/src/host/projection-host*.ts`、README | 264 | 10 秒单次调用看门狗、故障广播与队列拒绝测试 |
| `apps/game/src/*test.ts`、`App.vue`、CSS、三份说明 | 多文件 | fake-indexeddb 流程、快存门禁、150% 字号、横屏提示、交接说明 |
| 删除 `packages/ui/src/GameUi.vue`、`apps/game/src/storage-demo.ts` | 2 文件 | L1 死代码删除，不再保留兼容空壳 |

## 3. 关键结论与数值

- 状态流：`开存储/读设置 → 枚举槽 → 标题 → 继续或新游戏 → 游戏`；故障时冻结最后正确投影/事件序号，销毁旧宿主，进入恢复页，再以新宿主/controller 读取 `save_auto_1..3` 中最新档。
- `ui.settings.v2` 保存 `textScale=100|125|150`、`reducedMotion`、`subtitles`、四类 0–100 音量、`quality=auto|low|mid|high|ultra`、三档 `difficulty`；旧 `ui.accessibility.largeText=true` 迁为 125%。
- 默认值：100%、系统 `prefers-reduced-motion`、字幕开、音量 `100/80/80/80`、画质 auto、难度 `diff_jianghu`；音量仅持久化并调用空端口桩，画质已接 ENG-21b，运行中难度由 core 接受后才落盘。
- M4 前：`busy` 时 `run()` 直接返回且 autosave 也占 `busy`；后：前台命令 FIFO，autosave 独立串行，存档中第二条用户命令仍提交。聚焦 8 文件/22 项、应用 25 文件/82 项均通过。
- 生产包：entry `157.74/170 KiB`、render `160.53/180 KiB`、WebGL `318.27/350 KiB`；相对 ENG-18d 的 `123.08/286.11` 为 `+34.66/+32.16 KiB`，预算未放宽，无 `rig-demo-*` chunk/预缓存项。

## 4. 开放问题（附默认值）

- 真机横竖屏、150% 字号、系统减少动态、iOS 杀页和 Worker 真卡死恢复仍**（待实测）**；默认保持当前 DOM 恢复路径与 10 秒看门狗。
- 正式创角/序章 UI 未在本任务实现；默认“新游戏”以 ENG-17a 默认身份与当前难度创建 ch00，完整入口交 ENG-19b。
- 书眠运行态尚无可消费投影；controller 已提供 `setBookSleepActive()` 门禁，默认由后续书眠界面在事务边界调用。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无；实现遵循现有 `tech/01`、`design/13`、`design/14`，未新增玩法规则。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 任务 | 位置 | 同步内容 |
|---|---|---|
| ENG-19b | M1 标题/对话/任务 | 接创角入口；适配 `TxDialoguePanel` 的 `dialogue` + `choose/continue/close`，`TxQuestLog` 的 `quests/selectedId` + `select/track`，`TxQuestTracker` 的 `quest` + `open` |
| ENG-17 / ENG-19b | 书眠事务 | 在开始/结束时调用 `setBookSleepActive(true/false)`，不得绕过 controller 快存门禁 |
| ENG-21b | 设置页 | 画质已接 `setTier()`；后续可补自动检测结果与“重新校准”，默认保留当前五项选择 |
| ENG-23a | 设置页 / PWA | 接更新提示、强制更新、离线下载与缓存管理；本任务未改 `pwa.ts`/Service Worker |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 启动/恢复状态机：存储与设置先于标题；继续、新游戏、DEV demo；启动/Worker/宿主/内部错误进入纯 DOM 恢复，恢复重建宿主且不清 IndexedDB。
- ✅ 设置项/存储键：`ui.settings.v2` 与旧键迁移；150% 和系统减少动态有测试；字幕、分类音量桩、ENG-21b 画质和 ENG-17a 难度已接。
- ✅ M4：前台 FIFO 与独立 autosave；真实 fake-indexeddb 阻塞提交期间第二个命令不丢，错误冻结最后投影/命令序号；对话/书眠禁快存。
- ✅ 恢复/平台：最近自动档显示槽与时间，恢复后提示时间；无宿主导出全部存档；Worker timeout/error/messageerror 广播故障并拒绝队列。
- ✅ 展示与 L1：对话/任务组件未接线；`GameUi.vue`、`storage-demo.ts` 已删除；生产构建无 `rig-demo-*` chunk 或 manifest 项，现有全局 CSS 仍含开发演示选择器。
- ✅ 原样门禁（未加环境变量/并发参数）：`pnpm install --frozen-lockfile`、`pnpm check` 均退出 0；后者完成 lint/typecheck、125 文件/843 测试、923/923 内容及 entry/render/WebGL 三项包体预算。
- ✅ 其余原样门禁：`pnpm --filter ./apps/game test` 为 25 文件/82 项，`pnpm --filter ./apps/game build` 为 431 modules，严格 ID 新增失败 0；`git diff --check` 通过。
- ✅ ENG-19b 交接：在 `main.ts:showTitle()` 把现有 `onNewGame → beginSession({ fresh:true })` 换成创角入口，在 `App.vue`/新 `pages/QuestPage.vue` 接纯组件；接口为 `TxDialoguePanel(dialogue,busy?) → choose(choiceId)/continue/close`、`TxQuestLog(quests,selectedId?) → select(questId)/track(questId)`、`TxQuestTracker(quest) → open(questId)`。用 happy-dom 验证 props/事件/禁用态，用 fake-indexeddb 验证标题→创角→正式存档→继续。
- ✅ ENG-21b 交接：`TxSettingsPanel` props 为 `modelValue: FlowSettingsView`、`difficultyReadOnly?`，事件为 `change(key,value)`/`back`；`SettingsPage` 对应 `settings: GameSettings`、`difficultyReadOnly?` 与同名事件。`quality` 已接 `createRenderQuality().setTier()`；若加校准，事件 `recalibrate` 调 `clearCachedDetection()`。用 happy-dom 验证档位/事件，生产 build 验证异步 render-host 与预算。
- ✅ ENG-23a 交接：当前准确接口只有 `pwa.ts:schedulePwaRegistration(): void`（`main.ts` 在标题后调用）；设置组件没有 PWA props/事件，不虚构桩。ENG-23a 在自有 `pwa/**` 与 `TxUpdatePrompt`/`TxOfflineBadge`/`TxDownloadPanel` 定义契约，再接 `App.vue`/设置页；以 happy-dom 测事件/aria-live、内存 CacheStorage 测状态机、生产 build + `check-offline.mjs` 验证 SW/预缓存。
- ⚠️ 未执行浏览器真机/E2E；官方来源已核实 MDN `matchMedia`/`prefers-reduced-motion`/Worker/`messageerror` 与 Vite env（访问 2026-10-03）。
