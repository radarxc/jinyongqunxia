# tech/15 · 城镇探索 v2 · 引擎 / 数据 / core / 界面实现 Spec（交 traex 执行）

> 依据：作者 AR-114；方案 `docs/tech/14-town-explore-v2.md`（§3 决定表优先）；3D 侧契约 `docs/tech/16-town-3d-spec.md`。
> 本文是**实现契约**：目录、文件归属、数据格式、命令、存档、运行时 API、键位、预算、门禁与任务登记。执行器只改任务声明的文件；遇到本文没写的取舍，按 tech/14 的意图定并在报告里写明。
> 分工：traex（GPT-5.6-Sol，xhigh）写代码、跑 `pnpm check` 与 validate；Claude 每个阶段做验证（§13），作者看闸门。

## 目录

0. 术语、单位、坐标
1. 目录与文件归属
2. 数据契约
3. 编译器 v2
4. core：探索运行时、店铺、对话、存档
5. render：区域场景扩展与端口
6. 输入层
7. 界面
8. v1 过渡（P1 在现有城镇页）
9. 开关、切换与退役
10. 分块、预算与性能门
11. 校验命令缩写
12. 任务登记（P1 + P2 引擎线）
13. 阶段验收（协调者清单）
14. 禁区

---

## 0. 术语、单位、坐标

- **v1**：现有城镇栈（`town-runtime.v1`、`packages/render/src/town/**`、`TownPage.vue`、core `town/*` 命令）。**v2**：城镇并入区域引擎后的实现。
- **场景**：一个区域场景（RegionMap），城镇的场景 ID `sc_<NN>_town_<citySlug>`，`NN` 取布局章节号（例：`city_dali__ch01` → `sc_01_town_dali`；`city_turpan__ch10` → `sc_10_town_turpan`），满足现有 `RegionSceneIdSchema`（`^sc_(?:0[0-9]|1[0-5])_[a-z0-9]+(?:_[a-z0-9]+)*$`）。
- **世界坐标**：米，`x` 东、`z` 南、`y` 上；原点 = 六角 `(0,0)` 中心；六角中心换算与 `regionHexWorld()` 一致（pointy-top，外接圆 2/3 m：`x = 577.35·(2q + r)` mm，`z = 1000·r` mm；整数版 `round(57735·(2q+r)/100)`）。
- **方案坐标**：建筑方案里的长度一律整数毫米（mm），在同一世界坐标系下。
- **core 一律整数**：禁止 `/`、浮点规则状态、墙钟、隐式随机；整数除法用 `@tianshu/shared` 的 `floorDivInt()` / `ceilDivInt()`。
- **缩放**：「1 m 参考方形投影宽（CSS px）」，与 tech/02 §1.4 和现有 `RegionScene` 同单位（`metresPerCssPixel = √2 / zoom`）。

## 1. 目录与文件归属

| 层 | 新增 / 改动路径 | 归属任务（§12） |
|---|---|---|
| data | `packages/data/src/schemas/{region-map,town-scene,world-map,shop,facility,event-actions}.ts`；`packages/data/src/build/town/**`（编译器 v2）；`packages/data/src/build/town-plan/**`（规划器，tech/16）；`content/world/towns/**`；`content/town/{facilities,buildkits}/**`；`content/shops/**`；`content/common/economy/**` | regionmap-ext、shop-schema、compiler-core、sources-pipeline、pilot-content |
| core | `packages/core/src/world/explore/**`；`packages/core/src/command/{explore,shop}-handler.ts`；`packages/core/src/economy/shop-{pricing,query,locator,types}.ts`；`packages/core/src/entries/{explore-command,shop-command}.ts`；`packages/core/src/dialogue/**`（上下文）；`packages/core/src/state/**`（schema 4） | kernel-prep、explore-graph、explore-walk、explore-facility、shop-core、dialogue-facility |
| render | `packages/render/src/region/**`（扩展 + `ports/**`）；`packages/render/src/actors/heights.ts`；`packages/render/src/buildgen/**`、`packages/render/src/actor3d/**`（tech/16） | render-core、render-ports、heights |
| platform | `packages/platform/src/input/**` + `package.json` 子路径 `./input` | input-port |
| ui | `packages/ui/src/components/explore/{TxMinimap,TxContextActions,TxShop}*`；`packages/ui/src/explore/minimap-math.ts` | txminimap、txshop |
| app | `apps/game/src/input/**`；`apps/game/src/explore/**`；`apps/game/src/pages/{ExplorePage,ShopLayer}.vue`；`apps/game/src/runtime/**`（会话）；`apps/game/src/App.vue`（ActionMap、HUD、路由） | actionmap、shop-wire、v1-page、session-v2、explore-page |
| 构建 / 预算 | `apps/game/vite.config.ts`、`apps/game/build/{content-plugin,size-groups-plugin}.ts`、`tools/perf/**`、`vitest.config.ts`、根 `package.json` | chunks、perf-gates |

城镇投影从 `apps/game/src/runtime/session-projection.ts` 挪到新文件 `apps/game/src/runtime/explore-projection.ts`（大地图线也在改前者，少碰）。

## 2. 数据契约

全部为现有 schema 的**增量可选**字段；现有 65 张 Tiled 区域地图不改也必须继续通过校验。

### 2.1 大地图入口（`packages/data/src/schemas/world-map.ts`）

```ts
MapEntrySchema += { scene: z.strictObject({ regionId: RegionIdSchema, sceneId: RegionSceneIdSchema }).nullable().optional() };
```

- v2 入城取 `entry.gateId` 对应 `Exit.gateId` 的出生点 `spawn_<gateId>`；无 `gateId` 用主城门。`spawn` 字段废弃（保留只读）。
- 节点开放但 `scene === null` → core 拒绝 `MAP_NODE_CLOSED`，界面显示「城门紧闭」。旧 `sceneId: city_*` 字段到 v1 退役时删除。
- 删除 `apps/game/src/runtime/session.ts` 里"无运行时内容就克隆大理"的逻辑（L326–374，P3 `TOOL-town2-worldmap-all`）。

### 2.2 区域地图增量（`packages/data/src/schemas/region-map.ts`）

```ts
RegionMapChunkSchema += {
  surface?:  Base64U8x1024,      // 视觉地面索引 → map.surfaceTable（只给 render 与小地图）
  blocked?:  Base64Bits1024,     // 有效格、不可站、可通视（柜台 / 货架 / 摊位 / 室外杂物）
  building?: Base64U8x1024,      // 1 起的建筑序号（按 Building 对象 id 排序）；0 = 不在任何建筑内 → "在屋内"判定
};
RegionMapSchema += { surfaceTable?: SurfaceId[] /* 有序去重 */, town?: TownScene /* §2.3 */ };
export const SURFACE_IDS = ['rammed_earth','dirt_road','stone_slab','grey_brick','grass','water',
  'bridge_deck','plinth','wood_floor','brick_floor','threshold','wall_top'] as const;

BuildingObjectSchema += {            // 已有：footprint、interiorRect、roofGroup、cutawayWalls
  enterable?: boolean,               // cells := 门格（外侧街面格在前）；门格全场景唯一
  facilityKey?: LocalId, nameKey?: TextKey,
};
FacilityNpcObjectSchema = strictObject({ ...ObjectBase, class: literal('FacilityNpc'),
  facilityKey: LocalId, roleKey: LocalId, facing: HexDirection, interactRange: int(1, 3),
  appearance: strictObject({ template: BodyTemplateIdSchema, outfit: LocalId, seed: u32 }) });
ExitObjectSchema = strictObject({ ...ObjectBase, class: literal('Exit'), gateId: LocalId,
  spawnId: LocalId /* 门内 2 格的 PlayerSpawn */, side: enum(['north','east','south','west']), nameKey: TextKey });
MeditationSpotObjectSchema = strictObject({ ...ObjectBase, class: literal('MeditationSpot'),
  buildingId: LocalId.nullable(), riskBaseBp: int(0, 10000), quality: int(0, 2) });
```

编译器写入的格类：

| 格 | 地形 | 高度 | 其他 |
|---|---|---|---|
| 街巷、院子 | `tr_pingdi` / `tr_caodi` | 0 | |
| 河渠 | `tr_shenshui` | 0 | |
| 桥 | `tr_pingdi` | 0 | `surface = bridge_deck` |
| 建筑实体 | `tr_shibi` | 0 | 不透视、不可站 |
| 室内地面 | `tr_shinei` | 0 | |
| 柜台 / 货架 / 室外杂物 | `tr_shinei` / `tr_pingdi` | 0 | `blocked` 位（可透视） |
| 城墙 | `tr_chengqiang` | 6 | |
| 城外 | 无效槽 | | |

（200 份布局全是高度 0，已核。）

### 2.3 `town-scene.v1` 扩展（`packages/data/src/schemas/town-scene.ts`，由 `region-map.ts` 再导出）

```ts
export const TownSceneSchema = z.strictObject({
  schemaVersion: z.literal('town-scene.v1'),
  cityId: CityIdSchema, layoutKey: z.string() /* city_dali__ch01 */, displayNameKey: TextKey, historicalYear: Int,
  visualKit: VisualKitSchema,        // 'song_dali' | 'xiyu' | … ；变体见 tech/16 §4.3（如 xiyu:tang_buddhist）
  kitRef: z.string(),                // 引用编译后的 buildkit-runtime.v1（每套件一份，不在场景里重复）
  signAtlasRef: z.string().nullable(),
  source: z.strictObject({ source: z.string(), layout: z.string(), sha256: Sha256Schema }),
  frame: z.strictObject({ axialOrigin: z.strictObject({ q: Int, r: Int }), planningM: z.tuple([Int, Int]) }),
  facilities: z.array(TownSceneFacilitySchema),
  buildings: z.array(TownBuildingPlanSchema),   // 顺序与 id 同 Building 对象（render-only 载荷）
  walls: z.array(TownWallSchema),
});
// 场景里的设施条目；与内容文件 town-facilities.v1 的 TownFacilitySchema（packages/data/src/schemas/facility.ts）区分命名（协调者 10-11 裁定，避免 barrel 重名）
export const TownSceneFacilitySchema = z.strictObject({
  key: LocalId /* yaopu_01 */, kind: FacilityKindSchema, sub: LocalId.nullable(), buildingId: LocalId, nameKey: TextKey,
  shop: z.strictObject({ instanceKey: z.string() /* city_dali__ch01/yaopu_01 */, templateRef: LocalKey,
    kind: z.enum(['normal','famous','blackMarket']) }).nullable(),
  roles: z.array(LocalId).min(1), serviceCells: z.array(HexPos).min(1),
  hours: z.strictObject({ open: Minute, close: Minute }).nullable(),       // P4 才生效
});
export const TownWallSchema = z.strictObject({
  id: LocalId, points: z.array(z.tuple([Mm, Mm])).min(2), closed: z.boolean(), heightMm: Mm, thicknessMm: Mm,
  gates: z.array(z.strictObject({ seg: Int, offsetMm: Mm, widthMm: Mm, kind: z.enum(['gate','water']) })),
});
```

**建筑方案** `TownBuildingPlan`（与 tech/16 §2、§4 一致；规划器产出，编译器写入，render 消费；全部整数毫米）：

```ts
type Yaw4 = 0 | 1 | 2 | 3;                         // 前脸朝 S / W / N / E（由入口边决定）
type RectMm = readonly [x0: number, z0: number, x1: number, z1: number];   // 世界 mm，半开区间
type EntranceTuple = readonly [side: 0|1|2|3 /* 局部：0 前 1 左 2 后 3 右 */, offsetMm: number, widthMm: number];
type FixtureTuple = readonly [fixtureIdx: number, cxMm: number, czMm: number, wMm: number, dMm: number, yaw: Yaw4, blocks: 0 | 1];
// fixtureIdx ≥ 200 为站位（stn_keeper 店员 / stn_customer 顾客 / …），w = d = 0、blocks = 0、yaw = 朝向
interface TownBuildingPlan {
  id: string; archetype: string; kit: string; seed: number;
  footprint: readonly [cxMm: number, czMm: number, wMm: number, dMm: number];   // w 沿前脸；yaw 为奇数时世界范围互换
  yaw: Yaw4; storeys: 1 | 2 | 3;
  roof: readonly [style: number, eaveMm: number, ridgeMm: number];             // 台基顶以上
  entrances: readonly EntranceTuple[]; enterable: boolean;
  elev: readonly [baseYMm: number, platformMm: number];
  floors: readonly RectMm[]; floorY: readonly number[];                         // 一一对应
  fixtures: readonly FixtureTuple[]; parts?: readonly PartTuple[];              // 院落部件（tech/16 §4）
  signage: readonly [textKey: string, signStyleIdx: number] | null;
  facility: PlanFacilityKind;                                                  // tech/16 §4.2 的 22 种室内模板类；不同于 §2.5 的玩法设施类 FacilityKind（大类 + sub），映射归编译器
  finial?: 'tang_stupa';                                                        // 只在 xiyu:tang_buddhist 变体的寺院出现（tech/16 §4.3）
}
```

### 2.4 两条一致性规则（编译器与 render 测试都要校验）

1. **几何 ⊂ 方案**：低于 `floorY + 2200` 的实体几何只能落在「占地 − floors」或 `blocks = 1` 的家具矩形内；`floors` 保持净空（tech/16 INV-2）。
2. **室内 / 门格可走（C6）**：六角格心落在 floors 减阻挡家具内，且离任何实体边 ≥ 250 mm；两个可走格之间的移动，只有当两格边的中点在 floors 内或在占地外时才允许；高度 ≤ 250 mm 的矮杂物可不阻挡。**室内不用** design/22 §1.3 的六顶点法（会吃掉 1.2–1.6 m 宽的门洞）；室外仍用布局的 `runtime_hex_walkable`。

### 2.5 设施、店铺、对话内容

```yaml
# content/town/facilities/<layoutKey>.yaml（town-facilities.v1；按布局里稳定的 bi_* 绑定，v1 与编译器 v2 共用）
schemaVersion: town-facilities.v1
layoutKey: city_dali__ch01
facilities:
  - { key: yaopu_01, kind: shop, sub: yaopu, buildingId: bi_00xx, nameKey: town.city_dali__ch01.yaopu_01.name,
      shop: { templateRef: shop_tpl_yaopu, kind: normal }, roles: [keeper, clerk_01] }
  - { key: kedian_01, kind: inn, buildingId: bi_00yy, nameKey: …, shop: null, roles: [keeper, waiter_01] }
```

- `content/shops/shop_tpl_<sub>.yaml`（`shop-template.v1`）：沿用现有 `ShopDef.supply` 行（`itemId, maxGrade, baseStock, restockEveryDays, restockAmount, priceBp, condition?`），不带 `chapterId`，章节由上下文给。
- `content/common/economy/price-table.yaml`（`price-table.v1`）：design/10 §13.2 的 `P(cat, g)`，单位文；物品种类 → 列映射。
- `content/town/facility-dialogues.yaml`（`facility-dialogue.v1`）：`{ chapter, kind, sub?, roleKey, storyId, entryKey, condition? }`。
- `FacilityKind`：`shop | inn | tavern | teahouse | clinic | escort | casino | school | relay | manor | stall | temple | office | residence`；子类 `sub` 如 `yaopu | zahuo | tiejiang | chengyi | mashi | shushi | buzhuang | dangpu | qianzhuang | shitan`。
- **Ink**：`EVENT_ACTION_REGISTRY`（`packages/data/src/schemas/event-actions.ts`）新增呈现类动作 `facility/openShop`（无参数）；`dialogue/speaker` 增加 `interlocutor`（= 当前交谈对象）。

## 3. 编译器 v2（`packages/data/src/build/town/**`，`buildContent()` 内运行）

### 3.1 源文件
生产构建不读 design 文档。一次性工具 `tools/content/town_sources.ts` 把每份规格里运行时要用的部分抄进 `content/world/towns/<city>__chNN.yaml`：城墙折线与城门、视觉套件、显示名、历史年份、出现章节、设施文件路径、布局路径 + sha256。布局本体只读 `assets/default/town/<city>__chNN/layout.yaml`（基线大理 / 临安读 `assets/default/baseline/town/*.layout.yaml`）。

### 3.2 步骤
1. **坐标框**：轴坐标原点取布局 `runtime_partition` 的 q、r 下界；边界为槽数（≤ 256²）；建 32×32 chunk 网格。
2. **室外格**：从 `walk_layer.runtime_hex_walkable` 起；地形与 `surface` 取格心下的地面；水 / 桥按 §2.2；不可走的室外格置 `blocked`。
3. **建筑**：每栋调 `planBuilding(layoutBuilding, kit, seed, frame)`（tech/16 §4；规划器未合入前注入"盒子方案"兜底：占地四墙、正中一扇 1.4 m 门、整块 floors）。格心在占地内的格写 `building` 层；室内格按 §2.4 规则 2 判定；阻挡家具置 `blocked`；占地内其余格为 `tr_shibi`。
4. **门**：门的外侧格 = 离"门中心向外 600 mm"最近的格，并检查 6 步内接街；不成则回退布局的入口格。内侧格为相邻室内格；墙厚超过一格时开 `threshold`。门格全场景唯一；冲突时沿该边挪最多 ±3 m，仍冲突则失败并报两栋 ID。不可进入的建筑门格保持实体。
5. **城墙与城门**：取源文件；墙带高度 6、门洞可走；每座城门在外侧行放一个 `Exit`，门内 2 格放 `PlayerSpawn`（`spawn_<gateId>`）。
6. **设施与店员**：设施取设施文件（试点）或规则文件（P3）；方案里 `stn_keeper` → `FacilityNpc`（`interactRange` 2，隔柜台），`stn_customer` 及其相邻可走格 → `serviceCells`。
7. **其他对象**：客栈房间、寺庙佛前放 `MeditationSpot`（`riskBaseBp` 100 / 250，沿用 v1）；植被写 `chunk.decos`。
8. **输出**：规范排序 JSON；按输入哈希缓存到 `.cache/content-build`。

### 3.3 不变式（每条一个测试）
- **I1** 每栋可进建筑都有门，门格全场景唯一。
- **I2** 每个室内格都能从主城门出生点按区域行走边（tier 0）BFS 到达。
- **I3** 每个设施至少一个服务格在某个 `FacilityNpc` 的交互距离内且有视线。
- **I4** 每个 `Exit.spawnId` 都能解析到出生点。
- **I5** 场景 ≤ 256² 槽，原始 JSON ≤ 300 KB（design/11 单文件上限）。
- **I6** 同输入逐字节同输出；大理 ch01 的 sha 在测试里锁定。

不再依赖 45° 贴图，原先 v1 编译器拒收的约 37 份 song_north / liao_jin / xiyu 布局都应能编；吐鲁番布局里的类型名是 `bld_kit_song_dali_*`，视觉套件由源文件 `visualKit` 决定（tech/16 §4.3）。

## 4. core：探索运行时、店铺、对话、存档

### 4.1 探索图与 A*（`packages/core/src/world/explore/{graph,heap,astar,snap}.ts`，纯函数）
- `getExploreGraph(map, qgTier, swim, dynamicRev)`：以冻结的地图对象为键 WeakMap 缓存；稠密 `width × height` 下标上的类型化数组：高度、地形下标、标志（可站 / 窄 / 危险 / 不透视 / blocked）、移动代价、坡道位、建筑序号。不进存档。
- 边集必须与现有 `regionEdges()` **完全一致**（坡道、高差、轻功跨沟）；用 Tiled 夹具做等价测试。
- A*：二叉堆存 `Int32` 节点号；g / parent / closed 数组用代数计数复用，每次搜索不清零；堆序键 f → h → r → q；邻居按 `HEX_DIRECTIONS` 顺序展开，严格更优才替换父节点；单位占格；目标永不是被占格。
- 多目标搜索（走到锚点 / 建筑）：`h = max(0, hexDistance(n, anchor) − range)`；目标集 = 范围内有视线的可站格。
- 吸附（点空地）：围绕目标走环 0..4，按 (r, q) 取第一个与玩家同一无向连通分量的可站格，再跑 A*；最多试 6 个候选，否则 `REGION_PATH_BLOCKED`。
- 旧 `world/walkTo` 在退役前继续用旧 A*（回放不变）；退役时 `walkTo` 变成 `travelTo{hex}` 的别名，`RULES_PROTOCOL` 升 4，删旧 A*。

### 4.2 行走模型（`world/explore/{walk,tick}.ts`、`command/explore-handler.ts`）

```ts
export type Pace = 'walk' | 'run';
export type TravelTarget = { kind: 'hex'; hex: HexCoord } | { kind: 'anchor'; anchorId: string } | { kind: 'building'; buildingId: string };
export type ExploreCommand =
  | { t: 'world/travelTo'; target: TravelTarget; pace?: Pace; thenInteract?: boolean }
  | { t: 'world/steer'; dir: HexDir | null; pace?: Pace }
  | { t: 'world/stop' }
  | { t: 'world/meditate'; anchorId: string; plannedTicks: 600 };
export interface ExploreWalkState {                 // MountedRegionState.walk（SAVE_SCHEMA 4）
  path: readonly HexCoord[];                        // path[0] === playerHex，≤ MAX_WALK_PATH = 512
  progressMm: number; pace: Pace; steer: HexDir | null;
  goal: { kind: 'hex' } | { kind: 'anchor'; anchorId: string; interact: boolean } | { kind: 'building'; buildingId: string };
}
export const HEX_STEP_MM = 1155;                    // √3·(2/3 m)
export const PACE_MM_PER_TICK = { walk: 135, run: 450 } as const;   // 10 Hz → 1.35 / 4.5 m/s【建议值】，闸门 C 调
```

- **每个 tick**（`world/tick` 且存在 walk、世界未暂停）：预算 `PACE_MM_PER_TICK[pace]`；下一格 = `path[1]`，steer 时取 `dir` 方向邻格，被挡依次试 `dir+1`、`dir+5`；一步代价 `HEX_STEP_MM × moveCost(next)`；由于 450 < 1155，每 tick 至多跨一个格边界。
- **跨格边界**：按当前占位与动态格复检这一步，不通则发 `world/pathInterrupted {at, reason}` 并清 walk。
- **进格顺序**：① 定位与朝向；② 触发该格上的 `Trigger`（复用 `region-handler.ts` 的 `trigger()`）；③ 建筑序号变化时发 `world/buildingEntered` / `world/buildingLeft`；④ 若开始了对话、战斗或待挂载则停步。
- **到达**：发 `world/arrived`；目标是带 `interact` 的锚点时在同一事务里执行交互。
- 每 tick 只 `tx.set` `walk.progressMm`、`tx.splice` `walk.path`，不整体复制路径。
- **命令**：`travelTo` 的 validate 为 O(1)（已挂载、不忙、目标存在），apply 跑一次搜索，无路则 `abort(REGION_PATH_*)`；正在走一步时，新路线保留这一步（先到正在进入的格，再从那里搜）。`stop`：走完当前这步再停。`steer`：覆盖已有路线。对话 / 战斗 / 待挂载期间，所有探索命令拒绝 `REGION_INTERACTION_BUSY`（同时修掉 v1 对话中仍可移动的问题）。时间代价就是经过的 tick 数（design/11：1 实秒 = 1 游戏分钟）。

### 4.3 交互、设施、出口、打坐、进出城
- **在屋内**：由 chunk `building` 层按位置推出；投影字段 `insideBuildingId`；`interactables` 由缓存图 + 对象的六角分桶索引在附近 O(n) 求出。
- **交互距离（都要视线）**：

  | 对象 | 距离 |
  |---|---|
  | `FacilityNpc` | `interactRange`（1–3） |
  | `NpcSpawn`、`Door`、`Chest`、`Exit` | 1 |
  | `MeditationSpot` | 0 |

  `blocked` 格可透视；`tr_shibi` 与无效槽挡视线。
- **店员交互**：按（章节、设施类、子类、`roleKey`）查 `facility-dialogue.v1`，以上下文 `{kind:'facility', sceneId, facilityKey, roleKey, shopKey}` 启动对话。
- **出口**：交互 `Exit`，或站在出口格时 `worldmap/leave` → `leaveSceneTx`：把场景实体与动态格存进 `world.sceneMemory`（≤ 16 条，按 `sceneId` 排序）→ 卸载 → 位置回到城节点。
- **入城**：`worldmap/enter` 遇到 v2 城（`entry.scene` 存在且会话已预载其内容）→ 原子挂载到 `spawn_<entry.gateId>`（或主城门），并恢复 `sceneMemory`。取代 `createTownState()`（它忽略了 gate 与 spawn，`handlers.ts` L81–95）。
- **打坐**：`world/meditate` = 把 `resolveTownMeditation` 移植到 `MeditationSpot`，同一风险与伏击事务、同一世界 RNG；与 v1 夹具对拍。
- **ShopLocator v2**：玩家在设施所属建筑内，或在其任一 `serviceCell` 2 格内。

### 4.4 店铺（`economy/shop-{pricing,query,locator,types}.ts`、`command/shop-handler.ts`）

```ts
type ShopCommand =
  | { t: 'shop/buy';  shopKey: string; itemId: string; count: number; expectedUnitPrice: number }
  | { t: 'shop/sell'; shopKey: string; itemId: string; count: number; expectedUnitPrice: number };
// 拒绝：SHOP_UNKNOWN | SHOP_NOT_HERE | SHOP_CLOSED | SHOP_ITEM_UNAVAILABLE | SHOP_STOCK_INSUFFICIENT
//       | SHOP_MONEY_INSUFFICIENT | SHOP_PRICE_STALE | SHOP_INVENTORY_FULL | SHOP_BUSY
interface ShopView { instanceKey: string; nameKey: string; facilityKind: FacilityKind; money: number; nextRestockDay: number;
  offers: { itemId: string; stock: number; unitBuyPrice: number; maxGrade: number;
            reason: null | 'SHOP_STOCK_INSUFFICIENT' | 'SHOP_MONEY_INSUFFICIENT' }[];
  buys: { itemId: string; owned: number; unitSellPrice: number }[] }
```

- **参考价**：`item.price` 有 1,522 件是 `'auto'`、83 件为 `null`、没有数字；`'auto'` 按价目表（design/10 §13.2，按物品种类映射列）解析，价目表单元为 0 表示无参考价（§13.2 的「—」），与 `null` 一样不可买卖。
- **店铺实例键**：`<layoutKey>/<facilityKey>`（如 `city_dali__ch01/yaopu_01`）；设施条目若带显式 `shop.instanceKey` 则优先，由一个集中函数派生。
- **定价上下文**：`worldTier` 取 `ChapterDef.worldTier`；`townLevel` 取大地图节点 `levelRange[0]`；魅力、口才取主角（口才缺省 0）；取整沿用 `round10(x) = 10·floor((x+5)/10)`。
- **库存**：店铺状态按 `instanceKey` 懒建在 `chapter.shops`；补货沿用 `ShopRuntime` 节奏，**不耗 RNG**；运行时用"模板 + 章节上下文"拼出 ShopDef，取代 `ShopDef.chapterId` 检查。
- **防过期**：`expectedUnitPrice` 与当前单价不符 → `SHOP_PRICE_STALE`。
- **ShopLocator v1**（过渡，随 v1 退役）：`chapter.town.buildingPhase === 'inside'`，且设施文件把（布局，`buildingId`）映射到该店。
- 测试向量：design/12 QST-T21（买价 44,977 文）、QST-T22（卖价 19,912 文）。

### 4.5 对话
- `GameState.dialogue.context?: { kind: 'facility'; sceneId; facilityKey; roleKey; shopKey | null; interlocutorNameKey }`（`interlocutorNameKey` 启动时从设施内容取 authored 名字键，投影只读它，不拼猜；10-11 协调者裁定）。对话中本就拒绝存档（`DIALOGUE_SAVE_UNAVAILABLE`），无需迁移，只改形状校验。
- `facility/openShop`：从对话上下文解析店铺，产生呈现步 `{ op: 'shop/open', shopKey }`；非设施语境报 `DIALOGUE_INTENT_REFERENCE`。
- v1 过渡：`town/interact` 在设施建筑内改为启动该设施的对话（取代 `town/shopRequested` 事件；`businessRef` 指营生不指店铺）。

### 4.6 存档与协议
- **`SAVE_SCHEMA` 4**（kernel-prep）：迁移 3→4 补 `mountedRegion.walk = null`、`world.sceneMemory = []`；`RULES_PROTOCOL` 不变。
- **读档纠偏** `reconcileMountedScene(state, content)` 取代 `townRevision` 哈希检查（`session-projection.ts` L43 遇到任何内容改动即抛错）：场景没了 → 卸载回城节点；`playerHex` 不可站 → 按环 / (r, q) 找最近可站格，否则入口出生点；路线失效 → 丢弃；返回 `relocated` 供界面提示。
- **v1 退役时**：`SAVE_SCHEMA` 5——若 `chapter.town` 非空，转为 `worldMap.scene = null`、人在城节点，再删除该字段；`RULES_PROTOCOL` 4（`walkTo` 别名）。各一个迁移测试。

### 4.7 Worker 装配与投影
- `apps/game/src/runtime/core-dispatch.ts` 懒加载命令族：`shop/*` → `@tianshu/core/shop-command`；`world/travelTo|steer|stop|meditate` → `@tianshu/core/explore-command`（并再导出 `regionHandler`）；`world/tick` 只在 `mountedRegion.walk` 存在时走探索 tick 处理器（按状态选择，确定）。
- 脏视图：`world/tick` → `['hud']`，tick 前后有行走时加 `'region'`；探索命令 → `['region']`；`shop/*` → `['hud','inventory']`。
- 动态投影新增：`walk { path（前 64 格）, progressMm, stepMm, mmPerTick, destination }`、`insideBuildingId`、`interactables`（≤ 8，按距离、r、q、id 排序）、`worldTick`。静态投影新增 `surfaceTable`、`town`，每次挂载只发一次。
- 会话级只读查询：`world/previewTravel {target}`（悬停，节流 8 Hz）、`shop/query {shopKey}`。
- 控制器：用正式的 `controller.exploreCommand` 取代 `apps/game/src/region/commands.ts` 里把 `townCommand` 强转的写法。

## 5. render：区域场景扩展与端口

```ts
interface RegionScene /* 新增 */ {
  setZoomPx(px: number, animate?: boolean): void;
  getCameraBasis(out: Float32Array): void;          // [rightX, rightZ, upX, upZ] 地面基向量（给小地图）
  getViewGroundQuad(out: Float32Array): void;       // 视野在地面上的四边形 8 个数
  setWalk(walk: ExploreWalkView | null, worldTickAtMs: number): void;   // 按 tick 航位推算，匀速插值
  setPreviewPath(path: readonly HexPoint[]): void; setDestination(hex: HexPoint | null): void;
  setInsideBuilding(index: number | null): void;
  pickActor(clientX: number, clientY: number, bounds: DOMRect): string | null;
  pickBuilding(clientX: number, clientY: number, bounds: DOMRect): string | null;
}
interface BuildingLayerPort { create(input: BuildingLayerInput): Promise<BuildingLayer> }   // 实现见 tech/16 §6
interface ActorPort { spawn(id: string, look: ActorLook): void; despawn(id: string): void;
  setPose(id: string, x: number, y: number, z: number, yawRad: number, motion: 0 | 1 | 2, speedMps: number): void;
  setEquipment(id: string, eq: ActorEquipment): void; update(dt: number, camera: Camera): void;
  pick(r: Raycaster): string | null; restore(): void; dispose(): void; readonly stats: ActorStats }  // tech/16 §9
```

- 镜头：临界阻尼弹簧 ω = 10、屏幕中央 20% 死区、沿移动方向前瞻 0.8 m、边界内缩 3 m（tech/02 §1.8）；固定 dt 下可复现（测试）。
- 室内：core 投影 `insideBuildingId` 变化 → `setInsideBuilding()` → 端口 `setCutaway()`；CameraHint 缩放 96（相对 80 的 1.2）。render 不自己判"在屋内"。
- 删除 `loadPilotModel(…, 3.4)`（`region/scene.ts` L114、`town/scene.ts` L98）与指数插值移动（`region/scene.ts` L302）；身高取 `packages/render/src/actors/heights.ts`（AR-104 表；主角缺省男 1.81、女 1.66）。
- 占位端口（`packages/render/src/region/ports/**`）：盒子壳 + 剖切三态 + 试点 GLB 真实身高，使 core / app 不被 tech/16 阻塞；接口与正式实现一致、可替换、`dispose()` 可重复调用。
- 稳态 `render()` 零分配（测试用分配探针）。

## 6. 输入层

### 6.1 `@tianshu/platform/input`（新子路径；不带 Dexie 的根入口不变）
按 `event.code` 记按住的键；发出按键沿事件（含修饰键、可编辑目标、输入法组字标记）；窗口失焦 / 页面隐藏时释放全部；滚轮 `deltaMode` 0 / 1 / 2 归一；捏合识别；点按与拖动区分（≤ 250 ms 且 ≤ 10 px）。≥ 12 个用例。

### 6.2 ActionMap（`apps/game/src/input/action-map.ts`）
上下文栈（高优先在前）：`modal > dialogue > areaMap > explore > worldmap > global`；页面用 `useActionContext()` 注册；战斗页暂留自己的监听（`BattleField.vue` L605，P4 再迁），战斗场景激活时 ActionMap 不处理。

| 动作 | 键（`event.code`） | 语境 | 规则 |
|---|---|---|---|
| zoomIn / zoomOut / zoomReset | `Equal`（允许 Shift，即 `+`）、`NumpadAdd` / `Minus`、`NumpadSubtract` / `Digit0`、`Numpad0` | explore、areaMap | 带 Ctrl / Meta / Alt 忽略（保留浏览器缩放）；复位到语境默认（街巷 80、室内 96） |
| rotateLeft / rotateRight | `KeyQ` / `KeyE` | explore | `allowRotation=false` 时弹提示；v1 页不启用 |
| move（按住） | `KeyW/A/S/D`、方向键 | explore | 屏幕向量 → `screenVectorToHexDir(v, cameraBasis)` → `world/steer`，只在变化时发、转镜头后重发；v1 页仍一键一步 |
| interact | `KeyF`、`Space`、`Enter` | explore | 作用于聚焦的可交互物（缺省最近）；焦点在按钮 / 输入框时跳过 |
| toggleAreaMap | `KeyM` | explore、areaMap | 其他语境保持现有 `m → journey`（`App.vue` 全局键） |
| back | `Escape` | 全部 | 先关最上层：弹窗 → 全城图 → 页面 |
| 页面 / 开发台 | `KeyC/B/K/J`、`Backquote` | global | 现有行为不变 |
| stop | 画布右键 | explore | 发 `world/stop`（design/26：右键只取消） |

`isComposing`、目标为 `input / textarea / select / contenteditable` 时忽略；离散动作忽略按键重复；永不拦截 F5。

### 6.3 ZoomController（`apps/game/src/input/zoom.ts`）
- 单位 px / 1 m 参考宽；键盘与按钮在 `[48, 64, 80, 96]` 档间切换；滚轮与捏合在 `[40, 112]` 连续。
- 一个订阅同步：键、滚轮、滑杆、外圈按钮与 `scene.setZoomPx()`。
- 语境默认值按 `insideBuildingId` 在街巷 80 / 室内 96 间切换；玩家手动缩放后保持，直到语境变化。
- v1 页：把 px/m 档位换算成 v1 的 `setZoom` 比例（v1 的倍率随画布高度变，换算在 `apps/game/src/explore/v1-zoom.ts`，退役即删）。

## 7. 界面

### 7.1 HUD 布局（design/26 §3.1 / §4.7）
- 顶栏中部：时辰 · 地点 · 银两（银两从右上 `App.vue` L733–745 挪来；室内地点显示店名）；探索场景右侧 240 px 留空。
- 右上：`TxMinimap`（桌面 200 px、≤ 844 px 宽 132 px），外圈指北针、`+` / `−`、展开（M）。
- 右下：`TxContextActions`，≤ 3 个文字动词（交谈 / 进入 / 出城 / 打坐 / 查看 / 打开），带 F 提示；对话中隐藏。
- App 层：`DialogueLayer`（已有）+ 新 `ShopLayer`。
- 全城图、店铺或菜单页打开时，经 `setSceneRunsWorldTicks` 暂停世界 tick。
- 删除：`town-panel`、`town-help` 文字、页内统计行（统计挪开发面板）。

### 7.2 TxMinimap（`packages/ui/src/components/explore/TxMinimap.vue`）

```ts
interface MinimapProps {
  base: { bitmap: ImageBitmap | HTMLCanvasElement; minX: number; minZ: number; metresPerPx: number } | null;
  player: { x: number; z: number; headingRad: number } | null;   // 世界米（x 东、z 南）
  basis: Float32Array | null;     // render.getCameraBasis() 的地面基向量
  viewQuad: Float32Array | null;  // render.getViewGroundQuad()
  markers: readonly { id: string; kind: 'facility' | 'exit' | 'npc' | 'quest' | 'meditation'; x: number; z: number;
    icon: string; label: string; target: { kind: 'anchor'; anchorId: string } | { kind: 'building'; buildingId: string } }[];
  path: Float32Array | null; destination: { x: number; z: number } | null;
  northUp: boolean; expanded: boolean; sizePx: number;
}
// emits: travel({ kind: 'point', x, z } | MarkerTarget)、toggleExpanded()、zoom(±1)、toggleNorthUp()
```

- **朝向**：缺省跟镜头转（屏幕上方 = 小地图上方），用 `basis` 变换，界面层不做三角运算；指北针指世界北（−z）。设置 `minimapNorthUp` 切上北下南。
- **底图**：每次挂载在空闲回调里由 `apps/game/src/explore/minimap-base.ts` 画一次（0.25 m/px，≤ 640 px）：v2 用 chunk `surface` / `blocked` / `building` 层 + 方案占地按设施类着色；v1 用 `groundRuns`、水、建筑占地。
- **标记层**：第二张 canvas，预分配缓冲；只在投影变化（≤ 10 Hz）或镜头旋转中重画；重画零分配（测试用 spy）。
- **点击**：空地 → 世界点 → 立方取整成六角（`apps/game/src/explore/hex-world.ts`，只做呈现换算）→ `world/travelTo {hex}`（吸附在 core）；v1 页发 `town/move`（不可达即被拒，v1 不吸附）。点标记 → `travelTo {anchor | building}`。
- **悬停**：名称 + 直线距离；停留 > 300 ms 预览路线（`world/previewTravel`）。
- **样式与可达性**：宣纸墨晕圆盘、羽化边缘，无黑底无框（AR-48）；标记是可聚焦列表（回车即前往）；命中半径 ≥ 44 px，触屏 ≥ 60 px。
- **全城图（M）**：上北下南覆盖层，含图例与可点击的设施列表。

### 7.3 TxContextActions / TxShop / ShopLayer
- `TxContextActions`：入参 `{ id, verb, label, enabled, reason, hotkey }[]`，发 `act(id)`；应用把 `interactables`（v2）或锚点 + 设施（v1）映射进来。
- `TxShop`：入参界面自有的 `ShopPanelView`（行：图标、品阶、单价两 / 文、库存、持有数、禁用原因），买 / 卖页签、数量步进；发 `buy` / `sell {itemId, count, unitPriceWen}` 与 `close`（Esc 亦关闭）；**自己不改钱**。
- `ShopLayer.vue`（App 层）：收到 `shop/open` 呈现步时打开；查 `shop/query`、发 `shop/buy|sell`，每次回复后重查。
- 新界面文案放 `<组件>.strings.ts`，不改 `packages/ui/src/i18n.ts`。

### 7.4 删除的模拟（`apps/game/src/pages/TownPage.vue`，以 WIP 基线为准）
本地货品与银两 `1280`、开场即弹的李文秀对话、「市肆采买 / 与同行交谈 / 打开店铺」三个按钮、对话 article 与店铺弹窗、40 ms `setInterval` 渲染、对 `/img/li*.webp` 与 `/img/hero_cutout.png` 的引用。验收：这些标识 grep 为零。「与同行交谈」改为队伍功能（P4 `ENG-party-talk`：头像 → 交谈 → `party/talk`，core 校验）。

## 8. v1 过渡（P1 在现有城镇页）

- 身高：v1 页的 3D 主角按性别取 1.81 / 1.66 m；45° 贴图建筑是按真实尺寸画的，正确身高的人站在旁边**会显得小，这是对的**，不要为了"看着合适"缩放主角；比例问题由 P2 的 3D 建筑彻底解决。
- 缩放：ActionMap + ZoomController 驱动 v1 的 `setZoom`（换算见 §6.3）。
- 小地图：v1 适配器（底图取 `groundRuns` 与建筑占地），点击发 `town/move`。
- 店铺：`town/interact` 在设施建筑内 → 设施对话 → `facility/openShop` → `ShopLayer`；ShopLocator v1。
- 交互条：锚点 + 设施映射成 `TxContextActions`。

## 9. 开关、切换与退役

- **开关** `townEngine: 'v1' | 'v2'`：设置、开发面板、URL `?town=`；闸门 C 前缺省 `v1`。它只决定会话预载哪份内容（v2 场景叶子或 v1 `content/town/*.json`）；core 按内容是否存在选择引擎，保持确定。
- **共存期存档**：在 v2 城里存的档，无论开关如何都按 v2 挂载（挂载中的区域内容总会加载）。
- **闸门 C 后**：缺省 `v2`；P3 编译全部城镇；然后 `ENG-town2-retire-v1` 删除：`town-runtime.v1` schema、core 城镇运行时与处理器、`./town` 入口、`render/town`、`TownPage`、`RegionPage`（ExplorePage 接管遗迹）、`content/town/*.json`、`tools/content/town_runtime.py`、开关本身。

## 10. 分块、预算与性能门

| 分块 / 尺寸组 | 内容 | 预算 KiB gzip |
|---|---|---|
| `render` | three + 共用 render + 战斗 | 180 → **170**（拆出后） |
| `render-explore`（新） | `packages/render/src/region/**` + 占位端口 | 32 |
| `render-town-legacy`（新，退役即删） | `packages/render/src/town/**` | 14 |
| `render-buildgen` / `render-buildgen-worker`（新） | tech/16 生成器 | 40 / 24 |
| `render-actor3d`（新） | tech/16 人物端口 | 16 |
| `render-meshopt`（新） | MeshoptDecoder（城镇减面人物用；放进 battle-model3d 会超其 24 KiB） | 8 |
| `explore-ui`（新尺寸组） | ExplorePage + TxMinimap + TxContextActions + TxShop + ShopLayer + `apps/game/src/explore/**` | 45 |
| `core-explore` / `core-shop`（Worker 懒加载） | `explore-command` / `shop-command` 入口 | 24 / 8 |
| `session` | 不变 110（目标 ≤ 92）；新增断言：静态闭包不含 `world/explore/**`、`economy/shop-*` | — |
| 路由 `webglExploreRoute`（新） | entry + render + rig + explore + buildgen + actor3d + meshopt + dressup | 420 |

`apps/game/vite.config.ts` 会把任何 id 含 `/three/` 的模块归入 `render`，新增 addon 后在构建输出里复核落点。

**性能门**（只进 perf 项目 / `pnpm check:perf`；三轮最优 P95；打印 loadavg 与 CPU 数；不跳过、不放宽）：

| 门 | 夹具 | 阈值 |
|---|---|---|
| `packages/core/bench/explore-path.performance.test.ts` | 确定性合成城 219×160 槽：约 2.05 万可站格（含室内）、100 栋 | 建图 P95 ≤ 25 ms；200 对随机寻路 P95 ≤ 3 ms、最大 ≤ 10 ms；对角 P95 ≤ 5 ms；多目标与吸附 P95 ≤ 3 ms |
| `packages/core/bench/explore-tick.performance.test.ts` | 同一城，一条横穿全城的行走 | `world/tick`（含动态投影）P95 ≤ 1.0 ms / 2000 tick；单纯步进时 A* 调用 0 次 |
| `packages/render/src/region/explore.performance.test.ts` | 35 chunk、100 占位建筑、40 占位人物 | 帧更新 CPU P95 < 0.6 ms；预热后 600 帧堆增长 < 64 KiB |

非计时、进 `pnpm check` 的结构测试：编译场景 ≤ 300 KB、确定性 sha、draw call 计数。另把 `packages/core/bench/world-tick.test.ts`（计时测试却在普通项目里）挪进 perf 项目。

## 11. 校验命令缩写

| 代号 | 命令 |
|---|---|
| **Vb** | `pnpm install --frozen-lockfile` · `pnpm check` · `python3 tools/lint/check_ids.py --strict` |
| **Vc** | Vb + `pnpm --filter @tianshu/core lint` + `pnpm --filter @tianshu/core test` |
| **Vd** | Vb + `pnpm --filter @tianshu/data test` + `pnpm content:build` + `pnpm content:validate` |
| **Vu** | Vb + `pnpm --filter @tianshu/ui test` |
| **Vr** | Vb + `pnpm --filter @tianshu/render test` + `pnpm --filter ./apps/game build` |
| **Va** | Vb + `pnpm --filter ./apps/game test` + `pnpm --filter ./apps/game build` |
| **Vp** | Vb + `pnpm --filter @tianshu/platform test` |
| **Vs** | `pnpm content:compile-story` + `pnpm content:test-compile-story` |
| **Vperf** | `pnpm check:perf`（协调者在负载低时跑，AR-33 / AR-64） |

每个任务的提示词都写明：命名测试用例必写；不改写集外测试；不降门禁或预算；新界面文案放 `<组件>.strings.ts`。

## 12. 任务登记（P1 + P2 引擎线）

写集为仓库相对 glob；并行任务写集不相交；热点文件（`App.vue`、`session.ts`、core 命令文件、`content-plugin.ts`、`budgets.json`、`check_size.mjs`、`vitest.config.ts`、根 `package.json`、`main.ts`、`vite.config.ts`）每波只给一个任务。执行器 traex GPT-5.6-Sol xhigh；标「Claude」的按 AR-110 由协调者实现。

### P1（→ 检查点 G0）

| ID | 范围 | 依赖 | 写集 | 校验 | 关键验收 |
|---|---|---|---|---|---|
| ENG-town2-input-port | §6.1 | — | `packages/platform/src/input/**`、`packages/platform/package.json` | Vp | ≥ 12 例：按 code 记按住、忽略重复、修饰 / 可编辑 / 输入法标记、失焦与隐藏释放、deltaMode 0/1/2、捏合比例、点按 vs 拖动 |
| ENG-town2-shop-schema | §2.5 四个 schema、`facility/openShop`、`interlocutor`、注册表交叉引用 | — | `packages/data/src/schemas/{shop,facility,event-actions,index}.ts`、`packages/data/src/content-registry.ts`、`packages/data/src/build/discover.ts`、`packages/data/src/shop-facility.test.ts` | Vd | 正反夹具；引用闭合（物品、故事、建筑）；动作拒收参数 |
| ENG-town2-txshop | §7.3 `TxShop` | — | `packages/ui/src/components/explore/TxShop*` | Vu | 行与禁用原因；步进边界；发出预期单价；Esc 关闭；不改 props |
| ENG-town2-txminimap | §7.2 + `TxContextActions` + 小地图数学 | — | `packages/ui/src/components/explore/{TxMinimap*,TxContextActions*}`、`packages/ui/src/explore/minimap-math.ts`（+ 测试） | Vu | 两种朝向世界 ↔ 画布往返；点击发世界点；命中半径 44 / 60；重画零分配；4 偏航指北针角度 |
| ENG-town2-heights | AR-104 身高表；`playerHeightM` / `npcHeightM`；删两处 3.4 m | — | `packages/render/src/actors/heights.ts`（+ 测试）、`packages/render/src/town/{scene,types}.ts`、`packages/render/src/region/{scene,types}.ts` | Vr | 缺省 1.81 / 1.66；加载器归一到给定身高 |
| ENG-town2-kernel-prep | 命令与拒绝码定型（`economy/shop-types.ts`、`world/explore/types.ts`）、处理器桩、Worker tick 钩子、校验钩子、`SAVE_SCHEMA` 4 + 迁移、core-dispatch 懒加载命令族 | shop-schema | `packages/core/src/command/{index,bus,handlers,shop-handler,explore-handler}.ts`、`packages/core/src/economy/shop-types.ts`、`packages/core/src/world/explore/{types,tick,walk-validate}.ts`、`packages/core/src/dialogue/context-validate.ts`、`packages/core/src/state/**`、`packages/core/src/entries/{shop-command,explore-command}.ts`、`packages/core/package.json`、`packages/core/src/**/*.golden.json`、`apps/game/src/runtime/core-dispatch.ts`、`apps/game/src/{runtime,storage}/*.test.ts` | Vc + Va | schema 4 下现有测试全绿；3→4 迁移测试；命令族懒加载 |
| ENG-town2-actionmap | §6.2–6.3；App 全局键迁入 | input-port | `apps/game/src/input/**`、`apps/game/src/App.vue`、`apps/game/src/app-flow.test.ts` | Va | 键位表测试（Shift+`=`、Ctrl+`=` 忽略、输入法、输入框）；上下文优先级；档位 / 滚轮 / 夹取；4 偏航 × 8 方向映射；C/B/K/J/M/Esc/反引号不变 |
| DES-town2-pilot-content | 价目表；6 类店铺模板（药铺、杂货、铁匠、成衣、马市、食摊）；三个试点设施文件；店名（原创扩展）；ch01 / ch10 设施 Ink | shop-schema | `content/common/economy/**`、`content/shops/**`、`content/town/facilities/**`、`content/story/ch01/story_ch01_facility.*`、`content/story/ch10/story_ch10_facility.*` | Vd + Vs | 每个 `buildingId` 存在于布局；每个 Ink 结点以 `facility/openShop` 或 END 收尾 |
| ENG-town2-shop-core | §4.4（含 ShopLocator v1） | kernel-prep | `packages/core/src/economy/shop-{pricing,query,locator,types}.ts`（+ 测试）、`packages/core/src/command/shop-handler.ts`（+ 测试）、`packages/core/src/entries/shop-command.ts` | Vc | QST-T21 / T22 向量；3 天补货；原子回滚；`PRICE_STALE`；`NOT_HERE`；不耗 RNG；同命令同状态哈希 |
| ENG-town2-dialogue-facility | §4.5 + v1 `town/interact` → 设施对话；对话中拒绝 v1 城镇命令 | kernel-prep | `packages/core/src/dialogue/**`、`packages/core/src/event/event-executor.ts`、`packages/core/src/command/{story-handlers,handlers}.ts`、`packages/core/src/world/town-runtime.ts`（+ 测试） | Vc | 启动时写上下文；`openShop` 步带解析后的店铺键；非设施语境拒绝；说话人投影；v1 interact → `dialogue/started` |
| ENG-town2-shop-wire | 会话 `shop/query` 与命令；`shop/open` → ShopLayer；银两挪顶栏；v1 投影 `facility`；城镇投影挪进 `explore-projection.ts` | shop-core、dialogue-facility、txshop、pilot-content | `apps/game/src/runtime/{session,contracts,explore-projection}.ts`、`apps/game/src/game-controller.ts`、`apps/game/src/pages/ShopLayer.vue`（+ 测试）、`apps/game/src/App.vue`、`apps/game/src/style.css` | Va | happy-dom 全流程：大理 v1 → 进药铺 → 交谈 → 看看货 → 买金创药；银两与背包变化来自 core |
| ENG-town2-v1-page | §7.4 删模拟；explore 语境（缩放键 / 滚轮 / 档位、M、F）；v1 小地图适配器（点击 → `town/move`）；交互条；按性别身高；设置 `minimapNorthUp` | txminimap、actionmap、heights、shop-wire | `apps/game/src/pages/TownPage.vue`、`apps/game/src/pages/town-input.ts`（+ 测试）、`apps/game/src/explore/**`、`apps/game/src/settings.ts`（+ 测试） | Va | 模拟标识 grep 为零；缩放键测试；小地图点击派发移动；经店员对话真实购买 |

### P2 引擎线（E）

| ID | 范围 | 依赖 | 写集 | 校验 | 关键验收 |
|---|---|---|---|---|---|
| ENG-town2-regionmap-ext | §2.1–2.3 schema + codec 认 `blocked` / `building` | — | `packages/data/src/schemas/{region-map,town-scene,world-map}.ts`、`packages/data/src/region-map-town.test.ts`、`packages/core/src/world/region-codec.ts`（+ 测试） | Vd + Vc | 现有 Tiled 地图全部仍有效；反例：重复门格、未知 `spawnId`、层长度错误、建筑序号越界 |
| ENG-town2-chunks | §10 全部新块与预算、尺寸组；`packages/render` 导出 `./buildgen`、`./actor3d`；perf 测试注册；发布 `assets/default/buildkit/**` 与 `assets/default/model3d/*/town/**`；换装索引加 `townFile`；类型契约测试（含 tech/16 INT-01） | — | `apps/game/vite.config.ts`、`apps/game/build/{content-plugin,size-groups-plugin,dressup-assets,asset-manifest}.ts`、`tools/perf/{budgets.json,check_size.mjs,check_size.test.mjs,README.md}`、`packages/render/package.json`、`vitest.config.ts`、根 `package.json`、`apps/game/src/town-contract.test.ts` | Va | 新块产出；`render` ≤ 170；新行 `pnpm size` PASS；无孤块 |
| ENG-town2-explore-graph | §4.1 纯函数 | regionmap-ext | `packages/core/src/world/explore/{graph,heap,astar,snap}.ts`（+ 测试） | Vc | 300 张种子随机图上与暴力 Dijkstra 同最优；3 个夹具定序金样；与 `regionEdges` 边集等价；缓存同一性；仅整数 |
| TOOL-town2-compiler-core | §3.2 步骤 1–8；`planBuilding` 可注入 + 盒子兜底 | regionmap-ext | `packages/data/src/build/town/**` | Vd | 大理 ch01、大理 ch10、吐鲁番 ch10 布局过 I1–I6 |
| ENG-town2-render-core | §5 场景 API：px 缩放、弹簧跟随、航位推算、路线带与终点、基向量与视野四边形、地面层占位色 | chunks、heights、regionmap-ext | `packages/render/src/region/**` | Vr | 固定 dt 弹簧可复现；死区与边界；沿路线插值；4 偏航视野四边形；稳态 `render()` 零分配 |
| ENG-town2-explore-walk | §4.2 + 交互列表 + `previewTravel` + `reconcileMountedScene` | kernel-prep、explore-graph | `packages/core/src/world/explore/{walk,tick,interactables,reconcile,walk-validate,types}.ts`（+ 测试）、`packages/core/src/world/region-{runtime,types}.ts`、`packages/core/src/command/explore-handler.ts`（+ 测试）、`packages/core/src/entries/explore-command.ts` | Vc | 每次 `travelTo` 恰 1 次 A*（计数器）；每 tick ≤ 1 格边界；steer 滑行顺序；触发器只触发一次；对话打断行走；`BUSY` 拒绝；回放确定；纠偏重定位 |
| TOOL-town2-sources-pipeline | §3.1 三个试点源；`buildContent` 发现并编成区域叶子；缓存 | compiler-core、pilot-content | `tools/content/town_sources.ts`（+ 测试）、`content/world/towns/**`、`packages/data/src/build/{pipeline,discover,types}.ts`、`packages/data/scripts/**` | Vd + Va | 应用构建含大理 ch01 场景叶子（例 `sc_01_town_dali`）；第二次构建命中缓存 |
| ENG-town2-render-ports | 两个端口的占位实现 | render-core | `packages/render/src/region/ports/**`、`packages/render/src/region/scene.ts` | Vr | 剖切三态随 `insideBuilding` 与偏航变化；端口可替换；`dispose()` 幂等 |
| ENG-town2-explore-facility | §4.3：店员对话、出口 / `leaveSceneTx` + 场景记忆、打坐移植、v2 入城到 `spawn_<gateId>`、ShopLocator v2、`thenInteract` | shop-core、dialogue-facility、explore-walk | `packages/core/src/world/explore/{facility,exit,meditation}.ts`（+ 测试）、`packages/core/src/command/{explore-handler,handlers}.ts`、`packages/core/src/world/worldmap-runtime.ts`、`packages/core/src/economy/shop-locator.ts` | Vc | 入城挂载在 `spawn_south_gate`；出城回节点；再入城保留已消耗触发器；打坐与 v1 夹具对拍 |
| ENG-town2-perf-gates | §10 三个性能门注册进 perf 项目与根脚本；挪走 `world-tick.test.ts` | explore-graph、explore-walk、render-core | `packages/core/bench/explore-*.ts`、`packages/core/bench/world-tick*.ts`、`packages/render/src/region/explore.performance.test.ts`、`vitest.config.ts`、根 `package.json` | Vb + Vperf | 不进 `pnpm check`；`check:perf` 通过 |
| TOOL-town2-worldmap-pilot | `tools/content/worldmap_from_towns.py` 为已编译场景写 `entry.scene` / `gateId` | sources-pipeline、regionmap-ext | `tools/content/worldmap_from_towns.py`、`tools/content/test_worldmap_from_towns.py`、`content/world/ch*/map.yaml` | Vd + py unittest | 试点节点指向其场景，其他节点不变 |
| ENG-town2-session-v2 | 开关；`worldmap/enter` 前预载 v2 场景叶子；行走 tick 脏视图；`previewTravel`；读档纠偏提示；`exploreCommand` | explore-facility、sources-pipeline、worldmap-pilot | `apps/game/src/runtime/**`、`apps/game/src/game-controller.ts` | Va | Worker 与主线程跑同一城镇行走脚本哈希一致（transport-determinism 模式）；读档重定位提示 |
| ENG-town2-explore-page | `ExplorePage.vue`（v2 城镇 + 遗迹，开关后）：按住走、点地 / 点人 / 点楼、Q/E、缩放、F、M；v2 小地图适配器；App 路由 | session-v2、render-ports、v1-page | `apps/game/src/pages/ExplorePage.vue`（+ 测试）、`apps/game/src/explore/**`、`apps/game/src/App.vue` | Va | 脚本流程：走 → 谈 → 买 → 出城；按住 W 只发一次 steer、松开发 `null` |
| ENG-town2-pilot-integration（Claude） | 接入 tech/16 的生成器 / 人物 / 规划器 / 地面纹理；试点修整；截图脚本与性能报告 → 闸门 C | explore-page + tech/16 r10、a3、p4、l2 | `apps/game/src/explore/**`、`apps/game/src/pages/ExplorePage.vue`、`packages/render/src/region/**`、`packages/data/src/build/town/**`、`tools/agents/capture_town_pilot.mjs`、`tools/agents/reports/ENG-town2-pilot.md` | Va + Vperf | 闸门 C 清单（tech/14 §7） |

P3 / P4 的任务在闸门 C 后按 tech/14 §6 再登记。

## 13. 阶段验收（协调者清单）

- **G0（P1 合入并主干后）**：5173 现有城镇页——`=`、`-`、`0` 与滚轮按档缩放；小地图显示、随（v1 固定 45°）方位、点击后主角走过去；主角身高 1.81 / 1.66 m；进药铺 → 交谈 → 看看货 → 买一件，顶栏银两与背包变化（来自 core，读档后仍在）；模拟标识 grep 为零；`pnpm check` 全绿；9223 无头桥截图发作者。
- **每波**：集成分支 `pnpm check`；负载低时 `pnpm check:perf`；任务报告第 3 节的实测数字与产物一致。
- **闸门 C**：见 tech/14 §7。

## 14. 禁区

- 不得在 render / app 里算路径、可达、交互合法性、店铺价格；只消费投影、发意图。
- 不得用 `structuredClone` / 整树复制推进行走；不得在 tick 里重复跑 A*。
- 不得在 core 用浮点、`/`、墙钟、`Math.random`、无比较器排序。
- 不得在测试里加"高负载跳过 / 放宽"；不得改已有门禁阈值或预算（只能新增块与新预算）。
- 不得改 `assets/default/**` 里已有文件（编译器只读布局）；不得新增运行时 npm 依赖（tech/14 §5）。
- 不得为了"看起来合适"把主角缩到非数据身高。
