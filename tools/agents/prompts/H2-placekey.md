# 本任务：39 个传承缓存的精确 `placeKey` 考据与登记

`design/20` 的 39 个传承源当前只有区域级 `locationHints`，F2 要求"逐项核书目与历史地理后补精确点位；不能按名称或现代坐标猜"。本任务逐项考据并把可确认的点位登记进地图数据；不能确认的保留区域级提示并写清缺什么证据。

## 必读

- `docs/design/20-legacy-inheritance.md` §4–§6（39 源、缓存、`locationHints`、`placeKey` 字段定义）；`docs/design/19-world-map.md` §3（YAML 字段、`placeKey` / `city_*` / 特殊点 `special` 的写法与投影）；`docs/design/map/cities.yaml`、`regions.yaml`、`routes.yaml`（`special` 节点）；`tools/map/render_map.py --check` 的校验规则。
- 各源所属书界的 `docs/design/chapters/NN-*.md` §3（地图）与 `story/NN`；`docs/design/02-timeline-and-world-tiers.md` §6（传承链、藏史古迹）。
- 考据基线：三联 / 广州修订版；历史地理以正史地理志、方志为准。可联网检索，但**只接受能给出书目 / 卷 / 回目或权威地理来源的结论**；网络百科与影视地名不算证据。

## 要做的事

1. 列 39 源清单（源 ID、所属书界、原著依据、现有 `locationHints`）。
2. 逐项判定：`confirmed`（原著明确地望 + 历史地理可定位，给出证据与坐标 / 所在 `city_*` 或新增 `special` 点）、`regional`（只能到区域，写缺什么）、`fictional`（原著虚构地名，按 19 的虚构地名规则挂到最近史实锚点并标**（原创扩展）**）。
3. 把 `confirmed` 与 `fictional` 的点位写入 `docs/design/map/*.yaml`（沿用现有字段与时代图层；新增 `special` 点需在 19 §3 允许的结构内），并把 `placeKey` 回填到 `design/20` 各源；`regional` 只更新 `locationHints` 措辞。
4. 每项在 `design/20` 的考据表中记录：证据（书 / 回目 / 地理来源）、判定、`placeKey`、（待考）标记。

## 验收标准

- `python3 tools/map/render_map.py --check` 通过（城市 189、门派 99、图外 3 不变，`special` 可增加）；`python3 tools/map/render_map.py --render` 成功且确定性（两次渲染 SVG 相同）。
- `python3 tools/lint/check_ids.py --strict` 通过；`design/20` 39 源每源有判定行；`confirmed` 数量与证据在报告第 3 节。
- 不得为了"全部确认"而编造地望；`regional` 允许存在。
