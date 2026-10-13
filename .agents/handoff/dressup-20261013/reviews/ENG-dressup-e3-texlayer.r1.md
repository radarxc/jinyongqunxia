VERDICT: FAIL

## 逐项结论

- 写集与素材保护：通过 —— `git status` 仅列出任务允许的脚本、报告和 `eq_jinzhuang_tex/**`；没有修改基础库、A4/A5/E2 文件或已批准素材。
- 对齐实现：通过 —— [bake_texture_layer.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-e3-texlayer/tools/model3d/dressup/bake_texture_layer.py:141) 使用 9 个躯干关节、`umeyama(..., allow_mirror=False)`、正行列式检查及逐骨 LBS；实际残差和各骨角度已写入 `layer.json`。
- 沿模板法线射线烘焙：不通过 —— [bake_texture_layer.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-e3-texlayer/tools/model3d/dressup/bake_texture_layer.py:346) 仍然在第 355 行直接调用 `nearest_surface`，没有从 `p - 5 mm*n` 沿法线发射射线、选择最外侧交点，也没有“射线无命中才回退最近点”的实现。
- 最近面实现：不通过 —— 第 306 行另写的质心 KDTree 固定 `k=16` 实现没有复用 A1 `common.nearest_triangle` 的包围半径扩候选保障，可能漏掉质心较远但表面实际最近的大三角。
- alpha 清理：不通过 —— 第 364 行仅做全图 `binary_closing`，随后 Gaussian 羽化；没有逐 UV 岛的形态学开运算、开闭组合、孤点清除及衣摆/袖口轮廓平滑。
- 返修统计与元数据：不通过 —— [layer.json](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-e3-texlayer/assets/default/model3d/dressup/garments/eq_jinzhuang_tex/layer.json:166) 只有最近面 `hitRate` 和距离分布，缺少射线命中率、射线无命中回退纹素数、清理前后衣服纹素数。[报告](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-e3-texlayer/tools/agents/reports/ENG-dressup-e3-texlayer.md:17) 同样没有这些强制实测数字，且仍把“最近面取色”当作最终实现。
- 质检图产物：不通过 —— 强制新增的 `preview_front_detail.png` 缺失；脚本第 506–513 行也未生成该文件。
- 视觉质量：不通过 —— `preview_front.png`/`preview_compare.png` 中交领被烘成纵向破碎色块，腰带不连续，袖口及衣摆为明显锯齿撕边；`preview_back.png` 的腰带和后衣摆同样碎裂，并存在孔洞、肤色泄漏与孤立色块。没有达到协调者要求的“交领、腰带、袖口清楚且与底板一致”。
- 区域约束与覆盖率：通过 —— `torsoUpper=0.9881`、`torsoLower≈1.0`，双上臂为 1.0，双前臂为 0.9999/0.9750；head、neck、hand、shin、foot 均为 0。RGBA 为 2048²、非预乘，alpha=0 的 RGB 确认为 0。
- 三模板共 UV：通过 —— 代码按索引与 UV `array_equal` 核对，产物列出 medium/small/tall；合成测试包含修改一个 UV 后剔除的反例。
- manifest 与哈希：通过 —— [manifest.yaml](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-e3-texlayer/assets/default/model3d/dressup/garments/eq_jinzhuang_tex/manifest.yaml:1) 字段齐全、状态为 `draft`；层贴图、源 GLB、模板 body 和两张底板哈希与实际内容一致。
- 自测覆盖：不通过 —— `python3 tools/model3d/dressup/tests_texlayer.py` 实跑 5/5 通过，但测试仍只验证最近面采样；没有覆盖法线射线最外侧交点、无命中回退统计和逐岛开/闭清理。`selftest.py` 在本次只读沙箱因无可写临时目录未能复跑，此环境限制不是本次 FAIL 的依据。
- 性能与门禁：部分通过 —— 现有旧算法产物记录 39.12 s、939.48 MiB，满足预算；报告声称 `pnpm check` 全绿。但替换成规定的射线算法后必须重新实测，现有数字不能作为返修实现的性能证据。

## 返修说明

1. 在 `bake_texture_layer.py` 实现标准 cage/ray bake：每个候选纹素从 `p - 5 mm*n` 沿 `+n` 发射，限制在 `--max-distance-mm` 内，取对齐后整身表面的最外侧交点。用 NumPy 向量化和三角 AABB 网格或 KD 分桶，不新增依赖。
2. 仅在射线无命中时回退 A1 `common.nearest_triangle`；不要继续使用当前无包围半径保障的固定质心 `k=16` 版本。
3. 在 `layer.json.bake` 至少记录射线候选数、射线命中数/命中率、回退纹素数和距离分布；记录 alpha 清理前、清理后的衣服纹素数。报告第 3 节同步真实实跑数字。
4. 按 UV 岛执行形态学开、闭，去孤点、补小洞；对衣摆和袖口边界进行轮廓平滑后再羽化 1–2 px，并继续保证禁区 alpha=0、岛外只扩边 4 px。
5. 补充合成测试：嵌套内外套筒证明选择“最外侧”交点；无交点时证明回退并计数；加入孤点去除、小洞填补和区域边界不越界断言。
6. 重新生成全部层贴图、JSON、manifest 和质检图，并新增 `preview_front_detail.png`，清楚放大胸口交领、腰带及双袖口。
7. 目视确认正背面腰带和袖口连续、交领结构接近底板，衣摆无锯齿撕边、孔洞或孤立块；然后重跑四条验收命令，更新 manifest 哈希/大小及报告中的真实耗时、峰值内存和统计。

## 需作者确认

无。