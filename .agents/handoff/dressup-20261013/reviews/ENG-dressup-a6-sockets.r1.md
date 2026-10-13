VERDICT: FAIL

## 逐项结论

- 写集与禁区：通过 —— 相对基点共 24 个改动文件，全部位于声明写集；未修改 `common.py`、`glb_io.py`、运行时、门禁或依赖，三件 GLB 与基点 SHA-256 逐字节一致。

- 三套模板插槽：通过 —— 非握持插槽 bind 世界旋转已对齐单位阵，左右握持帧满足正交、`det=+1` 和投影后的 Pinky→Index 方向；三套 `normalize_rig.py --check`、`export_skeleton.py --check` 均通过。逐键比较也确认除 `sockets` 外内容不变，全部 `socket.pos` 逐位不变。

- 默认 `gripAdjust`：通过 —— 剑记录 `restTiltDeg=40°`；斗笠记录 `liftMu=0.031280993`、最终打包网格最小间隙 5.076 mm；玉佩记录 `offsetMm=17.307837809`。产物与报告数值一致，三件仍为 `approved → candidate`。

- 青锋剑动态校验：不通过 —— [sockets_check.json](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a6-sockets/assets/default/model3d/dressup/props/item_qingfeng_sword/sockets_check.json:2) 实测深穿占比 `0.0058730744`、最坏 945 个刃身顶点、最深 `−293.563 mm`，却仍写为 `"pass": true`、`"failures": []`。根因是 [check_sockets.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a6-sockets/tools/model3d/dressup/check_sockets.py:184) 明确将武器动态深穿排除在判定之外。这不符合“计算并判定”及预期 0 的验收要求，指定命令退出 0 是漏设门禁造成的假通过。

- 体表带符号距离：不通过 —— [check_sockets.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a6-sockets/tools/model3d/dressup/check_sockets.py:53) 对斗笠、玉佩采用“最近顶点法线”定号；武器也只对该近似法筛出的负候选再算最近三角。该筛选可能漏掉“最近顶点判正、最近三角实际为负”的顶点，不能证明任务要求的全部顶点体表带符号距离。

- 自测和机械门禁：通过 —— 调度器 `finish --no-commit` 返回 0，执行日志记录 skeleton 9/9、prop 9/9、selftest 7/7，以及完整 `pnpm check` 184/184 文件、1313/1313 测试通过。本次只读审核环境没有可写临时目录，独立复跑 Python 测试停在 `tempfile`，不是断言失败；三套无写入的 rig/export 检查已独立复跑通过。

- 报告：不通过 —— 报告如实披露剑深穿，但把未达验收线降为不阻断警告；此外任务明确要求在第 7 节写 B 系列与 C2 Skill 交接约定，当前相关内容位于第 6 节，第 7 节只有自检，未满足指定结构。

## 返修说明

1. 删除武器深穿的豁免逻辑；刃身任一采样帧出现 `< −5 mm` 顶点时，必须在 `failures` 中登记、写 `"pass": false`，联合命令退出 2。
2. 在保留默认 `restTiltDeg=40°` 和既定插槽轴约定的前提下，修正刃身选择、握持帧或默认调整，使真实 idle/walk/run 共 72 帧深穿计数为 0。若现有 clip 本身无法满足，必须由协调者修改任务规格，不能在工具内自行豁免。
3. 对全部待判定顶点使用严格最近三角带符号距离，或实现有证明不会漏报的保守宽相筛选；斗笠按 `regions=head` 的三角面判定，不能用最近顶点法线替代。
4. 增加回归测试：最近顶点与最近三角符号不一致时仍能检出；真实青锋剑存在深穿时 `check_sockets.py` 必须退出 2。
5. 重生成三份 `sockets_check.json`，更新报告数字；把 `socket · gripAdjust`、`normalLocal` 坐标系、新类别默认单位 adjust 及复跑命令写入报告第 7 节。
6. 重新运行任务列出的全部检查，确认真实三件联合检查退出 0 后再送审。

## 需作者确认

无。