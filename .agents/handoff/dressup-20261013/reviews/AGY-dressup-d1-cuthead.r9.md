VERDICT: FAIL

## 逐项结论
- 写集与仓库状态：通过 —— 仅有任务声明的 10 个未跟踪文件，未发现写集外调试脚本或已有文件改动。
- `preview.png` / `self_check_preview.png` / `hidemask.png`：通过 —— 正、侧、背及颈部放大图可见完整脸、下巴、发饰和连续颈部；模板头已隐藏，无灰块、衣领残片或明显“多一圈”。
- GLB 契约：通过 —— 实读为 1 mesh node / 1 mesh / 1 primitive / 1 skin；`_REGION` 是 u8 SCALAR；unlit 且仅有 baseColor；mesh node 无 TRS；65 joints 顺序和 IBM 字节与模板一致。
- 实际颈截面与双调和桥：通过 —— 底圈落在模板实际截面，最终写盘 GLB 复算残差 `4.05e-7 mu`；10×64 圈、两端切向最大 `0.009814°`、局部凸起 `0.503 mm`、无超过 1 mm 的鼓圈。
- 头尺寸与肤色：通过 —— 原始整体缩放 `0.915733`，按裁定钳位到 `0.92`；整体量偏差 `0.466%`；ΔE2000 从 `2.602256` 降到 `0`，桥上沿最大 `1.436`。
- 遮罩与接缝：通过 —— 0.5 边界 bind 误差 `0.204 mm`，72 帧最坏 `0.456 mm`；头底圈动态缝差 `0.0000504 mm`，均满足最终阈值。
- `penetration.bindVertices/idle/walk/run`：不通过 —— 第 8 轮要求按衣物同口径，对“颈桥 + 脸/颈皮肤”直接计算遮罩后身体的带符号距离。实现却在 [cut_head.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/tools/model3d/dressup/cut_head.py:978) 额外加入“颈环半径以内且落到终止面以下”的过滤，并在 bind 也使用 1 mm 阈值；调用位于 [cut_head.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/tools/model3d/dressup/cut_head.py:1154) 和 [cut_head.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/tools/model3d/dressup/cut_head.py:1210)。因此它不是“门禁同衣物”的指标。
- 穿入数据真实性：不通过 —— [report.json](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/assets/default/model3d/dressup/heads/npc_huangrong/report.json:478) 同时记录 `bindVertices: 0` 和同一批顶点最小距离 `-52.406 mm`。审核从写盘 GLB、写盘遮罩直接按 `distance < -1 mm` 复算，范围内 3,677 点有 293 点为负，比例 `7.968%`；这些点被上述几何过滤全部改判为 0。
- `tests_head.py`：不通过 —— [tests_head.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/tools/model3d/dressup/tests_head.py:182) 反而断言“距离为 -2 mm、但在切面上方”不算穿入，固化了已被第 8 轮替换的旧口径；真实黄蓉回归只读取 report 中的遮罩误差，没有从最终 GLB 独立复算四项 penetration。
- manifest 与数字一致性：通过 —— manifest 是单元素列表，由 ingest schema 生成；六个文件的 SHA256/字节数均与磁盘一致，GLB 的 10,717 顶点、17,509 三角和 1,413,980 字节也与 fit/report/任务报告一致。
- 检查命令复核：不通过 —— 本审核沙箱禁止创建临时目录，`tests_head.py` 和 `selftest.py` 在进入断言前即因无可用临时目录退出；这不是本次 FAIL 的根因，但未取得独立的 exit 0。Python 静态编译与 `git diff --check` 通过。

## 返修说明
1. 标准 `penetration.bindVertices/idle/walk/run` 必须改回第 8 轮口径：范围为颈桥内部点加脸/颈皮肤点，对 `hidemask.png` 裁切后的模板身体直接求带符号距离；bind 使用衣物门禁阈值，动态使用衣物的 1 mm / 24 帧统计。不得再用半径、轴向位置或 `_bridge_penetration` 把负距离二次过滤。
2. 旧的“只看终止面下方颈桥”统计如仍有诊断价值，可保留为独立的 report-only 字段，但不得覆盖 ingest 所需四个标准 penetration check。
3. 修正几何、顶点分类、遮罩或权重，直到按最终口径复算真正通过；不能只改报告数字或阈值。头发继续放到 `penetration.hair.*`，只报不判。
4. 改写测试：从最终写盘 `head.glb` 和 `hidemask.png` 独立复算 bind 与 idle/walk/run 各 24 帧，并逐项对拍 report；删除“负距离但位于切面上方即不算”的旧口径断言。
5. 重新生成 `fit.json`、`report.json`、manifest、图片及全部哈希，任务报告第 3 节照抄最终复算数据；随后在可写临时目录的校验环境重跑四条指定命令。

## 需作者确认
无