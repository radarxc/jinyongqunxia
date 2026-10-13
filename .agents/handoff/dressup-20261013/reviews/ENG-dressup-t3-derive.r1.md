VERDICT: FAIL

## 逐项结论

- 写集：通过 —— 相对基点仅有任务允许的 16 个未跟踪文件；没有已跟踪文件改动，也未改动 `glb_io.py`、`common.py` 或已批准素材。
- `template_specs.json`：通过 —— 六个模板的 id、性别、身高、髋比、肩比和 source 均与 `tech/10` §1.3 一致。
- 体型身高派生：不通过 —— `derive_template.py:241` 把 `_solve_spine` 的目标高度固定为源 `source_height`，导致 medium/small/tall 的 `heightMu` 都约为 `0.9801026`，没有落实 1.58/1.66 与 1.72/1.66 的几何身高比例。`derive_template.py:283-295` 又以 `mPerMu = targetHeightM / measuredHeightMu` 回算，使 `heightM` 及误差恒为目标值和 0，属于自证式测量；报告第 16 行也明确承认这一偏离。
- 派生门禁：不通过 —— `derive_template.py:303-305` 只拦截 NaN、髋比和肩比，没有校验真实身高比例或 `maxVertexDisplacementMu <= 0.04`，无法执行 `tech/11` §10.T 的完整验收。
- 颈环：不通过 —— `tech/11` §10.T 明确要求每套与源颈环半径差 `< 2 mm`。当前 `tpl_f_small/skeleton.json` 的切片从 medium 的 `Neck+0.013 mu` 跳到 `+0.012 mu`，按各自米制换算短轴差为 `6.102 mm`；报告第 15、18、30 行也确认失败。提出修改契约不能替代现行验收。
- LBS、IBM 与动画：通过 —— 独立核对确认 indices、UV、JOINTS/WEIGHTS、`_REGION`、图片字节及 65 骨顺序保持；IBM 已重算，rest=bind 分别为 `6.25e-8`、`6.40e-8`；三条 rotation 轨原字节保持，三条 Hips translation 轨已变化，且无其他 translation/scale 轨。
- 合成测试：通过 —— `tests_derive.py` 当前实跑 `4/4`，覆盖骨长、LBS 位移、IBM 互逆、法线归一及轨道处理；但尚未覆盖上述真实身高比例和颈环失败。
- GLB 与侧车一致性：通过 —— 两套 body SHA 与 `derive.json`、`skeleton.json`、manifest 一致；均为 105,082 顶点、196,022 三角，`_REGION` 为 u8 SCALAR，无 NaN。
- manifest：不通过 —— 两份 `manifest.yaml:27` 仍写“过渡期正本派生，30° 正本到位后重派生”，但实际源 SHA `1be19e87…e066f` 已是基点中 T2 产出的 AR-105 25° 正本；该说明与作者最新要求及实际来源冲突。
- 检查命令：通过（当前可安全复核部分） —— `tests_derive.py`、两套 `normalize_rig.py --check`、两套 `export_skeleton.py --check` 均退出 0。报告记录 `pnpm install --frozen-lockfile` 与 `pnpm check` 已通过；本次只读审核未重跑会生成内容/构建产物的命令。
- 报告：不通过 —— 七节齐全且为 31 行，实跑数字与产物相符，也如实登记颈环失败；但“精确命中身高映射”来自上述恒等回算，并非契约要求的派生验证，同时保留了已过期的 30°/过渡期表述。
- 禁区：通过 —— 未发现绝对路径、bone.scale 配对、HeadTop_End 顶点测量、Neck+0.006、Blender、新依赖或高负载跳过逻辑。

## 返修说明

1. 修正真实身高派生：目标几何高度应由 `sourceHeightMu × target.heightM / sourceSpec.heightM` 得出；用它求 `k_leg`、`k_spine` 和肩宽目标。不要再通过 `targetHeightM / measuredHeightMu` 把任意结果校准成零误差。
2. 身高误差应按源模板确定的米制比例独立计算，并增加硬门禁：身高比例、髋比、肩比均在 ±0.5%，最大顶点位移 ≤ 0.04 mu；失败必须退出非零。
3. 在不修改 `export_skeleton.py`、不伪改侧车数据的前提下，调整派生几何，使重新导出的 small/tall 颈环与 medium 的米制半径差均 `< 2 mm`。必须比较实际 `skeleton.json`，不能仅解释切片离散误差。
4. 增加回归测试，至少断言输出几何身高比例不是源高度、错误的身高不能靠回算变成零、位移超限会失败；补充真实产物的颈环比较。
5. 从当前 T2 25° 源重新生成两套 body 和全部侧车，更新 SHA；manifest 与报告改为 AR-105 25° 当前正本口径，不再称“过渡期/等待 30°”。
6. 重跑任务列出的全部检查及 `pnpm check`，并把修正后的各链系数、身高比例、最大位移和颈环差写回报告。

## 需作者确认

无。