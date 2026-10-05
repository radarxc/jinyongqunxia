# 本任务：小城 / 遗址的程序化城市规格生成器（不做史料复原）

本任务写代码 + 批量生成数据，不改素材。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

## 作者决定（原话，2026-09-30）

> 小城 / 遗址 272 个，默认不做史料复原

即 `docs/design/map/cities.yaml` 里 `importance` 为 `secondary` / `site` 的城市，按年代带 + 地区的通用模板直接生成 CitySpec，不联网查史料；都城 / 大城仍由 CITY-<city>__<band> 任务逐城复原。

## 要做的事

1. `tools/town/make_generic_city.py`：输入 `cities.yaml` 里一座城 + 年代带（含该带的章节列表），输出 `docs/design/town/<city_id>__<chNN>.yaml`（每章节一份，只差 `chapter_id` / `book_world`），规则：
   - 网格：`secondary` 96×96，`site` 64×64（遗址：残墙、少量建筑、荒草）；
   - 城垣与门：secondary 四面墙 2–3 门；site 残墙一段 + 1 门（或无门）；
   - 街道：一纵一横或丁字，按 `region` 决定是否有河（江南 / 荆襄 / 巴蜀等水乡带 1 条河 + 桥；北方无河或干渠）；
   - 分区：官署小院 1、商业沿主街、住宅其余、寺观 1（西域 → 清真寺，吐蕃 → 佛殿，其余按年代）、市场 1；`businesses` 列表里有 `escort_agency` / `casino` / `manor` / `inn` / `market` / `river_or_sea_port` 的各放对应功能建筑 1 座；
   - 套件：`era_kit` 按 `tools/agents/prod_plan.py` 的 `kit_for(region, band)`（导入复用，不复制逻辑）；建筑类型只用该套件 manifest 里存在的 ID（套件未合入时用宋江南 / 大理基线代替并记录）；
   - 确定性：同城同带同种子同输出；`basis` 字段统一写"程序化模板（作者 2026-09-30：小城不做史料复原）"；
   - 命令行：`make_generic_city.py --city city_xxx --band ming [--out docs/design/town]`，`--all --importance secondary,site [--band …]` 批量。
2. 单测 3 例（secondary / site / 水乡）；`check_town.py` 对生成的规格 + `gen_layout.py` 输出通过。
3. 用 `--all` 为 `secondary` / `site` 城市生成全部年代带的规格（每城每章节一份），跑 `gen_layout.py` 抽查 20 座通过；**不渲染**（渲染由后续 CITY-generic-render 按套件就绪分批做）。
4. `tools/town/README.md` 加一节；design/22 §2 末尾加一段"小城 / 遗址程序化模板"。

检查：以下命令必须全部通过。
- `python3 -m unittest discover -s tools/town -p "test_*.py"`
- `python3 tools/town/make_generic_city.py --all --importance secondary,site --check`（只校验不写）
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：生成了多少份规格（按带 / 按套件）、抽查结果、套件缺位的代替清单。报告 ≤ 80 行。
