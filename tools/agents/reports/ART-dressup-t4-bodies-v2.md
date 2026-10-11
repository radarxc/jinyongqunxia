# ART-dressup-t4-bodies-v2 报告 · 3D 纸娃娃换装 · T4 · 新女性素体 tpl_f2_medium + 新男性素体 tpl_m_medium（Tripo 生成 + 绑骨 + 动作 → 规范化 → 骨架帧，2 × 85 点）
## 1. 摘要（3–6 行）
作者 10-11 选定的女性 A（g1）、男性 A（g4）两张素体图已入库，各经 Tripo 一次生成、一次绑骨、idle / walk / run，导出后按 T2 第 8 步全套本地后处理，产出 `tpl_f2_medium`（1.66 m）与 `tpl_m_medium`（1.81 m，AR-104）。
两模板 65 关节、rest=bind、+Z，normalize / export_skeleton 的 `--check` 均通过；3D 臂角 21.50° / 21.71°，头身比 8.24 / 8.16。
实扣 170 点（65+20 各两次），余额 16,920 → 16,750；生成、绑骨各只提交一次，未购买、未点条款。
新女性颈更细更长、斜方肌一带轮廓低约 1 cm、肩线更宽平（截图见第 3 节）；男性有 1 处后脑倒置面露成小黑三角、左大腿外侧一条浅色贴图条带，未修，交后续任务。

## 2. 产出（文件、行数、主要章节）
- `assets/default/character/female/ch00/threeview/por_npc_zhujue__ch00_f_bald_base_body_apose_v2.png`（1686×2528，Gemini 原图解码存 PNG，逐像素一致）及同目录 manifest 新条目（提示词、参考、原始下载 sha256、check_plate 全过、作者选定记录）。
- `assets/default/character/male/ch00/threeview/por_npc_zhujue__ch00_m_bald_base_body_apose.png`（1696×2528 裁左右各 5 px 背景成 1686×2528）及同目录 manifest 新条目（三张上传参考与来源裁切、4 张候选的取舍、faceIou 不适用说明）。
- `templates/tpl_f2_medium/`、`templates/tpl_m_medium/`：`body.glb`、`skeleton.json`、`regions.npy`、`skull_profile.json`、`preview.png`（绑骨后 Tripo 封面，600×778 RGB）、`manifest.yaml`、`shots/`（女：`compare.tpl_f_vs_tpl_f2.jpg` 新旧 7 视图对照；男：`views.tpl_m_medium.jpg` bind / walk / run 9 视图）。
- `credits_ledger.jsonl` 追加 8 行（每件 generate_before / generate / rig_before / rig）；本报告 7 节。

## 3. 关键结论与数值
- 女 Tripo 项目 `56b020f5-f0fb-430e-84de-d82e4f0a572a`：生成 `46f22422-8e7d-48c1-ba80-7c8d4bf6b3cb`，绑骨 `57162146-7d8e-42e8-8b05-d90c26e1fa82`，导出 `55f046c7-89dd-46eb-beaf-0b4f41360022`；动作 idle `5f819ed9…`、walk `e1ffa03b…`、run `63cfa1e2…`（0 点）。点数 16,920 → 16,855 → 16,835。
- 男 Tripo 项目 `1ccfd7a9-909c-45b9-b87a-346acc5932f8`：生成 `bf93598e-4dc6-483f-8f36-8e59368138f2`，绑骨 `b15debfd-144c-4c78-a90c-c30fe541794a`，导出 `0c19ad55-73d4-4646-a53f-b3e919dab854`；动作 idle `608c72e1…`、walk `1be549d0…`、run `a8e604a5…`。点数 16,835 → 16,770 → 16,750。
- 封面 / 白模质检：两件脸、光头、双耳、手脚完整，抹胸 / 三角裤贴身，臂张角与底图一致；两件都先导出未绑骨模型（0 点）在 5173 正 / 背 / 颈 / 脸多机位看过，再绑骨。
- joints（Tripo 坐标）：女 Hips y 0.530、Head 0.882、手离髋 0.187 / 0.191、手高差 0.002、脚 0.063；男 Hips y 0.560、Head 0.882、手离髋 0.201 / 0.198、手高差 0.008；六项检查全真、无多余关节。
- normalize：run 根偏移女 `(-0.0301, +0.5295)`、男 `(-0.0308, +0.5424)` mu 已修；各剥 387 条常量轨（195 scale + 192 非 Hips translation）；rest/bind 最大差 5.3e-7 / 1.2e-6。
- 几何（`inspect.py` / `measure_heads.py` / derive 口径）：女 104,269 顶点 / 195,433 三角，臂角 21.50°，头身比 8.24，髋高占比 0.5410，肩关节间距比 0.172；男 103,013 / 192,726，臂角 21.71°（左 22.43 / 右 20.98），头身比 8.16，髋高占比 0.5722，肩比 0.191。
- 骨架帧：女 heightMu 0.97949221、mPerMu 1.6947557（1.66 m）、ring `0b84259f…9e38`、skeleton `795a8742…8f3b`；男 heightMu 0.97937013、mPerMu 1.84812662（1.81 m）、ring `05b2ad15…bbca`、skeleton `647d851d…90d3`。body SHA 女 `643b9197…5269`、男 `4e362cbf…c686`。
- 颈肩对比（同一脚本、同一 mu 口径，tpl_f_medium → tpl_f2_medium）：颈宽 13.3 → 11.3 cm；离中线 0.04–0.08 mu 的上轮廓（斜方肌带）低 0.0058–0.0072 mu（约 10–12 mm）；下巴到颈侧轮廓的可见颈长 34.6 → 43.6 mm（+26%）；肩关节间距比 0.156 → 0.172。walk / run 帧颈、肩、腋下无撕裂（`shots/compare.tpl_f_vs_tpl_f2.jpg`）。
- 倒置面（E2c 口径：几何法向与顶点法向和相反）：tpl_f_medium 26、tpl_f2_medium 89（多在脚底，实拍未见露洞）、tpl_m_medium 22；男性面 128656（后脑偏下、颈上方）在单面材质下露成小黑三角，已用射线命中确认是背面、非破洞。

## 4. 开放问题（附默认值）
- 髋高占比：女 0.541（规格 0.565，差 −2.4 个百分点）、男 0.572（规格 0.540，差 +3.2）；相对校正量 4.2% / 6.0% 均 < 8% 重出线。默认由后续派生任务 `derive_template.py` 收敛，不重出。
- 肩比：女 0.172 高于现规格 0.156——这正是作者要的一字肩；派生若仍按 0.156 会把肩收窄回去。默认：派生前给 tpl_f2_* 另立规格行，肩比取实测值（见第 5 节）。男 0.191 vs 0.200，差 0.009，默认按派生校正。
- 男性两处 Tripo 瑕疵：后脑倒置面露洞、左大腿外侧（髋到大腿中段）浅色贴图条带（单图生成时手臂遮挡处）。默认在后续任务里翻正新模板全部倒置面（E2c 路 A；新模板尚无任何 fit 引用，此时改成本最低），贴图条带用邻域肤色修补（0 点）；穿裤 / 袍时条带被遮住。
- `export_skeleton.py` 默认身高 1.65 m：不带 `--default-height-m` 会把 mPerMu 算错（本任务首跑即如此，已按 1.66 / 1.81 重导）。默认不改脚本，调用方必须带参（已写进任务书补充裁定）。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
- T4-P1 / `tools/model3d/dressup/template_specs.json` 增 tpl_f2_small / medium / tall 三行（身高仍 1.58 / 1.66 / 1.72，肩比按新 medium 0.172 等比、髋比沿用规格）/ 派生不应抹掉作者要的一字肩。
- T4-P2 / tripo-web 技能 §4 "runtime 按 1.82m vs 1.68m 映射" 改为 AR-104 的 1.81 m / 1.66 m / 本任务书即被这句误导写成 1.82。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `docs/tech/10-paper-doll-3d.md` §1.1 模板表：登记 tpl_f2_medium（候选，替换 tpl_f_*）与 tpl_m_medium（已生成，SHA 与实测值见第 3 节）。
- `docs/tech/11-paper-doll-3d-impl-spec.md` §0 任务表：`ART-dressup-t5-tpl-m-medium` 由本任务完成（底图改为作者 10-11 选定的 Gemini 图）；新增后续"tpl_f2 / tpl_m 三体型派生 + 倒置面翻正 + 衣物 / 头 / 道具重贴合 + 切换"。
- 后续交接：派生用 `derive_template.py --source templates/tpl_f2_medium`（tall / small）与 `tpl_m_medium`（lean / bulk）；切换前现有 19 份 fit、6 个头、4 件道具须按新骨架 / 环 / 区域 SHA 重贴合，旧结果不得复用。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 两张素体图入库，manifest 各一条 candidate（提示词、参考路径 + sha256、原始下载 sha256、作者选定）。
- ✅ 浏览器只经 9223 `/eval`；女性首次绑骨请求在余额预检处断网失败、未扣点，恢复后只提交一次；导出走签名 URL 直下；用后 saveMode 设回驱动默认 direct（本会话接手时已是 reload，更早的原值无记录）、队列清空。
- ✅ 两模板 65 关节、rest=bind，`normalize_rig.py --check`、`export_skeleton.py --check` 通过；臂角 21.50° / 21.71°（23° ± 5°）；头身比 8.24（8.0~9.0）/ 8.16（≥ 8.0）；三动作齐全。
- ✅ 总消耗 170 点，台账 8 行逐行记前后余额。
- ⚠️ 髋高占比两件均偏离规格 > 2 个百分点、男性两处 Tripo 瑕疵：按补充裁定只报告，交后续任务（第 4 节）。
- ✅ 未派生 tall / small，未改现有模板、脚本与已贴合素材；写集仅限任务书所列文件。
- ✅ 检查全部退出码 0：normalize `--check` × 2、export_skeleton `--check` × 2、`selftest.py`、`pnpm install --frozen-lockfile`、`pnpm check`（189 个测试文件 / 1339 项通过，包体预算通过）。
