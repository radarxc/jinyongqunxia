# TOOL-town-gaps-1 报告 · 城镇工具缺口第一批 · 声明式水门、多重城垣 / 共用内隔墙、未声明墙水相交检查、plan_view 页眉按城、cities.yaml 庭州键与 ch10 年代带、唐 / 西域 / 吐蕃套件进 schema；用洛阳、太原重跑管线验证（CITY 审核 r2 的工具缺口）

## 1. 摘要（3–6 行）
已补齐声明式水门、具名多城垣 / 共用内隔墙、`walls: none` 无墙营地、逐格未声明墙水相交检查与按城 history 页眉。
`tang`、`xiyu`、`tubo` 已进入规格及运行时套件枚举；缺专用贴片时显式回退并留替代记录，没有新增或伪造唐代基线图。
洛阳、太原已用 `town-gen 1.5.0` / `algorithm_revision=7` 重跑完整管线，墙水缺口分别由 18 / 24 格降至 0，严格素材检查均 0 error，状态恢复为 `candidate`。
两城目录均收敛为 5 个核心文件；Python、TypeScript、data 测试和 ID 严格检查通过。
任务原文的资产命令按 manifest 图片条目要求每城 `5..5`，实测 16 城均只有 1 条而退出 1；该项尚未通过，且其中 14 城不在本任务写集。
本轮返修只更新本报告的验收口径与实测输出；实现、规格及两城图片均未改动或重生成。

## 2. 产出（文件、行数、主要章节）

| 路径 | 行数 / 产物 | 主要内容 |
|---|---:|---|
| `tools/town/common.py` / `check_town.py` / `schema_check.py` | 603 / 913 / 256 | 多墙归一化、所属墙开口、无墙域、门归属、`TOWN_WALL_WATER_UNDECLARED`、严格 schema |
| `tools/town/assets.py` | 388 | 三套件显式回退；只对 sparse-checkout 标记 `S` 的受跟踪文件回读 Git 索引 blob |
| `tools/town/gen_layout.py` / `roads.py` / `placement.py` | 218 / 224 / 402 | 生成器升至 1.5.0 / revision 7；无墙营地主轴导航根；多墙门入口映射 |
| `tools/town/render_town.py` / `plan_view.py` | 639 / 383 | 多墙去重总装、水门门楼叠连续水面、水门 overlay；按显式引用或稳定命名取 history |
| `tools/town/README.md` | 177 | 水门、多墙、无墙、套件回退、页眉及 sparse-checkout 规则 |
| `tools/town/test_town.py` / `test_plan_view.py` / `test_asset_adapter.py` | 693 / 117 / 178 | 水门正反例、多墙共墙、门归属、无墙管线、套件回退、按城页眉及 sparse blob 回归 |
| `docs/design/town/schema.yaml` / `cities.yaml` | 378 / 25 | `NamedWallSpec`、`WaterGateSpec`、新套件；ch10 与庭州的白名单内原子修正包 |
| `docs/design/town/city_luoyang__ch10.yaml` / `city_taiyuan__ch10.yaml` | 68 / 71 | 洛水两水门；晋阳三闭合墙环、共用隔墙联络门、汾河南北水门 |
| `docs/design/town/progress.csv` / `done.txt` | 2368 / 23 | 两城改 `complete_candidate`；旧页眉 / 工具阻断改记已解决，庭州登记合入边界保留 |
| `packages/data/src/schemas/town.ts` / `town.test.ts` | 83 / 13 | 导出 `TownEraKitSchema`，运行时接受三新套件并拒绝未知套件；几何仍不进入 runtime |
| `assets/default/town/city_luoyang__ch10/` | 5 个核心文件 | layout 109194 行、preview 5120×2560、town 10240×5120、overlay 24241 行、manifest 39 行 |
| `assets/default/town/city_taiyuan__ch10/` | 5 个核心文件 | layout 76704 行、preview 5120×2560、town 10240×5120、overlay 37367 行、manifest 40 行 |

两目录已删除旧日志、stats、render JSON、QA 等中间物，只保留 `layout.yaml`、`preview.png`、`town.png`、`overlay.svg`、`manifest.yaml`。两份 manifest 均保留协调者 10-03 05:32 的 `rejected` 历史说明，当前 `status` 为 `candidate`。

## 3. 关键结论与数值

水门是独立的 `WaterGateSpec`：必须声明 `wall_ref`、锚点、方向、孔宽及种类；只从所属墙环扣孔，水面不转陆地。普通门仍适用 `TOWN_GATE_ON_WATER`，水门改校验锚点 / 通行孔确在所属墙水交界。多墙重合格以集合并集只渲染一次；普通门及水门均校验所属墙。

新错误码为 `TOWN_WALL_WATER_UNDECLARED`。校验器按每个墙环计算 `墙格 ∩ 水格 − 该墙已声明水门孔`，每个遗漏坐标报一条错误，消息同时带总数量；因此重合墙环不能被另一道墙的水门误开。

| 城市 | 修复前墙水交格 | 声明 | 最终 `--strict-assets` | 未声明墙水交格 |
|---|---:|---|---:|---:|
| 洛阳 | 18 | 外城洛水西 / 东水门各 1 | 0 error / 57 warning | 0 |
| 太原 | 24 | 西 / 中 / 东 3 墙环；中城汾河南 / 北水门各 1 | 0 error / 83 warning | 0 |

全部 warning 均为 `TOWN_ASSET_SUBSTITUTION`，没有缺件错误。回退表为 `tang -> song_southern`、`xiyu -> song_dali`、`tubo -> song_dali`；开发 / candidate 严格素材检查记录 warning，release 仍把替代视为 error。无专用水门贴片时使用同套件回退后的城门构件，但墙孔下的水面保持连续。

| 生成统计 | 洛阳 | 太原 |
|---|---:|---:|
| 建筑 / 道路格 / 水格 | 82 / 3681 / 960 | 36 / 1786 / 942 |
| planning 可走 / runtime hex 可走 | 13468 / 10556 | 6087 / 4639 |
| 道路分量 / required 缺口 | 1 / 0 | 1 / 0 |
| layout SHA-256 | `d8276670fabf550fdbb6da859541b8ec7df4f8c9f3a2bdd68cb723e24dfc6a72` | `02db7ba911b5ba6dca1f62fcaee31ad6e0a529a5c09fba1579b62a702838ccc9` |
| preview SHA-256 | `a8b67973af28f6a3c2f731b1f7756651d6ee680b25a11ed55d69a7cf09c95056` | `2477f56d2c97a13d31204abdf8fb4e46ed69fd57248ee5e8c981b5a2e407ab4f` |
| town SHA-256 | `54703659c5dac9fd52890b5469994860df0899bbbc153f9cab022f877b0639e1` | `1f6096b487c0a8c3a2d87c2057c8194dd36116fc3bb6d1089a7614eaf25f80ee` |

两次渲染报告均为 `diagnostic=false`、`missing_assets=[]`、renderer `warnings=[]`；preview 为 0.5 倍，town 为全尺寸 1 倍。平面图实测页眉分别为 `history/city_luoyang__tang_702.md`、`history/city_taiyuan__tang_702.md`，不再落到 `history/linan.md`。

ch10 修正包登记 `year: 702`、`end_year: 703`、`band: tang_702`，与基准 v1.10 一致；庭州稳定键为 `city_tingzhou`。该文件声明权威来源仍是 `docs/design/map/cities.yaml`，避免在 town 目录制造第二份城市总表。

任务原文资产验收命令未改写：

```text
python3 tools/agents/check_asset_dirs.py "assets/default/town/city_*__ch10" --min 5 --max 5 --min-side 1024
```

2026-10-03 本轮实测退出 1。匹配的 16 城均为“图片 1 张，条目 1 条，问题 1 个”，失败原因都是 `图片条目 1 张，要求 5–5 张`。`check_asset_dirs.py` 会转调 `check_assets.py`，而后者的 `--min/--max` 明确统计 manifest 内 `png/jpg/jpeg/webp` 图片条目，不统计目录文件。两城目录核心文件另以原样 `ls` 核验：

```text
$ ls assets/default/town/city_luoyang__ch10 assets/default/town/city_taiyuan__ch10
assets/default/town/city_luoyang__ch10:
layout.yaml
manifest.yaml
overlay.svg
preview.png
town.png

assets/default/town/city_taiyuan__ch10:
layout.yaml
manifest.yaml
overlay.svg
preview.png
town.png
```

故洛阳、太原均恰有 5 个核心文件，同时各 manifest 合法登记 1 张 preview；这两条事实不能令 `--min 5 --max 5` 通过。其余 14 城也各只有 1 个图片条目且不在本任务写集；本轮未复制图片、未伪造 manifest 条目、未越界修改检查器或其他城。需协调者正式修订验收命令，或另开有权修改全部 16 城资产契约的任务。

## 4. 开放问题（附默认值）

1. 唐代、西域、吐蕃以及专用水门基线图仍缺。默认继续按上述显式表回退、manifest 留痕、维持 `candidate`；不得将宋类替代图称为唐代考古复原。
2. `docs/design/town/cities.yaml` 只是本任务白名单内修正包，权威总表尚未合入。默认消费方继续以 `docs/design/map/cities.yaml` 为准，合入前不生成庭州 CitySpec。
3. 白马放在 702–703 年是作者原创扩展；原著并未明定唐朝。默认沿用基准日期并保留“原著年代待考”；太原 / 洛阳的具体 702 墙线、门名、坐标继续按各规格中的（待考）/ 推定边界解释。
4. 资产验收口径仍冲突。默认不伪造重复 manifest 条目、不复制图片、不越界修改其余 14 城；在协调者正式修订命令或扩大写集前，原 `--min 5 --max 5` 项保持未通过（见 §3）。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| 无 | 本任务不修改基准 | 白马 702–703 年已由基准 v1.10 / AR-26 定案；水门、多墙、套件回退属于城镇规格与工具契约，不需要重复定义到基准。 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 位置 | 需同步内容 |
|---|---|
| `docs/design/map/cities.yaml` ch10 与城市表 | 合入修正包：702–703、`tang_702`、`city_tingzhou`；庭州 702 年升置北庭都护府及旧庭州 / 西延城同期范围仍标（待考）。 |
| `docs/design/22-town-layout-and-generation.md` 数据 / 生成 / 校验章节 | 补 `walls`、`walls: none`、`wall_ref`、`water_gates`、按墙水交集校验及 1.5.0 / revision 7。 |
| `docs/tech/07-asset-generation.md` 城镇一节 | 补三套件回退、专用水门缺图回退、candidate / release 差异和 sparse-checkout 受跟踪 blob 读取边界。 |
| 两城 `history/city_*__tang_702.md` | 将“水门 / 多墙 / 页眉未解决、partial_candidate”改为已解决并引用本次结果；这些 history 文件不在本任务写范围。 |
| `assets/default/baseline/**` / 后续美术任务 | `tang`、`xiyu`、`tubo` 仍缺专用基线图，专用水门构件亦缺；本任务只登记 schema 与回退，未伪造素材。 |
| 伊宁后续城镇任务 | 工具现已放行 `walls: none` 与 `xiyu`，但帐篷基线、伊宁规格和成图仍未交付。 |
| 调度器资产验收命令 / 写集 | 原命令按 manifest 图片条目要求 16 城各 5 张，但目录约束说每城 5 个核心文件；请正式修订验收口径，或扩大写集并明确 5 张真实图片各自的资产身份。 |

年份 / 分期待考项：白马原著年代本身待考；庭州在 702 年的旧庭州、西延城与北庭同期范围待考；太原三城及洛阳各墙门的精确 702 层位、坐标和部分门名待考。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

1. ✅ 声明式水门：schema、生成 / 渲染、所属墙开口、连续水面、门楼回退、普通门压水规则及新未声明相交错误均落地；正反测试通过。
2. ✅ 多重城垣 / 共用内隔墙 / 无墙营地：具名闭合墙环、重合去重、门归属、无墙主轴根与最简无墙渲染均实现并有测试。
3. ✅ `plan_view` 页眉：显式 references 优先、稳定命名回退、旧大理 / 临安兼容；洛阳回归及两城实际平面图页眉通过。
4. ✅/⚠️ 城市登记：白名单内修正包已登记 `city_tingzhou` 与 ch10 702–703 / `tang_702`；权威地图总表范围外，已列 §6，同期细节保留（待考）。
5. ✅ 套件：规格和 runtime 接受 `tang` / `xiyu` / `tubo`，未知值拒绝；显式缺图回退留痕，未新增 baseline。`pnpm --filter @tianshu/data test` 为 12 files / 149 tests，包内 typecheck 退出 0。
6. ✅ 两城验证：layout → plan → preview 0.5 → full town → overlay → manifest 全部重跑；两城 strict-assets 0 error、未声明墙水相交 0，已目检，manifest `candidate` 且保留 05:32 历史 note；progress / done 为完成候选。
7. ⚠️ 测试与资产验收：`python3 -m unittest discover -s tools -p "test_*.py"` 为 33/33，town 专项 118/118，data 12 files / 149 tests，`pnpm --filter @tianshu/data typecheck` 与 `check_ids.py --strict` 均退出 0；但任务原文 `check_asset_dirs.py ... --min 5 --max 5 --min-side 1024` 退出 1，16 城均只有 1 个 manifest 图片条目。洛阳、太原目录各有 5 个核心文件，不能替代图片条目门禁；该项未勾选通过，需协调者处理 §4 / §6 所述口径与写集冲突。

附加自检：所有目标 YAML 可解析；`git -c core.whitespace=cr-at-eol diff --check` 通过（`progress.csv` 延续既有 CRLF）；改动仅在任务白名单路径；未执行改变仓库状态的 git 命令。
