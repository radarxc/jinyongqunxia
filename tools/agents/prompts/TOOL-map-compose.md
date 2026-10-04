# 本任务：大地图 · 拼合生成器 + 样区：按地形图层与历史坐标摆放水墨贴图，固定种子扰动、密度与避让规则、时代图层沿用 design/19 §8；先出一块样区交作者过目（作者 AR-68 第 4 步）

本任务写拼合工具。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。不要调用任何技能。

先读：
- `docs/decisions/author-requirements.md` 的 AR-68；
- `docs/design/19-world-map.md`：§2 投影与画布、§7 水墨视觉规范、§8 图层与时代规则；
- 上游报告：`TOOL-map-terrain.md`（图层格式）、`ART-map-inkkit.md`（贴图集与 manifest）、`CONTENT-map-poi.md`（`pois.yaml` 字段）；
- `docs/design/map/*.yaml`：城市、门派、路线、区域、POI。

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
2. 输出：
   - 地图 PNG；
   - 标记坐标 JSON：每个可点击标记的 ID、类型、画布坐标、点击半径、书界开放，供游戏点击。
3. **本轮只出样区**：大理（基线可对照）或关中，二选一。产物放 `assets/default/map/composed/sample/`，交作者过目；通过后另起任务出全图。
4. 测试：
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
