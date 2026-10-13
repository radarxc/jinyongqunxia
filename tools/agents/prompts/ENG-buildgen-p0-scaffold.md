# 本任务：城镇 3D 古建 · 规划器骨架 `packages/data/src/build/town-plan`（类型、坐标框、类型解析、rng、家具目录、全部桩、`./town-plan` 子路径）

**第一个动作**：打开 `docs/tech/16-town-3d-spec.md` §0–§4 与 §13.1（本任务那一行），再打开 `docs/tech/15-town-explore-v2-spec.md` §2.3–2.4（`TownBuildingPlan` 契约与两条一致性规则），读完直接动手；不要先写计划，写完一个文件就跑它的测试。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`（data 层只做数据与加载边界）。

## 背景
作者 AR-114（2026-10-10）：城镇建筑改为**代码按布局的占地、类型、年代参数生成的 3D 古建**，门窗柱檐按真实尺寸，人原地走进屋里。规划器 `planBuilding()` 是这条链的第一层：纯整数、确定，产出可走性依赖的一切（尺寸、门、可走面 floors、家具、站位、院落部件），内容编译器（tech/15 §3）与开发实验页都调用它。本任务只打地基：类型、坐标、类型解析、随机流、家具目录和**所有后续文件的桩**，让后续任务（p1 套件、p2 单体规划、p3 院落、p4 不变式、i1 / i2 室内）只替换各自的桩、互不冲突。

## 要做的事
1. **目录与桩**（全部建好，后续任务只改自己的文件）：`packages/data/src/build/town-plan/{index,types,frame,archetype,rng,fixtures,dims,doors,plan-hall,plan-compound,invariants,export-fixtures}.ts`、`kit/{schema,compile}.ts`、`compound/index.ts`、`interiors/{solver,hexes}.ts`、`testing/index.ts`、`__tests__/`。尚未实现的函数抛 `TOWN_PLAN_NOT_IMPLEMENTED`（带函数名），类型签名按 tech/16 §4.2 写全。
2. **`package.json` 子路径**：`packages/data/package.json` 的 `exports` 加 `"./town-plan": "./src/build/town-plan/index.ts"`。
3. **`types.ts`**：按 tech/16 §4.2 与 tech/15 §2.3 写全部类型（`Yaw4`、`LocalSide`、`RectMm`、`EntranceTuple`、`FixtureTuple`、`PartTuple`、`RoofStyle`、`PartKind`、`FacilityKind`、`TownBuildingPlan`、`LayoutBuildingInput`、`PlanningFrame`、`CompiledBuildKit`（先给最小结构，p1 再充实）、`PlanDiagnostic`、`FixtureKindDef`）。`const enum` 若与仓库 TS 配置（`isolatedModules` 等）冲突，改用普通 `enum` 或常量对象并在报告写明。
4. **`frame.ts`**（整数）：规划格 1 m → 世界 mm（`PlanningFrame`）；四分之一转局部 → 世界（tech/16 §4.1 表：k=0 (x,z)、1 (−z,x)、2 (−x,−z)、3 (z,−x)）及其逆；`worldSide = (localSide + k) % 4`（侧序 S, W, N, E）；入口边 → yaw（S→0、W→1、N→2、E→3）；`hexCentreMm(q, r) → [x, z]`（`x = round(57735·(2q + r)/100)`、`z = 1000·r`，整数实现，**不得用浮点与 `/`**——用 `@tianshu/shared` 的 `floorDivInt()` 等）；与 render 的 `regionHexWorld()` 在 1 mm 内一致（测试里对若干 (q, r) 比较）。
5. **`archetype.ts`**：解析布局类型串。现有布局中出现的全部 78 个类型串（下面附表）都必须解析成 `{ kit, archetype }` 或 `{ landmark }`：`bld_kit_<kit>_<archetype>`，kit 按已知套件前缀最长匹配（`liao_jin_north`、`song_dali`、`song_north`、`song_southern`、`tubo`、`xiyu`，并预留 `yuan_north|yuan_south|ming_north|ming_south|qing_north|qing_south|mongol|tang|song|yuan|ming|qing_early`）；`bld_lm_<chNN>_<name>` 为地标；未知串抛 `TOWN_PLAN_UNKNOWN_TYPE`。25 个 archetype：`guardhouse house_large house_small inn market_stall shop_1f shop_2f stable temple_hall wangfu warehouse yamen biaoju casino courtyard house manor restaurant shop shrine pagoda palace_hall wharf market palace`。
6. **`rng.ts`**：`fnv1a32(text)`、`splitmix32(seed)` 子流、`SALT = { variant, interior, props, visual }`；`seedFor(sceneId, buildingId) = fnv1a32(sceneId + '/' + buildingId)`；纯整数（`Math.imul` 与位运算）。
7. **`fixtures.ts`**：家具目录 `FIXTURE_KINDS: readonly FixtureKindDef[]`——tech/16 §8.4 列出的全部道具（下标、名称、宽深高 mm、是否阻挡、是否矮杂物 ≤ 250），以及 idx ≥ 200 的站位（`stn_keeper`、`stn_customer`、`stn_clerk`、`stn_waiter`、`stn_vendor`、`stn_monk`、`stn_guard`、`stn_dealer` 等，w = d = 0、blocks = 0）；下标稳定、按名可查。
8. **桩 `planBuilding()`**（`index.ts` 导出，`plan-hall.ts` 里先放"盒子方案"实现，供编译器在 p2 合入前先用）：yaw 由入口边定；`footprint` = 占地中心 + 局部 w × d（w 沿前脸）；`storeys = 1`；`roof = [Xuanshan, 3000, 4500]`；`entrances = [[0, 0, 1400]]`（前脸居中 1.4 m）；`elev = [baseYMm, 150]`；可进建筑 `floors = [占地内缩 300 mm 的矩形]`、`floorY = [150]`，否则空；`fixtures = []`；`signage = null`；`facility` 取输入或 `'none'`；`seed` 原样带出。
9. **测试**（`packages/data/src/build/town-plan/__tests__/*.test.ts`，node 项目）命名用例至少：四分之一转在 k = 0..3、1 万个点上精确往返；前脸法向映射到 S / W / N / E；78 个类型串全部可解析、未知串抛错；`hexCentreMm` 与 `regionHexWorld()`（从 `packages/render/src/region/terrain.ts` 读其公式写进测试常量，不要 import render）误差 ≤ 1 mm；禁用运算 grep：`town-plan/**/*.ts`（不含测试）不出现 `Math.sin|cos|tan|sqrt|pow|random|atan` 与 `Date`；`fnv1a32` 已知向量；盒子方案满足 tech/15 §2.4 规则 1（floors 在占地内）；所有桩函数都抛 `TOWN_PLAN_NOT_IMPLEMENTED`。

### 附：现有布局全部 78 个类型串（2026-10-11 从 200 份布局统计）
```
bld_kit_liao_jin_north_{guardhouse,house_large,house_small,inn,market_stall,shop_1f,shop_2f,stable,temple_hall,wangfu,warehouse,yamen}
bld_kit_song_dali_{biaoju,casino,courtyard,guardhouse,house,inn,manor,market_stall,restaurant,shop,shrine,stable,temple_hall,wangfu,warehouse,yamen}
bld_kit_song_north_{courtyard,house_large,house_small,inn,market_stall,shop_1f,shop_2f,stable}
bld_kit_song_southern_{biaoju,casino,courtyard,guardhouse,house,inn,manor,market_stall,pagoda,palace_hall,restaurant,shop_1f,shop_2f,stable,temple_hall,warehouse,wharf,yamen}
bld_kit_tubo_{casino,courtyard,house_small,inn,market_stall,shop_1f,stable,temple_hall,warehouse,yamen}
bld_kit_xiyu_{casino,courtyard,house_small,inn,market,palace,shop_1f,stable,temple_hall,warehouse,yamen}
bld_lm_ch01_chongshengsi_pagoda  bld_lm_ch01_chongshengsi_pagoda_small  bld_lm_ch02_linan_palace_gate
```

## 约束
- 只写：`packages/data/src/build/town-plan/**`（初建）、`packages/data/package.json`（只加一行 export）与本任务报告。
- 规划器源码纯整数：不得用浮点运算参与尺寸、不得用 `/`（用 `floorDivInt` / `ceilDivInt`）、不得用三角函数 / `sqrt` / `pow` / `random` / `Date`。
- 不新增依赖；工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用，随机用例用测试内固定种子 mulberry32。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run packages/data/src/build/town-plan --config vitest.config.ts --project node`
- `pnpm --filter @tianshu/data typecheck`
- `pnpm check`

## 报告
`tools/agents/reports/ENG-buildgen-p0-scaffold.md`（≤ 70 行）：第 3 节写坐标与四分之一转约定、类型解析规则、家具目录下标表；第 7 节写给 p1 / p2 / p3 / p4 / i1 / i2 与编译器任务（TOOL-town2-compiler-core）的交接：每人该替换哪些桩、`planBuilding` 当前盒子方案的形状。
