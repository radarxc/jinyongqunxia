# tech/16 · 城镇 3D 古建 / 室内 / 3D 人物 · 实现 Spec（交 traex 执行）

> 依据：作者 AR-114（代码生成 3D 古建、原地进屋、3D 人物按身高）；方案 `docs/tech/14-town-explore-v2.md`（§3 决定表优先）；引擎侧契约 `docs/tech/15-town-explore-v2-spec.md`（数据契约 §2、端口 §5）。
> 本文是**实现契约**：规划器、网格器、建筑层、室内、人物、预算、实验页与闸门、美术、任务登记。执行器只改任务声明的文件；本文没写的取舍按 tech/14 的意图定并在报告里写明。
> 分工：traex（GPT-5.6-Sol，xhigh）写代码与离线工具、跑门禁；Claude 每个阶段做验证；作者看闸门 A / B / C；贴图由出图线 Opus 子代理驱动作者 Chrome 里的 Gemini。

## 目录

0. 术语
1. 目录与文件归属
2. 与 tech/15 的契约补充（C1–C10）
3. 尺寸标准与算例（测试金样）
4. 规划器 `planBuilding`
5. 网格器：配方、屋顶、墙与开洞、不变式
6. 建筑层：合批、顶点格式、状态纹理、剖切、LOD、三角预算
7. 材质、光照与"写实古风"
8. 室内
9. 3D 人物
10. 性能预算与测量
11. 实验页 `/town-lab` 与闸门 A / B
12. 美术与招牌
13. 任务登记（B 建筑线 / I 室内线 / C 人物线 / 美术线）
14. 禁区

---

## 0. 术语

- **规划器**：`packages/data/src/build/town-plan/**`，纯整数、确定，产出 `TownBuildingPlan`（tech/15 §2.3），可走性依赖的一切都在这里定。
- **网格器**：`packages/render/src/buildgen/mesher/**`，纯 TS、**不 import three**，把方案变成类型化数组（在 Worker 里跑）。
- **建筑层**：`packages/render/src/buildgen/three/**`，three.js 适配：分格合批、材质、状态纹理、剖切、门扇、招牌、室内、拾取。
- **套件（kit）**：`content/town/buildkits/<kit>.yaml`，一个年代 / 地域的尺寸档、材质、类型映射；编译为 `buildkit-runtime.v1`。
- **单元（unit）**：一栋建筑或院落的一个部件，状态纹理按单元寻址。
- **局部坐标**：原点在占地中心、基底高度；`+z_l` 指向前脸（有入口的一面）；`+x_l` 为站在门外面朝前脸时的右手。

## 1. 目录与文件归属

```text
packages/data/src/build/town-plan/            纯整数；禁止 Math.sin/cos/tan/sqrt/pow/random/atan 与 Date（测试 grep）
  index.ts types.ts frame.ts archetype.ts rng.ts fixtures.ts
  kit/{schema.ts,compile.ts}                  套件 YAML（构建期 zod）→ CompiledBuildKit JSON
  dims.ts doors.ts plan-hall.ts plan-compound.ts compound/**
  interiors/{solver.ts,hexes.ts,<kind>.ts}
  invariants.ts export-fixtures.ts testing/** __tests__/**
content/town/buildkits/{song_dali,xiyu,...}.yaml   content/town/buildkits/city-kits.yaml
content/town/facilities/<layoutKey>.yaml            （与 tech/15 §2.5 共用）
packages/render/src/buildgen/                 懒加载块 render-buildgen（+ render-buildgen-worker）
  index.ts types.ts
  mesher/core/{buffer,prims,openings,inspect,hash,rng}.ts      （不 import three，测试强制）
  mesher/parts/** mesher/roof/** mesher/recipes/** mesher/fixtures/** mesher/generate.ts mesher/shape-cache.ts
  worker/{buildgen.worker.ts,client.ts}
  three/{layer,materials,glsl,textures,doors,signs,interiors,vignette,pick,stats}.ts
  testing/{mini-plans.ts,pilot-plans.json,pilot-kits.json}
packages/render/src/materials/static-lit/**   tech/02 §8.5 模块 #2（建筑 / 屋顶 / 3D 物件），本线首次落地
packages/render/src/actor3d/                  懒加载块 render-actor3d
tools/buildgen/**                             占位贴图、去缝、条带、招牌图集、实验页截图与联系表
tools/model3d/{town_lod.py,dressup_town_lod.py,measure_gait.mjs}
assets/default/buildkit/{<kit>,props,signs,review/rNN}/**   assets/default/model3d/<id>/town/**
apps/game/src/dev/town-lab/**   apps/game/build/town-lab-plugin.ts
```

数据流：内容构建时，布局 + 设施 YAML + 套件 YAML 进入 tech/15 编译器 → 每套件调一次 `compileKit`、每栋调一次 `planBuilding` → 方案写进 `town-scene.v1`。运行时应用调 `BuildingLayerPort.create({ plans, walls, kit, quality, renderer })` → Worker 由近到远生成各格 → 建筑层先上传玩家周围 3×3 格，此后每帧最多上传 1 格。

## 2. 与 tech/15 的契约补充（C1–C10，已并入 tech/15 §2.3–2.4）

| # | 内容 | 原因 |
|---|---|---|
| C1 | 方案加 `elev: [baseYMm, platformMm]` | 台基高 150–1200 mm；屋内格高度 = 基底 + 对应 `floorY` |
| C2 | 方案加 `floorY: Mm[]`，与 `floors` 一一对应 | 院落里院子、堂屋、檐廊高度不同 |
| C3 | `RectMm = [x0, z0, x1, z1]`，世界 mm、半开区间 | 统一约定 |
| C4 | 站位编码为 `fixtureIdx ≥ 200` 的家具，`w = d = 0`、`blocks = 0`、yaw = 朝向；含 `stn_customer`（玩家站着说话的位置） | 不改 schema；core 按种类把角色槽对到站位 |
| C5 | yaw 由入口边决定；门居中间（中间那一间）；编译器把入口格重算为"门中心向外 600 mm"最近格并查接街，失败回退布局入口偏移 | 56.5% 的入口不朝南；真实建筑门在明间 |
| C6 | 室内 / 门格可走：格心在 floors 减阻挡家具内且离实体边 ≥ 250 mm；两格之间边中点须在 floors 内或在占地外；≤ 250 mm 的矮杂物可不阻挡 | 六顶点法会吃掉 1.2–1.6 m 的门洞 |
| C7 | 城墙输入：`{ id, points: [xMm, zMm][], closed, heightMm, thicknessMm, gates: { seg, offsetMm, widthMm, kind: 'gate' \| 'water' }[] }[]` | 生成城墙与门楼 |
| C8 | 套件编译为 `buildkit-runtime.v1` JSON，每套件一份，场景引用；每个场景另引用自己的招牌图集 | 不在 200 个场景里重复套件 |
| C9 | 檐高约 3.0–3.3 m 与 tech/07 §5.5.2 / tech/02 L182「屋檐 = 2 级」不再对应；城镇屋顶暂不可站 | 轻功上房另立题 |
| C10 | `planBuilding` 的 `facility` 先取 `content/town/facilities/<layoutKey>.yaml`，没有就按类型缺省 | `ShopDef` 没有设施类字段 |

## 3. 尺寸标准与算例（mm，除注明外；作为测试金样写进 `planBuilding` 与 `roof/profile` 的测试）

| 项 | 民居 / 店铺 / 摊位 | 客栈 / 酒楼 / 仓 / 厩 / 哨所 | 殿堂（寺 / 衙 / 王府正殿） | 西域土坯 | 依据 |
|---|---|---|---|---|---|
| 台基顶离地 | 摊 0、店 150、宅 300 | 300–450 | 衙 600、寺 900、王府 1200（须弥座） | 150 | — |
| 台阶 | 踏高 150、踏宽 300；梯段宽 = 门宽 + 600；放在占地内的台明上 | 同 | 同 | 同 | — |
| 檐柱高（台基顶以上） | 宅 2800、店 3000；摊柱 2300 | 首层 3200、二层 2700 | 衙 3800、寺 4200 | 雕柱 3000–3400 | 《营造法式》：檐柱不高于开间 |
| 柱径 | H/11，限 180–300 | 260–300 | H/10，限 350–500 | 200–260 | 清小式：径 = H/11 |
| 开间 | 奇数间：进深方向跨 < 5.0 m 为 1 间（店面敞开），< 11 m 3 间，< 18 m 5 间，其余 7 间 | 目标 3000–3600 | 目标 3600–4500 | — | 明间 = 跨 ÷（1 + 2×0.82 [+ 2×0.68 五间]） |
| 椽架水平长 | 1200–1600 | 同 | 同 | — | 《营造法式》每架不过 6 尺 |
| 门净高 | 2100–2200；店面敞口至额枋 2600–2800 | 2300–2400 | 2800–3200 | 2100–2200 | 硬下限 2100（最高身高 1.86 m + 冠帽 0.15 + 余量） |
| 门净宽 | 单扇 900、双扇 1300–1500、店面 1500–3200 | 1500–1800 | 2000–2600 | 1000–1200 | 可走下限 1200；院门 1600–2000 |
| 门槛 | 100–150 | 150 | 200–300 | 100 | 只画，可走性忽略 |
| 窗台 / 窗头 | 900 / 2000–2100 | 900 / 2100 | 1000 / 2600 | 1400 / 2000，宽 500–600 | — |
| 柱头以上梁架 | 350 | 350 | 900（含斗拱带 550） | 椽 300 | — |
| 出檐（自柱中线） | 宅 700、店 800 | 900–1000 | 1200–1400 | 0（椽头外挑 300） | 滴水外缘离占地边 ≥ 50 |
| 滴水高（推算，台基顶以上） | 约 2900–3200 | 腰檐 3000–3200；上檐 6000–6300 | 4600–5000 | 平顶顶面 3200–3500 + 女儿墙 450 | — |
| 举高 ÷ 前后橑檐方距 | 0.2625（板瓦民居） | 0.27（筒瓦厅堂） | 0.333（殿阁） | 0.02（排水坡） | 宋举折；明清套件用举架 0.5 / 0.65 / 0.75 / 0.9 步，总约 0.36–0.40 |
| 正脊高 | 300–400（大理方翘头 550） | 400–500 | 600–800；鸱尾另 900–1300 | — | 垂脊 / 戗脊 250–350 |
| 翼角起翘 / 冲出 | 大理 180 / 120 | 300 / 220 | 480 / 360（清「冲三翘四」，椽径 120） | 0 / 0 | — |
| 悬山出际 | 400–600 | 600–800 | — | — | — |
| 墙厚 | 木板 100–150；大理土坯山墙 / 后墙 300–400、毛石裙肩 600–900 | 150–300 | 300–600 | 土坯 450–600，烧砖基 400–900 | 院墙 300 厚 × 2400 高 + 压顶 |
| 楼层 | — | 楼板 200；层高 2700；平座栏杆 1000，出挑 600–900 | — | 廊 2600 | — |
| 城墙 / 城门 | 墙高 6000（史载 8–12 m，压缩，闸门 A 定）；顶宽 4000；收分 1:6；垛口高 1800 × 宽 1200、空 500；门洞：宋梯形 4500 × 5200，明以后拱券 | | | | |
| 塔 | 崇圣寺千寻塔 28–32 m（实高 69 m，与 96 m 城压缩；7×7 占地；手绘代理 31.9）：16 重密檐、首层 6.5 m、刹 3 m；八角小塔 15–16 m、10 层（手绘代理 15.0） | | | | |
| 招牌 | 匾高 500–650，每字 420，下沿 ≥ 门头 + 150；吊幌下沿 ≥ 2250 | | | | |

**算例（测试金样，±1 mm）**
- **大理店铺 6×5，悬山**：柱中线 ±1650；山墙内皮 ±2200，室内 4.4 × 3.1 m；角柱间跨 4750 → 1 间，店面敞口约 4.47 m；柱 3000、径 280、梁架 350 → 橑檐方 3350；滴水 = 3350 − 800 × 0.40 + 40 = **3070**；举高 = 3300 × 0.2625 = 866 → 正脊 **4566**（台基顶以上；离地 4.72 m，手绘 4.57）；举折檩 433 − 87 = 346。
- **民居 6×5，硬山，三间**：间广 1724 / 2102 / 1724；室内 5.2 × 3.2 m；门 1400 × 2150；滴水 2910；脊 4419（离地 4.72 m，手绘 4.91）。
- **客栈 10×8，两层歇山**：上檐橑檐方 6450；滴水 6130；脊 8547（离地 8.85 m，比手绘 6.89 高 28%，真实高度，闸门 A 由作者定，套件 `dims` 可压层高不改代码）。
- **寺殿 12×10，歇山带斗拱**：橑檐方 5100 + 斗拱出跳每侧 450；滴水 4575；脊 8483（离地 9.38 m，手绘 7.88，+19%）；举折檩 2733 / 1549 / 638 / 0，坡度 0.866 / 0.667 / 0.467（内凹，正确）。

## 4. 规划器 `planBuilding`

### 4.1 坐标、yaw、种子
- 局部 → 世界的四分之一转：

  | yaw k | 世界 (x, z) | 前脸朝 |
  |---|---|---|
  | 0 | (x, z) | S |
  | 1 | (−z, x) | W |
  | 2 | (−x, −z) | N |
  | 3 | (z, −x) | E |

  `worldSide = (localSide + k) % 4`，侧序 [S, W, N, E]；three 中等价 `rotation.y = −k·π/2`（网格器直接烘矩阵，四种情况都要单测）。
- `footprint [cx, cz, w, d]`：`w` 沿前脸；k 为奇数时世界范围互换。`roof [style, eaveMm, ridgeMm]`：台基顶以上；`eaveMm` = 跨中滴水（不含翼角起翘），`ridgeMm` = 正脊顶（不含脊饰）。`entrances [side, offsetMm, widthMm]`：`side` 为局部边（现有布局全部是 0），`widthMm` 为可走净宽。
- 种子：编译器给 `seed = fnv1a32(sceneId + '/' + buildingId)`；各用途子流 `splitmix32(seed ^ SALT.variant | .interior | .props | .visual)`，新增某用途的随机选择不会挪动其他用途。
- 整数六角格心：`x = round(57735·(2q + r)/100)` mm、`z = 1000·r` mm（与室内可达性测试共用）。

### 4.2 API

```ts
// packages/data/src/build/town-plan/types.ts（整数 mm）
export type Yaw4 = 0 | 1 | 2 | 3;
export type LocalSide = 0 | 1 | 2 | 3;            // 0 前 1 左（−x_l） 2 后 3 右（+x_l）
export type RectMm = readonly [x0: number, z0: number, x1: number, z1: number];
export type EntranceTuple = readonly [side: LocalSide, offsetMm: number, widthMm: number];
export type FixtureTuple = readonly [fixtureIdx: number, cxMm: number, czMm: number, wMm: number, dMm: number, yaw: Yaw4, blocks: 0 | 1];
export type PartTuple = readonly [kind: PartKind, cxMm: number, czMm: number, wMm: number, dMm: number, yaw: Yaw4,
  storeys: 1 | 2 | 3, roofStyle: RoofStyle, eaveMm: number, ridgeMm: number, platformMm: number, flags: number];
export const enum RoofStyle { None, Yingshan, Xuanshan, Xieshan, Wudian, Cuanjian, Juanpeng, Flat, Dome, Canopy }
export const enum PartKind { Hall, Wing, Gatehouse, Enclosure, Yard, Gallery, ScreenWall, Trellis }
export type FacilityKind = 'none' | 'residence' | 'general_store' | 'cloth' | 'books' | 'pharmacy' | 'inn' | 'tavern'
  | 'teahouse' | 'smithy' | 'pawnshop' | 'bank' | 'escort' | 'school' | 'temple' | 'office' | 'casino' | 'stable'
  | 'storehouse' | 'guardhouse' | 'stall_goods' | 'stall_food';
export interface TownBuildingPlan { /* = tech/15 §2.3；字段：id archetype kit seed footprint yaw storeys roof entrances
  enterable elev floors floorY fixtures parts? signage facility */ }
export interface LayoutBuildingInput {
  readonly id: string; readonly type: string; readonly originCell: readonly [number, number];
  readonly sizeCells: readonly [number, number]; readonly entranceCell: readonly [number, number];
  readonly enterable: boolean; readonly baseYMm: number; readonly facility?: FacilityKind; readonly signTextKey?: string;
}
export interface PlanningFrame { readonly heightCells: number; readonly originXMm: number; readonly originZMm: number }
export function planBuilding(input: LayoutBuildingInput, kit: CompiledBuildKit, seed: number, frame: PlanningFrame): TownBuildingPlan;
export function checkPlan(plan: TownBuildingPlan, kit: CompiledBuildKit): readonly PlanDiagnostic[];
export function compileKit(source: unknown /* 已校验的套件 YAML */): CompiledBuildKit;
export interface FixtureKindDef { readonly idx: number; readonly name: string; readonly wMm: number; readonly dMm: number;
  readonly hMm: number; readonly blocks: 0 | 1; readonly lowClutter?: true; readonly station?: string /* stn_*，idx ≥ 200 */ }
```

### 4.3 套件 YAML（`buildkit.v1`）

```yaml
# content/town/buildkits/song_dali.yaml
schemaVersion: buildkit.v1
id: song_dali
style: timber                     # timber | adobe
profile: song_zhe                 # song_zhe | qing_jujia
dims:                             # mm；按尺寸档覆盖 §3 标准
  vernacular: { platform: 300, column: 2800, diaRatio: 11, beam: 350, eave: 700, rise: 0.2625, lift: [180, 120] }
  shop:       { platform: 150, column: 3000, eave: 800, rise: 0.2625, verge: 400 }
  middle:     { platform: 300, column: 3200, upperStorey: 2700, eave: 900, rise: 0.27, lift: [300, 220] }
  hall:       { platform: 900, column: 4200, diaRatio: 10, beam: 900, eave: 1300, rise: 0.333, lift: [480, 360] }
door: { clearH: 2150, single: 900, double: 1400, threshold: 120, frame: 100 }
window: { sill: 900, head: 2050, width: 1000, pattern: [zhileng, fangge] }
walls:
  gable: { layer: earth_plaster, t: 350, dado: { layer: stone_rubble, h: 800 } }
  back:  { layer: earth_plaster, t: 300, dado: { layer: stone_rubble, h: 800 } }
  front: { layer: timber_raw, t: 120 }
  enclosure: { layer: plaster_lime, t: 300, h: 2400, coping: tile }
ridge: { h: 320, ends: dali_square, hallEnds: chiwei }
palette: { timber: ['#6e4b39', [0.03, 0.06, 0.08]], plaster: ['#e3dccb', 0.35], tile: ['#55585b', [0, 0.03, 0.06]], stone: ['#8d877c'] }
layers:                            # 贴图数组层（顺序即下标）；repeatM = 一次重复覆盖的真实尺寸
  - { id: tile_roof, repeatM: [2.0, 2.0] }      # 瓦距 230 → 每次重复 8.7 列
  - { id: ridge_tiles, repeatM: [1.0, 0.4] }
  # … 共 16 层（§12）
archetypes:                        # 布局类型 'bld_kit_<任意套件>_<name>' → <name>
  house:        { recipe: hall, size: vernacular, roof: yingshan, bays: odd, facility: residence }
  house_small:  { alias: house }
  house_large:  { recipe: hall, size: vernacular, roof: xuanshan }
  shop:         { recipe: hall, size: shop, roof: xuanshan, front: shopfront, facility: general_store, signage: plaque }
  shop_1f:      { alias: shop }
  shop_2f:      { recipe: storeyed, size: middle, storeys: 2, roof: xieshan, balcony: true }
  inn:          { recipe: storeyed, size: middle, storeys: 2, roof: xieshan, facility: inn, signage: plaque }
  restaurant:   { recipe: storeyed, size: middle, storeys: 2, roof: xieshan, facility: tavern, signage: flag }
  market_stall: { recipe: stall, roof: canopy, facility: stall_goods }
  market:       { alias: market_stall }
  courtyard:    { recipe: compound, layout: hall_wing_gate, facility: residence, screenWall: true }
  temple_hall:  { recipe: hall, size: hall, roof: xieshan, brackets: true, facility: temple }
  yamen:        { recipe: compound, layout: yamen, facility: office }
  variants: { doorColour: [natural, natural, vermilion_if_official], awning: 0.4, lanterns: 0.6 }
landmarks:
  bld_lm_ch01_chongshengsi_pagoda:       { recipe: pagoda_dense, eaves: 16, heightM: 30, material: plaster_white }
  bld_lm_ch01_chongshengsi_pagoda_small: { recipe: pagoda_oct, storeys: 10, heightM: 15.5 }
cityWall: { h: 6000, top: 4000, batter: 0.16, merlon: [1800, 1200, 500], gate: { opening: trapezoid, w: 4500, h: 5200 } }
```

- `content/town/buildkits/city-kits.yaml`：按城覆盖视觉套件，如 `city_turpan__ch10: xiyu:tang_buddhist`（吐鲁番布局里的类型名是 `bld_kit_song_dali_*`，视觉套件与类型名无关）。
- **xiyu `tang_buddhist` 变体**（702 年唐西州，tech/14 D13）：土坯厚墙、平顶女儿墙、木椽头、高窗、雕门、葡萄架、晾房花砖墙照常；**禁用**穹顶与尖拱；寺院与官署用唐式佛塔刹顶与唐式木构檐口。
- 布局字段 → 方案：`type` → 套件类型 → 配方 / 尺寸档 / 屋顶（别名覆盖 xiyu 名）；`size` + 入口边 → yaw 与局部 w × d；`origin` + 坐标框 → 占地中心；`entrance_cells` → 门偏移（默认吸到明间，除非布局偏移离明间 > 1 m）；`enterable` / `business_ref` / 设施 YAML → 设施类；种子 → 变体。

## 5. 网格器：配方、屋顶、墙与开洞、不变式

### 5.1 配方（`mesher/recipes`，各一个文件）
1. **`hall`**：台基与台阶 → 柱网（LOD0 八角柱、LOD1 六角柱，带柱础）→ 梁 → 按角色出墙：前墙（门 + 窗，或店面敞口 + 板壁）、山墙（硬山）或木板壁带窗、后墙（宽 ≥ 2 m 的每间一扇小窗）、室内隔断（按室内模板）→ 斗拱带（殿堂，仅 LOD0）→ 屋顶、屋脊、脊饰 → 招牌挂点 → 门扇 → 檐下陈设（只在占地内的台明上；灯笼底 ≥ 2250）。
2. **`storeyed`**（2–3 层）：无顶的首层 hall → 首层柱头处腰檐（出挑 700–900、坡 0.45）→ 楼板 → 前檐平座栏杆 → 格扇上层墙 → 上层屋顶；首层天花以上的顶点全部进屋顶批。
3. **`stall`**：四根 100 mm 柱 + 布棚（垂度为跨 3%）或小悬山，下沿 ≥ 2250；前柜台 850 高带货；摊主站位在后。
4. **`adobe`**（xiyu）：450–600 墙两级抹角、墙基、平顶板（顶面 3.2–3.5 m）、450 女儿墙带压顶、每 600 一根杨木椽头、木出水槽、高窗花格、雕门；变体：前廊（2–4 根雕柱，深 1.5–2.4 m）、唐式塔刹（寺院）、晾房花砖墙（仓）、葡萄架（底 ≥ 2300）。穹顶仅非唐代 xiyu 变体可用。
5. **`compound`**：院墙带压顶、门楼（悬山，2.4 × 1.6 m）、后部正房、按宽度 1–2 座厢房、院子；院深 ≥ 5 m 时大理照壁对门；套件开关 `preferSouthHall`（门在北时正房仍坐北朝南）；每座房是一个 `hall` 子配方。
6. **`pagoda_dense`**（密檐塔）：方形、1.2 m 须弥座、6.5 m 首层带佛龛、16 重叠涩砖檐（出 450、板 250）；收分曲线（0.7 高处前 +6% 外鼓，之后收到 0.62·W0）；角部微翘 80；塔刹。
7. **`pagoda_oct`**：八角各层 + 檐环。
8. **`citywall` / `gate`**：沿折线挤出梯形断面、外侧垛口、内侧 1.0 m 女墙、城台带门洞、其上歇山门楼。

### 5.2 屋顶（`mesher/roof`）
- **剖面**：`songZhe(halfRun, H, steps)`——从脊到橑檐方连直线，第一缝下降 H/10，再从该点连到橑檐方，下一缝降 H/20、H/40……逐缝减半（每架递减半）；`qingJujia(runs, [0.5, 0.65, 0.75, 0.9])`。出檐段坡 s1 = 0.40，飞椽再上翘 40 mm。
- **坡面**：按（沿檐 u ∈ [0,1]、檐 → 脊 t ∈ [0,1]）参数化；平面位置 = 檐线与脊线按水平跨分数插值，高度 = 剖面(t)；u 分段 = ceil(长 / 1 m) + 每个起翘角附近 3 段，t 每个举折步 2 段 + 出檐 2 段。
- **翼角**：Δy = L·w_u·w_t，平面沿角平分线外推 C·w_u·w_t；`w_u` 在每条檐边末三分之一做 smoothstep；`w_t = (1 − t/0.35)²`（t < 0.35），以上为 0；共享戗脊两侧算出同一权重 → 无缝。
- **式样**：硬山（博缝齐山墙、山墙砌到屋面下、檐端墀头）；悬山（出际 + 250 mm 博风板）；歇山（前后梯形 + 侧面戗到 t = 0.45 + 收山 0.6–1.2 m 的山花 + 博脊）；庑殿（正脊长 = 柱跨 W − D，清加 0.1 推山，宋不推）；攒尖（n 个三角汇于顶 + 600–1200 宝顶）；卷棚（无正脊，半径 350 圆顶）；平顶（板 + 女儿墙）；穹顶（旋转体 12 × 6）；布棚（垂布）。
- **屋面壳**：上表面（瓦层；u = 沿檐米数，v = 沿坡弧长）、下表面（望板层，低 150–200）、檐口 120 mm 封檐带（瓦当滴水）、博风条。
- **屋脊**：沿正脊 / 垂脊 / 戗脊折线挤出梯形；脊饰：殿堂鸱尾、大理方翘头、宝顶。

### 5.3 墙与开洞（`mesher/core/openings.ts`）
- 输入：墙矩形 `[0, L] × [y0, y1]`、厚 t、洞口列表；分解为竖条，每条拼成带内外面的盒子，只在洞口边与墙端出侧面。
- 门窗框 100 mm 盒；门扇与格扇内凹 60–100 mm，不透明并带暗色衬底（**不用 alpha 测试**）。
- 斗拱 LOD0 每组约 60 三角（柱头一组 + 每间补间一组），LOD1 画成彩画带。
- **立面标记**：每个外壳顶点带 4 位世界立面掩码（bit0 S、1 W、2 N、3 E），角柱带两位；室内隔断另标。

### 5.4 不变式（规划器 `checkPlan` 查方案；`mesher/core/inspect.ts` 查生成的几何）
- **INV-1 包含**：所有几何在占地内、离边 ≥ 40 mm；例外：下沿 ≥ 2250 的招牌 / 旗 / 灯笼可外伸 ≤ 600。
- **INV-2 净空**：每个实体三角（外壳、台基、家具）按 50 mm 重心网格采样；`floorY + 50 < y < floorY + 2200` 的采样点不得落在缩进 10 mm 的 floors 内，除非落在外扩 10 mm 的阻挡家具矩形内；不阻挡的家具须 ≤ 250 高或下沿 ≥ 2200。
- **INV-3 门洞**：每个入口的盒 `[offset ± width/2] × [floorY + 门槛, floorY + 2100] × 墙厚` 内无三角；门槛矩形在 floors 内。
- **INV-4**：floors 上方 `floorY + 2200` 以下没有屋顶或上层三角。
- **INV-5 标记**：每个屋顶顶点有合法单元号；有屋顶的单元都有屋顶顶点；立面位与顶点位置一致（侧面测试）。
- **INV-6 站位**：每栋可进的非住宅都有 `stn_keeper`（在 floors 外——柜台后过道不可走）与 `stn_customer`（在 floors 内、从入口格可达）。
- 遮挡与拾取：每栋包围盒（占地 × 基底到正脊）用于 `pick`、透视圈判定（`occludes(p)`）与人物 X 光判定，不另做遮挡多边形。

## 6. 建筑层：合批、顶点格式、状态纹理、剖切、LOD、三角预算

### 6.1 图层与 draw

| 图层 | 内容 | 材质（§7） | draw |
|---|---|---|---|
| 外壳 shell | 台基、台阶、墙、柱、梁、斗拱、门窗框、隔断、台明陈设 | `static-lit`，双面（背面画成平的顶面色），剖墙，玩家附近透视 | 每格 1 |
| 屋顶 roof | 屋顶、屋脊、脊饰、腰檐、上层、平座、楼板 | `static-lit` + `ROOF_FADE` 抖动淡出；淡出时仍投影 | 每格 1 |
| 室内 interior | 家具道具、室内饰面、楼梯 | `static-lit` + 道具贴图数组 + 顶点烘灯光 | 每个打开的建筑 1（LRU 4，低档 2） |
| 门扇 doors | 门扇；玩家 1.8 m 内绕铰链开合 | 实例化，≤ 3 种 | ≤ 3 |
| 招牌 signs | 匾、吊幌、酒旗四边形；图集 UV；带单元号，被剖开的立面上隐藏 | 实例化 | 1 |
| 暗角 vignette | 全屏四边形（裁剪空间写入），进屋时屋外暗 30%，羽化 24 px | 不受光 | 仅剖切态 2 时 1 |

- **分格**：世界对齐的方格（低 / 中档 16 m、高 / 极致 32 m）；每栋归入其占地中心所在格；每格由近到远生成；顶点超过 65,535 用 Uint32 索引；按包围盒剔除。
- **LOD**：按档位——低 / 中档 LOD1、高 / 极致 LOD0；按缩放切 LOD 等实测需要再加。
- **BatchedMesh 默认不用**（tech/02 §8.3：Firefox 无 multi-draw；静态整城比合并几何慢），只保留 `BatchStrategy` 接口。

### 6.2 顶点格式（36 B / 顶点）

| 属性 | 类型 | 内容 |
|---|---|---|
| `position` | f32 × 3 | 世界米 |
| `normal` | i8 × 4，归一化 | — |
| `uv` | f32 × 2 | 沿表面的米数（着色器乘各层 `repeatM`） |
| `aMat` | u8 × 4 | 贴图层、AO（0–255）、标志、立面掩码 |
| `aUnit` | u16 × 2 | 单元号、单元地面以上的局部高度（cm） |
| `aTint` | u8 × 4，归一化 | rgb 种子色偏 / 做旧；a = 灯光 |

标志位：0 可剖候选、1 隔断、2 室内表面、3 夜间发光（窗 / 灯笼）、4 永不透视、5 采样道具数组。

### 6.3 状态纹理
- `256 × ceil(units / 256)` 的 RGBA8 `DataTexture`；R = 屋顶淡出；G = 剖墙进度（剖切高度在 250 ms 内从正脊降到 1.0 m）；B = 室内可见 / 窗光；A = 高亮。
- 单元号 i = 第 i 栋；院落部件接在所有建筑之后。

### 6.4 剖切三态（由 core 投影决定，render 不判）
- **0 关**。
- **1 去屋顶**：屋顶与上层在 250 ms 内抖动淡到 0；院落中朝镜头的院墙降到 1.0 m 矮墙；显出室内陈设。
- **2 室内**：在 1 的基础上，朝镜头的墙与隔断在 250 ms 内降为 1.0 m 矮墙并画顶面色；隐去这些立面上的门扇与招牌；屋外暗角开启（暗 30%）；其他建筑保留玩家周围透视圈；减少动效时瞬切。
- **"朝镜头"逐片元判**：`dot(立面法向, 相机后向 XZ) > 0.2` →

  | 偏航 | 剖开的立面 |
  |---|---|
  | 45° | S、E |
  | 135° | S、W |
  | 225° | N、W |
  | 315° | N、E |

  Q/E 转镜头的 350 ms 过程中也正确；JS 镜像函数 `cutFacadeMask(yawDeg)` 供测试。
- 院落只对焦点所在部件用态 2；玩家在室内 floors → 2，在院落院子 → 1（tech/15 由 core 投影给出）。
- 进室内时 CameraHint 缩放 96（相对 80 的 1.2）：1.76 m 人物约 103 CSS px 高。

### 6.5 三角预算（LOD0 / LOD1）

| 类型 | 三角 |
|---|---|
| 摊位 | 600 / 300 |
| 民居 | 2,500 / 1,200 |
| 店铺 | 3,000 / 1,400 |
| 两层店 | 5,000 / 2,400 |
| 客栈、酒楼 | 6,500 / 3,000 |
| 仓、厩 | 3,000 / 1,400 |
| 哨所、小祠 | 2,000 / 1,000 |
| 院落 | 7,000 / 3,200 |
| 寺殿 | 9,000 / 4,000 |
| 衙门、镖局、庄园 | 12,000 / 5,500 |
| 王府、宫殿 | 15,000 / 7,000 |
| 密檐塔 | 6,000 / 3,000 |
| 八角塔 | 4,000 / 2,000 |
| 西域民居 / 店 | 1,800 / 900 |
| 西域寺院 | 5,000 / 2,400 |
| 西域客栈 | 8,000 / 3,600 |
| 城墙每 10 m | 300 / 150 |
| 城门 | 8,000 / 3,500 |
| 每间室内 | 3,000 / 1,200 |
| 每个 32 m 格 | ≤ 40,000 / 20,000 |

均在 tech/02 §2.4 之内；按类型出现频率加权平均约 2,850 三角 / 栋，最坏 100 栋常驻约 28.5 万（LOD0）/ 13.5 万（LOD1）。

### 6.6 Worker、确定性、缓存
- `planBuilding` 只用整数（测试 grep 禁用三角函数 / `sqrt` / `pow` / `random` / `atan` / `Date`）；试点方案做快照测试。
- 网格器在同一引擎内确定：对位置量化到 0.1 mm 后的属性取哈希；主线程与 Worker 两条路径产出必须一致（对拍测试）。
- **形体模板缓存**：键 = 哈希（套件、类型、局部 w/d、层数、屋顶元组、入口、部件、外部家具、`seed % variants`、LOD）；缓存几何在局部坐标，合并时套变换与每栋种子色偏；有无缓存哈希相同；每城约 20–30 种。
- Worker：`new Worker(new URL('./worker/buildgen.worker.ts', import.meta.url), { type: 'module' })`；消息 `init(kit, lod)`、`cell(id, plans[])`、`interior(unit)`；类型化数组转移不复制；主线程留 CPU 副本供上下文恢复；Worker 失败时懒加载主线程网格器接替。
- 可替换接口（默认值 / 可选替换）：`BatchStrategy`（合并 / BatchedMesh）、`PickStrategy`（包围盒 / three-mesh-bvh，地标用）、`LayerTextureSource`（WebP 条带 → DataArrayTexture / 以后 KTX2）、几何传输（原始类型化数组 / meshopt 编码缓存）、`SignTextSource`（离线图集）。默认值即可上线，替换项都不是必需（tech/14 §5）。

### 6.7 端口实现

```ts
// packages/render/src/buildgen/types.ts（结构镜像；render 不 import data —— apps/game 的类型契约测试校验两边一致）
export interface BuildingLayerInput {
  readonly plans: readonly BuildingPlanView[]; readonly walls: readonly CityWallView[]; readonly kit: BuildKitView;
  readonly quality: RenderQualitySource; readonly renderer: WebGLRenderer;
  readonly signAtlas?: { readonly url: string; readonly rects: Readonly<Record<string, readonly [number, number, number, number]>> };
  readonly generator?: 'worker' | 'inline';
}
export interface BuildingLayer {                       // = tech/15 §5 端口 + 可选辅助
  readonly object: Object3D; readonly stats: BuildingLayerStats;
  setCutaway(index: number, mode: 0 | 1 | 2): void; setCameraYaw(deg: number): void;
  setFocusOcclusion(focus: Vector3, radiusM: number): void; update(dt: number, reducedMotion: boolean): void;
  pick(r: Raycaster): number; restore(): void; dispose(): void;
  ready(): Promise<void>; occludes(p: Vector3): boolean; measure(index: number): BuildingMeasure;
}
export interface BuildingLayerStats { drawCalls: number; triangles: number; cells: number; visibleCells: number; units: number;
  interiors: number; pendingCells: number; geometryBytes: number; textureBytes: number; lastCellMs: number }
export interface MeshPayload { position: Float32Array; normal: Int8Array; uv: Float32Array; mat: Uint8Array;
  unit: Uint16Array; tint: Uint8Array; index: Uint16Array | Uint32Array; bounds: Float32Array }
export interface CellPayload { cell: number; lod: 0 | 1; shell: MeshPayload; roof: MeshPayload;
  doors: Float32Array; signs: Float32Array; units: Uint16Array }
export type Recipe = (plan: BuildingPlanView, unitBase: number, kit: BuildKitView, lod: 0 | 1, sink: RecipeSink) => void;
export function cutFacadeMask(yawDeg: number): number;
```

## 7. 材质、光照与"写实古风"

- **材质**：落地 tech/02 §8.5 模块 #2 `static-lit`（`packages/render/src/materials/static-lit/**`）：自写 `ShaderMaterial` + 自己的 `#include`（共享 `lighting`、`dither`、`packing` 片段）；结构性 define 只有 `ROOF_FADE`、`ALPHA_TEST`、`DEPTH_ONLY`（档位级）；逐建筑差异全部走状态纹理与实例 / 顶点属性；**不用 `onBeforeCompile` 修补内置材质**；运行中不设 `needsUpdate`；所有程序在加载遮罩内预热；贴图数组一次分配到最终层数。
- **光照（IsoLit 共享 uniform）**：半球光（天色随时辰、地色 #6b5a45、强度 0.5）+ 太阳（方向相对镜头，同 tech/02 §4.2）；城镇用平滑 Lambert 项（toon 阈值关掉），不描边——STYLE「写实古风」与 design/22 L602 对城镇优先于 tech/02 §5；实验页留「淡边缘加深 ≤ 20%」开关给作者比，缺省关。
- **阴影**：中档起开阴影贴图（中 1024²、高 / 极致 2048²），只在太阳转 > 1° 或镜头出覆盖范围时重画；淡出的屋顶仍投影 → 室内自然阴暗。
- **灯光**：各室内模板放灯点（柜台灯、门灯、炉火），烘进 `aTint.a`（暖光、2.5 m 衰减）；室内表面受太阳 × 0.7、半球 × 0.85；夜里窗与灯自发光。
- **人物**：沿用 three 内置固定灯组（1 半球 + 1 方向光，灯数恒定不触发重编译），方向、颜色与 IsoLit uniform 同步（tech/14 D12）。
- **写实古风清单**：
  1. 比例：§3 的举折 / 举架、柱径 H/11、奇数开间、深出檐，按手绘高度代理校准。
  2. 厚度真实、不粗笨：檐口可见屋面厚 150–200，柱 200–300，门窗内凹 60–100，封檐带瓦当。
  3. 贴图尺度：UV 以米计、各层 `repeatM`；瓦距 230、宋砖约 410 × 200 × 80、木板 200–250、地砖 400–600、土坯砖 400 × 200 × 100；高档 256 px/m、中档 128 px/m。
  4. 规则烘 AO 写进 `aMat.ao`：檐下 0.55；墙脚 0.6 m 内 0.67 → 1.0 渐变；檐下 0.35 m 阴影带 0.70；墙地交角 0.78；柱础 0.82；台基侧 0.78；室内 × 0.85。
  5. 做旧与变化：墙脚 0.6 m 污渍渐变；南 / 西立面褪色 ±5%；每栋种子色相 / 饱和 / 明度抖动 3–6%；门、窗、雨棚、灯笼、脊饰按种子变体；朱红只用于官署、寺庙（按礼制）。
  6. 四面无空白：后墙与侧墙都有窗、水槽、椽头（Q/E 能看到每个立面）。
  7. 地面接触：台基压沿石、台阶、接触 AO 带、台明陈设。
  8. 避免：高饱和平涂、过大的装饰、整齐复制（种子变体 + 每栋色偏）、用 alpha 测试画格扇（用不透明贴图 + 暗衬底）。

## 8. 室内

### 8.1 设施类与子场景
- 设施类先取 `content/town/facilities/<layoutKey>.yaml`；否则按类型缺省：

  | 类型 | 缺省设施 |
  |---|---|
  | house、courtyard、manor、wangfu | residence |
  | shop* | general_store |
  | inn | inn |
  | restaurant | tavern |
  | market_stall、market | stall_goods |
  | temple_hall、shrine | temple |
  | yamen | office |
  | biaoju | escort |
  | casino | casino |
  | stable | stable |
  | warehouse | storehouse |
  | guardhouse | guardhouse |

  设施文档里的 clinic → pharmacy；relay → stable + 柜台。
- **原地进入**（AR-19）：以上全部。**走门切独立子场景**（P3）：`palace` / `palace_hall`（24×20、18×14）、内容标了 `interiorScene: true` 的、有可走楼上或地窖的、洞窟秘境（tech/02 §3.5）。

### 8.2 摆放求解器（`interiors/solver.ts`，房间局部坐标、整数）
1. 房间 = 主室内矩形，门在前墙偏移 `ox`、宽 `wd`。
2. **门内通道** `[ox − wd/2 − 200, ox + wd/2 + 200] × [D/2 − 1400, D/2]`：阻挡家具不得碰。
3. **分带**：后带（深度取模板）、侧带 350–500、柜台线 `z_c = −D/2 + 后带 + 800（店员过道）+ 柜深/2`。
4. **店员过道**从 floors 剔除（玩家进不了柜台后）；`stn_keeper` 在过道中间面朝门（yaw 0）；`stn_customer` 在柜台前 600。
5. **顾客区**按 C6 规则至少 2 个可走格且与通道连通；对 4 个偏航 × 3 种亚格偏移在整数六角格上做 BFS 验证。
6. **房间太小**依次删：可选陈设 → 侧架 → 次要站位；柜台与店员永不删；小于模板最小房间时店员站后墙、无柜台，并发诊断。
7. 种子镜像（楼梯左右）与道具变体；家具轴对齐、四分之一转。

### 8.3 模板

| 设施 | 最小房间（m） | 必需（宽 × 深 × 高 mm） | 可选 | 站位 |
|---|---|---|---|---|
| 杂货铺 | 3.6 × 2.8 | 后墙货架（满宽 × 400 × 2000）；柜台（0.55·W，1600–3200 × 550 × 900） | 侧架 350；2–3 个桶 / 麻袋 / 坛；吊挂货物 ≥ 2250 | 店员、顾客 |
| 布庄 | 3.6 × 2.8 | 布架 500 × 2200；裁布台 2400 × 800 × 850 | 400 台上布垛 | 店员 |
| 书肆 | 3.6 × 2.8 | 书柜 400 × 2000（后 + 侧）；柜台 1600 | 阅书桌 1200 × 600 | 店员 |
| 药铺 | 3.6 × 3.0 | 百子柜（满宽 × 450 × 2200）；柜台带秤与药碾 | 候诊长凳 1400 × 350 × 450；晒药簸箕 | 药师（+ 学徒） |
| 客栈 | 6.0 × 4.6 | 侧后柜台 1800 × 550；对墙楼梯 900 宽、水平 ≥ 3000；1–2 套桌椅（1600 × 1600） | 酒坛组；行李 | 掌柜、小二 |
| 酒肆 / 茶馆 | 6.0 × 4.6 | 柜台与酒坛；2.4 m 网格桌、900 过道、≤ 6 套 | 说书台 1500 × 1000 × 300 | 掌柜、小二、坐客位 |
| 铁匠铺 | 4.4 × 3.1 | 炉 1200 × 1000 × 900 + 烟囱；风箱 600 × 800；砧 + 木墩 500 × 350 × 750，距炉 1.1 m；淬火盆 800 × 500；兵器架 1600 × 400 | 工作台 1400 × 600；煤堆 | 铁匠（砧前面朝门）、学徒（风箱） |
| 当铺 | 4.4 × 3.1 | 高柜 1350 高 × 600（满宽减 800 门道）；掌柜台 +300 | 库架 | 掌柜（高位） |
| 钱庄 | 4.4 × 3.1 | 柜台（算盘、账簿）；钱箱 | 后屏风 | 柜员、护卫 |
| 镖局前厅 | 6.0 × 4.6 | 台 2400 × 1200 × 150 + 主座与案；两列椅与茶几；过道 ≥ 1600 | 兵器架；旗架 | 总镖头、账房 |
| 武馆 | 6.0 × 4.6 | 两侧兵器架；台与座 | 木人桩；鼓 | 馆主、教头 |
| 住宅堂屋 | 3.6 × 2.8 | 供桌 2000 × 450 × 900（后墙正中）；八仙桌 + 2 椅 | 宽 ≥ 5.5 m 加架子床 2000 × 1400；箱 | 主人 |
| 寺庙 | 3.0 × 2.4 | 佛台（0.5·W × 1200 × 900）+ 2.4–3.0 m 造像；供桌 | 香炉；蒲团 ≤ 120 高（不阻挡） | 僧人 |
| 公堂（仅绑定时） | 8 × 6 | 台、案、屏风；签牌架 | — | 官员、4 名衙役 |
| 赌坊 | 6 × 4.6 | 2–3 张赌桌 1600 × 1000 + 凳；钱柜 | — | 每桌庄家、钱柜、打手 |
| 厩 / 仓 / 哨所 | — | 马槽与草垛 / 成排木箱 / 凳、桌、兵器架 | — | 马夫 / 守卫 |
| 货摊 / 食摊 | 2.6 × 1.6 | 前柜台 850 高带货 | 炉灶（食摊） | 摊主面朝街 |

### 8.4 道具库（`mesher/fixtures`，三角 LOD0 / LOD1）
柜台 120/60、带格栅高柜 300/120、四层货架 160/60、百子柜 200/80、布架 180/60、书柜 160/60、阅书桌 80/30；方桌 100/40、长凳 40/20、凳 30/12、扶手椅 150/60、供桌 120/50、床 300/120、箱 40/20；楼梯（14 级、梯梁、扶手）400/150；炉（带罩与烟囱）300/120、风箱 60/24、砧与木墩 120/50、淬火盆 60/24、兵器架（6 件兵器）400/120、工具架 120/50、工作台 80/30；木桶 64/24、木箱 12/12、麻袋 48/20、酒坛 64/24、坛组 192/72、筐 48/20、草垛 12/12、马槽 24/12；佛台 200/80、造像（旋转体）600/240、香炉 80/30、蒲团 24/12、屏风 40/20、台 24/12；赌桌 80/30、木人桩 120/40、旗架 30/14、柜台杂物组 80/0、灯笼 48/20、吊挂货物 60/0、说书桌 60/24。**每间室内 ≤ 3,000 / 1,200**；道具采样共用 8 层道具贴图数组 + 顶点色。

## 9. 3D 人物

### 9.1 运行时（`packages/render/src/actor3d`，懒加载块 `render-actor3d`）
- **主角**：`createDressupActor`（`render-dressup` 块），用城镇减面件 `*.town.glb`、`unlit: false`；播放率通过 `actor.update(dt × 倍率)` 实现，不改换装代码；装备由应用侧目录把物品映射成换装规格，render 不解析物品。男性：`tpl_m_*` 未出前用 `npc_zhujue__ch00_m` 城镇减面版。
- **NPC**：每个 URL 只解析一次 GLTF；克隆共享几何、材质、贴图；骨骼用 `SkeletonUtils.clone`；片段按 Mixamo 骨架族共享；没有片段的具名 NPC（`model_rig.glb`）用 `battle/model-stage.ts` 的 `retargetBattleClips` 每模型重定向一次并缓存。

```ts
// packages/render/src/actor3d/types.ts
export interface ActorLook { readonly template: string; readonly heightM: number; readonly outfit: string; readonly seed: number;
  readonly role: 'player' | 'npc' | 'named' }
export interface ActorLodAsset { readonly url: string; readonly triangles: number; readonly textureSize: 512 | 1024 }
export interface ActorAssetSet {                     // 应用按构建期清单解析
  readonly kind: 'glb' | 'dressup'; readonly lod: readonly [ActorLodAsset, ActorLodAsset];
  readonly clipsUrl: string | null; readonly statureMu: number;                  // HeadTop_End 高度（模型单位）
  readonly nativeHps: { readonly walk: number; readonly run: number };           // 倍率 1 时每秒走过几个身高
  readonly dressup?: { readonly bodyUrl: string; readonly frameUrl: string; readonly templateId: string };
}
export interface ActorCatalog { resolve(look: ActorLook): ActorAssetSet }
export interface ActorEquipment { readonly specs: readonly DressupEquipSpec[]; readonly bodyLayers?: readonly DressupLayerSpec[] }
export function createActorPort(o: { scene: Scene; catalog: ActorCatalog; quality: RenderQualitySource;
  occluders?: { occludes(p: Vector3): boolean } }): ActorPort;
export function selectGait(prev: 0 | 1 | 2, speedMps: number): 0 | 1 | 2;          // 静止 < 0.05；走 → 跑 2.6，跑 → 走 2.2
export function gaitTimeScale(speedMps: number, heightM: number, hps: number): number; // clamp(v / (hps·h), 0.80, 1.45)
```

### 9.2 城镇减面（离线，复用现有工具）
`tools/model3d/town_lod.py` 串起：① 去掉法线与金属粗糙度贴图，只留 baseColor；② `tools/model3d/dressup/textures.py --max 1024`（LOD0）或 `--max 512`（LOD1）；③ `tools/model3d/dressup/pack_glb.mjs --simplify <比例>`（已保 UV、蒙皮权重、区域边界并 meshopt 压缩）；④ 新 `tools/model3d/measure_gait.mjs`（像 `meshopt_decode.mjs` 那样在 Node 里跑 three）量 `HeadTop_End` 得 `statureMu`，按脚掌支撑滑移量出走 / 跑原生速度 `nativeHps`；⑤ 写 `town.json`；⑥ `tools/model3d/capture_validation_shots.mjs` 出转台图。
- 产物 `assets/default/model3d/<id>/town/{lod0,lod1}.glb`；首批 `npc_generic_m/f`、`npc_zhujue__ch00_m/f`、`npc_duanyu`、`npc_liwenxiu__ch10_youth`。
- LOD0 ≤ 25,000 三角、只 baseColor ≤ 1024²；LOD1 ≤ 9,000、512²；骨骼名与数量不变；权重和 = 1 ± 1e-3；身高 ±1%；脚底支撑滑移 ≤ 2 cm；LOD0 ≤ 1.6 MB。
- 换装件 `tools/model3d/dressup_town_lod.py` 在源件旁写 `*.town.glb`：身体 1.2 万、头 4 千、每件衣 3.5 千、头发 2 千、道具 1.5 千，整身 ≤ 2.5 万；区域属性、UV、关节保留；遮罩过 `validate.py`。

### 9.3 身高数据（AR-79、AR-104）
- `NpcAppearanceSchema` 加 `body?: { template: BodyTemplateId; heightCm: int 120–230 }`（随年龄，按外观存）。
- `CharacterTemplateSchema` 加 `body?: { templates: BodyTemplateId[]; heightCm: [min, max] }`；角色槽 NPC 已有存档稳定种子 → `heightCm = min + seed % (max − min + 1)`，纯函数 `pickTemplateHeightCm`。
- `BodyTemplateId`：`tpl_f_small` 1.58、`tpl_f_medium` 1.66、`tpl_f_tall` 1.72、`tpl_m_lean` 1.76、`tpl_m_medium` 1.81、`tpl_m_bulk` 1.86 m；主角缺省（创角选择出来前）男 `tpl_m_medium`、女 `tpl_f_medium`。
- core 把 `heightM` 与 `template` 放进 `ActorLook`；render 按 `heightM / (statureMu × 模型缩放)` 缩放，**绝不按包围盒**。

### 9.4 步速匹配（脚不打滑）
- 暂用原生速度（`battle/model-stage.ts` L50）：走 0.612、跑 2.143 身高/秒，测出后替换。
- 沿路线段**匀速**移动，不用指数插值；落后 > 0.5 m 时最多 1.15× 追赶，播放率同乘。
- 速度：步行 1.35 m/s、奔跑 4.5 m/s（tech/15 `PACE_MM_PER_TICK`）。播放率：

  | 身高（m） | 1.58 | 1.66 | 1.72 | 1.76 | 1.81 | 1.86 |
  |---|---|---|---|---|---|---|
  | 走 1.35 m/s | 1.40 | 1.33 | 1.28 | 1.25 | 1.22 | 1.19 |
  | 跑 4.5 m/s | 1.33 | 1.27 | 1.22 | 1.19 | 1.16 | 1.13 |

- 转身 ≤ 540°/s 带缓动；站位上的 NPC 朝站位 yaw。

### 9.5 X 光、阴影、拾取
- **X 光**：每个 primitive 一个共享骨骼的孪生 `SkinnedMesh`，`depthFunc: GreaterDepth`、不写深度、renderOrder 30（tech/02 §3.4）；石青填充 0.45 透明度，最低 0.15 m 丢弃（脚前地面不触发）。主角中档起；任务 NPC（≤ 8）高档起；低档无，靠建筑透视圈。
- **阴影**：全档实例化圆斑影子（1 draw）；主角实时投影高档起。
- **拾取**：胶囊体（半径 0.35，高 = heightM）。

### 9.6 每档上限与显存

| 档 | 同屏动画人物 | 全精度名额 | 主角 | 人物显存 |
|---|---|---|---|---|
| 低 | 4 | 0（全 LOD1） | LOD1，无 X 光 | ≤ 24 MB |
| 中 | 6 | 1（主角） | LOD0，有 X 光 | ≤ 48 MB |
| 高 | 8 | 3 | LOD0 | ≤ 80 MB |
| 极致 | 20 | 6 | LOD0 | ≤ 160 MB |

- 每个不同模型：LOD0 约 6.7 MB（1024² 含 mip 5.6 + 几何约 1.1）、LOD1 约 1.8 MB；换装主角约 20 MB。
- 离屏不更新混合器；可见 NPC > 6 时隔帧更新。人群（P4）再上 LOD2（约 3 千）、KTX2 与骨矩阵烘焙实例化。

## 10. 性能预算与测量

参考视野（缩放 80）：手机 844×390 约 14.9 × 13.8 m；桌面 1920×1080 约 33.9 × 38.2 m。

| 档（全场三角 / draw 目标，tech/02 §8.2） | 地形 + 植被 | 建筑 draw / 三角 / 显存 | 人物 draw / 三角 | 合计显存（档上限 96 / 160 / 256 / 512 MB） |
|---|---|---|---|---|
| 低（10 万 / 60） | 2.5 万 | ≤ 14 / ≤ 4 万（LOD1，16 m 格）/ ≤ 16 MB | ≤ 8 / ≤ 3.6 万 | ≤ 40 MB |
| 中（20 万 / 100） | 4.5 万 | ≤ 22 / ≤ 7 万（LOD1）/ ≤ 32 MB | ≤ 18 / ≤ 7 万 | ≤ 80 MB |
| 高（30 万 / 150） | 5.5 万 | ≤ 34 / ≤ 11 万（LOD0，32 m 格）/ ≤ 56 MB | ≤ 20 / ≤ 12 万 | ≤ 136 MB |
| 极致（60 万 / 250） | 9 万 | ≤ 48 / ≤ 25 万 / ≤ 96 MB | ≤ 32 / ≤ 27 万 | ≤ 256 MB |

- 3D 城镇不常驻 2D rig 图集（tech/02 §8.7 的 40 / 105 / 170 / 300 MB），其额度改给建筑与人物。
- 主线程：`BuildingLayer.update` ≤ 0.2 ms；8 个人物更新 ≤ 0.6 ms；每帧最多上传 1 格。
- 最坏西安 ch10（100 栋）：常驻约 28.5 万（LOD0，约 19 MB 几何）/ 13.5 万（LOD1，约 9 MB）；单个 32 m 格 ≤ 4 万；整城生成桌面 ≤ 300 ms（手机估 ≤ 1.2 s，待测），都在 Worker 里。

**测量**
1. `pnpm check`（只做结构，不计时）：各类型 / LOD 三角预算；各试点场景 × 档位的 draw 数（格数 × 2 + ≤ 6）；`estimateBytes()` 对预算；包体与 dev 块守卫。
2. `pnpm check:perf`（ENG-12b 模式：预热 120 帧、3 × 600 帧、三轮最优 P95、记 loadavg、不跳过）：`packages/render/src/buildgen/performance.test.ts`——100 栋生成 P95 < 250 ms、单格 P95 < 12 ms、10 栋同时淡出时层更新 P95 < 0.20 ms；`packages/render/src/actor3d/performance.test.ts`——24 个人物 P95 < 1.0 ms。
3. 浏览器：`/town-lab?perf=1` HUD（`renderer.info`、滚动 300 帧 P50 / P95、各组件 CPU、字节账）；`__townLab.bench()` 出 JSON，截图工具每轮存 `perf.json`。
4. 真机：每个闸门时开发监督在一台中端安卓与一台 iPhone 上跑 bench，记录不作门。

## 11. 实验页 `/town-lab` 与闸门 A / B

### 11.1 实验页（仅开发构建）
- URL 参数：`mode=catalog|city|walkin`、`kits`、`types`、`scene`、`yaw=45|135|225|315`、`zoom=48..112`、`tex=placeholder|painted`、`sprite=off|side|onion`、`time`、`tier`、`cut`、`perf`。
- **目录模式**：每套件一行、每类型一块 24 m 场地；每扇门旁放 1.76、1.86 男与 1.58、1.66 女四个人台 + 2.4 m 标尺（0.5 m 刻度）；标注门净高、檐高、脊高与门 / 人比。
- **手绘对照**：只在 yaw 45、zoom 64（手绘图原生 k = 45.25 px/m）；手绘 PNG 按 `anchor_px` 对齐到投影的占地中心，并排（`side`）或半透明 50% 叠加（`onion`）。
- **城市模式**：大理 ch01、大理 ch10、吐鲁番 ch10 的全部方案铺在布局地面格栅上。
- **键**：Q/E 转、+/− 缩放、1–4 档位、T 贴图组、S 手绘对照、C 剖切、L 时辰、P 性能。
- **脚本 API**：

```ts
window.__townLab = {
  ready(): Promise<void>; set(p: Partial<LabParams>): Promise<void>; capture(): string /* data URL */;
  measure(): MeasureReport; stats(): LabStats; bench(o: { frames: number; warmup: number }): Promise<BenchReport>; errors(): string[];
};
```

- 数据由只在 serve 生效的 Vite 插件（`apps/game/build/town-lab-plugin.ts`，`apply: 'serve'`）在 Node 里跑 `planBuilding` 与 `compileKit` 提供；生产构建不得含任何实验页产物（`apps/game/scripts/check-dev-chunks.mjs` 加 `town-lab` 规则）。

### 11.2 闸门清单

| 闸门 | 渲染什么 | 自动数值检查 | 作者 |
|---|---|---|---|
| **A 体量与比例**（占位贴图） | 2 套件 × 6 类型（民居、店、客栈 / 两层店、摊、院落、寺殿）× 4 偏航；手绘并排与叠加；三座试点城 zoom 48 与 80、yaw 45 与 225；地标页（塔、城门、城墙） | 每个可进试点类型门净 ≥ 2100 × ≥ 1200；1.76 m 人台 zoom 80 = 86 ± 2 px、64 = 69 ± 2、96 = 103 ± 2；占地轮廓与手绘 `logical_footprint_polygon_px` 在 zoom 64 下差 ±4 px 内；脊高偏离手绘代理超出 −15% / +30% 标黄（只提示）；三角预算；draw ≤ 2 × 格数 + 6 | 逐类型逐套件定，原话入 AR；预期讨论点：客栈 +28%、寺殿 +19%、吐鲁番唐式风格 |
| **B 材质 + 走进店里** | 闸门 A 视图换绘制贴图 + 招牌，12:00 / 18:30 / 21:00；zoom 112 近景；店铺、药铺、客栈、铁匠：zoom 80 走近 → 门口 → 室内（态 2、zoom 96）→ 柜台前 → 连按三次 Q；女主角换装 + 男性兜底；店员在站位；一帧 X 光 | 各材质与已审手绘取色 ΔE2000 ≤ 12；平铺接缝 ΔE < 2；四个偏航下店员都可见（按投影框取像素）；主角 86 / 103 px；HUD 在开发机预算内 | 原话入 AR |

### 11.3 无头截图
`tools/buildgen/capture_town_lab.mjs` 走 `tools/agents/browser_eval.mjs` 的 9223 单一常驻连接（AR-100），循环参数、等 `ready()`、每张存 PNG + stats JSON；`contact_sheet.py` 与 `review_numbers.py` 把联系表与 `numbers.md` 写到 `assets/default/buildkit/review/rNN/`；`--compare rNN-1` 报告与上一轮的逐图差异（不作门）；任何实验页 / 控制台错误或数值检查失败都非零退出。

## 12. 美术与招牌

### 12.1 贴图层
母版 1024²，每张覆盖一个 `repeatM`；按档出条带：高 / 极致 512² 层（512 × 8192 WebP，约 1.0–1.5 MB），低 / 中 256² 层（256 × 4096，约 0.3 MB）。

| 套件 | 层（下标：id，重复尺寸 m） |
|---|---|
| song_dali | 0 tile_roof 2.0 · 1 ridge_tiles 1.0 · 2 eave_soffit 1.0 · 3 timber_lacquer 1.0 · 4 timber_raw 1.0 · 5 plaster_lime 2.0 · 6 earth_plaster 2.0 · 7 stone_rubble 2.0 · 8 stone_ashlar 2.0 · 9 brick_grey 1.0 · 10 lattice_window 1.0 · 11 door_planks 1.0×2.0 · 12 floor_pavers 2.0 · 13 floor_wood 2.0 · 14 painted_band 1.0 · 15 cloth_awning 1.0 |
| xiyu | 0 mud_roof · 1 parapet_coping · 2 joist_soffit · 3 timber_carved · 4 timber_raw · 5 mud_plaster_ochre · 6 mud_plaster_limewash · 7 brick_fired · 8 adobe_brick · 9 brick_lattice（晾房）· 10 lattice_wood · 11 door_carved · 12 floor_earth · 13 carpet_kilim · 14 dome_plaster（唐式变体不用）· 15 canvas_awning |
| props（共用，恒 256²） | wood_furniture · wood_rough · ceramic_glaze · iron · cloth_bolt · paper_books · straw_basket · medicine_drawers |

### 12.2 流程
1. `TOOL-buildgen-t1-placeholders`：Python 程序化占位贴图（瓦、砖、毛石、白灰、木纹、格扇、土坯、毡毯），真实尺度、可复现。
2. 闸门 A 后，出图线 Opus 子代理在作者 Chrome 里驱动 Gemini（`gemini-imagegen` 技能），新提示词组 `assets/default/prompts/buildkit/<kit>.yaml`：正交无缝样片、光照均匀、无透视、无投影、无物体、无文字、写明真实尺度；参考图为已审手绘图裁片；每层 2–3 个候选，间隔 30 s；约 50 张、1 小时 / 套件。
3. `TOOL-buildgen-t4-seamless` 的 `make_seamless.py` 后处理：半移位 + 接缝蒙版、按 `repeatM` 归一尺度、对色、3×3 平铺预览、FFT 查明显重复。
4. manifest 照常写出处字段；闸门 B 通过后由 candidate 改 approved。

### 12.3 招牌
- 字体：马善政楷书 Ma Shan Zheng 400，SIL OFL 1.1（design/26 §6.1 已审）；随 `OFL.txt` 入 `assets/default/font/ma_shan_zheng/`。**下载前另问作者**。
- `make_sign_atlas.py` 每字 96 px，每场景一张 ≤ 2048×1024 图集 + UV JSON。
- 样式：黑漆金字（#c8a24a）、本色木墨字、红底金字（仅寺庙官署）、竖幌、酒旗（酒）。
- 图像模型永不画字（design/22 §7.5）。

## 13. 任务登记

规则：每个任务以 `pnpm check` 为完成定义；并行任务写集不相交；每个模块树由其骨架任务一次建好（含桩文件），后续任务只替换自己的桩；标 **INT** 的是对共享文件的整合改动，必须串行（共享文件的分块 / 预算 / perf 注册统一由 tech/15 的 `ENG-town2-chunks` 承担）。执行器 traex GPT-5.6-Sol xhigh。

校验命令：数据任务 `pnpm exec vitest run packages/data/src/build/town-plan --config vitest.workspace.ts && pnpm --filter @tianshu/data typecheck`；render 任务 `pnpm exec vitest run packages/render/src/<dir> --config vitest.workspace.ts && pnpm --filter @tianshu/render typecheck`；Python 工具 `python3 tools/<dir>/tests/<file>.py`；包体 `pnpm size`；性能 `pnpm check:perf`。全部再加 tech/15 §11 的 Vb。

### 13.1 B 建筑线

| ID | 范围 | 依赖 | 写集 | 验收 |
|---|---|---|---|---|
| ENG-buildgen-p0-scaffold | 类型、坐标框、类型解析、rng、家具目录、index、全部桩；`./town-plan` 子路径；桩 `planBuilding` 返回只有占地的合法方案（供编译器先用） | DES-town2-docsync | `packages/data/src/build/town-plan/**`（初建）、`packages/data/package.json`（加 `./town-plan`） | 四分之一转在 k = 0..3、1 万点上精确往返；前脸法向映射到 S / W / N / E；68 个布局类型串 + 3 个地标全部可解析、未知类型抛错；禁用运算 grep 通过；`hexCentreMm` 误差 ≤ 1 mm |
| ENG-buildgen-p1-kits | 套件 schema 与 `compileKit`；`song_dali`、`xiyu`（含 `tang_buddhist`）YAML；`city-kits.yaml` | p0 | `packages/data/src/build/town-plan/kit/**`、`content/town/buildkits/**` | 两套件校验通过；每个试点类型在两套件都能解析；数值在 §3 范围内；编译后每套件 ≤ 12 KB 且逐字节稳定 |
| ENG-buildgen-p2-plan-hall | dims、doors、plan-hall（hall、storeyed、stall、adobe）；试点布局夹具 | p1 | `town-plan/{dims,doors,plan-hall}.ts`、`town-plan/__tests__/plan-hall.test.ts`、`town-plan/testing/**` | 全部试点建筑 + 合成尺寸 {6×5, 7×5, 7×6, 8×6, 9×7, 10×8, 12×9, 12×10, 13×10, 14×11, 3×2, 4×3, 5×4} × 4 偏航：门 ≥ 1200 × 2100；floors 在占地内；6×5 店室内 ≥ 4.2 × 2.9 m；四个算例 ±1 mm；快照确定；方案 JSON ≤ 700 B |
| ENG-buildgen-p3-compound | 院落、衙门、王府、庄园、镖局、寺院、西域客栈与院落；`preferSouthHall` | p2、ENG-interior-i1-core | `town-plan/plan-compound.ts`、`town-plan/compound/**`、`__tests__/plan-compound.test.ts` | 部件在占地内且不重叠；院门在入口；各房门朝院；院子与每房站位可达；`floorY` 一致；≤ 12 部件 |
| ENG-buildgen-p4-invariants | `checkPlan`、导出夹具、新鲜度测试 | p2、p3、i1 | `town-plan/{invariants,export-fixtures}.ts`、`__tests__/{invariants,fixtures-fresh}.test.ts`、`packages/render/src/buildgen/testing/pilot-{plans,kits}.json` | 全部试点方案无诊断；8 种损坏样例都能查出；提交的 JSON 过期时新鲜度测试失败 |
| ENG-buildgen-r0-core | 视图 / 端口类型、网格构建器、图元、开洞、检查、哈希、rng、配方注册与桩、屋顶与图层桩、`generate.ts`、迷你方案 | DES-town2-docsync | `packages/render/src/buildgen/{index,types}.ts`、`buildgen/mesher/core/**`、`buildgen/mesher/recipes/**`、`buildgen/mesher/roof/index.ts`、`buildgen/mesher/generate.ts`、`buildgen/three/layer.ts`（桩）、`buildgen/testing/mini-plans.ts` | `mesher/**` 下无 `three` import；带洞墙面积 = 墙 − 洞 ±0.1%；洞内 0 三角；外法向 > 0.99；36 B / 顶点；载荷只有类型化数组；哈希稳定 |
| ENG-buildgen-r1-hall-body | 台基、台阶、柱、梁、墙、门窗框、斗拱、陈设；`recipes/hall.ts` | r0 | `buildgen/mesher/parts/{platform,steps,columns,beams,walls,frames,brackets,dressing}.ts`、`buildgen/mesher/recipes/hall.ts`、`__tests__/hall.test.ts` | 每个 hall 类试点方案 × 4 偏航 × LOD0/1：INV-1、2、3、5；柱数 = (间数 + 1) × 列数；台基顶 ±1 mm；在预算内 |
| ENG-buildgen-r2-roof-a | 剖面、坡面、硬山 / 悬山、平顶、布棚、屋脊、屋面壳 | r0 | `buildgen/mesher/roof/{index,profile,patch,gable,flat,canopy,ridge,shell}.ts`、`__tests__/roof-a.test.ts` | `songZhe` 与 §3 金样 ±1 mm；坡度向脊严格递增；滴水 = `eaveMm` ±10；正脊 = `ridgeMm` ±10；离占地 ≥ 40 mm；共享边无 > 1 mm 缝；在预算内 |
| ENG-buildgen-r3-roof-b | 歇山、庑殿、攒尖、卷棚、穹顶、翼角起翘 / 冲出、脊饰 | r2 | `roof/{hip,xieshan,pyramid,rolled,dome,corner,ornaments}.ts`、`roof/index.ts`（注册）、`__tests__/roof-b.test.ts` | 起翘 / 冲出 = 套件值 ±5；戗脊缝 ≤ 1 mm；镜像对称哈希成立；攒尖单顶点；在预算内 |
| ENG-buildgen-r4-storeyed-stall | storeyed 与 stall 配方；平座、腰檐、雨棚 | r1、r2 | `recipes/{storeyed,stall}.ts`、`parts/{balcony,pent-eave,awning}.ts`、`__tests__/storeyed.test.ts` | 首层天花以上全在屋顶批；栏杆 ≥ 950；腰檐底 ≥ 2400；布棚 ≥ 2250；INV-1 至 5 |
| ENG-buildgen-r5-adobe | 西域土坯（含唐式塔刹、禁穹顶尖拱的变体）；女儿墙、椽头、前廊、葡萄架、花砖墙 | r1、r2、r3 | `recipes/adobe.ts`、`parts/{parapet,joists,iwan,trellis,brick-lattice}.ts`、`__tests__/adobe.test.ts` | 墙厚与女儿墙 ±1；椽距 600 ±1；葡萄架 ≥ 2300；西域民居 LOD0 ≤ 1,800 三角；`tang_buddhist` 下无穹顶 / 尖拱三角 |
| ENG-buildgen-r6-compound | 院落配方；院墙、门楼、廊、照壁 | r1、r2、p3 | `recipes/compound.ts`、`parts/{enclosure,gatehouse,gallery,screen-wall}.ts`、`__tests__/compound.test.ts` | 每部件单元号；院墙立面标记正确；院门净空；INV-1 至 5 |
| ENG-buildgen-r7-special | 密檐塔、八角塔、城墙、城门 | r2、r3 | `recipes/{pagoda-dense,pagoda-oct,citywall,gate}.ts`、`__tests__/special.test.ts` | 高 = `heightM` ±1%；16 重檐；收分单调；垛口间距；门洞 ≥ 4500 × 5000 |
| ENG-buildgen-r9-layer | `BuildingLayer`：分格、`static-lit` 材质、状态纹理、淡出与剖切、透视、门扇、招牌、室内 LRU、暗角、拾取、统计、恢复 / 释放；贴图层加载器带占位回退 | r0、r1、r2（+ r8） | `packages/render/src/buildgen/three/**`、`packages/render/src/materials/static-lit/**` | 模拟渲染器的 Node 测试：每个可见格 2 draw；每单元屋顶属性；态 2 在模拟 250 ms 内屋顶淡出到 0、剖墙进度到 1；LRU ≤ 4；`cutFacadeMask` 45 → S\|E、135 → S\|W、225 → N\|W、315 → N\|E 且跨 90° 平滑；预热后 `update()` 零分配；`dispose` 幂等；程序缓存键固定 |
| ENG-buildgen-r10-worker | Worker、client、形体缓存、时间切片 | r9 | `buildgen/worker/**`、`buildgen/mesher/shape-cache.ts`、`__tests__/worker-parity.test.ts` | 主线程与模拟通道哈希在每个试点格都相等；吐鲁番 ≤ 25 种形体；有无缓存相同；释放时终止 Worker |
| ENG-buildgen-r11-perf | `buildgen/performance.test.ts` | r10、ENG-town2-chunks | `packages/render/src/buildgen/performance.test.ts` | §10 门在 `check:perf` 下通过 |
| TOOL-buildgen-t1-placeholders | 程序化层（每套件 16 + 道具 8）、档位条带、manifest | DES-town2-docsync | `tools/buildgen/{common.py,make_placeholder_layers.py,build_layer_strips.py}`、`tools/buildgen/tests/test_layers.py`、`assets/default/buildkit/{song_dali,xiyu,props}/**` | 两次运行 sha256 相同；接缝 ΔE < 2；FFT 平铺周期 ±3%；条带 512×8192 与 256×4096 |
| ENG-townlab-l1 | `/town-lab` 目录与城市模式、手绘对照、HUD、`__townLab`、serve 插件。**INT**：`main.ts` 路由、`vite.config.ts` 插件一行、`check-dev-chunks.mjs` 的 `town-lab` 规则 | r9、p4、t1、ENG-town2-chunks | `apps/game/src/dev/town-lab/**`、`apps/game/build/town-lab-plugin.ts` + 三处 INT 行 | 生产构建无实验页产物；`measure()` = 方案 ±10 mm；人台 zoom 80 为 86 ± 2 px；占地与手绘差 ±4 px |
| TOOL-buildgen-t3-capture | 截图、联系表、数字、对比 | l1 | `tools/buildgen/{capture_town_lab.mjs,contact_sheet.py,review_numbers.py}`、`assets/default/buildkit/review/r01/**` | 一条命令产出闸门 A 全套；任何错误或数值不过都非零退出 |
| GATE-buildgen-A | 作者看体量与比例 | t3、r1–r7、p3 | AR 条目 | 逐类型逐套件原话 |

### 13.2 I 室内线

| ID | 范围 | 依赖 | 写集 | 验收 |
|---|---|---|---|---|
| DES-interior-01-facilities | 三个试点场景的设施绑定与招牌文字键 | DES-town2-docsync | `content/town/facilities/{city_dali__ch01,city_dali__ch10,city_turpan__ch10}.yaml` | 每栋可进试点建筑有设施类；`dali_yaopu` 已绑；i1 每种模板至少用到一次 |
| ENG-interior-i1-core | 求解器、六角格；模板：杂货、药铺、客栈、酒肆、住宅、铁匠、货摊 | p2 | `town-plan/interiors/{solver,hexes,general-store,pharmacy,inn,tavern,residence,smithy,stall}.ts`、`__tests__/interiors-i1.test.ts` | 房间 {4.4×3.1, 5.3×3.3, 6.8×4.6, 8.8×6.4} × 4 偏航 × 3 亚格偏移：店员在柜台后面朝门、过道不在 floors；通道净空；顾客位 BFS 可达；≥ 2 个顾客格；家具在房内且不重叠；矮杂物规则成立 |
| ENG-interior-i2-more | 布庄、书肆、当铺、钱庄、镖局、武馆、寺庙、公堂、赌坊、厩、仓、哨所 | i1 | `interiors/{…}.ts`、`__tests__/interiors-i2.test.ts` | 同 i1，另：当铺柜 ≥ 1300 且掌柜台 +300；佛台居中 ±100；镖局过道 ≥ 1600 |
| ENG-interior-r8-props | 道具 DSL、≥ 36 件、室内拼装与灯光烘焙 | r0、p0 | `buildgen/mesher/fixtures/**`、`__tests__/props.test.ts` | 包围盒 = 家具尺寸 ±2%、高 ±2%；三角在 §8.4 表内；阻挡道具在其矩形内 |

### 13.3 C 人物线

| ID | 范围 | 依赖 | 写集 | 验收 |
|---|---|---|---|---|
| DES-actor3d-01-body | 试点 NPC 的模板、身高、出处说明 | DES-town2-docsync | `docs/tech/16-town-3d-spec.md` §9 附表 | 每个试点 NPC 一行（模板、身高、依据） |
| ENG-actor3d-d1-schema | `body` 字段与 `pickTemplateHeightCm` | DES-actor3d-01-body | `packages/data/src/schemas/character.ts`、`character.test.ts` | 现有内容仍通过；新字段有界；取身高确定 |
| TOOL-actor3d-t1-lod | `town_lod.py`、`measure_gait.mjs`；六个模型 | — | `tools/model3d/{town_lod.py,measure_gait.mjs,tests_town_lod.py}`、`assets/default/model3d/*/town/**` | 见 §9.2 全部数值；附转台图 |
| TOOL-actor3d-t2-dressup-lod | 模板、头、衣、发、道具的 `*.town.glb` | — | `tools/model3d/{dressup_town_lod.py,tests_dressup_town_lod.py}`、新增 `assets/default/model3d/dressup/**/*.town.glb` | 区域属性、UV、关节保留；遮罩 `validate.py` 通过；身体 + 头 + 2 件衣 + 发 + 道具 ≤ 2.5 万 |
| ENG-actor3d-a1-core | 类型、目录、步态、身高缩放；index 与桩 | DES-town2-docsync | `packages/render/src/actor3d/{index,types,catalog,gait,stature}.ts`（+ 桩、测试） | §9.4 播放率表 ±0.01；滞回 2.2 / 2.6；夹到 [0.80, 1.45]；身高缩放精确 |
| ENG-actor3d-a2-port | 端口、缓存、人物、影子、拾取 | a1、t1 | `actor3d/{port,cache,actor,shadow,pick}.ts`、`__tests__/port.test.ts` | 模拟加载器：每 URL 解析一次；克隆共享资源；片段只重定向一次；移动中速度 ±2%；转身 ≤ 540°/s；引用计数释放；`update` 零分配 |
| ENG-actor3d-a3-dressup-xray | 换装适配、X 光孪生 | a2、t2 | `actor3d/{dressup-adapter,xray}.ts`、`__tests__/dressup-xray.test.ts` | 假换装 actor：装备映射；dt 缩放实现播放率；孪生共享骨骼纹理并随人物释放；根缩放 = heightM |
| ENG-actor3d-a4-perf | `actor3d/performance.test.ts` | a2、ENG-town2-chunks | `packages/render/src/actor3d/performance.test.ts` | 24 个人物 P95 < 1.0 ms，三轮最优 |
| ENG-townlab-l2-walkin | 走进店里模式与截图 | l1、a3、i1、r8 | `apps/game/src/dev/town-lab/walkin/**`、`tools/buildgen/capture_walkin.mjs` | 4 个偏航都能走到柜台前；态 2 下店员可见；主角 86 / 103 px |

### 13.4 美术线

| ID | 范围 | 依赖 | 写集 | 验收 |
|---|---|---|---|---|
| TOOL-buildgen-t4-seamless | `make_seamless.py` | — | `tools/buildgen/make_seamless.py`、`tools/buildgen/tests/test_seamless.py` | 带接缝的合成纹理处理后无缝；重复输入触发 FFT 警告 |
| ART-buildkit-a1-song_dali | Gemini 绘制层（+ 道具）（出图线 Opus 子代理） | 闸门 A、t4、t1 | `assets/default/buildkit/{song_dali,props}/**`、`assets/default/prompts/buildkit/song_dali.yaml` | 接缝 ΔE < 2；尺度 ±5%；对色 ΔE ≤ 12；无文字 / 人 / 透视；`build_layer_strips.py --check` 通过 |
| ART-buildkit-a2-xiyu | 同上，xiyu（唐式变体） | 闸门 A、t4 | `assets/default/buildkit/xiyu/**`、`assets/default/prompts/buildkit/xiyu.yaml` | 同 a1 |
| TOOL-signs-t5 | 字体资产（下载需作者许可）、图集工具、试点图集 | DES-interior-01-facilities | `assets/default/font/ma_shan_zheng/**`、`tools/buildgen/make_sign_atlas.py`、`tools/buildgen/tests/test_sign_atlas.py`、`assets/default/buildkit/signs/**` | 字体覆盖所用全部汉字；sha256 可复现；UV JSON 一致 |
| GATE-buildgen-B | 作者看材质 + 走进店里 | a1、a2、t5、l2 | AR 条目 | 原话 |

**到闸门 A 的关键路径**：DES-town2-docsync → p0 → p1 → p2（r0 并行）→ r1 + r2 → r9 → t1 → ENG-town2-chunks → l1 → t3。并行：i1 / i2、p3、r3–r8 与全部人物任务。

## 14. 禁区

- 不得用 `onBeforeCompile` 修补 three 内置材质做建筑；不得在运行中设 `material.needsUpdate`（档位切换除外）。
- 不得用 BatchedMesh 合批整城静态建筑；不得在运行时做 CSG 布尔。
- 网格器不得 import three；规划器不得用浮点三角函数、`sqrt`、`pow`、`random`、`Date`。
- 不得按包围盒量人物身高（用 `HeadTop_End`）；不得用指数插值移动人物；不得把人物缩到非数据身高。
- 不得用 alpha 测试画格扇；不得让图像模型画字。
- 不得用 Tripo 生成建筑或道具；不得新增运行时 npm 依赖；不得改 `assets/default/**` 下已有文件（只新增）。
- 不得在测试里加"高负载跳过 / 放宽"；不得改已有门禁阈值或预算。
