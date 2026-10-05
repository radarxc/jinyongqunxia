# 本任务：多人情景图 · {{books_title}}（{{count}} 张，codex exec 出图，AR-29 / AR-30 / AR-31）

本任务出图并登记，不改规格、不改工具、不改提示词文件。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读：`tools/agents/prompts/_imagegen.md`（本环境无 `image_gen`，用本机 Codex CLI 代出，每张一次调用）、`docs/design/catalog/key-scenes.md` §0 使用口径、`docs/decisions/author-requirements.md` AR-29（只上传主角和 S 级立绘）、AR-30 第 3 条、AR-31（人物画风、去 AI 化、禁幼态）、`.agents/coord/_handoff/gem/DISK_RULE.md`（每张出完清 CODEX_HOME）。

## 输入
提示词文件：`assets/default/prompts/scenes/{{book_dirs}}/cg_*.md`（共 {{count}} 份）。每份 frontmatter 有 `asset_id`、`characters`、`reference_upload`（要上传的立绘，只含主角 / S 级）、`output`、`manifest`、`size: 1536x1024`；正文「## Gemini 提示词」代码块是本张的完整提示词（已按人物与参考图顺序写好）。

## 做法
1. 每张图：
   - 参考图 = frontmatter `reference_upload` 里**实际存在**的 PNG，按顺序各缩到长边 1024 的 JPEG（中间件放 `/private/tmp/{{task_id}}/staging/`）；最后再加一张画风基线：取本张第一位上传人物同性别的基线（`assets/default/baseline/character/<male|female>/ref_npc_*_base01.png`，缩小版在 `.agents/coord/_handoff/gem/baseline_small/`），没有上传人物的场景也上传一张男性基线。
   - 提示词 = 代码块原文 + 末尾加一句「最后一张参考图是本项目的立绘画风基线：只参考画风、用色、光线、质感，不取人物、构图与背景」+ `_imagegen.md` 第 2 条的固定首句（image_gen 一次调用）。生成尺寸 **1536×1024 横幅**。
   - 列在 `reference_upload` 里但文件不存在的立绘：不上传，该人物按提示词里的文字画，并在 manifest `notes` 与报告里逐条记下。
   - 带「（生产门禁）」的场景照出，`status` 仍是 `candidate`，`notes` 记「生产门禁：…」。
2. 质检：每 8 张拼一张联系表（PIL，每格约 384×256，标 asset_id），`view_image` 看。必须重出的（每张最多 2 次）：上传过立绘的人物认不出 / 串脸；任何人物幼态或儿童体态；文字、字幕、水印、边框、分镜格；多出的主要人物；血腥特写；画风像照片、3D 塑料感或动漫；构图明显不符「画面瞬间 / 构图」两栏。
3. 入库：`python3 tools/imagegen/ingest.py <cg_id> <png> --tool "codex exec · image_gen" --model gpt-6-astra --prompt-file <本张实际提示词 txt> --refs <实际上传的文件，按顺序>`（它按 frontmatter 的 `output` / `manifest` 落到 `assets/default/scene/<chNN>/`，裁掉画框、缩放，写 `status: candidate`）。
4. 每张出完清 `CODEX_HOME` 的 `sessions/`、`generated_images/`、`thread_history*`；`df -h /` 低于 3 GB 停下写报告。
5. 同时跑 **{{slots}} 个槽位**（各自独立 `CODEX_HOME=/private/tmp/{{task_id}}/home<N>`）。记 `done.txt`，被打断可续做。

## 约束
- 只写：{{scene_writes}}、本任务报告。**不改提示词文件、不改立绘、不改 `tools/**`**。
- 立绘与基线只作参考，不复制进场景目录；manifest references 如实记实际上传的文件与 sha256。
- 每次写入 ≤ 150 行；报告 ≤ 60 行。

检查：以下命令必须全部通过。
{{checks}}
- `python3 tools/lint/check_ids.py --strict`

## 报告
第 3 节写：每本书出了几张、重出清单与原因、缺参考图改用文字的人物清单、带生产门禁的场景清单、限流次数、联系表路径。
