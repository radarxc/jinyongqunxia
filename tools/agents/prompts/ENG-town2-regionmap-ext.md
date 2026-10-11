# 本任务：城镇探索 v2 · 区域地图增量 schema（城镇场景）——chunk 三层、`town-scene.v1` 扩展、新对象类、`MapEntry.scene`，core 解码认新层

**第一个动作**：打开 `packages/data/src/schemas/region-map.ts`（`BuildingObjectSchema` 约 L378、`RegionMapChunkSchema` 约 L429、`RegionMapSchema` 约 L486、`RegionObjectSchema` 约 L397）与 `packages/core/src/world/region-codec.ts` 的 `decodeRegionMap`（约 L75），再读 `docs/tech/15-town-explore-v2-spec.md` §2.1–2.4；读完直接动手，不要先写计划。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md` 与 `packages/core/CLAUDE.md`（core 只用整数；区域运行时 ENG-20a 的约定）。

## 背景
作者 AR-114（2026-10-10）：城镇探索全面升级——城镇并入区域引擎，每城编译成一个区域场景 `sc_<NN>_town_<city>`；建筑由代码生成 3D 古建，人原地走进屋里；采买在屋里找店主。区域地图格式 `region-map.v1` 已有 Door / Building / NpcSpawn / CameraHint 等对象，但缺：室内归属层、可通视不可站的柜台层、视觉地面层、建筑方案载荷、店员 / 出口 / 打坐点对象，以及大地图入口指向场景的字段。本任务只做**数据契约与解码**，全部是**增量、可选**字段——现有 65 张 Tiled 区域地图一张都不改也必须继续通过。

## 要做的事
1. **chunk 三层**（`RegionMapChunkSchema` 增可选字段，`superRefine` 校验长度）：`surface?: string`（base64，1024 字节 u8，下标进 `map.surfaceTable`）、`blocked?: string`（base64，128 字节位图；只能在 `valid` 位为 1 的槽上置位）、`building?: string`（base64，1024 字节 u8，1 起的建筑序号，按该场景 `Building` 对象 id 排序；0 = 不在建筑内；序号不得超过建筑数）。
2. **`RegionMapSchema`** 增可选 `surfaceTable?: SurfaceId[]`（有序去重；`SURFACE_IDS` 按 tech/15 §2.2 导出常量）与 `town?: TownScene`。
3. **`town-scene.v1`** 新文件 `packages/data/src/schemas/town-scene.ts`（由 `region-map.ts` 再导出，不改 `schemas/index.ts` 的导出布局以外的东西——若 index 需要一行再导出就加一行）：`TownSceneSchema`、`TownFacilitySchema`、`TownWallSchema`、`TownBuildingPlanSchema` 严格按 tech/15 §2.3（含 `elev`、`floorY`、`RectMm = [x0, z0, x1, z1]` 半开、`fixtureIdx ≥ 200` 为站位、`facility`、`kitRef`、`signAtlasRef`）。`FacilityKind` 复用 `packages/data/src/schemas/facility.ts`（ENG-town2-shop-schema 已建）里的定义，不要重复定义。校验：`buildings` 的 id 与顺序和场景里 `Building` 对象一致；`floors.length === floorY.length`；`floors` 每个矩形都在占地内；mm 均为安全整数。
4. **`BuildingObjectSchema`** 增可选 `enterable?: boolean`、`facilityKey?: LocalId`、`nameKey?: TextKey`；`enterable: true` 时 `cells`（门格）非空、外侧街面格在前。
5. **新对象类**（加进 `RegionObjectSchema` 判别联合）：`FacilityNpc`（`facilityKey, roleKey, facing: HexDirection, interactRange: 1..3, appearance: { template, outfit, seed: u32 }`；`template` 用字符串枚举 `tpl_f_small | tpl_f_medium | tpl_f_tall | tpl_m_lean | tpl_m_medium | tpl_m_bulk`）、`Exit`（`gateId, spawnId, side: north|east|south|west, nameKey`）、`MeditationSpot`（`buildingId: LocalId | null, riskBaseBp: 0..10000, quality: 0..2`）。
6. **场景级交叉校验**（`RegionMapSchema.superRefine`）：门格（所有 `enterable` 建筑的门格）全场景唯一；每个 `Exit.spawnId` 指向存在的 `PlayerSpawn`；`FacilityNpc.facilityKey` 在 `town.facilities` 里存在；`town.facilities[].buildingId` 指向存在的 Building。
7. **大地图入口**（`packages/data/src/schemas/world-map.ts`）：`MapEntrySchema` 增可选 `scene: { regionId, sceneId } | null`；`spawn` 保留只读不删。
8. **core 解码**（`packages/core/src/world/region-codec.ts`）：`decodeRegionMap` 读取 `blocked`（该格可站 = false，但不挡视线）、`building`（每格建筑序号，供后续"在屋内"判定）与 `surface`（只透传）；缺这三层时行为与现在逐字节一致（现有区域测试全过）。只做解码与类型，不改寻路与交互规则（后续任务做）。
9. **测试**：`packages/data/src/region-map-town.test.ts`——全部现有 Tiled 区域地图仍通过（用现有 fixture / 加载器）；一个最小城镇场景夹具（2 栋建筑、1 个设施、1 个出口、1 个打坐点）正例通过；反例：门格重复、`spawnId` 不存在、层长度错误、建筑序号越界、`blocked` 置在无效槽、`floors` 出占地、`facilityKey` 不存在。`packages/core/src/world/region-codec.test.ts`——新三层解码正确；无新层时解码结果与改前快照一致。

## 约束
- 只写：`packages/data/src/schemas/{region-map,town-scene,world-map}.ts`、`packages/data/src/schemas/index.ts`（至多加一行再导出）、`packages/data/src/region-map-town.test.ts`、`packages/core/src/world/region-codec.ts`、`packages/core/src/world/region-codec.test.ts` 与本任务报告。
- 全部字段可选、向后兼容；core 只用整数（无 `/`）；不新增依赖；工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run packages/data/src/region-map-town.test.ts packages/data/src/schemas packages/core/src/world --config vitest.config.ts --project node`
- `pnpm content:build`
- `pnpm content:validate`
- `pnpm check`

## 报告
`tools/agents/reports/ENG-town2-regionmap-ext.md`（≤ 60 行）：第 3 节列新增字段与校验规则；第 7 节写给编译器任务（TOOL-town2-compiler-core）与探索运行时任务（ENG-town2-explore-graph / walk）的交接：解码结果里新字段的名字与含义。
