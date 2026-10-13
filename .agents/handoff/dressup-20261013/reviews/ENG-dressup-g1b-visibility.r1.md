VERDICT: FAIL

## 逐项结论
- 写集与禁区：通过 —— 改动均位于声明的工具、报告和 `eq_jinzhuang/**` 范围内；未改依赖、运行时、GLB、`glb_io.py` 或已批准素材。三套 skin joints 与 inverseBindMatrices 逐字节一致。
- visibility 视角与姿态配置：通过 —— 默认 `visibility`、保留 `rays`；128 个 Fibonacci 方向含上下极点，姿态为 bind + idle/walk/run 各 6 帧，共 19 姿态。
- 正交深度光栅：不通过 —— [bake_hide_mask.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-g1b-visibility/tools/model3d/dressup/bake_hide_mask.py:438) 每个衣物三角仅取约 15 个离散样本，[bake_hide_mask.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-g1b-visibility/tools/model3d/dressup/bake_hide_mask.py:471) 再以 `15×15 maximum_filter` 扩张，不是逐三角重心插值的深度光栅。真实 medium 资产在 256² 下约为 6.64 mm/像素，该核宽约 99.6 mm、单侧扩张约 46.5 mm，足以跨过任务规定的 30 mm 开口；2 mm 容差因此不是唯一遮挡容差。身体深度同样仅使用顶点加 `3×3` 扩张。
- 可见性判定与形态学：部分通过 —— `n·d > 0.05`、任一组合可见即保留、2 mm 深度比较、开运算、仅回填原始不可见小岛、`neverHide` 和 seam 保护逻辑均已实现；但输入深度图的过度屏幕空间扩张会虚构衣物遮挡，故最终判定不可信。
- holes 门禁：不通过 —— [validate.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-g1b-visibility/tools/model3d/dressup/validate.py:510) 只把身体顶点作为 `body_samples`，并仅在顶点 UV 上采样遮罩；隐藏区域若位于三角面内部而顶点未隐藏，就完全不会进入 `hidden_points`。审核用纯内存四顶点方形复现：遮罩中央 256 个纹素直接暴露、四个顶点遮罩值均为 0，函数仍返回 `reportedHoleRate: 0.0`。此外 holes 又复用了 `15×15 maximum_filter`，无法作为独立黑洞证据。
- 合成测试：不通过 —— 短筒裙、筒内隐藏和正确场景 holes=0 用例均能通过，旧 rays 也被断言会误藏；但 [tests_hidemask.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-g1b-visibility/tools/model3d/dressup/tests_hidemask.py:252) 只有“正确场景应为 0”，没有“面内暴露必须非 0”的反例，因此未发现上述核心漏报。
- 三模板指标：不通过 —— JSON 中确实记录 bind visible=0、动作 visible≤2%、holes 全 0；但 holes=0 和遮罩本身均由上述错误光栅方法生成，不能证明达到验收目标。三份 report 仍为 `level: fail` 的既有 E2b 几何问题可按任务说明保留。
- 图片质检：不通过 —— 三张 L8 遮罩格式正确，三套 mask preview 可打开，三张 holes preview 均无洋红标记，也无文字、水印或现代元素；但 holes preview 来源于会漏报面内隐藏纹素的算法，视觉上没有洋红不能证明没有黑洞。
- 资产元数据：不通过 —— [manifest.yaml](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-g1b-visibility/assets/default/model3d/dressup/garments/eq_jinzhuang/manifest.yaml:49) 仍声称使用“80 mm 九向射线”、旧覆盖率和 visible≤0.6602%，与本次 visibility 产物矛盾。
- 日志与报告真实性：不通过 —— [bake.tpl_f_small.log](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-g1b-visibility/assets/default/model3d/dressup/garments/eq_jinzhuang/bake.tpl_f_small.log:1) 记录覆盖率 56.5130%，而最终 fit 为 57.4581%；报告把该不对应最终产物的 131.807 秒写成最终烘焙耗时。报告也未列出新增的两个 bake log。
- 指定检查证据：通过但不足以放行 —— 执行日志显示 `tests_hidemask.py` 16/16、`selftest.py` 7/7、冻结安装和 `pnpm check` 全绿；`git diff --check` 也通过。但现有测试未覆盖上述光栅和 holes 漏报，绿灯不能替代任务语义。

## 返修说明
1. 用真正的正交三角 z-buffer 替换 `_garment_surface_samples + maximum_filter`：逐投影三角计算覆盖像素、重心坐标与插值深度；身体和衣物均如此处理。可用一致边规则或小规模 MSAA，但不得用约 10 cm 的方形膨胀代替三角覆盖；2 mm 只用于深度比较。
2. holes 检查必须光栅化身体三角面，并对每个片元插值 UV 后采样 `hideMask`；比较完整身体、隐藏身体和衣物深度，统计直接暴露的隐藏身体片元，而不是只检查身体顶点。
3. 增加至少这些回归：大斜三角内外覆盖、30 mm 开口不被横向扩张封死、三角面中央白色遮罩而顶点全黑时 holes 必须非 0、正确包覆时 holes=0，以及 256/512 深度图结果收敛。
4. 用修正后的光栅器重烘三模板，重新生成 mask、mask preview、holes preview、fit/report，并重新核验 penetration 与 holes。
5. 更新 `manifest.yaml` 的算法、覆盖率和门禁数字；删除或重出与最终产物不一致的 bake log。报告中的覆盖率、耗时和文件清单必须对应同一次最终烘焙。
6. E2b 的翻面、边长和 small close-fit 失败继续保持 `fail/experimental`，不要通过扩大遮罩规避。

## 需作者确认
无。