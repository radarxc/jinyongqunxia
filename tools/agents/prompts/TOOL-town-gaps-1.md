# 本任务：城镇工具缺口第一批 · 声明式水门、多重城垣 / 共用内隔墙、未声明墙水相交检查、plan_view 页眉按城、cities.yaml 庭州键与 ch10 年代带、唐代 / 西域 / 吐蕃套件进 schema；并用洛阳、太原两城重跑管线验证

本任务改工具。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读：
- `tools/agents/reports/CITY-layouts-all.md` §3、§6（工具缺口清单与两城阻断记录）、`docs/design/town/r6-watergate-blocker.json`（若在）；
- `tools/town/README.md`、`render_town.py`、`gen_layout.py`、`plan_view.py`、`check_town.py`（第 282 行一带 `TOWN_GATE_ON_WATER`）、`schema_check.py`、`docs/design/town/schema.yaml`；
- 两份规格与历史：`docs/design/town/city_luoyang__ch10.yaml`、`city_taiyuan__ch10.yaml`、`history/city_luoyang__tang_702.md`、`history/city_taiyuan__tang_702.md`，以及两城现有 `assets/default/town/city_<城>__ch10/`（manifest 已被协调者标 `rejected`，notes 写了原因）；
- `docs/design/town/cities.yaml`（城市登记；若文件在别处以 CITY 报告为准）、`docs/tech/07-asset-generation.md` 城镇一节、`packages/data/src/schemas/town.ts`（运行时 `town-runtime.v1` 边界，看清楚哪些字段会进运行时）。

## 背景

CITY-layouts-all（AR-36 第 5 项）产出的 16 城里，洛阳（洛水穿城）与太原（西 / 中 / 东三城）过不了审核第 4 条：`render_town` 只支持一道外墙，`check_town` 把任何压水的门判为 `TOWN_GATE_ON_WATER`，所以河道穿墙处只能画实墙封河；三城的共用内隔墙画不出。审核与报告都把这记为工具缺口。另有：`plan_view.py` 的平面图页眉写死 `history/linan.md`；`cities.yaml` 缺庭州的稳定键、ch10 的年份与年代带要核；没有唐代套件，`xiyu`、`tubo` 套件没接进 schema（现有 55 类里只有 38 个宋类有基线图——基线图不归本任务，本任务只把套件登记进 schema 并给出缺图回退）。

## 要做的事（按序）

1. **声明式水门**：规格 schema 增加水门声明（例如 `water_gates: [{wall: outer|inner_<name>, at: [x,y] 或 segment, width, kind: 水门|水关}]`），`gen_layout` / `render_town` 在声明处把墙开口、让水面连续穿过并画水门构件（没有专用贴片就用现有城门贴片 + 水面层的合理组合，并在 README 写明回退）；`check_town` 把**声明过的**水门从 `TOWN_GATE_ON_WATER` 排除，同时新增检查：任何**未声明**的墙水相交格判错（新错误码，报坐标与数量）。
2. **多重城垣 / 共用内隔墙**：规格允许多个城垣（外廓 + 若干内城 / 分城），内墙可共用；`gen_layout` / `render_town` 按声明画出；`check_town` 校验内墙闭合、门属于哪道墙、内墙与道路 / 水系的关系沿用现规则。顺带支持「无墙营地」（`walls: none`，只画寨栅或不画）——至少 schema 与检查放行，渲染给最简实现。
3. **plan_view 页眉**：按城市取 `history/<城>__<年代>.md` 的真实路径（从规格的 references 或命名规则推），不再写死 `linan`。
4. **cities.yaml**：补庭州的稳定键；核对 ch10（白马，唐 702–703，AR-26）各城的年份与年代带字段，写错的改，拿不准的标「（待考）」并在报告列出。
5. **套件进 schema**：把 `tang`（唐代）、`xiyu`、`tubo` 登记进 `docs/design/town/schema.yaml` / `schema_check.py` 的合法套件表；唐代没有贴片时按现有规则回退到最接近的宋类并在 manifest notes 记「回退」，不要伪造唐代基线图。`packages/data/src/schemas/town.ts` 只在运行时必须认识新字段时才改，改了就补 schema 测试并跑 `pnpm --filter @tianshu/data test`。
6. **用两城验证**：给 `city_luoyang__ch10.yaml` 加洛水东西两处水门声明，给 `city_taiyuan__ch10.yaml` 加三城内隔墙与汾河进出水门声明，各自重跑完整管线（layout → 平面图 → preview 0.5 → 全尺寸 town.png → overlay → manifest），`check_town.py --strict-assets` 通过、未声明墙水相交为 0；manifest 的 `status` 改回 `candidate`，notes 追加本次修复说明（保留协调者 05:32 那条作历史）；`progress.csv` / `done.txt` 把两城从 partial 改为完成候选。
7. 测试：`tools/town/test_*.py` 补水门、内墙、无墙营地、未声明相交的正反用例；`python3 -m unittest discover -s tools -p "test_*.py"` 全过；`python3 tools/agents/check_asset_dirs.py "assets/default/town/city_*__ch10" --min 1 --max 1 --min-side 1024`（**协调者 10-03 08:25 修订验收口径**：该脚本统计的是 manifest 中的图片条目，不是目录文件数，每城 manifest 合法登记 1 张 preview，原写的 `--min 5 --max 5` 不适用；「每城目录恰好 5 个核心文件 layout.yaml / manifest.yaml / overlay.svg / preview.png / town.png」改由报告第 3 节贴两城目录 `ls` 的实际输出佐证；不改检查器、不复制图片、不伪造 manifest 条目）与 `python3 tools/lint/check_ids.py --strict` 通过。

## 约束

- 只改：`tools/town/**`、`docs/design/town/schema.yaml`、`docs/design/town/cities.yaml`、`docs/design/town/city_luoyang__ch10.yaml`、`docs/design/town/city_taiyuan__ch10.yaml`、`docs/design/town/progress.csv`、`docs/design/town/done.txt`、`assets/default/town/city_luoyang__ch10/**`、`assets/default/town/city_taiyuan__ch10/**`、`packages/data/src/schemas/town.ts` 及其测试（仅在必要时）、报告。其余城与 `assets/default/baseline/**` 不碰。
- 磁盘规则（44daac2f）：ch10 的城保留全尺寸 town.png；每城 5 个核心文件，不留中间产物。
- 不改预算、门禁阈值；不加「高负载跳过」。

## 报告

`tools/agents/reports/TOOL-town-gaps-1.md`，按 `_common.md` 的格式；§3 写两城的检查输出（墙水相交格数前后对比、`check_town --strict-assets` 结果）与新错误码；§6 写哪些套件仍缺基线图、哪些年份标了待考；§7 逐条对照第 1–7 条。
