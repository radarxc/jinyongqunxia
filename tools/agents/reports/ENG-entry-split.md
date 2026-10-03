# ENG-entry-split 报告 · 游戏工程 · entry 闭包拆分：core Worker 子系统按需 import()、主线程非首屏懒加载（预算不放宽，目标 entry ≤ 155 KiB）
## 1. 摘要（3–6 行）
Worker 首包缩为 Comlink 协议与可重试 lazy-session 壳；会话、内容、区域、战斗、Ink/对话、城镇与书眠命令均改为首次需要时加载。
主线程只保留标题/设置/读档壳，controller、core host、App、render、恢复、PWA 与流程页按入口懒加载；Worker 与兼容主线程共用同一 lazy session。
entry 由 169.08 降至 38.87 KiB gzip（-130.21，-77.0%），低于 155 KiB 目标 116.13 KiB；render 不变，预算未修改。
## 2. 产出（文件、行数、主要章节）
- `core-worker.ts` 6 行、`core-host.ts` 111 行、`main.ts` 154 行：Worker 壳、同构回退、首屏/非首屏边界。
- `runtime/**`：lazy-session 73、session 502、dispatch 153、projection 111、其余适配/预载/测试 330 行；含失败重试与事务前预载。
- `packages/core/package.json` 41 行及 `src/entries/**` 35 行：保持根 `.` 不变，新增纯再导出子路径。
## 3. 关键结论与数值
| gzip KiB | 合入前 | 合入后 | 差值 |
|---|---:|---:|---:|
| entry 业务块 / Worker 闭包 / Vue+runtime | 52.25 / 91.16 / 25.66 | 13.21 / 0 / 25.66 | -130.21 |
| entry 闭包总计 / render / WebGL total | 169.08 / 160.53 / 329.61 | 38.87 / 160.53 / 199.40 | -130.21 / 0 / -130.21 |
- Worker 壳 2.33；首次会话静态闭包 65.13、虚拟基础内容 18.50（query/dispatch/restore 共用无竞态预载）；内容 source/loader 自身 0.15/0.18。
- 首次触发增量：对话/Ink、quest、difficulty 各约 35.26；区域投影 6.96、区域命令在其后约 37.11；战斗 runtime 33.77；书眠 1.46；城镇索引 0.19（具体城镇如大理 22.63）。
- world tick / worldmap / town handler / inventory handler 薄入口分别 0.08 / 0.08 / 0.08 / 0.10；均不在 Worker 首包。
- 100 次「序章 skip→初眠→白马冷入口」主线程/Worker 每步 update、最终规范 JSON 与 RNG 相同且仅 1 个 hash；core golden 逐检查点仍通过，终值 `436d548f…e66ac41c` 未改。读档跨章节同源 loader 与失败不提交均通过。
- 首次 import 失败映射为可恢复 `CORE|BATTLE|REGION|DIALOGUE|TOWN|*_SUBSYSTEM_UNAVAILABLE`，清失败缓存后可重试；运行中的 Worker 不静默回退。
## 4. 开放问题（附默认值）
- 无阻断项。默认继续用 Vite 内容插件生成的 town/content 动态入口；chunk hash 与小幅压缩差异以 `pnpm size` 实测为准。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无。该变更只调整工程加载边界，不修改玩法、规范状态或体积预算。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- 后续工程任务说明 / Worker 接入：新增规则族必须建 `@tianshu/core/<subpath>` 纯再导出入口，并在 `core-dispatch` 或 session loader 中动态接线。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ `pnpm install --frozen-lockfile`；`pnpm check`：134/134 文件、951/951 测试、content 981/925/56、size/dev-chunks 全绿。
- ✅ core 43/43、463/463；game 29/29、100/100；game build；严格 ID（无新增失败）；`git diff --check`。
- ✅ entry 38.87 ≤155；render +0.00 ≤1；WebGL total 199.40；未改 `tools/perf/**`、预算、golden 或规则代码。
- ✅ 新游戏/读档/书眠共享预载；失败可重试、代码稳定、事务前加载；主线程回退行为同构。
- ✅ 交 ENG-20b/16c/26/27a-b/28a-b/23a/CONTENT-*：规则命令接 `core-dispatch`，区域/战斗/对话/城镇内容接 session loader；禁止从 `core-worker.ts`、`lazy-session.ts` 或会话静态链导入根 barrel、Ink、区域、战斗及 `virtual:tianshu-towns`。
- ⚠️ 根 `pnpm check` 在沙箱以临时 `NODE_OPTIONS` 仅禁用 tsx CLI Unix IPC 监听；仓库命令、门禁与测试未跳过或改写。
