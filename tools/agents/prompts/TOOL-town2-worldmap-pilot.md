# 本任务：城镇探索 v2 · 大地图试点接线——用覆盖文件把三座试点城的场景入口（`entry.scene / gateId`）写进大地图

**第一个动作**：读 `tools/agents/reports/TOOL-town2-sources-pipeline.md` 与 `tools/agents/reports/ENG-town2-regionmap-ext.md` 的第 3、7 节（三个试点场景的 `regionId / sceneId`、城门 id；`MapEntry.scene` 字段形状），再打开 `tools/content/worldmap_from_towns.py`（大地图线的生成器；看它读 `docs/design/map/entry_overrides.yaml` 的那段：格式、允许字段、报错规则）与其测试 `tools/content/test_worldmap_from_towns.py`、`tools/content/worldmap_enrich.py`、`content/world/ch01/map.yaml` 与 `content/world/ch10/map.yaml` 里三个试点节点现在的 `entry`，以及 `docs/tech/15-town-explore-v2-spec.md` §2.1；读完直接动手，不要先写计划。

本任务写内容与一个小工具。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`。

## 背景
作者 AR-114（2026-10-10）：城镇并入区域引擎，每城一个区域场景。从大地图进城时，core 按节点的 `entry.scene`（`{ regionId, sceneId }`）挂载场景、按 `entry.gateId` 落在对应城门内侧出生点。`content/world/chNN/map.yaml` 是大地图线的生成器 `tools/content/worldmap_from_towns.py` 生成的（AR-111 / 112 / 113），**不能手改**——手改后 `--check` 会报漂移、下次重出会被冲掉。大地图线（10-11）已让生成器读覆盖文件 `docs/design/map/entry_overrides.yaml`：格式 `chNN → 节点 id → { 字段: 值 }`，只许写 `scene / gateId / spawn / accessNote`，未知章节 / 节点 / 字段直接报错，生成器把这些字段合并进该章节点的 `entry` 并在 map 的 `sources` 里登记这份文件。本任务只给三座试点城（大理 ch01、大理 ch10、吐鲁番 ch10）写覆盖，其他节点不变。

## 要做的事
1. **覆盖文件生成工具** `tools/content/town_scene_overrides.py`：读 `content/world/towns/*.yaml`（sources-pipeline 产出的 `town-source.v1`：`layoutKey`、`chapter`、`sceneId`、城门列表）与 `docs/design/map/cities.yaml`（`layoutKey` 的城市 → 大地图节点 id），生成 / 更新 `docs/design/map/entry_overrides.yaml` 里这三个节点的 `scene: { regionId, sceneId }`（形状以 regionmap-ext 定的 `MapEntrySchema.scene` 为准）与 `gateId`（缺省主城门——即该城现有 `entry.gateId`，一般是 `south_gate`；若改用别的城门，必须同时写该城门的 `spawn`，坐标取城市规格里那座城门内侧）。文件里已有的其他条目原样保留；重复运行幂等；按章节、节点 id 排序写出。
2. **重出大地图**：依次运行 `python3 tools/content/worldmap_from_towns.py` 与 `python3 tools/content/worldmap_enrich.py`，再运行两者的 `--check` 确认无漂移；提交重出后的 `content/world/ch*/map.yaml`（预期只有 ch01、ch10 的三个节点 `entry` 与 `sources` 变化——若其他章节也有字节变化，查明原因写进报告，不要手改回去）。
3. **测试** `tools/content/test_town_scene_overrides.py`（unittest）：三个试点节点写入的 `scene / gateId` 正确；已有的其他覆盖条目保留；重复运行输出逐字节相同；`town-source` 缺城门或节点映射失败时报错。

## 约束
- 只写：`tools/content/town_scene_overrides.py`、`tools/content/test_town_scene_overrides.py`、`docs/design/map/entry_overrides.yaml`、`content/world/ch*/map.yaml`（只能是生成器重出的结果，不许手改）与本任务报告。
- **不改** `tools/content/worldmap_from_towns.py`、`tools/content/test_worldmap_from_towns.py`、`tools/content/worldmap_enrich.py`（大地图线的工具；发现缺功能写进报告第 7 节）；不改 schema、core、app、大地图页面；不新增依赖。
- 沙箱里 `pnpm content:*` 若因 tsx socket 被拒跑不了，照实写进报告，交校验阶段跑；不要改 `node_modules`。

检查：
- `pnpm install --frozen-lockfile`
- `python3 -m unittest tools/content/test_town_scene_overrides.py tools/content/test_worldmap_from_towns.py`
- `python3 tools/content/worldmap_from_towns.py --check`
- `python3 tools/content/worldmap_enrich.py --check`
- `pnpm content:build`
- `pnpm content:validate`
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`

## 报告
`tools/agents/reports/TOOL-town2-worldmap-pilot.md`（≤ 40 行）：第 3 节列三个节点的 `entry` 改动前后、`gateId` 选取依据、重出后变化的文件与行数；第 7 节写给 ENG-town2-session-v2（会话按 `entry.scene` 预载哪个叶子）、P3 量产（以后批量给其余城镇写覆盖的方法）与大地图线（本任务只写了覆盖文件、没碰生成器）的交接。
