# ENG-dressup-d1b-neck-splice 报告 · 3D 纸娃娃换装 · D1b · 头颈拼接标准工具（Claude 直接实现，AR-110；审核 r1–r6 返修版）

## 1. 摘要（3–6 行）
D1 进主干后在 5173 实测有四个问题：颈桥朝里（黑圈）、切口碎片、色阶（"多一圈"）、底缝细线。本任务改写为标准工具：截图工具 `shoot_head.mjs` 加数值拼接 `cut_head.py`。
颈片取模板颈部三角，用余切双调和 L M⁻¹ L d = 0 变形，两端重叠：底带压住身体，顶带精确内缩到头皮下 0.3 mm。
返修情况：
- r1 六条：逐面朝外 100%、两端 G1 < 5°、73 帧外露 ≤ 0.1 mm、运行时对照、hideMapError、测试与报告；
- r2 四条：仓库相对路径、朝向逐面 100%、逐段帧数、恢复 `ring` 字段；
- r3：标准 penetration 恢复 D1 口径，切面以下全部点参与、不加过滤。为此遮罩平面移到规范环平面，原来放在肩顶时动作中切面会漂离开口边。
- r4 / r5：顶带改为带符号统计，bind 门禁为整带 ≤ −0.25 mm。截图工具补后颈机位与接缝裁切视图，并修掉蒙皮网格被视锥剔除、run 帧整颗头不画的问题。
黄蓉重生成后 45 项检查全过（level draft）。未花点数，不改运行时和 validate 阈值。

## 2. 产出（文件、行数、主要章节）
- `cut_head.py`（2,296 行）：柱面精确光栅（径向射线与三角平面求交）、精确裁头、红绿局部细分、沿底带上沿切分、双调和带约束、单侧 A/B 过渡、≤ 4 骨骼权重场、条带贴图、遮罩与外渗、73 帧检查（标准 penetration 按 D1 口径）、过渡列只报；`--fast`。
- `tests_head.py`（626 行，14 个用例）：
  - 红绿细分水密、单侧过渡与径向内缩、平面精确光栅；
  - 恢复 D1 的 penetration 回归：切面以下颈环外侧压入 2 mm 必须计入，只有切面以上可排除；Neck 骨刚性切面；
  - 真实产物 73 帧独立复算外露与标准 penetration，与 `report.json` 对拍。
- `shoot_head.mjs`（462 行）：每次定格从绑定姿势起算并逐头比对姿势签名；后颈机位按实际网格的后颈 / 喉部参考点定位；`nape_cut*` 裁切视图把挡在后颈前的三角临时从索引去掉（只用于接缝验收）；拍摄时关闭蒙皮网格的视锥剔除（运行时用绑定姿势包围球，run 时会把整颗头剔掉）。
- `heads/npc_huangrong/`：head.glb 1,966,000 B，16,394 点、27,813 三角（预算 30,000；颈片 6,176 / 11,437，2 个开口）；单 primitive、65 joints 同模板、unlit、图集 JPEG q90 4:4:4。

## 3. 关键结论与数值
- **切面与分区**：h_head = 24.0 mm；遮罩平面 = 规范环平面（0 mm）；颈片下沿 −3 mm，底带 −3 到 +5 mm，外移 0.3 mm；A 区 286°，A 内部 264 列，过渡 22 列。
- **颈片求解**：约束点数为底带 1,463、顶带 1,872、裙带 1,183，自由 1,658；残差 5e-9 mu。顶带按头皮网格径向精确内缩（976 点）。
- **朝向**：一致边 100%，逐面朝外 100%，非流形 0。
- **接缝**（最终 GLB 图集）：ΔE2000 底缝 p95 0.85、顶缝 p95 1.42；G1 顶缝（内部）max 3.39°、p95 1.45°，底缝 max 0.71°；外凸 0.37 mm（< 1）；喉部内凹 3.28 mm 只报。
- **标准 penetration**（D1 口径，切面 = 遮罩平面按 Neck 骨变换，切面以下全参与）：bind 0（876 点）；idle 最坏 0.10%（1/1030，t = 1.917）；walk 0；run 0；独立复算与报告逐项一致（r3 时平面在环下 9 mm，idle 为 4.23%）。
- **重叠带**：底带外移最小 +0.29 / +0.20 / +0.21 / +0.04 mm；顶带 810 点带符号最大值 bind −0.288（整带在皮下 ≥ 0.288 mm）、idle −0.198、walk −0.202、run +0.080 mm；遮罩外渗 0。
- **只报项**：过渡列 G1 max 27.1°（229°，源头皮卷曲）、外凸 0.67 mm；holes 0.09–0.12%；垂发穿插 run 15.9%（源发片）。
- **肤色与尺寸**：ΔE 由 4.50 降到 0.00006；缩放 0.92（钳位），整体偏差 0.47%。
- **截图**（`.agents/coord/_dressup/shots_w0/d1b_r5/`）：
  - `compare/sheet.jpg`：D1 对 D1b，4 姿势 × 8 机位（含 `nape_cut` 正后 / 左后 / 右后）。D1 的黑圈、碎片、后颈锯齿与黑缝在 D1b 全部消失；
  - `nape/sheet.jpg`：D1b 后颈专题，bind / idle / walk / run@0.5 / run@0.25 × 6 机位。run 时发片甩到后颈前方，裁切视图下后颈中央仍清楚可见：发际线渐变到背部，皮肤连续，无黑缝、碎片、鼓圈；
  - `mask/sheet.jpg`：遮罩开 / 关。
- **耗时**：`--fast` 约 11 秒；完整流程 196 秒（最终产物 `durationMs = 195716`）。

## 4. 开放问题（附默认值）
- 发际线过渡列的 G1 与"不外凸"在几何上冲突（源颈比模板宽约 6 mm，边缘卷曲）。默认：切口处保持斜率，外扩量饱和，这些列只报（裁定 6）。
- run 大前倾时发片甩进后颈、后背（源发片问题）；后颈接缝改用 `nape_cut*` 裁切视图验收。
- 运行时缺陷（不在本任务写集）：换装 actor 的蒙皮网格按绑定姿势包围球剔除，近景跑步镜头会让头 / 衣物整件消失。已另开任务修复。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
- D1b-P1：P5 量产统一用本版 `cut_head.py` 加 `shoot_head.mjs` 截图验收。理由：两端重叠，同权重插值，标准 penetration 与 73 帧外露都达标；离线软光栅漏掉过背面剔除、定格顺序这类运行时问题。
- D1b-P2：validate 的 holes 门只对衣物 / 头发生效，头资产改用遮罩外渗门。理由：替换头颈时，轮廓收窄无法和破洞区分。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `docs/tech/12` §1 V4 门禁改为第 3 节口径；§2 P5 的 A1 / A2 合并为 `cut_head.py`，并新增运行时截图验收（命令见第 7 节）。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 截图工具：真实运行时，定格与拍摄顺序无关，多机位，遮罩开关，总图与 JSON；eslint 通过。
- ✅ 5173 截图：颈部无黑缝、碎三角、色阶竖纹、"多一圈"；标准 penetration bind 0，动作 ≤ 0.10%。
- ✅ 背视 × 四姿势：`nape_cut*` 裁切视图逐张目检，run 帧后颈中央接缝可见且连续（第 3 节 `nape/sheet.jpg`）。
- ✅ 接口不变：`fit.json` 写仓库相对路径，保留 `ring`（residualMu 为颈片衔接身体的约束残差）；报告逐段记帧（1 + 24 × 3）。
- ✅ `fit.json` / `report.json` / `manifest.yaml` 与磁盘一致，45 项全过；`tests_head.py` 14/14、`selftest.py` 7/7；`pnpm install --frozen-lockfile`、`pnpm check` 由 supervise 校验。
- ⚠️ holes 与过渡列只报不判（裁定 1、6）。

P5 交接（参数默认值见 `fit.json.diagnostics.params`）：
1. 迭代：`python3 tools/model3d/dressup/cut_head.py --source <model_rig.glb> --template <tpl> --id <npc> --out <dir> --fast`。
2. 定稿：去掉 `--fast` 直接写入 `heads/<npc>`，看 `report.json` 全过；`checks_detail.transitionReportOnly` 要人工过目。
3. 截图验收：`node tools/model3d/dressup/shoot_head.mjs --head before=<旧> --head after=heads/<npc> --out <shots> --poses bind,idle@0.6,walk@0.35,run@0.5 --views neck,neck_left,neck_back_left,neck_back_right,nape_cut,nape_cut_left,nape_cut_right,under --mask both`。长发角色再拍 `nape_cut_low,nape_side`；逐格看，hideMapError 须为 null。
