# @tianshu/render

Three.js r186 表现层，只消费只读投影和领域事件。禁止自行计算伤害、路径、范围或其他玩法规则。热路径不得逐帧创建对象；地形、单位和特效优先实例化、图集、对象池。GPU 资源必须有明确所有者并在 `dispose()` 释放；新增着色器需登记降级路径。

## 六角战场 API（ENG-10）

- 从 `@tianshu/render/battle` 动态导入 `createBattleRenderer(canvas,cells)`；战场采用 Three WebGL 2.5D 层，不另建 DOM 六角几何。
- `HexLayer` 用一个 `InstancedMesh` 绘制最多 400 格；选中 / 就绪 / 可达 / 招式范围写 uniform 数组，不重建 geometry。地形颜色是实例属性。
- `updateUnits()` 只消费 `BattleMarker[]`，以 ENG-12 `RigBatch` 呈现分层身体与装备；位置、朝向或装备不变时不重复写角色状态，每帧只做一次 `batch.sync()`。
- 六向 `HexDir` 必须经 `hexDirToRig()` 映射为 `Dir8`。共享边拾取先按投影中心距，再按 `(r,q)`，与 design/09 §10 一致。
- `project()` 给 Vue 标签提供屏幕坐标；应用层按单位位置缓存，只在单位移动或 resize 时重投影。renderer 不计算可达、敌我或命中。
- 所有 GPU / atlas / rig 资源由 renderer 拥有并在 `dispose()` 释放；WebGL 创建失败时应用保留键盘 / 触屏格列表作为降级路径。

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
- `performance.test.ts` 只由 Vitest 的 `perf` project 收集；普通 `node` project 显式排除它。`perf` 使用 `fileParallelism:false`、单 worker、`sequence.concurrent:false`，并以 `groupOrder:1` 等普通项目结束后再运行。
- 负载护栏是备用最后手段，当前未启用：只有上述隔离和 best-of-3 仍连续失败时，才可在 `os.loadavg()[0] > os.cpus().length × 1.5` 时对 100 角色门禁仅 `console.warn` 记录并跳过断言；低负载及 20 人门禁仍必须断言。

## 下游交接

- ENG-08 大地图、ENG-09 城镇：区域加载时共享一个 `RigSet`/`RigBatch`，只把可见角色加入批次；超过 100 人时先把远景 C 级路人降为合成人群卡。
- ENG-10 战斗已落地上述转换和批渲染；ENG-11 攻击大动作可经应用的 `onMoveResolved` 申请深度偏移，但不得重算命中、移动或朝向规则。
- 所有下游每渲染帧先更新可见 `RigInstance`，再调用一次 `RigBatch.sync()`；不要逐角色提交 draw call，也不要直接修改实例属性。
- 开发验证入口为 `/rig-demo`，含八方向、动作/重量、七类装备、连续/12 fps 姿势与 20 人压力开关。

## 参考资料与验证

- [Three InstancedMesh](https://threejs.org/docs/pages/InstancedMesh.html)：同 geometry / material 的实例渲染用于减少 draw call。
- [Three ShaderMaterial](https://threejs.org/docs/pages/ShaderMaterial.html)：高亮集合通过 `uniforms` 更新。
- [Three Raycaster](https://threejs.org/docs/pages/Raycaster.html)：`InstancedMesh` 命中结果携带 `instanceId`。以上访问日期 2026-10-01。
- 锁文件实际版本为 Three 0.186.1；未新增依赖。战斗专项测试覆盖方向映射、共享边裁决，根 `pnpm check` 继续执行 rig P95 和 bundle size 门禁。

## 待决事项 / 依赖

- （待实测）WebGL2 真机的共享边触控、低端 Android GPU shader uniform 上限、横竖屏切换与上下文丢失恢复；当前提供 DOM 格列表降级，不宣称真机完成。
- ENG-11 若增加 VFX mesh / 粒子池，必须保留战场 terrain 1 draw、rig 2 draw 的基线统计，并为新增 GPU 资源补 dispose。
