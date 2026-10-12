# 本任务：3D 纸娃娃换装 · R3 · 劲装按新素体重新生成：tpl_f2 衣图底板（劲装 / 布衣）+ Tripo 整身生成与绑骨 → 源件入库（85 点）

本任务调用外部服务并处理产物。"只改负责的文件""不执行改变仓库状态的 git 命令""报告如实"照常适用。执行者：Claude（衣图由 Opus 子代理经 agy 出；Tripo 由 Claude 经 9223 常驻进程驱动，同 T4），产物走 supervise 校验与 GPT 审核。

## 作者决定（2026-10-12）
- 「按新素体重新生成」：旧劲装（按旧素体生成）套不上新女素体——新素体胸部更饱满、更低，离地 1.17 / 1.20 m 躯干围度大 9–10 cm，全分辨率贴合后 225 点留在胸部体内、拉伸合格率 96.2%（R2 补充裁定 1）。在新素体上重新生成劲装（约 85 点），布衣作为换色版 0 点跟上。
- 「衣物到位后再切」默认素体。

## 输入
- 新素体底图 `assets/default/character/female/ch00/threeview/por_npc_zhujue__ch00_f_bald_base_body_apose_v2.png`（tpl_f2 的 Tripo 输入，1686×2528）。
- 衣服款式：物品图 `assets/default/item/clothing/eq_jinzhuang.png`、`assets/default/item/clothing/eq_buyi.png`（只有衣服、没有人）。实测：拿旧劲装底板当衣服参考，出图工具会把旧身材连同平胸方筒照抄过来（第一轮 10 张全废）。

## 要做的事
1. 衣图底板（agy，Opus 子代理执行，最多 4 + 3 次）：
   - 劲装：新素体底图 + 劲装物品图，提示词写死"交领平贴锁骨、胸部完全遮住不露肩、贴合她自己饱满的胸型与细腰、肩腿与底图一致"；选定第二轮 jz7（7 张里唯一胸型饱满、收腰、肩腿与底图一致者）。
   - 布衣：在 jz7 上换色（布衣物品图只取颜色质地），选定 by2。
   - 归一化：按人物头顶到脚底高度等比缩放到底图人物高、脚底与水平中心对齐、补底图背景色，输出 1686×2528 PNG。
   - 门禁：`check_plate.py --plate <新素体底图> --image <底板> --arm-angle-deg 25` pass；身材项——底图腋下以上 y = 540–640 逐行肩部轮廓宽度差 ≤ 15 px、底图腰最细行（y = 917）衣宽 / 身宽 ≤ 1.15、裆下到脚底腿轮廓 IoU ≥ 0.95；布衣对劲装衣服轮廓 IoU ≥ 0.95（衣服掩码 = 前景 ∧ 非肤色，肤色按 Lab L* ≥ 60 且 a* ≥ 4）。check_plate 的 shoulder_ratio 对穿外衣的图量的是"袖与衣身分开行"，只报告不判。
   - 领子立在颈后是物品图款式；旧劲装底板领子更高（下巴下 11 px）且走通了抽衣 / 贴合全流程，不作阻断。
   - 入库：`assets/default/character/female/ch00/threeview/por_npc_zhujue__ch00_f2_dressup_{eq_jinzhuang,eq_buyi}_front.png` 与同目录 manifest 条目（提示词、参考与摘要、工具与模型、原始输出与尺寸、归一化参数、门禁结果、选定理由）。
2. Tripo（经 9223，同 E1 / T4 SOP，只提交一次）：记余额 → 暂存劲装底板 → `imageToModel`（参数与 T4 女素体相同）65 点 → 封面质检（交领右衽、腰带结与垂带、翻袖口、衣摆到髋与底板一致；脸、光头、耳、手、脚完整；臂张角与底板一致；衣服与身体之间无大片粘连或破洞；明显破损就停下、不绑骨）→ 绑骨 20 点 → `joints(pid)` 体检（65 关节、髋 0.45–0.65、头在髋上、双脚 < 0.15、双手离髋 > 0.12 且等高）→ 导出 model_rig（不带动作）0 点，签名 URL 下载 → `textures.py` 把贴图压到 baseColor ≤ 2048² JPEG、删 PBR，几何 / UV / skin 原样 → `assets/default/model3d/dressup/garments/eq_jinzhuang/source_f2/tripo_dressed_rig.glb`；封面存 `source_f2/cover.png`；写 `source_f2/source.json`（schema `tianshu-dressup-source.v1`，template `tpl_f2_medium`，tripo 项目 / 操作 ID、options、credits、plate 路径与摘要、glb 摘要与顶点 / 三角 / 关节、inspect 关键量、joints 体检、封面质检结论）；点数前后记进 `assets/default/model3d/dressup/credits_ledger.jsonl`。
3. 不在 `garments/**` 下写任何 manifest（源件不进包；正式条目由后续贴合任务入库）；旧 `source/` 不动。

## 验收
- 两张底板门禁全过并入库；布衣只换颜色质地。
- Tripo 只花 85 点（生成 65 + 绑骨 20）；导出件 65 关节、rest = bind；封面质检与 joints 体检通过。
- 报告给出 13 个关节（Hips / Spine / Spine1 / Spine2 / Neck / 左右 Arm / 左右 UpLeg / 左右 Hand / 左右 Foot）与 `templates/tpl_f2_medium/skeleton.json` 的 bind 世界坐标按身高归一后的差（%H），作为后续抽衣 / 贴合对齐的预期。

## 约束
- 只写两张底板、`assets/default/character/female/ch00/threeview/manifest.yaml`、`garments/eq_jinzhuang/source_f2/**`、`credits_ledger.jsonl` 与本任务报告。
- 不输密码、不买点数、不点条款；Tripo 只经 9223，不启动 / 重启浏览器与常驻进程，不碰作者其他标签页；出错不重复提交生成。
- 对外请求不带作者邮箱等个人标识。

检查：
- `python3 tools/model3d/dressup/inspect.py --json assets/default/model3d/dressup/garments/eq_jinzhuang/source_f2/tripo_dressed_rig.glb`
- 两张底板各跑一次 `check_plate.py`（对新素体底图，`--arm-angle-deg 25`）
- `python3 tools/model3d/dressup/selftest.py`
- `pnpm install --frozen-lockfile`
- `pnpm check`

## 报告
`tools/agents/reports/ART-dressup-r3-jinzhuang-f2-gen.md`（≤ 60 行）：两张底板的门禁数值与取舍、Tripo 项目 / 操作 ID、点数前后、封面质检、joints 体检、inspect 关键量、13 关节对照；第 7 节交接给后续贴合任务（抽衣壳 `extract_garment.py` → tpl_f2 三体型逐模板 P2 贴合 + E2c 姿势蒙皮 + 可见性遮罩 → 布衣 P3 → 贴图层 → 切默认素体）。
