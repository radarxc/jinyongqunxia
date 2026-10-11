# 本任务：城镇探索 v2 · core 逐 tick 行走——`world/travelTo | steer | stop`、10 Hz 推进、触发器、进出建筑、交互列表、`previewTravel`、读档纠偏 `reconcileMountedScene`

**第一个动作**：读 `tools/agents/reports/ENG-town2-kernel-prep.md` 与 `tools/agents/reports/ENG-town2-explore-graph.md` 的第 3、7 节（命令与 `ExploreWalkState` 形状、tick 钩子、`explore-handler.ts` 桩；`findPath / findPathToAny / snap` 的用法与 `dynamicRev`），再打开 `packages/core/src/world/explore/{types,tick,walk-validate}.ts`、`packages/core/src/command/explore-handler.ts`、`packages/core/src/command/region-handler.ts`（`trigger()` 与 `world/walkTo` 的进格逻辑）、`packages/core/src/world/region-runtime.ts`（`reachedRegionTriggers`、`projectRegionDynamic`），以及 `docs/tech/15-town-explore-v2-spec.md` §4.2、§4.3（交互距离表）、§4.6、§4.7；读完直接动手，不要先写计划。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md` 与 `packages/core/CLAUDE.md`（core 只用整数、禁 `/`、禁墙钟与隐式随机；validate 只读、O(1)；写入只经事务；不得在 tick 里重复跑 A*、不得整树复制推进行走）。

## 背景
作者 AR-114（2026-10-10，逐字）：「右上方应该提供小地图，点击小地图可以自动寻路。」现在区域 / 城镇的点击移动是"瞬移到终点、画面逐格补动画并锁输入、不能取消"。v2 改为 core 按 10 Hz tick 逐格推进：点哪走哪、路上随时改道或停下、按住 WASD 滑行；进格触发剧情触发器、进出建筑发事件；对话 / 战斗 / 换场景时停下。速度建议值步行 1.35 m/s、奔跑 4.5 m/s（每 tick 135 / 450 mm，每格 1155 mm）。

## 要做的事
1. **`world/explore/walk.ts` + `tick.ts`**（替换 kernel-prep 的空 `advanceExploreWalk`）：每个 `world/tick`（有 walk、世界未暂停）预算 `PACE_MM_PER_TICK[pace]`；下一格 = `path[1]`，steer 时取 `dir` 方向邻格，被挡依次试 `dir+1`、`dir+5`；一步代价 `HEX_STEP_MM × moveCost(next)`；每 tick 至多跨一个格边界。跨格边界时按当前占位与动态格复检这一步（不跑 A*），不通则发 `world/pathInterrupted { at, reason }` 并清 walk。进格顺序：① 定位与朝向 → ② 触发该格 `Trigger`（复用 region-handler 的 `trigger()`，`once` 的只触发一次）→ ③ 建筑序号变化时发 `world/buildingEntered / buildingLeft` → ④ 若开始了对话、战斗或待挂载则停步。到达发 `world/arrived`；目标是带 `interact` 的锚点时在同一事务里执行交互（交互本身沿用现有 `world/interact` 逻辑）。每 tick 只 `tx.set` `walk.progressMm`、`tx.splice` `walk.path`，不整体复制路径。
2. **`command/explore-handler.ts`**（替换桩）：`travelTo` 的 validate 为 O(1)（已挂载、不忙、目标存在），apply 跑**恰好一次**搜索（`hex` → `snap` + `findPath`；`anchor / building` → `findPathToAny`），无路 `abort(REGION_PATH_*)`；正在走一步时新路线保留这一步（先到正在进入的格，再从那里搜）。`stop`：走完当前这步再停。`steer { dir | null }`：覆盖已有路线；`null` 且无路线时清 walk。`pace` 缺省：距离 > 8 格 run，否则 walk。路径长度上限 `MAX_WALK_PATH = 512`。
3. **`world/explore/interactables.ts`**：按缓存图 + 对象的六角分桶索引在附近 O(n) 求出可交互物（≤ 8，按距离、r、q、id 排序），距离按 tech/15 §4.3 表且要视线（`blocked` 可透视）；`insideBuildingId` 由 chunk `building` 层按玩家位置推出。
4. **动态投影**（`world/region-runtime.ts` 的 `projectRegionDynamic` 扩展，或在 `explore/` 新增投影函数并由其调用）：`walk { path（前 64 格）, progressMm, stepMm, mmPerTick, destination }`、`insideBuildingId`、`interactables`、`worldTick`。
5. **`previewTravel`**（只读、会话级查询入口，导出给 app）：与 `travelTo` 同一搜索，返回路径前 64 格与代价，不写状态。
6. **`world/explore/reconcile.ts` `reconcileMountedScene(state, content) → { state, relocated }`**：场景内容没了 → 卸载回城节点；`playerHex` 不可站 → 按环 / (r, q) 找最近可站格，否则入口出生点；路线失效 → 丢弃 walk；纯函数，供会话读档时调用（会话接线是 session-v2）。
7. **入口** `entries/explore-command.ts`：导出处理器、tick 实现、`previewTravel`、`reconcileMountedScene`；注册 tick 钩子。

## 测试（`packages/core/src/world/explore/*.test.ts`、`packages/core/src/command/explore-handler.test.ts`，命名用例）
- **每次 `travelTo` 恰 1 次 A***（给 astar 模块加测试可见的调用计数器，或用 `vi.spyOn`）；之后 2000 个 tick 的步进中 A* 调用 0 次。
- 每 tick ≤ 1 个格边界；walk 135 mm/tick 走 1 格需 9 tick（1155 / 135 向上取整），run 3 tick。
- steer：被挡时按 `dir+1`、`dir+5` 顺序滑行；`steer null` 停。
- 触发器：路过的 `once` 触发器只触发一次，再路过不触发；触发器开启对话 → 行走停止且 walk 清空。
- 建筑：进屋发 `buildingEntered`、出屋发 `buildingLeft`，`insideBuildingId` 随之变化。
- 改道：走到一半发新 `travelTo` → 先完成当前这步再按新路线走；`stop` 走完当前步停。
- 忙碌：对话 / 战斗 / 待挂载中六个探索命令全拒 `REGION_INTERACTION_BUSY`。
- `pathInterrupted`：路上动态格变成不可走（模拟门关）→ 在格边界发事件并清 walk。
- `thenInteract`：走到 NPC 交互范围后同一事务启动对话。
- 交互列表：≤ 8、排序稳定、距离与视线规则（柜台 `blocked` 不挡、石壁挡）。
- 纠偏：删掉玩家所在格（改成墙）→ 重定位到最近可站格并 `relocated = true`；场景不存在 → 回城节点；路线经过的格不可走 → walk 丢弃。
- **回放确定**：同一命令序列跑两次，最终状态哈希与事件序列逐字节相同。

## 约束
- 只写：`packages/core/src/world/explore/{walk,tick,interactables,reconcile,walk-validate,types}.ts`（`types.ts` 只可新增，不改 kernel-prep 定的形状）、`packages/core/src/world/explore/*.test.ts`、`packages/core/src/world/region-{runtime,types}.ts`、`packages/core/src/command/explore-handler.ts`（+ 测试）、`packages/core/src/entries/explore-command.ts`、`packages/core/src/world/explore/astar.ts`（**只许**加测试可见的调用计数器）与本任务报告。
- 不改 `world/walkTo` 与旧 A*（退役前回放不变）；不改 `command/{index,bus,handlers}.ts`；不改 `packages/core/src/index.ts` 导出布局；不新增依赖。
- core 只用整数（无 `/`）、无墙钟与隐式随机、排序带比较器；工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。
- 计时门（tick P95）是 ENG-town2-perf-gates 的事，本任务不加计时断言。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm --filter @tianshu/core lint`
- `pnpm --filter @tianshu/core test`
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`

## 报告
`tools/agents/reports/ENG-town2-explore-walk.md`（≤ 70 行）：第 3 节写每 tick 推进规则、进格顺序、改道与停步语义、交互列表排序键、纠偏规则；第 6 节列 A* 计数与回放哈希实测；第 7 节写给 ENG-town2-explore-facility（店员交互 / 出口 / 打坐如何挂在交互与进格流程上）、ENG-town2-session-v2（`previewTravel` 与 `reconcileMountedScene` 的调用点、脏视图）与 ENG-town2-perf-gates（tick 夹具）的交接。
