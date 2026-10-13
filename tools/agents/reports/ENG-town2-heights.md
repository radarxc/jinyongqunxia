# ENG-town2-heights 报告 · 城镇探索 v2 · P1 · 人物按身高数据缩放（去 3.4 m、按头顶骨骼量身高、GLB 就绪后隐去重叠 2D rig）
## 1. 摘要（3–6 行）
完成 AR-104 六档模板身高表、玩家/NPC 缺省身高与严格模板查询。
`loadPilotModel` 保持 bbox 缺省不变，城镇/区域显式改用绑定姿势头顶骨骼量高；缺骨骼只告警一次并回退 bbox。
删除两处 3.4 m 与城镇 2.1 m 写死值；GLB 成功后隐藏玩家 rig/剪影，失败保留兜底。
两页按 `identity.gender` 传女 1.66 m、男/未知 1.81 m；全量检查与包体门均通过。
## 2. 产出（文件、行数、主要章节）
- 新增 `actors/heights.ts` 19 行及测试 23 行；新增 `town/scene.test.ts` 106 行。
- 修改 `gltf/load.ts` 115 行及测试 90 行；`town/{scene,types}.ts` 387/84 行；`region/{scene,types}.ts` 419/106 行及场景测试 139 行。
- 修改 `TownPage.vue`、`RegionPage.vue` 各一处装配；本报告。仅含授权路径。
- `pnpm install --frozen-lockfile`：通过，567 packages；专项 Vitest：11 files / 45 tests 通过；专项 lint、`pnpm typecheck`：通过。
- `pnpm check`：通过；204 files / 1553 tests；content 1777 files / 1708 objects / 65 maps；构建、PWA、dev-chunks 均通过。
## 3. 关键结论与数值
- 算法：先更新世界矩阵；`sourceStature = HeadTop_End.worldY - meshBBox.minY`，`scale = heightM / sourceStature`；缩放后仍按新 bbox 底面置 `y=0`。
- 支持 `HeadTop_End`、`mixamorig:HeadTop_End`，并据真实资产补 `mixamorigHeadTop_End`；bbox 模式代码路径及缺省值不变。
- 实测 `anim_idle_walk_run.glb`（源模型单位）：男主 bbox `0.979737`、头顶 `0.989892`；女主 `0.980408 / 0.970807`；通用男 `0.979431 / 0.972197`。
- bbox 相对头顶分别 `-1.026% / +0.989% / +0.744%`；真实数据没有统一“约矮 3%”，运行时按任务指定头顶骨骼为权威。
- render 闭包：集成基线日志 `baseline_check4.log` 为 166.05 KiB，本任务 166.15/180 KiB，增量 `+0.10 KiB`，小于 0.5 KiB。
- 联网核实（2026-10-11）：Three [Object3D.getWorldPosition](https://threejs.org/docs/#api/en/core/Object3D)、[Box3.setFromObject](https://threejs.org/docs/pages/Box3.html)、[GLTFLoader](https://threejs.org/docs/#examples/en/loaders/GLTFLoader)。
## 4. 开放问题（附默认值）
- 角色性别/模板取不到时缺省男中等 1.81 m；城镇 NPC 单一场景参数缺省标准男 1.70 m。后续逐 NPC 身高数据到位后由调用方逐角色接口替换。
- 三个试点骨骼均为无冒号别名；已兼容。骨骼点在男主中高于 mesh bbox 顶约 1%，仍按 D3 的头顶骨骼口径执行。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；本实现落实 AR-104 / AR-114 与 tech/14–16，不修改设计基准。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `packages/render/CLAUDE.md` / 3D 试点：后续文档任务可补 `PilotLoadOptions.stature`、头顶三种别名与 bbox 缺省不变；本任务无权修改。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 身高表六值、玩家/NPC 缺省、未知模板抛错均有单测。
- ✅ headTop ±1 mm、bbox 兼容、缺骨回退/单次告警均有单测；GLTFLoader 仍只由场景动态 import 进入。
- ✅ town/region 采用传入身高与 headTop；城镇 NPC 剪影按图高=身高；GLB 成功隐藏 rig，失败保留，均有场景测试。
- ✅ v1 页面交接：两页从 `projection.characters` 找 `relation=self`，`identity.gender === female` 传 1.66，否则传 1.81；后续页面任务沿用该参数，不再放大补偿建筑。
- ✅ 三项指定命令亲自执行通过；`git diff --check` 通过；无依赖/锁文件/战斗调用/预算改动。
- ⚠️ 未做浏览器肉眼比例与真机帧率；本任务验收只要求代码、Node 测试、构建和包体门。
