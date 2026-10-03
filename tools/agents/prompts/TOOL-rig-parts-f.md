# 本任务：动作原型 · 主角·女（`npc_zhujue__ch00_f`）三视图切件、身份 rig 与走路 / 剑招动图（AR-47；用 TOOL-rig-sheet 已合入的切件工具链）

本任务跑现成工具链把女主三视图切成部件并登记身份 rig，出预览动图；原则上不改工具。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读：`tools/agents/reports/TOOL-rig-sheet.md`（男主同一条流水线的做法、数值与限制：Vision 降级为 manual-prior、侧腿源图限制、前臂截到腕点、手件含完整手掌）、`tools/agents/prompts/TOOL-rig-sheet.md`（工具与产物契约）、`tools/agents/reports/ART-rig-sheet-f.md`（女主四张源图的质检与给本任务的提示）、`assets/default/rig/npc_zhujue__ch00_f/sheet/manifest.yaml`、`assets/default/rig/npc_zhujue__ch00_m/manifest.yaml`（身份 rig 字段样例）、`docs/tech/09-character-rig.md` §1、§6、`assets/default/prompts/rig/GUIDE.md`。

## 作者原话（AR-47，2026-10-03 约 12:40，逐字摘录）
> * 女主角三视图与切件、遗迹贴片（洞壁、墓道、石刻、宝箱）：尚未登记任务。
> 这些都要做

## 要做的事
1. 拆图：`tools/rig/sheet_split.py` 拆 `sheet_L.png`（`--facing L`）与 `sheet_R.png`（`--facing R`），`--height-m 1.62`（女模板身高，见 `female_std/manifest.yaml`）；中间件放 `assets/default/rig/npc_zhujue__ch00_f/work/{L,R}/`（与男主同结构）。
2. 关键点：`tools/rig/keypoints.py`（Apple Vision 本机多半报 Code 9 → 照男主用带置信度的 manual-prior，必要时用 `kp_fix.html` 人工修点并如实记录）；**长袍及踝**：髋、膝落在袍下，按骨长先验定位，写明依据，不盲信自动结果。纯侧视补充图 `sheet_side_L / R` 的 ①（错步站）②（抬腿）栏可用来核对侧视大腿 / 小腿长度与膝位。
3. 切件：`tools/rig/segment_parts.py` 每视图 13 件（共 39），长袍归 `pelvis_skirt`，袍下被遮的大腿 / 小腿按源图袍纹补绘或按男主做法标「源图限制」；记录 `inpaintedPct` 与标准体回退件数（标准体目前是程序占位，回退件必须在 manifest 与报告写明）。
4. 身份 rig：`tools/rig/make_parts.py assets/default/rig/npc_zhujue__ch00_f` 生成 manifest（`kind: identity`、`identity{npcId: npc_zhujue, variant: ch00_f, portrait: por_npc_zhujue__ch00_f_base, sheetSha256}`、`nearSide: L`、`heightM: 1.62`、`skeleton`、`boneLengthsM`、`attachments: []`），再 `--check`。
5. 预览：`tools/rig/preview.py` 出 `preview/walk_dir8.gif`、`preview/sword_attack_dir8.gif`、`preview/gait_vs_clip_walk.gif` 与 `preview/npc_zhujue__ch00_f__pose-strip.png`（参数照男主；动作片段用 `assets/default/rig/clips/`）；全帧接触表目检：关节不露缝、长袍不穿模到离谱、三视图同一人。
6. 工具缺口：若现有工具对长袍 / 女模板确实跑不通，允许在 `tools/rig/` 做**最小增量**（新增参数或分支，不改既有默认行为），同步补单测；男主 `make_parts.py … npc_zhujue__ch00_m --check` 必须仍通过。改了什么写报告 §2、§6。

## 约束
- 只写：`assets/default/rig/npc_zhujue__ch00_f/manifest.yaml`、`assets/default/rig/npc_zhujue__ch00_f/{front34,side,back34,preview,work}/**`、`tools/rig/*.py`（仅限第 6 条的最小增量）、本任务报告。不改 `sheet/`、男主素材、标准体、`assets/default/rig/clips/`、规格文档。
- 每次写入 ≤ 150 行；报告 ≤ 60 行。

检查：以下命令必须全部通过。
- `python3 -m unittest discover -s tools -p "test_*.py"`
- `python3 tools/rig/make_parts.py assets/default/rig/npc_zhujue__ch00_f --check`
- `python3 tools/rig/make_parts.py assets/default/rig/npc_zhujue__ch00_m --check`
- `python3 tools/agents/check_assets.py assets/default/rig/npc_zhujue__ch00_f --min 39 --max 60 --min-side 16`
- `python3 tools/lint/check_ids.py --strict`

## 报告
第 3 节：Q1 识别锚（3 视图 × 5 条，ΔE 量测）、Q2 39 件单连通 / 补绘比例 / 回退件数、Q3 关节缝透明像素、Q5 踩滑、三张 GIF 路径与帧数、长袍限制；第 6 节：工具缺口与给 ENG-12c-clip 的接口说明；第 7 节逐条对照检查命令与上面 1–6 条。
