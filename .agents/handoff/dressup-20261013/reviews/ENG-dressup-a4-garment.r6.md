VERDICT: FAIL

## 逐项结论

- 写集：通过 —— 相对基点仅新增任务允许的三个脚本、`garments/**`、`hair/**` 和任务报告，没有越界修改。
- 最近面与迭代口径：通过 —— [fit_garment.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a4-garment/tools/model3d/dressup/fit_garment.py:94) 的查询不再用衣物法线换面；`k=16`。每次查询和移动都位于 `rounds[]` 对应轮次内，严格件实际 74 轮、未超过 `iters=80`。
- 严格 fixture 输入：通过 —— 固定种子 102，从指定五区生成无 skin 网格；4 mm 外扩后施加最大向量幅度 `2.999970 mm` 的噪声，贴合前穿透率 `2.35294%`，满足 ≥2%。
- 严格 fixture 距离门：通过 —— 对最终 GLB 用 A1 `signed_distance(k=16)` 独立复算为体内点 0、安全距不足 0、最小距离 `0.001771115 mu`；高置信率 98.610%，遮罩含躯干/髋且不含 neverHide。
- 严格 fixture 翻面门：不通过 —— [fit_garment.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a4-garment/tools/model3d/dressup/fit_garment.py:753) 在 float64 几何上统计拓扑，随后才于第 761 行转成 float32 写出。对最终 `_fixture_bodysuit.glb` 和 raw GLB 调用同一 `_triangle_metrics`，得到 `(flipped=1, stretchOutliers=5, stretchWithinRatio=0.998636859, degenerate=0)`；翻面为面 2533，原双倍面积 `4.4476e-6`，并非原始零面积面。但 [fit.json](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a4-garment/assets/default/model3d/dressup/garments/_fixture_bodysuit/fit.json:80) 仍记录 `flippedTriangles=0` 并标为 `fitted`，违反严格验收。
- 测试覆盖：不通过 —— [tests_garment.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a4-garment/tools/model3d/dressup/tests_garment.py:405) 只信任内存中的 `pushOut.flippedTriangles`；虽重新加载最终 GLB 检查 SDF 和结构，却没有对序列化后的 float32 顶点重新检查翻面和边长，因此未拦住上述问题。
- 权重和遮罩：通过 —— 实现 slot 白名单、远端及低置信关节线段混合、Hips 裙摆先验；圆柱最近环、过滤、推离、遮罩测试有数值断言，本次只读复跑的 12 项纯测试全部通过。
- 三件诊断件：通过 —— 输入 SHA 与主检出一致；流仙裙、夜行衣、马尾均为显式 `draft`，真实高置信率、残留、安全距不足、边长和性能数字与各自当前 `fit.json` 一致，均低于 60 秒和 2 GiB。
- 跨模板 refit：基本通过 —— 恒等最大位差 `6e-8 mu`，SDF 残留为 0；非恒等件确实改变骨长、严格输出 `fitted`，目标 IBM 与合成目标模板逐字节一致。但其来源严格件当前未满足翻面门，派生产物须随来源重生成。
- GLB 契约：通过 —— 六份蒙皮输出均为一个 mesh node、一个 mesh、一个 primitive；mesh node 无 TRS，joint 顺序及 IBM 与对应模板逐字节一致，`_REGION` 为 u8 SCALAR，材质 unlit、双面且无额外纹理引用。
- 禁区与单位：通过 —— 未发现包围盒中心对齐、`HeadTop_End` 头顶、`Neck+0.006`、`bone.scale`、混用旧 rig、Blender、新依赖或硬编码绝对路径；新增数值字段具有单位后缀。
- 门禁证据：通过 —— 监督日志记录完整 `tests_garment.py` 15/15、`pnpm check` 179/179 文件和 1,286/1,286 tests、内容/构建/尺寸门禁通过。
- 报告：不通过 —— [报告](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a4-garment/tools/agents/reports/ENG-dressup-a4-garment.md:15) 声称最终翻面为 0；当前产物实际为 1。此外报告写严格件 `1.54 s / 346.97 MiB`，当前 `fit.json` 为 `1.56725025 s / 385.53125 MiB`；非恒等 refit 报告为 `0.60 s / 486.92 MiB`，当前产物为 `0.755735375 s / 461.484375 MiB`。产物晚于报告重新生成，实跑证据已失配。

## 返修说明

1. 在 float32 量化后、写 `fit.json` 前重新执行完整拓扑门禁；最好让推离回溯直接以最终 float32 几何评估。严格模式必须保证最终序列化 GLB 相对原始非零面积三角的 `flippedTriangles=0`。
2. 在 `test_fixture_strict_fit` 中同时加载 raw GLB 与最终 GLB，按全部原始非零面积三角和全部有效原始边独立断言：翻面 0、退化 0、边长合格率 ≥99%。不得只断言内存统计字段。
3. 对 refit 输出增加同类“写出后重新加载”检查；严格来源修复后重新生成严格件、恒等和非恒等 refit 产物。
4. 重新运行完整测试与门禁后，最后再更新报告，使严格件及非恒等 refit 的耗时、峰值内存、翻面等数字逐项等于最终 `fit.json`；更新报告后不得再由测试覆盖正式产物。

## 需作者确认

无。