# 本任务：3D 纸娃娃换装 · actor 分配采样用例改为"等到稳态"（JIT 过渡期误报；协调者裁定 2026-10-08 15:45）

本任务只改一个测试文件并实跑。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`（性能规则：禁止"高负载跳过 / 放宽"）与 `packages/render/src/dressup/actor-runtime.test.ts`、`packages/render/src/dressup/actor.ts`。

> 工具链口径：以根 `package.json` 为准（pnpm 9.15.9、Node ≥22.12）。

## 背景（协调者实测）
`actor-runtime.test.ts` 的 "samples no steady update allocations with animation, held fingers, and a socket" 单独跑 6/6 失败（`expected 16952 / 20384 to be +0`），全量 `pnpm check` 里也偶发失败（10-08 下午 V3、D1 两次校验被它打断）。协调者探针：在同一用例里 GC 后按 600 帧一个窗口连续取 12 次 `HeapProfiler.getSamplingProfile`，`update` 子树按函数名求字节差——**只有第 1 个窗口**多出保留字节，记在 `Math.atan2`、three 的 `evaluate` / `_updateTime` / `updateMatrixWorld` 名下（未优化代码装箱浮点数：强制 GC 后代码回到未优化态、重新优化前的过渡期），**其后 11 个窗口全部为 0**。即 `update` 稳态确实无分配，失败来自测量窗口落在 JIT 过渡期。

## 要做的事
1. 把该用例的测量改成"等到稳态"：GC 后按 600 帧一个窗口连续取样，每窗把 `update`（`actor.ts`）子树字节与上一窗比较是否**完全相等**（阈值仍是 0，不许改成"小于某值"）；要求 **10 个窗口内出现连续 3 个干净窗口**，否则失败；失败信息列出最后一个脏窗口按函数名的字节差。取样、比较、判定写成同文件内的小函数，供第 2 步复用。
2. **反向自检**（同文件新增用例）：用同一判定函数测一个每帧 `new Float32Array(4)` 并保留到下一帧的假 `update`，断言判定失败（真有每帧分配时每个窗口都会变化）。
3. 其余断言（`root` / `skeleton` / `stats` / `boneMatrices` / 插槽同一引用、`boneTextureUploads === 1`、dispose 后 stats 归零、`shortLivedAllocationProbe` 有采样）原样保留；不得加任何"按负载 / 环境跳过或放宽"的逻辑；不改 `actor.ts` 与其他文件。
4. 实跑：该文件单独跑 5 次全部通过（`pnpm exec vitest run packages/render/src/dressup/actor-runtime.test.ts --config vitest.workspace.ts`），把 5 次结果与每次干净窗口出现的位置写进报告。

## 约束
- 只写 `packages/render/src/dressup/actor-runtime.test.ts` 与本任务报告。
- 不改运行时、不加依赖、不改其他测试与门禁阈值。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run packages/render/src/dressup/actor-runtime.test.ts --config vitest.workspace.ts`
- `pnpm exec vitest run packages/render/src/dressup/actor-runtime.test.ts --config vitest.workspace.ts`
- `pnpm exec vitest run packages/render/src/dressup/actor-runtime.test.ts --config vitest.workspace.ts`
- `pnpm check`

## 报告
`tools/agents/reports/ENG-dressup-alloc-steady.md`：第 3 节写改前 / 改后单独跑的通过次数、干净窗口位置、反向自检结果；第 7 节写给后续改 `actor.ts` 的人：这个用例判什么、怎么读失败信息。报告 ≤ 30 行。
