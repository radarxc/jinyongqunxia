# @tianshu/render

Three.js r186 表现层，只消费只读投影和领域事件。禁止自行计算伤害、路径、范围或其他玩法规则。热路径不得逐帧创建对象；地形、单位和特效优先实例化、图集、对象池。GPU 资源必须有明确所有者并在 `dispose()` 释放；新增着色器需登记降级路径。

## 六角战场 API（ENG-10）

- 从 `@tianshu/render/battle` 动态导入 `createBattleRenderer(canvas,cells)`；战场采用 Three WebGL 2.5D 层，不另建 DOM 六角几何。
- `HexLayer` 用一个 `InstancedMesh` 绘制最多 400 格；选中 / 就绪 / 可达 / 招式范围写 uniform 数组，不重建 geometry。地形颜色是实例属性。
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

## 角色 rig API（ENG-12）

- 从 `@tianshu/render/rig` 动态导入；不要从根入口静态导入，避免进入首屏 chunk。
- `loadRigSet(manifest)` 在启动时校验 `tianshu-rig.v1` 并把三视图 39 张 PNG 装入共享 atlas；素材缺失时用同尺寸描边色块，正式素材接入无需改角色 API。
- `createRigCharacter(rigSet, equipment, stableId)` 返回 `RigInstance`；调用 `setMotion(dir8, speedMps, weightClass)`、`setEquipment(next)`、`setPosition(x,y,z)`、`update(dt)`，最终 `dispose()`。
- `RigBatch` 按 atlas family 拥有一个双材质 `InstancedMesh`：alpha 芯与软边共 2 draw call。每角色固定 16 基础槽 + 最多 4 附加槽；默认容量 100 人 / 2,000 实例。
- `EquipmentVisuals` 是 render 侧只读适配边界。core 的装备投影接入后只映射字段，不在 render 推导战斗合法性；可用 `weightClassForEquipment()` 推导轻/中/重表现档。
- 资源所有权：`RigSet.dispose()` 销毁共享 atlas；`RigBatch.dispose()` 销毁 geometry/material；`RigInstance.dispose()` 只终止角色状态，调用方负责从批次移除。

## rig CPU 性能门禁（ENG-12b）

- 硬预算不变：20 名满装角色 CPU 帧 P95 < 16.67 ms；100 角色 / 1,600 个基础实例总 rig CPU P95 < 0.80 ms。不得减少角色、600 个采样帧或改分位数来过门禁。
- 每项先预热 120 帧，再测 3 轮；每轮独立采 600 帧并计算 P95，以三轮最小 P95（best-of-3）断言。每轮日志必须带该轮 P95、最终最小值、`os.loadavg()` 与 `os.cpus().length`。
- `performance.test.ts` 只由 Vitest 的 `perf` project 收集；普通 `node` project 显式排除它。`perf` 使用 `fileParallelism:false`、单 worker、`sequence.concurrent:false`。
- **不在 `pnpm check` 里**（作者 AR-33）：根 `test` 脚本只跑普通项目；本门禁由 `pnpm check:perf`（先打印 loadavg，再跑 `pnpm test:perf`）在机器负载低时单独跑。开发监督在每批合入后与发布前跑一次，结果与负载记进 HANDOFF。
- 负载只作诊断记录：每轮输出 `os.loadavg()` 与 CPU 数。**禁止**在任何测试里加「高负载跳过 / 放宽」逻辑，不得改阈值、采样帧数或分位数；`check:perf` 失败一律按真实性能退化处理。

## 招式 VFX API（ENG-11）

- 从 `@tianshu/render/vfx` 动态导入 `createBattleVfxStage(canvas)`；VFX 单独产出 `vfx` chunk，战斗首次结算才加载。应用把 `onMoveResolved` 的只读施招者、目标与事件传给 `play()`，不得在表现层重算命中、伤害、范围或朝向。
- `setProjector(renderer.project)` 复用 ENG-10 战场相机坐标；`resize()`、`render(timeMs)` 与战场同帧调用。`play()` 返回 composition 实际 `durationMs`，应用以它同步伤害飘字；减少动效 / 跳过时请求 1 ms 收束。
- 运行时先从 `/content/vfx/bindings.json` 查 `mv_*`：天 / 地 bespoke 加载对应 composition；玄级使用 `qi_projection` 或 `afterimage`；黄级使用 `plain_strike`。施招者未投影内力性质时使用绑定 nature，颜色固定阴青、阳赤、调和淡金、中性素白。
- 单透明 WebGLRenderer 使用最多 48 个 pooled slot；每 slot 共享一个 plane geometry，effect shader 内完成根部对齐的预乘 alpha 帧插值，emitter / 5 残影 / 4 附加环复用材质。各层先在线性离屏 target 合成，末次 pass 才编码 sRGB。Texture Promise 按 URL 去重，source-sheet atlas 不拆帧请求；dispose 必须释放材质、geometry、texture 和 renderer。
- `afterimage` 在解析出模板后才调用 `BattleRenderer.snapshot(id)`，把当前分层人物与装备拍平为一次性纹理，按 28 px 间距复制 4 份；普通招不做快照。快照不可用才画程序轮廓并计入 fallback。
- 无绑定、composition / catalog / 贴图 / 角色快照失败均不阻断战斗：退到 plain-strike 或程序色块，并按 move/reason 去重 `console.warn`，同时增加 `stage.stats.fallbacks`。命中、外放抵消、透劲入体、打穴分别是金 / 青 / 紫 / 赤的简洁目标环。
- `/content/vfx/runtime-files.json` 是发布白名单；由 `python3 tools/vfx/export_bindings.py` 从作者 YAML 生成，包含 bindings、catalog、74 套正式 composition、2 套 baseline、source-sheet 与 emitter。构建复制到 public，但 PWA precache 明确排除，保持按招式请求。降龙亢龙直接消费 composition 的 `scale:[1,2]`，不得再乘 2。

## 下游交接

- ENG-08 大地图已按上述接口接入；ENG-09 城镇区域加载时共享一个 `RigSet`/`RigBatch`，只把可见角色加入批次；超过 100 人时先把远景 C 级路人降为合成人群卡。
- ENG-10 战斗已落地上述转换和批渲染；ENG-11 攻击大动作可经应用的 `onMoveResolved` 申请深度偏移，但不得重算命中、移动或朝向规则。
- 所有下游每渲染帧先更新可见 `RigInstance`，再调用一次 `RigBatch.sync()`；不要逐角色提交 draw call，也不要直接修改实例属性。
- 开发验证入口为 `/rig-demo`，含八方向、动作/重量、七类装备、连续/12 fps 姿势与 20 人压力开关。
- ENG-21b 在 `createBattleRenderer()` / `createWorldMapScene()` 的 WebGLRenderer 创建和 `resize()` DPR 设置处接上下文恢复、自适应质量；保留 `setTimeOfDay()` 状态和 tint pass 重建。ENG-12c 可直接复用 `camera.yawDeg`、`spriteDir()` 与 `hexDirToRig()`。
- 当前 `rig/character.ts` 的 `setMotion()` 会对镜头引发的 `Dir8` 变化启动约 160 ms 转身混合，与 tech/09 §4.3“转镜头不另开视图动画”不符；留给 rig 后续任务增加镜头重定向的无转身入口。

## 参考资料与验证

- [Three InstancedMesh](https://threejs.org/docs/pages/InstancedMesh.html)：同 geometry / material 的实例渲染用于减少 draw call。
- [Three ShaderMaterial](https://threejs.org/docs/pages/ShaderMaterial.html)：高亮集合通过 `uniforms` 更新。
- [Three Raycaster](https://threejs.org/docs/pages/Raycaster.html)：`InstancedMesh` 命中结果携带 `instanceId`。以上访问日期 2026-10-01。
- [OrthographicCamera](https://threejs.org/docs/pages/OrthographicCamera.html)、[TextureLoader](https://threejs.org/docs/pages/TextureLoader.html)：大地图斜视正交镜头与可选水墨底图。
- [WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html)：`renderer.info.render` 提供 draw call 与 triangle 统计；城镇性能面板直接读取，不自行估算。以上城镇相关官方页面于 2026-10-02 联网返回 HTTP 200。
- 锁文件实际版本为 Three 0.186.1；未新增依赖。战斗专项测试覆盖方向映射、共享边裁决，根 `pnpm check` 继续执行 rig P95 和 bundle size 门禁。
- [Three WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html)、[Texture](https://threejs.org/docs/pages/Texture.html)、[TextureLoader](https://threejs.org/docs/pages/TextureLoader.html)：核实 `powerPreference`、像素比、异步贴图加载及 renderer / texture 的显式 `dispose()`；访问日期 2026-10-01。
- [Three Color](https://threejs.org/docs/pages/Color.html)、[WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html)、[ShaderMaterial](https://threejs.org/docs/pages/ShaderMaterial.html)、[Material](https://threejs.org/docs/pages/Material.html)：核实 `setRGB(..., SRGBColorSpace)`、`info.autoReset/reset()`、手动 clear、uniform、混合/深度状态与显式释放；2026-10-02 联网返回 HTTP 200。

## 待决事项 / 依赖

- （待实测）WebGL2 真机的共享边触控、低端 Android GPU shader uniform 上限、横竖屏切换与上下文丢失恢复；当前提供 DOM 格列表降级，不宣称真机完成。
- ENG-11 若增加 VFX mesh / 粒子池，必须保留战场 terrain 1 draw、rig 2 draw 的基线统计，并为新增 GPU 资源补 dispose。
- （待实测）VFX 的 WebGL draw / GPU 帧耗时、上下文丢失恢复与低端 Android 多特效表现；当前 Node 门禁只验证 48 个并发时间轴 / 实例属性计算 P95 < 16.67 ms，不冒充 GPU 真机数据。
- （待实测）城镇大理 / 杭州在桌面与中端手机的实际 P50/P95 帧时间、显存峰值、触控拾取和 WebGL 上下文恢复；当前只交付结构统计与合批/裁剪测试，不把 Node 测试冒充帧率数据。
- 【建议值】战斗 multiply tint 的夜间通道下限暂取 0.42、混合强度 0.58；待真机逐关键帧校色后固化或按书界覆写。大地图页面尚须由 ENG-15 后续 UI 接线在世界时钟变化时调用 `setTimeOfDay(hours)`。
