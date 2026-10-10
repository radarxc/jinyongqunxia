# 本任务：3D 纸娃娃换装 · B6 · 运行时蒙皮网格视锥剔除修复（动作中头 / 衣物被整块剔掉）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。先读根 `CLAUDE.md`（性能规则：热路径不得每帧分配）、`packages/render/CLAUDE.md`、`packages/render/src/dressup/actor.ts` 全文、B1a / B3 / B4 报告第 7 节。

## 背景（协调者 2026-10-09 D1b 实测发现）
`shoot_head.mjs` 无头截图 `/character-3d` 时，`run@0.5` 后颈 / 背面近景整颗头不见了，身体照常画出。原因是 three.js 视锥剔除对蒙皮网格用的是"绑定姿势"包围球，而模板 `run` 动作上身前倾，头部前移约 30 cm、下移约 17 cm：近景相机的视锥与过期包围球不相交，于是整块网格被剔掉。头、衣物、带蒙皮的持物，以及身体本身都可能中招。截图工具在拍摄时临时把所有蒙皮网格设成 `frustumCulled = false` 绕过，游戏运行时仍有这个缺陷。

注意：three ≥ r151 的 `Frustum.intersectsObject` 对 `SkinnedMesh` 用的是对象自身的 `boundingSphere`。它在首次渲染时按当时姿势懒算一次（通常是绑定姿势），之后不再更新；剔除依据不是 `geometry.boundingSphere`。动手前先到本仓库实际的 three 版本源码里核对这一点，把结论写进报告。

## 要做的事
1. **修复**（`packages/render/src/dressup/`）：保证 actor 的身体与所有蒙皮装备在任何动作、任何机位下都不会被误剔。两种做法任选，报告写明取舍：
   - **优先**：建 actor 时按模板动画一次性算一个"动作包络球"，把各 clip 采样若干帧的骨骼世界位置与绑定姿势网格球取并集，再加余量。之后把它赋给身体和每件新挂上的蒙皮装备的 `boundingSphere`（注意坐标系与 `bindMatrix`），换装时同步更新。每帧零开销，保留离屏剔除。
   - **备选**：对这些网格设 `frustumCulled = false`。只有算包络球不划算时才用，报告要附 6 / 12 个角色同屏时的 draw call 与帧时间对比。
   - 不得每帧调用 `SkinnedMesh.computeBoundingSphere()`（每次遍历全部顶点）；`update(dt)` 仍零分配。刚性持物（挂在骨骼插槽上的普通 `Mesh`）按自身包围球剔除没有问题，不必改。
2. **测试**：同目录新增 `*.test.ts`，在 Node 里不用 WebGL，用 three 的 `Frustum` + 相机投影矩阵断言：
   - 构造一个蒙皮网格，把骨骼移到离绑定位置很远处，相机只看得见移动后的位置。修复后 `frustum.intersectsObject(mesh)` 为真；同一场景下旧做法（首帧懒算的绑定姿势球）为假，作为回归对照。
   - 实际 actor 的身体与装备在 `run` 采样帧上都能通过同样的断言（可用现有 actor 测试夹具）。
   - 换装新挂的蒙皮装备也拿到包络球。
3. **性能**：现有 render / dressup 性能用例与 draw call 统计不变或更好，报告写前后数字（CLAUDE.md：修改渲染时记录 draw call / 帧时间）。

## 约束
- 只写 `packages/render/src/dressup/` 下的 `.ts`（含新增辅助文件与 `*.test.ts`）、`packages/render/CLAUDE.md`（补一句剔除约定）与本任务报告。
- 不改 `assets/`、`tools/`（截图工具的临时绕过留着，报告第 7 节说明何时可撤）；不改门禁阈值、不加依赖；运行时仍只能经 `import('@tianshu/render/dressup')` 动态引入，`render-dressup` 块体积不超预算。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm --filter @tianshu/render test`
- `pnpm check`

## 报告
`tools/agents/reports/ENG-dressup-b6-cull.md`：第 3 节写 three 版本剔除依据的核对结论、采用的做法与理由、包络球如何计算（采样数、余量、坐标系）、测试清单、draw call / 帧时间前后对比；第 7 节写协调者在 5173 `/character-3d` 的验收步骤（tall 模板 + 头 + 劲装，run 动作，近景后颈 / 背面机位不再丢头）。报告 ≤ 50 行。

## 协调者裁定（2026-10-10 04:50，第 3 次运行后；AR-110 由 Claude 直接收尾）
1. **属性测试不加依赖**：`_code.md` 写"数学 / 几何类用属性测试（fast-check）"，但仓库没有任何包声明 fast-check（`docs/tech/01` 只是规划），本任务约束又写明"不加依赖"。第 2 次运行从 CDN 下载、第 3 次运行静态导入未声明的包，都不可接受。改为测试内固定种子的 mulberry32 生成 100 组用例（4 组边界 + 96 组随机：1–4 骨、40 个 [-200, 200] 整数），断言与原 fast-check 版逐条相同，离线可复现。协调者已做反向验证：去掉包络里的绑定距离项后该测试失败。
2. **工具链以仓库声明为准**：`package.json` 的 `packageManager: pnpm@9.15.9`、`engines.node >=22.12.0`。`RUNBOOK-P0` 的 Node 24 / pnpm 12 只用于 P0 期 T0–T5，不适用本任务；报告如实写实际版本。
3. **负载**：包级 `pnpm --filter @tianshu/render test`（`vitest run src`）会带上 `src/rig/performance.test.ts` 的 CPU 门。按根 `CLAUDE.md`，它须在机器负载低时跑；高负载下的失败不放宽、不跳过，换低负载时段重跑并记 loadavg。
4. 由 Claude 在本任务工作区直接改 `culling.test.ts` 与报告（AR-110，同 D1b / D1c / E2b），产物仍走 `supervise.py --from validate` 与 GPT 审核。
