# 本任务：城图全量 · {{batch_title}}（AR-47：189 城 × 年代全量，按书分批；本批清单见 `{{expect}}`）

本任务写城市规格与复原依据、跑工具生成布局并渲染城图；不改工具逻辑、不改素材、不出图（没有 image_gen）。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读：`tools/agents/prompts/_codex_worker.md`（执行环境：codex 沙箱、只读集成分支路径；本任务不用 runner）、**`tools/agents/prompts/CITY.md`（单座城的完整做法，考据单元逐城照它执行）**、`tools/town/README.md`（含 TOOL-city-generic 新增的「推定格局生成器」「年代套件」「JPEG 预览」三节）、`docs/design/22-town-layout-and-generation.md`、样例 `docs/design/town/history/city_hami__tang_702.md` 与 `docs/design/town/city_hami__ch10.yaml`、`docs/design/town/progress.md`（上一轮的读法与教训）。

## 作者原话
- 2026-10-02 晚：「同时再开一个codex exec（gpt-6 astra extra high），负责把所有城市布局图，按照城市 X 年代，搜索地图，转化为布局图，再拼接出完整地图」
- 2026-09-30：「小城 / 遗址 272 个，默认不做史料复原」
- AR-47（2026-10-03 约 12:40）：「城图：189 城 × 年代目前只做了白马（唐）16 城，其余范围等你定。……这些都要做」——协调者口径：全量，按书分批多路并行。

## 本批
- 清单：`{{expect}}`（追踪者登记，**只读**）；每行一个「城 × 年代」单元：`chapters` 是该年代带出现的全部章节（第一个 = `primary_chapter`，其余是同带副本），`era_kit` 是建议套件（来自 `tools/agents/prod_plan.py` 的 `kit_for`；ch10 唐代中原城用 `tang`、西域 `xiyu`、吐蕃 `tubo`），`fullsize=yes` 是本章首城，`mode` 见下。
- `mode=study`（都城 / 大城）：照 CITY.md 第 1–5 步逐城考据——联网搜史料与历史平面图（图片下到工作区 `refs/`，不入库，来源注明「已看图 / 仅文字」），写复原依据 `docs/design/town/history/<city>__<band>.md`（60–140 行）、规格、平面图、布局、渲染。史料少的按同年代同地域一般格局推定，逐项标（推定）/（原创扩展），不要跳过。
- `mode=generic`（小城 / 遗址）：不联网，`python3 tools/town/make_generic_city.py --city <id> --band <band>` 生成各章规格；复原依据写短版（20–40 行：地域、年代、推定依据、与本区域大城的关系）；其余步骤同上。
- `mode=copy_only`：主章节已完成，只补同带副本章节。
- 套件：规格 `era_kit` 用清单值；工具按套件叠加 `assets/default/{tile,building-map}/<kit>/`，缺的种类回退基线（写入 `asset_substitutions`），manifest `notes` 写明回退。

## 磁盘规则 v2（协调者 10-03 13:12，替代 44daac2f）
1. 主章节目录 `assets/default/town/<city>__<primary>/` 只放：`layout.yaml`、`preview.jpg`（`python3 tools/town/render_town.py <layout> -o <目录>/preview.jpg --scale 0.25`，JPEG q85，短边 ≥ 512）、`manifest.yaml`（一条：`id: town_<city>__<ch>`、`file: preview.jpg`、`category: town`、`style: default`、`subject`、`prompt`（实际命令）、`tool: tools/town/render_town.py`、`model: none`、`created`、`size`、`sha256`、`status: candidate`、`references`（规格、复原依据、套件目录）、`notes`（「0.25 预览；全尺寸未渲染；运行时按 layout + 贴片渲染」+ 套件回退））。
2. `fullsize=yes` 的首城另出全尺寸 `town.png`（`--scale 1`）与 `overlay.svg`；其他城都不出这两样。
3. 同带其他章节：复制规格只改 `chapter_id` / `book_world`（章节文档写明该城在那个时点有变化的，做最小差量并写明），跑 `gen_layout.py` 把布局写到 `assets/default/town/<city>__<chNN>/layout.yaml`；**不渲染、不写 manifest、不放图**。
4. 平面图每个单元一份：`docs/design/town/history/<city>__<band>_plan.svg/.png`。日志、render json、stats 不进资产目录（放工作区 `tmp/`）。

## 进度与续作
- 每完成一个单元，就往 `{{progress}}` 追加该单元各章节的行（列同 `docs/design/town/progress.csv`：`city_id,chapter_id,effective_band,primary_chapter,importance,status,history_path,spec_path,asset_dir,reason`；status 用 `complete_candidate` / `partial_candidate` / `skipped`），并在 `{{done}}` 记一行 `city__band ✔/✘ 说明`。被中断后先读这两个文件，跳过已完成单元。
- `skipped` 只用于确实做不了的（如名录缺键、史料自相矛盾），必须写 reason，且不超过本批单元数的 10%。
- 共享的 `docs/design/town/progress.csv` / `done.txt` / `progress.md` **不要改**（追踪者合入后统一汇总）。
- 单元做完立刻目检 `preview.jpg`（城垣 / 门 / 主街 / 水系与平面图一致，建筑不压水、不出墙），有问题优先调规格。

## 约束
- 只写：本批清单各单元的规格、资产目录、复原依据与平面图、`{{progress}}`、`{{done}}`、本任务报告（完整写集见第二节）。不改 `tools/**`、素材、`cities.yaml`、清单 `{{expect}}`。
- 每次写入 ≤ 150 行；报告 ≤ 120 行。

检查：以下命令必须全部通过。
- `python3 tools/agents/check_city_batch.py {{expect}} {{progress}}`
- `python3 tools/lint/check_ids.py --strict`

## 报告
第 3 节：按单元列出完成情况（城 × 年代、来源数与可信度、推定项数、网格与缩比、套件与回退、副本章节）；单城平均耗时（考据 / 推定分开统计）；跳过清单与原因；第 6 节：工具缺口与名录问题；第 7 节逐条对照检查与磁盘规则 v2。
