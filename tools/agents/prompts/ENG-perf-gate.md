# 本任务：游戏工程 · render rig CPU 门禁测试抗负载化（ENG-12 遗留：门禁随机器负载抖动，拖垮所有工程任务的 `pnpm check`）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。先读根 `CLAUDE.md`、`packages/render/CLAUDE.md`、`docs/tech/09-character-rig.md` §1 第 6 条与 §5.3。

## 背景

tech/09：100 角色 1,600 个关节变换 **P95 ≤ 0.80 ms**、20 名满装角色 < 16.67 ms 是硬预算。ENG-12 把它写成 `packages/render/src/rig/performance.test.ts` 里的断言，随 `pnpm test` 与其他 24 个测试文件**并行**跑，采样只取一轮 600 帧的墙钟时间。集成机器同时跑着十几个执行器，2026-10-01 08:47 校验时 P95 实测 0.887 ms 判失败（空载时同一代码 < 0.8）。于是 `pnpm check` 成了随机失败，之后每个工程任务的校验都会被它拖累。**预算本身不能放宽。**

## 要做的事

1. 让门禁度量代码本身而不是机器瞬时负载：
   - (a) 预热后 **best-of-N（N ≥ 3）**，每轮各算 P95，取各轮最小值作为门禁值；
   - (b) 性能测试文件**不与其他测试文件并行**：在 `vitest.config.ts` 里给它单独的 project（如 `perf`：`fileParallelism: false`、单 worker、`sequence.concurrent = false`），仍包含在 `pnpm test` 里；其他 project 的 `include` 要排除掉它，避免跑两遍；
   - (c) 每轮把 P95、最小值、`os.loadavg()`、`os.cpus().length` 打进 `console.info`，断言失败信息里带上这些数，便于分辨"代码退化"还是"负载"。
2. 阈值保持 tech/09 的 0.80 ms（100 角色）与 16.67 ms（20 满装角色）不变；**不得**通过放宽阈值、减少角色数、减少帧数、改采样分位来"修复"。
3. 做完 (a)(b) 后连续跑 3 次 `pnpm test`；若仍有失败，再加一道**负载护栏**（最后手段）：`os.loadavg()[0] > os.cpus().length × 1.5` 时，100 角色门禁只记录（`console.warn` 写明跳过原因与数值）不断言，低负载照常断言；护栏的触发条件写进报告与 `packages/render/CLAUDE.md`。
4. 把测法写进 `packages/render/CLAUDE.md` 的性能条目（best-of-N、独立 project、护栏条件）。`docs/tech/09-character-rig.md` 不改。

约束：只改 `packages/render/**`、`vitest.config.ts`、根 `package.json`（如需脚本）；不改 rig 运行时逻辑（`batch.ts` / `character.ts` 等），除非是测量用的只读统计；每次写入 ≤ 150 行。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `python3 tools/lint/check_ids.py --strict`
- 另外连续 3 次 `pnpm test`（或只跑 perf project）都通过，三次的 P95 数值写进报告。

## 报告

第 7 节写：三次 P95 与 best-of-N 结果；vitest project 结构变化；是否启用护栏及条件；其余观察。报告 ≤ 60 行。
