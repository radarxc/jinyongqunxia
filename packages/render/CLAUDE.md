# @tianshu/render

Three.js r186 表现层，只消费只读投影和领域事件。禁止自行计算伤害、路径、范围或其他玩法规则。热路径不得逐帧创建对象；地形、单位和特效优先实例化、图集、对象池。GPU 资源必须有明确所有者并在 `dispose()` 释放；新增着色器需登记降级路径。

## 六角战场 API（ENG-10）

- 从 `@tianshu/render/battle` 动态导入 `createBattleRenderer(canvas,cells)`；战场采用 Three WebGL 2.5D 层，不另建 DOM 六角几何。
- `HexLayer` 用一个 `InstancedMesh` 绘制最多 400 格；选中 / 幽灵、就绪、可达 / 路径、招式范围复用 400×1 RGBA8 `DataTexture` 的打包通道，不增加 draw call，也不得改回大数组 fragment uniform。地形颜色是实例属性。
- `updateUnits()` 只消费 `BattleMarker[]`，以 ENG-12 `RigBatch` 呈现分层身体与装备；位置、朝向或装备不变时不重复写角色状态，每帧只做一次 `batch.sync()`。
- 六向 `HexDir` 必须经 `hexDirToRig()` 映射为 `Dir8`。共享边拾取先按投影中心距，再按 `(r,q)`，与 design/09 §10 一致。
- `project()` 给 Vue 标签提供屏幕坐标；应用层按单位位置缓存，只在单位移动或 resize 时重投影。renderer 不计算可达、敌我或命中。
- 所有 GPU / atlas / rig 资源由 renderer 拥有并在 `dispose()` 释放；WebGL 创建失败时应用保留键盘 / 触屏格列表作为降级路径。

## 四偏航与昼夜 API（ENG-21a）

- `camera/` 是无 Three 依赖的纯数学层：`ISO_CAMERA_SPEC` 固定 pitch 30°、yaw 预设 45/135/225/315°；`cameraBack()` 写入可选 caller-owned 向量；`IsoCameraRotation.update(timeMs)` 以帧时间完成 350 ms `easeInOutCubic`，热路径不分配。
- `spriteDir(facingYawDeg,cameraYawDeg)` 先把相对角正模到 `[0,360)`，再以 `floor(relative/45+0.5)%8` 取 `Dir8`。战斗 `HexDir` 按世界角 `[0,300,240,180,120,60]` 经 `hexDirToRig()` 转换，禁止持久化相机相对方向。
- `BattleRenderer.camera` 暴露只读 `yawDeg` / `rotating` 与 `rotate(-1|1,reducedMotion?)`；旋转中及结束后 150 ms `pick()` 返回 null。减少动效瞬切但仍保留 150 ms 保护；应用在偏航变化帧重投影 DOM 标签。
- `BattleRenderer.setTimeOfDay(hours)` 与 `WorldMapScene.setTimeOfDay(hours)` 都接收 `[0,24)` 小时并允许函数内部回绕。战斗创建时由应用以开战 `worldTick / TICKS_PER_HOUR` 设一次，之后冻结；render 不依赖 core。
- `lighting/time-of-day.ts` 按 tech/02 §7.1 八个关键帧求值：颜色在 OKLab 插值，标量线性插值；太阳相对方位为 `80°+30°cos(π·dayPhase)`。Three 颜色入口以 `SRGBColorSpace` 转入工作色域。
- 战斗以全屏 multiply tint pass 兼容现有不受光 shader，夜间通道下限 0.42，固定增加 1 draw call；战场基线由 terrain 1 + rig 2 增为 4。大地图复用现有环境光、方向光与清屏色，仍为 7 draw calls（目的地可见时 8），不加 pass。
- 大地图和城镇现阶段 `allowRotation=false`，保持 yaw 45°；城镇预渲染建筑不可旋转。城镇接入同一 tint pass 需在其后续任务修改 `town/**`，本任务不越界。

## 大地图 API（ENG-08）

- 从 `@tianshu/render/worldmap` 动态导入 `createWorldMapScene()`；几何来自 data 的 `worldmap.v1` 校验结果，角色位置与旅程来自 core 只读投影；render 不计算 A*、里程、年代或城门判定。
- 2.5D 结构固定为高度地形 1 mesh、道路 1 个 InstancedMesh、河流 / 山脉各 1 个 LineSegments batch、节点 1 个 InstancedMesh；节点共用 2×2 DataTexture atlas。静态层 5 draw calls，玩家 rig 2，目的地标记可见时再加 1。
- `WorldMapScene` 提供 render / resize / setActor / setDestination / setTimeOfDay / setZoom / pickNode / dispose。正交镜头跟随角色；缩放限制 0.65–2.5；拾取只针对当代可见节点实例。
- 玩家必须继续使用 ENG-12 的 RigSet / RigBatch / RigInstance：分层部件、代码步态、装备可见。禁止为地图另建帧序列角色。地图缺纹理时退化为程序化宣纸色高度地形，结构化道路和节点仍可用。
- `stats` 暴露 drawCalls / triangles / frameMs / cpuMs / nodes / roads / instances；桌面目标 ≥60 fps，中端手机目标 ≥30 fps（待真机实测）。每帧只更新 rig typed arrays，静态几何不重建。
- 所有权：场景 dispose 依次释放 rig、静态 geometry/material、节点 atlas、地图纹理、目的地 marker 和 WebGLRenderer；调用两次必须安全。

## 城镇场景 API（ENG-09）

- 从 `@tianshu/render/town` 动态导入 `createTownScene(canvas,town,{ projection, zoom })`；输入是 data 已校验的 `town-runtime.v1` 与应用只读投影。render 只把指针射线换成整数格或锚点，不判断可走性、路径、建筑状态、剧情或打坐概率。
- 离线与运行时共用 64×32 px、yaw 45°、pitch 30°；`planningToTownPixels()` 的高度位移为 `16×sqrt(6)×elevationM` px。投影测试覆盖非零高差、格心往返、六边格边界与镜头角；拾取按运行时登记高度平面求最近合法格。
- 地面按 32×32 格 chunk 各一个 `InstancedMesh`，贴片、overlay 与 8 向边件共用运行时 atlas；内角沿用离线 4 px tip 裁切。建筑、简化室内、锚点各自合批。每帧仅做 chunk 视锥裁剪、rig typed-array 同步和焦点建筑 alpha 更新，不重建静态几何。
- `TownScene` 提供 render / resize / update / setZoom / pickPoint / pickAnchor / project / dispose；缩放限制 0.65–2.5。建筑进入时只有目标外墙渐变至 0.28，室内地面与柜台显现，退出反向恢复。
- 主角与 NPC 必须用 ENG-12 `RigSet` / `RigBatch` / `RigInstance`；场景容量 100 名角色，NPC 出现与消失仅按应用投影增删。不得为城镇另建精灵角色或从 render 推断时代。
- `stats` 暴露 drawCalls / triangles / frameMs / cpuMs / groundInstances / buildingInstances / rigInstances / visibleChunks / atlasTextures。目标为桌面 ≥60 fps、中端手机 ≥30 fps，当前仍待浏览器与真机实测。
- 所有权：场景释放 rig、锚点、地面 chunk、建筑/室内 batch、两张 atlas 及 WebGLRenderer；`dispose()` 可重复调用。纹理缺失时 atlas 写入分类色块，结构与拾取仍可工作。

## 区域场景 API（ENG-20b）

- 从 `@tianshu/render/region` 动态导入 `createRegionScene(canvas,regionStatic,{ projection, ... })`；不要从根入口静态导出。输入是 core 的 `region-static.v1` / 动态投影，render 不计算路径、交互距离、门禁、出口或自动存档。
- pointy-top 六角采用外接圆半径 `2/3 m`、行距 `1 m`、高度步长 `1 m`；地形为 32×32 槽 chunk。初次同步构建玩家周围 3×3，其余按距离排队、每帧最多上传 2 个；当前主线程构网和全场驻留是 MVP 降级，Worker + 离视野 LRU 留待后续。
- 每 chunk 一个地形 mesh 与 32×32 RGBA8 `DataTexture` 索引图；共享 `DataArrayTexture` 按 `tr_*` 分层并可由调用方注入正式纹理，缺素材使用同接口 1×1 分类色层。斜坡、崖面及 `h-0.15 m` 水面由显式地图字段生成。
- `RegionScene` 提供 render / resize / update / setPlayerPose / setTimeOfDay / setPath / setZoom / pickHex / pickAnchor / project / dispose；`stats` 给出 drawCalls / triangles / frameMs / cpuMs / chunk、格、物件与 rig 数。拾取仅返回格或 core 已投影的锚点。
- CameraHint 局部消费 `yawDeg / zoom / allowRotation`；禁止旋转时有效 yaw 恒为 45°。角色继续使用容量 100 的 `RigBatch`；静态 deco/建筑/屋顶合批，可选 `occluder / castShadow / roof / fadeGroup` 驱动 250 ms 抖动淡出。
- 稳态帧复用向量、矩阵、视锥和 loaded-chunk 数组；只做淡出、rig 同步、视锥裁剪与统计，不构造临时集合。路径变更与指针拾取属于事件路径，允许短生命周期数组。
- 上下文由共享 `createContextGuard()` 管理，DPR 只取 `RenderQualitySource.effectivePixelRatio()`；恢复时重标数据纹理/材质，释放时先卸监听，再释放 rig、实例、chunk、仅自有 terrain array，最后 `forceContextLoss()` / `dispose()`；重复释放安全。

## 角色 rig API（ENG-12）

- 从 `@tianshu/render/rig` 动态导入；不要从根入口静态导入，避免进入首屏 chunk。
- `loadRigSet(manifest)` 在启动时校验 `tianshu-rig.v1` 并把三视图 39 张 PNG 装入共享 atlas；素材缺失时用同尺寸描边色块，正式素材接入无需改角色 API。
- `createRigCharacter(rigSet, equipment, stableId)` 返回 `RigInstance`；调用 `setMotion(dir8, speedMps, weightClass)`、`setEquipment(next)`、`setPosition(x,y,z)`、`update(dt)`，最终 `dispose()`。
- `loadRigClip()` 严格校验 `tianshu-clip.v1` / `tianshu_humanoid.v1` / 许可与轨迹长度，解码为预分配 typed array；先 `registerRigClip()`，再调用 `playClip(id,{facingYawDeg,rate?,onEvent?})`，`stopClip()` 在 160 ms 内淡回程序步态。
- 片段固定一拍二 12 fps；移动片段速率只取 `speedMps/nativeSpeedMps`，仅 `[0.8,1.4]` 使用，超界回程序步态。根运动原地；偏航辅助最多 ±30°；`nearHandWeapon` 可按动态深度镜像片段，但不得翻转玩法朝向。
- 程序步态和片段都先写 caller-owned `PartPoseBuffer`，再经唯一姿势写入口更新实例。投影顺序是偏航、2D FK、逐部件三视图与 10° 滞回、缩短下限 0.45、躯干肩宽比、动态 z、剑轴；稳态热路径不得创建对象或数组。
- `hit/end` 仅回调 VFX、SFX、cutin 等表现层；停止/取消不得伪造事件，core 禁止导入或读取 render 事件。`content/anim/clip-map.yaml` 是 `MoveDef.anim.clip` 键到片段参数的唯一映射，未知键硬失败。
- `RigBatch` 按 atlas family 拥有一个双材质 `InstancedMesh`：alpha 芯与软边共 2 draw call。每角色固定 16 基础槽 + 最多 4 附加槽；默认容量 100 人 / 2,000 实例。
- `EquipmentVisuals` 是 render 侧只读适配边界。core 的装备投影接入后只映射字段，不在 render 推导战斗合法性；可用 `weightClassForEquipment()` 推导轻/中/重表现档。
- 资源所有权：`RigSet.dispose()` 销毁共享 atlas；`RigBatch.dispose()` 销毁 geometry/material；`RigInstance.dispose()` 只终止角色状态，调用方负责从批次移除。

## rig CPU 性能门禁（ENG-12b）

- 硬预算不变：20 名满装角色 CPU 帧 P95 < 16.67 ms；100 角色 / 1,600 个基础实例总 rig CPU P95 < 0.80 ms。不得减少角色、600 个采样帧或改分位数来过门禁。
- 每项先预热 120 帧，再测 3 轮；每轮独立采 600 帧并计算 P95，以三轮最小 P95（best-of-3）断言。每轮日志必须带该轮 P95、最终最小值、`os.loadavg()` 与 `os.cpus().length`。
- `performance.test.ts` 只由 Vitest 的 `perf` project 收集；普通 `node` project 显式排除它。`perf` 使用 `fileParallelism:false`、单 worker、`sequence.concurrent:false`。
- **不在 `pnpm check` 里**（作者 AR-33）：根 `test` 脚本只跑普通项目；本门禁由 `pnpm check:perf`（先打印 loadavg，再跑 `pnpm test:perf`）在机器负载低时单独跑。开发监督在每批合入后与发布前跑一次，结果与负载记进 HANDOFF。
- 负载只作诊断记录：每轮输出 `os.loadavg()` 与 CPU 数。**禁止**在任何测试里加「高负载跳过 / 放宽」逻辑，不得改阈值、采样帧数或分位数；`check:perf` 失败一律按真实性能退化处理。
- 片段模式另跑 100 人 / 1,600 实例、120 帧预热、3×600 帧 best-of-3，P95 须 `<1.0 ms`（作者 2026-10-02 AR-37 放宽；程序步态仍 `<0.80 ms`）；只放在 `pnpm test:perf` / `pnpm check:perf`，不得并入 `pnpm check`。
- 片段投影缓存按已解码 clip 对象、`RigSet`、精确采样帧、连续偏航、镜像和入站 16 部件视图状态匹配；不量化偏航，因此不会改变 10° 滞回或投影金样。每组预分配 32 个快照的工作集，覆盖常见八方向、镜像及滞回变体；片段/rig/帧/偏航/镜像/滞回状态任一变化即自然失效，稳态命中不得分配。

## 3D 试点（ENG-12e）

- `loadPilotModel(url)` 只供 `/rig-demo` 的开发入口动态加载，返回 `{ scene, skinned, clips, stats }`；模型统一缩放到 1.70 m、脚底置于 `y=0`，可识别的 Mixamo/UE 骨架按肩轴×躯干轴校正到 `+z`，无骨架输入约定源文件已面向 `+z`。根入口仅保留带 `@vite-ignore` 的开发加载包装，生产首屏、战斗和 render chunk 不静态包含 `GLTFLoader`。
- `createPilotDemoScene(canvas,{ modelUrl, rigManifest?, onClipEvent? })` 在同一个正交相机和比例尺中并排绘制 2D `RigBatch` 与 3D GLB；控制器提供八方向偏航、自动转台、toon / 原材质、描边、1 / 20 个实例、GLB clip 与 `tianshu-clip.v1` 播放。
- toon 使用自制三阶 `DataTexture` 与 `MeshToonMaterial`，保留 baseColorTexture；描边为可关闭的反面扩张副 mesh。开启描边时 3D draw call 与 triangle 都约翻倍。所有新增 geometry、material 与 gradient texture 必须在 `dispose()` 释放。
- 片段重定向按 Mixamo `mixamorig:*` 或 UE `pelvis/spine_01/...` 映射到 20 关节，以父骨空间 aim 约束施加方向；12 fps、`rate`、`hit/end` 事件沿用 2D `clip-player.ts`。无 skin 的 GLB 仍可加载、转台和切换材质，但禁用骨骼动画与重定向。
- SkinnedMesh 克隆必须使用 `SkeletonUtils.clone()`。3D SkinnedMesh 不属于 2D `RigBatch` 的双材质合批，不能承诺 2 draw call：当前作者 GLB 静态解析为 10,022 triangles，关闭描边时每实例约 1 draw；20 个克隆约 200,440 triangles / 20 draws，另加并排 2D rig 的 2 draws。
- 当前生产构建 render 为 161.24 / 180 KiB gzip，余量 18.76 KiB；仅保留两个开发模块路径字符串，GLTFLoader/试点实现未进入生产产物。CPU 帧时间必须以页面 HUD 的 120 帧平均值在目标浏览器分别记录 1 / 20 实例，Node 测试与三角面推算不能替代浏览器实测。

## 招式 VFX API（ENG-11）

- 从 `@tianshu/render/vfx` 动态导入 `createBattleVfxStage(canvas)`；VFX 单独产出 `vfx` chunk，战斗首次结算才加载。应用把 `onMoveResolved` 的只读施招者、目标与事件传给 `play()`，不得在表现层重算命中、伤害、范围或朝向。
- `setProjector(renderer.project)` 复用 ENG-10 战场相机坐标；`resize()`、`render(timeMs)` 与战场同帧调用。`play()` 返回 composition 实际 `durationMs`，应用以它同步伤害飘字；减少动效 / 跳过时请求 1 ms 收束。
- 运行时先从 `/content/vfx/bindings.json` 查 `mv_*`：天 / 地 bespoke 加载对应 composition；玄级使用 `qi_projection` 或 `afterimage`；黄级使用 `plain_strike`。施招者未投影内力性质时使用绑定 nature，颜色固定阴青、阳赤、调和淡金、中性素白。
- 单透明 WebGLRenderer 使用最多 48 个 pooled slot；每 slot 共享一个 plane geometry，effect shader 内完成根部对齐的预乘 alpha 帧插值，emitter / 5 残影 / 4 附加环复用材质。各层先在线性离屏 target 合成，末次 pass 才编码 sRGB。Texture Promise 按 URL 去重，source-sheet atlas 不拆帧请求；dispose 必须释放材质、geometry、texture 和 renderer。
- `afterimage` 在解析出模板后才调用 `BattleRenderer.snapshot(id)`，把当前分层人物与装备拍平为一次性纹理，按 28 px 间距复制 4 份；普通招不做快照。快照不可用才画程序轮廓并计入 fallback。
- 无绑定、composition / catalog / 贴图 / 角色快照失败均不阻断战斗：退到 plain-strike 或程序色块，并按 move/reason 去重 `console.warn`，同时增加 `stage.stats.fallbacks`。命中、外放抵消、透劲入体、打穴分别是金 / 青 / 紫 / 赤的简洁目标环。
- `/content/vfx/runtime-files.json` 是发布白名单；由 `python3 tools/vfx/export_bindings.py` 从作者 YAML 生成，包含 bindings、catalog、74 套正式 composition、2 套 baseline、source-sheet 与 emitter。构建复制到 public，但 PWA precache 明确排除，保持按招式请求。降龙亢龙直接消费 composition 的 `scale:[1,2]`，不得再乘 2。

## 上下文恢复与自适应质量 API（ENG-21b）

- `createContextGuard()` 管理 `ok / lost / failed`；丢失时必须 `preventDefault()`、停绘并报告计数，5 秒未恢复转 `failed`。恢复顺序为重设 DPR、重设尺寸、场景重建 render target / uniform / DataTexture，最后请求一帧；回前台先查 `renderer.getContext().isContextLost()`。
- render 不读写存储。应用把 `onContextLoss` 接到一周计数，把 `onContextStateChange` 接纯 DOM 恢复页；`dispose()` 先移除守卫监听，再释放资源、调用 `renderer.forceContextLoss()` 与 `renderer.dispose()`。
- `quality/tiers.ts` 是四档唯一代码表；所有可修改场景都通过 `effectivePixelRatio(deviceDpr, quality)` 计算 DPR。`AutoTuner` 使用固定 60 帧环形缓冲，每 500 ms 最多下降 0.05，在档位下限持续超预算 5 秒才降档；会话内不自动升档。
- 应用入口 `createRenderQuality()` 负责一次 GPU 探测、30 天档位缓存、7 天丢失计数与 `?tier=` 覆盖；设置页以后只调用其 `setTier('auto' | 'low' | 'mid' | 'high' | 'ultra')` / `clearCachedDetection()`，不得把 localStorage 下沉到 render。
- 战斗、大地图、VFX 渲染器已接守卫与共享质量代理；大地图页面仍需在首屏主动调用 `createRenderQuality()`。VFX 仍是第二 WebGL 上下文。城镇接线、标题画面基准、温控、FramePacer、`?perf=1` 与 Playwright 恢复场景不属于本批。

## 下游交接

- ENG-08 大地图已按上述接口接入；ENG-09 城镇区域加载时共享一个 `RigSet`/`RigBatch`，只把可见角色加入批次；超过 100 人时先把远景 C 级路人降为合成人群卡。
- ENG-10 战斗已落地上述转换和批渲染；ENG-11 攻击大动作可经应用的 `onMoveResolved` 申请深度偏移，但不得重算命中、移动或朝向规则。
- 所有下游每渲染帧先更新可见 `RigInstance`，再调用一次 `RigBatch.sync()`；不要逐角色提交 draw call，也不要直接修改实例属性。
- 开发验证入口为 `/rig-demo`，含八方向与轮播、程序/动作库步态 A/B、片段选择、剑招按钮、事件日志、动作/重量、七类装备、连续/12 fps 姿势与 20 人压力开关。
- ENG-21b 在 `createBattleRenderer()` / `createWorldMapScene()` 的 WebGLRenderer 创建和 `resize()` DPR 设置处接上下文恢复、自适应质量；保留 `setTimeOfDay()` 状态和 tint pass 重建。ENG-12c 可直接复用 `camera.yawDeg`、`spriteDir()` 与 `hexDirToRig()`。
- 当前 `rig/character.ts` 的 `setMotion()` 会对镜头引发的 `Dir8` 变化启动约 160 ms 转身混合，与 tech/09 §4.3“转镜头不另开视图动画”不符；留给 rig 后续任务增加镜头重定向的无转身入口。

## 参考资料与验证

- [Three InstancedMesh](https://threejs.org/docs/pages/InstancedMesh.html)：同 geometry / material 的实例渲染用于减少 draw call。
- [Three DataArrayTexture](https://threejs.org/docs/pages/DataArrayTexture.html)、[DataTexture](https://threejs.org/docs/pages/DataTexture.html)：地形分层纹理与 RGBA8 索引图；[Raycaster](https://threejs.org/docs/pages/Raycaster.html)：mesh / instance 拾取；2026-10-03 联网返回 HTTP 200。
- [Three WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html)、[MDN ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)：渲染统计、释放与 CSS 视口尺寸跟踪；2026-10-03 联网返回 HTTP 200。锁文件为 Three 0.186.1，未新增依赖。
- [Three ShaderMaterial](https://threejs.org/docs/pages/ShaderMaterial.html)：高亮集合通过 `uniforms` 更新。
- [Three Raycaster](https://threejs.org/docs/pages/Raycaster.html)：`InstancedMesh` 命中结果携带 `instanceId`。以上访问日期 2026-10-01。
- [OrthographicCamera](https://threejs.org/docs/pages/OrthographicCamera.html)、[TextureLoader](https://threejs.org/docs/pages/TextureLoader.html)：大地图斜视正交镜头与可选水墨底图。
- [WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html)：`renderer.info.render` 提供 draw call 与 triangle 统计；城镇性能面板直接读取，不自行估算。以上城镇相关官方页面于 2026-10-02 联网返回 HTTP 200。
- 锁文件实际版本为 Three 0.186.1；未新增依赖。战斗专项测试覆盖方向映射、共享边裁决；根 `pnpm check` 执行普通测试与 bundle size，rig P95 仅由 `pnpm check:perf` 执行（AR-33）。
- [Three WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html)、[Texture](https://threejs.org/docs/pages/Texture.html)、[TextureLoader](https://threejs.org/docs/pages/TextureLoader.html)：核实 `powerPreference`、像素比、异步贴图加载及 renderer / texture 的显式 `dispose()`；访问日期 2026-10-01。
- [Three Color](https://threejs.org/docs/pages/Color.html)、[WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html)、[ShaderMaterial](https://threejs.org/docs/pages/ShaderMaterial.html)、[Material](https://threejs.org/docs/pages/Material.html)：核实 `setRGB(..., SRGBColorSpace)`、`info.autoReset/reset()`、手动 clear、uniform、混合/深度状态与显式释放；2026-10-02 联网返回 HTTP 200。
- [MDN webglcontextlost](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextlost_event)、[webglcontextrestored](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextrestored_event)、[isContextLost](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/isContextLost)、[WEBGL_lose_context](https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_lose_context)：核实丢失阻止默认行为、恢复事件、前台检查和开发测试扩展；访问日期 2026-10-02。
- [Three WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html)、[DataTexture](https://threejs.org/docs/pages/DataTexture.html)、[MDN deviceMemory](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/deviceMemory)、[localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)：核实上下文/资源 API、RGBA8 数据纹理、设备内存提示与缓存异常边界；访问日期 2026-10-02。
- [GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html)、[MeshToonMaterial](https://threejs.org/docs/pages/MeshToonMaterial.html)、[SkeletonUtils](https://threejs.org/docs/pages/module-SkeletonUtils.html)、[AnimationMixer](https://threejs.org/docs/pages/AnimationMixer.html)、[WebGLRenderer.info](https://threejs.org/docs/pages/Info.html)：核实 glTF 加载、toon gradient map、带骨克隆、动画混合和渲染统计 API；2026-10-03 联网返回 HTTP 200。

## 待决事项 / 依赖

- Region 完整流式仍需把构网迁到 `mesh.worker` 并按“视野外 2 chunk + 显存预算”淘汰 LRU；当前实现只保证 3×3 首屏、每帧 2 chunk 上传与稳态零显式分配。
- RegionMap 生产 schema / Tiled 转换器尚未输出 deco 的 `occluder / castShadow / roof / fadeGroup`；render 已接受可选字段并降级为不遮挡、不投影、不分组。
- Region 冷入口与返回大地图仍需 core/app 提供显式 mount/unmount 合同；不得从坐标、场景名或特殊 ID 推断 spawn。QinggongGate 的 `targetHex` 也需补可原子挂载的目标协议。
- （待实测）区域页 WebGL2 的 GPU draw / P50/P95 帧时、四偏航拾取、触控吸附、横竖屏、淡出观感与上下文恢复；Node mock 结构统计不能代替浏览器或真机结果。
- （待实测）WebGL2 真机的共享边触控、低端 Android GPU shader uniform 上限、横竖屏切换与上下文丢失恢复；当前提供 DOM 格列表降级，不宣称真机完成。
- ENG-11 若增加 VFX mesh / 粒子池，必须保留战场 terrain 1 draw、rig 2 draw 的基线统计，并为新增 GPU 资源补 dispose。
- （待实测）VFX 的 WebGL draw / GPU 帧耗时、上下文丢失恢复与低端 Android 多特效表现；当前 Node 门禁只验证 48 个并发时间轴 / 实例属性计算 P95 < 16.67 ms，不冒充 GPU 真机数据。
- （待实测）战斗 / 大地图 / VFX 的丢失遮罩、5 秒失败分支、资源恢复、各档实际 FPS 与显存；开发环境可用 `renderer.getContext().getExtension('WEBGL_lose_context')` 的 `loseContext()` / `restoreContext()` 驱动验证。
- （待实测）城镇大理 / 杭州在桌面与中端手机的实际 P50/P95 帧时间、显存峰值、触控拾取和 WebGL 上下文恢复；当前只交付结构统计与合批/裁剪测试，不把 Node 测试冒充帧率数据。
- 【建议值】战斗 multiply tint 的夜间通道下限暂取 0.42、混合强度 0.58；待真机逐关键帧校色后固化或按书界覆写。大地图页面尚须由 ENG-15 后续 UI 接线在世界时钟变化时调用 `setTimeOfDay(hours)`。
- （待实测）在桌面浏览器分别记录 1 / 20 个 Tripo 克隆的 CPU 帧时间、draw call、triangle，并截取 0°–315° 八方向与 2D 切件并排对照图；自动化 Chrome 当前受 macOS 沙箱权限阻断。
- （待实测）中端手机上的 1 / 20 实例帧率、显存、描边开销与上下文恢复；当前 GLB 左侧头发呈肉色属于源贴图瑕疵，本试点不修改资产。
