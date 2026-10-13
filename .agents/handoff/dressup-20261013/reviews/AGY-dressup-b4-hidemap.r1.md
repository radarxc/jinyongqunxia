VERDICT: FAIL

## 逐项结论

- 写集与仓库状态：通过 —— 所有修改及未跟踪文件均位于允许写集内，`git diff --check` 无错误，未发现素材或写集外文件改动。
- 身体遮罩材质：[materials.ts](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-b4-hidemap/packages/render/src/dressup/materials.ts:31)：通过 —— `uHideMap`、`uHideMapOn` 与区域 `uHideMask` 并存；按 `vUv` 红通道阈值 discard；固定 program key；深度材质同步注入。
- 遮罩独立合成：[materials.ts](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-b4-hidemap/packages/render/src/dressup/materials.ts:108)：通过 —— 不再依赖身体底图尺寸，使用最大遮罩边长、平滑缩放及逐像素 max；输出为 `NoColorSpace`、`flipY=false`、线性过滤且无 mipmap。
- 遮罩缓存与错误传播：[actor.ts](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-b4-hidemap/packages/render/src/dressup/actor.ts:427)：通过 —— 缓存键包含模板、URL、声明尺寸和有序 ID；过期结果和末位引用会释放；同步 `unequip` 捕获 rejection，错误写入 `hideMapError` 并 `console.warn`。
- 挂头与肤色：[actor.ts](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-b4-hidemap/packages/render/src/dressup/actor.ts:471)：通过 —— `head` 复用蒙皮重映射和显式 bindMatrix，同一时刻只保留一个头；`skinTint` 乘身体原色；`setHead` 直接调用闭包 `equip`，不依赖 `this`。
- 素材索引：[dressup-assets.ts](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-b4-hidemap/apps/game/build/dressup-assets.ts:106)：通过 —— 发布主件和 fits 变体的 hideMask，索引包含 URL，`head` 分组存在，非法 fit JSON 不会被吞掉；content-plugin 桩仅改为合法 JSON。
- 预览页：[Character3dPage.vue](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-b4-hidemap/apps/game/src/pages/Character3dPage.vue:31)：通过 —— 增加头分组、身体遮罩开关、模板变体恢复，以及 `window.__dressup.hideMapError/hideMapSize`。
- 自动测试覆盖：[hide-map.test.ts](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-b4-hidemap/packages/render/src/dressup/hide-map.test.ts:136)：通过 —— 覆盖 2048 底图配 1024/512 遮罩、max 并集、缓存引用、竞态释放、开关与失败重试；素材测试从 PNG 文件头核对实际尺寸。
- 必跑命令：[AGY-dressup-b4-hidemap.md](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-b4-hidemap/tools/agents/reports/AGY-dressup-b4-hidemap.md:12)：不通过 —— 报告明确记录 `pnpm --filter @tianshu/render test` 首次仅 227/229、串行复查仍仅 228/229，rig P95 0.836 ms 未满足 `<0.8 ms`。任务要求该命令亲自运行并通过后才能结束，不能以根 `pnpm check` 通过替代。审核沙箱中的聚焦复跑又被系统临时目录 `mkdir EPERM` 拦截，没有更晚的全绿证据。
- 浏览器闸门 V2/V4：[AGY-dressup-b4-hidemap.md](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-b4-hidemap/tools/agents/reports/AGY-dressup-b4-hidemap.md:44)：不通过 —— 报告仍将劲装遮罩、三模板动作、领袖衣摆黑洞/穿模，以及挂头颈环和肤色列为待协调者实测；这正是任务规定的合入前闸门，当前没有通过证据。
- 报告结构：通过 —— 七节齐全、45 行，未隐瞒失败和待实测项。

## 返修说明

1. 在低负载、可正常创建测试临时目录的环境运行原命令 `pnpm --filter @tianshu/render test`，取得全部测试通过。不得跳过测试、修改采样、降低 `<0.8 ms` 阈值或加入负载豁免。
2. 在集成工作区用真实 G1/D1 素材完成 `/character-3d` 验收：三模板分别穿劲装运行 idle/walk/run，对比身体遮罩开/关并检查领口、袖口、衣摆；再执行挂头、换头、卸头，检查颈环和 `skinTint`。
3. 验收时确认 `window.__dressup.hideMapError === ''`，`hideMapSize` 与当前模板遮罩一致。将实际结果写入报告，替换当前“待协调者”状态。
4. 最后重跑任务列出的四条检查及 `pnpm size`，报告只登记真实退出码和最终全绿数字。

## 需作者确认

无。