# ART-dressup-t4b-neck-v3 报告 · 3D 纸娃娃换装 · T4b · 颈肩改版：女 tpl_f2_medium 平滑雕塑 + 男 tpl_m_medium 按新素体图重生成（85 点）
## 1. 摘要（3–6 行）
女 `tpl_f2_medium` 按作者定稿的平滑雕塑 v3 处理：颈加长 15 mm、颈中段收细，颈宽 / 头宽 0.571 → 0.475（验收 ≤ 0.50）；全焊接网格 0 翻面、相邻面二面角变化最大 8.26°，拓扑 / UV / 权重 / 动画轨不变。
男 `tpl_m_medium` 按作者选的新素体图 B（g2）重上 Tripo，生成 65 + 绑骨 20 = 85 点（16,750 → 16,665），颈宽 / 头宽 0.686 → 0.603（验收 ≤ 0.62），未雕塑。
两模板已按 tech/11 模板契约转 `KHR_materials_unlit`、只留 baseColor（2048² JPEG q85），几何 / 权重 / `_REGION` / 关节 / IBM / 动画逐字节不变；65 关节、rest = bind，normalize / export_skeleton `--check` 通过。
返修 r1：二面角门改为全焊接网格口径并补 ROI 边界折角用例；男素体图清单去掉本机路径；截图按最终 unlit 模型重拍。男模后脑倒置面小黑点与头顶细贴图缝如实登记，交 T5。

## 2. 产出（文件、行数、主要章节）
- `tools/model3d/dressup/sculpt_neck.py`（291 行）：`sculpt()` 与 CLI `--body --out --lengthen-mm --k-front/side/back [--base-k-side/back --trap-mm --roi-mm B A R --m-per-mu --chin-mu] [--check-only] [--json]`；门不过退出 2 且不写文件；报告记仓库相对路径、输入 / 输出 sha256、锚点实测。`tests_sculpt.py`（178 行，4 项）：合成"躯干—颈—头"旋转体（含逐字节相同的 UV 缝重复点）。
- `tools/model3d/dressup/export_skeleton.py`（+10 / −3，常量 `RING_RADIUS_RANGE_MU` 与 `--check` 共用）、`tests_skeleton.py`（+20 / −1，1 项合成用例）。
- `templates/tpl_f2_medium/`：unlit `body.glb`、`sculpt.json`、重导出 `skeleton.json` / `skull_profile.json`（`regions.npy` 不变）、manifest（`sculpt` / `unlit` 块与新 SHA）、`shots/neck_v3.before_after.jpg`；T4 对照图保留并改列 `superseded_shots`。`preview.png` 仍是雕塑前 Tripo 封面（文档用、不进包）。
- `templates/tpl_m_medium/`：新项目全套（unlit body / skeleton / regions / skull / preview = 绑骨后 Tripo 封面白底 / manifest 含 `supersedes`、`unlit`）、`shots/regen_v2.before_after.jpg`；T4 旧男模截图保留、改列 `superseded_shots`。
- 男素体图 `por_npc_zhujue__ch00_m_bald_base_body_apose_v2.png`（1686×2528，Gemini 原图解码存 PNG，逐像素一致）+ manifest 新条目；v1 条目改 `rejected` 并写原因；两条目里的本机路径改为文件名说明（保留 sha256）。`credits_ledger.jsonl` 追加 4 行。

## 3. 关键结论与数值
- 雕塑法：焊接 UV 缝后解余切双调和方程（`cut_head.biharmonic_displacement`）。约束：头部集（按角度混合的头界 + 10 mm 以上）整体上移 L、Head 关节同步上移并重算 IBM；颈中段 t∈[0.40,0.58] 细环按角度收细 + 竖直 L·t；颈根下 60 mm 以下或 ρ > 3.6 固定；其余 ROI 自由。女参数 L 15 mm、kf 0.97、ks 0.87、kb 0.88（mPerMu 取 T4 骨架 1.6947557）；自由点 4,784、约束点 7,938、残差 1.9e-10 mu、最大位移 15.06 mm。
- 门（全焊接网格 293,149 条内部边）：0 翻面、二面角变化 p99 0.47° / p999 2.23° / 最大 8.26°、超 12° 的边 0、边长比 0.873–1.327；最差边在下巴高度颈侧。`tests_sculpt` 新用例：斜方肌下压 4 mm 紧贴收窄的 ROI（半径 80 mm）时边界折出 26.2°（只量 ROI 内部子网格是 3.1°、会放行），新门拦下、退出 2、不写文件。
- 锚点实测（`sculpt.json.output`）：Head 关节世界位移 (0, 15.000, 0) mm，Neck (0, 0, 0)，写出后 rest/bind 差 9.3e-8 mu；从 T4 原件（`643b9197…5269`）重跑与上一版雕塑结果逐字节相同（`9f843a45…8a14`）。
- 平滑度（全网格同口径：翻面 / 二面角变化 p99 / 最大 / >12° 边数 / 边长比）：v1 女 0 / 2.4° / 88.2° / 592 / 0.49–4.02，男 105 / 6.3° / 178° / 1761 / 0.21–10.2；v2 女 0 / 1.4° / 38.8° / 138 / 0.85–1.37，男 0 / 1.9° / 63.0° / 328 / 0.74–1.60；**v3 女定稿 0 / 0.47° / 8.26° / 0 / 0.87–1.33**，男试做 0 / 1.3° / 15.8° / 17 / 0.61–1.32（仍有折角，按作者"不行就换素体"弃用）。
- 颈肩（正面剪影：颈最细宽 / 头宽含耳；下巴→颈根按 `sculpt_neck --check-only`；斜方肌坡 = 颈根点→肩峰连线与水平夹角）：女 0.571 / 39.0 mm / 19.1° → 0.475 / 45.0 mm / 20.3°（头部整体上移 15 mm，颈根判定点随收细上移 7 mm）；男 0.686 / 26.0 mm / 18.3° → 0.603 / 33.0 mm / 20.7°。参考《逆水寒》女 ≈ 0.5、男 ≈ 0.68、男斜方肌约 20°。
- unlit：`textures.py --max 2048 --quality 85`，女 9,524,188 → 8,575,592 B，男 9,648,080 → 8,670,272 B；转换前后 positions / normals / UV / JOINTS / WEIGHTS / `_REGION` / 索引、65 关节顺序、IBM、节点、585 个动画 accessor 全部相同；重导出后只有 skeleton 的 source 摘要变，颈环 / 区域 / 颅形 SHA 不变。
- 女最终：body `e528b178…733e`、skeleton `37cb9732…3819`、ring `33420c75…0c9c`、regions `34bd8a09…`、skull `95191b78…b95e`；heightMu 0.98834、mPerMu 1.67957882（1.66 m）、头身比 8.27、髋高 0.5362、臂角 21.50°；rest=bind 8.96e-8。
- 男 Tripo：项目 `11c688eb-413a-4276-a656-ba0265e48c5b`，生成 `6adfee5f-7ca2-4f80-a521-8f436972fbd4`（13:58:46 提交，与 T4 同设置）、绑骨 `d5105221-6b09-4626-84b2-81f4d4a08378`（14:01:56 提交）、idle `4917e049…` / walk `30437783…` / run `e20636b3…`（0 点）、导出 `6cac836a-2337-4ea8-8abf-c0d57c3eb11e`。normalize 剥 387 条常量轨、朝向 +Z 无需转。男最终：body `d9db6f2d…1b65d`、skeleton `25c45b05…94e4`、ring `d9342353…4e45`、regions `61591f3f…d926`、skull `262402ca…4336`；heightMu 0.97924826、mPerMu 1.84835662（1.81 m）；105,156 顶点 / 197,736 三角、臂角 22.11°、头身比 8.23、髋高 0.5684、肩比 0.195；rest=bind 4.98e-7。
- 男质检：Tripo 封面（白模）全身完整无破面；贴图四视图：T4 版左大腿浅色条带没有了；倒置面 67（后脑偏下 1 处单面材质下露小黑点）；头顶偏后一条细浅色贴图缝（近看可见）。
- 颈环规则：新男模最低一段 Neck 主导近圆切片截到斜方肌（x 0.0470 mu，`--check` 报错），改为优先取半径在区间内的一段 → x 0.0411 / z 0.0385 mu。回归（unlit 后重跑）：tpl_f_medium / small / tall（按各自身高）与 tpl_f2_medium 新旧代码导出 skeleton（去路径）/ 环 / 区域 / 颅形逐字节一致，且与工作区提交版一致。
- 实测耗时：雕塑 4.3 s；textures.py 1.4 / 0.7 s；export_skeleton 3.2 / 4.4 s；`--check`：normalize 0.8 / 2.3 s、export 14.4 / 14.7 s；tests_sculpt 10.4 s、tests_skeleton 3.1 s、selftest 8.1 s；pnpm check 见第 7 节。
- 截图：`templates/tpl_f2_medium/shots/neck_v3.before_after.jpg`、`templates/tpl_m_medium/shots/regen_v2.before_after.jpg`（5173 `/character-3d`，最终 unlit GLB；"贴图"行 = unlit 原样，"光照"行 = 同一 baseColor 换受光标准材质、无法线贴图；正 / 侧 / 3/4 / 背 / walk 0.6 s / run 0.3 s）：颈侧、颈后过渡连续，无折线、鼓包。

## 4. 开放问题（附默认值）
- 倒置面（女 89、男 67 含后脑小黑点）与男头顶贴图缝：默认交 T5 派生时用倒置面翻正工具一并处理，贴图缝用邻域纹素外扩修补（0 点）。
- 已贴合素材所在的 `tpl_f_*` 仍是 PBR（早于本契约落实）：默认不在本任务改，切换到 tpl_f2 时随重贴合一并淘汰。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
- T4b-P1 / `docs/tech/10-paper-doll-3d.md` 记"Tripo 重建会把颈吹粗约 10%（2D 0.52 / 0.62 → 3D 0.57 / 0.69），素体图颈宽需比目标细一档或重建后平滑雕塑" / 以后新体型、新素体都会踩到。
- T4b-P2 / 模板生成流程（T4 第 3 步）把 `textures.py` 转 unlit 写成固定一步 / tpl_f_* 与 T4 都漏了这步。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `docs/tech/10-paper-doll-3d.md` §1.1 模板表：tpl_f2_medium、tpl_m_medium 改为本报告第 3 节的最终 SHA 与比例。
- 交接：T5 派生改从这两个新中等模板起（女 `e528b178…`、男 `d9db6f2d…`），任务书里的源 SHA / 比例需按第 3 节更新；切换前衣物 / 头 / 道具须按新骨架、环、区域 SHA 重贴合。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 两模板 65 关节、rest = bind；`normalize_rig.py --check` × 2、`export_skeleton.py --check` × 2 退出码 0；unlit、只留 baseColor。
- ✅ 雕塑门（全焊接网格）：翻面 0、二面角变化最大 8.26° ≤ 12°、边长比 0.87–1.33 ∈ [0.5, 2]；`tests_sculpt.py` 4/4（含 ROI 边界折角拦截、门不过退出 2 且不写、`--check-only` 不写）。
- ✅ 同口径 3D 颈宽 / 头宽：女 0.475 ≤ 0.50、男 0.603 ≤ 0.62；最终 unlit 模型截图无折线、鼓包。
- ✅ 点数共 85（65 + 20），台账 4 行逐行记前后余额；生成、绑骨各只提交一次；浏览器只经 9223 `/eval`；未输密码、未买点数、未点条款。
- ✅ 未改 cut_head.py 等其他脚本（`export_skeleton.py` / `tests_skeleton.py` 为补充裁定准许）；未动 tpl_f_* 与已贴合素材；清单与报告不含本机路径。
- ✅ `selftest.py`（7 项）、`tests_skeleton.py`（10/10）、`pnpm install --frozen-lockfile` 通过；`pnpm check` 退出码 0（189 个测试文件 / 1339 项通过、包体预算通过，171 s）。同一轮更早一次在负载约 26 时 `apps/game/src/storage/save-flow.test.ts` 一项 5 s 超时（本任务未改任何 TS 代码），单独重跑 11/11 通过，负载降到约 14 后整套重跑全过。
