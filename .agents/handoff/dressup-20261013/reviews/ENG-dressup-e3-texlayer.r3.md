VERDICT: FAIL

## 逐项结论

- 写集与仓库状态：通过 —— 仅新增任务允许的 12 个文件；未修改基础库、A4/A5/E2、依赖、门禁或已批准素材。
- 对齐与单位：通过 —— [bake_texture_layer.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-e3-texlayer/tools/model3d/dressup/bake_texture_layer.py:170) 使用 9 个躯干关节 Umeyama、拒绝镜像并逐骨 LBS；产物记录 RMS 1.916%H、det=1、逐骨角度和带单位字段。
- 逐纹素射线烘焙：不通过 —— [bake_texture_layer.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-e3-texlayer/tools/model3d/dressup/bake_texture_layer.py:563) 只对模板顶点射线取色，[第 573 行](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-e3-texlayer/tools/model3d/dressup/bake_texture_layer.py:573) 再重心插值顶点颜色；没有按每个 UV 纹素的 `raster.positions/normals` 求真实交点。JSON 中的 `rayHitTexels` 也是由顶点命中布尔量插值得出，并非真实纹素射线计数。
- 掠射命中治理：不通过 —— [raycast_outermost](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-e3-texlayer/tools/model3d/dressup/bake_texture_layer.py:381) 仅选距离最远交点，没有计算射线与命中三角法线夹角，也没有在 `>70°` 时选择下一个正对交点或邻域加权。`layer.json` 和报告均没有要求的掠射命中数。
- 岛内颜色限制：不通过 —— [第 521–525 行](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-e3-texlayer/tools/model3d/dressup/bake_texture_layer.py:521) 对 128 个衣区顶点做“空间最近高置信衣色”填充，仍可能跨褶皱拖色；第三轮要求最近有效填充只进入 UV 岛外 gutter，岛内必须来自射线命中或明确的局部加权。
- 1.5 px 等值线羽化：不通过 —— [scores_to_alpha](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-e3-texlayer/tools/model3d/dressup/bake_texture_layer.py:551) 只是把衣服度 `0.45–0.55` 映射为 alpha，没有求 0.5 等值线的亚纹素有向距离，也没有实现固定 1.5 px 羽化宽度。距离变换仅用于岛外 gutter。
- 合成测试：部分通过 —— `tests_texlayer.py` 复跑 10/10、退出码 0；但没有掠射三角回退测试，也没有断言等值线羽化宽度为 1.5 px，因而未覆盖两项缺失实现。本审核只读环境没有可用临时目录，`selftest.py` 在进入断言前失败，未据此判代码错误。
- 质检图：不通过 —— [preview_edges_detail.png](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-e3-texlayer/assets/default/model3d/dressup/garments/eq_jinzhuang_tex/preview_edges_detail.png) 中领口和双袖口仍有明显锯齿/撕边，袖口翻边纹理基本丢失；[preview_compare.png](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-e3-texlayer/assets/default/model3d/dressup/garments/eq_jinzhuang_tex/preview_compare.png) 中底板清楚的横向腰带、交领叠襟和袖口结构在结果里明显变糊或缺失，衣摆还出现破碎尖角，未满足“细节不得较第 2 轮退化、与底板一致”。
- 接缝与禁区：通过 —— 当前正背图未见第二轮的浅色 UV 点线；胸口主体不透明；脸、颈、手、小腿和脚没有衣服色。
- 覆盖与性能：通过 —— `torsoUpper/Lower`、上臂、前臂达到门槛，head/hand/shin/foot 为 0；产物记录 43.78 s、952.61 MiB，满足 `<120 s / <3 GiB`。
- 三模板与入库元数据：通过 —— 三套模板均列入 `templates`；manifest 的 ID、kind、slot、模板、Tripo 项目 ID、源件/底板哈希、层哈希、大小和 `draft` 状态齐全且与文件一致。
- 报告：不通过 —— 7 节、44 行和 B3 交接格式合格，但遗漏掠射命中数；“偏离处：无”及“领/袖口无撕边”的结论与代码和质检图不符。

## 返修说明

1. 将衣服标签与颜色路径分开：衣服度继续在焊接后的模板顶点上做两环平滑；RGB 则必须对每个候选 UV 纹素使用 `raster.positions/normals` 单独射线取样，不能再由顶点颜色重心插值。
2. 射线求交保留同一射线上的多个交点，按由外到内检查命中三角法线；夹角 `>70°` 的交点计为掠射并跳过，选择下一个更正对的交点。没有合格交点时才用明确的局部邻域加权或最近面回退，并分别统计 `grazingHits`、射线命中和回退数。
3. 删除岛内的全局最近高置信顶点补色。最近有效纹素复制只能发生在 `~raster.covered` 的至少 8 px gutter。
4. 从重心插值后的连续衣服度提取 0.5 等值线，按纹素到等值线的亚纹素有向距离生成固定 1.5 px 线性羽化；不要继续使用 `0.45–0.55` 概率区间代替像素距离。
5. 为掠射交点改选、岛内禁止最近填充、1.5 px 羽化宽度分别补回归断言，然后重新生成全部产物。
6. 重新目视验收：交领叠襟线、横向腰带、腰带结及两条垂带必须清楚；双袖口须保留底板的翻边结构；领口、袖口和衣摆不得有锯齿、撕边或拖影。报告补写掠射命中数，并如实更新实现偏离和质检结论。

## 需作者确认

无。