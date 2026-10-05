# 本任务：标准体切件 · 男 / 女标准体（`male_std` / `female_std`）由 A 字三视图切出正式部件，替换程序占位（AR-47；main 13:58 登记）

本任务跑现成工具链把两套标准体切成正式部件并重建 manifest，让 `make_parts.py --check` 转绿；原则上不改工具。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读：`tools/agents/reports/ART-rig-std-refs.md`（两张标准体三视图与 6 张视图参考的质检、身高像素、给切件的建议）、`tools/agents/reports/TOOL-rig-sheet.md`（同一条流水线在男主身上的做法与限制）、`assets/default/prompts/rig/GUIDE.md`、`docs/tech/09-character-rig.md` §1、§6（标准体用途、`kind` 默认 standard、13 个 source key）、`assets/default/rig/{male_std,female_std}/manifest.yaml`（现为 `placeholder: true` 的程序占位，`make_parts --check` 因参考图缺失而不通过）。

## 作者原话（AR-47，2026-10-03 约 12:40，逐字摘录）
> * 标准体部件参考图 6 张：动作改走「具名角色三视图切件」后，待定是否还要。
> 这些都要做

## 要做的事（两套各做一遍）
1. 源图：`assets/default/rig/<set>/sheet/sheet_L.png`（ART-rig-std-refs 出的 A 字三视图，面向画面左）；拆图中间件可复用 `ref/`（已是 `sheet_split.py` 结果）或重拆到 `work/L/`。身高：男 1.70 m、女 1.62 m，256 px/m。
2. 关键点：`tools/rig/keypoints.py`（Vision 不可用就照男主用带置信度的 manual-prior，记录修点）。
3. 切件：`tools/rig/segment_parts.py` 每视图 13 件（3 视图共 39 件），`inpaintedPct` 与回退件如实记录；标准体自身不得再回退到占位件。
4. manifest：`tools/rig/make_parts.py assets/default/rig/<set>` 重建（`kind: standard`、`nearSide: L`、`heightM`、palette 保持原值以便调色、**去掉 `placeholder: true`**），再 `--check`。
5. 预览：`tools/rig/preview.py` 出 `preview/<set>__walk_medium__pose-strip.png` 与一张走路 8 方向 GIF（参数照男主）；全帧目检关节不露缝、比例正常、三视图同一人。
6. 工具缺口：确实跑不通才允许在 `tools/rig/` 做最小增量（新增参数，不改既有默认行为），补单测；男主 `npc_zhujue__ch00_m` 的 `--check` 必须仍通过。

## 约束
- 只写：`assets/default/rig/male_std/manifest.yaml`、`assets/default/rig/male_std/{front34,side,back34,preview,work}/**`、`assets/default/rig/female_std/manifest.yaml`、`assets/default/rig/female_std/{front34,side,back34,preview,work}/**`、`tools/rig/*.py`（仅限第 6 条）、本任务报告。不改 `sheet/`、`ref/`、男女主素材、`assets/default/rig/clips/`、规格文档。
- 每次写入 ≤ 150 行；报告 ≤ 60 行。

检查：以下命令必须全部通过。
- `python3 -m unittest discover -s tools -p "test_*.py"`
- `python3 tools/rig/make_parts.py assets/default/rig/male_std --check`
- `python3 tools/rig/make_parts.py assets/default/rig/female_std --check`
- `python3 tools/rig/make_parts.py assets/default/rig/npc_zhujue__ch00_m --check`
- `python3 tools/agents/check_assets.py assets/default/rig/male_std --min 39 --max 60 --min-side 16`
- `python3 tools/agents/check_assets.py assets/default/rig/female_std --min 39 --max 60 --min-side 16`
- `python3 tools/lint/check_ids.py --strict`

## 报告
第 3 节：两套各自的 Q1（与 sheet 的色差）、Q2（39 件单连通、补绘比例）、Q3（关节缝）、预览路径；第 6 节：给 ENG（标准体 + 装备层 / 调色）的接口说明；第 7 节逐条对照检查命令与上面 1–6 条。
