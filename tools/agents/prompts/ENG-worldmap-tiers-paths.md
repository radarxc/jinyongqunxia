# 本任务：游戏工程 · 大地图第二轮：道路显示几何、城镇分档图标、名城小景接入（AR-113）

**第一个动作**：打开 `docs/tech/13-worldmap-painted.md` 读 §5（契约，以它为准），再打开 `packages/data/src/schemas/world-map.ts`。不要先写计划，读完直接动手；改完一处就跑对应测试。

## 工作区与纪律（务必遵守，与上一轮 ENG-worldmap-painted-2d 相同）

- 你在**主检出** `/Users/bytedance/Projects/jinyongqunxia` 里直接改。这里有大量别人未提交的改动，作者的开发服务器（5173）从这里热更新；另有两个出图子代理同时在写 `tools/map/paint/**`、`docs/design/map/road_paths.json`、`assets/default/map/**`——这些你只读不写。
- **只改下面「写集」里的文件**；写集外一个字都不要动。
- **不执行任何改变仓库状态的 git 命令**；`git diff` / `git status` 只读可以用。
- 不加依赖，不改 `package.json` / `pnpm-lock.yaml`，不改 `packages/core/**`、`packages/render/**`。
- 不得放宽、跳过或改写任何已有断言；测试失败如实报告。不要停下来提问，按 tech/13 §5 的意图自己定，并写进报告。

## 为什么做

作者 AR-113（2026-10-11，逐字）：

> 道路按真实道路渲染（现在是直线看起来不合理）
> 城镇要有大中小概念，有名的城市要带上城市标志建筑（按年代，画风要和整体水墨一致），西安，长安，北京等要按照布局特点给渲染图

底图已是 GIS 合成的整张水墨图（`assets/default/map/world/`），2D 页面已就绪（`apps/game/src/pages/WorldMapPage.vue` + `apps/game/src/worldmap/painted-view.ts`）。本任务把三样东西接上：真实走向的道路显示几何、分档城镇图标、按年代的名城小景。道路几何与小景、图标图集由出图线产出（可能比你晚到）——**代码不要等素材**：缺 `road_paths.json` 时道路画 `points`，缺图集时退回现有 `/img/ui_map_city.png`，缺 `index.json` 时不画小景。

## 要做的事

1. **数据 schema**（`packages/data/src/schemas/world-map.ts` + 同目录或 `packages/data/src/world-map-schema.test.ts`）：
   - 路段加可选 `path`：2–4096 个有限浮点坐标对；校验首点 / 末点与 `start` / `end` 节点 `point` 相等（容差 1e-6）。
   - 节点加可选 `tier: 'capital' | 'major' | 'minor' | 'site'` 与 `marker: 'city_large' | 'city_prefecture' | 'city_county' | 'village' | 'pass' | 'ruin' | 'sect' | 'temple' | 'daoist'`。
   - 只加可选字段，不改已有字段与校验；补正反用例。
2. **内容补写脚本** `tools/content/worldmap_enrich.py`（新建，确定性，带 `--check`：只校验不写）：
   - 读 `content/world/ch01..ch14/map.yaml`（pretty JSON，`indent=2, ensure_ascii=False`，无末尾换行——写回必须保持同一格式，未改动的文件逐字节不变），按 tech/13 §5.2 从 `docs/design/map/cities.yaml` 给每章节点写 `tier` / `marker`（`rs_*` 等非城市节点按 kind 与 id 前缀判断，判据写进脚本注释）；若存在 `docs/design/map/road_paths.json` 且其中有该 `road.key`，写入 `path`（校验首末等于节点坐标，不等则报错退出）。
   - **不改 `revision`**（存档以它校验地图身份）、不改其它字段、不改节点 / 路段顺序。
   - 补 `tools/content/test_worldmap_enrich.py`（`python3 -m unittest`）：分档规则、格式往返、路径首末校验、`--check` 幂等。
   - 跑一遍把 14 章写好（此时若 `road_paths.json` 还没有，就只写 `tier` / `marker`；协调者之后会再跑一次补 `path`）。
3. **纯函数**（`apps/game/src/worldmap/painted-view.ts` + 测试）：
   - `smoothPathD(points, image)`：Catmull-Rom → 三次贝塞尔的 SVG 路径字符串（张力 0.5，端点固定，2 点退化为直线）；
   - `pointAlongPath(path, fraction, reverse)`：按弧长插值（fraction 夹在 [0,1]）；
   - `markerSize(tier, z)`：tech/13 §5.2 的区间线性插值；标签避让优先级先按 tier（capital > major > minor > site）再按原规则；
   - `landmarkForNode(index, nodeId, chapter)`：从 index 里选适用当章的小景（多条时取 id 字典序第一）。
4. **页面** `apps/game/src/pages/WorldMapPage.vue`：
   - 道路：有 `path` 画平滑曲线，否则画 `points` 折线；样式不变。
   - 主角显示位置：行进中（`journey.status` 为 walking / paused / encounter 且能找到当前 leg 的路段）按 `offsetLi / distanceLi` 沿该路段 `path`（或 `points`）插值，方向按 leg.from→leg.to；否则用 core 的 `point`。跟随、朝向翻转改用这个显示位置。
   - 城镇：按 `marker` 从图集 `assets/default/map/markers/atlas.json` + `map_markers_atlas.webp` 取图标（CSS 背景定位），尺寸按 `markerSize`；名字字号按 tier；缺图集退回现有图标。
   - 名城小景：页面载入一次 `/assets/default/map/landmark/index.json`（404 / 解析失败就当没有），有小景的开放节点在**地图平面内**（与底图同一变换）画小景，按 `footprintGrid` 换算宽度、`anchor` 对准节点，屏幕宽度下限 56 px（低于时用 CSS 反向放大）；该节点不再画图标；名字放在小景下方。
   - 空闲零逐帧、单一 transform、标签按需重算这些上一轮约定不能破。
5. **构建**（`apps/game/build/asset-manifest.ts` + 测试）：`consumed` 加 `/map/markers/`、`/map/landmark/`；landmark 条目按 manifest 复制进 public，并生成 `apps/game/public/assets/default/map/landmark/index.json`（字段见 tech/13 §5.3，url 以 `/assets/default/...` 开头，`width` / `height` 取图片实际像素）；markers 目录把图集与 `atlas.json` 一并复制。`status: rejected` 的条目跳过。
6. **测试**：`painted-view.test.ts` 覆盖平滑端点、弧长插值（含反向、0/1 端点、退化路径）、尺寸插值、优先级、小景选择；`worldmap-page.test.ts` 加：有 `path` 时道路 d 含曲线命令、主角在路段中点时显示在 `path` 中点附近、有小景的节点不出图标。

## 写集

`packages/data/src/schemas/world-map.ts`、`packages/data/src/world-map-schema.test.ts`、`tools/content/worldmap_enrich.py`、`tools/content/test_worldmap_enrich.py`、`content/world/ch01..ch14/map.yaml`（只经由脚本写）、`apps/game/src/worldmap/**`、`apps/game/src/pages/WorldMapPage.vue`、`apps/game/src/runtime/worldmap-page.test.ts`、`apps/game/build/asset-manifest.ts`、`apps/game/build/asset-manifest.test.ts`，以及报告 `tools/agents/reports/ENG-worldmap-tiers-paths.md`。其余一律不动。

## 检查（全部通过才算完）

- `python3 -m unittest tools/content/test_worldmap_enrich.py`；`python3 tools/content/worldmap_enrich.py --check`
- `pnpm content:validate`
- `pnpm exec vitest run --config vitest.workspace.ts --project node packages/data apps/game/src/worldmap apps/game/src/runtime apps/game/build`（`apps/game/build/dressup-assets.test.ts` 两条缺 `meshoptimizer` 的失败是已知的写集外问题，照实写，不要去修）
- `pnpm typecheck`
- `pnpm exec eslint --max-warnings 0 <你改过 / 新建的每个 TS / Vue 文件>`

## 报告

写到 `tools/agents/reports/ENG-worldmap-tiers-paths.md`，≤ 40 行：改了哪些文件各多少行；分档与 marker 判据及各档节点数（ch01 / ch10 两章）；`path` 是否已写入（几条）；主角沿 path 插值的实现位置；三类回退（无 path / 无图集 / 无 index）如何验证；各检查命令原样结果；与 tech/13 §5 不一致处及理由。
