# ENG-town2-render-core 报告 · 城镇探索 v2 · render 区域场景扩展（px 缩放、弹簧跟随、航位推算、路线带、基向量与视野四边形）

## 1. 摘要（3–6 行）

完成 region 场景的 40–112 px/m 缩放、200 ms 动画与旧 `setZoom` 兼容。
完成按 core tick 的匀速航位推算、限速转身、临界阻尼跟随、死区/前瞻/边界夹取。
完成预分配路线带、终点标记、零分配小地图几何、室内态占位接口与占位拾取。
完成四类 surface 占位色；返修后的定向 41 条及全仓 2124 条测试通过。

## 2. 产出（文件、行数、主要章节）

- 修改 `types.ts` 198 行、`index.ts` 50 行：新增兼容接口、类型与导出。
- 新增 `explore-motion.ts` 215 行、`path-layer.ts` 148 行：移动/镜头几何与固定容量路线层。
- 修改 `scene.ts` 969 行：缩放、跟随、行走、路线、几何查询、状态和拾取集成。
- 修改 `terrain.ts` 701 行：可选 surface 解码、四类占位色及 shader 选择；无层时保留旧噪声字节。
- 新增/修改 6 个测试文件，共 1063 行；覆盖数学属性、集成、资源生命周期、源码与堆采样。
- `pnpm install --frozen-lockfile`：通过；锁文件无变化。
- 定向 Vitest：7 文件 / 41 测试通过（4.03 s）；render typecheck：通过。
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`：253 文件 / 2124 测试通过；内容 1793 文件、1720 对象、4 ink、65 地图；size 通过（render-explore 13.26/32 KiB，render 152.14/170 KiB gzip）。

## 3. 关键结论与数值

- 与文档一致：`zoomPx=clamp(px,40,112)`，`setZoom(scale)=setZoomPx(80×scale)`；动画为 200 ms smoothstep，减少动效瞬切，CameraHint 仍为 `80×zoom`。
- 弹簧：ω=10，`v+=(−2ωv−ω²(x−target))dt; x+=vdt` 半隐式欧拉，子步 ≤1/60 s；120 帧复跑逐值相同且阶跃无超调。死区为屏幕中央 20%，前瞻 0.8 m，边界内缩 3 m。
- 航位推算：`progressMm + mmPerTick×clamp((frameMs−worldTickAtMs)/100,0,1)`；首段按 `stepMm` 映射到 1155 mm 几何边，其后每格 1155 mm，末端夹取；朝向 ≤`3π rad/s`（540°/s）。
- 基向量 `[rightX,rightZ,upX,upZ]`：45° `[.7071,-.7071,-.7071,-.7071]`；135° `[.7071,.7071,.7071,-.7071]`；225° `[-.7071,.7071,.7071,.7071]`；315° `[-.7071,-.7071,-.7071,.7071]`。
- 1280×720、zoom 80、30°：`m/px=√2/80`，手算/实测宽 22.6274 m、深 25.4558 m；原点四边形依次为 45° `[-17,-1,-1,-17,17,1,1,17]`，135° `[1,-17,17,-1,-1,17,-17,1]`，225° `[17,1,1,17,-17,-1,-1,-17]`，315° `[-1,17,-17,1,1,-17,17,-1]`。
- 路线层预分配 `(512−1)×12` 顶点，只覆写同一 `Float32Array`；终点与各 GPU 资源有单一持有者。`PilotModel.dispose()` 覆盖正常、重复与销毁后加载完成竞态，材质/纹理均只释放一次。
- 堆采样：分配负例可检出增长；预热 2000 帧后，从 `render`/`setWalk` 根统计完整子树，600 帧连续窗口达到 3 次 region 归因字节不增长。无新增外部版本/API/价格事实，未作联网核实。

## 4. 开放问题（附默认值）

- 默认 `worldTickAtMs` 是页面收到该 core tick 投影时的单调时钟时间；若后续投影携带权威 tick 时间戳，应直接改用权威值。
- `scene.ts` 969 行、`terrain.ts` 701 行超过“源码尽量 ≤400 行”软建议；默认由端口任务抽离建筑/拾取后再拆，避免本任务扩大边界。
- 全仓构建出现既有 `localhost:3000 ECONNREFUSED` 与缺素材警告但退出码为 0；默认不在本任务处理。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无；实现遵循 tech/02、tech/15 与既有 `region-static.v1` 可选扩展契约。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `apps/game` 页面装配：接入 `setWalk(walk, worldTickAtMs)`、缩放快捷键和小地图输出缓冲复用。
- ENG-town2-render-ports：建筑层接管室内剖切与 actor/building 拾取。
- ENG-town2-perf-gates：将 region 帧更新纳入统一计时夹具；本任务不改 `tools/perf/**`。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 新旧缩放 API、CameraHint、200 ms/减少动效、弹簧/死区/前瞻/边界、Q/E 不跳均实现并测试。
- ✅ 10 点等距（±0.5 mm）、跨格拐角、末端夹取、null 格心、540°/s 均测试；`scene.ts` 无 `lerp(` 和 `3.4`。
- ✅ 路线 ≤512、终点、四偏航正交基/四边形、占位拾取、四 surface 色与旧行为均测试。
- ✅ 四条指定命令、`git diff --check` 均通过；改动仅在授权路径，未新增依赖、未改锁文件。
- ✅ 给 render-ports：`setInsideBuilding(index)` 当前只存状态；端口接入时离开旧建筑调用 `setCutaway(oldIndex, 0)`，进入新建筑调用 `setCutaway(newIndex, 2)`，并同步相机偏航；拾取改为委托 actor/building 端口。
- ✅ 给页面装配：接收 core tick 投影时以 `performance.now()` 记录 `worldTickAtMs`；小地图持有并复用 `Float32Array(4/8)`，在 render/resize/yaw 后调用两个 getter。
- ✅ 给 perf-gates：以固定投影、预热后帧循环测 `setWalk+render`；堆采样已验证稳态窗口零增长，计时断言放 `check:perf`。
- ⚠️ 单文件行数软建议未完全满足；功能、类型、全仓测试与分块预算门均已通过。
