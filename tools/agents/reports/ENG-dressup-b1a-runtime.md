# ENG-dressup-b1a-runtime 报告 · 3D 纸娃娃换装 · B1a · three.js 运行时核心 packages/render/src/dressup（共享骨架 / 插槽 / unlit / 区域遮罩）
## 1. 摘要（3–6 行）
完成 `packages/render/src/dressup/` 五个运行时模块与四个 Node 测试文件，只做 AR-102 指定的共享骨架、插槽矩阵、区域遮罩与 unlit。
身体克隆后合为单一 Skeleton；装备按清洗骨名重映射并显式传 bindMatrix，缺骨权重清零归一。
`_region` uint32 掩码、neverHide、prop socket·gripAdjust、骨长 position 微调及持械指骨覆盖均有内存对象测试。
返修补齐 PBR 全纹理所有权与 V8 堆采样；专项 16/16、render 211/211、全仓 1302/1302 通过。

## 2. 产出（文件、行数、主要章节）
- 源码 682 行：`types.ts` 164、`skeleton-frame.ts` 70、`materials.ts` 69、`actor.ts` 374、`runtime.ts` 5。
- 测试 410 行：`skeleton-frame.test.ts` 56、`materials.test.ts` 45、`actor.test.ts` 86、`actor-runtime.test.ts` 223；共 16 条。
- `pnpm install --frozen-lockfile`：通过，锁文件已最新；649 ms，pnpm 9.15.9，未改锁文件。
- `pnpm --filter @tianshu/render test`：43/43 文件、211/211 tests，1.94 s。
- `pnpm check`：通过；183/183 文件、1302/1302 tests；1777 内容文件/1708 对象/65 地图；render 166.66/180 KiB、WebGL 205.11/350 KiB。

## 3. 关键结论与数值
- API：`createDressupActor({bodyUrl,frameUrl,heightM,loader?,unlit?})`——加载并装配一个按身高缩放的共享骨架角色。
- API：`equip(spec): Promise<void>` / `unequip(id)`——增量装卸 garment、hair 或 prop，并重算遮罩与统计。
- API：`setHideMask(regions)`——调试遮罩与装备 `hideRegions` 求并集，全部 `neverHide` 最后剔除。
- API：`setBoneLength(tweaks)`——首次 update 前把指定子骨 rest position 乘 0.97~1.03，不写 bone.scale。
- API：`playClip(name,fade?)` / `update(dt)`——直接播模板 clip；mixer 后覆盖持械手指骨，不 retarget。
- API：`setHead(url|null,{skinTint?})`——阶段 D 前 resolved no-op；注释固定 `inv(IBM_neck^目标) · IBM_neck^作者`。
- API：`stats()` / `dispose()`——返回 drawCalls、triangles、每帧共享骨架上传估计 1，并幂等释放自有 GPU 资源。
- 返修：unlit 替换前收集身体/装备全部纹理；卸装或销毁时 baseColor/normal/roughness/metalness 与现材质纹理去重释放。
- 一致：shader 使用 `_region` float→uint、固定 cache key、uint `uHideMask`；body `castShadow=false` 避免未遮罩 depth pass。
- 一致：GLTFLoader 自定义属性小写、无参 `bind` 会 calculateInverses、renderer 每帧按 Skeleton 去重 update，均以 three r186 源码核对。
- 测试：clone 后单 Skeleton、显式 bind 的 inverses 逐元素不变、缺骨归零归一、socket 世界矩阵误差 <1e-6、遮罩/骨长/unlit/握拳覆盖。
- 零分配实测：播放 clip、装备 gripR prop 后预热 10000 帧；V8 1-byte 堆采样以短生命周期对象校准，再比较连续两段各 600 帧，完整 actor.update 调用树新增采样字节为 0；长期存储身份亦不变。
- 技术来源（访问 2026-10-07）：[SkinnedMesh](https://threejs.org/docs/pages/SkinnedMesh.html)、[Material](https://threejs.org/docs/pages/Material.html)、[r186 GLTFLoader](https://github.com/mrdoob/three.js/blob/r186/examples/jsm/loaders/GLTFLoader.js)、[r186 WebGLObjects](https://github.com/mrdoob/three.js/blob/r186/src/renderers/webgl/WebGLObjects.js)。

## 4. 开放问题（附默认值）
- `setHead` 默认保持 resolved no-op 到阶段 D；不猜作者模板 IBM，也不使用运行时 neck.matrixWorld。
- `boneTextureUploads=1` 是共享 Skeleton 的每次 render 估计；无 WebGL 的 B1a Node 测试不能读取真实 GPU 上传计数。
- 当前跨区域三角仍服从 flat provoking vertex；默认由离线资产后续拆点，不在浏览器计算几何。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；实现遵循 AR-102 / AR-105 与 `tech/10` §3.2、`tech/11` §8。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- B1b / 分块：动态入口只指向 `dressup/runtime.ts`；接 `render-dressup`、24 KiB 预算与 type-only 根导出，不改本 API。
- B2 / 预览页：使用 actor.root、equip/unequip/playClip/setBoneLength/stats；真实 GLB 与 WebGL 下核对外观、ΔE 与上传计数。
- C1 / 端到端：garment/hair 的 fit 必须提供 hideRegions/neverHide，prop 必须提供 socket，body 每个 SkinnedMesh 必须有 `_region`。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 类型覆盖当前 skeleton/fit 产物；帧 URL Promise 缓存、socket/区域双向表、30 指骨姿势入口齐全；校验仍留 data 包。
- ✅ skinIndex 按 sanitize 骨名重映射；属性先 clone；缺骨权重清零归一；装备 boneTexture 释放；所有 bind 显式传矩阵。
- ✅ 身体经 SkeletonUtils.clone 后多 primitive 合为单 Skeleton；根按 `heightM/heightMu` 缩放、y=0、沿用离线 +Z。
- ✅ prop 世界矩阵、遮罩 neverHide、骨长范围及不改 scale、unlit dispose、shader 字符串、持械手指均测试通过。
- ✅ PBR 四类纹理各 dispose 一次；V8 实测稳态 actor 路径新增采样 0 字节；actor.ts 374 行 <400。
- ✅ 冻结安装、render test、`pnpm check` 实际通过；10 个新增文件逐一 `git diff --check --no-index` 通过；只写允许路径。
- ⚠️ B1b 尚未接独立块/预算，B2 尚未浏览器实走，C1 尚未真实 garment/hair 端到端；均不在 B1a 写集与验收范围。
