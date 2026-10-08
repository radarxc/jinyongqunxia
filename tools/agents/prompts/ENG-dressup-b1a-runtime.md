# 本任务：3D 纸娃娃换装 · 阶段 B1a · three.js 运行时核心 `packages/render/src/dressup/`（AR-102 / AR-105）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。先读根 `CLAUDE.md`、`packages/render/CLAUDE.md`、`docs/tech/11-paper-doll-3d-impl-spec.md`（§0、§4、§5、§8 是本任务规格，§9 分块、§11 禁区）、`docs/tech/10-paper-doll-3d.md` §3（运行时，全部机制来自核验）、A2 报告第 7 节（skeleton.json 消费方式）、A3 / A5 报告第 7 节（fit.json / report.json / manifest 字段），以及现有 `packages/render/src/gltf/load.ts`、`packages/render/src/battle/model-stage.ts`（GLTFLoader / SkeletonUtils 用法、normalizePilotScene）。

## 作者要求
**AR-102**：运行时只做四件事——共享骨架 bind、插槽矩阵相乘、`_region` 位掩码隐藏身体区域、unlit 材质；不在浏览器做几何计算。**AR-105**：规范窄 A 25°；唯一正本是 `assets/default/model3d/dressup/templates/tpl_f_medium/`（另有派生的 `tpl_f_small` / `tpl_f_tall`，共拓扑、共骨名）。性能：热路径零分配（根 CLAUDE.md）。

## 规格（全部来自 spec §8 与 tech/10 §3.2，已核验）
- **类型** `types.ts`：`DressupSkeletonFrame`（skeleton.json：joints / parents / bindWorld / measures / neckRing / sockets / regions / fingerPose / heightMu / mPerMu / defaultHeightM）、`DressupFit`（fit.json：kind / slot / socket / anchor / gripAdjust / hideRegions / neverHide / fitVersion …）、`DressupEquipSpec { kind: 'garment'|'hair'|'prop'; id; url; fit }`。只做 TS 类型，运行时校验交 data 包（不在本任务）。
- **`skeleton-frame.ts`**：读取并缓存 skeleton.json；`getSocket(name)`；区域名 ↔ 位（≤ 32 区）；`fingerPose` 取指骨局部四元数。
- **`materials.ts`**：`toUnlit(material)` → `MeshBasicMaterial({ map, color, side, toneMapped: false })` 并 dispose 旧材质（PBR 资产也走这里）；区域遮罩注入：`onBeforeCompile` 里属性名一律 `_region`（GLTFLoader 会把 `_REGION` 改成小写），`attribute float _region; flat varying uint vRegion; vRegion = uint(_region + 0.5);`，片元 `uniform uint uHideMask; if ((uHideMask & (1u << vRegion)) != 0u) discard;`；固定 `customProgramCacheKey`；给 SkinnedMesh 配同样注入的 `customDepthMaterial` 或设 `castShadow = false`；加载后断言 `geometry.attributes._region` 存在，缺了报枚举错误。
- **`actor.ts`**：`createDressupActor({ bodyUrl, frameUrl, heightM, loader?, unlit? })`：
  - 载模板 `body.glb` + skeleton.json；`SkeletonUtils.clone` 后**合并为一个 Skeleton**（取第一个 SkinnedMesh 的 skeleton，其余 `mesh.bind(shared, mesh.bindMatrix)`），根节点按 `heightM / heightMu` 缩放、脚底 y = 0、面朝 +Z；
  - `equip(spec)`：garment / hair 载 GLB，对每个 SkinnedMesh 按**清洗后的骨名**（`mixamorig:Hips` → `mixamorigHips`，`PropertyBinding.sanitizeNodeName`）把 `skinIndex` 重映射到模板 `skeleton.bones` 下标（重映射前 clone 属性；缺骨权重清零后 `normalizeSkinWeights`），`mesh.bind(body.skeleton, bindMatrix)` **必须显式传 bindMatrix**（无参会在共享骨架上 `calculateInverses` 污染正本；禁止任何克隆体无参 bind），dispose 装备自带 Skeleton 的 boneTexture；装备挂在角色 root 内；prop 按 `fit.socket` 挂到骨骼下的 socket `Object3D`（局部 pos / quat 来自 skeleton.json，`matrixAutoUpdate = false`），矩阵 = socket · `gripAdjust`；
  - `unequip(id)`、`setHideMask(regions)`（已穿装备的 hideRegions 并集自动下发；neverHide 永不隐藏）、`setHead(url|null, { skinTint? })`（阶段 D 前可 resolve 空实现，但签名与 `bindMatrix = inv(IBM_neck^目标) · IBM_neck^作者` 的注释要写好）、`setBoneLength(tweaks)`（子骨 `position` × s，限 0.97~1.03；**不用** `bone.scale` 配对法；在 clone 之后、首次 `skeleton.update` 之前施加）、`playClip(name, fade?)`（复用模板 clip，**不调用 retargetClip**；持械时在 `mixer.update` 之后把该手 15 根指骨写成 `fingerPose.fist`）、`update(dt)`（零分配）、`stats()`（drawCalls / triangles / boneTextureUploads 估计）、`dispose()`。
- **`runtime.ts`**：唯一对外入口（后续只能被 `import()` 动态引入），导出 `createDressupActor` 与类型；`packages/render/src/index.ts` 本任务**不改**（B1b 再处理 export type 与分块）。

## 测试（node 环境，无 DOM / WebGL；不加载真实 GLB，用 three 对象在内存里搭）
- skinIndex 按骨名重映射（含缺骨清零 + 归一）；显式 bindMatrix 后共享 Skeleton 的 `boneInverses` 不被改写（与 bind 前逐元素相等）；clone 后合并为单一 Skeleton；
- socket 矩阵：骨骼动一帧后 prop 世界矩阵 = 骨世界 · socket 局部 · gripAdjust（误差 < 1e-6）；
- 遮罩位运算：区域名集合 → `uHideMask`，neverHide 不进掩码；
- `setBoneLength`：子骨 position 改写正确、超出 0.97~1.03 报错；不出现 `bone.scale`；
- `toUnlit`：替换为 MeshBasicMaterial、`toneMapped=false`、旧材质被 dispose；
- `update(dt)` 稳态零分配（照 `packages/render/src/rig/instance-buffer.test.ts` 的做法测）。

## 约束
- 只写 `packages/render/src/dressup/{types,skeleton-frame,materials,actor,runtime}.ts` 与同目录 `*.test.ts`、本任务报告。
- 不改 `packages/render/src/index.ts`、`content-plugin.ts`、`check_size.mjs`、`budgets.json`、`vite.config.ts`（B1b 负责）；不加依赖；只用 render 主块里已有的 three 核心 API 与 `three/examples/jsm` 的 GLTFLoader / SkeletonUtils（已在 battle-model3d 懒块）。
- 不改 `packages/core`；不改门禁阈值；不加"高负载跳过"。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm --filter @tianshu/render test`
- `pnpm check`

## 报告
第 3 节写导出 API 清单（签名 + 一句话语义）、测试覆盖与零分配实测；第 7 节写交给 B1b（分块与预算）、B2（预览页）、C1（端到端）的接口与已知限制。报告 ≤ 70 行。
