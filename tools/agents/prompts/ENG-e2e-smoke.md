# 本任务（草稿，跑法待作者定）：游戏工程 · 浏览器冒烟与跨引擎确定性对拍（Playwright：Chromium + WebKit；代码审计 M9）

本任务写测试代码与脚本，**不在沙箱里跑浏览器**：执行器沙箱拦 Chromium。作者决定浏览器 e2e 由协调者在沙箱外跑。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读：
- 根 `CLAUDE.md`、`apps/game/CLAUDE.md`；
- 报告 `tools/agents/reports/ENG-19-*.md`（主流程界面与可测的 data-testid）、`ENG-23a-pwa-offline.md`（离线冒烟脚本）、`ENG-14b-meridian-golden-v3.md`（v3 黄金向量）、`ENG-16c-battle-session.md`（实战 = 回放 hash）；
- 审计报告 `tools/agents/reports/AUDIT-code-20261002.md` §3.3 M9、§4。

## 为什么做

路线图 `docs/tech/09-roadmap.md` §3.5 的闸门里有三条现在没有执行环境：
- 测试：关键路线 12 组冒烟；
- 确定性：相同初始快照加命令，V8 与 WebKit 得到同一终局 hash；
- 经脉黄金：同一黄金文件在 Node / V8 与 Playwright WebKit / JSC 上逐字段相等。

仓库里没有 Playwright 依赖、没有浏览器测试项目，也没有 CI（`.github/` 不存在）。审计 M9 还指出：`pnpm check` 不含 `check_ids --strict` 与 Python 工具测试。

## 要做的事

1. **Playwright 工程**：
   - 加 `@playwright/test` 开发依赖。浏览器二进制**不下载**，由协调者在沙箱外 `npx playwright install chromium webkit`；
   - `playwright.config.ts` 设 chromium、webkit 两个项目，`webServer` 起 `vite preview`；
   - 用例放 `tests/e2e/`。
2. **冒烟用例**，按路线图 §3.5 的口径，依赖 ENG-19 的主流程：
   - 新游戏 → 跳过开场 → 序章的探索、对话、战斗各一段 → 序章结束 → 初眠配点 → 白马冷入口；
   - 存档、导出、导回；
   - 飞行模式：用 `context.setOffline(true)` 重载并继续；
   - 三档难度各 1 次；触控与键鼠两种输入；
   - 每组都要有可断言的界面状态，不只截图。
3. **跨引擎对拍**：
   - 打一个只含 core 的测试页（开发构建专用，不进生产产物）：在浏览器里跑经脉 v3 黄金向量与战斗回放 hash，结果交回测试；
   - 与 Node 下的结果逐字段比对，记录首个差异。
4. **门禁补全**：
   - 新增 `pnpm check:content`：`check_ids --strict` 加 `python3 -m unittest discover -s tools -p "test_*.py"`，并入 `pnpm check`；
   - 浏览器部分单列 `pnpm e2e`，**不并入** `pnpm check`。
5. 写 `tools/ci/run_local_ci.sh`，按顺序跑：`pnpm check` → `pnpm e2e --project=chromium` → `pnpm e2e --project=webkit` → 对拍报告。供协调者在沙箱外一键执行。

约束：
- 写集：`tests/e2e/**`、`playwright.config.ts`、`apps/game/src/dev/**`（测试页）、`apps/game/vite.config.ts`（只为测试页入口，生产产物不含）、`package.json`、`pnpm-lock.yaml`、`tools/ci/**`。
- 不改 `packages/**` 的业务代码。
- 每次写入 ≤ 150 行。
- 不得放宽、跳过或改写任何门禁测试。

检查（沙箱内能跑的部分）：
- `pnpm install --frozen-lockfile`（锁文件有变化时先 `pnpm install`）
- `pnpm check`
- `pnpm exec playwright test --list`（只列用例，不启动浏览器）
- `pnpm --filter ./apps/game build`

## 报告

第 7 节写：
- 用例矩阵；
- 对拍方法；
- 沙箱外运行步骤（逐条命令）；
- 尚缺的 data-testid 或接口。

报告 ≤ 60 行。
