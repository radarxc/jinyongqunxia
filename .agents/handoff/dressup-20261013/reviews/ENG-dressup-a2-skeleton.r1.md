VERDICT: FAIL

## 逐项结论

- 写集与禁区：通过 —— 改动仅涉及任务允许的 9 个路径；未改 `glb_io.py`、`common.py`、依赖或门禁，也没有绝对路径及被禁止的 `HeadTop_End`、Neck+0.006、`bone.scale`、Blender 等做法。
- `normalize_rig.py`：通过 —— 实际 `--check` 返回 0；正本为 65 joints、rest/bind 最大差 `5.9349e-7`、面向 +Z。产物三段动画各保留 65 条 rotation 和 1 条 Hips translation，已剥离 195 条 scale、192 条非根 position；manifest 中 body SHA 与实际文件一致。
- 尺寸、颈环与颅骨表：不通过 —— 当前正本数值大体合理，但 `find_neck_ring` 在 [export_skeleton.py:161](</Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a2-skeleton/tools/model3d/dressup/export_skeleton.py:161>) 固定沿 Neck 局部 Y 搜索，没有从 Neck→Head 轴构造切面；[export_skeleton.py:171](</Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a2-skeleton/tools/model3d/dressup/export_skeleton.py:171>) 还允许 98% 主导的降级，与“100% Neck 主导第一段”不符。[export_skeleton.py:148](</Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a2-skeleton/tools/model3d/dressup/export_skeleton.py:148>) 的所谓椭圆拟合只是轴对齐 95 分位半径，未拟合旋转椭圆。当前正本恰好 Neck→Head≈+Y，掩盖了这一问题。
- `gripR/gripL` 插槽：不通过 —— [export_skeleton.py:268](</Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a2-skeleton/tools/model3d/dressup/export_skeleton.py:268>) 明确把掌心质心直接写入 `pos`，并注释让运行时另行外推，违背契约“握轴点=质心+(palmOffsetMu+柄半径)×掌面法线”。对拍结果：左右 `pos` 都恰等于质心，距规定握轴点均差 `0.0293 mu`。
- 其他表面插槽：不通过 —— [export_skeleton.py:277](</Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a2-skeleton/tools/model3d/dressup/export_skeleton.py:277>) 至 [export_skeleton.py:287](</Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a2-skeleton/tools/model3d/dressup/export_skeleton.py:287>) 未使用传入的网格法线，而是写死世界 ±X/±Z/+Y。更直接的产物错误是 `waistBack` 与 `waistL` 完全为同一点，世界坐标均为 `(0.038681, 0.565124, 0.053612)`，不能作为背部挂点。
- 区域产物：不通过 —— `regions.npy` 确为 105,991 个 u8，覆盖 17 区，跨区比例 `2.066661%`；但最终 `body.glb` primitive 没有 `_REGION` attribute。监督要点及运行时契约要求 `_REGION` 为 u8 SCALAR，当前只有 sidecar，B1 加载后对 `geometry.attributes._region` 的断言会失败。
- `fingerPose.fist`：不通过 —— 数量是正确的左右各 15 根，但 [export_skeleton.py:343](</Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a2-skeleton/tools/model3d/dressup/export_skeleton.py:343>) 至 [export_skeleton.py:350](</Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a2-skeleton/tools/model3d/dressup/export_skeleton.py:350>) 把弯曲轴手写成左右 ±X，拇指仅再加固定 0.25Y，没有从每根指骨求弯曲轴，不满足“绕各指骨弯曲轴加紧”及 AR-102 的脚本重算要求。
- `--check`：不通过 —— [export_skeleton.py:410](</Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a2-skeleton/tools/model3d/dressup/export_skeleton.py:410>) 至 [export_skeleton.py:437](</Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a2-skeleton/tools/model3d/dressup/export_skeleton.py:437>) 只检查顶层键、少量范围及 socket 名称。socket 内容即使为空、bindWorld 缺项、颈环点缺 pos/normal/四权重、ring SHA 错误、measures 嵌套字段缺失，也可能通过，不符合“字段齐全”。
- 测试：不通过 —— 合成测试有数值断言，但没有覆盖握点外推、旋转后的 Neck→Head 切面、逐骨弯曲轴、表面真实法线、`waistBack` 独立性、GLB `_REGION` 类型或 `--check` 对损坏嵌套字段的拒绝，因此现有 5/5 无法捕获上述产物错误。
- manifest 与哈希：通过 —— body、skeleton、skull、ring 的 SHA、`heightMu=0.97955321`、`mPerMu=1.68444142` 均与现有文件对拍一致。
- 报告：不通过 —— 7 节齐全且 47 行，但 [报告:16](</Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a2-skeleton/tools/agents/reports/ENG-dressup-a2-skeleton.md:16>) 声称“严格实现、偏离无”，同时 [报告:26](</Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a2-skeleton/tools/agents/reports/ENG-dressup-a2-skeleton.md:26>) 已显示 `waistBack` 与 `waistL` 重合却未标为问题；报告也缺监督要点要求的实跑耗时和明确三角数。
- 门禁证据：部分通过 —— 本次只读复核中 `normalize_rig --check`、`export_skeleton --check` 和三份源码 AST 均通过；现有 `--check` 通过不能证明契约正确。会创建临时产物的测试、导出、安装及 `pnpm check` 未在只读审核环境重跑，报告称其已通过。

## 返修说明

1. 修正 `derive_sockets`：把外推后的实际握轴点写进 `gripR/L.pos`；从对应表面顶点或局部邻域求真实法线；重新选择腰背表面，断言 `waistBack` 不与左右腰点重合。更新产物、manifest 和报告。
2. 颈环必须显式计算 Neck→Head 单位轴及垂直平面基，沿该轴搜索；删除 98% 降级；实现能处理旋转椭圆的拟合，并增加“骨轴不沿局部 Y”的合成测试。
3. 从每根指骨的局部骨链/idle 姿态派生弯曲轴，再施加 25°/30°/35°，不要统一写死 ±X。
4. 将 `regions.npy` 同一数据写入最终 `body.glb` 的 `_REGION` u8 SCALAR accessor，并验证顶点顺序、skin joints 与 IBM 未变化。
5. 扩充 `check_outputs`，逐项检查 §4 全部嵌套字段、数组长度、有限数、四元数、颈环四权重及和、ring/skull SHA、17 区 ID、bindWorld 和 30 根握拳骨；测试应逐类破坏字段并断言退出码非 0。
6. 重新实跑 normalize/export，更新所有 SHA；报告如实列出顶点、三角、rest/bind 残差、耗时、全部锚点，并删除“偏离无”的错误结论。
7. 最后重跑任务列出的全部命令和 `pnpm check`。

## 需作者确认

无。