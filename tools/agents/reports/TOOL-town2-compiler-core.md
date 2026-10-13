# TOOL-town2-compiler-core 报告 · 城镇探索 v2 · 城镇编译器 v2 核心（布局 → 区域场景、门、城墙城门、设施店员、I1–I6）

## 1. 摘要（3–6 行）

- 已实现纯函数 `compileTownScene(input, deps)`，按 tech/15 §3.2 的 1–8 步生成 `region-map.v1 + town-scene.v1`。
- 已复用 `town-plan/frame.ts` 与可注入 `planBuilding`；缺省规划器和固定 p0 盒子测试规划器各自验证。
- 三城原始设施键不改写，直接通过 RegionMap schema、I1–I6、300 KB / 256² 与默认规划器检查。
- 门槛只沿最终门中心逐相邻边开到首个室内格；I2 只沿真实区域边 BFS；I6 在入口独立编译两次。
- 城墙输入/输出均保留带 `id` 的数组；陆门生成 Exit/Spawn，水门开不可站水洞。
- 全量 `pnpm check` 通过；未改 schema、管线、规划器、内容或资产。

## 2. 产出（文件、行数、主要章节）

- `packages/data/src/build/town/`：26 个 TS/YAML、2920 行；入口/类型、frame、outdoor、buildings、doors、walls、facilities、extras、emit、invariants。
- `__fixtures__/`：三城 `town-source.v1`、三份最小设施、固定 `box-planner.ts`；布局读取工作区真实 YAML 并校验布局 SHA。
- 测试覆盖三城原始输入/schema/I1–I6、固定种子 C6、厚墙直通/偏移/折线拒绝、墙 ID、门冲突、注入、设施与城门内外侧。
- `pnpm install --frozen-lockfile`：通过，8 个 workspace、lockfile 无改动。
- 指定 Vitest：15 文件、212 测试通过；`pnpm --filter @tianshu/data typecheck` 退出 0。
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`：退出 0；278 文件、2317 测试；1793 文件/1720 对象/4 Ink/65 地图、故事、构建、尺寸门均通过。
- 中间两次全量运行仅写集外 `scene-allocation.test.ts` 分配采样抖动失败；单文件 2/2 通过，最终原命令全量通过，未改/放宽该门禁。

## 3. 关键结论与数值

| 场景        |   槽数 | 可站格 | 室内格 | 建筑/可进 | 门格挪位 | JSON 字节 | SHA-256 前 12 位 |
| ----------- | -----: | -----: | -----: | --------: | -------: | --------: | ---------------- |
| 大理 ch01   | 12,576 |  3,453 |  1,045 |     36/23 |        1 |   179,524 | `126d3273bc34`   |
| 大理 ch10   | 12,576 |  6,665 |    360 |     19/15 |        0 |   167,818 | `da107029cfd9`   |
| 吐鲁番 ch10 | 22,400 |  7,838 |  1,115 |     49/39 |        0 |   185,504 | `60cd4b9193b6`   |

- 大理 ch01 固定盒子规划器完整 SHA：`126d3273bc346115c2d9d2530ef8c98d11bb1783cffe86e816112eeb2cd77a78`；本次因城门内外侧行语义修正更新。
- 一致：整数 mm、格心减 250 mm 净空、边中点连通、±3,000 mm 门位搜索、`kitRef`/`visualKit` 分离、canonical JSON。
- 技术决定：挪门后同步 plan entrance；keeper 锚在规划 station（可在 floor 外），serviceCells 单独取可达格；深水输出 `RegionWater(kind=deep)`。
- 偏离：无；`town.city_dali__ch01.yaopu_01.name` 等原始键逐字进入规划器与输出。

## 4. 开放问题（附默认值）

- 三份测试设施是最小两设施夹具，规划器尚无 `stn_keeper/customer` 时记录 fallback；默认靠门内格服务，生产设施由后续管线读取完整七设施文件。
- 大理 ch10 源无城墙；默认在首个可走边界对生成 `road_entry` 的 Exit/Spawn，并记录 `TOWN_SYNTHETIC_ENTRY`。
- 大理 ch01 `bi_0023` 门沿边挪 -1000 mm；其余试点无需挪门，保留诊断供内容侧调整。
- 水格源未给流向/岸距；默认 `deep / flowDir:null / shoreDistance:null`。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无；文本键契约已由集成基点 995f9ebfc 统一。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `docs/tech/15` §3.1 / 后续源管线应明确 `walls[]` 保留源 `id`；无墙城市允许空数组并由编译器生成 `road_entry`。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ TOOL-town2-sources-pipeline：入口 `compileTownScene({layout,source,sourcePath,facilities},{kit,planBuilding?})`；source 来自 `content/world/towns`、布局/设施来自其引用。缓存键须含源、布局、设施、kit 哈希及 `TOWN_COMPILER_VERSION`。
- ✅ ENG-buildgen-p2：可直接替换缺省 `planBuilding`；三城 schema/I1–I6 测试继续跑。只有注入 `__fixtures__/box-planner.ts` 的大理 ch01 SHA 锁不受 p2 默认方案变化影响；若改变编译器输出语义才更新锁值并说明。
- ✅ ENG-town2-explore-walk：`building` 是 Building.id 排序后的 1 起索引，0 为室外；`blocked` 不挡视线，`tr_shibi`/无效槽挡视线；FacilityNpc 用 `facilityKey/roleKey`，交互距固定 2，目标取设施 serviceCells。
- ✅ 每个可进建筑恰一唯一门格；±3 m 挪位同步 `TownBuildingPlan.entrances`，render 门洞与 passage 对齐；不可解时错误/诊断含两栋 ID。
- ✅ C6 6×5 盒子手算 13 格；mulberry32 覆盖 4 yaw × 3 亚格偏移；1.4 m/厚墙直通，实体墙/折线拒绝。
- ✅ I1–I6 各有正反例；I2 仅沿 `canTraverseBuildingEdge()` 相邻边；入口 I6 用两次独立编译并可被非确定规划器触发。
- ✅ `stn_keeper` 保持规划 station 坐标（含 floor 外柜台区），服务格另选可达室内格；FacilityNpc 交互距 2 且 I3 成立。
- ✅ 源码均 <400 行；无新增依赖、无越界修改、无仓库状态变更命令；`git diff --check` 通过。
