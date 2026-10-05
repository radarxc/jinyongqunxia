# 本任务：新登记人物立绘 · {{books_title}}（名录补登记新增、还没有立绘的人物，按名单补提示词与立绘；作者 AR-47）

本任务写提示词、出图并登记。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读 `/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/tools/agents/prompts/_codex_worker.md`（集成分支最新版；**runner 由追踪者在沙箱外跑，你只入队取结果**；`worker_no={{worker_no}}`，槽位 {{slots}}）、`_codex_portrait.md`（工具箱、提示词口径、质检、入库）、`assets/default/prompts/characters/GUIDE.md` §0 与各节、`tools/agents/prompts/ART-cast-fill.md`（上一波同类任务的做法）。

## 作者原话（AR-47，2026-10-03 约 12:40，逐字摘录）
> * 新登记的 110 位人物立绘：等你定要不要做。
> 这些都要做

## 名单（{{count}} 项；`ID 性别/制作层级`；来源 {{source}}）
{{roster}}

## 本批特别说明
{{extra_note}}

## 要做的事（逐本书）
1. **人物事实**：每人从 {{source}} 读身份、性别 / 年龄段、2–3 个面部辨识点与衣饰、出场年代；原著外貌可联网核对（百科、原著节选），没把握的标（待考），补足的标（原创扩展）。不自造 `npc_` ID，名单外的人不做。
2. **提示词文件**：在该书提示词目录新建 `npc_<id>.md`（已存在就沿用），frontmatter 键齐全：`asset_id`（`por_npc_<id>__chNN_<age>_<variant>_base`，`<age>` 取 youth / prime / elder）、`subject_id`、`name`、`book`、`gender`、`age_variant`、`tier`、`output`、`manifest`、`references: []`、`reference_upload: []`、`status: new`；正文「## Gemini 提示词」一节照 `_codex_portrait.md` §2 口径（2:3 竖幅、单人全身、成年、去 AI 化那一句、**禁止幼态**、不写演员名、右衽、无文字）。
3. **出图**：每人 1 张 `_base`。本批都是 A / B 级：**只用文字 + 两张同性别基线**（`ref=text`），不下载剧照。**同一人跨书**（名单里标「跨书锚点」的，以及本批里两本书都有的同一 ID）：先有锚点图（已入库的那张，或本批先出的那一版），把锚点图缩小 JPEG 作第一张身份参考，提示词写「同一人、年长 / 年轻约 N 岁」。名单标「暂缓」的只写提示词（`status: hold`、写明暂缓原因），不出图。
4. **质检与入库**：每 8 张拼一张联系表 `view_image`（`_codex_portrait.md` §4 的重出条件，每张最多重出 2 次）；合格的 `ingest8.py <job> --no-commit` 入库；`done.txt` 每人一行记账，被中断从它续做。名单 `{{roster_file}}` 是校验用的机读版（只读，不要改）。全部做完再拼一张总联系表放 `…/gem/codex_w{{worker_no}}/sheets/`。
5. 不要跑 `tools/portrait/build_portraits.py`、`tools/agents/build_portrait_index.py`（协调者集中跑）。

## 约束
- 只写：{{writes_list}}、本任务报告。
- 不动已经有图的人物与别人的 manifest 条目；不改 `INDEX.md`、名录、设计文档、`tools/**`；剧照与参考图不进 `assets/`。
- 每次写入 ≤ 150 行；报告 ≤ 80 行。

检查：以下命令必须全部通过。
{{char_checks}}
- `python3 tools/lint/check_ids.py --strict`

## 报告
第 3 节按书列：每人 asset_id、参考方式（文字 / 跨书锚点）、重出次数、跳过与原因；联系表路径；第 6 节：名录里事实不清、需要设计任务补的项；第 7 节逐条对照上面 1–5 条与检查命令。
