# tech/13 · 大地图：整张水墨底图 + 2D 叠加（AR-111）

> 上游：作者 AR-111、AR-112（2026-10-10）、AR-113、AR-115、AR-116（2026-10-11）；几何与坐标归 `design/19` §2、§9；网格与节点归 `content/world/chNN/map.yaml`（`worldmap.v1`）。
> 本文取代 render `ENG-08` 大地图 2.5D 方案中的地形、海面、欧亚大陆贴图与「地图主角用 rig」两条；寻路、里程、城门、开放判定仍全在 core，不变。

## 0. 结论先行

1. 大地图底图是**一张离线画好的 4:3 水墨山水图**，正好覆盖内容网格 `[0,512]×[0,384]` 全幅；图上无字、无城镇、无道路。底图由确定性合成器 `tools/map/paint/compose_world.py` 用 GIS 数据加仓库现有水墨贴图直接画出（AR-112，不用 AI 重画）。
2. 运行时是 **2D 平面**：底图图片 + SVG 道路 + 画进地图的城镇（与底图同一变换、同一像素密度，§5.5）+ 只随拖动平移的叠加层（城名、点击区、主角立牌、目的地标记）。没有旋转、没有 WebGL、没有贴图拼合。
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
4. 城镇平面（AR-115）：与底图平面同一个 `transform`，名城小景与城镇图按底图像素密度画在里面（§5.5）；
5. 叠加层（只做 `translate3d(tx, ty, 0)`，内部坐标 = 地图原点起的「图像像素 × s」）：
   - 目的地标记：目的地节点处一个朱砂圆环（直径 26 px，减少动效时不脉动）；
   - 城名与点击区：`map-city-badge`（点击区盖住该城的城镇图，下面是书法名），按优先级避让（都城 / 重要城市先占位）；
   - 主角（AR-116）：按主角性别取城镇 / 战斗 / 人物页同一个 3D 模型（`npc_zhujue__ch00_m` / `_f`）离线渲染的侧身帧条（`assets/default/map/hero/`，帧尺寸、地面锚点、朝向与步周期见 `hero.json`；由 `tools/map/hero/render_hero.mjs` + `pack_hero.py` 生成）：行走时逐帧播 walk（原片步周期的 0.8 倍），疾行播 run，停步、未出发或减少动效时显示站姿；帧高 72 px，地面锚点对准当前位置，脚下金色光环；帧条朝向与行进方向相反时水平镜像。当前性别的 walk 与 idle 都加载成功才换上帧条；run 缺失或加载失败时疾行改播 walk；切换性别时新帧条加载完成前先显示立牌，绝不显示另一性别。构建只在 `hero.json` 引用的帧条全部发布、且每张与 manifest 记录的 sha256 一致时才发布它（生成目录每次重建）。帧条由 `render_hero.mjs` 一次渲染男女两套（先写临时目录，全部成功才以改名替换），`pack_hero.py` 要求两套齐全且同一批次，整包写入旁边的临时目录后整体换入。否则退回 AR-101 立牌 `/img/hero_cutout.png`（高约 64 px，行走时轻微上下起伏）。

### 3.2 视图变换

- `s` = 屏幕像素 / 图像像素；`cover = max(vw / W, vh / H)`；`s ∈ [cover, 4·cover]`。界面上的「缩放」滑杆显示 `z = s / cover ∈ [1, 4]`。
- 夹边：`tx ∈ [vw − W·s, 0]`、`ty ∈ [vh − H·s, 0]`，任何时刻视口内不出现图外区域。
- 以屏幕点 `(px, py)` 为中心缩放：`tx' = px − (px − tx)·s'/s`，`ty'` 同理，再夹边。滚轮以指针为中心；双指以两指中点为中心；滑杆以视口中心为中心；Safari `gesture*` 同双指。
- 默认 `z = 1.6`，以主角为中心（再夹边）。视口尺寸变化时保持视口中心对应的地图点不变，再按新 `cover` 夹 `s` 与平移。

### 3.3 交互

- 行进节拍（AR-116）：每步 10 里（core 规则不变），按上一步发出的时刻起算——普通 25 ms 一步，疾行 12 ms，减少动效 200 ms；忙碌时顺延一个节拍。原实现每次回执后再等 45 ms（实测约 51 ms 一步），现为其两倍速。
- 减少动效：游戏开关或系统 `prefers-reduced-motion` 任一开启即生效（design/26），页面实时跟随系统偏好的变化；生效时主角显示站姿、跟随不缓动、节拍 200 ms。
- 拖动平移（鼠标 / 单指）；拖动距离 > 6 px 不算点击。拖动后关闭「跟随主角」，点「定位」或开始新行程时恢复。
- 跟随：行走中若主角离开视口中间 60% 区域，平移使其回到中心（减少动效时直接跳，否则 200 ms 缓动）。
- 点击城镇标签 = 选中并 `worldmap/travel`（沿用现有行为）；点击空白处时取屏幕 28 px 内最近的开放节点同样处理，没有则不动。悬停同样取最近节点作 `hovered`。
- 「定位」按钮：把主角移到视口中心（夹边后）。
- 不拦截页面其他快捷键；指针离开画布清空 hovered 与拖动态。

### 3.4 性能与资源

- 不建 WebGL 上下文，不再动态导入 `@tianshu/render/worldmap`。
- 空闲时零逐帧工作：没有常驻 `requestAnimationFrame`；平移 / 缩放 / 主角移动时用 rAF 合并成每帧最多一次变换与标签重算。
- 视图变换只在同一帧里直接写底图平面、城镇平面、叠加层的 `style.transform` 与道路 `<g>` 的 `transform`，不经 Vue 响应；拖动不重排任何元素。城名只在缩放比例、开放节点、选中 / 当前 / 目的地或城镇图尺寸变化时重排，与平移和视口无关（AR-115）。
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
- 尺寸（AR-115 起为网格单位，画在地图里随缩放，见 §5.5）：capital 7.2、major 5.2、minor 3.8、site 3.0、门派 3.6；名字字号 capital 17、major 14、minor 12、site 12（屏幕像素，固定，不随缩放）。标签避让优先级先按 tier，再按 §3 原规则。

### 5.3 名城小景（按年代）

- 素材：`assets/default/map/landmark/<id>.webp`（透明底，水墨，与 kit 城池件同画风），同目录 `manifest.yaml` 每条另含：`node`（节点 id）、`chapters`（适用章节列表）、`anchor`（图内落在节点上的像素，通常为城心）、`footprint_grid`（显示宽度，网格单位）、`layout_basis`（布局依据摘要与来源）。
- 构建：`asset-manifest.ts` 登记 `/map/landmark/` 与 `/map/markers/`，复制进 public，并生成 `apps/game/public/assets/default/map/landmark/index.json`（`[{ id, node, chapters, url, anchor, footprintGrid, width, height }]`）。
- 运行时：页面载入一次 `index.json`，按当前章节选每个开放节点的小景；有小景的节点画小景（宽 `footprint_grid` 个网格单位，画在地图里随缩放，不设屏幕下限，见 §5.5），否则画 §5.2 城镇图；名字仍是屏幕固定字号、放在小景 / 城镇图下方。
- 版式依据：城墙形制、城门、中轴、宫城 / 皇城、坊巷格局与标志塔寺按该年代史料（来源写进 manifest `layout_basis`）；先用程序画版式底稿（墙线、街格、宫城块与标志建筑落位），再用水墨件上墨；标志建筑缺件时才单独出图（单体建筑，参考 kit 寺庙 / 门派件画风）。

### 5.4 门派驻地（作者 10-11「门派按照书中地理位置放到地图上」）

- 数据：`worldmap.v1` 可选 `sects: [{ id, name, siteName, kind, point, status, marker, cityId }]`，由生成器从 `docs/design/map/sects.yaml` 按当章 `availability` 写出：`O` 开放、`H` 隐世可触发、`P` 前身、`M` 仅提及照写，`N` 尚未创立、`D` 已消亡不写。`point` 为网格整数坐标（按书中地望核定的经纬度经 `CanvasProjection(512,384,18)` 投影），`marker` 取 `sect` / `temple` / `daoist`（佛寺、道观、其余门派），`cityId` 为依附的地图节点（无则 null）。`name` / `siteName` 走本地化文本键。
- 显示：`O` 画门派图（3.6 个网格单位，画在地图里）与名字（朱砂色 `#9e3b2f`、12 px、比城名小一号）；`H` 图 55% 不透明、名字只在悬停 / 选中时出现；`P` / `M` 不画。标签避让优先级位于 major 与 minor 之间。与开放城镇或别的驻地相距 ≤0.75 个网格单位的驻地，按 id 顺序占东北、东南、东、北、西北、西六个扇位（网格单位偏移约 3–4），任何缩放下都挨在城旁不相叠。
- 交互：悬停 / 点击门派显示行路笺门派信息（名称、山门、开放 / 隐世、依附城）；依附城当章开放且可达时给「前往某城」，走依附城的寻路，不新增玩法规则。

### 5.5 城镇画进地图（AR-115，2026-10-11）

- 问题：城镇图标原是屏幕空间贴图（128 px 图集，缩放时只在 18–96 px 之间慢变），名城小景虽在地图平面里但有 56 px 屏幕下限、直接用约 700 px 母版；两者笔触比 4096 底图细得多，放大时底图变软它们仍锐利，缩放时大小也不跟山川同步，看起来是「贴上去的」。逐帧实测拖动与滚轮缩放时图标和底图同帧（偏差 ≤0.5 px），问题在画法而不在帧同步。
- 画法：城镇图与名城小景放进与底图同一变换的城镇平面，尺寸为整数个底图像素（网格单位 × `W/512`，左上角取整，与底图像素网格对齐）。页面在底图载入后把图集格与小景母版逐级减半、再一步高质量缩到这个尺寸（`apps/game/src/worldmap/map-sprites.ts`，结果为 data URL，键含图集地址与尺寸），之后由浏览器与底图一起缩放，任何缩放下软硬一致；没有 2D canvas 的环境（测试、受限浏览器）退回 CSS 缩放图集格，再退回旧单图标。
- 退路与资源：小景只画在已载好的底图上——底图载入中、缺失或比例不符时，有小景的节点先画城镇图；小景图片加载失败时该节点同样改画城镇图；图集图片加载失败时全部退回旧单图标。源图只在一批重采样里持有、用完即放；失败只记在当前章节与底图上，换章或换底图时清空并重新探测图集（失败的图会再试）；页面每次触发重采样时先裁掉当前用不到的结果（新章所需是旧章子集、无需新批次时也裁；换底图后底图未就绪或失败时同样裁）；换章同时清空城镇与门派的选中 / 悬停；每次触发重采样（包括换底图、图片未就绪而提前返回的那次）都会让之前的批次过期，过期批次的结果与失败一律丢弃；画布绘制或导出出错只放弃该张，不算源图失败。
- 叠放：小景在下，其余城镇图按节点由北向南叠（南压北，同合成器的山）；每个城镇图四周留白——一团纸色雾（`#f0e9d9`，中心约 0.9 不透明、向外渐淡，比城镇图外扩约三成），像山水画里山中村落四周的留白，城镇在山区也看得出来，平原上与纸色几乎一样；名城小景母版自带一圈纸色晕边，不另垫雾。城镇平面自成堆叠上下文（`isolation: isolate`），在道路 SVG 之上，道路进城处被城盖住。
- 城名：屏幕固定字号，放在城镇图下方 2 px；城镇图永远画出，名字与已占位的名字相叠时先隐去，悬停 / 选中再显示；点击区盖住城镇图在当前缩放下的屏幕范围，叠放次序与城镇图相同（小景在下、南压北），所以相叠处点到的总是看得见的那座城；所有城名在所有点击区之上，主角立牌在最上。
- 已知限制：底图仍是 4096×3072，最大缩放（z=4）时底图与城镇同样偏软；若要放大后更清晰，需要另做高清分块底图（另议）。
