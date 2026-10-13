VERDICT: FAIL

## 逐项结论

- 写集与素材范围：通过 —— 相对基点仅改动任务允许的 10 个路径；未修改运行时代码、门禁阈值或已批准素材。
- 精确裁头与双调和颈片：通过 —— [cut_head.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-d1b-neck-splice/tools/model3d/dressup/cut_head.py:647) 实现切面插值裁切，[双调和求解](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-d1b-neck-splice/tools/model3d/dressup/cut_head.py:841) 使用 `L M⁻¹ L`；最终残差 `5e-9 mu`。
- 朝向、拓扑与接缝：通过 —— 颈片边方向一致率和逐面朝外率均为 100%，非流形边 0；顶/底 G1 最大 `3.39° / 0.71°`，外凸 `0.37 mm`；最终图集顶/底 ΔE2000 p95 为 `1.42 / 0.85`。
- 动作与遮罩门禁：通过 —— 标准 penetration 为 bind `0/876`、idle 最坏 `1/1030 = 0.097%`、walk/run 为 0；bind 顶带最浅皮下 `0.288 mm`，73 帧最大外露 `0.080 mm`；底带最小外移 `0.0416 mm`，遮罩外渗 0。
- GLB 与产物契约：通过 —— 65 joints 顺序及 IBM 与模板逐字节一致；`_REGION` 为 u8 SCALAR；单 primitive、unlit、仅 baseColor；mesh 节点无 TRS。manifest 内六个文件的哈希和字节数均与磁盘一致，`report.json` 45 项记录全部通过。
- 截图工具实现：通过 —— [shoot_head.mjs](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-d1b-neck-splice/tools/model3d/dressup/shoot_head.mjs:176) 实现 CDP、浏览器复用、本地 CORS、姿势定格、多机位、遮罩开关、单图、总图与 JSON 摘要；D1/D1b 姿势签名一致，`hideMapError=null`。
- 正面、侧面和仰视截图：通过 —— D1b 的 bind、idle、walk、run 均未见 D1 的黑色颈圈、碎三角、色阶、竖纹或外凸“多一圈”。
- run 背视验收：不通过 —— `d1b_r4/nape` 的 `nape_inner`、`nape_inner_left/right`、`nape_under` 几乎完全被发片占据；`nape_low` 只显示发帘，`nape_side` 只显示侧面轮廓，没有任何一张清楚显示 run 状态的实际后颈接缝。因此仍未完成任务要求的“背视 × run 逐张目检”。[任务报告](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-d1b-neck-splice/tools/agents/reports/ENG-dressup-d1b-neck-splice.md:39) 也明确承认该处被遮挡。
- 自动检查：通过 —— 当前监督记录在 2026-10-09 17:55 显示 `finish --no-commit rc=0`，覆盖四条规定检查；本次只读复核中真实黄蓉资产的独立 73 帧用例通过。另两个临时目录用例及 `selftest.py` 被只读沙箱的 `No usable temporary directory` 拦截，不作为代码失败依据。
- 报告真实性：不通过 —— [报告第 35 行](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-d1b-neck-splice/tools/agents/reports/ENG-dressup-d1b-neck-splice.md:35) 写完整流程约 `215 秒`，但最终 `fit.json` / `report.json` 记录 `durationMs=536186`，约 `536 秒`，与最终实跑产物不一致。

## 返修说明

1. 调整 `shoot_head.mjs` 的 run 后颈机位或增加新的诊断机位，必须得到至少一张能清楚看到后颈中央实际接缝的运行时截图；不能以被发片完全遮挡的画面代替。可使用更远的后四分之三机位、重新计算相机目标，或增加仅用于接缝验收的裁切辅助视图。
2. 重新生成 D1/D1b 的 run 背视对照和 `summary.json`，确认实际画面无黑缝、碎三角、色阶及外凸圈，并保持 `hideMapError=null`。
3. 更新报告中的截图路径和目检结论；将完整流程耗时改为最终产物记录的实际值，或重新实跑后同步更新 `durationMs` 与报告。
4. 重新运行 `tests_head.py`、`selftest.py`、`pnpm install --frozen-lockfile` 和 `pnpm check`。

## 需作者确认

无。