# 本任务：游戏工程 · 3D 角色试点（Tripo GLB 用 GLTFLoader 装进 /rig-demo，toon 着色、8 方向转台、骨骼动画与片段重定向原型，和 2D 切件并排；作者 2026-10-03）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。先读根 `CLAUDE.md`、`packages/render/CLAUDE.md`（rig API、2 draw call 契约、体积预算）。

## 作者要求
作者 2026-10-03 原话：「能不能用高斯泼溅算法 + 运动骨架动作 + 三视图 生成完整的3D模型，放入threejs的GLTFLoader」「等等，我看tripo也不贵啊。tripo的效果可以吗？」——协调者答：高斯泼溅不可行，图生 3D → 绑骨 → GLB 可行，先做试点对比。作者已在 Tripo 生成并导出主角·男模型：`apps/game/public/pilot/zhujue_tripo_v1.glb`（单网格 10,022 三角面、1K 贴图；**带 1 个 skin、65 个 Mixamo 命名关节 `mixamorig:Hips/Spine/Spine1/Spine2/Neck/Head/LeftShoulder/LeftArm/LeftForeArm/LeftHand/LeftUpLeg/LeftLeg/LeftFoot/LeftToeBase…` 及右侧对称、各指节；无自带动画**，所以本任务的片段重定向直接按 Mixamo 映射表做；程序仍要能处理无 skin 的 GLB）。作者反馈左侧头发贴图呈肉色（贴图问题，本任务不修，报告记）。

## 要做的事
1. `packages/render/src/gltf/`（新）：`loadPilotModel(url)` 用 three 的 `GLTFLoader`（three 已在依赖里，`three/examples/jsm/loaders/GLTFLoader.js`，不加新依赖），返回 `{scene, skinned: boolean, clips: AnimationClip[], stats}`；统一缩放到 1.70 m 身高、脚底落在 y=0、朝向 +z；材质替换为 `MeshToonMaterial`（自制 3 阶 gradientMap，保留 baseColorTexture），可选描边（反面扩张法）开关。
2. `/rig-demo` 加 `?model=/pilot/zhujue_tripo_v1.glb`：加载后与现有 2D 切件角色**并排**（同一比例尺、同一相机），8 方向偏航按钮（0°–315°）、转台自动旋转开关、toon / 原材质切换；有 skins 时用 `AnimationMixer` 播放 GLB 自带动画（下拉选择）；显示三角面、draw call、CPU 帧时间（1 个与 20 个克隆实例，`SkeletonUtils.clone`）。
3. **片段重定向原型**：把本仓库的 `tianshu-clip.v1`（`assets/default/rig/clips/clip_walk.json`、`clip_sword_attack.json`，每帧每骨 3D 方向与长度比，20 关节）应用到带骨骼的 GLB：按骨名映射表（Mixamo `mixamorig:*`（本模型就是这套，`tools/rig/clips/clip_import.py` 里已有 Mixamo 映射可复用）、UE `pelvis/spine_01/...`）把每根骨旋转到片段方向（aim 约束，父骨空间），`rate` 与事件沿用 `clip-player.ts` 的规则；没有骨骼时该模块只做单元测试（用 `tools/rig/clips/` 的合成骨架夹具）。
4. 体积：GLTFLoader 与本模块只在 `/rig-demo` 路由动态 `import()`，不进首屏与战斗 chunk；`pnpm size` 必须仍过（render 163 / 180 KiB 很紧）；过不了就把试点代码放进独立的 `pilot` chunk 并在报告写明数字，**不改 `tools/perf/budgets.json`**。
5. 测试：加载器在无 skin / 有 skin 两种夹具（用 `tools/rig/clips/` 已有的 Mesh2Motion 风格合成骨架或自写最小 GLB 字节）下的行为；重定向的方向误差 ≤ 5°；`pnpm check` 全绿；`/rig-demo` 现有测试不受影响。
6. `packages/render/CLAUDE.md` 补一节「3D 试点」：API、限制（SkinnedMesh 不走 2 draw call 合批）、1 / 20 实例实测数字。

## 约束
- 不改 `packages/core`；不改 `tools/rig`、片段 JSON、2D rig 运行时（`packages/render/src/rig/**` 只允许加导出，不改行为）；不改门禁与预算；不加新依赖；每次写入 ≤ 150 行。
- 只写：
  - `packages/render/src/gltf/**`、`packages/render/src/index.ts`、`packages/render/CLAUDE.md`
  - `apps/game/src/rig-demo.ts`、`apps/game/src/style.css`
  - `apps/game/public/pilot/**`（只读 GLB，可加 README）
  - 本任务报告

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm --filter ./apps/game build`
- `python3 tools/lint/check_ids.py --strict`

## 报告
第 3 节：1 / 20 实例的三角面、draw call、CPU 帧时间；chunk 大小与预算余量；骨名映射表（到货后）；第 7 节：交协调者在浏览器里截 8 方向对比图的操作步骤（URL、按钮）。报告 ≤ 60 行。
