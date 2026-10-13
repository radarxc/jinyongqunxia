# 本任务：3D 纸娃娃换装 · dressup-assets 测试里调 Python 的用例超时改为 300 s（负载误报；协调者 2026-10-08 16:25）

本任务只改一个测试文件。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

## 背景
`apps/game/build/dressup-assets.test.ts` 里调用 Python 门禁 / 工具的用例在多任务并行（机器负载 30~45）时超时误报：10-08 下午 G1、alloc-steady 的校验先后撞上 "runs all 72 dynamic frames for synthetic garment and hair gates"（120 s）与 "uses strict nearest triangles for signed distance and the minus 1 mm gate"（默认 5 s）。CLAUDE.md 禁止"高负载跳过 / 放宽"，**只调大超时上限**不改任何断言与门禁阈值，是协调者裁定的处理（B4 任务里也做了同样的改动，两边须逐字一致）。

## 要做的事（逐字照做，不做别的改动）
1. 该文件中所有 `120_000` 改为 `300_000`（含文件顶部 `spawnSync(..., timeout: 120_000` 两处与各用例末尾的 `}, 120_000);`）。
2. "uses strict nearest triangles for signed distance and the minus 1 mm gate" 用例末尾的 `});` 改为 `}, 300_000);`。
3. 其余一个字符都不改；不改其他文件。

## 约束
- 只写 `apps/game/build/dressup-assets.test.ts` 与本任务报告 `tools/agents/reports/AGY-dressup-pytimeouts.md`（≤ 15 行：改了几处、`git diff --stat`、检查结果）。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run apps/game/build/dressup-assets.test.ts --config vitest.workspace.ts`
- `pnpm check`
