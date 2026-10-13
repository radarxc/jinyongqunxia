# ENG-town2-render-ports 报告 · 城镇探索 v2 · render 两个端口的占位实现（盒子壳 + 剖切三态、试点 GLB 真实身高）并接进区域场景
## 1. 摘要（3–6 行）
已实现并接入可替换的 `BuildingLayerPort` / `ActorPort`；场景不判断室内，只转发 core 给出的建筑索引。
占位建筑按方案尺寸生成门洞外壳与屋顶，三态、四偏航、250 ms 抖动淡出和幂等资源生命周期已覆盖。
占位人物按 URL 单次解析并克隆，使用 `headTop` 真实身高、匀速移动、540°/s 转身、胶囊拾取与实例圆影。
默认人物加载器与 `SkeletonUtils` 均二级懒加载；最终全仓门禁及 32 KiB `render-explore` 预算通过。

## 2. 产出（文件、行数、主要章节）
- 新增 `region/ports/`：`types.ts` 50 行；建筑实现/测试 213/56 行；人物实现/测试 167/50 行；替换接线测试 45 行。
- 修改 `region/scene.ts` 850 行、`types.ts` 206 行、`scene.test.ts` 483 行、`scene-allocation.test.ts` 215 行；移除旧建筑盒/rig/单主角模型支路。
- `pnpm install --frozen-lockfile`：通过，锁文件无变更、already up to date（0.65 s）；render typecheck 通过。
- region 定向：10 files / 54 tests，通过，4.76 s；严格分配探针要求连续 3×600 帧采样字节完全不增长。
- `TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`：通过；276 files / 2318 tests，106.79 s；1793 内容文件、1720 对象、4 Ink、65 地图有效。
- 构建 749 modules / 18.73 s；`render-explore` 16.74/32 KiB、`render-model3d` 17.85/24 KiB，dev chunks PASS（983 assets / 102 manifest）。

## 3. 关键结论与数值
| 端口 | 方法 | 占位实现 |
|---|---|---|
| `BuildingLayerPort` | `create` | 输入直接复用 `buildgen` 的 `BuildingLayerInput`，返回同一 `BuildingLayer` 契约 |
| `BuildingLayer` | `setCutaway/setCameraYaw/setFocusOcclusion/update/pick/restore/dispose/ready/occludes/measure` | 每格外壳+屋顶 2 draw；态 2 另有全屏暗角 1 draw；`dispose` 幂等 |
| `ActorPort` | `spawn/despawn/setPose/setEquipment/update/pick/restore/dispose/stats` | URL Promise 缓存；共享几何/材质；每人物独立骨架/动画；圆影合为 1 draw |
- 建筑状态纹理 `256 × ceil(units/256)` RGBA8：R 屋顶、G 剖墙；门洞 ≥1.2×2.1 m；剖墙终高 1.0 m；动画 0.25 s；暗角 0.30。
- 四偏航实测：45°→`S|E`=9，135°→`S|W`=3，225°→`N|W`=6，315°→`N|E`=12。
- 人物胶囊半径 0.35 m、高=`heightM`；1.66 m 头顶误差测试 ≤0.005 m；转身上限 `3π rad/s`。
- 步态沿用 `battle/model-stage.ts`：walk=`0.6/0.98`、run=`2.1/0.98` 身高/秒；播放率 `speed/(hps×heightM)` 夹 `[0.80,1.45]`。
- 与文档一致：render 只消费索引、端口可替换、GLB/addon 留在懒加载块。装配缝偏离：静态视图尚无方案/套件，暂由可选 `buildingInput` 注入。

## 4. 开放问题（附默认值）
- `RegionStaticView` 尚不携带 `BuildingLayerInput`；默认值为空建筑层，试点页面应从编译 town 数据传 `buildingInput`。
- `setEquipment` 已保留正式契约，占位模型不换装；默认忽略视觉装备，正式 actor3d 端口接管。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；本任务未发现需要修改设计基准的冲突。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `ENG-town2-explore-page` / 页面装配：传编译后的 `buildingInput`，维护 `plan.id → index` 映射并转发 `insideBuildingId`。
- `ENG-buildgen-r9-layer`、`ENG-actor3d-a2-port` / 正式整合：按本文端口签名提供实例，无需修改区域场景调用面。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 写集/契约/分层：仅声明路径有改动；类型从 buildgen 再导出；无新依赖、无 core 合法性计算。
- ✅ 建筑：三态、四偏航、250 ms/减少动效、门洞、2 建筑 draw、拾取/量测/遮挡、恢复与双 dispose 均有数值断言。
- ✅ 人物：5 NPC 单解析、1.66 m、匀速±1%、540°/s、播放率、胶囊拾取、共享模板释放均通过。
- ✅ 场景：自定义端口记录断言通过；旧盒子不创建；`setInsideBuilding` 离开恢复 0；偏航、拾取、restore/dispose 均委托。
- ✅ 性能/门禁：HeapProfiler 严格零增长、lint/typecheck/测试/内容/故事/体积全部实跑通过，未放宽预算或断言。
- ✅ 续作校验：`scene.ts` 为 850/969=87.7%，超过防截断下限 85%；文件结尾、返回 API 与 dispose 均完整。
- ✅ 正式替换：装配处把 options 改为 `{buildingPort:{create:createBuildingLayer}, actorPort:createActorPort(...), buildingInput}`；若改默认，仅替换 `scene.ts` 两个默认工厂表达式。
- ✅ 页面交接：投影更新时 `id==null ? null : plans.findIndex(p=>p.id===id)` 后调用 `scene.setInsideBuilding(index)`，找不到时传 `null` 并上报内容错误。
