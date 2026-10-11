# 本任务：城镇 3D 古建 · 方案不变式 `checkPlan` + 试点方案导出夹具（给 render 用）+ 新鲜度测试

**第一个动作**：读 `tools/agents/reports/ENG-buildgen-p2-plan-hall.md`、`ENG-buildgen-p3-compound.md`、`ENG-interior-i1-core.md` 的第 3、7 节，再打开 `packages/data/src/build/town-plan/{invariants,export-fixtures,types}.ts`（p0 的桩）、`packages/data/src/build/town-plan/testing/pilot-buildings.json`（p2 的试点输入）与 `docs/tech/16-town-3d-spec.md` §5.4（INV-1…6）、`docs/tech/15-town-explore-v2-spec.md` §2.4（两条一致性规则）；读完直接动手，不要先写计划。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`（render 不 import data；两边共享的数据走提交的 JSON 夹具）。

## 背景
作者 AR-114（2026-10-10）：城镇建筑由代码按占地 / 类型 / 年代参数生成 3D 古建，人能原地走进屋。规划器（data，纯整数）决定可走性，网格器（render）只按方案出几何；两边必须对同一份方案达成一致——规划器保证方案自洽（`checkPlan`），网格器测试用**同一批**试点方案验证几何不越界（INV-1…5 的几何版在 r0 / r1 的 `inspect.ts`）。render 不能 import data，所以把试点方案与编译后的套件导出成 JSON 夹具提交进 render 的 `testing/`，并用新鲜度测试保证夹具不过期。

## 要做的事
1. **`invariants.ts` `checkPlan(plan, kit) → PlanDiagnostic[]`**（替换桩）：方案层面的 INV（几何无关的部分）——
   - INV-1（方案版）：`floors`、家具、部件都在占地内、离边 ≥ 40 mm（招牌挂点例外按 §5.4）；
   - INV-2（方案版）：阻挡家具与 `floors` 的关系、矮杂物规则；
   - INV-3（方案版）：每个入口门净 ≥ 1200 × 2100（殿堂 ≥ 2800 高）、门槛矩形在 floors 内、门在 floors 的边上；
   - INV-4（方案版）：`roof[1]`（檐高）≥ 2200 + 门槛余量；两层时上层楼板 ≥ 首层地面 + 2200；
   - INV-6：可进的非住宅有 `stn_keeper`（在 floors 外）与 `stn_customer`（在 floors 内、从入口格可达，用 i1 的 `hexes.ts` BFS）；
   - 另：`floors.length === floorY.length`、所有数为安全整数、`yaw ∈ 0..3`、部件 ≤ 12、`facility` 为合法 `FacilityKind`。
2. **8 种损坏样例**（测试夹具内构造）：门太窄、门太矮、floors 出界、家具压通道、店员在 floors 内、顾客不可达、`floors/floorY` 长度不等、上层楼板太低——每种 `checkPlan` 都要报出对应诊断码。
3. **`export-fixtures.ts`**：从 `pilot-buildings.json` + 两个套件（`song_dali`、`xiyu`）跑 `planBuilding` 与 `compileKit`，输出 `packages/render/src/buildgen/testing/pilot-plans.json`（全部试点方案，按 id 排序的规范 JSON）与 `packages/render/src/buildgen/testing/pilot-kits.json`；附命令行入口（`pnpm exec tsx packages/data/src/build/town-plan/export-fixtures.ts --write`）。
4. **新鲜度测试** `__tests__/fixtures-fresh.test.ts`：重新生成到内存，与已提交的两个 JSON 逐字节比较，不同即失败并提示重跑命令。

## 测试（`packages/data/src/build/town-plan/__tests__/{invariants,fixtures-fresh}.test.ts`，命名用例）
- 全部试点方案（含院落）`checkPlan` 零诊断。
- 8 种损坏样例各报出预期诊断码（每种一个用例）。
- 新鲜度：提交的 `pilot-plans.json` / `pilot-kits.json` 与重新生成的逐字节一致；故意改一个数后测试失败（用内存副本模拟，不改提交文件）。
- 夹具体积：打印两个 JSON 的字节数（报告列实测）。

## 约束
- 只写：`packages/data/src/build/town-plan/{invariants,export-fixtures}.ts`、`packages/data/src/build/town-plan/__tests__/{invariants,fixtures-fresh}.test.ts`、`packages/render/src/buildgen/testing/pilot-{plans,kits}.json` 与本任务报告。
- 不改 p0–p3、i1 的其他文件（发现方案本身违反不变式时，**不要**改规划器去迁就，写进报告第 4 节交给对应任务）；不改 render 代码；不新增依赖。
- 纯整数；不得用 `/`、三角函数、`sqrt`、`pow`、`random`、`Date`；工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run packages/data/src/build/town-plan --config vitest.config.ts --project node`
- `pnpm --filter @tianshu/data typecheck`
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`

## 报告
`tools/agents/reports/ENG-buildgen-p4-invariants.md`（≤ 60 行）：第 3 节列诊断码表与试点方案的检查结果、两个夹具的字节数；第 4 节列发现的方案问题（若有）；第 7 节写给 r1–r7（用 `pilot-plans.json` 做几何测试的方式）、l1（实验页如何读夹具 / dev 插件实时生成）与编译器（编译时调用 `checkPlan` 的位置）的交接。
