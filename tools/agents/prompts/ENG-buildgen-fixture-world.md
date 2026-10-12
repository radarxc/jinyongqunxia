# 本任务：网格器按世界坐标消费方案家具（INV-2 室内净空检查与屏风）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md` 与 `packages/render/CLAUDE.md`。

**第一个动作**：读下面这些文件，读完直接动手，不要先写计划：
- `docs/tech/15-town-explore-v2-spec.md` §2.3（`TownBuildingPlan` 契约：`RectMm` 为世界 mm）；
- `packages/data/src/build/town-plan/interiors/solver.ts` 的 `rotateFixture()` / `rotateRect()`（i1 把房间局部坐标转成世界坐标，yaw 叠加建筑偏航）；
- `packages/render/src/buildgen/mesher/core/inspect.ts` 的 `fixtureContains()`、`localXZ()`；
- `packages/render/src/buildgen/mesher/parts/walls.ts` 的 `emitPartitions()`；
- `packages/render/src/buildgen/mesher/fixtures/interior.ts`（r8 已按世界坐标消费 fixture，可作对照）。

## 背景（协调者 2026-10-12，r8 审核交接）

方案的 `floors` 是世界坐标；i1 求解器输出的 `fixtures` 也是世界坐标：`cx/cz` 已含占地中心，`yaw` 已是世界朝向。r8 的室内拼装按世界坐标消费 fixture，网格器里还有两处按建筑局部坐标理解：
- `core/inspect.ts` 的 `fixtureContains()`：先把采样点转成建筑局部坐标，再和 fixture 的 `cx/cz` 比较。i1 方案一进来，INV-2 的阻挡家具豁免就会落错位置——该豁免的实体被判违例，不该豁免的被放过。
- `parts/walls.ts` 的 `emitPartitions()`：把屏风（idx 34）的 `cx/cz` 当局部坐标，再经 `hallOrigin(plan)` 和 `plan.yaw` 变换一次，屏风会被二次平移、旋转。

## 要做的事

1. `fixtureContains()`：直接用世界坐标点和 fixture 的世界包围盒比较（yaw 为奇数时宽深互换），不再经 `localXZ()`。
2. `emitPartitions()`：屏风中心取世界 `(cx, cz)`，朝向取 fixture 的世界 yaw；高度仍相对楼面（`localGroundM`）。
3. 在 `mesher/**` 里 grep 所有读 `plan.fixtures` / `plan.floors` 的地方。凡按局部坐标理解的都按世界坐标修正；本来就按世界坐标的不动。报告第 3 节逐处列出结论。

## 测试（命名用例）

- 新建 `packages/render/src/buildgen/__tests__/fixture-world.test.ts`：
  - 非零占地中心（例如 `[10_000, 20_000, …]`）× 四种建筑偏航：
    - INV-2 豁免落在阻挡家具的世界矩形上；
    - 同一实体挪出家具矩形后被判违例；
    - 屏风网格包围盒中心等于 fixture 的世界 `cx/cz`，宽深随世界 yaw 互换。
  - 用 i1 默认规划器（`planBuilding` 缺省 `defaultInteriorPlanner`）产出的药铺、客栈、铁匠方案，经网格器生成后跑 INV-2，不应出现由坐标系错位导致的违例；如果有别的违例，在报告列出，不要放宽检查。
- `__tests__/hall.test.ts` 里的 INV-2 / 屏风用例：
  - 夹具若靠局部坐标语义（占地中心为 0、偏航 0 时局部和世界恰好重合的除外），只把夹具坐标改成世界语义；
  - 阈值、断言、用例数一律不改。

## 约束

- 只写：
  - `packages/render/src/buildgen/mesher/core/inspect.ts`
  - `packages/render/src/buildgen/mesher/parts/walls.ts`
  - 第 3 步 grep 出、确需修正的 `mesher/**` 文件（报告逐个说明）
  - `packages/render/src/buildgen/__tests__/fixture-world.test.ts`
  - `packages/render/src/buildgen/__tests__/hall.test.ts`（只改上一节说的夹具坐标）
  - 本任务报告
- 不改：
  - `packages/data/**`（方案契约以 i1 为准）；
  - `mesher/fixtures/**`（r8 已按世界坐标）；
  - 门禁、预算与依赖。
- 只对本任务新建的文件做 `prettier --write`；基点未排版的文件只要求改动行合格式，不整文件重排。
- 工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run packages/render/src/buildgen --config vitest.config.ts --project node`
- `pnpm --filter @tianshu/render typecheck`
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`

## 报告

写 `tools/agents/reports/ENG-buildgen-fixture-world.md`（≤ 40 行）：
- 第 3 节：逐处列出 `mesher/**` 里读 `plan.fixtures` / `plan.floors` 的位置，以及改前、改后的坐标语义；
- 第 7 节：写给 l1（town-lab 走进店里的 INV-2 与屏风应已对位）与 r10（Worker 产物不变）的交接。
