# 本任务：城镇 3D 古建 · 院落规划 `planCompound`——院落 / 衙门 / 王府 / 庄园 / 镖局 / 寺院 / 西域客栈与院落的部件布局（纯整数）

**第一个动作**：读 `tools/agents/reports/ENG-buildgen-p2-plan-hall.md` 与 `tools/agents/reports/ENG-interior-i1-core.md` 的第 3、7 节（单体 `planBuilding` 的尺寸档与门、`InteriorPlanner` 调用方式与站位），再打开 `packages/data/src/build/town-plan/{plan-compound,plan-hall,types}.ts`、`packages/data/src/build/town-plan/compound/index.ts`（p0 的桩）与 `docs/tech/16-town-3d-spec.md` §4.2（`PartTuple`、`PartKind`）、§4.3（套件 `archetypes` 里 `layout: hall_wing_gate / yamen` 等与 `screenWall`、`preferSouthHall`）、§5.1 第 5 条、§8.1；读完直接动手，不要先写计划。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`。

## 背景
作者 AR-114（2026-10-10，逐字）：「希望用threejs做一个能进入建筑的游戏体验。」城里的大宅、衙门、王府、镖局、寺院是"院落"：一圈院墙、一座门楼、后部正房、两侧厢房、中间院子，大理有对门照壁。玩家能从门楼进院子，再进正房 / 厢房（每座房各有室内与站位）。p2 让 `compound` 暂时走盒子方案并标 `PLAN_COMPOUND_PENDING`；本任务实现真正的院落规划，网格器的院落配方是 r6。

## 要做的事（`packages/data/src/build/town-plan/`，纯整数，比例用万分比）
1. **`plan-compound.ts`** `planCompound(input, kit, seed, frame, interior)`（`planBuilding` 遇 `recipe: compound` 时分派到此，替换 `PLAN_COMPOUND_PENDING` 分支——只改那一处分派）：
   - 院墙（`Enclosure`，厚 / 高按套件 `walls.enclosure`，带压顶）沿占地四边内缩；门楼（`Gatehouse`，悬山，2.4 × 1.6 m 门洞 ≥ 1200 × 2100）在布局入口边；正房（`Hall`，套件尺寸档 + 开间规则复用 p2 的 `dims.ts`）在后部；厢房（`Wing`）按院宽 1–2 座；院子（`Yard`）为中间空地；院深 ≥ 5 m 时大理套件放照壁（`ScreenWall`）对门；套件开关 `preferSouthHall`：门在北时正房仍坐北朝南。
   - 每座房是一个子方案：自己的 `floors / floorY / entrances / fixtures`（调 `interior` 放家具与站位）；院子本身是一块 `floors`（可走），院墙与房屋墙体不可走；`parts` 写 `PartTuple`（≤ 12 个部件），各房门朝院。
   - 部件布局类型：`hall_wing_gate`（宅院）、`yamen`（衙门：大门 → 仪门 → 大堂，公堂模板）、`wangfu`（王府：多进，≤ 12 部件内取前两进）、`manor`（庄园）、`escort`（镖局：前厅 + 后院 + 马厩）、`temple`（寺院：山门 → 大殿，殿用 `hall` 尺寸档 + 斗拱）、`xiyu_inn` / `xiyu_court`（西域：土坯院墙、前廊、葡萄架 `Trellis`）。
2. **`compound/` 子模块**：每种布局一个文件（`compound/{residence,yamen,wangfu,manor,escort,temple,xiyu}.ts`），`compound/index.ts` 分派；共用的院墙 / 门楼 / 房屋放 `compound/parts.ts`。
3. **站位与可达**：每座可进的房按 i1 模板放站位；院子与每房的顾客 / 主人站位必须从门楼外的入口格 BFS 可达（用 i1 的 `hexes.ts`）。

## 测试（`packages/data/src/build/town-plan/__tests__/plan-compound.test.ts`，命名用例）
- 三座试点城里全部院落类建筑（`pilot-buildings.json` 中 `recipe = compound` 者）× 4 个入口边 + 合成占地 {12×10, 16×12, 20×16, 24×20}：
  - 部件都在占地内、两两不重叠（院墙与其内部件按内外关系判定）；部件数 ≤ 12；
  - 门楼在布局入口边、门洞 ≥ 1200 × 2100；各房门朝院；
  - 院子与每房站位从入口格 BFS 可达；`floorY` 在同一部件内一致；
  - `preferSouthHall`：门在北时正房前脸仍朝南（yaw 0）。
- 大理院深 ≥ 5 m 有照壁且照壁不挡门楼到院子的通路。
- 方案确定：同输入两次 JSON 逐字节相同；打印每个试点院落方案的 `JSON.stringify` 字节数（不设硬上限——整场景 ≤ 300 KB 由编译器 I5 把关；报告列实测，不得删字段凑数）。
- 禁用运算 grep（沿用 p0 的源码守卫测试）。

## 约束
- 只写：`packages/data/src/build/town-plan/plan-compound.ts`、`packages/data/src/build/town-plan/compound/**`、`packages/data/src/build/town-plan/__tests__/plan-compound.test.ts`、`packages/data/src/build/town-plan/plan-hall.ts`（**只许**改 compound 分派那一处）与本任务报告。
- 不改 p0 / p1 / p2 / i1 的其他文件（类型若必须扩充，只新增可选字段并在报告说明）；不改 `content/**`；不新增依赖。
- 纯整数：不得用浮点参与尺寸、不得用 `/`（用 `floorDivInt` / `ceilDivInt`）、不得用三角函数 / `sqrt` / `pow` / `random` / `Date`；工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run packages/data/src/build/town-plan --config vitest.config.ts --project node`
- `pnpm --filter @tianshu/data typecheck`
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`

## 报告
`tools/agents/reports/ENG-buildgen-p3-compound.md`（≤ 70 行）：第 3 节列每种布局类型的部件表、试点城院落实例（部件数、可走格数、JSON 字节）；第 7 节写给 r6（`PartTuple` 各字段如何出几何、院墙立面标记）、p4（院落相关的不变式）与编译器（院子 / 各房的 `building` 层归属与剖切态：院子态 1、室内态 2）的交接。
