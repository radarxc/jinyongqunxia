VERDICT: FAIL

## 逐项结论

- 写集与禁区：通过 —— 54 个已跟踪文件和 5 个新文件均位于授权写集；未改模板、`common.py`、`glb_io.py`、依赖或门禁阈值，`git diff --check` 通过。
- 按姿势蒙皮：通过 —— 默认关闭；采用 3 环候选骨、父骨扩展、固定目标高斯—牛顿、LM 阻尼与线搜索；撕裂加强阈值为 8 mm，穿入铰链权为 40，截断至 4 骨后固定支撑集再解。
- 外展姿势契约：通过 —— 六份 fit 均声明 6°；运行时取已装备衣物最大角度，在动画采样后外展双臂，卸装恢复且稳态无逐帧分配。validate、遮罩烘焙和求解器使用同一角度。
- 动态拓扑门：通过 —— 六份交付件的 72 帧最大边伸长为 27.7–27.9 mm，低于 30 mm；塌缩三角依补充裁定仅报告。
- 穿透与破洞门：通过 —— 最大可见穿透为 small run 1.26%，低于 2%；最大 holes 为 tall run 0.016%，低于 0.05%；bind 可见穿透均为 0。六份 report 各 47 项检查且零失败。
- GLB 与素材契约：通过 —— joints 顺序和 inverseBindMatrices 与模板一致，IBM 最大误差 0；最多 4 骨；`_REGION` 为 u8 SCALAR；unlit 且只引用 baseColor。GLB、fit、report、manifest 哈希一致。
- 布衣变体：通过 —— `eq_buyi_tex/layer.json` 的 source、plate、basePlate 均为仓库相对路径，source SHA 与实际文件一致。
- 模板倒置面：通过 —— 按裁定只作影响对比而未实施；报告分别量化衣物、头和四件道具，并列出两条路线的哈希及重跑范围。
- 图片与运行时实拍：通过 —— 已查看遮罩、holes、布衣贴图预览及三体型运行时拼图；覆盖 idle、walk、run、正侧背，tall 使用对应头部。r1 的炸衣和尖刺已经消失；run 上臂及 small walk 的局部顶穿已如实登记且数值在门内。未见文字、水印或现代元素；布衣原有贴图拉丝不属于本次蒙皮回归。
- 检查记录：通过 —— 报告记录 `tests_garment.py` 38/38、`tests_hidemask.py` 24 项、`selftest.py`、冻结安装和最终 `pnpm check` 189 文件/1339 项通过；调度器最终 `finish --no-commit` 退出码为 0。本审核沙箱因禁止创建临时目录，无法独立重跑真实 GLB 解码测试。
- 报告真实性：不通过 —— [报告第 38 行](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-e2c-skinning/tools/agents/reports/ENG-dressup-e2c-skinning.md:38) 声称夹具重生成产生的耗时、内存字段“已恢复”，但相对基点仍有四处纯非确定统计差异：
  - `_fixture_bodysuit/fit.json:855,859`：`elapsedSec` 1.437768625 → 1.57629825，`peakMemoryMiB` 396.09375 → 364.265625。
  - `_fixture_bodysuit/refit_nonidentity/fit.json:192,195`：`elapsedSec` 0.798488709 → 0.857296042，`peakMemoryMiB` 450.84375 → 484.03125。
  这与“报告必须如实”及自检结论直接矛盾，因此不能合入。

## 返修说明

1. 在所有测试跑完后，将上述两个夹具 fit 文件的四个非确定统计字段恢复为基点值；不要改其他确定性字段。
2. 确认 `git diff fde3d2a0a8ceb5847ef1664029b49f2b4a6dfb41 -- assets/default/model3d/dressup/garments/_fixture_bodysuit` 为空。
3. 保持报告第 38 行不变即可；若决定保留这些副产物，则必须改为如实说明，但更合适的是删除纯耗时/内存噪声。
4. 无需重新求解衣物、重烘遮罩或重出截图。

## 需作者确认

无。