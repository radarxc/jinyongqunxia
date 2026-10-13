VERDICT: PASS

## 逐项结论

- 写集：通过 —— 相对基点仅新增任务允许的 16 个文件；中等模板及其他已跟踪文件未改动。
- 规格表：通过 —— [template_specs.json](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-t3-derive/tools/model3d/dressup/template_specs.json:1) 完整登记男女六模板，身高、髋高比、肩宽比及 source 与 `tech/10` §1.3 一致。
- 分骨派生：通过 —— [derive_template.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-t3-derive/tools/model3d/dressup/derive_template.py:31) 覆盖双腿 UpLeg/Leg/Foot、Spine/Spine1/Spine2/Neck、肩和 Arm/ForeArm；仅修改子骨 translation，Hips 与 Head translation 保持不变，未使用 bone scale 或整体根偏移。
- LBS 与 IBM：通过 —— 使用源权重及源 IBM 将顶点摆到新 bind pose，随后以新 bind 世界矩阵求逆写回 IBM；两套 `rest=bind` 最大误差均为 `6.25e-08`。
- 身高与比例门禁：通过 —— 目标几何高度由源高度和规格身高比独立推导，源 `mPerMu` 从 `tpl_f_medium/skeleton.json` 继承；身高比、髋高比、肩宽比均命中 ±0.5%。
- 位移门禁：通过 —— 源和目标分别归一到脚底 `y=0` 后逐顶点比较；small 为 `0.047239033 ≤ 0.094467720 mu`，tall 为 `0.055475259 ≤ 0.070850790 mu`，符合修订后的动态上限，未用整体平移压低结果。
- 动画：通过 —— 195 条 rotation 轨保持不变；idle/walk/run 各一条 Hips translation 严格按 `k_leg` 缩放，未发现其他 translation 或 scale 轨。
- GLB 一致性：通过 —— 三套均为 105,082 顶点、196,022 三角、65 骨；indices、UV、JOINTS、WEIGHTS、`_REGION`、材质/贴图引用及骨顺序一致，IBM 按任务要求发生变化，`_REGION` 为 u8 SCALAR。
- 材质规则：通过（任务专属口径） —— 派生体按任务要求逐字保持 T2 源模板的 PBR 材质；转 unlit、仅保留 baseColor 属于阶段 C 的 `textures.py` 进包职责，不应在 T3 越权处理。
- 颈环：通过 —— 重新导出的实际 `skeleton.json` 与源模板比较，small 最大差 `1.566 mm`，tall 最大差 `1.619 mm`，均小于 2 mm。
- 产物与清单：通过 —— 两套 body SHA 分别为 `d4be6197…e297`、`fc6772d6…907d`；derive、skeleton、regions、skull profile 与 manifest 哈希一致，状态为 draft，来源明确为当前 AR-105 25° 中等正本。
- 测试：通过 —— [tests_derive.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-t3-derive/tools/model3d/dressup/tests_derive.py:55) 为 6/6，覆盖骨长、LBS/IBM、Neck/Head/Hips、轨道、独立身高标尺、规范坐标位移及真实产物颈环。
- 检查命令：通过 —— 本次只读复跑的两条 `normalize_rig --check` 和两条 `export_skeleton --check` 均退出 0；最新执行及监督日志记录 `tests_derive.py` 6/6、冻结安装通过、`pnpm check` 178/178 文件和 1272/1272 tests 全绿。
- 报告：通过 —— [ENG-dressup-t3-derive.md](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-t3-derive/tools/agents/reports/ENG-dressup-t3-derive.md:1) 七节齐全、33 行，链系数、比例误差、位移、颈环差、耗时、命令及 refit/runtime 交接均已登记。
- 禁区：通过 —— 未发现绝对路径硬编码、HeadTop_End 测头顶、Neck+0.006、bone.scale、混用旧骨架、Blender、新依赖、高负载跳过或门禁放宽。

## 需作者确认

无。