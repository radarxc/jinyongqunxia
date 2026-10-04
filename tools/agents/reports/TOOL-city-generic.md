# TOOL-city-generic 报告 · 城图工具 · 小城 / 遗址推定格局生成器（make_generic_city.py）+ 年代套件接入总装 + JPEG 预览 + 大理 / 临安基线墙水相交修复（AR-47 全量城图前置；traex GPT-5.6-Sol max）

## 1. 摘要（3–6 行）

新增确定性的 secondary / site 推定格局生成器，直接复用 `prod_plan.kit_for`，全量只校验覆盖 57 城、272 个城 × 年代单元、646 份章节规格且 0 invalid。
城图生成、检查、渲染已按 `era_kit` 叠加 11 套年代 manifest，并以可审计 `asset_substitutions` 回退基线；严格素材模式告警，发布模式仍阻断。
JPEG 可直接输出 RGB、默认 q85、透明区铺 `#faf8ef`；大理与临安仅增水门声明并重生成 layout，未重渲染或修改基线 PNG。
城图单测 135/135、指定检查与 ID 严格检查均通过；16 个 ch10 相对任务开始时代码输出 16/16 逐字节不变。

## 2. 产出（文件、行数、主要章节）

- 新增：`tools/town/make_generic_city.py`（331 行，选择城/年代带、模板、CLI）、`test_generic_city.py`（143 行，9 个生成器用例）。
- 修改：`assets.py`（524 行）、`bridge_assembly.py`（130 行）、`common.py`（643 行）、`check_town.py`（930 行）、`render_town.py`（650 行），完成套件发现/叠加、校准桥回退、规格检查与 JPEG。
- 测试/说明：`test_asset_adapter.py`（272 行）、`test_town.py`（725 行）、`README.md`（196 行）；覆盖套件叠加/回退、审计、JPEG 与残墙场域。
- 契约/基线：`schema.yaml`（378 行）扩充枚举；大理规格 285 行、临安规格 107 行；两份 layout 分别 54,487 / 121,472 行。

## 3. 关键结论与数值

- 规则：secondary 为 96×96、四面墙与 2–3 门；site 为 64×64、单段残墙与 0–1 门，草原/西域营地可无墙；街道为十字或丁字，水乡加 1 河 1 桥。
- 配置：官署、市场、寺观各 1；商业沿主街、住宅填余区；六类 `businesses` 各映射 1 座功能建筑。`basis` 固定为「推定格局（作者 2026-09-30：小城 / 遗址不做史料复原）」。
- 确定性：seed 由 `city_id + band` 派生；同城同带各章仅 `chapter_id` / `book_world` 不同；CLI 支持 `--city`、`--all`、`--importance`、`--band`、`--primary-chapter`、`--out`、`--check`。
- 全量 `--check`：48 secondary + 9 site = 57 城；272 单元、646 规格、0 invalid；分带为 northern_song 37、southern_song_jin_mongol 79、yuan 48、ming 140、qing_early 146、qing_middle 196。
- 分套件规格数：liao_jin_north 27、ming_north 51、ming_south 71、mongol 7、qing_north 133、qing_south 160、song_dali 6、song_north 11、song_southern 87、tubo 25、xiyu 26、yuan_north 18、yuan_south 24。
- 回退组 A：song_north、liao_jin_north、yuan_north、yuan_south、ming_north、qing_north、xiyu、tubo 原生候选含桥面/墙/墙角/城门；地面、土路、草、水、岸、路缘、桥栏回退基线，桥 SHA 未校准时整桥回退已校准基线。
- 回退组 B：ming_south、qing_south、mongol 原生墙/墙角/城门；地面、土路、草、水、岸、路缘、桥面、桥栏回退基线。11 套建筑 manifest 均有 19 类；只记录最终实际采用的替代。
- 资产语义：`--strict-assets` 对声明替代保留 warning；`--release` 对任何替代保持 error，防止候选素材误发布。哈密/西安均 0 error、8 warning。
- ch10：以任务开始时 HEAD 的生成器及依赖作对照，16/16 现生成结果逐字节一致；与仓库旧落盘布局比，洛阳/太原完全一致，其余 14 份仅上游既有 generator 1.4.0/rev6→1.5.0/rev7 元数据不同，移除 generator 后内容一致。
- 水门修复：大理增“桃溪西水门/桃溪东水门”，临安增“盐桥河北水门”；严格检查分别 0 error/15 warning、0 error/61 warning。建筑、道路、连接器、水面、桥与分区覆盖不变；layout SHA-256 为大理 `5a53217439f8063e41682263649b2c75e0ed0da656b7127008f92f98500de7ea`、临安 `1725aa05b2651933024b763a568841d7afc5f04cbba3c9c31b2891bfe54c9d0e`。
- JPEG q85：大理 1536×899、209,599 B；临安 2560×1280、464,040 B。均为 RGB JPEG、短边 ≥512、角像素 `(251,248,239)`（压缩后的 `#faf8ef`）、0 missing asset。

## 4. 开放问题（附默认值）

- 年代套件普遍缺地面/水/岸/路缘/桥栏，桥素材 SHA 尚未标定；默认继续候选态基线回退并写审计，发布检查阻断，待素材验收后解除。
- 大理/临安水门史实名与精确门址仍待考；默认保留本次按现有河道交点命名的最小声明，不据此扩写史料结论。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无；本任务实现既定作者需求与工具契约，不提议修改 `docs/00-canon.md`。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- 批量任务：先运行 `python3 tools/town/make_generic_city.py --all --importance secondary,site --check`；实际生成去掉 `--check` 并指定 `--out docs/design/town`，可用 `--band` / `--city` 分批，用 `--primary-chapter chNN` 选单章。
- 稀疏检出至少包含：`docs/design/map/cities.yaml`、`docs/00-canon.md`、`docs/design/town/schema.yaml`、`docs/design/22-town-layout-and-generation.md`、`tools/town/**`、`tools/agents/prod_plan.py`、两类 baseline manifest/资源，以及目标 `<kit>` 的 manifest 与其引用 PNG/meta/props。
- `docs/design/22-town-layout-and-generation.md`：补“小城/遗址推定模板”“`prod_plan.kit_for` 套件选择及 baseline 回退审计”“JPEG q85、浅底色、0.25 预览短边 ≥512”三段；本任务按写集约束未改。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 生成器：secondary/site/水乡、稳定 seed、同带逐章、六类业务、西域/吐蕃宗教与精确 basis 均有测试；`--check` 不落盘。
- ✅ 年代套件：11 个新键及旧枚举可用；tile/building-map 自动叠加、基线回退留痕，严格/发布语义已回归。
- ✅ JPEG：`.jpg/.jpeg`、默认/自定义 quality、RGB 浅底与尺寸实测通过；未改任何素材图。
- ✅ 大理/临安：仅改规格水门声明与两份 layout；未改建筑/道路等核心布局，未重渲染 PNG。
- ✅ 验收：town 单测 135/135；全量 646/646 规格有效；哈密、西安、大理、临安严格检查 0 error；`check_ids.py --strict` 退出 0（仅既有 `sk_babuganchan` 基线债务）。
- ✅ 回归/范围：16/16 ch10 字节回归通过；`git diff --check` 通过；改动均在授权写集内；最终 `utree flush` 退出 0。
