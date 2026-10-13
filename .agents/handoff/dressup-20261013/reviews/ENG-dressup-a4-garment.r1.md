VERDICT: FAIL
## 逐项结论

- 写集：通过 —— 相对基点 `aa8f10f37fa3e3d00e45ae7d4391845b8f664e70` 仅新增任务允许的三份脚本、三件产物、恒等 refit 产物和报告；未见越界修改或受审素材被改。
- CLI 与合成测试：通过 —— `python3 -B tools/model3d/dressup/tests_garment.py` 实跑为 6/6，两个 CLI 的 `--help` 正常；测试含数值断言，且复核后仓库状态未变化。
- 流仙裙权重验收：不通过 —— `cloth_xianxia_dress/fit.json:105` 的 `highConfidence=0.110618049`，远低于 spec §10.A 的 `≥0.85`。夜行衣和马尾也仅为 0.4393、0.1087。可用 `rg -n '"highConfidence"' assets/default/model3d/dressup/{garments,hair}/*/fit.json` 复现。
- 低置信权重处理：不通过 —— `fit_garment.py:314-352` 对所有低置信点直接使用关节线段回退，没有 spec §5.3 规定的邻接拉普拉斯扩散；`body` 白名单同时包含躯干、手臂和腿，未明确实现“裙摆 Hips 主导、腿骨渐变；袖部按臂链”的分区策略。
- Bind 姿势推离：不通过 —— 三件 `fit.json` 的残留分别为 4,972、40,398、72,729；重新按 `fit_garment.py:437-440` 的符号距离公式计算，实际负距离顶点仍有 4,127、35,379、68,977，违反静态残留 0。`fit_garment.py:424-444` 回溯到极小步长后仍无失败门禁，却继续返回成功。
- 发型规范头贴合：不通过 —— `fit_garment.py:197-204` 没有读取 `skull_profile.json`，使用 `headWidthMu + 0.008` 常数定标；0.008 mu 按当前 `mPerMu=1.68444142` 实为约 13.48 mm，并非报告所称 8 mm。马尾 `fit.json` 也没有 `headCenter` 挂点字段，不满足 spec §10.A。
- 自带骨架对齐能力：不通过 —— `fit_garment.py:230-254` 只实现关节 Umeyama 全局相似变换，没有 spec §5.1 要求的骨局部旋转姿势校正；当前三个无骨架样本不触发该路径，合成测试也未覆盖姿势校正。
- 遮罩算法与单位：不通过 —— `fit_garment.py:447-465` 以最近衣物顶点代替“衣物三角 + 射线遮挡”；`distance <= 0.015` 按 mu 计算，当前相当于约 25.27 mm，而不是规定的 15 mm。颈、手、脚列入 `neverHide` 这一点通过。
- GLB 骨架与材质：部分通过 —— 四个 GLB 均为一个 mesh node、一个 mesh、一个 primitive，mesh node 无 TRS；skin 关节顺序与 IBM payload 逐字节等于模板，JOINTS 为 u16、WEIGHTS 为 f32，材质 unlit、doubleSided，贴图为 2048² JPEG。
- `_REGION` 契约：不通过 —— 四个输出 GLB 均无 `_REGION` accessor；解析 `load_glb(...).mesh().regions` 得到 `None`，违反补充审核要点要求的 u8 SCALAR，也无法满足 B1 对 `geometry.attributes._region` 的断言。生成路径 `fit_garment.py:539-544` 从未给 `garment.regions` 赋值。
- Refit 恒等回归：部分通过但总体不通过 —— 产物报告最大位差约 `1.19e-7 mu`，满足 `<1e-6`；但 `refit_template.py:95-109` 对 A=B 直接跳过推离，并把来源残留 4,972 原样复制到结果。脚本也没有在恒等位差超过 `1e-6` 时返回失败。
- 实跑与性能证据：通过 —— 三个输入 SHA 与主检出原文件一致；产物顶点、三角、耗时、峰值内存与报告/文件相符，均低于 60 秒和 2 GiB，jointsAllowed 外的有效权重影响数为 0。
- 报告：不通过 —— 40 行、七节齐全，主要实跑数字属实；但第 19 行把 `+0.008 mu` 写成“+8 mm”，第 34–39 行仍以 ✅ 描述交付完成，未揭示 `_REGION` 缜密缺失、流仙裙高置信率门失败及真实负距离穿透。报告中的 `pnpm check` 声明本次因严格只读要求未重新运行，不作为本次 FAIL 的依据。

## 返修说明

1. 重做发型对齐：读取 `skeleton.json.skullProfile.file`，在 Head 局部系按颅骨截面拟合发型内壳，产出明确的 `headCenter` 锚点；删除 `headWidthMu + 0.008` 常数。所有 mm/m 换算统一通过 `mPerMu`。
2. 补齐自带 skin 的骨局部姿势校正，并增加非零关节角差测试；Umeyama 仍须 det=+1，保留左右臂、左右腿等至少六点镜像校验。
3. 改进权重转移与语义分区，使流仙裙真实 `highConfidence ≥ 0.85`；低置信点先按邻接扩散，长裙/宽袖再按对应骨段回退。不得仅修改统计口径抬高数值。
4. 重写推离迭代，使三件默认参数实跑后真实负距离顶点为 0，同时保持翻面 0、边长比例合格三角 ≥99%；达到 `--iters` 仍不满足时不得无条件返回成功，应给出门禁失败。`rounds` 应清楚区分负距离穿透和不足 `pushMm` 安全间距。
5. 遮罩距离改为 `0.015 / mPerMu`，按衣物三角、同向法线和射线遮挡计算覆盖面积；继续禁止颈环带、手、脚进入 `hideRegions`。
6. 为衣物/发型顶点派生 `_REGION`，写入 u8 SCALAR accessor；refit 时保留或按目标模板重新派生，并增加 GLB 结构断言。
7. Refit 恒等路径必须先验证来源已无 bind 穿透；不能以 `identitySkipped` 掩盖不合格输入。增加文件级 A=B 回归，位差超 `1e-6` 时退出非零。
8. 补测单位换算、颅骨表/headCenter、骨局部姿势对齐、真实负距离清零、射线遮罩、`_REGION` 类型及恒等 CLI 门禁；重新生成三件 GLB/fit 和恒等产物。
9. 更新报告中的发型毫米值、推离结果、`_REGION` 结构和门禁结论；随后重新执行三件实跑、恒等回归、`pnpm install --frozen-lockfile` 与 `pnpm check`。

## 需作者确认

无。以上均为既定技术契约和验收门槛，不涉及新的作者取舍。