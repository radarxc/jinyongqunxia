# 本任务：主要人物补齐 · {{books_title}}（逐书搜索主要人物列表，补齐缺的立绘；作者 2026-10-02 晚）

本任务出图并登记。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读 `/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/tools/agents/prompts/_codex_worker.md`（集成分支的最新版，以它为准；你工作区里的同名副本可能是旧版；执行环境与出图方式：**runner 由追踪者在沙箱外跑，你只入队取结果**；`worker_no={{worker_no}}`，槽位 {{slots}}）、`_codex_portrait.md`、`assets/default/prompts/characters/GUIDE.md` §0 与各节。

## 作者原话（2026-10-02 晚，逐字）
> 其他人物中，缺少扫地僧等人物。你开两个个codex exec（gpt-6 astra extra high），每个subagent负责七本，逐一执行，每一本做这几个事情：
> 1. 搜索获得书中主要人物列表
> 2. 把主要人物立绘补齐

## 本任务范围
{{books}}

## 要做的事（逐本书做）
1. **主要人物列表**：联网搜索该书的主要人物（维基百科 / 百度百科人物列表、人物关系），得到约 20–40 人（主角、重要配角、各方首领、重要反派、师长亲友）。
2. **对照仓库**：
   - 名录 `docs/design/catalog/npcs-chNN-*.md`（已登记的 `npc_*`）；
   - 提示词 `assets/default/prompts/characters/chNN-*/npc_*.md` 与 `INDEX.md` 该书的行；
   - 已有图 `assets/default/character/{male,female}/chNN/manifest.yaml`。
   列出三类：A. 名录有、提示词有、**没有图**（如 `npc_saodiseng` 扫地僧）；B. 名录有、**没有提示词文件**；C. 原著主要人物但**名录没有**（不能自造 `npc_` ID，写进报告第 6 节交设计任务登记）。
3. **补提示词**（B 类）：按 GUIDE 的格式与 §0 口径新建 `npc_<id>.md`（frontmatter 键齐全：asset_id `por_npc_<id>__chNN_<age>_<variant>_base`、subject_id、name、book、gender、age_variant、tier、output、manifest、references: []、reference_upload: []、status: new），描写以原著与名录条目为准（2–3 个面部辨识点 + 标志衣饰 / 道具），禁幼态、去 AI 化。
4. **补图**（A + B 类，每人 1 张 `_base`）：
   - S 级（主角关联人物、大首领）可按 AR-32 用经典剧照 + 基线（已有剧照用已有的；缺的按 `_codex_portrait.md` 第 3 节下载登记）；
   - 其余只用文字 + 两张同性别基线（`ref=text`）。
   - 质检合格后 `ingest8.py` 入库；`done.txt` 记账。
5. 每本书做完更新 `done.txt`；全部做完拼联系表存 `codex_w{{worker_no}}/sheets/`。不要跑 `build_portraits.py` / `build_portrait_index.py`。

## 约束
- 只写：{{writes_list}}、本任务报告。
- 不动已经有图的人物（主角精修归 ART-hero-refine-* 任务）；不改 `INDEX.md`、不改名录与设计文档、不改 `tools/**`。
- 每次写入 ≤ 150 行；报告 ≤ 80 行。

检查：以下命令必须全部通过。
{{char_checks}}
- `python3 tools/lint/check_ids.py --strict`

## 报告
第 3 节按书列：主要人物列表来源、A / B / C 三类人数与名单、补了哪些图（asset_id、参考方式）、跳过与原因；第 6 节：C 类人物清单（建议 ID、书、身份），交 DES 任务登记。
