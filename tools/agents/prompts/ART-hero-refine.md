# 本任务：主角精修 · {{books_title}}（复合基线风格的主角立绘、分时期立绘、关键剧情插图配古风题字；作者 2026-10-02 晚）

本任务出图并登记。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读 `/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/tools/agents/prompts/_codex_worker.md`（集成分支的最新版，以它为准；你工作区里的同名副本可能是旧版；执行环境与出图方式：**runner 由追踪者在沙箱外跑，你只入队取结果**；`worker_no={{worker_no}}`，槽位 {{slots}}）与 `_codex_portrait.md`。

## 作者原话（2026-10-02 晚，逐字）
> 开两个codex exec（gpt-6 astra ultra），每个负责七本书，对所有书中的主角（如张无忌、虚竹、乔峰等）进行一轮精修。要求
> 1. 不要跟电视剧完全一样（比如令狐冲就太像电视剧的演员了，可以结合我提供的截图一起重新生成），而是电视剧为参考，结合经典武侠游戏样子，生成复合基线风格的立绘。
> 2. 要充分结合人物特点和故事（比如令狐冲的剑和酒，杨过早期的不羁和晚期的黯然，黄蓉的灵动），同时，为不同时期的主角生成不同立绘（比如少年杨过，古墓杨过，青年杨过-游览江湖，断臂杨过，神雕大侠，各个时期的造型、衣物、道具，背景都不一样）
> 3. 做完以后，逐一搜索负责的小说中关键剧情，基于主角立绘和关键剧情，画出关键剧情插图（配以古风题字）。几部巨作可以关键情节多一些，其他的可以适量。

作者提供的截图：主检出 `.agents/coord/imagegen-reference/author-20261002/linghuchong_game_cover_wuyuejianpai.png`（经典武侠游戏《笑傲江湖》封面，令狐冲持剑；见同目录 SOURCES.md）。它代表作者要的「经典武侠游戏样子」：古典武侠游戏绘画的气质与造型感，不是照片、不是演员。

## 本任务范围
{{books}}

主角 = 每本书的男女主角（以 `docs/design/catalog/npcs-chNN-*.md` 与 `design/18` 的 S 级主角为准；默认名单：{{heroes}}）。玩家主角 `npc_zhujue` 不在本任务内。

## 要做的事（逐本书做；每本做完再做下一本）

### 1. 精修基础立绘（每位主角 1 张 `_base`）
- 复合参考（上传顺序）：① 经典剧照 1–2 张（主检出 `imagegen-reference/identity-2026100{1,2}/<书>/`、`hero-20261001/` 里已有的；没有的可按 `_codex_portrait.md` 第 3 节下载并登记）；② 经典武侠游戏画风参考 1 张：令狐冲用作者的截图；其他人用 `identity-20261001/game/raw-portraits/` 里对应的《金庸群侠传》头像（放大到长边 ≥ 448 再传），没有的用作者截图作画风参考；③ 两张同性别项目基线（最后）。
- **例外（协调者 10-03 02:50 裁定）**：白马啸西风、侠客行、鸳鸯刀三本的主角没有可靠剧照（作者 AR-32 补记定为用《金庸群侠传》游戏头像），复合参考就是「游戏头像 + 基线」，**不要搜图、不要因为没剧照而不出**；manifest 的 references 记游戏参考与基线即可，审核要点第 1 条已容许。
- 提示词口径（在 `common.py` 的 `REF` 里新加一种 `composite`）：「第 1(–2) 张是该角色经典影视造型的剧照：只借发型、服饰、配色、标志道具、气质和大致脸型，**五官不要照搬演员本人，要往经典武侠游戏插画的理想化脸型靠，成品像『这个角色』而不是像『这个演员』**；第 N 张是经典武侠游戏的绘画风格参考：借其古典武侠插画的气质、线条与造型感；最后两张是项目画风基线」。其余（2:3 全身、成年、去 AI 化、禁幼态、右衽、不写演员名、浅暖灰纸底加淡水墨）照旧。
- 人物特点必须进描写：令狐冲的剑与酒葫芦、杨过的不羁 / 黯然、黄蓉的灵动、乔峰的豪烈、段誉的书卷气、虚竹的憨厚、张无忌的温厚、韦小宝的机灵等——以原著为准，每人写 2–3 个辨识点与一件标志道具。
- 入库覆盖现有 `_base`（同 asset_id；旧图由 manifest 历史与 `.agents/coord` 归档保留），`redo_reason` 写「作者 10-02 晚：复合基线风格精修」。

### 2. 分时期立绘（每位主角 2–5 张，按原著人生阶段）
- 先用联网搜索与 `docs/design/story/NN-*.md`、`chapters/NN-*.md` 定阶段，例如杨过：少年（终南山 / 全真）、古墓、青年游历江湖、断臂（玄铁重剑）、神雕大侠（中年，黯然）；郭靖：大漠少年、江南青年、襄阳中年；黄蓉：小乞儿装、桃花岛 / 帮主、郭夫人；令狐冲：华山弟子、思过崖、浪子（酒葫芦）、恒山掌门……每个阶段造型、衣物、道具、背景都不同（背景是该阶段的典型场景，保留背景，不抠图）。
- 命名：`por_npc_<id>__chNN_<age>_scene_<stage_slug>`（`age` ∈ youth / prime / elder 按阶段；`_scene_` 后缀让立绘加工保留背景）。每张要有提示词文件 `assets/default/prompts/characters/chNN-<书>/npc_<id>__scene_<stage_slug>.md`，frontmatter 键齐全（照同目录现有 `npc_*__scene_*.md`：asset_id、subject_id、name、book、gender、age_variant、tier、output、manifest、references、reference_upload、status、redo_reason），正文「## Gemini 提示词」段放实际提示词。
- 身份锚点：第一张 `-i` 用本轮新出的该主角 `_base`，再加剧照 / 游戏参考与基线，保证各阶段同一张脸、只变年龄。
- 现有的 `_scene_*` 立绘若与某阶段重合，按新脸重出覆盖；不重合的保留。

### 3. 关键剧情插图（每本书：{{scene_counts}}）
- 先逐本联网搜索关键剧情（回目、名场面），结合 `docs/design/catalog/key-scenes.md` 已有的 `cg_chNN_*` 清单和 `docs/design/story/NN-*.md` 的改命节点，选出本书的关键情节；已有 `cg_` ID 的直接用其 ID 与提示词（`assets/default/prompts/scenes/chNN-*/cg_*.md`，可改写），新增的在 `key-scenes.md` 该书小节追加表行（ID 格式 `cg_chNN_<slug>`）并新建提示词文件。
- 画法：横幅 1536×1024，写实手绘古风；上传本轮精修的主角立绘（含对应阶段）作身份参考，限主角与 S 级（AR-29）；其他人物按文字。**配古风题字**：画面一角竖排毛笔题字，内容是该场面的四至八字题名（如「华山论剑」「雁门关外」），可加一枚小朱印；提示词写明题字内容、字体为楷 / 行书、位置与大小，并要求字迹正确。入库前放大核对题字每个字；写错或多字就重出（最多 2 次）；仍不对就改为**不带文字**重出，再用 PIL 以本机楷体 / 行楷字体（`/System/Library/Fonts/Supplemental/` 下的 Kaiti / Xingkai）叠上题字与朱印，manifest `notes` 如实记「题字由字体叠加」。
- 入库到 `assets/default/scene/chNN/`（`ingest.py`，`--note` 写题字内容与是否叠加）。

### 4. 收尾
- 每本书做完更新 `done.txt`；全部做完拼联系表（基础立绘新旧对比、各主角分时期一排、插图一组）存你的 `codex_w{{worker_no}}/sheets/`。
- 不要跑 `build_portraits.py`、`build_portrait_index.py`（协调者集中跑）。

## 约束
- 只写：{{writes_list}}、本任务报告。
- 不碰其他书、不改 `tools/**`、不改 `docs/design/catalog/key-scenes.md` 以外的设计文档；`key-scenes.md` 只追加表行，不改已有行。
- 每次写入 ≤ 150 行；报告 ≤ 100 行。

检查：以下命令必须全部通过。
{{char_checks}}
- `python3 tools/agents/check_asset_dirs.py "assets/default/scene/{{ch_glob}}" --min 1 --max 999`
- `python3 tools/lint/check_ids.py --strict`

## 报告
第 3 节按书列：精修的主角与提交前的 asset_id、各阶段立绘 ID、插图 ID 与题字（哪些是叠加的）、每张用的参考（剧照版本可写演员名）、重出次数；第 6 节：名录里没有而原著重要的人物、需要作者拍板的取舍。
