VERDICT: FAIL
## 逐项结论
- 写集与仓库状态：通过 —— 仅新增任务允许的 10 个文件，根目录无调试残留，也未改动已跟踪的写集外文件。
- 黄蓉切头视觉结果：通过 —— `preview.png` 中正、侧、背视的脸、下巴、耳饰、发髻及垂发完整；颈部连续，无模板灰头遮挡、衣领残片、孔洞或明显双层颈圈。`self_check_preview.png` 只剩规范颈口以下身体。
- 骨段比例切面与头尺寸：通过 —— 切面比例 0.224392623；整体原始缩放 0.915732512，按裁定钳位到 0.92；整体量偏差 0.466019%，颅宽和脸高的各自偏差已按“只报不判”记录。
- 模板实际颈截面与双调和颈桥：通过 —— 从最终写盘 GLB 独立复算，底圈对实际截面最大误差 0.00005047 mm，底圈有效权重最大误差 2.93e-8；双调和残差 5.08e-7 mu，未发现求解后的逐点改形。
- 遮罩与动态缝合：通过 —— bind/72 帧遮罩边界误差分别为 0.203960/0.456029 mm；颈桥动态最大缝差 0.000050392 mm，符合 <0.5 mm 门禁。
- 第 9 轮 penetration 口径：通过 —— 独立从 `head.glb + hidemask.png` 复算 bind/idle/walk/run 均为 0；参与计算顶点数 29/52/48/34、切面上排除数 1749/1726/1730/1744，均与 `report.json` 一致。实现未对切面下顶点增加半径过滤。
- GLB 产物契约：通过 —— 1 node/mesh/primitive/skin，mesh node 无 TRS；`_REGION` 是 u8 SCALAR；65 个 joints 顺序一致，IBM accessor 与模板逐字节相同；材质仅 baseColor 贴图及 `KHR_materials_unlit`。
- manifest 与入库结构：通过 —— manifest 是单元素列表，字段齐全；六个文件的 SHA256 和字节数均与磁盘一致；只读调用 ingest 的 report 校验通过。
- 肤色匹配与 ΔE2000：不通过 —— [cut_head.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/tools/model3d/dressup/cut_head.py:763) 要求的平均色被实现成了逐通道中位数（第 772–773 行），再用该中位数逐通道反推 tint，因此 [report.json](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/assets/default/model3d/dressup/heads/npc_huangrong/report.json:553) 中“作用后 ΔE=0”是构造上的恒等结果，不是平均肤色门禁。沿用实现的 1,562/9,795 个实际样本改用算术平均复算，当前 tint 作用后 ΔE2000=4.0096；用逐样本 Lab 均值复算为 4.1638，均超过 <3。源平均色还比模板更暗，正确乘子约为 `[0.90034, 0.84492, 0.88424]`，而产物写的是 `[1.06732, 0.98768, 0.97248]`，乘子方向不符。
- 肤色单测：不通过 —— [tests_head.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/tools/model3d/dressup/tests_head.py:275) 只断言 `skinTint[0] > 0`，没有验证身体颜色应向头部移动、作用后 ΔE 降低并小于 3，因此未能发现上述错误。
- 任务报告真实性：不通过 —— [任务报告](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/tools/agents/reports/AGY-dressup-d1-cuthead.md:16) 照抄了无效的“ΔE 后 0”并在第 30 行宣称肤色门禁全过，需要随最终复算数据改正。
- 指定检查：本审核环境为只读，`tests_head.py` 和 `selftest.py` 因无法创建临时目录退出，`pnpm install` 因不能写临时文件退出；`pnpm check` 的 lint/typecheck 已过，Vitest 因不能写 `node_modules/.vite-temp` 停止。这些是审核沙箱限制，不是本次 FAIL 的依据。

## 返修说明
1. 修改 `skin_match`：按任务说明对清理后的源脸/颈皮肤样本和模板颈部皮肤样本计算真实平均色；明确是在相同颜色空间中求平均，并用该平均色计算 `skinTint`、作用前及作用后 ΔE2000。不要用同一逐通道中位数反推 tint 后再把必然为 0 的值当门禁。
2. 在 `tests_head.py` 增加有明确明暗差和色相差的合成样本，至少断言：
   - 源肤色比模板暗时 RGB 乘子方向正确；
   - 作用 tint 后的平均色 ΔE 小于作用前；
   - 作用后 ΔE2000 < 3；
   - 若错误使用中位数或反向乘子，测试必然失败。
3. 重新实跑黄蓉，更新 `fit.json`、`report.json`、预览图及 manifest 全部哈希；从最终写盘文件独立复算肤色门禁。若真实平均色口径仍不能达到 ΔE<3，需要调整采样区域或肤色变体，不能把统计量改回能制造零值的口径。
4. 更新任务报告第 3、7 节，照抄最终真实的 `skinTint`、作用前/后 ΔE 和样本数量，再完整运行四条指定检查。

## 需作者确认
无