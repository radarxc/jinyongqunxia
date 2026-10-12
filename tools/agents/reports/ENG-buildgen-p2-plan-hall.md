# ENG-buildgen-p2-plan-hall 报告 · 城镇 3D 古建 · 单体规划 planBuilding（尺寸档、开间、门、屋顶标高、可走面；hall / storeyed / stall / adobe）
## 1. 摘要（3–6 行）
- 已用纯整数实现四档尺寸、奇数开间、门洞、屋顶标高、墙内可走面及 hall/storeyed/stall/adobe 分派。
- 三份布局提取 104 栋试点建筑；测试覆盖全部试点、13 个合成尺寸 × 4 个入口边与四个金样。
- 返修补齐雕花店面、四金样门、22 类方案 facility、公共 API、schema→planner→render 跨包契约。
- stall 强制不可进且无 floors；compound 保留 p0 盒子并公开 `PLAN_COMPOUND_PENDING`；全部验收命令通过。

## 2. 产出（文件、行数、主要章节）
- 14 个文件：`dims.ts` 157 行；`doors.ts` 88 行；`plan-hall.ts` 229 行；`index.ts` 14 行；`types.ts` 175 行（仅增可选 `finial`）。
- `testing/`：提取脚本 78 行、104 栋 JSON 112 行；`plan-hall.test.ts` 331 行；`plan-building.test.ts` 只改旧盒子组。
- 契约：`town-scene.ts` 171 行、`region-map-town.test.ts` 178 行、render types 333 行、跨包测试 60 行。
- `pnpm install --frozen-lockfile` ✅（lockfile 已是最新、无需变更）；town-plan Vitest ✅ 9 文件/171 用例；data typecheck ✅。
- 跨包+render Vitest ✅ 9 文件/75 用例；render typecheck ✅；另跑 game typecheck ✅，验证 schema 静态赋值。
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check` ✅：235 文件/1893 用例；内容 1777 文件/1708 对象/2 Ink/65 地图；故事、构建、size 门通过。

## 3. 关键结论与数值
- 金样实测滴水/脊（mm）：店 `3070/4566`、宅 `2910/4419`、客栈 `6130/8547`、寺殿 `4575/8483`，均逐毫米命中。
- 核算：店 `3350-800×4000bp+40=3070`、脊 `3350+3300×2625bp+350=4566`；客栈 `6450-900×4000bp+40=6130`、脊 `6450+6100×2700bp+450=8547`。
- 寺殿：橑檐距 `10000-2×1300-100+2×450=8200`；滴水 `5100-1300×4000bp+40-45=4575`；脊 `5100+8200×3333bp+650=8483`。

| 尺寸档/算例 | 柱高/径/梁 mm | 开间宽 mm | 门净宽×高/门槛 mm | 室内净空 |
|---|---:|---:|---:|---:|
| vernacular / 6×5 宅 | `2800/255/350` | `1724/2102/1724` | `1400×2150/120` | `5.2×3.2m` |
| shop / 6×5 店 | `3000/273/350` | `4750` | `3200×2700/120` | `4.4×3.1m` |
| middle / 10×8 客栈 | `3200/291/350` | `2795/3410/2795` | `1500×2350/150` | `8.65×5.8m` |
| hall / 12×10 殿 | `4200/420/900` | `3355/4090/3355` | `2000×3000/200` | `10.45×7.9m` |

- 西域 6×5 `carved_shopfront` 实测 `3200×2700/100`、净空 `4.15×3.8m`；与 `shopfront` 同属店面敞口。
- stall：台基 0、柱 2300、Canopy、不可进入且无 floors；compound：10×8 固定内缩 300 得 `9.4×7.4m` 并报 pending。
- 一致处：storeyed 只给首层可走面；adobe 为 Flat 顶面+女儿墙；唐式塔刹仅寺院；22 类 facility 在 schema/planner/render 严格相同；最大试点 JSON 332 B。
- 偏离/延期：compound 真院落归 p3；门净高/门槛未序列化，按公开纯函数 `doorClearanceFor()` 推出；家具缺省为空并留 `InteriorPlanner` 注入缝。

## 4. 开放问题（附默认值）
- 招牌样式尚无独立注册表；默认 `plaque=0, flag=1`，编译器/网格器接图集时锁定稳定索引。
- 门净高/门槛暂不扩 `EntranceTuple`；默认消费方调用 `doorClearanceFor(kit,size,shopfront)`，门槛只画、不阻挡。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；实现遵循 AR-114 与 tech/16 §3–§4。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `plan-building.test.ts` 已改旧盒子组：店铺快照改门 3200、floor 4.4×3.1m、roof 3070/4566；不可进入店铺改断言 archetype facility=`general_store`；compound 盒子断言保留，其他用例未动。
- tech/16 §4.2 后续可补公共 `options.variant/interior`、`doorClearanceFor()`、`planBuildingDiagnostics()`；不阻塞当前严格场景契约。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 只改允许路径；未改依赖/素材/node_modules；`git diff --check` 通过；三规划源码无算术 `/`、随机、墙钟、三角函数。
- ✅ 四金样屋顶与门精确断言；可进门 ≥1200×2100；floor 半开、墙厚内、数组等长；6×5 店 ≥4.2×2.9m；104 试点 + 52 朝向。
- ✅ r1/r4/r5：按方案出几何；公开 `doorClearanceFor()`；`BuildingPlanView.finial` 严格为 `tang_stupa`，r5 据此出塔刹。
- ✅ i1：公开 `InteriorPlanner`、`PlanBuildingOptions`、`emptyInteriorPlanner`；在 `options.interior` 替换缺省值，须一起返回 fixtures/floors/floorY。
- ✅ 编译器：`planBuilding` 输出通过严格 `town-scene.v1`，schema 与规划器都可直接赋给 render；须传 `city-kits.yaml` variant；玩法 facility→22 类方案 facility 映射归编译器。
- ✅ p3：公共 `planBuildingDiagnostics()` 可读 `PLAN_COMPOUND_PENDING`；全部指定命令及额外 game typecheck 已亲跑通过。
