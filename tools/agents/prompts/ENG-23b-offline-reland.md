# 本任务：游戏工程 · ENG-23a 重新合入：在撤回后的 HEAD 上重新应用 PWA 与离线（9262b0a1），并修进入闭包——只算真正「进入该章」要用的文件，60 MiB 门不放宽，ch00 也要在门内；全量素材下校验

本任务写构建期与离线相关代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开 pnpm store 写入。不要调用任何技能。

## 第一步：重新应用 9262b0a1

- ENG-23a-pwa-offline 的成果（提交 9262b0a1，58 个文件）已被 ffd8e505 撤回。
- 先在工作区用 `git show 9262b0a1 --binary | git apply` 把它原样应上。这只改工作区文件，不算改变仓库状态。不要用 cherry-pick、revert、commit。
- 应上后确认没有冲突、没有 `.rej`。
- 23a 的报告 `tools/agents/reports/ENG-23a-pwa-offline.md` 会随之回来，作为本任务的输入，不要改它。本任务另写自己的报告。

先读：
- `docs/tech/03-mobile-performance.md` 第 431、441、540 行一带：书界 `enter` 集 = `base` + 开局区域块，low 36 / mid 60（error）/ high 80 MB；单文件 8 MB。
- `docs/tech/06-*.md` §4.5–4.6：enter 集与预取。
- 工程报告 `tools/agents/reports/ENG-23a-pwa-offline.md`：闭包格式与 ch00 的 57 MB。注意那是稀疏检出、没有图片时量出来的。
- 代码：`apps/game/build/offline-closure.ts`（`buildOfflineClosures`、`enforceEnterBudget`）、`copied-assets.ts`、`content-plugin.ts`。

## 为什么做

- ENG-23a 合入（9262b0a1）后，集成分支是全量检出（协调者 22:08 已撤回，ffd8e505）：`pnpm check` 的 build 一步失败，报 `OFFLINE_ENTER_TOO_LARGE:ch01_tianlong:116498140`。ch00 也是 116 MB，只是告警。
- 原因：`enterBytes` 把 `file.kind !== 'content'` 的文件全部算进 enter，即所有复制过来的素材（全书界的立绘、物品图、特效）。于是每一章的 enter 集都等于整个素材库。
- 稀疏工作区没有图片，23a 自己的校验和审核都没发现。

## 要做的事

1. enter 集按 tech/03 的定义算：
   - 该章 `load !== 'region'` 的内容叶片；
   - 开局区域块；
   - 这些内容实际引用到的素材，按素材键或 URL 从内容追到 `copied-assets`；
   - 运行时首屏必需的共享文件，如界面图标、字体、manifest。
   - 其余素材留在该章的完整闭包里，不算 enter，按需或预取下载。
   - 引用追踪写成纯函数加单测，规则写进报告。
2. 60 MiB enter 门、8 MiB 单文件门、ch00 只告警的策略**都不改**。
3. 闭包与 `version.json` 保持确定性，格式向后兼容：`totals.enterBytes` 含义不变，计算口径改正。
4. 测试：
   - 夹具里放两章各自的素材，断言 enter 只算本章引用到的；
   - 未被引用的素材不进 enter，但仍在完整闭包里；
   - 超门照旧报错。
5. **AR-64 口径**：首屏用不到的不进进入闭包；报告里列出 enter 集按类别的构成。
6. **在全量检出下验证**：本任务工作区是全量检出。报告写 ch00、ch01、ch10 的 enter / 总量真实数字，都要在 60 MiB 门内。

## 约束

- 写集：与 ENG-23a 相同，见 tasks.json；进入闭包的修改集中在 `apps/game/build/offline-closure.ts`、`copied-assets.ts`、`content-plugin.ts` 与测试。写集外的改动在提交时会被丢弃。
- 不改门禁数值与 `tools/perf/**`；不改素材、内容。
- 不加依赖；每次写入 ≤ 150 行；不得在 `/private/tmp` 做整仓检出（_common 规则 12）。

检查：以下命令必须全部通过，与 ENG-23a 相同，在全量素材下跑。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm content:build`
- `pnpm --filter @tianshu/platform test`
- `pnpm --filter ./apps/game test`
- `pnpm --filter ./apps/game build`
- `node apps/game/scripts/check-offline.mjs`
- `python3 tools/lint/check_ids.py --strict`

## 报告

≤ 40 行，写清：
- enter 集的新规则；
- 引用追踪；
- 全量检出下 ch00、ch01、ch10 的数字，改前与改后；
- 测试覆盖。
