# ENG-dressup-e2-extract 报告 · 3D 纸娃娃换装 · E2 · 网格层：劲装整身抽衣壳 → 贴合（两种权重来源对比）→ 门禁 → 入库 + 娇小 / 修长重贴合
## 1. 摘要（3–6 行）
- 完成颜色主判、1 轮焊接邻接多数平滑、UV 核对、毛边清理、A/B 权重对比和三体型实验入库。
- 抽壳为 1 个焊接连通块、4 个真实闭合开口（无开放链），躯干/双臂覆盖达标；第五孔回归会硬失败。
- A（Tripo 源权重）三段动态穿透均低于 B，正式实验件选 A；三体型 report.level 仍均为 fail，未改门禁。
- 按 06:35 裁定以 `draft + experimental + gateLevel: fail` 入库，`hideRegions=[]`，供 AR-106 与贴图层叠穿对比。

## 2. 产出（文件、行数、主要章节）
- 代码：`extract_garment.py` 904 行，`tests_extract.py` 261 行（4 个测试）；`fit_garment.py`/`tests_garment.py` 仅追加 `--align` 与回归。
- 中间件：`extract_run/` 含双 raw GLB、`extract.json`、前/后/颜色/边缘细节四类 QC 图；`source/` 原样保留。
- 标准件：medium/small/tall 均 25,836 三角、2048²、1,574,804/1,574,788/1,574,800 B。
- GLB sha256：medium `bf792c…f3a233`、small `f2132e…ede38`、tall `3c254e…feea`；无候选/打包临时目录。
- 实跑：Node 22.22.1/pnpm 9.15.9 冻结安装通过；Python 4/4、18/18、selftest 7 项；完整 `pnpm check` 退出码 0（184 files、1,313 tests）。

## 3. 关键结论与数值
- 对齐 det=+1；躯干 RMS/max=1.91645/3.68348%H（验收按 RMS≤2%H），腕 RMS/max=3.79114/4.27939%H，脚=6.05984/6.05984%H。
- 分割证据三角：区域 138,634、颜色 109,086、距离 92,109、区域∩颜色 104,410、区域∩距离 87,181、三者 75,255；颜色为主。
- 阶段：初判 104,410 → 多数平滑 104,446 → 去小岛 102,981 → 补洞 103,568 → 边缘清理 103,324 → 封 2 孔共 32 面 = 103,356；深层候选 878 面只审计。
- 毛边后 1 连通块；真实环 `count=4`、`openChains=0`，语义另列领/双袖/下摆；平滑 904 个源顶点（852 个焊接顶点）、最大 2.00005 mm，正面颜色 QC 可见交领/腰结/前垂带。
- 覆盖 torsoUpper/lower=0.9539/0.9911，upperArm L/R=1/1，forearm L/R=0.9027/0.9264；头/手/脚/小腿均 0；距体表 p50/p90/max=15.87/32.53/54.43 mm。
- 打包口径 A/B：highConfidence=1.0000/0.5237；bind=149/55；idle=8.9330%/14.5796%，walk=9.9619%/13.5944%，run=9.3196%/11.7417%；翻面=309/120，边长=88.5005%/96.5264%；选 A。
- medium fit 残留/安全距不足/翻面=228/650/2；report bind=149、动态=8.9330%/9.9619%/9.3196%、翻面 309、边长 88.5005%、fail。
- small fit=27/170/63，report bind/动态=27/10.8362%/12.1744%/10.0987%、翻面 49、边长 98.1034%；tall=27/187/61，report=27/8.4156%/9.5337%/7.9041%、翻面 48、边长 98.1808%；均 fail。
- 耗时/峰值：抽壳 62.709s/878.50MiB；medium fit 18.646s/680.58MiB，small 3.924s/367.84MiB，tall 3.755s/351.19MiB；validate 未内建资源字段。
- 一致处：3mm、20 轮真上限、既有 textures/pack/validate/refit、门禁阈值均不变；裁定例外：fail 件实验入库且不隐藏身体。

## 4. 开放问题（附默认值）
- 衣服与皮肤同色：Lab 会漏面；默认保留底板差异采样 + 人工 QC，不写死 RGB。
- 腰带结/垂带：可离体表且独立；默认允许 1–2 附件块，但本件主壳仍要求 1 块。
- 衣摆开衩：真实开衩不能当洞补；默认真实环是门禁、语义命名只作审计，本件额外孔已封至 4 环。
- 动态穿透/翻面仍远超门禁；默认本件只作 AR-106 实验，叠穿贴图层，不升 candidate。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
- E2-P01 / 开口 `count` 固定为真实环数，语义另存 `semanticOpenings` / 防止四个命名环掩盖第五孔。
- E2-P02 / `refit_template.py` 写目标 `template`/`mPerMu` / 当前继承中码字段，本任务只在允许的产物中校正。
- E2-P03 / `pack_glb` 加未引用顶点压紧 / 本件 25,836 面时从 56,853 降至 16,814 顶点，validate 明显加速。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `docs/tech/11` §5.3~§7 / semantic/raw 开口、实验 fail 资产字段、压紧后门禁口径。
- C2 Skill 手册 / 加入下列命令序列、4 开口/覆盖停线条件及 fail 实验例外。
- E3 / 复用 `sample_base_color` 的 top-left/v-down、`plate_lab_samples` 和颜色质检接口。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 躯干 RMS≤2%H；1 连通块、真实环 4、开放链 0、禁区 0、覆盖达标；第五孔回归会失败。
- ✅ `--align auto|joints|landmarks|none`，auto 保持历史字段，none 走模板权重；公开分支有测试。
- ✅ A/B 同参数完整 validate 并选 A；⚠️ 两者 fail，未保留候选目录。
- ✅ 三体型标准布局与 report；manifest 为 `draft/experimental/gateLevel: fail`；`hideRegions=[]` 且保留 computed。
- ⚠️ 严格几何/动态门未过，数字见 §3；这是协调者裁定允许的实验件，不宣称 approved/draft 门禁通过。
- ✅ 命令序列：extract → A `fit --align joints` / B `fit --align none` → textures → pack 0.25 → 压紧 → validate → 选 A → refit small/tall → validate → 实验 manifest。
- ✅ `tests_extract.py` 4/4、`tests_garment.py` 18/18、`selftest.py` 7；fixture 仅有 12:50 裁定豁免的测试计时字段改写，不纳入写集。
- ✅ 冻结安装、`py_compile`、`git diff --check` 通过；仓库信号量脚本以可写锁根执行完整 `pnpm check`，退出码 0（184/184 files、1,313/1,313 tests，内容/故事/构建/包体全绿）。
