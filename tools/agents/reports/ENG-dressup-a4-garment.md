# ENG-dressup-a4-garment 报告 · 3D 纸娃娃换装 · A4 · 衣物 / 发型贴合 fit_garment.py 与跨模板 refit_template.py（流仙裙 / 夜行衣 / 马尾实跑）
## 1. 摘要（3–6 行）
完成衣物/发型对齐、slot 关节白名单、低置信关节线段混合、逐轮真实最近三角推离、遮罩、蒙皮 GLB 与跨模板 refit。
严格 fixture 由正本指定五区经 0.014 mu 空间聚合、4 mm 法线外扩和固定种子 ≤3 mm 向量噪声生成；贴合前真实穿透 2.35294%，严格 CLI 为 fitted。
流仙裙、夜行衣、马尾以 `--allow-draft` 实跑退出 0；旧整身壳姿态/朝向不一致，真实结果保留 draft。
恒等与合成骨长变化 refit 均严格 fitted；最终 float32 GLB 独立拓扑复算通过；17/17 Python 测试和全仓 `pnpm check` 通过。

## 2. 产出（文件、行数、主要章节）
- `fit_garment.py` 1,080 行：连续 PCA 对齐、带骨骨长轴缩放、几何最近三角、权重、推离/拓扑门、遮罩与 GLB/fit；`refit_template.py` 239 行：骨局部逆/正变换、骨长轴缩放、写出后门禁。
- `tests_garment.py` 544 行：圆柱套筒、非 90° PCA、不同肢段骨长、镜像、fixture、恒等/非恒等与序列化拓扑共 17 项；`garments/`、`hair/` 共 16 个文件。
- 验收输出：Python 17/17；冻结安装通过（640 ms，pnpm 9.15.9）；`pnpm check` 通过（179/179 文件、1,286/1,286 tests、1,777 内容文件、构建/尺寸全绿；仅有仓库既有缺图提示）。

## 3. 关键结论与数值
- 一致实现：3 mm=`0.001771270 mu`；无骨壳水平 PCA 求连续偏航并评分 180° 分支；带骨壳 Umeyama det=+1/≥6 对称关节后沿实际骨轴按骨长比缩放；`k=16`；低置信点按允许关节线段距离混合；neverHide=`neck,handL,handR,footL,footR`。
- 严格 fixture：scale 1/yaw 0.094854582°，neckTop/feet 0.011276602/0.287083417 mu；high 98.5561497%，filtered 1；80 轮上限、实际 75 轮，moved 1,870，残留/不足/翻面/退化 `0/0/0/0`，最小距 0.001771096 mu，边长 99.8636859%；hide=`torsoUpper,torsoLower,hips,thighL,thighR`；1,870/3,668；约 1.35 s / 约 358.72 MiB（单次实测，准确值以对应 fit.json 的 stats 为准）。
- 流仙裙 draft：scale 0.881806439/yaw -89.627986819°，neckTop/feet 0/0，袖角残差左 27.748595869°/右 28.575002825°；high 8.5960661%，filtered 80,673；moved 8,332，残留/不足/翻面 `569/2033/0`，最小距 -0.165891093 mu，边长 97.9735444%；hide=[]；158,875/287,349；约 42.42 s / 约 2,027.72 MiB（单次实测，准确值以对应 fit.json 的 stats 为准）。
- 夜行衣 draft：scale 0.865733245/yaw -90.112485142°，neckTop/feet 0/0，袖角残差左 22.272509306°/右 23.936950585°；high 42.3983124%，filtered 25,822；moved 42,582，残留/不足/翻面 `3686/8954/0`，最小距 -0.028399626 mu，边长 89.5792481%；hide=[]；151,223/283,540；约 31.02 s / 约 1,339.91 MiB（单次实测，准确值以对应 fit.json 的 stats 为准）。
- 马尾 draft：规范颅骨 24 行，scale 0.620990319/yaw -84.398812075°，headTop 0、最小腔余量 -0.005208337 mu；high 9.5479536%，filtered 123,854；moved 50,559，残留/不足/翻面 `27584/37762/0`，最小距 -0.054548503 mu，边长 84.6642037%；hide=[]；161,333/292,603；约 37.83 s / 约 1,839.67 MiB（单次实测，准确值以对应 fit.json 的 stats 为准）。
- 恒等 refit：fitted、独立真实最近面及序列化拓扑复算 `0/0/0/0`、最大位差 `6e-8 mu`；约 0.73 s / 约 342.91 MiB（单次实测，准确值以对应 fit.json 的 stats 为准）。合成骨长变化：最大位差 `0.000471801 mu`，1 轮后 `0/0/0/0`、边长 100%、fitted；约 0.65 s / 约 334.88 MiB（单次实测，准确值以对应 fit.json 的 stats 为准）。二者严格 CLI 均退出 0。
- GLB 实检：严格件及三诊断件均 1 个 mesh node/1 mesh/1 primitive（另含 65 骨节点），IBM accessor 与正本逐字节相同，`KHR_materials_unlit`、`doubleSided=true`；三件 15 万级诊断均 <60 s、峰值 <2 GiB。

## 4. 开放问题（附默认值）
- E 阵段用模板底图编辑重出两衣一发；默认本轮三件 draft 仅作诊断，不供 B1 加载。
- small/tall 真模板尚未到位；默认先以合成骨长变化回归，模板到位后重跑正式跨体型产物。
- `tests_garment.py` 与 finish 校验会重新生成正式产物，计时字段逐次浮动，其余字段确定。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；旧壳 draft 是已知输入限制，不反改 AR-102 / tech/11。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- A5 `validate.py`：拒绝 `status=draft`/`pushOut.passed=false`；消费 rounds/minimumDistanceMu/clearancePassed/topologyPassed/degenerateTriangles，并继续做动态穿透。
- B1：只加载 fitted；断言单 primitive、模板 skin/IBM、unlit 双面及 `_REGION`；E1 使用模板图编辑源。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 严格 fixture 不带 `--allow-draft` 退出 0：4 mm 外扩、向量噪声最大 2.999970 mm、输入穿透 2.35294%，high≥0.85；最终 float32 GLB 独立复算残留/不足/翻面/退化 0、边长≥99%，hide 含躯干/髋且不含 neverHide。
- ✅ 最近三角与 A1 最近点/距离对拍；衣物法线不参与选面；旧法线选面假清零由真实最近面测出负距离；全部原始非零面积三角/有效边参与门禁。
- ✅ `--iters` 是真实总上限，所有移动仅发生在 `rounds[]`；流仙裙/夜行衣/马尾显式 draft 各退出 0且 <60 s/<2 GiB；数字见 §3。
- ✅ 权重白名单与低置信关节线段混合、圆柱最近环/推离/遮罩/jointsAllowed 有测试；恒等与非恒等 refit 均不带 draft 严格退出 0，并在写出后重新加载做独立拓扑断言。
- ✅ A5/B1 需读：schema/status/kind/slot/id/body/source、align.mirrored/residualMu/bodySpaceIdentity/skullFit、weights.highConfidence/filteredVertices/farSemanticFallbackVertices/jointsAllowed、pushOut.iters/rounds/residual/insufficientMargin/degenerateTriangles/minimumDistanceMu/passed、hideRegions/neverHide/refitFrom；GLB 契约见 §3。
- ✅ 合入前审核返修：连续 PCA 以 37.25° 数值回归；带骨不同肢段以 2× 骨长和远端位置回归，原旋转/镜像断言保留；严格件、三诊断件及两份 refit 已重生成。
- ✅ `py_compile`、`git diff --check`、冻结安装、17/17 Python 测试及 `pnpm check` 通过；无新增依赖或联网技术断言。
- ⚠️ 仅允许三个脚本文件，`fit_garment.py` 与 `tests_garment.py` 超“尽量 ≤400 行”；未拆越界 helper；正式 small/tall 产物待模板。
