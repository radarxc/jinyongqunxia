# tech/13 · 大地图：整张水墨底图 + 2D 叠加（AR-111）

> 上游：作者 AR-111、AR-112（2026-10-10）；几何与坐标归 `design/19` §2、§9；网格与节点归 `content/world/chNN/map.yaml`（`worldmap.v1`）。
> 本文取代 render `ENG-08` 大地图 2.5D 方案中的地形、海面、欧亚大陆贴图与「地图主角用 rig」两条；寻路、里程、城门、开放判定仍全在 core，不变。

## 0. 结论先行

1. 大地图底图是**一张离线画好的 4:3 水墨山水图**，正好覆盖内容网格 `[0,512]×[0,384]` 全幅；图上无字、无城镇、无道路。底图由确定性合成器 `tools/map/paint/compose_world.py` 用 GIS 数据加仓库现有水墨贴图直接画出（AR-112，不用 AI 重画）。
2. 运行时是 **2D 平面**：底图图片 + SVG 道路 + 屏幕空间的城镇标签、主角立牌和目的地标记。没有旋转、没有 WebGL、没有贴图拼合。
3. 拖动与缩放夹在图内（金庸世界范围），最小缩放 = 铺满视口。
4. 素材键 `map_world_jianghu__base01`，文件 `assets/default/map/world/map_world_jianghu__base01.webp`。正式图替换临时占位时同名同键，代码不改。

## 1. 坐标

- 网格投影：`tools/map/render_map.py::CanvasProjection(512, 384, margin=18)`（Albers 25N/47N/105E，范围 73–135°E、18–54°N 按 x 方向贴满、居中）。节点 `point`、道路 `points` 都是这套整数网格坐标。
- 底图 `W×H` 必须严格 4:3。图像像素 = 网格 × `W/512`（纵向 × `H/384`）。出图时用 `CanvasProjection(W, H, margin=18·W/512)` 画底稿，它与网格只差整体缩放 `W/512`。
- 运行时读图片 `naturalWidth / naturalHeight` 换算，**不写死尺寸**；宽高比偏离 4:3 超过 0.5% 视为坏图，显示错误提示并退回纸色底。

## 2. 素材契约

| 项 | 要求 |
|---|---|
| 位置 | `assets/default/map/world/<id>.webp`，同目录 `manifest.yaml` 一条；字段按 `assets/README.md`，另加 `extent_grid: [0, 0, 512, 384]` |
| 尺寸 | 正式图 ≥ 4096×3072（目标 4800×3600）；WebP，质量约 85，单文件 ≤ 8 MiB |
| 内容 | 海陆、岸线、湖泊、主要河流、山脉 / 高原 / 沙漠 / 草原 / 平原的水墨表现；海面与山川同一套笔墨（淡青洗染 + 水纹）；日本、朝鲜、台湾、海南等岛屿按高程画山 |
| 禁止 | 任何文字、伪字、印章、题跋；城镇 / 城墙图标；道路；现代国界；画框卷轴 |
| 对齐 | 海陆直接取 GIS（Natural Earth 10m 陆地 / 小岛 / 湖泊），岸线天然对齐；所有开放节点落在画出的陆地上（海岛节点按 design/19 §9.2 岸线容差） |
| 出图 | `tools/map/paint/compose_world.py`：固定种子，同输入逐字节同输出；笔墨只取 `assets/default/map/kit/`、`assets/default/map/tiles/` 与两张已审基线图抠出的山体印章；山按 ETOPO 高程与起伏度落点，河流按 scalerank 阈值取舍 |
| 构建 | `apps/game/build/asset-manifest.ts` 把 `/map/world/` 下 `map_world_` 前缀条目登记为 `map` 键并复制进 `apps/game/public/assets/default/map/world/` |
| 选用 | `session-projection` 依次取 `map_world_jianghu__<era>`、`map_world_jianghu__base01`，都没有时用固定路径 `/assets/default/map/world/map_world_jianghu__base01.webp`；不再回退到 `ref_map_jianghu`（那张不是全幅，会错位） |

## 3. 运行时

### 3.1 图层（自下而上）

1. 纸色底（`#e9dfc8`，图片未载入或失败时可见）；
2. 底图 `<img>`：放在一个只做 `transform: translate3d(tx, ty, 0) scale(s)`、`transform-origin: 0 0` 的平面里；
3. 道路 SVG（屏幕空间，`<g transform="translate(tx ty) scale(s)">`，坐标用图像像素）：每条 `map.roads` 按 `points` 原样画折线（圆角连接，**不做曲线平滑**——主角位置由 core 沿同一折线线性插值，画弯了人会走出路外）；底下 4.5 px 半透明纸色描边、上面 2.2 px 墨褐 `#7a5a3a`（`vector-effect: non-scaling-stroke`，屏幕宽度不随缩放变）；按 `kind` 区分：`imperial_road` / `post_road` 实线，`silk_road` / `caravan_road` 虚线 `7 4`，`mountain_road` 点线 `2 4`，`approach` 1.4 px 点线；只画 `eras` 含当前 `era` 且两端节点都开放的路段；
4. 目的地标记：目的地节点处一个朱砂圆环（屏幕空间，直径 26 px，减少动效时不脉动）；
5. 城镇标签：现有 `map-city-badge`（图标 + 书法名），屏幕空间定位，按优先级避让（都城 / 重要城市先占位）；
6. 主角立牌：`/img/hero_cutout.png`，屏幕空间，脚底对准当前 `point`，高约 64 px，脚下金色光环；朝向按位移方向水平翻转；行走时轻微上下起伏（减少动效时关闭）。

### 3.2 视图变换

- `s` = 屏幕像素 / 图像像素；`cover = max(vw / W, vh / H)`；`s ∈ [cover, 4·cover]`。界面上的「缩放」滑杆显示 `z = s / cover ∈ [1, 4]`。
- 夹边：`tx ∈ [vw − W·s, 0]`、`ty ∈ [vh − H·s, 0]`，任何时刻视口内不出现图外区域。
- 以屏幕点 `(px, py)` 为中心缩放：`tx' = px − (px − tx)·s'/s`，`ty'` 同理，再夹边。滚轮以指针为中心；双指以两指中点为中心；滑杆以视口中心为中心；Safari `gesture*` 同双指。
- 默认 `z = 1.6`，以主角为中心（再夹边）。视口尺寸变化时保持视口中心对应的地图点不变，再按新 `cover` 夹 `s` 与平移。

### 3.3 交互

- 拖动平移（鼠标 / 单指）；拖动距离 > 6 px 不算点击。拖动后关闭「跟随主角」，点「定位」或开始新行程时恢复。
- 跟随：行走中若主角离开视口中间 60% 区域，平移使其回到中心（减少动效时直接跳，否则 200 ms 缓动）。
- 点击城镇标签 = 选中并 `worldmap/travel`（沿用现有行为）；点击空白处时取屏幕 28 px 内最近的开放节点同样处理，没有则不动。悬停同样取最近节点作 `hovered`。
- 「定位」按钮：把主角移到视口中心（夹边后）。
- 不拦截页面其他快捷键；指针离开画布清空 hovered 与拖动态。

### 3.4 性能与资源

- 不建 WebGL 上下文，不再动态导入 `@tianshu/render/worldmap`。
- 空闲时零逐帧工作：没有常驻 `requestAnimationFrame`；平移 / 缩放 / 主角移动时用 rAF 合并成每帧最多一次变换与标签重算。
- 视图变换写 CSS 变量或单个 `style.transform`，不触发 Vue 深层响应；节点标签数组只在视图、视口、开放节点或主角位置变化时重算。
- 道路路径字符串只在地图定义变化时生成一次（与缩放无关）。
- 图片 `decoding="async"`；卸载页面时不留监听器和定时器。

### 3.5 代码落点

- `apps/game/src/worldmap/painted-view.ts`：纯函数（坐标换算、夹边、指针缩放、最近节点、标签避让、道路路径字符串），零 DOM 依赖，配单元测试；
- `apps/game/src/pages/WorldMapPage.vue`：页面装配（图层、指针事件、行路笺与按钮、行程步进沿用现状）；
- `packages/render/src/worldmap/**` 不再被页面使用，暂不删除（另起清理任务时一并更新 `packages/render/CLAUDE.md` 的 ENG-08 段）。

## 4. 验收

1. 截图（1920×935、390×844 竖屏）：视口内无图外空白；缩到最小正好铺满一边；放到最大城镇标签仍是固定字号。
2. 城镇标签、道路端点与底图上的城位一致（底图本身不画城，以 GIS 对齐验收为准）。
3. 拖动、滚轮、双指、滑杆、定位、点城出发、停步 / 继续 / 疾行、进入此地都可用；行走中跟随正常。
4. 空闲 5 秒内无逐帧任务（Performance 面板或 rAF 计数为 0）。
5. `pnpm check` 全绿；`painted-view` 单测覆盖夹边、指针缩放不动点、坐标往返、标签避让确定性、道路按时代 / 开放过滤与路径字符串。

## 5. 第二轮：道路走向、城镇分档、名城小景（AR-113）

### 5.1 道路显示几何 `path`

- 来源：`docs/design/map/road_paths.json`（`tianshu.road-paths.v1`，`tools/map/paint/road_paths.py` 在 ETOPO 高程与 GIS 水体上按最省力路线离线算出，确定性）。键为 `road.key`，值为网格浮点坐标折线（两位小数），首点 / 末点严格等于 `road.start` / `road.end` 的 `point`。
- 数据：`worldmap.v1` 路段加可选字段 `path: [x, y][]`（2–4096 点，有限浮点，首末同上）。由 `tools/content/worldmap_enrich.py` 写进 `content/world/chNN/map.yaml`；缺失时一律回退 `points`。
- **只用于显示**：玩法里程 `distanceLi`、寻路、可达、core 的 `worldMapPoint` 都不变。页面在行进中按当前路段进度 `offsetLi / distanceLi` 沿 `path` 弧长插值显示主角（方向按 leg 的 from→to，必要时反转折线）；不在路段上时用 core 的 `point`。
- 绘制：`path` 用 Catmull-Rom → 三次贝塞尔平滑（张力 0.5，端点固定），其余样式同 §3.1。

### 5.2 城镇分档 `tier` 与图标 `marker`

- 由 `worldmap_enrich.py` 按 `docs/design/map/cities.yaml` 写进每章节点（`rs_*` 等非城市节点按 kind 处理）：
  - `tier`：`capital`（当章 `eras[chNN].status == 都城`）> `major`（`importance ∈ {capital, major}` 且非都城）> `minor`（`secondary`，或当章为军镇 / 边关）> `site`（`importance == site` 或 `kind == ruin`）。
  - `marker`：`capital`→大城，`major`→州府，`minor`→县镇（当章为边关 / 军镇时→关隘），`site`→遗迹（门派驻地→门派，寺院→寺庙，道观→道观；分不出就遗迹）。
- 图标：取自 `assets/default/map/kit/` 的大城 / 州府 / 县镇 / 村落 / 关隘 / 遗迹 / 门派 / 寺庙 / 道观件，离线缩成一张图集 `assets/default/map/markers/map_markers_atlas.webp`（每格 128×128，同目录 `atlas.json` 给出各 `marker` 的格位与锚点），运行时只载这一张。
- 尺寸（屏幕像素，随缩放在区间内线性变化，z=1 取下限、z=4 取上限）：capital 44–96，major 30–60，minor 22–40，site 18–30；名字字号 capital 17、major 14、minor 12、site 12（固定，不随缩放）。标签避让优先级先按 tier，再按 §3 原规则。

### 5.3 名城小景（按年代）

- 素材：`assets/default/map/landmark/<id>.webp`（透明底，水墨，与 kit 城池件同画风），同目录 `manifest.yaml` 每条另含：`node`（节点 id）、`chapters`（适用章节列表）、`anchor`（图内落在节点上的像素，通常为城心）、`footprint_grid`（显示宽度，网格单位）、`layout_basis`（布局依据摘要与来源）。
- 构建：`asset-manifest.ts` 登记 `/map/landmark/` 与 `/map/markers/`，复制进 public，并生成 `apps/game/public/assets/default/map/landmark/index.json`（`[{ id, node, chapters, url, anchor, footprintGrid, width, height }]`）。
- 运行时：页面载入一次 `index.json`，按当前章节选每个开放节点的小景；有小景的节点画小景（**放在地图平面里随缩放**，屏幕宽度下限 56 px），否则画 §5.2 图标；名字仍是屏幕空间固定字号、放在小景 / 图标下方。
- 版式依据：城墙形制、城门、中轴、宫城 / 皇城、坊巷格局与标志塔寺按该年代史料（来源写进 manifest `layout_basis`）；先用程序画版式底稿（墙线、街格、宫城块与标志建筑落位），再用水墨件上墨；标志建筑缺件时才单独出图（单体建筑，参考 kit 寺庙 / 门派件画风）。
