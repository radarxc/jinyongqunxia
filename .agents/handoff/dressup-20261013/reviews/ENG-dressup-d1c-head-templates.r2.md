VERDICT: PASS

## 逐项结论

- 写集与仓库状态：通过 —— 相对基点的 21 个文件全部位于允许范围；未改 `glb_io.py`、`common.py`、运行时、构建脚本或门禁阈值；`git diff --check` 通过，未发现已批准素材被改动。
- `cut_head.py`：通过 —— 已实现针形并点、内部帽形翻边和边界帽形删除；`SKIRT_ROOM_MM=0.7`；遮罩平面以下不裁下沿且只细分平面以上；四轮真实距离梯度内收；按“切口以上且距头皮三角 <1.5 mm”复制权重；正式失败路径会从 manifest `fits` 撤下变体。
- `tests_head.py`：通过 —— 合成测试证明旧删除法会开洞，新算法保持单圈边界、面积、绕序及逐角 UV；端到端覆盖第二体型后缀、manifest 合并、主体型重写保留变体及失败撤下；真实素材测试遍历三体型并独立复算 73 帧、penetration、两端 G1、底带外移和摘要。
- `shoot_head.mjs`：通过 —— `--template` 会按页面实际按钮文本切换体型并等待 actor 重建；对应后缀 GLB 与 fit 同时存在时优先使用变体。先前 `document` lint 错误已修复。
- 三体型产物与 manifest：通过 —— medium/tall/small 分别为 16,283/15,984/16,194 顶点和 27,924/27,320/27,703 三角；三份报告均为 `draft`、`gateLevel=pass`、45/45，无非流形边且仅有上下两圈边界。manifest 登记三个 `fits` 和 18 个文件，摘要与磁盘一致。
- 数值门禁：通过 —— 顶端 G1 最大 4.05°、底端最大 1.16°、鼓包最大 0.60 mm；bind 顶带约 −0.300 mm，73 帧最大仍为 −0.192 mm；底带最小 +0.263 mm，均满足原 V4 阈值。
- GLB 契约：通过 —— 独立解析确认三份头资产均有 65 个关节，关节顺序及 IBM 原始字节与各自模板完全一致；所有 `_REGION` 为 u8 SCALAR；材质为 `KHR_materials_unlit` 且仅引用 baseColor；蒙皮网格节点无 TRS。
- 图片：通过 —— 已逐张检查三个静态预览、两个 hide mask、两个 self-check 及四张运行时总图。旧 medium 头挂 tall 时 bind/run 的整圈黑带清晰可见；新 medium/tall/small 在正面、左右侧颈、后颈、裁切、bind/idle/run 中均未见黑带、裂缝、碎片或鼓圈。
- 验收命令：通过 —— 本轮 `tests_head.py` 有 13 项直接通过，另两项仅因只读沙箱禁止 `TemporaryDirectory` 未执行；真实三体型复算项已通过。`pnpm check` 本轮 lint/typecheck 通过后因沙箱禁止写 `node_modules/.vite-temp` 中止；任务驱动在可写校验环境中于 20:59 和返修后的 21:13 两次记录 `finish --no-commit rc=0`。未运行会写依赖目录的 `pnpm install`。
- 任务报告：通过 —— 共 47 行，七节齐全；包含五个根因的前后证据、三体型顶点/三角/残差/耗时/锚点及门禁表，并写明 P5 三体型命令、后缀命名和截图交接。

## 需作者确认

无。