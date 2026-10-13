# 本任务：游戏工程 · 大地图改 2D：整张水墨底图 + 道路 / 城镇 / 主角叠加（AR-111）

**第一个动作**：打开 `apps/game/src/pages/WorldMapPage.vue` 通读一遍，然后读 `docs/tech/13-worldmap-painted.md`。不要先写计划，读完直接动手；改完一处就跑对应测试。

## 工作区与纪律（务必遵守）

- 你在**主检出** `/Users/bytedance/Projects/jinyongqunxia` 里直接改。这里有大量别人未提交的改动（约 100 个文件），作者的开发服务器（5173）正从这里热更新。
- **只改下面「写集」里的文件**。写集外的文件一个字都不要动：不格式化、不顺手修、不删临时文件。
- **不执行任何改变仓库状态的 git 命令**（不 add / commit / stash / checkout / reset / restore / clean）；`git diff` / `git status` 只读可以用。
- 不加依赖，不改 `package.json` / `pnpm-lock.yaml`，不改 `packages/render/**`、`packages/core/**`、`assets/**`、`content/**`。
- 不得放宽、跳过或改写任何门禁和已有断言；测试失败如实报告。
- 不要停下来提问；遇到文档没写的取舍，按 `docs/tech/13` 的意图自己定，并在报告里写明。

## 为什么做

作者 AR-111（2026-10-10，逐字）：

> 图1: 大地图贴图有一些贴图错误，海洋的波纹看起来和山川的水墨风格不一致。日本缺少山峰信息。不用无限拖动，只在金庸世界范围的地图就行。另外，因为不需要旋转，所以整个地图可以绘画出来，配上路径/城镇坐标就行，不需要贴图渲染。

现在的大地图是 Three.js 2.5D：程序地形 + 欧亚大陆贴图 + 平铺海浪贴图 + 3200×3200 海面裙边，可以无限拖到图外，接缝处有贴图错误。改成：一张离线画好的整图（素材键 `map_world_jianghu__base01`，现在是临时占位，正式水墨图由出图线另交、同名替换）＋ 2D 叠加。完整契约见 `docs/tech/13-worldmap-painted.md`，以它为准。

## 要做的事

1. **纯函数模块** `apps/game/src/worldmap/painted-view.ts`（零 DOM / Vue 依赖）：
   - 网格 ↔ 图像像素 ↔ 屏幕换算（网格 512×384；像素 = 网格 × W/512，纵向 × H/384；W/H 取图片实际尺寸）；
   - 视图状态 `{ s, tx, ty }`：`cover = max(vw/W, vh/H)`，`s ∈ [cover, 4·cover]`，夹边 `tx ∈ [vw − W·s, 0]`、`ty ∈ [vh − H·s, 0]`；
   - 以屏幕点为中心缩放（不动点公式见 tech/13 §3.2）、平移、居中到某网格点、视口尺寸变化后的重夹；
   - 最近开放节点拾取（屏幕半径 28 px）；
   - 城镇标签避让：优先级 = 选中 / 当前所在 / 目的地 > 连通度（与该节点相连、且本时代可画的路段数）> 城镇先于遗迹 > id 字典序；标签框按字数估宽（每字 13 px + 6，最少 44）× 22 高，碰撞的低优先级隐藏；结果确定；
   - 道路：筛出 `eras` 含当前 `era` 且两端都开放的路段，按 `points` 生成**折线** SVG 路径字符串（不平滑，理由见 tech/13 §3.1），按 `kind` 给出样式类名；
   - 去掉名字里的「（待考）」与「地区所指治所 / 所指治所」后缀（沿用页面现有清洗）。
2. **单元测试** `apps/game/src/worldmap/painted-view.test.ts`：夹边（任意平移 / 缩放后视口内不出现图外）、指针缩放不动点、网格 ↔ 屏幕往返、最小缩放正好铺满一边、视口变化重夹、标签避让确定且优先级生效、道路时代 / 开放过滤与路径字符串、最近节点半径。
3. **页面** `apps/game/src/pages/WorldMapPage.vue` 改为 2D（图层顺序、尺寸、颜色见 tech/13 §3.1）：
   - 删掉 Three 场景挂载（不再 `import('@tianshu/render/worldmap')`）、常驻 rAF 循环、后台定时器；保留行路笺、按钮（前往 / 停步 / 疾行 / 继续 / 进入此地）、行程步进 `scheduleStep`、`scene` 事件、图例、「定位」和缩放滑杆（滑杆改为 `z ∈ [1, 4]`，步长 0.05，默认 1.6）；
   - 底图 URL 用 `mapStatic.mapTextureUrl`（以 `/` 开头补全）；图片未载入时显示纸色底，载入失败或宽高比偏离 4:3 超过 0.5% 时显示一行错误提示，道路和城镇照常可用；
   - 交互按 tech/13 §3.3：拖动（>6 px 不算点击，拖动后关跟随）、滚轮以指针为中心、双指与 Safari `gesture*`、点城镇标签或空白处 28 px 内最近节点即出发、悬停高亮、「定位」居中主角、行走中主角出中间 60% 区域就回中（减少动效直接跳，否则 200 ms 缓动）；
   - 主角立牌 `/img/hero_cutout.png`（高约 64 px，脚底对准当前点，脚下金色光环，按位移方向水平翻转，行走时轻微起伏，减少动效关闭）；目的地朱砂圆环；
   - 性能按 tech/13 §3.4：空闲时零逐帧工作；交互期间用 rAF 合并，每帧最多一次变换和标签重算；变换只写一个元素的 `style.transform`；标签数组只在视图 / 视口 / 开放节点 / 主角位置变化时重算；道路路径只在地图定义变化时生成；
   - 开发模式下在 `window.__worldMapView` 暴露只读调试句柄 `{ state(), focus(nodeId), setZoom(z) }`，生产构建不带（`import.meta.env.DEV` 守卫）；
   - 删除只为旧 Three 场景服务的代码和样式；竖屏（≤768 px）沿用现有面板位置。
4. **素材选用**：新建 `apps/game/src/runtime/worldmap-texture.ts`，导出唯一的选图函数：依次取 `content.assets['map_world_jianghu__' + era].map`、`content.assets['map_world_jianghu__base01'].map`，都没有时返回固定路径 `/assets/default/map/world/map_world_jianghu__base01.webp`。`apps/game/src/projection.ts` 与 `apps/game/src/runtime/session-projection.ts` 里现有的 `ref_map_jianghu` 回退链都改为调用它（只改这几行）。配一个小测试。
5. **构建登记**：`apps/game/build/asset-manifest.ts` 的 `consumed` 加 `'/map/world/'`，`map` 键同时接受 id 前缀 `ref_map_jianghu__` 与 `map_world_`（其余逻辑不动）。在 `apps/game/build/content-plugin.test.ts` 或新建 `apps/game/build/asset-manifest.test.ts` 补一条：`assets/default/map/world/manifest.yaml` 的 `map_world_jianghu__base01` 被登记为 `map` 并复制到 `apps/game/public/assets/default/map/world/`。
6. **改写** `apps/game/src/runtime/worldmap-page.test.ts`：旧的两条是 Three 场景挂载 / 卸载竞态，场景不存在了就改成 2D 页面的生命周期与交互测试——挂载后渲染开放城镇标签、点标签发出 `worldmap/travel`、卸载后不残留监听器 / 定时器 / rAF；不要删成空文件。

## 写集

`apps/game/src/pages/WorldMapPage.vue`、`apps/game/src/worldmap/**`（新建）、`apps/game/src/runtime/worldmap-texture.ts`（+ 同名 `.test.ts`）、`apps/game/src/projection.ts`、`apps/game/src/runtime/session-projection.ts`、`apps/game/src/runtime/worldmap-page.test.ts`、`apps/game/build/asset-manifest.ts`、`apps/game/build/content-plugin.test.ts` 或新建 `apps/game/build/asset-manifest.test.ts`。其余一律不动。

## 检查（全部通过才算完）

- `pnpm exec vitest run --config vitest.workspace.ts --project node apps/game/src/worldmap apps/game/src/runtime apps/game/build`
- `pnpm typecheck`
- `pnpm exec eslint --max-warnings 0 <你改过 / 新建的每个文件>`
- `pnpm exec vue-tsc -b --pretty false` 与上面的 typecheck 等价，二者跑一个即可。

不要跑 `pnpm install`；全量 `pnpm check` 由协调者在主检出另跑（这里有别人的未提交改动，结果需要对照基线）。

## 报告

写到 `tools/agents/reports/ENG-worldmap-painted-2d.md`（这是写集外唯一允许新建的文件），≤ 40 行：
- 改了哪些文件、各多少行；
- 视图变换与夹边的实现位置，空闲零逐帧怎么保证；
- 标签优先级与避让的取值；
- 三条检查命令的原样结果（通过 / 失败条数）；
- 没做或与 tech/13 不一致的地方及理由。
