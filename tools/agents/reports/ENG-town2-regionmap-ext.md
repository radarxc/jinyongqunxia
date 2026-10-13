# ENG-town2-regionmap-ext 报告 · 城镇探索 v2 · 区域地图增量 schema（chunk 三层、town-scene.v1、FacilityNpc / Exit / MeditationSpot、MapEntry.scene）+ core 解码
## 1. 摘要（3–6 行）
- `region-map.v1` 已增量接入 `surface / blocked / building` 三层、`surfaceTable / town` 与三类城镇对象；全部新字段可选。
- 新增严格 `town-scene.v1` 契约和建筑／设施／城墙载荷，并完成场景级引用与顺序闭合。
- `MapEntry.scene` 可选且可为 null，旧 `spawn` 原样保留；core 解码旧地图时保持原有 cell 对象形状。
- 返修已拆出独立 `gate-expr.ts`，四个相关 schema 模块可由原生 ESM 直接导入。
- 65 张现有 Tiled 地图、目标测试、内容构建／校验及全仓 `pnpm check` 均通过。
## 2. 产出（文件、行数、主要章节）
- 新增：`schemas/gate-expr.ts` 74 行、`town-scene.ts` 146 行、`region-map-town.test.ts` 158 行、`region-codec.test.ts` 57 行。
- 修改：`facility.ts` 85 行、`region-map.ts` 680 行、`world-map.ts` 152 行、`region-codec.ts` 128 行；`schemas/index.ts` 无需改。
- `pnpm install --frozen-lockfile`：通过，lockfile 已最新且未改；指定 Vitest：10 文件、60 测试通过。
- `content:build`：1770 对象／15 章；`content:validate`：1777 文件／1708 对象／2 Ink／65 地图通过。
- `pnpm check`：通过；212 文件、1621 测试，故事编译、生产构建、尺寸门与 dev chunks 均通过。
## 3. 关键结论与数值
- chunk：`surface` / `building` 各 1024 字节 u8，`blocked` 为 128 字节位图；无效槽三层必须为 0，blocked 位只能落在 valid 槽。
- `surface` 索引有序去重 `surfaceTable`；`building` 为按 Building.id 排序的 1 起序号，0 表示室外，最大值不得超过建筑数。
- `SURFACE_IDS` 为 tech/15 的 12 项；Building 增可选 `enterable / facilityKey / nameKey`，门格全场景唯一且首格在 footprint 外。
- 新对象严格校验 6 种 body template、u32 seed、交互距离 1–3、风险 0–10000 bp、打坐品质 0–2；Exit.spawnId 闭合 PlayerSpawn。
- `town-scene.v1` 校验安全整数 mm、半开非空 RectMm、floor/floorY 等长、floor 在旋转后占地内、站位 fixtureIdx>=200 零面积且不阻挡。
- town 建筑方案 ID／顺序与全场景 Building.id 排序完全一致；设施建筑和 FacilityNpc.facilityKey 均闭合。
- 一致处：全部实现 tech/15 §2.1–2.4；按协调者裁定原名导出场景 `TownSceneFacilitySchema`，内容 `TownFacilitySchema` 保持不变。
- 返修：`GateExpr` 移至无反向依赖模块且由 region-map 原名再导出；门格和 blocked／重复门格反例均断言目标 issue。
## 4. 开放问题（附默认值）
- `visualKit` 默认允许现有十套基础 kit 加可选 `:<variant>`；后续 buildkit 注册表落地后再做引用闭合。
- `TownBuildingPlan.parts` 按 tech/16 的 12 元组收紧；默认枚举范围 PartKind 0–7、RoofStyle 0–9。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；本任务只落实 tech/15 / tech/16 已定契约。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- 无；tech/15 §2.3 已按协调者裁定使用 `TownSceneFacilitySchema`。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 全部字段可选；65 张旧图逐张 compile + RegionMapSchema 校验，内容总门也报 65 map valid。
- ✅ 最小 2 建筑／1 设施／1 Exit／1 MeditationSpot 正例；7 个指定反例和 footprint 内门格反例均精准命中目标 issue。
- ✅ 原生 ESM 冒烟：region-map／world-map／town-scene／facility 直接动态导入均成功，无运行时循环。
- ✅ core 新层测试：`blocked=true` 令 `standable=false`；`building` / `surface` 原值透传；缺层快照逐字段不变。
- ✅ 冻结安装、指定 Vitest、content build、content validate、`pnpm check` 全部实际退出 0。
- ✅ TOOL-town2-compiler-core 交接：chunk 写 `surface`(视觉表索引)、`blocked`(有效格不可站位图)、`building`(Building.id 排序后的 1 起序号)。
- ✅ ENG-town2-explore-graph / walk 交接：`RegionCell.surface?: number`、`blocked?: boolean`、`building?: number`；0 building=室外，缺字段=旧图，blocked 不代表遮挡视线。
