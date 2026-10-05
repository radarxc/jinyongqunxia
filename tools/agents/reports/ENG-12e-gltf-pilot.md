# ENG-12e-gltf-pilot 报告 · 游戏工程 · 3D 角色试点（Tripo GLB → GLTFLoader + toon 着色 + 8 方向转台 + 骨骼动画与片段重定向原型，与 2D 切件并排；作者 10-03）
## 1. 摘要（3–6 行）
- 已把作者 Tripo GLB 接入开发路由：带 `?model=` 时左 2D / 右 3D 共用相机与 1.70 m 比例尺；无参数时完整保留原 2D 演示。
- 原 2D 的方向/轮播、程序/片段步态、10 片段/剑招、7 类装备、重量/速度/采样与 20 人压力控制均保留，并与 3D 共用事件日志。
- 已实现三阶 toon/原材质、反面扩张描边、八方向/自动转台、GLB 动画、1/20 带骨克隆与 Mixamo/UE 片段重定向。
- GLTFLoader/试点实现不进生产产物；四项指定检查全绿，浏览器 CPU 与截图仍待协调者实测。
## 2. 产出（文件、行数、主要章节）
- `packages/render/src/gltf/**`：10 文件/约 750 行；加载归一化、toon/描边、映射、aim 重定向、并排场景与 14 个专项测试。
- `apps/game/src/rig-demo.ts` 约 160 行、`style.css` +36 行：原面板恢复；仅 `?model=` 追加 3D 控制与 HUD，失败时回退 2D。
- `packages/render/src/index.ts` +17 行；`packages/render/CLAUDE.md` +12 行；pilot README 与本报告。
## 3. 关键结论与数值
- GLB：1 mesh / 1 skin / 65 Mixamo joints / 0 clips / 10,022 triangles / 1K JPEG；源高 0.999512 m，缩放 `1.70÷0.999512≈1.70083`。
- 关闭描边：1 个 3D = 10,022 triangles / 1 draw；20 个 = `10,022×20=200,440` / 20 draws；同场 2D 另加 2 draws；描边令 3D 两项翻倍。
- CPU（HUD 120 帧平均）：1 个/20 个均（待实测）；Chrome 154 在当前 macOS 执行环境退出 134，未用推算冒充实测。
- gzip：entry 157.28/170 KiB（余 12.72）；render 161.24/180（余 18.76）；WebGL 318.51/350（余 31.49）；无 GLTFLoader/pilot 实现产物。
- 映射：Mixamo Hips→pelvis、Spine2→chest、Neck/Head、Arm/ForeArm/Hand、UpLeg/Leg/Foot/ToeBase；UE 对应 pelvis、spine_03、neck_01/head、upperarm/lowerarm/hand、thigh/calf/foot/ball。
## 4. 开放问题（附默认值）
- 默认 toon 开、描边关、1 实例；CPU/观感/移动端显存复测后再决定是否继续，正式角色管线仍以 2D 为主。
- 左侧头发肉色属源贴图瑕疵；默认不改 GLB，后续回 Tripo/贴图流程修复。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；开发试点不改变 2D rig、2 draw call 契约、正式美术路线或体积预算。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- 后续 3D 评审记录：补 1/20 实例 CPU、移动端 FPS/显存、八方向截图与是否继续 Tripo 管线的结论。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 冻结锁安装；✅ `pnpm check`（129 files/857 tests、923 内容）；✅ game build；✅ strict ID（new=0）。
- ✅ 有/无 skin；✅ toon/baseColor/描边；✅ Mixamo/UE；✅ 方向误差 ≤5°；✅ 12 fps/rate/hit/end；✅ `SkeletonUtils.clone`。
- ✅ 无参数为原 2D 演示；✅ 带参数左右并排且原控制完整；✅ 生产体积通过；⚠️ CPU/截图受浏览器启动限制待实测。
- 截图：运行 `pnpm dev`，打开 `http://localhost:5173/rig-demo?model=/pilot/zhujue_tripo_v1.glb`；确认左 2D 右 3D，关闭自动旋转/描边，逐点 `0° 45° 90° 135° 180° 225° 270° 315°` 截图，再切 `20` 记录 HUD；`/rig-demo` 无参数为原演示。
