VERDICT: FAIL

## 逐项结论

- 写集与仓库状态：通过 —— 所有未跟踪文件均位于允许写集内，未发现遗留调试脚本或写集外改动。
- `head.glb` 契约：通过 —— 实读为 1 mesh / 1 primitive / 1 skin，65 joints 顺序与模板一致，IBM 逐字节一致；材质为 `KHR_materials_unlit`，贴图 2048²，`_REGION` 为 u8 SCALAR 且仅含 head/neck。
- 颈桥、尺寸及实跑数据：通过 —— `fit.json` / `report.json` / manifest 的顶点、三角、字节数和 SHA 一致；报告包含骨段比例、缩放钳位、72 帧接缝、肤色和长发穿入数据。
- `hidemask.png` / 身体终止面：不通过 —— [cut_head.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/tools/model3d/dressup/cut_head.py:669) 使用多边形填充后 Lanczos 缩小，但没有保证所有规范颈环上方 texel 达到运行时丢弃阈值。反算产物发现环上 head/neck 顶点仍有 455 个采样值 `<128`，遮罩等值线后至少保留 13 个完整三角，最高达到规范环上方 `0.106498 mu`。
- `self_check_preview.png`：不通过 —— 图中清楚保留了从颈根到头顶的模板光头轮廓，而协调者要求该图“应只剩颈根断面”。这证明模板身体并未严格终止在规范颈环；当前叠头预览只是大部分残留被黄蓉头遮住。
- 遮罩门禁和测试：不通过 —— [tests_head.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/tools/model3d/dressup/tests_head.py:154) 只测试了两个较大的独立 UV 方块，无法发现实际模板中的亚像素 UV 三角漏遮；[cut_head.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/tools/model3d/dressup/cut_head.py:1049) 的 `pass_gate` 也没有遮罩完整性检查，因此错误产物仍被标成 `gateLevel: pass`。
- 旧颈几何统计：不通过 —— [cut_head.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/tools/model3d/dressup/cut_head.py:1046) 将 `oldNeckSkinTriangles` 直接写死为 `0`，[tests_head.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/tools/model3d/dressup/tests_head.py:201) 随后只断言这个常量，没有从最终拓扑真实计算。
- 任务报告：不通过 —— [AGY-dressup-d1-cuthead.md](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/tools/agents/reports/AGY-dressup-d1-cuthead.md:4) 声称“五视图未见模板头”，与 `self_check_preview.png` 直接矛盾。

## 返修说明

1. 修正遮罩烘焙，不能让亚像素三角在 Lanczos 缩小时跌破丢弃阈值。使用保守覆盖方式，例如高分辨率栅格化后 max-pool/适量膨胀，并按运行时过滤方式验证；所有规范环上方的 head/neck 三角必须完全落入白色丢弃区。
2. 将“遮罩后环上仍可见的顶点/三角数必须为 0”纳入真实产物门禁；失败时 `gateLevel` 必须为 `fail`。
3. 在 `tests_head.py` 增加亚像素 UV 岛回归，并对真实模板或等价复杂 UV 布局断言：颈环上方无可见三角、颈环下方仍保留。
4. 从最终几何真实计算 `oldNeckSkinTriangles`，不要写死为零。
5. 重新生成 `hidemask.png`、两张预览、`fit.json`、`report.json` 和 manifest。`self_check_preview.png` 必须只显示规范颈环以下的身体与颈根断面，不得再有头部轮廓；同步更正报告陈述和全部哈希。

## 需作者确认

无。