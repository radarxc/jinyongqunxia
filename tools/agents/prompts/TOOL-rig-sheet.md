# 本任务：动作原型 P2–P5、P7 · 三视图切件工具链与主角·男身份 rig、走路 + 剑招动图（AR-29）

本任务写离线工具和素材产物。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读：`tools/agents/reports/RESEARCH-anim-motion-library.md` §3.2（局限与对策）、§5.1–§5.5、§5.6 最小原型（P2–P5、P7 与判定 Q1–Q6、Q9）、§8.1、§8.3（Apple Vision 关键点探测，`-sdk MacOSX15.5.sdk`）；`docs/tech/09-character-rig.md` §1（部件、枢轴、三视图、z 序、`restAngle` 前臂 −90°）、§6（目录、manifest、sheet 契约，DES-rig-v1.1）、§7.2；`assets/default/prompts/rig/GUIDE.md`；`tools/rig/make_parts.py`、`preview.py`、`templates.py`、`gait.py`、`make_placeholder_parts.py`、`tools/rig/clips/clip_metrics.py`（投影参考实现）；原型脚本 `tools/agents/reports/RESEARCH-anim-proto/`。

输入：`assets/default/rig/npc_zhujue__ch00_m/sheet/sheet_L.png`、`sheet_R.png`（ART-rig-sheet-zhujue-m 已入库；主角·男 `npc_zhujue`，立绘 `assets/default/character/male/ch00/por_npc_zhujue__ch00_m_base.png`，短褐、绑腿、发髻、宽裤）；片段 `assets/default/rig/clips/clip_walk.json`、`clip_sword_attack.json`（CC0）。

## 要做的事
1. **`tools/rig/sheet_split.py`**：拆三视图（三栏连通域）、去平涂底（色键 `#E6E1D8` 容差 + 边缘羽化；可选用 `tools/portrait` 的 BiRefNet，本机已装则用）、按头顶到脚底归一到 256 px/m（男 1.70 m）、脚底对齐、按肩宽 / 身高之比判断视图；输出 `work/<view>.png` 与 `sheet.json`（含腋下空隙检查，不合格报出）。`sheet_R.png` 同样处理，产出镜像修正视图。
2. **`tools/rig/keypoints.py` + `tools/rig/vision_pose.swift`**：Apple Vision 2D / 3D 人体关键点（已知视图朝向消歧左右；骨长先验补袍下髋膝；输出 `keypoints.yaml`，含置信度）；**`tools/rig/kp_fix.html`**：本地小页面，拖动修正关键点并导出 YAML（无服务器）。Swift 编译加 `-sdk MacOSX15.5.sdk`，编译失败时在报告写明并改用 `rtmlib`（可选依赖）或人工 YAML。
3. **`tools/rig/segment_parts.py`**：按关节胶囊分区、关节圆帽、补被遮区域（优先 scikit-image inpaint，记 `inpaintedPct`）、四肢摆正到 `restAngle`、枢轴与 `childJoint` 旁注、侧视图远肢复用、被遮部位从 `male_std` 回退；产出每视图 13 张 PNG（共 39）与 `*.pivots.yaml`。
4. **`tools/rig/make_parts.py`**：支持旁注与身份 rig 字段（`kind: identity`、`identity{npcId, variant, portrait, sheetSha256}`、`skeleton`、`nearSide: L`、`boneLengthsM`、`attachments`），`--check` 校验新字段；产出 `assets/default/rig/npc_zhujue__ch00_m/manifest.yaml` 与 39 张部件。
5. **`tools/rig/preview.py`**：加 `--clip <json> --dir8 --gif`：按片段驱动身份部件（Python 参考实现：偏航旋转 → FK → 选视图 → 缩短下限 0.45 → z）渲染 8 方向条带与 GIF；产出 `assets/default/rig/npc_zhujue__ch00_m/preview/walk_dir8.gif`、`sword_attack_dir8.gif`、`gait_vs_clip_walk.gif`（程序步态与动作库走路并排，供作者 A/B，C8）与 `preview/npc_zhujue__ch00_m__pose-strip.png`。
6. **测试**（`tools/rig/test_*.py`，合成三视图金样，确定性）：拆分与归一、视图判断、分区与枢轴、manifest 新字段、`--clip` 投影与 `clip_metrics.py` 一致（抽帧对拍）。
7. 质量数据（报告）：Q1 识别锚（3 视图 × 5 项，Lab ΔE2000 ≤ 10）、Q2（39/39、人工修了几张、`--check` 通过、枢轴偏差 ≤ 2 px）、Q3 关节缝隙 0（静止 + 8 方向走路 12 帧）、Q5 踩滑、Q9 耗时。

## 约束
- 只写：`tools/rig/**`（不含 `tools/rig/clips/**`）、`assets/default/rig/npc_zhujue__ch00_m/**`（不含 `sheet/**`）、本任务报告。
- 不改 `packages/**`（运行时归 ENG-12c-clip）、不改规格文档、不改 `male_std` / `female_std`、不改片段 JSON；禁止裁旧立绘冒充部件（只允许从三视图切件）。
- 不装大依赖（torch 等）；可选 `opencv-python-headless`、`rtmlib` 要在报告写明。每次写入 ≤ 150 行。

检查：以下命令必须全部通过。
- `python3 -m unittest discover -s tools -p "test_*.py"`
- `python3 tools/rig/make_parts.py assets/default/rig/npc_zhujue__ch00_m --check`
- `python3 tools/agents/check_assets.py assets/default/rig/npc_zhujue__ch00_m --min 39 --max 60 --min-side 16`
- `python3 tools/lint/check_ids.py --strict`

## 报告
第 3 节写 Q1–Q3、Q5、Q9 实测与三张 GIF 的路径；第 7 节写交 ENG-12c-clip 的 manifest 新字段与枢轴约定。报告 ≤ 80 行。
