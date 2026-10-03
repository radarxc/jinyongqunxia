# 本任务：全部城市布局图 · 按城市 × 年代搜索史料、复原布局、总装完整城图（作者 2026-10-02 晚）

本任务写城市规格与复原依据、运行工具生成布局并渲染真素材城图；不改工具逻辑（发现 bug 写报告）。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读 `tools/agents/prompts/_codex_worker.md`（执行环境；本任务不出图，只跑渲染工具）与 **`tools/agents/prompts/CITY.md`（单座城的完整做法，本任务对每座城照它执行）**、`docs/design/22-town-layout-and-generation.md`、`tools/town/README.md`、样例 `docs/design/town/history/linan.md` 与 `docs/design/town/city_hangzhou__ch02.yaml`、已完成的 `assets/default/baseline/town/`。

## 作者原话（2026-10-02 晚，逐字）
> 同时再开一个codex exec（gpt-6 astra extra high），负责把所有城市布局图，按照城市 X 年代，搜索地图，转化为布局图，再拼接出完整地图

## 范围与顺序
- 城市清单：`docs/design/map/cities.yaml`（189 座）；每座城要做的「城市 × 年代」= 它出现的各章节（`chapters` / `eras`）按年代带（`chapters.<ch>.band`）合并：同一年代带只做一份规格，其他章节复制只改 `chapter_id` / `book_world`（见 CITY.md 第 3 步）。
- 已完成的跳过：`assets/default/baseline/town/`（大理 ch01、临安 ch02）与 `assets/default/town/<city>__<chNN>/` 已存在的。
- **顺序**：先 M1 需要的白马 ch10 城市（唐 702–703：西州、庭州、敦煌 / 沙州等，`cities.yaml` 中 ch10 的城）；再按书序 ch01 → ch14，每章内按 `importance` 高 → 低。年代套件：唐代没有专门套件，用 `xiyu`（西域）或最接近的宋套件并在报告写明；其余按 `cities.yaml` 年代带对应 `assets/default/tile/<kit>` 与 `assets/default/building-map/<kit>`。
- 史料少的小城按 CITY.md 第 1 步的「同年代同地域一般格局推定」，逐项标（推定）/（原创扩展），不要跳过。
- 这是一个长任务：每做完一座城写 `done.txt`；被中断后从它续做。做不完也要在时限内把已完成的城保持完整（规格 + 依据 + 渲染 + manifest 都齐）。

## 产物（每座城 × 年代，照 CITY.md）
- `docs/design/town/history/<city_id>__<band>.md`、`_plan.svg/.png`；
- `docs/design/town/<city_id>__<chNN>.yaml`（每个章节一份）；
- `assets/default/town/<city_id>__<chNN>/{preview.png, overlay.svg, layout.yaml, manifest.yaml}`（`id: town_<city_id>__<chNN>`，`file: preview.png`，`tool: tools/town/render_town.py`，`model: none`，`prompt` 写实际命令，`status: candidate`）。
- **磁盘规则（协调者 10-03 01:05）**：全尺寸 `town.png`（18–35 MB 一张）只给 ch10 白马的城和每章 `importance` 最高的 1 座城；其余城**不渲染全尺寸**，只出 `preview.png`（`render_town.py --scale 0.5`，短边 ≥ 512）作为 manifest 的图，`notes` 写「全尺寸未渲染；运行时按 layout + 贴片渲染」。运行时城镇由 layout 和贴片实时渲染（ENG-09），全尺寸图只是审阅用。
- 「拼接出完整地图」= `render_town.py` 用贴片 + 建筑素材总装（全尺寸或 0.5 缩放）；目检 `preview.png`（城垣 / 门 / 主街 / 水系与平面图一致，建筑不压水、不重叠）。

## 约束
- 只写：`docs/design/town/**`、`assets/default/town/**`、本任务报告。
- 不改 `tools/town/`、不改素材、不改 `cities.yaml`；每次写入 ≤ 150 行；报告 ≤ 120 行。
- 下载的历史图片放工作区 `refs/`（写集外，不入库）。

检查：以下命令必须全部通过。
- `python3 tools/agents/check_asset_dirs.py "assets/default/town/*" --min 1 --max 1 --min-side 512`
- `python3 tools/lint/check_ids.py --strict`

## 报告
第 3 节：按章节列出完成的城（city_id × chNN）、来源数、推定项数、网格与缩比；未完成的清单与原因；第 6 节：工具缺口（如唐代套件）。
