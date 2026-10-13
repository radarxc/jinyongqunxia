# ENG-town2-explore-walk 报告 · 城镇探索 v2 · core 逐 tick 行走（travelTo / steer / stop、触发器、进出建筑、交互列表、previewTravel、读档纠偏）
## 1. 摘要（3–6 行）
- 已实现 10 Hz core 行走、改道／停步／方向滑行、逐边动态复检、到达及同事务交互。
- 进格复用旧 `world/interact` 触发器语义，补齐 once、剧情停步、建筑进出事件与动态投影。
- 已实现缓存分桶交互列表、只读 `previewTravel`、纯函数 `reconcileMountedScene` 与公开入口。
- 最终 core 64 文件/653 例、全仓 275 文件/2293 例及完整 `pnpm check` 均通过。
## 2. 产出（文件、行数、主要章节）
- 行走：`walk.ts` 54、`tick.ts` 136、`walk-validate.ts` 211、`explore-handler.ts` 92 行；`astar.ts` 仅加 12 行测试计数器。
- 投影／纠偏：`interactables.ts` 78、`reconcile.ts` 70 行；扩展 `types.ts`、`region-{runtime,types}.ts`、`entries/explore-command.ts`。
- 测试：新增 `explore-handler.test.ts` 246、`interactables.test.ts` 74、`reconcile.test.ts` 52 行。
- `pnpm install --frozen-lockfile`：通过（lockfile 已最新，0.96 s）；core lint：通过；core test：64/64 文件、653/653 例（3.84 s）。
- 最终 `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`：退出 0；275/275 文件、2293/2293 例（测试阶段 116.68 s）。
- 内容：1793 文件、1720 对象、4 Ink、65 地图；故事测试 4/4，3 条线/2 章编译；dev chunks 981/manifest 101。
- size：session 104.33/110 KiB、core-explore 4.90/24、explore-ui 19.01/45、render-explore 13.26/32，均 PASS。
## 3. 关键结论与数值
- 每 tick 加 `walk/run=135/450 mm`；边长 `1155×moveCost`，保留越界余量但最多跨一边；平地分别 9/3 tick。
- 边界按最新动态地形与占位复检，不跑 A*；失败发 `world/pathInterrupted` 并清 walk。
- 进格顺序：位置／朝向 → 复用 `regionHandler` 触发器 → buildingLeft/Entered → 忙碌停步；到达后可同事务 interact。
- `travelTo` validate 只查挂载／忙碌／目标；apply 恰一次搜索；半步改道保留当前边，`stop` 完成当前边，steer 依次试 dir/+1/+5。
- 缺省距离大于 8 边 run，否则 walk；存档路径上限 512，投影／预览只给前 64 格。
- 交互列表上限 8，排序键 `distance,r,q,id`；FacilityNpc 1–3、常规对象 1、MeditationSpot 0，blocked 透视、石壁／无效槽遮挡。
- 纠偏：场景缺失则回城节点；当前位置失效按环再 `(r,q)` 找最近可站格，否则卸载；任一路线边失效即丢 walk。
- 一致处：整数 mm、事务细粒度写入、旧 trigger/interact、动态覆盖、O(1) 缓存索引和一次 A* 均按 tech/15。
- 偏离处：无。
## 4. 开放问题（附默认值）
- `dynamicTiles` revision 按数组内容精确检测；稳定内容命中无分配，增删改都会重建图。
- building 目标默认取 `Building.cells[0]`（schema 保证 enterable 建筑首格为门外格）。
- 为兼容已存在 app 夹具，新增动态投影字段在 TS 接口暂为 optional；生产投影始终全部给出。
- `world/meditate` 仍由 ENG-town2-explore-facility 实现；当前统一返回 `REGION_INTERACTION_UNSUPPORTED`。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；实现 AR-114 与 tech/15 §4.2、§4.3、§4.6、§4.7。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- 无需改设计文档；A* 计数实测：一次 `travelTo=1`，随后 2000 tick 增量 `0`。
- 回放实测：两次事件 canonical JSON 逐字节相同；最终状态 SHA-256=`4240302a8fb3b54f78062794072ad58ebea25f50823ebaa7139fdb80ab0a09d6`。
- 热路径实测：一次 `travelTo` 后 2000 tick 的 A* 增量为 0；稳定地图／对象／占位索引的重建增量也为 0。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 只改写集；`git diff --check` 通过；无依赖、lockfile、门禁阈值、旧 `world/walkTo` 改动。
- ✅ travel/steer/stop、once／剧情停步、建筑、动态中断、thenInteract、交互 LOS／排序、三类纠偏均有命名断言。
- ✅ 六探索命令在对话／战斗／待挂载统一 busy 测试沿用 kernel-prep；源码无隐式随机、墙钟、禁用数学或原生除法。
- ✅ tick 无 A*；walk 只细粒度 set/splice；缓存图、对象分桶及动态投影格视图，不逐 tick 复制整树。
- ✅ ENG-town2-explore-facility：把 FacilityNpc／Exit／MeditationSpot 处理挂到 `world/interact`；出口也可在进格流程发离场意图。
- ✅ ENG-town2-session-v2：懒加载入口调用 `previewTravel`；读档发布前调用 `reconcileMountedScene`，relocated/丢 walk 后标 region 动态视图脏。
- ✅ ENG-town2-perf-gates：复用 10 Hz tick 夹具与 A* 计数器；计时断言只放 `check:perf`。
