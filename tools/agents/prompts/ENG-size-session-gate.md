# 本任务：游戏工程 · 体积门禁补「首次会话闭包」：标题页 entry / 首次会话闭包 / 子系统块三层报告（新增 session 预算 110 KiB gzip）

本任务改体积门禁脚本与预算表，**只加不放宽**。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开 pnpm store 写入。

先读：
- 根 `CLAUDE.md`；
- `tools/perf/check_size.mjs`、`tools/perf/check_size.test.mjs`、`tools/perf/budgets.json`、`tools/perf/README.md`；
- `tools/agents/reports/ENG-entry-split.md`：拆分后各块的组成与大小；
- `apps/game/src/core-worker.ts`、`apps/game/src/runtime/**`：只读，弄清 Worker 壳与首次会话预载入口。

## 为什么做

ENG-entry-split 把 core Worker 与各子系统改成按需 `import()`：
- 标题页 entry 闭包从 169.08 降到约 38.9 KiB gzip；
- 拆出去的约 86 KiB 改在玩家第一次「新游戏 / 读档」时加载，组成为 Worker 壳约 2.3 + 首次会话静态闭包约 65.1 + 虚拟基础内容约 18.5。

现行 `check_size.mjs` 只量标题页 entry 闭包，这 86 KiB 不再受任何预算约束。

协调者裁定（10-03 09:52；默认值，记 TODO §8.2 待作者确认）：
- 新增「首次会话闭包」门禁：Worker 壳 + 首次会话静态闭包 + 虚拟基础内容，**预算 110 KiB gzip**；
- `entry` 170 保持不变，只约束标题页；
- 各懒加载子系统块（对话 / Ink、区域、战斗、城镇）在 size 报告里逐块列出大小，**先不设门**，供作者看；
- `pnpm size` 的输出表头写明三层：标题页 entry / 首次会话闭包 / 子系统块。

## 要做的事

1. **识别三层**，要可靠，不能靠文件名猜：
   - 标题页 entry：沿用现有 `gzipClosure(entryKey)` 的静态闭包口径，不改；
   - 首次会话闭包：从 Vite manifest（含 Worker 的产物）里，按源模块键定位 Worker 入口和「首次会话预载入口」，算它们的静态闭包，再加虚拟基础内容块；
   - 若现有 manifest 不足以表达 Worker 内部的块图（Vite 对 Worker 单独打包），允许在 `apps/game/vite.config.ts` 或 `apps/game/build/**` 里加一个**只产出元数据**的小插件，输出 `dist/.vite/size-groups.json`，按组列出块文件。不得改变任何产物内容或分块方式。
   - 找不到应有的组时，报 `SIZE_SESSION_GROUP_MISSING` 等错误码并退出 1，不得空过（同 ENG-19c 的口径）。
2. **预算**：`budgets.json` 新增 `session: 110`，放在 `chunks` 或新开一节，以脚本可读、清晰为准。其他预算一字不动。
3. **报告格式**：`pnpm size` 输出分三段，表头写明：
   - 标题页 entry 闭包（预算 170）；
   - 首次会话闭包（预算 110）；
   - 子系统块：只列大小，标「未设门」。
   保留现有 render、webgl total 等行。
4. **测试**（`tools/perf/check_size.test.mjs`），用合成 manifest：
   - 三层识别正确；
   - session 超 110 时退出 1；
   - 缺组时报错退出；
   - 子系统块只报告、不判失败。
5. 在本工作区实测 `pnpm size`，报告写三层的真实数字。

## 约束

- 写集：
  - `tools/perf/check_size.mjs`、`tools/perf/check_size.test.mjs`、`tools/perf/budgets.json`（只新增 session 一项）、`tools/perf/README.md`；
  - `apps/game/vite.config.ts`、`apps/game/build/**`：仅限上面说的元数据插件，不改产物。
  - 写集外的改动在提交时会被丢弃。
- 不放宽、不删除任何现有预算与检查；不改 `packages/**`、`apps/game/src/**`。
- 不加依赖；每次写入 ≤ 150 行；不得在 `/private/tmp` 做整仓检出（_common 规则 12）。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm --filter ./apps/game build`
- `node tools/perf/check_size.mjs`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 3 节写：
- 三层的识别方法；
- 实测数字：标题页 entry、首次会话闭包及其组成、各子系统块；
- 新门禁的失败示例输出。

第 6 节写需同步到 `docs/tech/01-architecture.md` 包体门禁表的内容，交文档任务。

报告 ≤ 40 行。
