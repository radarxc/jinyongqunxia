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

## 约束
- 只写：`packages/data/src/build/town-plan/interiors/{solver,hexes,general-store,pharmacy,inn,tavern,residence,smithy,stall}.ts`、`packages/data/src/build/town-plan/__tests__/interiors-i1.test.ts`、`packages/data/src/build/town-plan/plan-hall.ts`（**只许**替换 `interior` 参数的缺省值那一处）与本任务报告。
- 不改 p0 / p1 / p2 的其他文件（类型若必须扩充，只新增可选字段并在报告说明）；不改 `content/**`；不新增依赖。
- 纯整数：不得用浮点参与尺寸、不得用 `/`（用 `floorDivInt` / `ceilDivInt`）、不得用三角函数 / `sqrt` / `pow` / `random` / `Date`；工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run packages/data/src/build/town-plan --config vitest.config.ts --project node`
- `pnpm --filter @tianshu/data typecheck`
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`

## 报告
`tools/agents/reports/ENG-interior-i1-core.md`（≤ 70 行）：第 3 节列七类模板在四种房间里的家具数、可走格数、顾客格数与降级情况；第 7 节写给 i2（模板文件写法、求解器扩展点）、p3（院落各房如何调用 `InteriorPlanner`）、r8（家具下标与尺寸、`blocks` 语义）与编译器（站位如何转成 `FacilityNpc` / `serviceCells`）的交接。
