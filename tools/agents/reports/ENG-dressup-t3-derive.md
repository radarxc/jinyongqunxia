# ENG-dressup-t3-derive 报告 · 3D 纸娃娃换装 · T3 · 路 A 体型派生 derive_template.py（中等 → 娇小 / 修长，AR-104）
## 1. 摘要（3–6 行）
完成六模板规格、分骨 translation + LBS 派生器及 6 项回归，并从当前 AR-105 25° `tpl_f_medium` 重派生娇小 / 修长。
返修后 Neck 纳入 `k_spine`、Head 保持原 translation；Hips bind 不动，三条动画 translation 严格写为 `source × k_leg`。
位移在源/目标各自脚底归零后逐顶点比较，动态上限通过；拓扑、UV、权重、材质贴图、65 骨顺序及 rotation 轨不变。
任务专项检查、冻结安装与 `pnpm check` 均通过。
## 2. 产出（文件、行数、主要章节）
- `template_specs.json` 11 行；`derive_template.py` 400 行：规格/链求解、translation 改骨长、LBS/法线、IBM、轨道、规范坐标度量与硬门禁。
- `tests_derive.py` 185 行：6/6；覆盖 Neck/Head/Hips、LBS/IBM、轨道精确缩放、脚底规范坐标、动态位移上限及真实产物。
- `templates/{tpl_f_small,tpl_f_tall}/`：各 6 文件（body、derive、skeleton、regions、skull_profile、manifest），manifest 的源/产物 SHA 已核对。
- `pnpm install --frozen-lockfile` 通过（lockfile 最新）；环境实际为 Node `22.22.1` / pnpm `9.15.9`，与 tech/01 目标 24 / 12 有差异但符合当前 `package.json` 锁定。
- `pnpm check` 通过：178/178 文件、1272/1272 tests、1777 内容文件、4 个 story compile tests，build/size/dev-chunks 全绿。
## 3. 关键结论与数值
- 一致：仅改子骨 translation；源 IBM 做 LBS，新 bind 世界矩阵求逆写 IBM；Neck 随脊柱、Head/颈环截面不缩放；无额外 root offset。
- `tpl_f_small`：k_leg `0.9374004788`、k_spine `0.9389736442`、k_shoulder `0.9504054588`、k_arm `0.9518072289`；耗时 `0.995 s`。
- small：`1.580000001 m` / 高比 `0.951807209`（误差 `-1.98e-8`），髋 `0.545000011`（`+1.08e-8`），肩 `0.150000003`（`+3.12e-9`）；源/目标脚底 `-0.000000041 / 0.029477688 mu`，规范位移 `0.047239033 ≤ 0.094467720 mu`，颈环差 `1.566 mm`。
- `tpl_f_tall`：k_leg `1.1193320926`、k_spine `0.9286245568`、k_shoulder `1.0312263729`、k_arm `1.0361445783`；耗时 `0.994 s`。
- tall：`1.719999986 m` / 高比 `1.036144548`（误差 `-3.08e-8`），髋 `0.585000016`（`+1.64e-8`），肩 `0.160000005`（`+4.75e-9`）；源/目标脚底 `-0.000000041 / -0.056192726 mu`，规范位移 `0.055475259 ≤ 0.070850790 mu`，颈环差 `1.619 mm`。
- 两套均无 NaN；三项比例在 ±0.5%，颈环米制差 < 2 mm；实现无规格偏离。
## 4. 开放问题（附默认值）
- 非阻塞：仓库工具链当前锁 Node ≥22.12 / pnpm 9，技术文档目标 Node 24 / pnpm 12；默认遵循实际 `package.json`，由工具链升级任务统一迁移。
- 默认男模板待 `tpl_m_medium` 正本到位后用同一规格和脚本派生，不预写骨架常数。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；实现遵循 AR-102、AR-104、AR-105 与 tech/10、tech/11 既定契约。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `docs/tech/11-paper-doll-3d-impl-spec.md` §10.T：登记本次两套 SHA、链系数、规范坐标位移及颈环门禁结果；本任务未越权修改。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 派生：两次 `derive_template.py --from .../tpl_f_medium/body.glb --spec .../template_specs.json --id tpl_f_{small|tall} --out ... --json`；源 SHA `1be19e87…e066f`。
- ✅ 侧车：分别以 `--default-height-m 1.58/1.72` 重跑 `export_skeleton.py`；body SHA `d4be6197…e297` / `fc6772d6…907d`，全部侧车和 manifest SHA 一致。
- ✅ 专项：`tests_derive.py` 6/6；两条 `normalize_rig --check` 均 65 joints、rest=bind `6.25e-08`；两条 `export_skeleton --check` 均 105082 vertices。
- ✅ 三套共 105082 顶点/196022 三角/65 骨，indices/UV/JOINTS/WEIGHTS/material/texture/骨名顺序一致；门禁失败退出 2。
- ✅ `refit_template` 消费共拓扑 body+skeleton 离线重贴体；运行时按 template 加载对应 body/IBM，复用 rotation clip，Hips 根运动随 `k_leg`。
- ✅ `pnpm check` 退出 0；仅改白名单路径，无新增依赖、绝对路径、临时产物或占位内容。
