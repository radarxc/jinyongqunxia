# 本任务：城镇 3D 古建 · 室内摆放求解器 + 七类室内模板（杂货、药铺、客栈、酒肆、住宅、铁匠、货摊）

**第一个动作**：读 `tools/agents/reports/ENG-buildgen-p2-plan-hall.md` 第 3、7 节（`InteriorPlanner` 接口与缺省值所在位置、`floors / fixtures` 的坐标约定、6×5 店铺室内净空）与 `tools/agents/reports/ENG-buildgen-p0-scaffold.md` 第 3 节（家具稳定下标 0–42、站位 200–211），再打开 `packages/data/src/build/town-plan/interiors/{solver,hexes}.ts`（p0 的桩）、`packages/data/src/build/town-plan/fixtures.ts` 与 `docs/tech/16-town-3d-spec.md` §8（全部）、`docs/tech/15-town-explore-v2-spec.md` §2.4（C6 室内可走规则）；读完直接动手，不要先写计划。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`。

## 背景
作者 AR-114（2026-10-10，逐字）：「采买这些都在建筑里进行（搭配NPC对话）。」走进药铺要看见百子柜、柜台、掌柜站在柜台后面朝门，玩家能走到柜台前和掌柜说话，但进不了柜台后面。规划器（纯整数）决定家具在哪、哪里能走、店员和顾客站哪；网格器只按方案画（家具几何是 r8）。p2 在 `planBuilding` 里留了 `interior?: InteriorPlanner` 参数，缺省是"不放家具"；本任务实现求解器与七类模板并替换缺省值。

## 要做的事（`packages/data/src/build/town-plan/interiors/`，纯整数）
1. **`solver.ts`** 按 tech/16 §8.2 第 1–7 条：房间局部坐标；门内通道 `[ox − wd/2 − 200, ox + wd/2 + 200] × [D/2 − 1400, D/2]` 阻挡家具不得碰；分带（后带、侧带 350–500、柜台线 `z_c = −D/2 + 后带 + 800 + 柜深/2`）；店员过道从 floors 剔除；`stn_keeper` 在过道中间面朝门；`stn_customer` 在柜台前 600；房间太小依次删可选陈设 → 侧架 → 次要站位（柜台与店员永不删），小于最小房间时店员站后墙、无柜台并发诊断；种子镜像（楼梯左右）与道具变体（用 `town-plan/rng.ts` 的 interior / props 子流）；家具轴对齐、四分之一转。输出写进方案的 `fixtures`（`[fixtureIdx, cx, cz, w, d, yaw, blocks]`，世界 mm）并更新 `floors`（剔除店员过道后可能拆成多个矩形，`floorY` 一一对应）。
2. **`hexes.ts`**：C6 规则在整数六角格上的判定与 BFS（格心在 floors 减阻挡家具内、离实体边 ≥ 250 mm；两格边中点在 floors 内才连通；≤ 250 mm 高的矮杂物不阻挡）；六角格心用 `frame.ts` 的 `hexCentreMm`。
3. **七类模板**（各一个文件，按 tech/16 §8.3 表的尺寸）：`general-store.ts`（杂货）、`pharmacy.ts`（药铺：百子柜满宽 × 450 × 2200、柜台带秤与药碾）、`inn.ts`（客栈：侧后柜台、对墙楼梯 900 宽水平 ≥ 3000、1–2 套桌椅）、`tavern.ts`（酒肆 / 茶馆：2.4 m 网格桌、900 过道、≤ 6 套）、`residence.ts`（住宅堂屋：供桌后墙正中、八仙桌 + 2 椅、宽 ≥ 5.5 m 加床）、`smithy.ts`（铁匠：炉 + 烟囱、风箱、砧距炉 1.1 m、淬火盆、兵器架；铁匠在砧前面朝门）、`stall.ts`（货摊 / 食摊：前柜台 850 高、摊主面朝街；摊位整体不可进入，摊主站位在柜台后、顾客站位在摊前街面上）。
4. **接入**：实现 `InteriorPlanner`，按设施类（内容文件优先，否则 tech/16 §8.1 的类型缺省表；未实现的设施类返回空家具并在诊断标 `INTERIOR_TEMPLATE_PENDING`，留给 i2）分派到模板；把 p2 在 `planBuilding` 里的缺省值换成本求解器（只改那一处缺省值）。

## 测试（`packages/data/src/build/town-plan/__tests__/interiors-i1.test.ts`，命名用例）
- 房间 {4.4×3.1, 5.3×3.3, 6.8×4.6, 8.8×6.4} × 4 偏航 × 3 种亚格偏移 × 七类模板（不适用的尺寸跳过并记录）：
  - 店员在柜台后、面朝门；店员过道不在 floors 内；
  - 门内通道净空（无阻挡家具相交）；
  - 顾客站位 BFS 可从入口格到达；顾客区 ≥ 2 个可走格；
  - 家具都在房内、两两不重叠（阻挡家具）；矮杂物规则成立（≤ 250 高的不阻挡、不剔除格）。
- 太小房间：3.0 × 2.4 的杂货铺按删减顺序降级并发诊断，柜台与店员仍在。
- 确定性：同输入两次方案 JSON 逐字节相同；种子不同楼梯可镜像。
- 6×5 店（p2 算例）药铺：百子柜贴后墙满宽、柜台线位置与 §8.2 公式一致（±1 mm）。
- 方案 `JSON.stringify` 加上家具后仍 ≤ 700 B（6×5 店）——若超出，在报告给出实测与建议，不得删字段凑数。
- 禁用运算 grep（沿用 p0 的源码守卫测试）。

## 协调者裁定（2026-10-12，第 1 次校验后补；审核以此为准）
缺省值换成求解器后，写集外的旧测试按「不放家具」写的会红（第 1 次校验 7 例），这是本任务的预期影响，按下面改，不算越界：
- `__tests__/stubs.test.ts`：从桩清单删去 `solveInterior`、`reachableInteriorHexes` 两项（本任务已替换），其余桩的断言一字不动。
- `__tests__/plan-hall.test.ts`、`__tests__/plan-building.test.ts`：凡测 p2 屋身的用例（tech/16 §3 金样里的 `floors` 净空如 6×5 店 4.4 × 3.1 m、≥ 4.2 × 2.9 m 下限、门、试点方案每栋 JSON ≤ 700 字符、确定性方案金样、`InteriorPlanner` 接缝用例的基线），给 `planBuilding` 显式传 `{ interior: emptyInteriorPlanner }`（已从 `plan-hall.ts` / `index.ts` 导出）；金样数值、阈值一律不改，不删用例。
- 带家具的方案另在 `interiors-i1.test.ts` 断言：6×5 店仍按上文 ≤ 700 B（超出照上文在报告给实测与建议，不删字段）；其余房型 ≤ 1,600 B（100 栋 ≤ 160 KB，给场景 300 KB 留出地形余量）。报告第 3 节写 6×5 店顾客区与店员过道的实际尺寸（柜台后 800 mm 过道按设计从 `floors` 剔除，所以可走区比 p2 屋身净空小）。

## 协调者裁定（2026-10-12，r3 审核后；协调者按 AR-110 接手实现；审核以此为准）
r3 指出 4.4 × 3.1 m 杂货铺里 §8.2 的「400 后架 + 800 店员过道 + 550 柜深 + 1400 门道 + 顾客区 ≥ 2 格」不能同时满足，裁定如下：
- **杂货铺**：店员过道 800、柜深 550 任何房型都不压缩。后架深 = clamp(D − 800 − 550 − 1450, 300, 400)，其中 1450 = 1400 门道 + 50 mm，保证四偏航 × 三种亚格偏移都有 ≥ 2 个顾客格。柜台线仍按 §8.2 第 3 条公式（后带取实际后架深）。
- 杂货铺门内通道深 = min(1400, 柜台前缘到前墙的距离)，但不小于 1100；进深 < 2.8 m（模板最小房间）时回退为店员站后墙、无柜台，并发 `INTERIOR_ROOM_BELOW_MINIMUM`（§8.2 第 6 条）。
  - 金样：4.4 × 3.1 后架 300、柜台中心 −175、通道 1400；5.3 × 3.3 后架 400；3.6 × 2.8 后架 300、通道 1150。
  - 其他设施的通道深仍为 1400。
- **酒肆**：
  - 桌中心在 2.4 m 网格上：列原点取房间中线；左 / 右墙内 300 + 半桌能多放桌时取墙侧（6.0 m 宽房中线网格放不下桌）。
  - 首排桌离柜台前缘 900。
  - 桌组 / 说书台之间净距 ≥ 900。
  - 主通路 = 门内通道向后延伸到柜台前缘，桌与说书台不得进入。
  - 说书台只在进深 ≥ 6 m、无降级、≥ 2 个格位时放在最靠前且放得下的格位。
  - ≤ 6 套；有降级时 ≤ 2 套。
- **顾客区**按 §8.2 第 5 条统计：从门口可达、且在柜台前缘之前（门一侧）的 C6 格 ≥ 2；无柜台的模板取全部可达格。
- **格式**：
  - 本任务新建的文件，以及整体替换的桩 `solver.ts`、`hexes.ts`，须过 `prettier --check`；
  - 基点未排版的 `plan-hall.ts`、`plan-hall.test.ts`、`plan-building.test.ts` 只要求改动行合格式，不整文件重排。

## 协调者裁定（2026-10-12，r4 审核后；审核以此为准）
r4 指出客栈桌椅组超 1600 × 1600、酒肆缺坐客位、测试里有 `/`，裁定如下：
- **坐客位**：
  - 新站位 `stn_guest`（idx 212，`w = d = 0`、`blocks = 0`、yaw 朝桌），在 `fixtures.ts` 站位表末尾追加 `station(212, 'stn_guest')` 一行，别的不动。
  - 它是 NPC 坐处，不是玩家的服务位，所以不复用 `stn_customer`（201 会被编译器转成 `serviceCells`）。
  - 酒肆每张桌给 2 个 `stn_guest`：按桌的左、右、前、后（门朝向的房间局部坐标）依次取桌边外 300 mm 的点（即离桌中心 800 mm）。
  - 合法点的条件：在 floors 内、离墙 ≥ 300 mm、不在主通路（门内通道延伸到柜台前缘）、离任何阻挡家具 ≥ 250 mm。取前两个合法点；合法点不足 2 个时取全部，并在报告列出是哪个房型。
  - 测试断言：
    - 每张桌对应的坐客位个数；
    - 坐客位不在桌体内、不在主通路；
    - 坐客位可接近：坐客位所在点 1,200 mm 内至少有一个从入口 BFS 可达的 C6 格（玩家能走到旁边交谈；r5 后改，见下条）。
    - 覆盖 6.0 × 4.6、6.8 × 4.6、8.8 × 6.4 × 4 偏航 × 3 亚格偏移。
- **客栈桌椅组**：
  - 家具一律用目录尺寸（方桌 1000 × 1000、凳 400 × 400），不缩放。
  - 两个凳放在桌的**相邻两边**（例如左与前，各离桌中心 700 mm），整套阻挡家具的包围盒 1400 × 1400，落在 1600 × 1600 内。
  - 阻挡家具两两不重叠。
  - 加命名测试直接算整套包围盒 ≤ 1600 × 1600。
  - 客栈不加坐客位（tech/16 §8.3 客栈站位只有掌柜、小二）。
- **测试里的除法**：
  - `interiors-i1.test.ts` 里的 `/` 一律改成 `floorDivInt`；
  - 纯整数源码守卫把 `__tests__/interiors-i1.test.ts` 也纳入扫描（只查算术 ` / `，正则字面量与注释照现有守卫规则处理）。
- **确定性**：加一条用例，默认带家具的 `planBuilding` 同输入调用两次，完整 `JSON.stringify(plan)` 逐字节相同。
- **报告**：第 3 节补坐客位个数与客栈桌椅组包围盒；第 7 节逐条如实写，没覆盖的不标 ✅。

## 协调者裁定（2026-10-12，r5 审核后；审核以此为准）
- r4 写的「坐客位**最近的**六角格可达」过严：六角格间距 1,155 mm，离座位最近的格常落在桌体里。现改为上一节的「1,200 mm 内至少有一个入口可达的 C6 格」。
- **不得**按可达性删掉几何合法的坐客位：每桌坐客位数 = min(2, 几何合法候选数)，几何合法只看 r4 的四条（floors 内、离墙 ≥ 300、不在主通路、离阻挡家具 ≥ 250），按左、右、前、后取前两个。
- 测试对 6.0 × 4.6、6.8 × 4.6、8.8 × 6.4 × 4 偏航 × 3 亚格偏移：
  - 逐桌算几何合法候选，断言站位数 = min(2, 候选数)；
  - 逐个断言朝向、不在主通路、1,200 mm 内有可达格；
  - 不许放宽成「1–2 个」，也不许锁定短缺相位。
- 体积：
  - 6 × 5 店的完整 `TownBuildingPlan` 仍 ≤ 700 B；
  - 其余带家具的房型也要用完整 `TownBuildingPlan`（`planBuilding` 产物，含 ID、屋身、屋顶、入口）断言 `JSON.stringify(plan).length ≤ 1,600`，不能只测 `solveInterior` 片段。
- 报告文件本身也要过 `prettier --check`。

## 约束
- 只写：`packages/data/src/build/town-plan/interiors/{solver,hexes,general-store,pharmacy,inn,tavern,residence,smithy,stall}.ts`、`packages/data/src/build/town-plan/__tests__/interiors-i1.test.ts`、`packages/data/src/build/town-plan/plan-hall.ts`（**只许**替换 `interior` 参数的缺省值那一处）`packages/data/src/build/town-plan/__tests__/{stubs,plan-hall,plan-building}.test.ts`（只按下面「协调者裁定」改）、`packages/data/src/build/town-plan/fixtures.ts`（**只许**在站位表末尾追加 `station(212, 'stn_guest')` 一行，见 r4 裁定）与本任务报告。
- 不改 p0 / p1 / p2 的其他文件（类型若必须扩充，只新增可选字段并在报告说明）；不改 `content/**`；不新增依赖。
- 纯整数：不得用浮点参与尺寸、不得用 `/`（用 `floorDivInt` / `ceilDivInt`）、不得用三角函数 / `sqrt` / `pow` / `random` / `Date`；工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run packages/data/src/build/town-plan --config vitest.config.ts --project node`
- `pnpm --filter @tianshu/data typecheck`
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`

## 报告
`tools/agents/reports/ENG-interior-i1-core.md`（≤ 70 行）：第 3 节列七类模板在四种房间里的家具数、可走格数、顾客格数与降级情况；第 7 节写给 i2（模板文件写法、求解器扩展点）、p3（院落各房如何调用 `InteriorPlanner`）、r8（家具下标与尺寸、`blocks` 语义）与编译器（站位如何转成 `FacilityNpc` / `serviceCells`）的交接。
