# 本任务：出图 · 江湖大地图整张水墨底图（AR-111）

> **10-10 23:05 改向（AR-112）**：不用 Gemini。下文 §2.2–§2.4 的 Gemini 重画、分块精修与岸线形变对齐作废，改为确定性合成器 `tools/map/paint/compose_world.py`：GIS（NE 海陆 / 小岛 / 湖泊 / 河流 + ETOPO 高程）定版式，笔墨只取 `assets/default/map/kit/`、`assets/default/map/tiles/` 与两张已审基线图抠出的山体印章；先出样区给协调者看，再出全图。§1 规矩（写集、不提交、通用 UA）与 §2.1 底稿、§2.5 质检交付仍然有效。

交付一张 4:3、与游戏网格同投影的整张水墨山水地图，替换 `assets/default/map/world/map_world_jianghu__base01.webp`（现为临时占位）。运行时（另一条线）会把道路、城镇标签、主角按网格坐标叠在这张图上，所以**底图的地理位置必须准**，而画风要和作者已审的江湖总图一致。

## 0. 先读

- 作者原话与口径：`docs/decisions/author-requirements.md` 末条 AR-111；
- 素材契约：`docs/tech/13-worldmap-painted.md` §1–§2（投影、尺寸、内容、禁止项、对齐门槛）；
- 投影与视觉：`docs/design/19-world-map.md` §2（Albers 与画布）、§7（墨色）、§9（岸线、小岛容差、河流、山脉、不绘现代边界）；
- 画风基准（作者已审）：`assets/default/baseline/map/ref_map_jianghu__ch01_base01.png`，以及区域图 `assets/default/map/regions/*.png` 的画法（manifest 里有当时的提示词与「画风要求（作者 10-03 已选定的画法）」，照着写）；
- Gemini 网页出图手册：`.claude/skills/gemini-imagegen/SKILL.md`、`tools/imagegen/README.md`、驱动 `tools/imagegen/gemini_g.js`；常驻 CDP 进程 `tools/imagegen/tri_pipeline_runner.mjs`（127.0.0.1:9223，`/status`、`/targets`、`/eval`）。

## 1. 规矩

- **范围**：只做这张底图。不改任何代码（`apps/**`、`packages/**`），不改 `content/**`，不改别的素材。写集：`tools/map/paint/**`（新建脚本与 README）、`assets/default/map/world/**`、工作目录 `.agents/coord/ART-worldmap-painted/**`、原始数据 `.agents/coord/geodata/**`、Gemini 原图 `.agents/coord/gemini_originals/maps/**`。
- **不提交 git**，不执行任何改变仓库状态的 git 命令；协调者审过再提交。主检出里有大量别人的未提交改动，碰都不要碰。
- **浏览器（AR-100 铁律）**：保持一条连接，不反复启停、不反复让作者批准。只操作 gemini.google.com 的标签页，别的标签页一律不看、不列内容、不碰。不输入密码、不改账号和浏览器设置。常驻 CDP 进程是作者的，不要重启或改它；能用它的 `/eval` 就用它，不行再按 skill 用 Claude in Chrome 扩展（标签页要自己建在本会话标签组里）。不要向 `/create_target`、`/open`、`/tripo/*` 发请求。
- **可见标签页**：Gemini 只有前台可见的标签页能出图。若可见性不满足，先简短报告给协调者（SendMessage 不可用时写进 `.agents/coord/ART-worldmap-painted/STATUS.md` 并停在那一步），不要乱试。
- **节奏与限流**：每次提交间隔 ≥ 30 秒；同一条连续 3 次限流就停，记下 https://gemini.google.com/usage 的重置时间并报告。
- **联网下载**（只为 GIS 数据）：只从 Natural Earth（naciscdn.org / naturalearthdata.com）与 NOAA（ETOPO，可用 ERDDAP 按经纬度子集下载）取；请求一律用通用标识 `User-Agent: TianshuMapBot/1.0`，Header、URL 参数、表单里不放作者邮箱、用户名或任何个人标识。把来源 URL、访问日期和 sha256 记进 `.agents/coord/geodata/README.md`。
- 单次工具调用 ≤ 5 分钟；长等待拆段。

## 2. 步骤

### 2.1 底稿（确定性脚本 `tools/map/paint/build_guide.py`）

- 投影：直接 import `tools/map/render_map.py::CanvasProjection`，用 `CanvasProjection(W, H, margin=18*W/512)`——与网格 `CanvasProjection(512, 384, 18)` 只差整体缩放。先写自检：把 10 个开放节点的经纬度（`docs/design/map/cities.yaml`）投到 512×384，与 `content/world/ch10/map.yaml` 的 `point` 比，偏差 ≤ 1 个网格单位。
- 范围：整幅网格（不止 73–135°E、18–54°N；四角与边缘会露出中亚、西伯利亚、日本、印度北部、中南半岛，照实画）。数据取 lon 55–150°E、lat 8–62°N 足够。
- 数据：Natural Earth 10m `land`、`minor_islands`、`lakes`、`rivers_lake_centerlines`（scalerank ≤ 6 左右，写进配置）；ETOPO 2022 30″ 或 ETOPO1（60″）高程子集。剔除现代水库（三峡、丹江口、新安江等，design/19 / tools/map/terrain 已有名单）。
- 产出（W×H = 2048×1536 给 Gemini 看；4096×3072 给对齐用）：
  - `guide_2048.png`：纸色陆地、浅灰蓝海面，高程晕渲 + 分层设色（高原 / 高山越高越深，≥ 4500 m 雪白），湖泊、主要河流（按等级粗细），沙漠用浅沙色（塔克拉玛干、戈壁、库姆塔格等，可按高程 + 干旱区手工多边形）。不画任何字、城、路、国界。
  - `landmask_4096.png`：精确陆地二值图（湖泊扣除）；`rivers_4096.json`：河流折线（像素坐标）。
  - `nodes_overlay_2048.png`：底稿上叠开放节点（红点）与本章道路，供对照。
- 同一输入逐字节同一输出；脚本带 `--check`（自检投影、文件哈希）。

### 2.2 重画（Gemini 网页，Pro，Create image）

- 输入两张图：① 底稿 `guide_2048.png`；② 画风参考——江湖总图中部裁块（区域图当时用的 `[414, 245, 1121, 716]` 即可，别整图上传，整图会被照搬布局）。
- 提示词要点（中文，写清楚、不套模板）：
  - 「把第一张图重画成中国古风水墨山水地图，画法、设色、纸色、云雾完全照第二张图；**第一张图的每一条海岸线、每一个岛、湖泊轮廓、河道走向和山地位置必须保持原位原形**（深色晕渲处画山，越深越高越密，最白处画雪山），不得移动、增删或改变比例；北上东右，4:3 横幅，满幅不留边框」；
  - 海面：与山川同一套笔墨——淡青灰洗染，近岸略深，远海留白，用细淡墨线勾少量传统水纹（参考宋画水纹的疏密），**不要**规则重复的波浪纹样、不要蓝色写实海水；
  - 山：一座座立体写意山峰，披麻 / 斧劈皴、山腰山脚云雾；日本列岛、朝鲜半岛、台湾、海南、库页岛等岛屿按底稿高程画山，不留空白平地；
  - 平原点树丛田畴，草原淡绿赭，沙漠干笔点沙；河流淡青、湖面浅青；
  - 排除：任何文字 / 伪字 / 数字 / 印章 / 题跋 / 签名 / 水印；城池、房屋、寺塔、道路、桥；现代国界省界；卷轴、画框、罗盘、图例；卫星照片质感、3D 渲染、鲜艳蓝绿。
- 至少出 3 张候选（每张新开对话）；原图存 `.agents/coord/gemini_originals/maps/worldmap_cNN.jpeg`（`saveFull` 拿全尺寸）。

### 2.3 放大与细节（候选选定后）

- 目标 ≥ 4096×3072。先试分块精修：按 2×2（或 3×2）带 15% 重叠切块，每块连同底稿同位置裁块一起发回 Gemini，要求「放大到高分辨率、构图位置颜色完全不变、只补笔触细节」；回来的块与上采样原图做相关性检查（≥ 0.9 才收），色彩按原图同位置做直方图匹配，重叠区羽化拼接。
- 分块精修不稳定（错位、改形、接缝）就退回：Lanczos ×2 + 轻度锐化。两种结果并排给协调者看，说明选哪个、为什么。

### 2.4 岸线对齐与合成（`tools/map/paint/align_compose.py`）

- 从画面分出海 / 陆，与 `landmask_4096.png` 比：IoU、岸线平均偏差（换算到 1024 宽）。
- 偏差超门槛时先做平滑形变对齐（例如对两张掩膜的符号距离场做 demons 配准，位移场大尺度平滑；只动形状不动笔触），再强制 GIS 岸线：岸线两侧 6–10 px（4096 宽）羽化带内，海用画面自己的海面质感、陆用画面自己的陆地质感补齐，沿 GIS 岸线描一道 1.5–2 px 淡墨（`#554c3e`，略有粗细变化）。湖泊同理。
- 局部错得太离谱（例如某个半岛画没了）就对该区域单独裁块让 Gemini 照底稿重画再贴回，别硬拉。

### 2.5 质检与交付

- 指标写 `.agents/coord/ART-worldmap-painted/qa/metrics.json`：陆地 IoU（1024×768）、岸线平均 / 95 分位偏差、开放节点落在陆地上的比例（岛上节点按 design/19 §9.2 容差）、河流关键点（兰州、武昌、南京、重庆、开封北黄河）离画出的河道距离。门槛见 tech/13 §2。
- 质检图：整图缩略 + 开放节点红点 + 道路；局部放大：日本、朝鲜半岛、山东与渤海、长江口、珠江口、台湾、海南、青藏、天山与塔里木、蒙古、东北。
- 给作者挑的对比页：3 张候选缩略 + 选定稿，存 `.agents/coord/ART-worldmap-painted/candidates.jpg`。
- 交付：覆盖 `assets/default/map/world/map_world_jianghu__base01.webp`（WebP 质量约 85，≤ 8 MiB，严格 4:3，≥ 4096×3072），同时出 `map_world_jianghu__base01_preview.webp`（1024×768）。更新同目录 `manifest.yaml` 这一条：`prompt`、`negative`、`references`（含 sha256 与用途）、`tool`、`model`、`created`、`source_path`、`size`、`sha256`、`status: candidate`、`notes`（写对齐指标、放大方式、已知瑕疵），保留 `extent_grid: [0, 0, 512, 384]`。

## 3. 汇报

结束时回给协调者（≤ 25 行）：选了哪张、为什么；对齐与节点指标；放大方式；已知瑕疵和下一步建议；所有产物路径。中间如果卡在可见性、限流、登录弹窗，立刻报告，不要空等超过 10 分钟。
