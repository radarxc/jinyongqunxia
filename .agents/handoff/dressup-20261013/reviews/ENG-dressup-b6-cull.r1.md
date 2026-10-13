VERDICT: FAIL

## 逐项结论

- 写集：通过 —— 仅改动允许的 5 个文件；未改依赖、锁文件、资产或门禁阈值。
- Three.js 剔除依据：通过 —— 仓库实际使用 `three@0.186.1`；报告对对象级 `boundingSphere` 及首次懒计算行为的描述与源码一致。
- [culling.ts](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-b6-cull/packages/render/src/dressup/culling.ts:39)：通过 —— 24 Hz 采样全部 clip，按网格局部骨骼运动球和绑定距离构造保守包络；未在 `update(dt)` 增加计算或分配，刚性 `Mesh` 未被改写。
- [actor.ts](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-b6-cull/packages/render/src/dressup/actor.ts:342)：通过 —— 身体初始化、换装新增、卸装注销和骨长调整刷新均已接入；头、衣物和蒙皮持物都能获得对象级包络球。
- 真实资产核验：通过 —— 只读解析 tall 素体、黄蓉头和 tall 劲装，在 `run@0.5` 下逐顶点检查均无包络遗漏；包络半径约为 `0.847 / 0.364 / 0.519 mu`。
- [culling.test.ts](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-b6-cull/packages/render/src/dressup/culling.test.ts:67)：不通过 —— 三个确定性回归用例覆盖了旧球对照、actor 换装和刚性件，但本任务代码附加规则明确要求“数学 / 几何 / 编码类用属性测试（fast-check）”；该几何算法没有任何 `fast-check` 属性测试。
- 门禁与性能：通过 —— 执行日志记录 render `48/48` 文件、`232/232` 测试，全仓 `188/188` 文件、`1334/1334` 测试；100 actor / 400 装备最佳 P95 `0.278 ms`，draw call `5→5`，`render-dressup 6.70/24 KiB gzip`。监督器最终写集校验退出码为 0。
- [报告](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-b6-cull/tools/agents/reports/ENG-dressup-b6-cull.md:1)：通过 —— 31 行、七节完整，包含实现取舍、采样率、余量、坐标系、性能、体积和 5173 浏览器验收步骤。
- 禁区与素材：通过 —— 未引入禁用贴合方式、依赖或 Blender；没有 GLB/图片产出及已批准素材改动，相关素材产物检查不适用。

## 返修说明

在 `packages/render/src/dressup/culling.test.ts` 增加 `fast-check` 属性测试，至少随机覆盖：

- 1–4 根骨骼及非负归一化蒙皮权重；
- 骨骼平移和旋转、非恒等 `bindMatrix`、非 1 actor 缩放；
- 对 clip 采样姿势逐一用 `SkinnedMesh.getVertexPosition()` 验证所有蒙皮顶点位于生成的 `boundingSphere` 内；
- 用随机可见姿势构造相机视锥，断言可见顶点不会被 `Frustum.intersectsObject()` 整块剔除。

完成后重新运行三个指定命令、dressup 性能门和 `git diff --check`，并更新报告中的测试数量与结果。

## 需作者确认

无。