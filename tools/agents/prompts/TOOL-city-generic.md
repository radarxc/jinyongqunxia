# 本任务：城图工具 · 小城 / 遗址推定格局生成器 + 年代套件接入总装 + JPEG 预览（AR-47 全量城图的前置）

本任务写代码与单测，不生成城市成品、不改素材。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读：`tools/town/README.md`、`docs/design/22-town-layout-and-generation.md`、`docs/design/town/schema.yaml`、`tools/town/{gen_layout,check_town,render_town,plan_view,assets}.py`、`tools/agents/prod_plan.py`（`KITS`、`kit_for(region, band)`、`city_units()`）、`tools/agents/prompts/CITY-generic.md`（2026-09-30 的原始需求，本任务是它的更新版）、`tools/agents/prompts/CITY.md`（逐城做法）、`docs/design/map/cities.yaml`（`importance`、`region`、`chapters` / `eras`、`businesses`）、`docs/design/town/progress.csv`、样例规格 `docs/design/town/city_hami__ch10.yaml`、`city_hangzhou__ch02.yaml`。

## 作者原话
- 2026-09-30：「小城 / 遗址 272 个，默认不做史料复原」
- AR-47（2026-10-03 约 12:40）：城图「189 城 × 年代……这些都要做」——协调者口径：全量 1172 个城 × 年代，按书分批。

## 要做的四件事
1. **推定格局生成器** `tools/town/make_generic_city.py`：输入 `cities.yaml` 的一座城 + 年代带（含该带的章节列表），输出每个章节一份 `docs/design/town/<city_id>__<chNN>.yaml`（同带各章只差 `chapter_id` / `book_world`）。规则（同年代同地域推定，不联网）：
   - 网格：`secondary` 96×96、`site` 64×64；城垣：secondary 四面墙 2–3 门，site 残墙一段 + 0–1 门（`walls: none` 的营地型按地域：草原 / 西域游牧点可无墙）；
   - 街道：一纵一横或丁字；按 `region` 决定水系（江南 / 荆襄 / 巴蜀 / 岭南等水乡带 1 条河 + 桥；北方无河或干渠）；
   - 分区：官署小院 1、商业沿主街、住宅其余、寺观 1（西域 → 清真寺，吐蕃 → 佛殿，其余按年代）、市场 1；`businesses` 有 `escort_agency` / `casino` / `manor` / `inn` / `market` / `river_or_sea_port` 的各放对应功能建筑 1 座；
   - `era_kit` = `prod_plan.kit_for(region, band)`（导入复用，不复制逻辑）；建筑类型只用该套件与基线 manifest 里存在的 ID；
   - `basis` 统一写「推定格局（作者 2026-09-30：小城 / 遗址不做史料复原）」；确定性：同城同带同参数同输出（种子由 city_id + band 派生）；
   - 命令行：`--city <id> --band <band> [--out docs/design/town]`；`--all --importance secondary,site [--band …] [--primary-chapter chNN]`；`--check`（只校验不写：每份生成规格过 `check_town.py` 的规格检查）。
2. **年代套件接入**：现在 `gen_layout / check_town / render_town` 只读基线两份 manifest（`assets/default/baseline/{tile,building-map}/manifest.yaml`），`era_kit` 只认 tang / song_dali / song_southern / yuan / ming / qing_early / xiyu / tubo（`schema.yaml` enums），年代套件目录 `assets/default/{tile,building-map}/<kit>/`（`prod_plan.KITS` 的 11 个：song_north、liao_jin_north、yuan_north、yuan_south、ming_north、ming_south、qing_north、qing_south、xiyu、tubo、mongol）没有接上，全量城图会一律用宋套件。改为：`era_kit` 可写 KITS 的套件键；工具按 `era_kit` 自动叠加 `assets/default/tile/<kit>/manifest.yaml` 与 `assets/default/building-map/<kit>/manifest.yaml`（基线兜底：套件缺的种类——地面、水、岸线等——回退基线并写入 `asset_substitutions`，严格素材模式允许并警告，`--release` 仍报错，沿用 README 已有的回退做法）；`schema.yaml` 的 `era_kit` 枚举相应扩充（旧值保持可用）。**回归**：16 个 ch10 城的 `gen_layout` 输出逐字节不变、`check_town --strict-assets` 仍通过；大理 / 临安见第 4 条。
3. **JPEG 预览**：`render_town.py -o *.jpg`（或 `--jpeg-quality N`，默认 85）直接输出 JPEG（透明区合成到与 `plan_view` 一致的浅底色）；这是城图磁盘规则 v2（协调者 10-03 13:12）的 manifest 图：0.25 预览 JPEG q85，短边 ≥ 512。

4. **基线回归修复（main 13:58 加）**：大理 ch01、临安 ch02 的 `check_town --strict-assets` 现报 `TOWN_WALL_WATER_UNDECLARED`（墙水相交未声明水门，TOOL-town-gaps-1 新增的检查；大理 12 个、临安 8 个 error）。优先修好：在两城规格里按史实声明水门（`water_gates`）或做最小规格改动，`gen_layout` 重新生成 `assets/default/baseline/town/town_{dali__ch01,hangzhou__ch02}.layout.yaml`，两条 `check_town --strict-assets` 转绿；**不重渲染、不改作者已审的基线 PNG**。若新布局除水门声明外还有建筑 / 道路位移（基线图会对不上），就不改，改在报告里写清原因与建议。

单测（`tools/town/test_*.py`，用夹具，不依赖整套素材）：生成器 secondary / site / 水乡各 1 例且确定性；套件叠加与回退各 1 例；JPEG 输出 1 例；原有单测全过。`tools/town/README.md` 加「推定格局生成器」「年代套件」「JPEG 预览」三小节。design/22 需要补的段落写报告 §6，不改设计文档。

## 约束
- 只写：`tools/town/**`、`docs/design/town/schema.yaml`、`docs/design/town/city_dali__ch01.yaml`、`docs/design/town/city_hangzhou__ch02.yaml`、`assets/default/baseline/town/town_dali__ch01.layout.yaml`、`assets/default/baseline/town/town_hangzhou__ch02.layout.yaml`（后四个仅限第 4 条）、本任务报告。不生成城市规格成品（`--check` 只校验不写）、不改素材、不改 `cities.yaml` / `progress.csv`。
- 每次写入 ≤ 150 行；报告 ≤ 80 行。

检查：以下命令必须全部通过。
- `python3 -m unittest discover -s tools/town -p "test_*.py"`
- `python3 tools/town/make_generic_city.py --all --importance secondary,site --check`
- `python3 tools/town/check_town.py docs/design/town/city_hami__ch10.yaml assets/default/town/city_hami__ch10/layout.yaml --strict-assets`
- `python3 tools/town/check_town.py docs/design/town/city_xian__ch10.yaml assets/default/town/city_xian__ch10/layout.yaml --strict-assets`
- `python3 tools/lint/check_ids.py --strict`

## 报告
第 3 节：生成器规则与参数、全部 secondary / site 的 `--check` 统计（按带 / 按套件，套件回退清单）、16 份 ch10 规格回归结果、大理 / 临安修复结果（或不修的原因）、JPEG 预览实测体积（举 2 例）；第 6 节：给城图批量任务的用法（命令行、套件目录需要的稀疏检出文件）与 design/22 待补段落；第 7 节逐条对照。
