# ENG-dressup-g1-hidemask 报告 · 3D 纸娃娃换装 · G1 · 身体遮罩离线烘焙 + validate 可见穿透（AR-108 V2）
## 1. 摘要（3–6 行）
- 已实现 1024² L8 UV hide mask：80 mm 法线 + 8 个 25°斜射线、首命中衣面所属开口环的测地留边、neverHide、4 px 闭后开、<400 px² 内岛填充、跨 UV 岛同步、gutter 与正背预览。
- `validate.py` 有遮罩时新增 `penetration.*.{all,visible}`，all 只报、visible 判门；无遮罩行为不变。
- 劲装三模板已真实执行 edge weight 混合、80 轮推离与 bind 清理；bind visible 全为 0，idle/walk/run visible 全部低于 0.7%，最终 seam 核验均为 0 不一致。
- AR-108 V2 已达标；E2b 版型几何旧门仍 fail，故 manifest 如实保持 `experimental: true`、`gateLevel: fail`。
## 2. 产出（文件、行数、主要章节）
- 工具：新增 `bake_hide_mask.py` 697 行、`tests_hidemask.py` 223 行；修改 `validate.py` 912 行、`fit_garment.py` 1252 行、`tests_garment.py` 599 行。
- 资产：更新 3 GLB、3 fit、3 report、manifest；新增 3 张 L8 mask 与 3 张 preview。
- 验收：`tests_hidemask.py` 12/12、`tests_garment.py` 20/20、`selftest.py` 7/7；冻结安装 707 ms；`pnpm check` 187/187 文件、1331/1331 测试，1777 个内容文件及故事编译、构建、size/dev-chunks 全通过。
## 3. 关键结论与数值
- 遮罩覆盖率 medium/small/tall=`59.6130%/59.3870%/59.4412%`；开口测地留边 15 mm、射程 80 mm、edge band 30 mm、gutter ≥4 px；bake=`135.339/139.162/134.652 s`，edge refit=`7.682/7.297/7.729 s`；最终 seam=`0/229449`（三模板最坏组均 0）。
- medium visible/all：bind `0/0`；idle `0.5947%/8.8736%`，walk `0.5531%/10.0095%`，run `0.4698%/8.4632%`。
- small visible/all：bind `0/0`；idle `0.5947%/11.3774%`，walk `0.6423%/12.5134%`，run `0.6602%/10.0452%`。
- tall visible/all：bind `0/0`；idle `0.3985%/8.5227%`，walk `0.4163%/9.6408%`，run `0.3687%/7.4997%`；三件 report level=`fail`（仅 E2b 旧几何门导致）。
- 与文档一致：visible 门为 ≤2%，all 只报；`--edge-weights template --edge-band-mm 30` 默认关闭。偏离：无。
## 4. 开放问题（附默认值）
- E2b 旧几何问题：翻面 medium/small/tall=`504/171/262`，边长合格率=`88.3225%/97.9602%/96.8997%`，small close-fit P90=`5.2401 mm`；默认交 E2b，不在本任务放宽门禁。
- preview 目视已清除衣服轮廓内胸腹、腰胯、背部大片漏遮，仅保留领/袖/摆窄边、neverHide 与少量边缘纹素；默认由 B4 浏览器实走复核最终观感。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；V2 达标，E2b 问题不反向修改 AR-108 或既有门禁。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- B4：按模板读取 `fit.hideMask={file,size,coveredRatio,marginMm,maxDistanceMm}`；L8 白=隐藏、与 baseColor 共 UV、左上原点/`flipY=false`，身体材质 discard。
- P2：量产固定为贴合 → 可选 edge weights → 推离复查 → bake mask → validate；visible 判门、all 诊断，E2b 几何门未清前实验件不得转 approved。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 首命中层所属开口环测地距离、80 mm 斜射线独有命中、形态学后 split seam 边内 33 点最终像素一致、neverHide、gutter、三模板 bind visible=0 均有回归；真实三模板各审计 229449 点、不一致 0。
- ✅ 三模板动态 visible ≤2%、bind visible=0；未改既有阈值，无遮罩兼容路径保持原语义，测试不写真实 `eq_jinzhuang`。
- ✅ 四条指定检查均实跑通过；`git diff --check` 通过，改动范围仅限任务写集。
- ⚠️ B4 接口与 P2 参数已在第 6 节给出；E2b 旧几何门仍 fail，manifest 保持 draft + experimental + gateLevel fail。
