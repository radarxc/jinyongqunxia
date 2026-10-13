VERDICT: FAIL

## 逐项结论

- 写集：通过 —— 仅有任务允许的 10 个未跟踪文件，未发现调试脚本或写集外修改。

- AR-109 最终颈桥几何：不通过 —— [cut_head.py:575](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/tools/model3d/dressup/cut_head.py:575) 在双调和求解后又移动桥顶两圈，但 [cut_head.py:1075](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/tools/model3d/dressup/cut_head.py:1075) 仍从旧的 `bridge["surface"]` 计算门禁。直接实读 `head.glb` 中 640 个 `_REGION=neck` 顶点重算，得到相邻圈最大半径变化 46.064 mm、最大局部凸起 23.032 mm、最多 3 次半径转折；[report.json:460](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/assets/default/model3d/dressup/heads/npc_huangrong/report.json:460) 却记录 4.195 mm、0.924 mm、1 次，真实产物不满足“无局部凸起 > 1 mm”。

- 身体终止面与遮罩：不通过 —— [cut_head.py:718](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/tools/model3d/dressup/cut_head.py:718) 的 `MaxFilter` 和羽化把运行时 `>0.5` 等值边界扩到了规范环下方。按运行时 shader 的门槛重建遮罩边界，轴向位置为环下 1.164–9.188 mm，离规范环最近 2.248 mm、中位 5.908 mm，并非“身体终止面 = 规范颈环切面”。[preview.png](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/assets/default/model3d/dressup/heads/npc_huangrong/preview.png) 的侧视颈部放大图也能直接看到白色水平裂带。

- 头尺寸归一门禁：不通过 —— [cut_head.py:1103](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/tools/model3d/dressup/cut_head.py:1103) 将 `abs(scale/rawScale-1)=0.466%` 命名为归一残差，但这只是钳位量。用产物记录的测量值复算，缩放后颅宽相对目标偏差 4.119%，脸高偏差 3.059%，均未达到 V4 的 `<1%`。

- 规范环与动态接缝：通过 —— `head.glb` 底圈与模板 64 点最大位置差 0.0000498 mm，关节索引逐点相等、权重最大差 `2.38e-8`；报告记录 idle/walk/run 共 72 帧接缝结果。

- 肤色与穿入报告：通过 —— `skinTint`、作用前后 ΔE、桥顶左右 ΔE 均有真实计算路径；桥体穿入记为 0，长发最坏穿入 15.824%（run 第 0 帧）已如实单列而未伪装成通过项。

- GLB 硬契约：通过 —— 实读为 1 mesh node / 1 mesh / 1 primitive / 1 skin；65 joints 顺序及 IBM 与模板逐字节相同；mesh node 无 TRS；`_REGION` 为 u8 SCALAR；仅使用五根允许骨；材质为 `KHR_materials_unlit` 且只引用一张 2048² baseColor。

- 质检图：不通过 —— 正、侧、背及两张颈部放大齐全，整脸、下巴、发饰和长发可见，模板头也已隐藏；但侧视放大存在明确颈根裂带，未达到“光滑连续、看不出多一圈或缺口”。

- manifest：不通过 —— [manifest.yaml:1](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/assets/default/model3d/dressup/heads/npc_huangrong/manifest.yaml:1) 是单个 YAML mapping，而参考的 garment/`ingest.py` 契约是单元素列表；同时缺少 `category`、`fit`、`report`、`fits`、`tool`、`source` 等参考字段，不能算“按 `eq_jinzhuang/manifest.yaml` 字段写”。

- 测试覆盖：不通过 —— [tests_head.py:209](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/tools/model3d/dressup/tests_head.py:209) 只断言脚本自报的旧曲面指标，没有从写盘后的 GLB 重算颈桥；遮罩测试也只检查“环上无漏出、环下还有三角”，未检查 0.5 等值边界是否落在规范环。因此当前测试即使退出 0，也捕捉不到上述两个真实缺陷。本审核受只读约束，未重跑会创建临时目录或构建产物的四条命令。

- 报告：不通过 —— 七节齐全且共 31 行，但第 3 节声称“最大局部凸起 0.924 mm”“无鼓圈”“归一残差 0.466%<1%”，与磁盘最终几何及实际尺寸偏差不一致。

## 返修说明

1. 先确定最终 64 点头切口锚点，再以这些最终锚点和真实切向重新求完整双调和颈桥；不要在求解后仅平移最后两圈。写入 GLB 的桥面必须与用于统计、门禁的数组完全相同。
2. 写盘并重新加载 `head.glb` 后，从 `_REGION=neck` 的最终顶点重算两端切向、相邻圈半径变化、局部凸起和转折次数；门禁要求实际产物切向 `<5°`、局部凸起 `<1 mm`、半径单调或单峰。
3. 重做 `hidemask.png`，使运行时双线性采样 `>0.5` 的几何等值边界落在规范颈环切面，而不是只保证环上都被遮掉。测试需把遮罩裁切边界按角度重采样后与 64 点规范环比较，并覆盖静态及 72 帧姿态。
4. 修正尺寸门禁：分别报告缩放后颅宽和脸高相对模板的真实偏差。若在等比缩放与 ±8% 钳位下无法达到 `<1%`，必须将 gate 标为 fail，不得以钳位量代替尺寸误差。
5. `tests_head.py` 必须从最终写盘 GLB 复算上述几何；增加一个“顶圈吸附后会形成鼓圈”的回归用例，确保当前缺陷会使测试失败。
6. manifest 改为与现有 dressup manifest 一致的单元素列表，并补齐 `file/category/fit/report/fits/status/experimental/gateLevel/tool/source`，同时保留任务要求的各文件 SHA256 与字节数。
7. 重新生成 `head.glb`、遮罩、两张检查图、fit/report/manifest；报告照抄最终产物复算数据。随后重跑 `tests_head.py`、`selftest.py`、冻结安装和 `pnpm check`。

## 需作者确认

无。