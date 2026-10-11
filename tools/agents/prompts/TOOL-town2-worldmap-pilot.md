# 本任务：城镇探索 v2 · 大地图试点接线——已编译的试点城镇场景写进大地图节点 `entry.scene / gateId`

**第一个动作**：读 `tools/agents/reports/TOOL-town2-sources-pipeline.md` 与 `tools/agents/reports/ENG-town2-regionmap-ext.md` 的第 3、7 节（三个试点场景的 `regionId / sceneId`、城门 id；`MapEntry.scene` 字段形状），再打开 `tools/content/worldmap_from_towns.py` 与其测试 `tools/content/test_worldmap_enrich.py`、`content/world/ch01/map.yaml`、`content/world/ch10/map.yaml`（节点的 `entry` 字段）与 `docs/tech/15-town-explore-v2-spec.md` §2.1；读完直接动手，不要先写计划。

本任务写代码（Python 工具）与内容。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`。

## 背景
作者 AR-114（2026-10-10）：城镇并入区域引擎，每城一个区域场景。从大地图进城时，core 按节点的 `entry.scene`（`{ regionId, sceneId }`）挂载场景、按 `entry.gateId` 落在对应城门内侧出生点；没有场景的节点 `scene: null` → 「城门紧闭」（P3 量产前，除试点外全部仍走 v1）。本任务只给三座试点城（大理 ch01、大理 ch10、吐鲁番 ch10）的节点写上场景引用，其他节点不变。注意大地图线（AR-111 / 112 / 113）也在维护 `content/world/ch*/map.yaml`：**只改这三个节点的 `entry` 字段**，其他内容逐字不动。

## 要做的事
1. `tools/content/worldmap_from_towns.py` 增加子命令 / 选项 `--town-scenes <清单>`：读 `content/world/towns/*.yaml`（sources-pipeline 产出）得到 `layoutKey → { regionId, sceneId, gates[] }`，把对应大地图节点的 `entry.scene` 写为 `{ regionId, sceneId }`、`entry.gateId` 写为离该节点道路来向最近的城门（规则写清；缺省主城门 `south_gate`）；未在清单里的节点：若已有 `entry.scene` 字段则保持，没有就不加（v1 兼容期 core 以缺省值处理）。
2. 对 `content/world/ch01/map.yaml`、`content/world/ch10/map.yaml` 运行一次，只改三个试点节点；用 YAML 往返保持原格式（注释、键序、缩进）不变——若现有工具的写回会重排格式，改为对这三处做最小文本补丁。
3. 测试 `tools/content/test_worldmap_from_towns.py`（unittest）：试点节点指向其场景且 `gateId` 合法；其他节点逐字节不变（对比改动前后文件除这三处外的行）；重复运行幂等。

## 约束
- 只写：`tools/content/worldmap_from_towns.py`、`tools/content/test_worldmap_from_towns.py`、`content/world/ch01/map.yaml`、`content/world/ch10/map.yaml`（各只改试点节点的 `entry` 字段）与本任务报告。
- 不改 schema、core、app、大地图页面与其他章节地图；不新增依赖（Python 标准库 + 已用的 PyYAML / ruamel，以工具现有 import 为准）。
- 沙箱里 `pnpm content:*` 若因 tsx socket 被拒跑不了，照实写进报告，交校验阶段跑；不要改 `node_modules`。

检查：
- `pnpm install --frozen-lockfile`
- `python3 -m unittest tools/content/test_worldmap_from_towns.py`
- `pnpm content:build`
- `pnpm content:validate`
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`

## 报告
`tools/agents/reports/TOOL-town2-worldmap-pilot.md`（≤ 40 行）：第 3 节列三个节点的 `entry` 改动前后与 `gateId` 选取依据；第 7 节写给 ENG-town2-session-v2（会话按 `entry.scene` 预载哪个叶子）与大地图线（本任务改了哪几行、以后量产怎么批量跑）的交接。
