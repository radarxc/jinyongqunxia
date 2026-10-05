# 本任务：大地图 · 地形数据：下载公有领域 DEM，叠加 Natural Earth 海陆 / 河 / 湖，按 design/19 的 Albers 投影与画布分出地形图层，输出可复跑脚本、图层数据与预览图（作者 AR-68 第 1 步）

本任务写数据处理脚本。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。不要调用任何技能。

先读：
- `docs/decisions/author-requirements.md` 的 AR-68（作者原文与协调者口径）；AR-60（允许直接下载公开数据）。
- `docs/design/19-world-map.md`：
  - §0.1 文件契约；
  - §2 范围、投影与比例尺：§2.3 Albers 正算公式、§2.4 投影坐标到画布、§2.5 测试向量、§2.6 可配置画布；
  - §7 水墨视觉规范；
  - §9 地理几何与来源处理。
- `tools/map/render_map.py`：现有 Albers 投影、Natural Earth 数据的读取方式、确定性抖动。本任务复用它的投影与画布，不另造一套。

## 参考与质检工具：Gemini 出图员的数据侧交接（协调者 10-03 20:45；能复用就复用，不要从零再写）

交接文档：`/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/gemini_qa/maps/HANDOFF_CODEX.md`，机器可读的区域数据在同目录 `region_frames.json`，脚本都在 `/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/gemini_qa/maps/`。这些文件在 `.agents/` 下，不入库，只读引用。内容：
- 数据源与 sha256：SR_HR 晕渲、Natural Earth 10m 海陆 / 湖泊 / 河流，`ne.py` 是无第三方库的读取器，带缓存。
- Albers 正反算：`basemap.py` 的 `frame(rid)` / `proj`，`basemap_sr.py` 的 `inv`。
- v4 起伏度底图的算法与命令：`basemap_sr2.py --rugged all`，产物在 `basemaps_sr4/`。
- 叠图质检 `overlay2.py` 及其及格线：河道重合率、海域 IoU、湖面命中、凭空水面。`qa5.py` 一条命令跑完。
- 30 区范围表。
- 易错地形提示：黄河改道、湖泊变迁等，见交接文档第 7 节。

要求：
- 投影、NE 读取、起伏度能用交接里的实现，就复制进写集再用，并在报告注明出处；不另写一套。
- 图层与成品用 `overlay2.py` 的及格线做质检，结果写进报告。
- 和 design/19 §2 的公式或测试向量不一致时，以 design/19 为准，并把差异列进报告。

## 要做的事

1. **数据**：
   - 下载公有领域 DEM，ETOPO 2022 或 GMTED2010 30″ 二选一，取能覆盖 design/19 §2.1 地理范围的最小切片；
   - 放到 `/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/geodata/`，**不入库**；
   - 报告里写清来源 URL、许可、文件名与 sha256。
2. **分层**：按 design/19 §2 的 Albers 投影和画布，从 DEM 加 NE 海陆 / 河 / 湖分出以下图层：
   - 山脉脊线（折线，带相对高度与走向）；
   - 丘陵；
   - 高原；
   - 盆地与平原；
   - 水域（海、湖、主要河流）。
   阈值与平滑参数写成配置，报告里给出取值理由。
3. **输出**（全部可复跑、确定性）：
   - 脚本：`tools/map/terrain/build_terrain.py`，支持 `--check` 只校验不写；
   - 图层数据：`tools/map/terrain/layers/*.json`，坐标为画布坐标，精度按 design/19 §1.3，总大小 ≤ 15 MB；
   - 预览图：`tools/map/terrain/preview/*.png`，全图一张、大理与关中局部各一张，总大小 ≤ 6 MB。
4. 不改 `docs/design/map/**` 的城市、门派、路线、区域事实，不改 `render_map.py` 的既有输出。
5. **测试**：`tools/map/terrain/test_*.py`：
   - 投影测试向量与 design/19 §2.5 一致；
   - 图层闭合、无自交；
   - 同一输入输出 hash 一致。

## 约束

- 写集：`tools/map/terrain/**`。写集外的改动在提交时会被丢弃。
- 只用标准库，以及仓库已在用的 numpy / Pillow；要新 Python 依赖的话，在报告第 4 节说明，并给出不用它的退路。
- 不得在 `/private/tmp` 做整仓检出（_common 规则 12）。

检查：以下命令必须全部通过。
- `python3 -m unittest discover -s tools/map/terrain -p 'test_*.py'`
- `python3 tools/map/terrain/build_terrain.py --check`

## 报告

≤ 50 行，写清：
- 数据源与许可；
- 分层规则与参数；
- 图层清单与大小；
- 预览图；
- 交 TOOL-map-compose 的接口：图层文件格式、坐标系。
