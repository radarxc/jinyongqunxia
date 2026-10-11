# ENG-dressup-g1-slice-fit 报告 · 3D 纸娃娃换装 · G1 · 衣物 / 盔甲"Z 向切片"贴合（r2 返修版）

## 1. 摘要
作者方案**合理**（ADR 0002 §2，8 条修正）。r2 按协调者 23:25 裁定 9–12 把"颈 → 下摆竖直缩放"做实：领口 / 下摆 / 袖口**锚点从衣物自身几何量出**（后中 ±45° 扇区上 / 下包络中位、袖口沿臂弦远端包络中位），**目标按设计体选**（离锚点最近且差 ≤ 10 mm 的标注面，否则夹住它的两面按比例），与锚点分字段存，映射以锚点为必经点。劲装在原生 tpl_f_medium 上近恒等（领口 / 下摆各上移约 5 mm，跨度比 0.9994，袖长比 1.000）；三体型标注数值映射残差 0、**实际衣缘落点残差 ≤ 0.25 mm**；链尾三项门三体型全过（翻面 0 / 边长 100% / bind 穿透 0）。r1 诊断里的"下摆 −77 / 领口 +15 mm"量的是全件最低 / 最高点（腰带垂尾尖、侧颈峰），不是衣缘；但 r1 竖直映射确实用模板高度冒充衣物高度，已改。另查出模板骨架 Hand 关节左右不对称（离肩 428 / 474 mm），腕改取网格前臂最细处（436 / 439 mm）。未调 Tripo、未花点，未改现有工具 / 素材 / 门禁，未做 git 写操作。

## 2. 产出
- 代码：`tools/model3d/dressup/slice_fit.py`（CLI 与对外函数，273 行）+ `slice_fit_{base,geometry,model,landmarks,anchors,radial,parts,solve,metrics,render,sections,fixtures,chain,testkit}.py`（105–362 行；`anchors` 衣缘锚点 / 目标 / 映射 / 核验、`testkit` 合成件为 r2 新增）；`tests_slice_fit.py`（489 行，16 项）。
- 文档：`docs/adr/0002-dressup-slice-fit.md`（§2 第 8 条、§3 决策 4–5、§4 衣缘锚点与臂点规范、§6 诊断字段、§9 实测重写）。
- 标注（重生成）：`templates/tpl_f_{medium,tall,small}/slice_landmarks.json`（17 个标注面不变；臂点加网格腕 `wristMu`、指根 `handMu`，骨架 Hand 记 `wristJointMu`）；`garments/eq_jinzhuang/slice_landmarks.json`（`collar` / `hem` / 袖口各为 `anchor` + `target`，设计体 tpl_f_medium，袖轴取模板臂点）；三件测试甲 `slice_landmarks.json`（锚点从生成几何量；GLB 逐字节未变）。
- 结果（全部重出）：劲装 `shots/slice_fit.tpl_f_{medium,tall,small}.{json,views.jpg,sections.jpg}` 与 `.tight.*`、测试甲 `shots/slice_fit.tpl_f_medium.*`、链尾 `garments/eq_jinzhuang/slice_fit/{eq_jinzhuang.<模板>.glb, fit.<模板>.json, report.<模板>.json}`。三视图首行虚线 = 衣物锚点、细实线 = 素体目标，后两行只画目标线。最能说明问题的 4 张：劲装 medium / small `views`（后中下摆与后领落在目标线上）、劲装 medium `sections`、板甲 `views`（r = 0 整件相似，下摆落肚脐）。

## 3. 关键结论与数值
- 劲装锚点（衣物原坐标）：后领上沿中位 0.8299（扇区 p10–p90 0.814–0.840，后领锯齿）→ 颈根；后中下摆可见下沿中位 0.5346（下摆内折，开口边后中在 0.5756）→ 胯；袖口沿模板臂弦 452 / 454 mm → 腕—指根之间 t = 0.14 / 0.13。全件最低点是前襟腰带垂尾（下摆锚点下 72 mm），最高点是侧颈峰（后领锚点上 21 mm），都不是衣缘。
- 劲装三体型（移动 = 目标 − 源；"相对原始件"经压紧映射回指原始抽取件，validate 同口径）：

| 模板 | 领口 / 下摆移动 | 竖直跨度比（局部斜率）/ 袖长比 | 映射残差 | 实际落点残差 领口 / 下摆 / 袖口左 / 右 | 切片段 边长 / 翻面（只报） | 链尾门 翻面 / 边长 / bind | 链尾相对原始件（只报） | 动画穿透 idle / walk / run（只报，门 ≤ 2%） |
|---|---|---|---|---|---|---|---|---|
| medium（原生） | +5.2 / +5.5 mm | 0.9994（0.93–1.07）/ 1.000 | 0 | 0.03 / 0.003 / 0.03 / 0.24 mm | 98.61% / 52 | **0 / 100% / 0 通过** | 98.71% / 24 | 3.8 / 1.8 / 1.3% |
| tall | −17.6 / +5.5 mm | 0.954（0.84–1.04）/ 1.018 | 0 | 0.12 / 0.005 / 0.03 / 0.25 mm | 98.49% / 53 | **0 / 100% / 0 通过** | 98.74% / 24 | 3.9 / 1.6 / 1.1% |
| small | −15.9 / +5.5 mm | 0.957（0.70–1.18）/ 0.976 | 0 | 0.22 / 0.004 / 0.03 / 0.24 mm | 97.26% / 69 | **0 / 100% / 0 通过** | 97.91% / 43 | 5.3 / 3.8 / 1.9% |

- 切片段穿入点（输入 → 对中 → 切片 → 外推）：medium 7201 → 4694 → 1016 → 0、tall 7022 → 5844 → 1019 → 0、small 5819 → 3701 → 1007 → 0，最小间隙均 1.00 mm；与 E2b 交付件表面距离中位 5.7–5.9、p90 13.9–14.0 mm。动画穿透对照 E2b 交付件全顶点口径（6.0 / 3.7 / 1.9%、6.5 / 3.9 / 1.6%、7.3 / 5.7 / 2.3%），本链均更低。
- 测试甲（tpl_f_medium）：板甲 r = 0 下摆 → 肚脐（+26.3 mm）、跨度比 0.929，落点 0.001 / 0.001 mm，边长 99.98% / 翻面 0；明光铠 下摆 → 臀下（−32.2 mm）、跨度比 1.050，落点 0.001 / 0.000 mm，100% / 0；锁子甲 下摆 → 膝上、袖口 → 肩—肘 0.54，落点领口 **1.90** / 下摆 0.000 / 袖口 0.000 mm，99.80% / 0——领口高出是 r = 0.3 的领圈收不进颈根斜坡，3D 残余外推沿斜方肌法向把它托高（"搭在肩上"），映射残差为 0。
- 字面贴体对照（foldMm = 0，medium，仅切片段）：90.73% / 翻面 290，间隙中位 4.7 mm（保褶版 10.3 mm）。
- 只报项：结果上重新分格取点，劲装领口差 2.7–4.5 mm、袖口 2.8–7.8 mm（后领锯齿、袖口斜边在格内换点，不是映射误差，故落点按同一批衣缘点量）；链尾件上衣缘点落点领口 0.02–0.23、下摆 0.65–1.09（减面后只剩 9–11 / 36 点，另含 3 mm 推离）、袖口 0.07–0.71 mm；validate `closeFitP90DeltaMm` 8.55 / 8.15 / 8.16 mm，恒等源重算 0.93 / 0.87 / 0.98 mm（G1-P2）。

## 4. 开放问题（附默认值）
- 动画穿透属 E2c 姿势蒙皮 + 外展角，默认等 E2c 并入后按同链复跑 validate；holes 需 `bake_hide_mask`，默认同时补。
- 3D 残余外推沿体表法向推离，碰斜坡时会带竖直分量（锁子甲领口 +1.9 mm）。默认保留（物理上是"搭在肩上"）；若作者要领口严格落在颈根，下一步可改为斜坡处只做水平推离。
- 目标就近容差 10 mm、中间对应面离锚点 ≥ 40 mm 为默认值（`anchorRule`，落盘随标注），劲装原生模板因此领口 / 下摆各上移约 5 mm；若作者要原生严格恒等，下一步把容差改 0（全部按比例）即可。
- 后中扇区口径对后中开衩宽过扇区一半的款式会取到开衩顶；默认标注时用 `--expect-collar / --expect-hem` 核对目标面，不符即报错。分腿裤装与多 primitive 输入仍未实现、CLI 报错。
- 劲装落肩袖窿比素体腋下低 5 cm，切片段折痕集中在腋下 / 袖窿（只报）；默认靠链尾 volume 推离 + 翻边。
- 真盔甲素材需另起 Tripo 任务；测试甲只验证算法。

## 5. 对基准的修改提案
- G1-P1：`tech/12` §2 P2 第 4 步加可选前置 `slice_fit.py chain`，用于按别的体型做的甲 / 衣与跨模板（替代 refit）；Tripo 同板件在本模板可不走。
- G1-P2：`validate.py` 的 `_landmark_source` 对 `align.bodySpaceIdentity = true`（`--align none`）的源件应按恒等处理、不再按颈环平移；本任务复算 closeFitP90Δ 平移口径 8.55 / 8.15 / 8.16 mm（与 report 一致）→ 恒等口径 0.93 / 0.87 / 0.98 mm。本任务只报不改。
- G1-P3：衣物标注加 `elasticityByLevel`（按标注面分段 r），宽松部位不被收紧。
- G1-P4：三模板 `skeleton.json` 的 `LeftHand` / `RightHand` 关节左右不对称（离肩 428 / 474 mm，网格前臂最细处在 436 / 439 mm，指根两侧对称），建议模板组核对骨架；本任务不改骨架，切片标注已改取网格腕点。

## 6. 需同步到其他文档
- `tech/12` §2 P2 / 附 A：登记 `slice_fit.py`（chain / fit / 标注子命令）与 `slice_landmarks.json`、链尾件目录 `garments/<id>/slice_fit/`。
- `tech/11` §5：新增 `tianshu-dressup-slice-landmarks.v1` 字段（ADR §4：衣缘 `anchor` / `target`、`anchorRule`、臂点 `wristMu` / `handMu`，单位后缀规则）。
- `docs/README.md` 文档索引：加 ADR 0002。

## 7. 自检
- 检查命令（本工作区、可写环境亲跑，代码与素材定稿后）：`python3 tools/model3d/dressup/tests_slice_fit.py` 退出码 0（16/16）；`python3 tools/model3d/dressup/selftest.py` 退出码 0（7 项）；`pnpm install --frozen-lockfile` 退出码 0；`pnpm check` 退出码 0（vitest 188 文件 / 1335 项通过，内容校验与包体预算 PASS）。三体型 `slice_fit.py chain` 退出码均 0（链内 validate 自身退出码 3 = level fail，来自只报项）。
- 裁定 9（源锚点）：已完成，领口 / 下摆 / 袖口源位置由 `slice_fit_anchors` 从衣物几何量出，语义写入 ADR §4 与 JSON（`anchor.method`），目标另存 `target`；`test_garment_landmarks_reproducible` 断言劲装落盘值 = 复算值。裁定 10（目标按设计意图）：已完成，就近 ≤ 10 mm 否则按比例；原生与 tall / small 的竖直跨度比、袖长比写入诊断 `verticalStretch` / `anchors` 与本报告 §3。
- 裁定 11（核验与回归）：`verticalCheck` 分 `mappingResidualMaxMm`（标注数值映射残差）与 `landingResidualMaxMm`（实际衣缘落点残差）；`test_real_jinzhuang_chain_gates` 三体型硬断言领口 / 下摆 / 袖口落点 ≤ 1 mm、映射残差 < 1e-6 mm，另断言链尾三项门、切片后穿入 0、最小间隙 ≥ 1 mm、拓扑 / UV / SHA；`test_armor_fixture_deterministic` 三件测试甲都做逐字节重生成与标注一致检查；`test_edge_anchors_and_targets` 合成件覆盖内折贴边、前 V 领、垂带、按比例目标。
- 裁定 12：三体型切片、诊断、效果图与 P2 链尾全部重出；三项门数字本身通过、阈值未动；中间件按复现命令重生成，SHA 均等于各 fit.json 的 source.sha256。
- 写集：`git status` 只列写集内 61 个新文件、无已跟踪文件改动；`slice_fit/_work` 已删；中间文件在 scratchpad。
