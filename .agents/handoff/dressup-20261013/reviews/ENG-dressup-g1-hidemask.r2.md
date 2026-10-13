VERDICT: FAIL

## 逐项结论

- 写集与仓库状态：通过 —— 相对基点 `71e847ebe07973431e3abdb05b3de3e192237afa` 的修改均位于任务允许路径；未发现修改 `glb_io.py`、`common.py`、门禁阈值或已批准素材。
- `bake_hide_mask.py` 射线与开口判定：通过 —— 实现 80 mm 法线射线加 8 个 25° 斜向射线；开口留边依据首个命中衣物层到所属边界环的衣面测地距离，不再错误地按身体点到任意自由边的直线距离判断。
- `bake_hide_mask.py::_synchronize_uv_seams` 跨 UV 岛一致性：不通过 —— 当前只同步具有相同三维位置的重复顶点对应像素，没有同步两岛对应接缝边内部的纹素。对三份最终 PNG 沿真实三维重合的 UV seam 边各采样 33 点，仍发现 medium `8923/229449`（3.8889%）、small `9156/229449`（3.9904%）、tall `8965/229449`（3.9072%）两侧黑白不一致，最坏接缝组有 31 个采样点不一致。这不满足裁定要求的“形态学后跨 UV 岛最终像素一致”。
- `tests_hidemask.py` 接缝回归：不通过 —— “最终 PNG 跨岛一致”只检查重复顶点处的像素，没有沿对应接缝边内部多点采样，因而 11/11 通过仍未覆盖上述缺陷。
- 形态学与预览：部分通过 —— 已采用闭运算半径 4 px、小于 400 px² 的未遮岛填充及 gutter 扩边；六张遮罩/预览均已逐张检查，上一轮胸腹、腰胯和背部的大块漏遮已清除，文件为 1024×1024、L8、仅含 0/255。不过形态学后的 seam 边内部仍不一致，故该验收项整体不通过。
- `fit_garment.py` edge weights：通过 —— `--edge-weights template --edge-band-mm 30` 默认关闭；开口带使用模板权重并向内渐变回源权重。三模板均真实执行 80 轮非零推离，不再以 `verify_only` 零轮跳过。
- 三模板 bind 与动态可见穿透：通过 —— `bindVertices.visible` 均为 0；idle/walk/run visible 分别为 medium `0.5947% / 0.5650% / 0.4639%`、small `0.6185% / 0.6483% / 0.6721%`、tall `0.4223% / 0.3806% / 0.3925%`，全部低于 2%。
- `validate.py` 可见穿透口径：通过 —— 有 `hideMask` 时保留 `penetration.*.all` 并以最近体表点重心 UV 采样产生 `penetration.*.visible` 作为门禁；无遮罩时保持原有字段和行为。三模板 all 数据与产物、报告一致。
- GLB 契约：通过 —— 三套产物的 skin joints 顺序和 inverseBindMatrices 与模板逐字节一致，`_REGION` 为 u8 SCALAR，材质为 `KHR_materials_unlit` 且只使用 baseColor；未发现禁止的包围盒对齐、`HeadTop_End`、颈环常数或 `bone.scale` 做法。
- manifest 与旧几何问题：通过 —— 保持 `experimental: true`、`gateLevel: fail`，符合旧版型翻面、边长及 small close-fit P90 归 E2b 处理的最新裁定；这些旧几何项不是本次 FAIL 原因。
- 检查与报告：部分通过 —— 执行日志记录 `tests_hidemask 11/11`、`tests_garment 20/20`、`selftest 7/7`、冻结安装成功，以及 `pnpm check` 的 `187/187` 文件、`1331/1331` 测试通过；报告七节齐全且 29 行。但报告未披露最终 PNG 的 seam 边内部不一致。当前只读审核沙箱因无可用临时目录无法重跑需要临时写入的测试，不据此判失败。

## 返修说明

1. 修正 `tools/model3d/dressup/bake_hide_mask.py` 的跨岛处理，不能只同步重复顶点。应在焊接后的三维网格或成对 seam 边上统一最终隐藏标签，或者参照 E3：先在共享三维几何上生成一致标量，再分别重心插值到所有 UV 岛。必须保证形态学、小岛填充和 gutter 处理后的最终 PNG 在对应 seam 边全段一致。
2. 在 `tools/model3d/dressup/tests_hidemask.py` 增加真正的 seam 边回归：构造三维重合但 UV 分裂的边，在边内多点采样最终 PNG 两侧像素；测试应能令当前实现失败，并在修复后通过。不要只采重复顶点。
3. 重新烘焙三模板的 `hidemask*.png` 与 `hidemask_preview*.png`，重新执行 validate，并更新 fit、report 和任务报告中的真实数据及接缝核验结果。
4. 重跑四条规定检查：`tests_hidemask.py`、`selftest.py`、`pnpm install --frozen-lockfile`、`pnpm check`。E2b 的翻面、边长及 small close-fit 问题继续如实保留，不要求在本任务中修复。

## 需作者确认

无。