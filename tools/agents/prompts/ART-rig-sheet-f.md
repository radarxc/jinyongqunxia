# 本任务：动作原型 · 主角·女（`npc_zhujue__ch00_f`）A 字三视图 L / R 与纯侧视补充图 L / R（AR-47；codex 出图，上传立绘作身份参考）

本任务出图并登记，不改规格、不改工具、不切部件（切件是后续 TOOL-rig-parts-f）。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读：`/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/tools/agents/prompts/_codex_worker.md`（**出图 runner 由追踪者在沙箱外跑，你只写提示词、入队、取结果、登记**；`worker_no=20`，槽位 2）、`tools/agents/prompts/ART-rig-sheet.md`（三视图英文骨架、质检、登记字段）、`tools/agents/prompts/ART-rig-sheet-side.md`（纯侧视补充图的三栏姿势与用途）、`assets/default/rig/npc_zhujue__ch00_m/sheet/manifest.yaml`（男主四张图的实际提示词，照抄结构）、`assets/default/prompts/rig/GUIDE.md` §1–§2、`docs/tech/09-character-rig.md` §1.3。

## 作者原话（AR-47，2026-10-03 约 12:40，逐字摘录）
> * 女主角三视图与切件、遗迹贴片（洞壁、墓道、石刻、宝箱）：尚未登记任务。
> 这些都要做

## 身份与服装（先看图再写识别锚）
- 身份参考：`assets/default/character/female/ch00/por_npc_zhujue__ch00_f_base.png`（女主 ch00 锚点，十五个时代的唯一身份参考）。缩到长边 1024 的 JPEG 放 `…/gem/codex_w20/staging/` 再上传。
- 先 `view_image` 立绘，写出 5 条识别锚（发髻与发饰、长袍主色与交领内衬、腰带色 / 结位 / 垂带、宽袖与内袖、鞋袜）写进每张提示词的 IDENTITY ANCHORS，四张图一致。
- **长袍及踝**：A 字三视图里两腿之间被袍摆遮住是服装所致，不要为了「透背景」改短衣裙；只要求腋下透背景、裙摆下两只脚分开可见。

## 要做的事（四张 1536×1024 横幅，每张一次出图，队列第 3 列写 `none`：只传 identity_refs，不附画风基线）
1. `sheet_L.png`：三栏 `front34 | side | back34`，**都面向画面左**（未镜像；近侧为解剖学左 L）。骨架照 `ART-rig-sheet.md` 第 2 条：A 字站姿（双臂离身 20–30°，腋下透背景）、空手、同一身高同一地平线、右衽、背景平涂 #E6E1D8、无地面阴影 / 文字 / 网格 / 色板。
2. `sheet_R.png`：同一人同一套衣着，三栏**都面向画面右**；不是把 L 翻转，右衽与腰带结位留在身体同一侧（照男主 sheet_R 的写法）。
3. `sheet_side_L.png`：三个**纯侧视**全身，都面向画面左（照 `ART-rig-sheet-side.md`）：① 自然站姿双腿前后错开半步、膝微屈；② 走路抬腿瞬间、前腿大腿与小腿约 100°；③ 双脚并拢、双臂平举（T 字）。长袍要随腿形起伏，能看出前腿膝位置与两只脚；加一句 "pure side (profile) views only; the robe follows the legs so the front knee position is readable; feet clearly separated"。上传顺序：立绘、已出的 `sheet_L` 缩小 JPEG。
4. `sheet_side_R.png`：同上三栏都面向画面右（重新生成，右衽不变）。
5. 质检（`view_image`，每张最多重出 2 次；一栏不合格整张重出）：恰好三人、顺序与朝向正确、同一身高（量像素，差 ≤ 3%）、空手、右衽、背景平涂；识别锚 5 条与立绘一致；成年女性比例、无幼态；sheet_side 的 ①② 栏是纯侧视。
6. 登记 `assets/default/rig/npc_zhujue__ch00_f/sheet/manifest.yaml`（顶层列表，4 条，字段与男主 sheet manifest 一致：`id` 为 `npc_zhujue__ch00_f__sheet_L` / `_R` / `_side_L` / `_side_R`、`file`、`category: rig/sheet`、`style: default`、`subject`、`prompt`（实际发出的全文）、`negative`、`references`（立绘与 sheet_L 的路径、sha256、用途、实际上传件）、`tool: codex exec · image_gen`、`model: gpt-6-astra`、`created`、`source_path`、`size`、`sha256`、`status: candidate`、`notes`（视图顺序与朝向、重出次数、身高像素））。PNG 原样保存，不裁不缩。另写 `sheet/qa.yaml`：每张的三栏身高像素、腋下空隙、识别锚逐条结论。
7. 联系表一张（四张缩略 + 立绘）放 `…/gem/codex_w20/sheets/`。

## 约束
- 只写：`assets/default/rig/npc_zhujue__ch00_f/sheet/**`、本任务报告。不改 `tools/**`、规格文档、立绘、男主素材。
- 每次写入 ≤ 150 行；报告 ≤ 50 行。

检查：以下命令必须全部通过。
- `python3 tools/agents/check_assets.py assets/default/rig/npc_zhujue__ch00_f/sheet --min 4 --max 4 --min-side 1000`
- `python3 tools/lint/check_ids.py --strict`

## 报告
第 3 节：四张各重出几次、识别锚逐条结论、三栏身高像素、腋下与脚的可见情况；第 6 节：给 TOOL-rig-parts-f 的提示（长袍下髋膝怎么定、侧视图哪栏可用来分腿）；第 7 节对照质检项。
