VERDICT: FAIL

## 逐项结论

- 写集：通过 —— 相对基点的 21 个文件全部位于允许范围内；未改 `glb_io.py`、`common.py`、运行时或构建代码，也未发现 `status: approved` 素材被改动。
- [cut_head.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-d1c-head-templates/tools/model3d/dressup/cut_head.py:690)：通过 —— 已实现针形并点、帽形翻边和边界帽形删除；`SKIRT_ROOM_MM=0.7`；遮罩平面以下保留模板点；真实梯度四轮内收；几何口径权重复制；体型后缀、manifest 合并及失败撤下均已落地。
- [tests_head.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-d1c-head-templates/tools/model3d/dressup/tests_head.py:254)：通过 —— 合成回归验证旧删除会开洞，新算法保持一圈边界及面积、绕序、逐角 UV；真实测试遍历 manifest 三体型并独立复算 73 帧、penetration、两端 G1、底带和摘要。
- [shoot_head.mjs](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-d1c-head-templates/tools/model3d/dressup/shoot_head.mjs:201)：通过 —— `--template` 会点击页面实际体型按钮并等待 actor 重建；对应后缀 GLB/fit 同时存在时优先加载变体。
- 三体型产物与 manifest：通过 —— 三份报告各 45 项全过；三角数为 27,924/27,320/27,703，边界环均为 2，非流形边为 0。manifest 登记三个 `fits` 和 18 个文件，逐项 SHA-256/字节数与磁盘一致。
- GLB 契约：通过 —— 独立检查确认三个头与各自模板的 65 关节顺序相同、inverseBindMatrices 原始字节相同；`_REGION` 为 u8 SCALAR；材质为 `KHR_materials_unlit` 且无非 baseColor 贴图；蒙皮网格节点无 TRS。
- 数值门禁：通过 —— 三体型顶/底 G1、鼓包、色差、底带外移、顶带内收和动作 penetration 均满足 V4 原阈值；报告数字与 JSON 产物一致。
- 图片质量：不通过 —— tall、small 的绑定/idle/run、侧颈、后颈及裁切视图显示接缝连续，旧 medium 头挂 tall 的黑圈也被新 tall 变体消除；但任务明确要求“三个体型”实拍。现有三张运行时总图只有 tall、small，以及在 `tpl_f_tall` 身体上的旧 medium 负面对照，没有当前 `head.glb` 在 `tpl_f_medium` 上的绑定、动作、侧颈和后颈验收图。
- 验收命令：通过 —— supervise 最终记录 `finish --no-commit rc=0`；三体型报告均为 45/45。最初 `document` lint 错误已经修复后重新校验通过。
- [任务报告](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-d1c-head-templates/tools/agents/reports/ENG-dressup-d1c-head-templates.md:12)：不通过 —— 补充审核要求报告第 3 节列出真实文件的“顶点/三角/残差/耗时/锚点校验”；当前只有三角及几何门禁，缺顶点、求解耗时、残差和 joints/IBM 锚定证据。另外第 35 行把第 5、6 节合并成 `## 5–6`，不符合任务规定的七节结构。

## 返修说明

1. 用当前 medium 主产物补拍 `--template tpl_f_medium`，至少包含 bind、idle、run，以及 `neck_left`/`neck_right`、`neck_back`、`nape_cut`；把总图放入现有 `shots_w0/d1c/` 并在报告中列明。tall、small 无需重拍。
2. 报告拆成独立的 `## 5. 对基准的修改提案` 和 `## 6. 需同步到其他文档`。
3. 在报告第 3 节补三体型真实数据：顶点 16,283/15,984/16,194；三角 27,924/27,320/27,703；残差 `2.5e-8/9e-9/5e-9 mu`；耗时 `197552/196892/224906 ms`；并写明各自 joints 顺序及 IBM 字节与对应模板相等。保持报告不超过 50 行。
4. 补图和报告后重新执行任务四条检查；代码与三体型 GLB 暂未发现需要返修之处。

## 需作者确认

无。