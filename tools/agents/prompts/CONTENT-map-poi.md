# 本任务：大地图 · 历史坐标补全：以 design/map 现有城市、门派、路线、遗迹为准，补齐不足的城镇、遗迹、关隘的经纬度，注明来源与置信度，时期对上各书年代（作者 AR-68 第 3 步）

本任务整理地理数据。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读：
- `docs/decisions/author-requirements.md` 的 AR-68；
- `docs/design/19-world-map.md`：
  - §1.2 收录口径、§1.3 坐标精度与置信度、§1.4 历史地名与治所迁移；
  - §3 数据模型，含 §3.8 具名遗迹 POI 的 WGS84 锚点；
  - §6 路网、驿站、码头；
- `docs/design/map/cities.yaml`、`sects.yaml`、`routes.yaml`、`regions.yaml`：现有事实，**以它们为准**。

## 要做的事

1. 盘点 `design/map` 现有的城市、门派、路线、遗迹。对照各书书界的地图需求，找出不够的城镇、遗迹、关隘，比如书中提到、地图上没有落点的。
2. 按历史记录补经纬度（WGS84），每条写清：
   - ID（按 canon §12）、名称、类型（城镇 / 遗迹 / 关隘 / 村落 / 寺观等）；
   - `lat` / `lon`，精度按 design/19 §1.3；
   - 时期：对上的书界与年代；
   - 来源：文献或数据集的条目链接；
   - 置信度：高 / 中 / 低，并说明理由。
3. 数据优先用公开数据集，比如 Wikidata（CC0）。对外请求一律用通用 User-Agent，**不带作者个人标识**。原著没有的写（原创扩展），没把握的写（待考）。
4. 产出 `docs/design/map/pois.yaml`，格式沿用 design/19 的 JSON-compatible YAML。不改既有四份 yaml 的事实；发现既有数据有误的，写进报告第 6 节。

## 约束

- 写集：`docs/design/map/pois.yaml`。写集外的改动在提交时会被丢弃。
- 不编造坐标、引文、条目号。

检查：
- `pois.yaml` 能被 YAML 解析；
- 每条都有 `id`、`name`、`kind`、`lat`、`lon`、`chapters`、`source`、`confidence`；
- 坐标落在 design/19 §2.1 的范围内。

## 报告

≤ 40 行，写清：
- 补了多少条，按类型、书界分列；
- 置信度分布；
- 数据源；
- 交 TOOL-map-compose 的字段说明。
