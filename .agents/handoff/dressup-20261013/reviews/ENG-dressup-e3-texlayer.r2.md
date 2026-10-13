VERDICT: FAIL

## 逐项结论

- 写集与禁区：通过 —— `git status --short` 仅列出任务允许的两个脚本、报告及 `eq_jinzhuang_tex/**`；基础库、A4/A5/E2 和已批准输入素材均未改动，也未新增依赖。
- 对齐与射线烘焙：通过 —— [bake_texture_layer.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-e3-texlayer/tools/model3d/dressup/bake_texture_layer.py:162) 使用 9 个躯干关节 Umeyama、禁止镜像并逐骨 LBS；法线射线从 `p-5mm*n` 出发取最外层交点，无命中才回退最近面。`layer.json` 记录射线命中率 83.494%、回退 243,337 纹素及距离分布。
- 第 2 轮要求的 3D 衣服标签：不通过 —— [bake_texture_layer.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-e3-texlayer/tools/model3d/dressup/bake_texture_layer.py:424) 仍是“逐 UV 岛”开闭和二维高斯平滑；[同文件](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-e3-texlayer/tools/model3d/dressup/bake_texture_layer.py:486) 仍逐纹素分类。没有“模板顶点衣服度、3D 两环多数/Laplacian 平滑、重心插值”，跨 UV 岛一致性没有实现。
- 衣服判定语义：不通过 —— [bake_texture_layer.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-e3-texlayer/tools/model3d/dressup/bake_texture_layer.py:489) 将躯干、髋和双臂区域直接并入 `solid`，随后 `support |= solid`，使这些区域覆盖率按区域先验被强制成 100%，没有落实“Lab 衣服概率 × 区域约束”。后续还以固定 Lab 明度 45/55 补色，不是完全由底板样本判定。
- 羽化与 gutter：不通过 —— [bake_texture_layer.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-e3-texlayer/tools/model3d/dressup/bake_texture_layer.py:494) 仍在 UV 画布上高斯羽化；[第 519 行](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-e3-texlayer/tools/model3d/dressup/bake_texture_layer.py:519) gutter 明确只有 4 px，而返修要求 RGB 与 alpha 同时扩边至少 8 px。
- 图片质检：不通过 —— [preview_front_detail.png](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-e3-texlayer/assets/default/model3d/dressup/garments/eq_jinzhuang_tex/preview_front_detail.png) 的胸口、肩臂、前臂、腰部仍有大量连续浅色点线；领口、袖口和衣摆边缘呈明显锯齿。[preview_back.png](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-e3-texlayer/assets/default/model3d/dressup/garments/eq_jinzhuang_tex/preview_back.png) 的双袖、肩背、腰背也有同类接缝。未满足“任何视角无浅色接缝点线、领口/袖口无撕边”。
- 新增边缘质检图与指标：不通过 —— [save_previews](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-e3-texlayer/tools/model3d/dressup/bake_texture_layer.py:628) 没有生成强制要求的 `preview_edges_detail.png`；`layer.json` 和报告也没有分界平均转角或其他锯齿度量。
- 三模板与数据产物：通过 —— 三套模板均列入 `templates`，代码逐位比较索引和 UV；PNG 为 2048×2048 RGBA，实核 alpha 计数与 JSON 一致，alpha=0 的 RGB 全零，SHA-256 与 manifest 一致。覆盖率数字和 112.83 s / 1240.83 MiB 性能数字达到门槛。
- 合成测试：部分通过 —— `PYTHONDONTWRITEBYTECODE=1 python3 tools/model3d/dressup/tests_texlayer.py` 实跑 8/8 通过；但 [tests_texlayer.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-e3-texlayer/tools/model3d/dressup/tests_texlayer.py:85) 未测试 3D 同位点跨 UV 岛一致、两环顶点平滑、只在 3D 衣/皮分界羽化及至少 8 px gutter，因此没有覆盖本轮失败根因。
- 报告真实性：不通过 —— [报告第 23–28 行](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-e3-texlayer/tools/agents/reports/ENG-dressup-e3-texlayer.md:23) 一面写“偏离处：无”，一面明确记录只有 4 px 扩边且“仍能看见少量岛缝”；[第 41 行](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-e3-texlayer/tools/agents/reports/ENG-dressup-e3-texlayer.md:41) 又将目视质检标为通过，与图片和返修验收相冲突。

## 返修说明

1. 删除逐 UV 岛标签清理路径。先在模板顶点上完成射线/回退、取色和 Lab 衣服概率计算；焊接 UV 接缝处共享同一 3D 位置的重复顶点，再按真实网格邻接做两环多数或 Laplacian 平滑。
2. 将顶点衣服度按三角重心插值到纹素。衣服内部 alpha 固定 255，只在这个 3D 标量产生的衣服/皮肤分界做 1–2 px 亚纹素羽化；不得把 UV 岛边缘当衣服边缘。
3. 移除 `support |= solid` 的全区域强制覆盖及固定明度 45/55 补色。区域只能作为允许/禁止掩码，衣服标签须由底板学习得到的分类结果决定。
4. 最后把 RGB 与 alpha 一起向 UV 岛外做至少 8 px 最近有效纹素扩边，并新增测试精确断言扩边宽度。
5. 新增 `preview_edges_detail.png`，清楚放大领口和双袖口；在 `layer.json` 与报告记录分界平均转角或可复现的锯齿指标。
6. 增加跨 UV 接缝合成测试：同一 3D 位置拆成两个 UV 岛后，衣服度、阈值结果及 alpha 必须一致；同时测试衣区内部全不透明、羽化仅位于真实 3D 分界。
7. 重跑真实 2048² 烘焙并逐张检查正面、背面、胸腰袖细节和边缘细节。浅色点线、领口/袖口撕边消失后，再更新 SHA、manifest、JSON 和报告实测数字；报告不得继续把可见岛缝列为可接受开放问题。

## 需作者确认

无。