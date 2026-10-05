# ENG-19c-build-shell-test 报告 · 游戏工程 · 小修：build-shell.test.ts 不得依赖上一次构建的 dist（生产包无 rig-demo 改到构建后检查，dist 缺失不得空过）

## 1. 摘要（3–6 行）

- 采用优先方案：把生产产物检查接在根 `size` 的本次构建与体积检查之后。
- `build-shell.test.ts` 只保留 `main.ts` 的 `import.meta.env.DEV &&` 源码守卫，不再读取陈旧 `dist`。
- 新脚本同时检查 `dist/assets` 与 Vite manifest；缺失、无效或命中开发专用标识均退出 1。
## 2. 产出（文件、行数、主要章节）

- `check-dev-chunks.mjs`（88 行）：纯判定、严格产物读取、CLI 退出码；对应测试（93 行）覆盖合法/非法清单及真实目录。
- `build-shell.test.ts`（10 行）保留源码守卫；`package.json`（45 行）仅修改 `size` 一行。
## 3. 关键结论与数值

- 构建后检查方案；不在单测内构建，不依赖上次 `dist`，也未改变体积预算。
- 实测三态：dist 缺失 → `PRODUCTION_DIST_MISSING`/退出 1；旧 dist 含 `rig-demo-stale.js` → `PRODUCTION_DEV_ONLY_ARTIFACTS`/退出 1；正常构建 → `PASS assets=465 manifest=41`/退出 0。
- 同工作区 A/B（仅 `size` 是否串联新检查）：`pnpm check` 均 76 s，观测变化 0 s；扫描单跑 0.05 s。
## 4. 开放问题（附默认值）

- 无阻塞；默认开发专用标识含 `rig-demo`、`dev-only`、`development-only` 及对应 `*-entry`，新增命名时扩展表。
## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无；仅修正工程门禁时序与失败语义。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- 无。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 安装、聚焦 2 文件/8 用例、全量 126 文件/850 用例均通过；`pnpm check` 76 s，含 content 923/923、build、size 与新检查（沙箱以等价 `node --import tsx` 函数绕过 tsx CLI 禁止 Unix socket，未改仓库脚本）。
- ✅ 独立 build 56.48 s；entry 157.74/170 KiB、WebGL 318.27/350 KiB；ID strict（new=0）、格式、lint、类型与写集审计均通过，无依赖、预算或负载放宽。
