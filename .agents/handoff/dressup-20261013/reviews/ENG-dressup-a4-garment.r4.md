VERDICT: FAIL

## 逐项结论

- 写集：通过 —— 15 个新增文件均位于允许的 `tools/model3d/dressup/`、`tools/agents/reports/` 和 dressup 资产目录；未发现越界修改。
- 严格 fixture 输入：不通过 —— [tests_garment.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a4-garment/tools/model3d/dressup/tests_garment.py:79) 将固定种子的均匀噪声做了 8 轮低通、去中位数并重新归一化，随后又迭代校正带符号距离；这不是任务指定的“沿法线外扩 4 mm，再直接加 ±3 mm 均匀噪声”。该处理显著平滑了验收输入，报告第 20 行也明确承认了这一偏离。
- 严格 fixture 输出：通过 —— 现有 `fit.json` 为 `status=fitted`，真实高置信率 0.960896、残留/安全距不足/翻面均为 0、边长合格率 0.999798，遮罩含躯干、髋和左右大腿且不含 neverHide；GLB 的 `_REGION` 为 u8 SCALAR。
- 低置信权重回退：不通过 —— [fit_garment.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a4-garment/tools/model3d/dressup/fit_garment.py:442) 先让邻接扩散最多传播 64 轮，只对最终仍无权重的顶点使用关节线段距离；代码没有实现“距体表 >10 cm 的裙摆/宽袖直接走关节线段混合”的判定。流仙裙 145,084 个低置信顶点中仍有 40,338 个走了扩散，不能保证远端裙摆不被错误体表权重传播污染。
- 最近三角契约：不通过 —— `SurfaceIndex` 默认候选数在 [fit_garment.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a4-garment/tools/model3d/dressup/fit_garment.py:76) 写成 `k=48`，与任务和 spec §5.3 指定的 `k=16` 不一致。
- 对齐残差：不通过 —— [fit_garment.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a4-garment/tools/model3d/dressup/fit_garment.py:283) 对所有资产一律写死 `sourceArmMin=17`、`sourceArmMax=70`。fixture、两件衣服和马尾因此得到完全相同的“袖角”数据，不是逐件实测，违反“袖角残差如实写进 fit.json”。
- 发型规范头贴合：不通过 —— [fit_garment.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a4-garment/tools/model3d/dressup/fit_garment.py:239) 只取颅骨表中段半径的中位数缩放最高 8% 顶点，并把该簇对齐到 `headCenter`；没有逐行使用 24 行颅骨轮廓，也没有把发腔顶挂到由蒙皮顶点壳派生的 `headTop`。这不足以实现 AR-97/AR-99 的规范头尺寸贴合。
- 推离与拓扑门：通过 —— 每轮均重新查询最近面并记录 before/after inside 和 margin；严格件满足门禁，三个旧壳均因残留、翻面或拉伸真实标为 draft，没有被静默放行。
- 诊断实跑产物：通过 —— 流仙裙、夜行衣和马尾均为 `status=draft`，其顶点、三角、高置信率、过滤数、推离轮次、残留、翻面、边长比例、耗时和峰值内存与各自 `fit.json` 基本一致；输入 SHA-256 也与主检出的三个 raw GLB 一致。纹理图集未见文字或水印。
- 恒等 refit：通过 —— 现有恒等产物为 fitted，残留和翻面为 0，`maxVertexDeltaMu=1.06e-7`，小于 `1e-6`。
- 非恒等 refit：不通过 —— 名为 `test_file_nonidentity_refit` 的测试在 [tests_garment.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a4-garment/tools/model3d/dressup/tests_garment.py:191) 实际只在内存中调用 `refit_positions`；没有调用 `refit_file`，没有生成对应目标 body/skeleton，没有执行目标体推离、遮罩、GLB/fit 写出或 CLI 退出码验证。另在 [refit_template.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a4-garment/tools/model3d/dressup/refit_template.py:155) 中，非恒等推离仍使用变形前的来源法线，直到推离完成后才重算法线。
- GLB 结构：通过 —— 五份蒙皮产物均为一个 mesh node、一个 mesh、一个 primitive；65 个 joint 名称和顺序与模板一致，IBM accessor 原始字节 4160/4160 完全一致；材质为 unlit、doubleSided、只引用 baseColor，mesh node 无 TRS。报告所称“1 node”应改成“1 mesh node”，因为实际总节点数为 67。
- JSON 单位命名：不通过 —— 产物仍使用 `pushOut.mm`、`pushOut.mu`、`headCenter.pos` 和无单位后缀的 `sourceArmMin/sourceArmMax/bodyArm`，没有遵守补充审核要求的 `Mm`、`Mu`、`Deg` 后缀。
- 测试：部分通过 —— 在不写文件的前提下独立执行了 11 个纯测试，全部通过；剩余两个测试会覆盖 fixture/refit 资产，受本次只读要求不能重跑。AST 解析通过。
- 报告准确性：不通过 —— [报告](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a4-garment/tools/agents/reports/ENG-dressup-a4-garment.md:15) 写 fixture 为 `9.06 s / 654.17 MiB`，当前 `fit.json` 实际是 `9.073638125 s / 758.8125 MiB`。第 39 行还把实际字段 `diffusedVertices/semanticFallbackVertices/filteredVertices` 写成不存在的 `diffused/semanticFallback/filtered`。报告虽为 40 行、七节齐全，但证据与交接接口不准确。

## 返修说明

1. 按验收原文重做 fixture：固定种子直接生成每顶点 `uniform(-3, 3) mm`，与 4 mm 法线外扩相加；删除低通、重新归一化和事后带符号距离校正。测试应断言 raw 顶点确实来自这套确定性公式，不能只验证最终门禁。
2. 权重转移显式计算 100 mm 阈值：距体表超过该阈值的低置信裙摆/宽袖顶点直接使用 slot 白名单下的关节线段距离混合；近体表低置信点才可继续用邻接扩散。把最近三角候选数恢复为契约规定的 16。
3. 对两件衣物逐件量出真实袖角并写真实残差；fixture、发型等无袖资产不要写伪造的 17°～70°常量。
4. 发型改为使用完整 `skull_profile.json` 行数据做腔体尺度/余量核验，并将发腔顶对齐由蒙皮顶点壳导出的 `headTop` socket；重新生成马尾诊断件及 fit。
5. 增加真正的文件级非恒等 refit：生成相互一致的合成目标 body 与 skeleton，调用 `refit_file`/CLI，执行目标推离和遮罩，核验输出 GLB、fit、skin/IBM 和退出码。非恒等变形后应先重算法线，再将其用于最近面消歧和推离。
6. 按单位约定重命名新增 JSON 数值字段，并同步测试和第 7 节交接字段。
7. 用最终产物重新填写报告，特别是 fixture 耗时/峰值内存、实际字段名和“一个 mesh node”的准确结构描述；之后重跑 13/13 测试、四类 CLI、冻结安装与 `pnpm check`。

## 需作者确认

无