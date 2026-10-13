VERDICT: FAIL

## 逐项结论

- 写集与仓库状态：通过 —— 仅有允许路径下的 9 个未跟踪文件，根目录没有遗留调试脚本，也未发现写集外改动。
- 图片质检：通过 —— `preview.png` 展示正、侧、背及两张颈部放大图；脸、下巴、耳饰、发髻和长发完整，未见模板灰色光头遮脸或明显立领残片。`self_check_preview.png` 隐藏 head 区后只剩颈根。
- 切面、颈桥与尺寸归一：通过 —— 骨段比例由模板计算，64×6 颈桥底圈逐点贴合规范环；缩放 0.915733 钳位至 0.92，下巴—嘴角比例保持 1.0。产物顶点、三角和文件字节数与 `report.json` 一致。
- 72 帧颈桥穿入检查：不通过 —— [cut_head.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/tools/model3d/dressup/cut_head.py:515) 把穿入阈值设为 `1 mm`，第 536 行只统计距离 `< -1 mm`，所以报告的“穿入 0”并非裁定要求的严格零穿入。按相同 idle/walk/run 各 24 帧、阈值 `0 mm` 重算，最坏帧有 `1/320 = 0.3125%` 颈桥顶点穿入，最深约 `-0.133 mm`。因此 [报告第 14 行](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/tools/agents/reports/AGY-dressup-d1-cuthead.md:14) 的“穿入率 0”口径不符合第 4 轮裁定。
- GLB 蒙皮及材质：不通过 —— 65 个 joints 的名称顺序与模板相同，IBM accessor 字节完全相同；同时满足 1 个 mesh node、1 mesh、1 primitive、unlit、仅 baseColor、节点无 TRS、2048² 贴图。但实际 primitive 只有 `POSITION/NORMAL/TEXCOORD_0/JOINTS_0/WEIGHTS_0`，缺少验收明确要求的 `_REGION` u8 SCALAR；原因是 [combine_mesh](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/tools/model3d/dressup/cut_head.py:380) 构造 `Mesh` 时把 `regions` 传成了 `None`。
- 肤色：通过 —— `skinTint` 的方向正确，平均色 ΔE2000 为 `2.602256 → 0`；颈桥上沿逐角度取色，左右最大 ΔE 为 `1.532/2.149`，均低于 3。
- manifest 与 ingest：不通过 —— 仓库现有 [ingest.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/tools/model3d/dressup/ingest.py:22) 已支持 `head`，因此不满足“ingest 不支持时才手写”的例外。当前 `report.json` 使用自定义 `tianshu-dressup-head-report.v1`（[cut_head.py 第 647 行](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/tools/model3d/dressup/cut_head.py:647)），调用现有 ingest 校验直接报 `ValueError: report.schema 不支持`。此外 [manifest.yaml](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/assets/default/model3d/dressup/heads/npc_huangrong/manifest.yaml:1) 顶层是映射，不是标准单条列表，也缺少 `category/fit/report/fits/tool/created/source` 等指定先例字段。
- 合成测试：不通过 —— 测试覆盖了骨段比例、高立领外圈剔除、底圈位置和底圈权重，但 [tests_head.py 第 128–150 行](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/tools/model3d/dressup/tests_head.py:128) 未验证 `_REGION`、IBM 逐字节相等、完整权重渐变、肤色乘子方向或标准 ingest/manifest；动画夹具还是空 channel，不能捕获上述严格 72 帧穿入问题。本轮只读沙箱没有可写临时目录，测试脚本与 `selftest.py` 无法独立复跑；这不是单独判退理由。
- 任务报告：不通过 —— 七节齐全且仅 30 行，数字大多与产物一致，也如实报告长发最坏穿入 31.051%；但把带 `1 mm` 容差的结果表述为“颈桥穿入 0”，并在第 25、27、30 行宣称完整契约及全部检查通过，与实际缺 `_REGION`、不能 ingest 的状态冲突。

## 返修说明

1. 给 `head.glb` 写入 `_REGION` u8 SCALAR：原头部使用模板 `head` region，颈桥按契约使用适当的 `neck/head` region；重新解析产物确认 accessor 为 `componentType=5121`、`type=SCALAR`。
2. 把颈桥穿入判定改为严格 `distance < 0`，不要用 `-1 mm` 容差冒充零穿入；调整桥体几何直到 idle/walk/run 72 帧所有颈桥检查点均为 0，并在 JSON 中写明 `penetrationThresholdMm: 0`。
3. 不再使用自定义 ingest 契约。补齐标准 fit 字段，生成 `tianshu-dressup-report.v1` 的 `level/subject/inputs/checks`，保留 seam 扩展数据；从 staging 目录实际执行 `ingest.py head npc_huangrong`。
4. manifest 改为与 `garments/eq_jinzhuang/manifest.yaml`/现有 ingest 一致的单条列表结构，至少补齐 `category`、`fit`、`report`、`fits`、`tool`、`created`、`source`，再更新全部 SHA 和字节数。
5. 扩充 `tests_head.py`：断言 `_REGION` 类型、joint 名称顺序与 IBM 原始字节、桥权重从规范环渐变到 Head、肤色乘子方向、严格零穿入，以及产物能被现有 ingest 接受。
6. 重新实跑黄蓉、四条规定检查和 ingest，并同步修正 `fit.json`、`report.json`、manifest 与任务报告中的口径和数字。

## 需作者确认

无。