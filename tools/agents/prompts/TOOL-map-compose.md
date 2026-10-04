# 本任务：大地图 · 拼合生成器 + 样区：按地形图层与历史坐标摆放水墨贴图，固定种子扰动、密度与避让规则、时代图层沿用 design/19 §8；先出一块样区交作者过目（作者 AR-68 第 4 步）

本任务写拼合工具。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。不要调用任何技能。

先读：
- `docs/decisions/author-requirements.md` 的 AR-68；
- `docs/design/19-world-map.md`：§2 投影与画布、§7 水墨视觉规范、§8 图层与时代规则；
- 上游报告：`TOOL-map-terrain.md`（图层格式）、`ART-map-inkkit.md`（贴图集与 manifest）、`CONTENT-map-poi.md`（`pois.yaml` 字段）；
- `docs/design/map/*.yaml`：城市、门派、路线、区域、POI。

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

1. 生成器 `tools/map/compose/compose_map.py`：
   - 读地形图层、`assets/default/map/kit/` 贴图集、`design/map` 的坐标数据，按 design/19 §2 投影到画布；
   - 摆放规则：
     - 山脉沿脊线按体量取样；
     - 丘陵、平原按密度铺；
     - 水域晕染；
     - 聚落按四级、标记按类型摆在坐标点上；
     - 避让：聚落和标记不压山峰主体，标记之间留最小间距。
   - 所有随机扰动用固定种子，同一输入输出逐像素一致。
   - 时代图层沿用 design/19 §8：各书界只显示当时开放的城市、门派、路线。
   - `pois.yaml` 的置信度要在画法上区分。合入时共 30 条，其中低置信度 10 条：低置信度的不出精确标记，比如淡墨、不给点击半径，或只在区域图出现。具体做法你定，写进报告。
2. 输出：
   - 地图 PNG；
   - 标记坐标 JSON：每个可点击标记的 ID、类型、画布坐标、点击半径、书界开放，供游戏点击。
3. **先核对各区取景框**：出样区和区域图之前，核对 `docs/design/map/regions.yaml` 各区的取景框。
   - 交接已指出几处可疑：漠北只有 0.5°×0.5°；辽东东到 133E；东海诸岛、南海诸岛的取景框宽 2000–3000 km。
   - 发现异常就列进报告第 4 节交协调者定，**不要自己改 regions.yaml 的事实**。样区挑取景框正常的区。
4. **本轮只出样区**：大理（基线可对照）或关中，二选一。产物放 `assets/default/map/composed/sample/`，交作者过目；通过后另起任务出全图。
5. 测试：
   - 确定性：同一输入输出 hash 一致；
   - 避让规则；
   - 标记 JSON 的坐标与 design/map 经纬度投影一致。

## 约束

- 写集：`tools/map/compose/**`、`assets/default/map/composed/**`。写集外的改动在提交时会被丢弃。
- 不改上游数据与贴图集；缺的贴图品类在报告里列出，交 ART。
- 不得在 `/private/tmp` 做整仓检出（_common 规则 12）。

检查：以下命令必须全部通过。
- `python3 -m unittest discover -s tools/map/compose -p 'test_*.py'`
- `python3 tools/map/compose/compose_map.py --sample --check`

## 报告

≤ 50 行，写清：
- 摆放规则与参数；
- 样区产物；
- 标记 JSON 字段；
- 与基线的对照；
- 全图需要的后续工作。
