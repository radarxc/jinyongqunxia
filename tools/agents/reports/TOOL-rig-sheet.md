# TOOL-rig-sheet 报告 · 动作原型 P2–P5、P7 · 三视图切件工具链（sheet_split / keypoints / segment_parts / make_parts 身份字段 / preview --clip）与主角·男身份 rig、走路 + 剑招动图（AR-29）

## 1. 摘要（3–6 行）
- 已完成三视图拆分、Apple Vision/人工修点契约、13 部件切分、身份 rig manifest 与 clip 八方向预览链。
- 主角·男交付 3×13=39 张正式部件、逐件枢轴旁注、1 张姿势条带及走路/剑招/A-B 三张 GIF。
- 最终返修已将前臂截到腕点、完整手掌归入手件；侧腿改用源图裤纹补绘，骨盆隐藏髋锚不再生成圆帽/细桥，并重出全部预览。
- 74/74 单测及四条指定门禁全部通过；Apple Vision 可编译但本机运行失败，正式关键点如实采用 `manual-prior`。

## 2. 产出（文件、行数、主要章节）
- 新增工具：`sheet_split.py` 260 行、`keypoints.py` 293 行、`vision_pose.swift` 58 行、`kp_fix.html` 36 行、`segment_parts.py` 655 行。
- 扩展工具：`make_parts.py` 483 行、`preview.py` 567 行、`make_placeholder_parts.py` 82 行；测试共 958 行。
- 素材：`assets/default/rig/npc_zhujue__ch00_m/` 下 39 PNG + 39 pivots YAML、3 份 keypoints、manifest、work 派生物、姿势条带与 3 GIF（不含既有 `sheet/` 共 7.63 MiB）。

## 3. 关键结论与数值
- Q1：3 视图×5 识别锚=15/15；Lab ΔE2000 最大值 front34 `5.325`、side `4.752`、back34 `2.064`，均 ≤10；当前 `work/L` 输入与该次对只读集成立绘的量测输入逐字节相同，故保留实测值。
- Q2：39/39 且各 PNG 恰 1 个 alpha 连通域；人工修部件 PNG 0 张，3 视图关键点因 Vision 降级为确定性 `manual-prior`（未另记人工坐标修改）；`--check` 通过；90 个 pivot/childJoint 最大旁注偏差 `0 px`。标准体回退 0 张；交付件最大 `inpaintedPct=8.159%`。
- Q2 侧腿：因源图双腿并拢遮挡（源图限制），`side/thigh_shared` 以源侧视裤腿 `[104,322,169,382]` 补绘；亮度纹理标准差 `21.870`、归一轮廓 IoU `0.934`，manifest 标 `sourceTrouserPatch`，后续由 `ART-rig-sheet-side` 换前后错开源图。
- Q3：关节中心 3 px 圆内透明像素：静止 `0/1218`；8 方向×12 帧=`96` 帧走路 `0/38976`。
- Q5：支撑相左/右脚最大漂移 `0.300/0.366 cm`，总最大 `0.366 cm ≤ 2 cm`；附带 Q4：缩短下限 `0.45`、视图切换最大 `1.2/s`。
- Q6：剑握点最大量化误差 `0.695 px ≤ 1 px`，剑轴最大方向误差 `0.485° ≤ 5°`。
- Q9：输入 sheet 2 张；人工修点分钟数未独立计时；此前完整流水线实测墙钟 `58.59 s`、CPU `46.01 s`（低于 3 min），本轮局部返修未冒充一次新的完整计时；最终全量单测墙钟 `43.158 s`。
- GIF：`assets/default/rig/npc_zhujue__ch00_m/preview/walk_dir8.gif`（2048×320，51 帧）、同目录 `sword_attack_dir8.gif`（2048×320，58 帧）与 `gait_vs_clip_walk.gif`（512×320，51 帧）；三者全帧接触表已目检。
- Apple 官方文档（访问 2026-10-03）：[2D body pose](https://developer.apple.com/documentation/vision/vndetecthumanbodyposerequest) 为 macOS 11+；[3D body pose](https://developer.apple.com/documentation/vision/vndetecthumanbodypose3drequest) 为 macOS 14+。本机 `MacOSX15.5.sdk` 编译成功，运行报 `Vision Code=9: Unable to setup request`，已自动降级。

## 4. 开放问题（附默认值）
- Apple Vision Code 9：默认继续使用带置信度的 `manual-prior` 与 `kp_fix.html`；换有完整 Xcode/Vision 权限的机器再复跑，不阻塞本次资产。
- Q8 作者观感尚未拍板：默认三张 GIF 保持 candidate，作者从 A/B 选择程序步态或动作库走路后再交发布态。
- Q9 人工分钟数缺少独立计时：默认本轮记为“未测”，后续角色从打开修点页起计时；不得把自动流水线时间代作人工时间。
- 侧视双腿源图重叠：默认本原型保留源裤纹补绘；后续 `ART-rig-sheet-side` 提供双腿前后错开的侧视 sheet 后再替换。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
| 编号 | 提案 | 理由 |
|---|---|---|
| 无 | 不修改 `docs/00-canon.md` | AR-29 与 DES-rig-v1.1 已覆盖本工具和身份 rig 契约。 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
| 文档 | 位置 | 改什么 |
|---|---|---|
| `TODO.md` | AR-29 | 调度器登记 P2–P5/P7 完成、Q1–Q5/Q9 与 Vision 降级结果。 |
| ENG-12c-clip | runtime clip 接入 | 消费下节身份字段、前臂源轴和动态 z/视图滞回；不得重新解释左右。 |
| ART-rig-sheet-side | 侧视三视图补图 | 提供双腿前后错开的主角侧视源图，替换本原型的 `sourceTrouserPatch`。 |
| `docs/tech/09-character-rig.md` | 后续勘误 | 示例补一句：前臂源 pivot→wrist 为屏幕向左，叠加 `restAngle=-90°` 后静止朝下。 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 拆分：L/R sheet 均拆为 front34/side/back34，1.70×256=`435 px`，脚底 y=`460`；肩宽比判视图、腋下空隙均通过。
- ✅ 关键点：2D/3D helper、已知朝向、袍下骨长先验、置信度 YAML 与无服务器拖点页齐全；⚠️ Vision 运行时 Code 9，已记录降级。
- ✅ 切件：每视图 13 张且 39/39 单连通；六前臂在腕点结束、六手件含完整手掌/手指且只封腕；侧腿为源裤纹补绘，无标准体纯色三角片；骨盆隐藏髋锚不生成圆帽或桥。
- ⚠️ 源图限制：侧视双腿并拢，当前 `sourceTrouserPatch` 已通过纹理与轮廓回归并逐帧目检，但最终应由 `ART-rig-sheet-side` 的错腿源图替换。
- ✅ manifest 交 ENG-12c-clip：`kind: identity`、`identity{npcId,variant,portrait,sheetSha256}`、`skeleton`、`nearSide:L`、`boneLengthsM`、`attachments`；pivot/childJoint 是 PNG 左上源坐标，前臂 `restAngle=-90°`。
- ✅ clip：偏航→FK→三点平滑+10°滞回选视图→缩短≥0.45→动态 z；剑招逐帧消费 `tipDirectionI16` 并挂 `eq_qinggangjian` 于 `grip_R`；走路 51、剑招 58、A/B 51 帧均全帧目检。
- ✅ `python3 -m unittest discover -s tools -p "test_*.py"`：74/74（`TMPDIR=/private/tmp`，`43.158 s`）；真实资产回归覆盖腕部肤色归属、手完整性、侧腿纹理/轮廓、髋锚伪影。
- ✅ `make_parts.py ... --check`：39；`check_assets.py ... --min 39 --max 60 --min-side 16`：问题 0。
- ✅ `check_ids.py --strict`：新增失败 0；`git diff --check` 通过；同帧 `clip_strip` 两次 SHA-256 均 `b71af221…c0605ad`；未改 clips、sheet、规格、packages 或标准 rig。
