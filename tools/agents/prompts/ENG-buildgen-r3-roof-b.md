# 本任务：城镇 3D 古建 · 屋顶（二）——歇山、庑殿、攒尖、卷棚、穹顶、翼角起翘 / 冲出、脊饰

**第一个动作**：读 `tools/agents/reports/ENG-buildgen-r2-roof-a.md` 第 3、7 节（翼角权重接口、坡面加密参数、屋脊折线输入格式）与 `tools/agents/reports/ENG-buildgen-r0-core.md` 第 7 节，再打开 `packages/render/src/buildgen/mesher/roof/{index,profile,patch,ridge,shell}.ts` 与 `docs/tech/16-town-3d-spec.md` §3（翼角起翘 / 冲出表）、§5.2；读完直接动手，不要先写计划。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`、`packages/render/CLAUDE.md`。

## 背景
作者 AR-114（2026-10-10）：城镇 3D 古建要"写实古风"。客栈、寺殿、衙门、门楼用歇山 / 庑殿，亭与塔刹用攒尖，园林小筑用卷棚；翼角起翘是中国古建最显眼的轮廓特征，做不好就是"玩具房"。r2 已做剖面、坡面、硬山 / 悬山 / 平顶 / 布棚、屋脊与屋面壳，本任务补齐其余式样与翼角，并把 r2 在 `index.ts` 里留的 `BUILDGEN_ROOF_PENDING` 全部接上（穹顶只给非唐代 xiyu 变体）。

## 要做的事（`packages/render/src/buildgen/mesher/roof/`，不 import three）
1. **`corner.ts` 翼角**：Δy = L·w_u·w_t（起翘 L），平面沿角平分线外推 C·w_u·w_t（冲出 C）；`w_u` 在每条檐边末三分之一做 smoothstep，`w_t = (1 − t/0.35)²`（t < 0.35，以上为 0）。**共享戗脊两侧必须算出同一权重**（按世界坐标的角点与戗脊参数求权重，不按各自坡面的局部 u），保证无缝。起翘 / 冲出取套件 `dims` 的 `lift: [起翘, 冲出]`（大理 180 / 120、客栈 300 / 220、殿堂 480 / 360、土坯 0）。
2. **`hip.ts` 庑殿**：前后梯形 + 两侧三角；正脊长 = 柱跨 W − D；宋式不推山，`qing_jujia` 剖面时推山 0.1。
3. **`xieshan.ts` 歇山**：前后梯形 + 侧面戗到 t = 0.45 + 收山 0.6–1.2 m 的山花板（竖直三角 + 博风）+ 博脊；上半为悬山、下半为庑殿式四坡的组合要无缝。
4. **`pyramid.ts` 攒尖**：n（4 / 6 / 8）个三角坡汇于单一顶点 + 宝顶（600–1200）；顶点数恰为 1 个共享顶点（测试断言）。
5. **`rolled.ts` 卷棚**：无正脊，脊部用半径 350 的圆弧过渡，与两坡切线连续。
6. **`dome.ts` 穹顶**：旋转体 12 × 6（LOD1 8 × 4）。**变体约束由规划器负责**（协调者 10-11 r2 裁定：p2 在 `tang_buddhist` 下已把被禁的穹顶换成攒尖，网格器拿不到城市级活动变体）——网格器对任何 `Dome` 方案照常出穹顶，不按套件是否声明过 `tang_buddhist` 去猜，`index.ts` 里那类判断删掉。
7. **`ornaments.ts` 脊饰**：殿堂鸱尾（正脊两端，LOD0 约 80 三角、LOD1 约 24）、大理方翘头（550）、攒尖宝顶；作为屋顶批顶点、带单元号。
8. **`index.ts` 注册**：把以上式样接入 r2 的分派表（只改分派表与必要的导入，r2 已有的式样实现不动）。

## 测试（`packages/render/src/buildgen/__tests__/roof-b.test.ts`，node 项目）
命名用例：
- 起翘 / 冲出 = 套件值 ±5 mm（在角点实测）；`w_t` 在 t ≥ 0.35 处为 0（坡面中部不受翼角影响）。
- **戗脊无缝**：歇山、庑殿、攒尖的每条戗脊两侧坡面在共享边上的顶点按位置合并后，最大缝 ≤ 1 mm；用 4 种占地 × 3 套 `lift` 值的组合。
- **镜像对称**：对称占地的庑殿 / 歇山，把几何按前后中线镜像后哈希（排序后的量化顶点集）与原几何相同。
- 攒尖单顶点；卷棚脊部切线连续（相邻段法线夹角 ≤ 12°，直接读输出网格相邻三角算）；穹顶照常出（变体约束归规划器）。
- 滴水高 = `roof[1]` ±10 mm、正脊 / 宝顶顶 = `roof[2]` ±10 mm；滴水外缘离占地边 ≥ 40 mm（翼角冲出后仍满足 INV-1）。
- 三角数在 tech/16 §6.5 预算内（寺殿 LOD0 屋顶部分 ≤ 预算的屋顶份额，报告列实测）；屋顶顶点全在屋顶缓冲且单元号正确；同输入哈希稳定。

## 约束
- 只写：`packages/render/src/buildgen/mesher/roof/{hip,xieshan,pyramid,rolled,dome,corner,ornaments}.ts`、`packages/render/src/buildgen/mesher/roof/index.ts`（只改分派注册）、`packages/render/src/buildgen/__tests__/roof-b.test.ts` 与本任务报告。不改 r2 的 `profile / patch / gable / flat / canopy / ridge / shell` 实现（若接口确需扩充，只加可选参数并在报告说明）；不改屋身部件、配方、`core/**`。
- **协调者 10-11 r2 返修裁定扩大的写集**（tasks.json 同步）：`packages/render/src/buildgen/mesher/recipes/hall.ts`——只把屋顶调用改回 `roofMesherFor(plan.roof[0])(plan, unit, sink, { kit, lod })`（集成热修 6208f945d 为避开一条测试临时去掉了 `kit`，导致真实链路起翘 / 脊饰退化为 0）；`packages/render/src/buildgen/__tests__/hall.test.ts`——只修「mulberry32 seed covers dimension, side and offset boundary combinations」那条用例的随机方案，使 `roof[1] / roof[2]` 与随机占地自洽（用 r2 导出的剖面函数按套件 `dims` 求，或固定进深只变面宽并注释原因），不删用例、不放宽断言；整栋预算（tech/16 §6.5，寺殿 9,000 / 4,000）用 `generateCells()` 实测，报告写整栋数字，不把整栋预算说成「屋顶份额」。`index.ts` 仍只改分派表与必要导入，不得写附着盒之类的补偿几何。
- **协调者 10-11 r3 补充写集**（tasks.json 同步）：`packages/render/src/buildgen/generate.test.ts`——只改「measures aUnit local height from the unit floor (base + floorY), not from the base」这条：原用例靠 hall 临时檐口标记（只在回落屋顶时生成）在 shell 里找檐高顶点，正式屋顶接上后必然找不到；改为对寺殿与抬高 1.2 m 的变体，逐个检查 **shell 与 roof 全部顶点** `|局部高度cm − (y − 楼层地面m) × 100| ≤ 0.5`，并断言 roof 里确有高于楼层地面 2.2 m 的顶点（证明屋顶参与了检查）。不得为让旧用例通过而在 hall / index 里加附着盒或标记几何。
- **协调者 10-12 r4 补充写集**（tasks.json 同步）：`packages/render/src/buildgen/__tests__/roof-a.test.ts`——只把「r3 式样（歇山、庑殿、攒尖、卷棚、穹顶）分派抛 `BUILDGEN_ROOF_PENDING`」的旧断言改成「分派到正式网格器、生成非空 roof 缓冲」；r2 自己式样的断言一律不动。随后删掉 `index.ts` 的 `retainLegacyPending()` 与全部 pending 兼容分支，所有合法式样都进正式网格器。`hall.ts` 里对 `BUILDGEN_ROOF_PENDING` 的回落分支保留无妨（不会再触发），不要为此改 hall.ts 的其他部分。
- 不 import three；不新增依赖；不用浮点随机；工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run packages/render/src/buildgen --config vitest.config.ts --project node`
- `pnpm --filter @tianshu/render typecheck`
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`

## 报告
`tools/agents/reports/ENG-buildgen-r3-roof-b.md`（≤ 60 行）：第 3 节列各式样的三角数（LOD0 / LOD1）、戗脊最大缝实测、起翘 / 冲出实测；第 7 节写给 r4（腰檐复用哪个坡面函数）、r5（xiyu 平顶与唐式塔刹的攒尖复用）、r7（塔檐与门楼歇山复用）、r9（屋顶批的单元号约定）的交接。
