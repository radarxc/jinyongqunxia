# 本任务：城镇 3D 古建 · 单体规划 `planBuilding`——尺寸档、开间、门、屋顶标高、可走面（hall / storeyed / stall / adobe 四类配方）

**第一个动作**：读 `tools/agents/reports/ENG-buildgen-p0-scaffold.md` 第 3、7 节与 `tools/agents/reports/ENG-buildgen-p1-kits.md` 第 3、7 节（`CompiledBuildKit` 的尺寸档字段与贴图层），再打开 `packages/data/src/build/town-plan/plan-hall.ts`（p0 的盒子方案）与 `docs/tech/16-town-3d-spec.md` §3（尺寸标准与四个算例）、§4；读完直接动手，不要先写计划。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`。

## 背景
作者 AR-114（2026-10-10，逐字）：「人物大小和建筑不匹配」——城镇建筑改为代码按布局占地 / 类型 / 年代参数生成的 3D 古建，门窗柱檐按真实尺寸。规划器（纯整数）决定一切与可走性有关的尺寸：门在哪、多宽多高、屋里哪里能走、屋顶多高。网格器（render 侧）只按方案出几何。本任务把 p0 的盒子方案换成真正的单体规划；院落（p3）与室内家具（i1 / i2）是后续任务。

## 要做的事（`packages/data/src/build/town-plan/`，纯整数，比例用万分比）
1. **`dims.ts`**：按套件 `dims` 尺寸档（vernacular / shop / middle / hall）与 tech/16 §3 规则算：台基高；开间数与各间宽（奇数间；跨 < 5000 单间、< 11000 三间、< 18000 五间，其余七间；明间 = 跨 ÷（1 + 2×0.82 [+ 2×0.68]），用整数万分比实现，余数并入明间）；檐柱高、柱径（H/11 或 H/10，夹到区间）；梁架高；出檐；举高（`rise` bp × 前后橑檐方距）；**滴水高**（橑檐方 − 出檐 × 0.40 + 飞椽上翘 40）与**正脊高**。四个算例必须对上：大理店铺 6×5 悬山滴水 3070、脊 4566；民居 6×5 硬山三间间广 1724 / 2102 / 1724、门 1400 × 2150、滴水 2910、脊 4419；客栈 10×8 两层歇山滴水 6130、脊 8547；寺殿 12×10 歇山斗拱滴水 4575、脊 8483（全部 ±1 mm，台基顶以上）。
2. **`doors.ts`**：入口边 → yaw（p0 已有）；门默认落在明间居中（布局入口偏移离明间 > 1 m 时用布局偏移）；门净宽 / 净高按尺寸档（民居单扇 900 / 双扇 1300–1500、店面敞口 1500–3200、客栈 1500–1800、殿堂 2000–2600；净高 ≥ 2100，殿堂 2800–3200）；**可走门宽 ≥ 1200**（单扇 900 的民居门只作装饰，`enterable` 时改双扇 ≥ 1300）；门槛 100–300 只记录不阻挡。输出 `entrances: [side, offsetMm, widthMm]`。
3. **`plan-hall.ts`**：`planBuilding()` 按套件 archetype 的 `recipe` 分派——`hall`（单层厅堂）、`storeyed`（两层：上层不可走，`storeys = 2`，屋顶标高按上层）、`stall`（摊位：无墙、前设柜台；整体不可进入，`enterable = false`、`floors = []`；摊主站位由 i1 的货摊模板放在柜台后，顾客在摊前街面上交谈）、`adobe`（西域：平顶，`roof = [Flat, 顶面, 顶面 + 女儿墙]`；`tang_buddhist` 变体寺院用 `Cuanjian` 塔刹）；`compound`（院落）在 p3 实现前**保持盒子方案**并在诊断里标 `PLAN_COMPOUND_PENDING`。
   - `floors` = 墙内净空矩形（扣墙厚，墙厚按套件 `walls`），`floorY` = 台基顶；`elev = [baseYMm, platformMm]`；`fixtures = []`（室内家具由 i1 / i2 接入——在 `planBuilding` 里留一个 `interior?: InteriorPlanner` 可选参数，缺省为"不放家具"的空实现，i1 会替换缺省值）；`signage` 按 archetype 的 `signage` 与输入 `signTextKey`。
   - 6×5 店铺室内净空 ≥ 4.2 × 2.9 m（tech/16 §3 算例 4.4 × 3.1 m）。
4. **试点夹具** `packages/data/src/build/town-plan/testing/`：从三份试点布局（`assets/default/baseline/town/town_dali__ch01.layout.yaml`、`assets/default/town/city_dali__ch10/layout.yaml`、`assets/default/town/city_turpan__ch10/layout.yaml`，本任务工作区已稀疏检出）提取每栋建筑的 `LayoutBuildingInput` 写成 `pilot-buildings.json`（只含规划需要的字段），附一个 `extract-pilot-buildings.ts` 脚本说明如何重出（测试不读 YAML，只读 JSON）。
5. **测试**（`packages/data/src/build/town-plan/__tests__/plan-hall.test.ts`）命名用例：四个算例 ±1 mm；全部试点建筑 + 合成尺寸 {6×5, 7×5, 7×6, 8×6, 9×7, 10×8, 12×9, 12×10, 13×10, 14×11, 3×2, 4×3, 5×4} × 4 个入口边：可进入者门净 ≥ 1200 × 2100、`floors` 在占地内（半开、离边 ≥ 墙厚）、`floors.length === floorY.length`；6×5 店室内 ≥ 4.2 × 2.9 m；同输入两次 JSON 逐字节相同；单栋方案 `JSON.stringify` ≤ 700 B；禁用运算 grep（沿用 p0 的源码守卫测试）。

## 协调者补充（10-11）
- p0 的 `__tests__/plan-building.test.ts` 里「p0 box planBuilding fallback」一组用例断言的是被本任务替换掉的盒子方案（如店铺得到 300 mm 内缩单 floor、`facility: 'none'` 等），换成真规划后必然失败。本任务写集已加该文件：**只许**改写这组盒子方案用例——非院落类型改为断言真规划的结果（门、floors、facility 按套件 archetype），`compound` 仍走盒子方案的部分可保留为盒子断言；文件里其他用例（坐标框、类型解析、套件夹具等）不动。报告第 6 节列出改写的用例。

## 约束
- 只写：`packages/data/src/build/town-plan/{dims,doors,plan-hall}.ts`、`packages/data/src/build/town-plan/testing/**`、`packages/data/src/build/town-plan/__tests__/plan-hall.test.ts` 与本任务报告。不改 p0 / p1 的其他文件（类型若必须扩充，只能新增可选字段并在报告说明）。
- 纯整数：不得用浮点参与尺寸、不得用 `/`（用 `floorDivInt` / `ceilDivInt`）、不得用三角函数 / `sqrt` / `pow` / `random` / `Date`；不新增依赖；工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run packages/data/src/build/town-plan --config vitest.config.ts --project node`
- `pnpm --filter @tianshu/data typecheck`
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`

## 报告
`tools/agents/reports/ENG-buildgen-p2-plan-hall.md`（≤ 70 行）：第 3 节列四个算例的实测、各尺寸档门 / 开间 / 室内净空表、`stall` 与 `compound` 的处理；第 7 节写给 r1 / r4 / r5（网格器按方案出几何）、i1（`InteriorPlanner` 接口与替换缺省值的位置）与编译器（`planBuilding` 输出可直接写入 `town-scene.v1`）的交接。
