VERDICT: FAIL

## 逐项结论

- 写集：通过 —— 所有改动均位于允许的两个头部目录、`cut_head.py`、`tests_head.py` 和本任务报告内。
- `cut_head.py --texture`：通过 —— 实现了整数倍尺寸与 BOX 均差校验、高清调平差值同步、共享顶点连通分岛、统一缩放无旋转排布、gutter 与最近纹素外扩、UV 重写及完整诊断字段。
- 分析隔离与回归：通过 —— 独立对比六份 GLB 与基点，位置、索引、法线、关节、权重、`_REGION`、颈片 UV、skin joints 和 IBM 均不变，仅头部 UV 与贴图改变；六份 `skinTint`、`deltaE`、`ring`、`hideMask`、`diagnostics.color` 及 hidemask 字节也与基点一致。
- 测试覆盖：通过 —— 新增测试覆盖多岛排布、缩放一致性、边界与间距、UV 采样误差、坏贴图退出 2、分析隔离及无 `--texture` golden 回归；测试列表共 30 项。
- 六份产物：通过 —— 全部为 `draft/pass`；线性密度增益 2.019–2.376，接缝 p95、ΔE、G1、鼓包、遮罩和动作帧门禁均通过；manifest 哈希与实际文件一致。
- GLB 契约：通过 —— `_REGION` 为 u8 SCALAR，材质含 `KHR_materials_unlit` 且使用 baseColor，mesh 节点无 TRS；模板 skin joints 与 IBM 保持一致。
- 8K 本地素材：通过 —— 两张 JPEG 均为 8192²，sha256 与 fit 记录相符；并确认 JPEG 字节逐字节等于相应原始 8K GLB 的 baseColor image。
- 图片：通过 —— 六份预览及六张 density 对照均已查看；眉、睫毛、虹膜和发丝清晰度提升明显，未见新增发际线、耳后或颈部接缝和渗色。
- 报告：不通过 —— `tools/agents/reports/ENG-dressup-h1-head-density.md:10` 写 `tests_head.py` 为 1,439 行、`+239 / −3`，实际为 1,441 行、`+241 / −3`，不符合“报告必须如实”。
- 后续命令：不通过 —— 报告第 45 行使用不存在的仓库根路径 `templates/<模板>`，且没有按要求给出可直接用于 `tpl_f2` 的重切命令；实际模板路径应从 `assets/default/model3d/dressup/templates/` 开始。

## 返修说明

只需修报告：

1. 将 `tests_head.py` 数字改为“1,441 行，+241 / −3”。
2. 将第 7 节命令中的模板路径改为 `assets/default/model3d/dressup/templates/...`。
3. 明确写出黄蓉和穆念慈各自的源件路径，并给出 `tpl_f2_medium` 重切命令；同时注明 tall/small 分别替换为 `tpl_f2_tall`、`tpl_f2_small` 后执行。保持报告不超过 60 行。

## 需作者确认

无。