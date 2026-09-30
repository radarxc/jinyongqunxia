# 本任务：城镇「{{display_name}}」（`{{city_id}}` · {{band_desc}} · {{chapters}}）· 史料复原布局 + 代码总装 45 度城图

本任务写城市规格与复原依据、运行工具生成布局并渲染真素材城图；不改工具逻辑（发现 bug 写报告，必要的最小参数改动列出）。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

## 作者要求（原话，2026-09-30）

> 城镇重要的是布局图（layout，坐标，用搜索来的历史布局图复原），然后用代码变换出45度视角的出图

> 贴片就是一些素材，四五十个差不多就行了。

> 验收gpt做，但是不要太复杂，按照现在的基线设计出口验收即可。

## 基线与工具

- 样例（照着做）：`docs/design/town/history/linan.md` + `linan_plan.svg`（复原依据表、来源清单、缩比）、`docs/design/town/city_hangzhou__ch02.yaml`（CitySpec 写法）、`assets/default/baseline/town/`（总装结果与 manifest）。
- 工具：`tools/town/README.md`：`gen_layout.py`、`check_town.py`、`plan_view.py`、`render_town.py`（`--tiles` / `--buildings` 指定素材目录；若不支持多目录，以最小改动加上并写报告）。
- 素材：贴片 `assets/default/baseline/tile/`（宋通用地面、岸线、桥、植物）+ 本年代 `assets/default/tile/{{kit_id}}/`（墙门）；建筑 `assets/default/building-map/{{kit_id}}/`（基线宋套件在 `assets/default/baseline/building-map/`）。
- 城市事实：`docs/design/map/cities.yaml` 里 `{{city_id}}` 的 `eras[{{chapters}}]`（当时名称、地位）、`design/19` §4 历史变迁、相关章节 / 剧情文档提到的地点：{{story_refs}}。

## 要做的事

1. **联网搜索史料**：本城在 {{year}} 前后的城址平面图 / 复原图 / 考古报告 / 地方志记载（城垣与门、主街、水系桥梁、宫城 / 衙署 / 王府、市与坊、寺观、码头）。只登记实际打开读到的页面。史料少的小城按同年代同地域的一般格局推定，逐项标（推定）/（原创扩展）。
2. **写复原依据** `docs/design/town/history/{{city_id}}__{{band}}.md`（60–140 行：来源清单、复原依据表、缩比、剧情地点对应）。
3. **写规格** `docs/design/town/city_{{city_id}}__{{ch_primary}}.yaml`（`era_kit: {{kit_id}}`；建筑类型只用该套件与基线里已有的 ID；网格按城市规模在 design/22 §1 画幅内选：大城 160×160、中城 128×128、小城 96×96）。同年代带的其他章节 {{ch_others}} 各复制一份规格只改 `chapter_id` / `book_world`（若章节文档写明该城在那个时点有变化，做最小差量并写明）。
4. **生成、校验、平面图、渲染**：每个章节的规格各跑 `gen_layout.py` → `check_town.py --strict-assets` → `plan_view.py`（写 `docs/design/town/history/{{city_id}}__{{band}}_plan.svg/.png`，一份即可）→ `render_town.py`（全尺寸 + `--scale 0.25` 预览 + overlay）。输出 `assets/default/town/{{city_id}}__<chNN>/`：`town.png`、`preview.png`、`overlay.svg`、`layout.yaml`、`manifest.yaml`（一条，`id: town_{{city_id}}__<chNN>`，`tool: tools/town/render_town.py`，`prompt` 写实际命令，`references` 列用到的套件目录，`status: candidate`）。
5. **目检**：`view_image` 看预览：城垣 / 门 / 主街 / 水系与平面图一致；建筑填满分区、沿街、不压水；光向一致；无明显错位。有问题优先调规格与参数。

约束：不改 `tools/town/` 逻辑；不改素材；每次写入 ≤ 150 行；报告 ≤ 100 行。

检查：以下命令必须全部通过（每个章节各一遍）。
- `python3 tools/town/gen_layout.py docs/design/town/city_{{city_id}}__<chNN>.yaml -o /tmp/tianshu_{{city_id}}_<chNN>.yaml`
- `python3 tools/town/check_town.py docs/design/town/city_{{city_id}}__<chNN>.yaml assets/default/town/{{city_id}}__<chNN>/layout.yaml --strict-assets`
- `python3 tools/agents/check_assets.py assets/default/town/{{city_id}}__<chNN> --min 1 --max 1 --min-side 512`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：来源数与可信度；复原了哪些要素、哪些推定；网格与缩比；各类型建筑数；剧情地点对应；需作者确认的事项（默认沿用）。
