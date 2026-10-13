VERDICT: FAIL

## 逐项结论

- 写集与已批准素材：通过 —— 相对基点仅改动任务允许的 10 个路径；未发现 `status: approved` 素材被修改。
- 精确裁头与双调和颈片：通过 —— [cut_head.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-d1b-neck-splice/tools/model3d/dressup/cut_head.py:647) 实现切面交点及位置、UV、权重插值；[双调和求解](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-d1b-neck-splice/tools/model3d/dressup/cut_head.py:841) 使用余切拉普拉斯 `L M⁻¹ L`。最终残差 `5e-9 mu`。
- 朝向、拓扑与接缝：通过 —— 最终颈片边方向一致率和逐面朝外率均为 `100%`，非流形边为 `0`；顶/底 G1 最大 `3.39° / 0.71°`，外凸 `0.37 mm`；最终 JPEG 图集顶/底 ΔE2000 p95 为 `1.42 / 0.85`。
- 动作 penetration、底带及遮罩：通过 —— 标准口径 bind 为 `0/876`；idle 最坏 `1/1030 = 0.097%`，walk/run 为 `0`；底带 73 帧最小外移 `0.0416 mm`，遮罩外渗为 `0`。
- 顶重叠带生产门禁：不通过 —— 协调者要求 bind 时整带在皮下至少 `0.25 mm`。独立复算当前黄蓉为 `−0.2879 mm`，资产本身合格；但 [splice_checks](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-d1b-neck-splice/tools/model3d/dressup/cut_head.py:1665) 把 `top_max` 初始化为 `0`，只记录正向外露，[生产门禁](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-d1b-neck-splice/tools/model3d/dressup/cut_head.py:1906) 仅判 `≤ +0.1 mm`。因此标准工具会放过 bind 深度为 `0` 甚至轻微外露的后续头资产；合成端到端测试在 [tests_head.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-d1b-neck-splice/tools/model3d/dressup/tests_head.py:555) 也只断言 `≤ +0.1 mm`。
- 运行时截图工具：通过 —— [shoot_head.mjs](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-d1b-neck-splice/tools/model3d/dressup/shoot_head.mjs:300) 实现 CDP、浏览器复用、本地 CORS、姿势定格、多机位、遮罩开关、单图、总图及 JSON 摘要；D1/D1b 姿势签名一致，`hideMapError=null`，只有 Three.js 阴影模式弃用警告。
- 截图正面、侧面、仰视目检：通过 —— 四个姿势均未见 D1 的黑色颈圈、碎三角、明显色阶、竖纹或外凸“多一圈”。
- 截图背面验收：不通过 —— [对照总图](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/coord/_dressup/shots_w0/d1b_r3/compare/sheet.jpg) 中 D1b/run 的 `neck_back_left`、`neck_back_right` 和 `nape_low` 只拍到肩背或被垂发完全遮住，没有显示后颈接缝，无法满足“正 / 侧 / 背 / 仰视 × bind / idle / walk / run 逐张目检”。报告第 30、46 行将其概括为四姿势全部连续，证据不足。
- GLB 与产物契约：通过 —— 65 个 joints 顺序及 IBM 与模板完全相同；`_REGION` 为 u8 SCALAR；单 primitive、单面 unlit、仅 baseColor；mesh 节点无 TRS。`fit.json` 使用仓库相对路径，manifest 六个文件的哈希和字节数与磁盘一致，45 项记录均为通过。
- 自动检查：通过 —— 最新监督记录为 `finish --no-commit rc=0`，覆盖任务四条检查；本次只读复核的 `git diff --check`、Node/Python 语法及 GLB 契约也通过。
- 报告：不通过 —— 七节齐全且 54 行，但未记录 bind 顶带的实际负深度及硬门禁，且把不可见的 run 背缝写成已完成目检。

## 返修说明

1. 在 `splice_checks` 保留顶带带符号距离，不得把负值截成 `0`；单独输出 bind 最浅皮下深度，例如 `topUnderSkinMinMm`。
2. 生产门禁明确增加：bind 整条几何定义重叠带最大带符号距离 `≤ −0.25 mm`；动作 73 帧仍保持最大外露 `≤ +0.1 mm`。
3. 合成端到端测试也必须构造并断言 bind `≤ −0.25 mm`；真实资产测试继续独立复算并与 `report.json` 对拍。
4. 调整或启用 `nape_high`、更高的后四分之三机位，重新拍摄 run 背面，确保画面中能看到实际后颈接缝；长发遮挡时必须提供能完成验收的辅助角度。
5. 更新 `fit.json`、`report.json`、manifest 哈希和任务报告，写明 bind 实测深度与可见的背视截图路径，然后重跑四条规定检查。

## 需作者确认

无。