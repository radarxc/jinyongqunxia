# 本任务：游戏工程 · UI 主流程 A：标题、设置、错误恢复与命令排队（代码审计 M4、L1）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。

先读：
- 根 `CLAUDE.md`、`apps/game/CLAUDE.md`、`packages/ui/CLAUDE.md`、`packages/platform/README.md`；
- 报告 `tools/agents/reports/ENG-15-core-bus.md`（错误分类、「存档较新」码、真实存档摘要、`loop.ts` 暂停条件）、`ENG-13-save-formal.md`、`ENG-07-ui-panels.md`；如已合入，也读 `ENG-17a-newrun-dialogue.md`、`ENG-21b-recovery-quality.md`；
- 审计报告 `tools/agents/reports/AUDIT-code-20261002.md` §3.3 M4、§3.4 L1。

## 为什么做

路线图 `docs/tech/09-roadmap.md` §3.3 UI 行：M1 要新游戏、设置、下载与错误恢复。§3.5 无障碍：字幕、减少动态、横屏提示。

现状（集成分支实测；开工先自己核对）：
- 启动后直接进演示会话：`main.ts` → `core-worker` → `session.ts` → `bootstrap.ts`。没有标题页；启动失败只显示一行纯文本。
- 设置只有「大字」「减少动效」（`App.vue` 行内）。
- **审计 M4**：`game-controller.ts` 的 `run()` 在 busy 时直接 return；每条成功命令都触发 `autosave('state-change')`，而自动存档也走 `run()`。所以存档期间用户的点击（物品、装备、大地图、城镇按钮）被静默丢弃。
- `projection-host.ts` 的 FIFO 队列没有单次调用超时：Worker 卡住会让后续调用全部挂起；`CORE_WORKER_FAILED` 只在 error / messageerror 时触发；全仓没有恢复页。
- **审计 L1** 死代码：`packages/ui/src/GameUi.vue`、`apps/game/src/storage-demo.ts` 无人引用；`/rig-demo` 进了生产产物与预缓存。`render-host.ts` 不要删，ENG-21b 会重用。

## 规格（照这些写，不自创）

- `docs/tech/01-architecture.md`：
  - §6.1 启动：先开存储、读设置，再标题，再继续 / 新游戏；
  - §3.7 Worker 回退；§6.7 音量走 GainNode；§6.9 自动存档与 iOS 被杀后的恢复提示；
  - `apps/game/CLAUDE.md` 第 10 条：不许静默重启，先冻结最后一份正确快照与命令序号。
- `docs/design/14-ui-ux-mobile.md`：
  - §1.3 竖屏提示横置；§1.7 纯 DOM 的错误 / 恢复层；
  - §7.3 从最近自动存档恢复并显示来源与时间，绝不清 IndexedDB；
  - §7.4 文字 100 / 125 / 150%、跟随系统减少动态、字幕、分类音量；§3.1 标题页条目。
- `docs/design/13-progression-and-endings.md` §9.1–§9.2：对话与书眠事务中不许存档；恢复后显示「已从 xx:xx 的自动存档恢复」。

## 要做的事

1. **启动顺序**：存储与设置 → 标题页。
   - 标题页：「继续」只在有正式存档时可点；「新游戏」接 ENG-17a 的入口，未合入就禁用并写原因；「设置」。
   - 演示会话只在开发 / 演示模式出现。
2. **设置页**：
   - 文字 100 / 125 / 150%，迁移旧的「大字」；
   - 减少动态默认取 `matchMedia('(prefers-reduced-motion)')`；
   - 字幕开关；分类音量：只存值，加端口桩；
   - ENG-21b 已合入时接画质档位，否则留桩；
   - ENG-17a 的 `rules/setDifficulty` 已有时接难度，否则只读显示。
3. **竖屏提示横置**；对话与书眠中禁用快存。
4. **M4**：自动存档不占 busy；用户命令进 FIFO 排队，不再丢弃。
5. **恢复页**（纯 DOM）：
   - 触发：启动失败、`CORE_WORKER_FAILED`、`HOST_DISPOSED`、ENG-15 上抛的内部错误；
   - 操作：导出全部存档、从最近自动存档恢复（显示来源与时间）、重新载入；
   - 恢复要新建宿主与 controller，再读自动槽；
   - `projection-host` 加单次调用看门狗，超时视为 Worker 故障。
6. **纯展示组件**（不接线，由 ENG-19b 接）：`TxDialoguePanel`、`TxQuestLog`、`TxQuestTracker`；视图类型追加进 `packages/ui/src/projections.ts`。
7. **L1 清理**：
   - 删 `GameUi.vue`，同步 `apps/game/CLAUDE.md`；
   - 删 `storage-demo.ts`，同步 `packages/platform/README.md`；
   - `/rig-demo` 改成只在 `import.meta.env.DEV` 时路由，不改 `vite.config.ts`。
8. 新文案放新模块 `packages/ui/src/i18n-flow.ts`，从 `index.ts` 导出。不改 `i18n.ts`：ENG-21a / 21b / 16e / 23a 都在改它。
9. **测试**：
   - 组件测试（happy-dom）：标题、设置、恢复、旋转提示；减少动态默认值；150% 文字；
   - 应用流程（fake-indexeddb）：
     - 自动存档期间的命令不丢；
     - 宿主以 `CORE_WORKER_FAILED` 拒绝 → 恢复页 → 从自动档恢复并显示提示；
     - 标题 → 继续；
     - 构建产物里没有 `rig-demo-*`。

约束：
- 写集：
  - 界面：`packages/ui/src/components/TxTitle*`、`TxSettings*`、`TxRecovery*`、`TxRotateHint*`、`TxDialogue*`、`TxQuest*`（含测试）、`packages/ui/src/projections.ts`、`packages/ui/src/index.ts`、`packages/ui/src/runtime.ts`、`packages/ui/src/i18n-flow.ts`、`packages/ui/src/GameUi.vue`（删除）、`packages/ui/CLAUDE.md`；
  - 应用：`apps/game/src/main.ts`、`apps/game/src/App.vue`、`apps/game/src/game-controller.ts`、`apps/game/src/recovery.ts`、`apps/game/src/settings.ts`、`apps/game/src/style.css`、`apps/game/src/pages/TitlePage.vue`、`SettingsPage.vue`、`RecoveryPage.vue`、`QuestPage.vue`、`apps/game/src/storage-demo.ts`（删除）、`apps/game/src/app-flow.test.ts` 及新测试、`apps/game/CLAUDE.md`；
  - 平台：`packages/platform/src/host/projection-host*.ts`、`packages/platform/README.md`。
  - 写集外的改动在提交时会被丢弃。
- **不改**：`packages/core/**`、`packages/data/**`、`apps/game/build/**`、`apps/game/vite.config.ts`、`apps/game/src/pwa.ts`、`apps/game/src/battle/**`、`apps/game/src/render-host.ts`、`packages/ui/src/i18n.ts`。
- 新页面一律异步组件，入口不增重（入口约 135 / 170 KiB）。
- 每次写入 ≤ 150 行；不加依赖。
- 不得放宽、跳过或改写任何门禁测试。rig 100 角色性能门禁已移出 `pnpm check`（作者 AR-33），改由 `pnpm check:perf` 在负载低时单独跑；不得在测试里加任何「高负载跳过」逻辑，不得改阈值。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm --filter ./apps/game test`
- `pnpm --filter ./apps/game build`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：
- 启动与恢复状态机；
- 设置项与存储键；
- M4 前后对照与测试；
- 删除清单；
- 包体变化；
- 交给 ENG-19b（纯组件的 props / 事件、标题页的新游戏入口）、ENG-21b / 23a（设置页里留的桩）。

报告 ≤ 80 行。
