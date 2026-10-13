# ART-dressup-r3-jinzhuang-f2-gen 报告 · 3D 纸娃娃换装 · R3 · 劲装按新素体重新生成：tpl_f2 衣图底板（劲装 / 布衣）+ Tripo 整身生成与绑骨 → 源件入库（85 点）
## 1. 摘要（3–6 行）
作者 10-12「按新素体重新生成」：旧劲装套不上新女素体（胸围 +9–10 cm，R2 补充裁定 1）。本任务在新素体底图上重出劲装 / 布衣衣图底板，并以劲装底板经 Tripo 生成整身模型、绑骨、导出，作为后续抽衣贴合的源件。
衣图由 Opus 子代理经 agy 出图（劲装 4 + 4 次、布衣 2 次；⚠️ 劲装超任务书上限 4 + 3 一次，作者已豁免，原文见第 4 节），Tripo 由 Claude 经 9223 常驻进程驱动，生成与绑骨各提交一次，共 85 点（16,665 → 16,580）。
两张底板 check_plate 与身材门禁全过；Tripo 封面质检、joints 体检通过；导出件 65 关节、rest = bind（5.5e-6）。

## 2. 产出（文件、行数、主要章节）
- `assets/default/character/female/ch00/threeview/por_npc_zhujue__ch00_f2_dressup_eq_jinzhuang_front.png`（1686×2528）、`…_f2_dressup_eq_buyi_front.png`（1686×2528）；同目录 `manifest.yaml` 增两条（提示词、参考与摘要、工具、原始输出摘要与尺寸、归一化参数、check_plate、身材门禁、布衣轮廓 IoU、取舍理由）。
- `assets/default/model3d/dressup/garments/eq_jinzhuang/source_f2/`：`tripo_dressed_rig.glb`（8,111,468 B，sha256 `8b150b8e…`）、`cover.png`（600×778 Tripo 封面）、`source.json`（schema `tianshu-dressup-source.v1`，template `tpl_f2_medium`）。旧 `source/` 未动。
- `assets/default/model3d/dressup/credits_ledger.jsonl` 增两行（generate 65、rig 20）。
- 原始 agy 输出存主检出协调区 `.agents/coord/_dressup_review/r3_plates/{jinzhuang_f2_jz7_source,buyi_f2_by2_source}.jpg`（与旧劲装原图 `garment_jinzhuang_r1_source.jpg` 同处，不入库；r1 返修：此前只放在集成工作区的同名目录，现已补到主检出，路径从仓库根可复现），manifest 记其摘要。
- 检查实跑（r1 返修后，Node 22.22.1 / pnpm 9.15.9）：`inspect.py` 退出 0（103,318 顶点 / 192,581 三角 / 65 关节 / 上臂 24.0°）；`check_plate.py` 劲装退出 0、pass（face IoU 0.938，臂角 25.28 / 25.23°），布衣退出 0、pass（0.967，25.19 / 25.19°）；`selftest.py` 退出 0（7 项）；`pnpm install --frozen-lockfile` 退出 0；`pnpm check` 退出 0（189 个测试文件 / 1,344 项、首次会话 95.29 / 110 KiB 等包体预算与 dev-chunks 全 PASS）。

## 3. 关键结论与数值
- 第一轮（以旧劲装底板作衣服参考）10 张 check_plate 全过但全废：出图工具把旧身材、平胸、方筒照抄（check_plate 拦不住"旧身材翻版"——旧劲装底板对新素体自己就能过）。第二轮改用只有衣服的物品图 `eq_jinzhuang.png`，并在提示词写死胸型 / 收腰 / 肩腿与底图一致，7 张里 jz7 唯一合格。
- 劲装 jz7：check_plate pass（face IoU 0.938，臂角 25.28 / 25.23°）；肩部轮廓 y = 540–640 逐行最大差 +8 px（≤ 15）；腰最细行（y = 917）衣宽 / 身宽 1.068（≤ 1.15）；腿轮廓 IoU 0.977（≥ 0.95）。归一化 ×1.985101、偏移 (1, 9)。
- 布衣 by2（在 jz7 上换色，颜色参考换成物品图 `eq_buyi.png`；第 1 次以旧布衣底板取色又把旧身材抄回，弃用）：check_plate pass（face IoU 0.967，臂角 25.19 / 25.19°）；肩部 +9 px、腰宽比 1.080、腿 IoU 0.963；对劲装衣服轮廓 IoU 0.9762（≥ 0.95，掩码 = 前景 ∧ 非肤色，Lab L* ≥ 60 且 a* ≥ 4 判肤色）。
- check_plate 的 shoulder_ratio 对穿外衣的图量的是"袖与衣身分开行"（jz7 0.2029 对底图 0.1858），只报告；领子立在颈后是物品图款式，旧劲装底板领子更高（下巴下 11 px）且走通了全流程，不阻断。
- Tripo：项目 `8421bc50-53c1-4987-a468-9d3776bd6f7b`，generate op `c427ee0d-5a7f-491b-ac81-e0c91679f2a6`（65 点，约 2.5 分钟），rig op `af8b240f-4bf7-42b9-b796-b6e4530bf387`（20 点，约 1 分钟），export op `0fa16d2f-7d72-40c8-ab14-5772adbbb8b7`（0 点，签名 URL 以 curl 下载，存盘模式事后恢复为 direct）。生成参数与 T4 女素体相同（v3.1-20260211、detailed、extreme、PBR、delight、200k 面、private）；绑骨 biped / mixamo、`model_version` v3.0-20260909（rigging_model 请求体取自驱动 `RIG` 常量，与 T4 相同，r1 返修补记进 `source.json.options.rig`）。上传后 Tripo 自动审核标 nsfw（底板露腿、可见三角裤），与 E1（b01f6451，同类底板）相同，生成与绑骨正常。
- 封面质检：交领右衽、腰带结与垂带、翻袖口、衣摆到髋与底板一致；胸型饱满、衣服贴身；脸、光头、双耳、手脚完整；无大片粘连或破洞。
- joints 体检 ok：65 关节，髋 0.53、头 0.887、头顶在头上、双脚 < 0.15、双手离髋 0.191 / 0.190 且等高。
- inspect（压贴图后与原件几何逐项相同）：103,318 顶点 / 192,581 三角、65 关节、rest = bind 5.5e-6、3D 上臂 24.0°、前臂 29.1°、头身比 8.27、髋高占比 0.541、连通块 135、边界边 13,785、非流形边 0；baseColor 2048² JPEG q85、删 normal 贴图、KHR_materials_unlit；9,331,076 → 8,111,468 B。
- 13 关节对 tpl_f2_medium bindWorld（按各自身高归一，%H，x / y / z）：Hips 0 / 0.48 / 0.78；Spine 0 / 0.14 / 0.39；Spine1 0 / 5.26 / 0.01；Spine2 0 / 4.93 / 0.40；Neck 0 / 1.54 / 0.77；L/R Arm ∓0.7 / 0.72 / 0.37；L/R UpLeg ∓0.73 / 0.48 / 0.78；LeftHand 0.57 / −0.90 / −1.27；RightHand −0.03 / −0.76 / −1.34；L/R Foot ±0.46 / 0.45 / −2.75。Spine1 / Spine2 高约 5%H 是 Tripo 绑骨与规范化模板的脊柱节点位置不同，其余 < 3%H。

## 4. 开放问题（附默认值）
- ⚠️ 劲装 agy 实际调用 4 + 4 次，超任务书上限 4 + 3 一次（agy 不守"只用一次"，第二轮每次出 2 张）；额外图存在协调区。不重新出图（重出不返还额度，只会再超）。作者豁免（2026-10-13 09:17，协调者经对话问答取得）：问「R3 新劲装衣图出图时，agy 调用了 4 + 4 次，比任务书定的上限 4 + 3 多 1 次……审核要求作者明确豁免这次超额才能合入。是否豁免？」，作者选「豁免，按现有素材合入」。
- 脊柱节点差约 5%H：默认交给后续抽衣（`extract_garment.py` 关节对齐）与贴合处理，不在源件上改骨。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
- R3-P1 / 衣图底板一律以只有衣服的物品图作衣服参考，不用穿在人身上的旧衣图 / 旧衣图里有同姿势的人，出图工具会把旧身材照抄。
- R3-P2 / 衣图底板门禁在 check_plate 外加身材项（肩部轮廓逐行差、腰宽比、腿轮廓 IoU）/ check_plate 拦不住旧身材翻版。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `docs/tech/12-dressup-production.md` §2 P2 步骤 1：参考图写明"物品图（无人）"，门禁补身材三项。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ⚠️ 两张底板门禁全过并入库；布衣只换颜色质地（衣服轮廓 IoU 0.976）；但劲装 agy 调用 4 + 4 次，超上限 4 + 3 一次，不算全过；作者 2026-10-13 09:17 已豁免（第 4 节）。
- ✅ Tripo 只花 85 点（generate 65 + rig 20），各只提交一次；65 关节、rest = bind；封面质检与 joints 体检通过；台账两行。
- ✅ 只写登记写集；`garments/**` 下未写 manifest；旧 `source/` 未动；未输密码、未购买、未点条款；对外请求用通用 UA，不带作者信息。
- ⚠️ 检查命令全部退出 0，数值见第 2 节末条；验收标准除 agy 次数一项（超限一次，作者已豁免）外全部满足。
- 交接（后续贴合任务）：`extract_garment.py` 从 `source_f2/tripo_dressed_rig.glb` 抽衣壳（关节对齐 tpl_f2_medium）→ tpl_f2_medium / tall / small 逐模板 P2 全分辨率贴合（`fit_garment.py --push-mode volume` 等，参数同 E2b）→ 减面翻边 → E2c 姿势蒙皮（外展 6°）→ 可见性遮罩 → validate → 布衣按 P3 以新底板 `…_f2_dressup_eq_buyi_front.png` 换色 → 两个贴图层从 tpl_f2 交付件重烘 → 衣物与 R2 道具都到位后换装页默认素体切到 tpl_f2_medium（作者 10-12「衣物到位后再切」）。
