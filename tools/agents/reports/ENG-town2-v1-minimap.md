# ENG-town2-v1-minimap 报告 · 城镇探索 v2 · P1 · 现有城镇页先接新小地图与缩放快捷键（右上 TxMinimap 点击寻路、跟镜头转 / 上北下南、M 全城图、=/-/0 与滚轮）
## 1. 摘要（3–6 行）
- v1 城镇页已挂 `TxMinimap`：空地点地/设施入口移动、玩家箭头、路径、终点、视野、名称距离、M 全城图与设施列表均接通。
- 缩放统一走 explore ActionMap + ZoomController；键盘、外圈按钮、滚轮和捏合共用值源，旧滑杆与 `town-help` 已删除。
- 全城图以可重入 hold 暂停世界 tick；设置页可持久化切换跟镜头转/上北下南；主角按性别读取 render 身高表。
- 页面只发 `town/move`，不算路径或可达性；专项及完整 `pnpm check` 均通过。
## 2. 产出（文件、行数、主要章节）
- 应用：`TownPage.vue` 893 行；`game-controller.ts`/测试 957/215；`town-input.ts`/测试 58/87；`settings.ts`/测试 92/33。接入小地图、tick hold、输入与设置持久化。
- explore：`v1-minimap.ts`/测试/文案 176/131/6，`v1-zoom.ts`/测试 11/15，`area-map-control.ts` 37；完成纯底图、坐标/命令装配、缩放换算与全城图生命周期。
- render：`projection.ts`/测试 137/75，`scene.ts`/测试 388/125，`types.ts` 86，`CLAUDE.md` 城镇缩放一句；完成预分配视野四边形和 0.4–6.0 夹取。
- UI：`TxSettingsPanel.vue`/测试 31/19，`projections.ts` 210，`i18n-flow.ts` 64；增加“小地图上北下南”设置。
- `pnpm install --frozen-lockfile`：通过，lockfile 未变；应用专项 49 文件/325 例、UI 1/1、render town 3/15 均通过。
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`：通过；229 文件/1796 例；内容 1777 文件/1708 对象/2 Ink/65 地图；构建、体积和 dev chunks PASS。
## 3. 关键结论与数值
- 底图：上北下南、左上 `(minX,minZ)=(0,0)`；街道/院落/建筑/水面/设施五色；0.25 m/px、长边 ≤640；大理 384×384，Node 热测 20 次 median 1.336 ms、p95 5.082 ms。
- basis=`[0.70710677,-0.70710677,-0.70710677,-0.70710677]`（屏幕右/上单位正交，det=-1）；跟镜头转使用该 basis，展开图强制 north-up。
- 视野：画布四角相机射线连续求交 `y=0`，按左上/右上/右下/左下写同一 8 长 `Float32Array`；失败传 null；600 帧 spy 确认 `pickPoint` 0 次。
- 缩放档 `[48,64,80,96]`、连续 `[40,112]`、复位 80；v1=`px/m×18/画布高`，720 高四档为 `1.20/1.60/2.00/2.40`。
- 最终有效缩放：高 360/640/720/1080/1440 的倍率端点依次为 `2/5.6`、`1.125/3.15`、`1/2.8`、`0.667/1.867`、`0.5/1.4`，场景实得均为 40/112 px/m，误差 ≤0.5。
- 点击经 `minimapToWorld` 后用轴向立方取整发 `town/move`；设施发首入口格和 `buildingId`；两种朝向均装配到 `controller.townCommand`，可达性由 core 判定。
- 名称：设施 `poi` 优先、无值用店铺/客栈/寺观；NPC 从 `projection.characters[].name` 按 `npcId` 查找，缺失显示“路人”，不再复用“交谈”。
- 与 tech/15 §6.2–6.3、§7.1–7.2、§8 一致；协调者批准的过渡增量为 tick hold、render 地面四边形/缩放范围和设置页开关；render 闭包 166.97/180 KiB。
## 4. 开放问题（附默认值）
- v1 大理 36 栋建筑 `poi` 均为空，当前按类别词显示；默认由 DES-town2-pilot-content 提供设施文件后，在 shop-wire / ENG-town2-v1-page 接具体店名。
- 尚未在浏览器肉眼实走；默认交协调者按第 7 节在 5173 检查。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；实现 AR-114 与协调者 2026-10-11 返修裁定。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `ENG-town2-v1-page`：删模拟店铺/对白和 `town-panel` 时保留 TxMinimap、ZoomController、身高、`area-map-control`；真实交互条接锚点/设施投影，设施名接 pilot content。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 底图五色/尺寸/确定性、双朝向装配、设施入口、名称回退、六向箭头、600 帧同缓冲均有测试。
- ✅ M/Esc/外圈/卸载共用 helper；tick 计数、幂等和 dispose；设置页勾选/取消及持久化均有测试。
- ✅ 全键表、修饰键/编辑态/IME、wheel 两模式、40–112、捏合、四档换算与 5 高度×2 端点场景实效均有测试；`findPath|astar|town-help|旧滑杆` grep 为零。
- ⚠️ 交协调者手检：5173 进大理城 → 右上小地图 → 点空地走过去 → `=`/`-`/`0` 与滚轮缩放 → M 全城图/Esc → 设置切“上北下南”。
- ✅ 给 ENG-town2-v1-page：交互条仍在 `town-panel`/`localAnchors`/`useAnchor`，模拟店铺为 `shopItems`/`showShopModal`；替换时勿移除本任务装配。
- ✅ 写集符合补充裁定；`packages/render/src/town/index.ts` 与基点一致；未新增依赖，未改 lockfile，`git diff --check` 通过。
