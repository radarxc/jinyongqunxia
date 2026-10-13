VERDICT: FAIL

## 逐项结论

- 写集与仓库状态：通过 —— 改动仅涉及任务允许的 `npc_munianci/**`、点数台账、报告及协调者追加授权的 `cut_head.py`、`tests_head.py`；未发现已批准素材被改动。
- Tripo 操作与点数：通过 —— 台账完整记录两次 generate/rig，余额 `17,260 → 17,090`，实际花费 `65+20+65+20=170` 点；第二次重试符合协调者裁定，没有第三次提交。
- 源件与可追溯性：通过 —— `source.json` 记录两个项目及 op、参考图 SHA、参数、inspect、joints、QC 和第一次失败历史；参考图当前 SHA 与记录的 `ded507cd…` 一致。
- 封面与脸部质量：通过 —— `source/cover.png` 未见额头肉块、眼皮撕裂、耳前薄片、太阳穴削角、唇裂、耳下肉块、发饰烘焙等明显缺陷；发髻紧凑且无水印、文字或真人演员特征。
- GLB 契约：通过 —— 三体型 skin joints 顺序及 IBM 均与对应模板逐字节一致；`_REGION` 是 u8 SCALAR；材质为 `KHR_materials_unlit` 且只含 baseColor；mesh 节点无 TRS。
- 三体型几何门禁：通过 —— 三份报告均为 `gateLevel: pass`、`level: draft`，三角数分别为 28,802 / 28,259 / 28,497；G1、台阶、鼓包、色差、遮罩外渗、bind 与动作 penetration 均在规定阈值内。真实资产独立复算也通过三体型 73 帧检查。
- 工具修改与回归覆盖：通过 —— 新增头发颜色排除、颈桥单调适配、衣领残片清理和最差角报告；测试覆盖对应合成场景，并把真实资产复算扩展到全部已登记头资产。审核沙箱没有可写临时目录，故含 `TemporaryDirectory` 的测试无法在本轮完整执行；非临时测试及真实资产复算通过。
- 运行时截图验收：不通过 —— [medium 总图](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ART-dressup-d2-head-gen/assets/default/model3d/dressup/heads/npc_munianci/shots/sheet.tpl_f_medium.jpg)、[tall 总图](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ART-dressup-d2-head-gen/assets/default/model3d/dressup/heads/npc_munianci/shots/sheet.tpl_f_tall.jpg) 和 [small 总图](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ART-dressup-d2-head-gen/assets/default/model3d/dressup/heads/npc_munianci/shots/sheet.tpl_f_small.jpg) 的 `neck_back_*` / `nape_low` 机位中，bind、idle、walk、run 均可见后颈横向亮白色带。它在 mask 与 nomask 行都存在，属于头贴图内的白内领烘焙色斑，不是遮罩显示问题；违反 [docs/tech/12-dressup-production.md:106](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ART-dressup-d2-head-gen/docs/tech/12-dressup-production.md:106) 要求的“无黑缝、碎片、色阶”。
- 报告准确性：不通过 —— [报告第 27 行](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ART-dressup-d2-head-gen/tools/agents/reports/ART-dressup-d2-head-gen.md:27) 宣称截图验收无问题，但 [第 29 行](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/_dressup/.agents/wt/ART-dressup-d2-head-gen/tools/agents/reports/ART-dressup-d2-head-gen.md:29) 又明确承认后颈偏白贴图斑并选择不处理；该问题正是 P5 A2 的一票验收项，不能作为开放问题留待量产。

## 返修说明

无需再调用 Tripo或花点。使用现有第二版源件返修：

1. 在 `cut_head.py` 中补齐切口附近的贴图残片处理：当前 `drop_collar_remnants` 只处理外翘几何和偏红顶带，尚未处理烘在第一层颈皮上的白色内领。应在不影响脸、发际线和真实颈皮的前提下，对切口附近白内领区域进行可靠识别并修色或剔除；不得放宽既有门禁。
2. 为白色内领污染增加自动回归测试，验证三体型处理后无明显颈部色阶，同时黄蓉等既有无污染资产保持不变。
3. 重新生成三体型 head / fit / report / manifest 和截图；所有现有 V4 数值门禁仍须通过。
4. 重新拍摄 `neck_back_left`、`neck_back_right`、`nape_low`，覆盖 bind、idle、walk、run 及 mask/nomas；后颈亮白横带必须消失，不得通过裁图、换机位或遮挡规避。
5. 修正报告第 27、29、39 行，使视觉结论与新截图、实际测试结果一致。

## 需作者确认

无。