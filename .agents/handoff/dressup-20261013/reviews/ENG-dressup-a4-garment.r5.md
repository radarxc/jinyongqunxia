VERDICT: FAIL

## 逐项结论

- 写集：通过 —— 相对基点无已跟踪文件变更，全部 20 个未跟踪文件均位于任务允许的三个脚本、`garments/**`、`hair/**` 和本任务报告范围内。
- 严格件推离门禁：不通过 —— [fit_garment.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a4-garment/tools/model3d/dressup/fit_garment.py:85) 在提供 `reference_normals` 时优先选择法线同向候选，而不是几何最近三角；该口径贯穿推离及最终复查。只读复算现有严格件时，不带该筛选得到 227 个体内顶点、1,097 个安全距不足，最小距离 `-0.002480194 mu`；A1 的精确 `signed_distance` 进一步确认这 227 个候选全部为负。产物却记录 `residual=0`、`insufficientMargin=0`、`minimumDistanceMu=0.001771456` 并标为 `fitted`，见 [fit.json](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a4-garment/assets/default/model3d/dressup/garments/_fixture_bodysuit/fit.json:73)。
- 推离迭代上限：不通过 —— [fit_garment.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a4-garment/tools/model3d/dressup/fit_garment.py:714) 在 `--iters` 轮结束后，又执行直接校正及最多 32 次 `_exact_clearance`；拓扑修复还可追加四组同类循环，但 `rounds[]` 不记录这些子迭代。实际工作量超过 `--iters`，不符合“到 inside=0 或达 `--iters` 上限”及逐轮留痕要求。
- 翻面门禁：不通过 —— [fit_garment.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a4-garment/tools/model3d/dressup/fit_garment.py:571) 用固定面积阈值 `7e-7` 排除小三角。对严格件原始与输出网格逐面重算，实际存在 5 个法线反转三角，但产物记录 `flippedTriangles=0`。其中至少一面原双倍面积 `5.4662e-6`、输出双倍面积 `3.5371e-7`，并非原始退化面，而是推离后接近塌陷并翻转。
- 严格夹具噪声：不通过 —— [tests_garment.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a4-garment/tools/model3d/dressup/tests_garment.py:130) 将三个坐标分量分别施加最高 3 mm，实际噪声向量最高 `5.196185 mm`，10,699/51,734 个顶点超过 3 mm；测试只检查单分量范围，不能证明“幅度不超过 ±3 mm”。
- 严格夹具有效性：部分通过 —— 固定种子、由指定五个 region 派生、无 skin 输入、无事后 SDF 校正；产物记录贴合前穿透率 `3.09274365%`，复算一致。但由于噪声幅度和最终推离/翻面统计不合格，不能作为严格验收件。
- 权重转移与 `jointsAllowed`：部分通过 —— `k=16`、slot 白名单、超过 100 mm 的关节线段回退和 Hips 裙摆先验均已实现；不落盘的圆柱、过滤、远点回退测试通过。不过法线偏好的候选面也影响“真实高置信率”统计，现有 fit 数据需修复后重生成。
- 遮罩：通过 —— 严格件 `hideRegions` 含 `torsoUpper/torsoLower/hips/thighL/thighR`，不含 `neck/handL/handR/footL/footR`；圆柱遮罩测试通过。
- 对齐与禁区：通过 —— 未见 AABB 中心对齐、`HeadTop_End` 头顶、`Neck+0.006`、`bone.scale`、混用两套 rig、Blender或新增依赖；关节对齐强制正行列式并要求左右臂、左右大腿等至少六个锚点，袖角从网格实测。
- 三件诊断件：不通过 —— 三件均正确标为 `draft`，耗时和结构数据存在；但同一错误口径使残留被低报。按不做法线候选替换的最近面复算：流仙裙至少 `44` 个体内点、`144` 个安全距不足、最小 `-0.009510 mu`；夜行衣 `45/356/-0.008144 mu`；马尾 `365/2375/-0.048247 mu`。产物分别记录残留 `0/0/0`，与“如实写真实残留、安全距”不符。
- 跨模板 refit：部分通过 —— 恒等结果最大位差实测约 `1.19e-7 mu`，低于 `1e-6`；非恒等件确实改变骨长并正确标为 draft，目标 IBM 与目标模板逐字节一致。但 refit 复用了失真的推离门禁，恒等 `fitted` 结论不能成立。
- GLB 契约：通过 —— 五件交付均为一个几何节点、一个 mesh、一个 primitive、65 joints；各自 IBM 与对应模板逐字节一致，`_REGION` 为 u8 SCALAR，几何节点无 TRS，材质为 unlit、双面，三件贴图均为 2048×2048 JPEG，未保留 normal/metallicRoughness 纹理引用。
- 自测与全仓门禁：不通过 —— 10 个不落盘单元测试实跑通过，脚本 AST 与 JSON 解析通过；但完整 `tests_garment.py` 会重写正式资产，`pnpm install/check` 也可能写构建状态，本次只读审核未执行。更重要的是，现有测试只断言被错误口径生成的 `pushOut` 字段，未独立用 A1 `signed_distance` 和无阈值翻面复算，因此无法拦住上述错误。
- 报告：不通过 —— [报告](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a4-garment/tools/agents/reports/ENG-dressup-a4-garment.md:15) 声称严格件残留/翻面为 0，与独立复算不符；所写 `7.51 s / 516.44 MiB` 也与当前 `fit.json` 的 `9.696904 s / 386.203125 MiB` 不一致。报告虽为 40 行且七节齐全，但没有满足实跑数字与产物一致要求。

## 返修说明

1. 重构 `SurfaceIndex.query` 和所有推离/门禁调用：几何最近三角必须独立于衣物法线选择，优先复用 A1 `nearest_triangle`/`signed_distance` 的真实最近面语义。源法线只能用于置信度夹角判断，不能替换最近面。增加回归：当前严格件旧输出必须测出至少 227 个负距离点，修复输出再严格断言真实 `residual=0`、安全距不足为 0。
2. `--iters` 必须成为真实总迭代上限。删除上限外隐藏的直接校正、32 次 `_exact_clearance` 和未记账拓扑循环，或将每一次实际查询/移动都计入 `rounds[]` 且总数不超过 `iters`；靠单轮算法和平滑修正收敛。
3. 翻面检查不得用绝对面积阈值静默豁免推离后变小的三角。对所有原始非零面积三角检查方向；输出退化/近塌陷应单独作为失败统计。边长 `[0.7,1.4]` 也应按全部有效原始边统计，不以硬编码 `7e-4` 跳过。
4. 将夹具噪声改为向量幅度不超过 3 mm，并在测试中直接断言 `max(norm(noise)) <= 3 mm`。仍需在不读取 SDF、不事后校正输入的前提下达到贴合前穿透率 ≥2%。
5. 修复后重新生成严格件、三件诊断件、恒等和非恒等 refit 的全部 GLB/fit.json；独立复算 SDF、翻面和边长后再决定 `status`。
6. 更新报告全部数据，尤其严格件及三诊断件的真实残留/安全距/最小距离、翻面、耗时和峰值内存，确保逐项与最终产物一致；随后在可写校验环境重新运行完整 `tests_garment.py`、三件 CLI、恒等 refit、冻结安装和 `pnpm check`。

## 需作者确认

无。