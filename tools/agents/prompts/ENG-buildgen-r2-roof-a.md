# 本任务：城镇 3D 古建 · 屋顶（一）——举折 / 举架剖面、坡面网格、硬山 / 悬山 / 平顶 / 布棚、屋脊、屋面壳

**第一个动作**：读 `tools/agents/reports/ENG-buildgen-r0-core.md` 第 3、7 节，再打开 `docs/tech/16-town-3d-spec.md` §3（尤其四个算例的举折檩高）与 §5.2；读完直接动手，不要先写计划。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`、`packages/render/CLAUDE.md`。

## 背景
作者 AR-114（2026-10-10）：城镇 3D 古建要"写实古风"——屋面曲线按宋《营造法式》举折（明清套件按举架），出檐深、檐口有厚度与瓦当，不要卡通玩具感。屋顶单独进"屋顶批"（每格 1 draw），进屋时整片淡出，所以屋顶顶点必须写进屋顶缓冲并带正确单元号。本任务做剖面数学和四种简单屋顶；歇山 / 庑殿 / 攒尖 / 卷棚 / 穹顶与翼角由 r3 做。

## 要做的事（`packages/render/src/buildgen/mesher/roof/`，不 import three）
1. `profile.ts`：`songZhe(halfRunMm, riseMm, steps)`——从脊到橑檐方连直线，第一缝下降 rise/10，再从该点连到橑檐方、下一缝降 rise/20、rise/40……逐缝减半，返回各缝高；`qingJujia(runsMm[], [0.5, 0.65, 0.75, 0.9])`；出檐段坡 0.40，飞椽再上翘 40 mm。**与 tech/16 §3 算例逐一对拍**：大理店铺 6×5 举折檩 346、滴水 3070、脊 4566；寺殿 12×10 檩 2733 / 1549 / 638 / 0（坡度 0.866 / 0.667 / 0.467），误差 ≤ 1 mm。
2. `patch.ts`：坡面按（沿檐 u ∈ [0,1]、檐 → 脊 t ∈ [0,1]）参数化——平面位置 = 檐线与脊线按水平跨分数插值，高度 = 剖面(t)；u 分段 = ceil(长 / 1 m)，LOD0 / LOD1 都不得低于这个下限（协调者 10-11 裁定：LOD1 减面只靠 t 向分段与省略细节，不减 u）；t 每个举折步 2 段 + 出檐 2 段。翼角加密留给 r3：协调者裁定接口为显式站位 `uStations?: readonly number[]`（首 0、末 1、严格递增、合并后相邻站位檐线长 ≤ 1 m，否则抛错）+ 导出纯函数 `cornerUStations(eaveLengthMm, cornerZoneMm, perCorner = 3)`（均匀站位 ∪ 两端各 perCorner 条角区站位）；不提供全檐均匀加段的 `extraUSegments`。
3. `gable.ts`：硬山（博缝齐山墙，山墙砌到屋面下）与悬山（出际 400–600 + 250 mm 博风板）。`flat.ts`：平顶（板 + 女儿墙，xiyu 用）。`canopy.ts`：布棚（垂度 = 跨的 3%，下沿 ≥ 2250）。
4. `ridge.ts`：正脊 / 垂脊沿折线挤出梯形（正脊 300–400，大理方翘头 550；垂脊 250–350）。`shell.ts`：屋面壳——上表面（瓦层，u = 沿檐米数，v = 沿坡弧长）、下表面（望板层，低 150–200）、檐口 120 mm 封檐带、博风条。
5. `index.ts`：替换 r0 的屋顶分派桩——按 `roof[0]` 式样分派到上面各实现（歇山 / 庑殿 / 攒尖 / 卷棚 / 穹顶先抛 `BUILDGEN_ROOF_PENDING`，r3 再接），所有顶点写入**屋顶缓冲**并带单元号。

## 测试（`packages/render/src/buildgen/__tests__/roof-a.test.ts`，node 项目）
命名用例：`songZhe` / `qingJujia` 与 tech/16 §3 金样 ±1 mm；剖面坡度自檐向脊严格递增（内凹）；滴水高 = 方案 `roof[1]` ±10 mm、正脊顶 = `roof[2]` ±10 mm；滴水外缘离占地边 ≥ 40 mm（INV-1）；相邻坡面共享边缝 ≤ 1 mm；四种屋顶的三角数在 tech/16 §6.5 预算内；屋顶顶点全在屋顶缓冲且单元号正确；同输入哈希稳定。

## 约束
- 只写：`packages/render/src/buildgen/mesher/roof/{index,profile,patch,gable,flat,canopy,ridge,shell}.ts`、`packages/render/src/buildgen/__tests__/roof-a.test.ts` 与本任务报告。不改屋身部件（r1）、不改其他配方。
- 不 import three；不新增依赖；工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run packages/render/src/buildgen --config vitest.config.ts --project node`
- `pnpm --filter @tianshu/render typecheck`
- `pnpm check`

## 报告
`tools/agents/reports/ENG-buildgen-r2-roof-a.md`（≤ 60 行）：第 3 节列四个算例的实测（滴水、脊、檩高、坡度）与各屋顶三角数；第 7 节写给 r3 的交接（翼角权重接口、坡面加密参数、屋脊折线输入格式）。
