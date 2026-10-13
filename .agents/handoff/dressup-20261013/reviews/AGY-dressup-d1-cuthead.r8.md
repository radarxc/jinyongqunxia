VERDICT: FAIL

## 逐项结论

- 写集边界：通过 —— 仅有任务允许的 10 个未跟踪文件，工作区根目录没有调试脚本，也未发现写集外改动。
- 质检图片：通过 —— `preview.png` 包含正、侧、背三视及正、侧颈部放大；脸、下巴、发饰和长发完整，未见模板灰色头部或立领残片。`self_check_preview.png` 只显示切头后的模板身体。
- GLB 硬契约：通过 —— 实读为 1 node / mesh / primitive / skin，mesh node 无 TRS；65 joints 顺序和 IBM 与模板逐字节相同；`_REGION` 是 u8 SCALAR；材质为 `KHR_materials_unlit` 且只引用 2048² baseColor。
- 规范环与头部接缝：通过 —— 底圈位置最大误差 `0.0000498 mm`，关节索引完全相等、权重最大误差 `2.38e-8`；头切口有 128 个跨 head/neck 缝合三角，72 帧底圈接缝和桥体穿入结果符合门限。
- 头尺寸与肤色：通过 —— 几何平均缩放 `0.915733 → 0.92`，明确记录 `clamped: true`；整体量偏差 `0.466%`，颅宽和脸高的单项偏差如实只报不判。`skinTint`、作用前后 ΔE 及桥上沿左右色差均有计算路径且小于 3。
- AR-109 最终双调和曲面：不通过 —— [cut_head.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/tools/model3d/dressup/cut_head.py:622) 完成双调和求解后，又在第 624–625 行用单峰投影和 Hermite 重建修改内部圈。对黄蓉输入只读复算，最终求解后的两次改形最大位移分别约 `4.813 mm`、`7.816 mm`；最终写盘曲面不再是所声明的 `Δ²P = 0` 解，却仍在 [report.json](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/assets/default/model3d/dressup/heads/npc_huangrong/report.json:470) 标为 `solver: biharmonic-periodic`。
- `hidemask.png` 与身体终止面：不通过 —— [cut_head.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/tools/model3d/dressup/cut_head.py:918) 明确将径向误差降为“只报不判”，门禁只检查轴向高度。按运行时 0.5 等值线反算并与 64 点规范环逐点比较，最近点三维误差为最小 `0.322 mm`、中位 `3.573 mm`、最大 `13.553 mm`，64 点中 62 点超过 `0.5 mm`。产物自己也记录径向差 `13.903 mm`（[report.json](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/assets/default/model3d/dressup/heads/npc_huangrong/report.json:431)），不满足第 7 轮“0.5 等值边界落在规范环上并按角度与 64 点环比对”。
- 遮罩 72 帧检查：不通过 —— 第 1074–1076 行实际比较的是遮罩边界与“同一模板表面投影到切面后”的位置，不是边界与动画后的 64 点规范环；因此报告中的 `0.391993 mm` 不能证明 72 帧等值边界落在规范环轮廓上。
- 入库流程：不通过 —— 仓库 [ingest.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/tools/model3d/dressup/ingest.py:22) 明确支持 `head`，但 `_head_report` 删除了四项必需的 `penetration.*` 检查，[tests_head.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/tools/model3d/dressup/tests_head.py:258) 还专门断言这些检查不存在。直接调用入库校验复现：`ValueError: report.checks 不完整或重名：missing=['penetration.bindVertices', 'penetration.idle', 'penetration.run', 'penetration.walk']`。因此手写 manifest 不符合“仅 ingest 不支持 head 时才回退”的条件。
- manifest 与数字一致性：部分通过 —— YAML 已是单元素列表，字段、SHA、字节数、10,716 顶点、17,516 三角和磁盘产物一致；但由于标准 `ingest.py head` 无法接受当前报告，不能视为完成入库。
- 四条检查：部分通过 —— 第 14 次运行日志证明 `tests_head.py`、`selftest.py`、冻结安装和完整 `pnpm check` 均退出 0，Vitest 为 187 files / 1,331 tests；但现有测试没有对遮罩边界到规范环的完整三维距离作门禁，且主动固化了不可入库的报告结构，所以“测试通过”没有覆盖上述缺陷。
- 任务报告：不通过 —— [任务报告](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/tools/agents/reports/AGY-dressup-d1-cuthead.md:3) 声称完成双调和桥和专用门禁 `pass`，同时在第 18、31 行把 `13.903 mm` 径向错位降为只报不判；与第 7 轮明确门禁及实际不可入库状态不一致。

## 返修说明

1. 遮罩门禁必须按角度取得运行时 0.5 等值边界的 64 个实际三维点，与 `neckRing.profile[64].pos` 比较完整三维位差，不能只比较轴向高度或把径向差只报不判；bind 与 idle/walk/run 各 24 帧都需通过 `<0.5 mm`。
2. 修正遮罩/终止几何，使上述 64 点真实落到规范环。若模板现有颈表无法靠 UV 裁切形成规范环，必须调整头侧终止几何方案或将门禁标为失败，不能以颈桥“封合”掩盖 13.9 mm 的轮廓错位。
3. 最终 64 点锚定后应直接求满足边界条件和无鼓圈约束的完整双调和解；不要再用 `_remove_small_radial_wiggles` / `_limit_radial_bulges` 对求解结果做毫米级改形。补最终 GLB 的双拉普拉斯残差断言，并保持现有 G1、局部凸起和转折门禁。
4. 恢复 `ingest.py head` 所要求的完整检查契约，按 AR-109 的开口颈口语义生成兼容的 `penetration.bindVertices/idle/walk/run` 检查，再实际跑通入库校验；不要用测试断言这些字段必须消失。
5. 补回归测试：真实模板遮罩边界到 64 点环的完整三维误差、72 帧动态误差、最终曲面的双调和残差，以及 `ingest.py` 对最终报告的接受测试。
6. 重新生成 GLB、遮罩、两张预览、fit/report/manifest，更新所有 SHA、统计和任务报告，再重跑四条指定检查。

## 需作者确认

无。