# 本任务：城镇 3D 古建 · 西域土坯配方 `adobe`（含唐西州 `tang_buddhist` 变体）——厚墙抹角、平顶女儿墙、椽头、出水槽、高窗、雕门、前廊、葡萄架、晾房花砖墙、唐式塔刹

**第一个动作**：读 `tools/agents/reports/ENG-buildgen-r1-hall-body.md`、`ENG-buildgen-r2-roof-a.md`、`ENG-buildgen-r3-roof-b.md` 的第 3、7 节（屋身部件、平顶 `flat.ts`、攒尖 `pyramid.ts` 与宝顶），再打开 `packages/render/src/buildgen/mesher/recipes/adobe.ts`（r0 的桩）、`content/town/buildkits/xiyu.yaml`（p1 的套件：`variantSets.tang_buddhist` 的 `forbid` 与 `finial`）与 `docs/tech/16-town-3d-spec.md` §3（西域土坯列）、§4.3 末尾（tang_buddhist 说明）、§5.1 第 4 条、§6.5；读完直接动手，不要先写计划。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`、`packages/render/CLAUDE.md`。

## 背景
作者 AR-114（2026-10-10）：城镇建筑按年代与地域生成。吐鲁番 ch10 是唐长安二年（702）西州，按史实（tech/14 D13）用 xiyu 土坯套件的「唐代佛教」变体：土坯厚墙、平顶女儿墙、木椽头、高窗、雕门、葡萄架照常，**禁用**穹顶与尖拱（伊斯兰化在 14–15 世纪之后），寺院与官署用唐式佛塔刹顶。现有 xiyu 参考图偏喀什伊斯兰风，只取土坯做法。

## 要做的事（`packages/render/src/buildgen/mesher/`，不 import three）
1. **`recipes/adobe.ts`**（替换桩）：墙厚 450–600、两级抹角、墙基；平顶板（顶面 3.2–3.5 m）+ `parts/parapet.ts` 女儿墙 450 带压顶；`parts/joists.ts` 每 600 一根杨木椽头伸出墙面；木出水槽；高窗花格（窗台 ≥ 1800）；雕门（门净 ≥ 1000 × 2100，可走时 ≥ 1200）。所有平顶及以上（女儿墙、椽头、出水槽）进屋顶批（进屋时淡出）。
2. **变体部件**：`parts/iwan.ts` 前廊（2–4 根雕柱、深 1.5–2.4 m，柱下沿到廊顶净高 ≥ 2300）；`parts/trellis.ts` 葡萄架（底 ≥ 2300、立柱 + 横格，进屋顶批）；`parts/brick-lattice.ts` 晾房花砖墙（镂空砖格，用不透明几何做格，不用 alpha 测试）。
3. **`tang_buddhist` 变体**（启用与否看方案：p2 规划时按城市变体把塔刹写进方案可选字段 `finial`、并已把被禁的穹顶换成攒尖；本任务在 render 的 `BuildingPlanView`（`packages/render/src/buildgen/types.ts`）里**只加**同名可选字段 `finial?: string` 镜像它，网格器据 `plan.finial === 'tang_stupa'` 出唐式塔刹）：套件 `variantSets.tang_buddhist.forbid` 含 `dome` / `pointed_arch` 时，本配方不得产生穹顶或尖拱几何（门窗洞一律平拱或木过梁）；寺院 / 官署的屋顶用 r3 的攒尖 + 唐式塔刹宝顶（`finial: tang_stupa`：覆钵 + 相轮 5–7 重 + 宝珠，LOD1 简化为 3 重），唐式木构檐口（平顶外挑 300–450 的木檐 + 椽头）。非唐变体可用穹顶（调 r3 的 `dome.ts`）。
4. 配方注册：只替换 `adobe` 的桩。

## 测试（`packages/render/src/buildgen/__tests__/adobe.test.ts`，node 项目）
命名用例：
- 西域民居（迷你方案或 `pilot-plans.json` 中吐鲁番的民居）× 4 偏航 × LOD0 / LOD1：INV-1、2、3、4、5 无诊断；墙厚与女儿墙高 = 套件值 ±1 mm；椽距 600 ±1 mm。
- 葡萄架底 ≥ 2300；前廊净高 ≥ 2300；高窗窗台 ≥ 1800。
- **西域民居 LOD0 ≤ 1,800 三角**、LOD1 ≤ 900（tech/16 §6.5）。
- `tang_buddhist`：寺院方案生成后不存在穹顶三角（检查：没有任何顶点位于以占地中心为轴的旋转体轮廓上——用"屋顶缓冲中法线与竖直轴夹角在 15°–75° 且绕中心均匀分布"的穹顶判据，或更直接地给配方加测试可见的部件计数，断言 `dome = 0`、`pointedArch = 0`）；塔刹存在且最高点 = 方案 `roof[2]` + 宝顶高 ±10 mm。
- 非唐变体（同方案换变体）可生成穹顶（部件计数 `dome = 1`）。
- 同输入哈希稳定；`mesher/**` 无 three import（沿用 r0 的源码守卫）。

## 约束
- 只写：`packages/render/src/buildgen/mesher/recipes/adobe.ts`、`packages/render/src/buildgen/mesher/parts/{parapet,joists,iwan,trellis,brick-lattice}.ts`、`packages/render/src/buildgen/__tests__/adobe.test.ts` 与本任务报告。
- 不改 r1 的部件、r2 / r3 的屋顶实现、其他配方与 `core/**`（需要的扩展只加可选参数并在报告说明）；不改 data 包与套件 YAML；不新增依赖。
- 不 import three；不用浮点随机；工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run packages/render/src/buildgen --config vitest.config.ts --project node`
- `pnpm --filter @tianshu/render typecheck`
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`

## 报告
`tools/agents/reports/ENG-buildgen-r5-adobe.md`（≤ 50 行）：第 3 节列西域民居 / 客栈 / 寺院的三角数（LOD0 / LOD1）、墙厚 / 女儿墙 / 椽距实测、`tang_buddhist` 的部件计数；第 7 节写给 r9（屋顶批包含哪些部件）、美术线（xiyu 16 层贴图各用在哪些部件）与闸门 A（吐鲁番需要作者看的点）的交接。
