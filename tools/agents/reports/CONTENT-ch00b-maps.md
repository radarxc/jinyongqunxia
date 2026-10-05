# CONTENT-ch00b-maps 报告 · 内容 · 序章 ch00 地图（竹林、山径、越营、长白山洞；Tiled）

## 1. 摘要（3–6 行）

本轮按合入前审核返修：C02 白猿汇合后开放营门、进入 C03；14 处悬空文本键原位替换为已有正文。
登记 2 个真实 RegionGate、4 个人物与 7 个剧情交互的 dialogue binding，随两个区域分包。
四图尺寸、格网、对象坐标与雪穴预览均未改，布局为**（原创扩展）**；发奖归属与传功双演示条件保持，执行端缺口见 §7。
## 2. 产出（文件、行数、主要章节）

| 文件（地图均在 `content/world/regions/`） | 行数 | 主要内容 |
|---|---:|---|
| `rg_jiangnan_taihu/sc_00_zhulin.tmj` | 133 | C01 出口绑定、竹棒/桃剧情交互 |
| `rg_jiangnan_taihu/sc_00_shanjing.tmj` | 87 | 投桃进入 `baiyuan_choice` |
| `rg_jiangnan_taihu/sc_00_yueying.tmj` | 97 | C03 营门绑定、清茶/传功剧情交互 |
| `rg_dongbei/sc_00_changbai_cave.tmj` | 56 | 初眠/醒转对话绑定 |
| `content/chapters/ch00_yuenv/bindings/{gates,dialogues}/*.yaml` | 14 / 104 | 2 gate / 11 dialogue；无 Chest，不建 loot |
| `tools/agents/reports/CONTENT-ch00b-maps.md` | 60 | 七节报告及交接 |
## 3. 关键结论与数值

| 项 | 结论 |
|---|---|
| 格网 | 48×48 px；有效/可站立格 `170/170`、`217/210`、`261/260`、`70/42`；`217−7=210`、`261−1=260`（深谷），`70−28=42`（石壁） |
| 高差 | 竹林/雪穴 h0–1，山径/越营 h0–2；有效地形与高度同位 |
| 轻功 | `gate_00_zhulin_bridge`、`gate_00_shanjing_gou`、`gate_00_yueying_slope` 均 qg1；山径保留约 10 格 qg0 绕路 |
| 参考资料 | 2026-10-04 联网核实 Tiled 1.12.2 与 JSON/GID：[发布页](https://www.mapeditor.org/2026/05/27/tiled-1-12-2-released.html)、[JSON](https://doc.mapeditor.org/en/stable/reference/json-map-format/)、[GID](https://doc.mapeditor.org/en/stable/reference/global-tile-ids/)；本次无远程 API、价格、限额或浏览器支持新增主张 |
## 4. 开放问题（附默认值）

| 问题 | 默认值 / 后续归属 |
|---|---|
| schema 无区域显示别名 | 保留 `rg_jiangnan_taihu`；UI / RegionDef 按 ch00 显示“越地” |
| `lockedBy` 只是绑定键 | 已解决：2 个 `region-gate.v1` 绑定已登记并打包（见 §7）；不再使用 quest ID 占位 |
| Trigger 通用执行端口尚未落地 | 已解决：EventDef 执行器已合入（见 `ENG-event-executor.md` §3）；本章无对应 EventDef，移除悬空 `eventId`，剧情走 dialogue binding；消费缺口见 §7 |
| 正式春秋越地美术未到位 | 继续复用占位 tileset；正式素材替换不改地图 |
| 专用锁门提示及 dialogue 条件 | 已解决：锁门提示复用 C01 接棒/C02 汇合目标，14 处地图文本复用现有正文；专用文案落地后再引用；条件仍交引擎求值，不能据静态校验宣称已通关 |
## 5. 对基准的修改提案（编号 / 提案 / 理由）

无；新门禁 ID 遵循 canon §12，未修改玩法规则。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- CONTENT-ch00c / 遭遇接口：使用 §7 三个 `arena_00_*→enc_00_*`，不重画战场。
- ENG-20a / 20b / 区域交互：消费 §7 对象类与 dialogue 条件；剧情交互不得按 `action` 另发物、扣物、传功或绕过配点确认，入口条件满足且事务成功后才算完成。
- CONTENT-ch00a / 简体文本：专用 C01/C03 锁门、出口与交互文案仍待落地；现已用场景名、任务目标及 `tutorial.ch00.09.body` 消除全部悬空引用，专用正文新增后再替换。
- UI / RegionDef / 区域显示名：三张越地场景显示“越地”；初眠提交前禁离场由书眠编排保障。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

| 场景 | 尺寸 / 有效 / 可站立 | 出口与门禁 |
|---|---|---|
| `sc_00_zhulin` | ✅ 18×14 / 170 / 170 | `bookfall` 入场，东北 `to_shanjing↔山径.to_zhulin`；`gate_00_zhulin_chukou` 读取 `fl_00_staff_accepted` |
| `sc_00_shanjing` | ✅ 20×16 / 217 / 210 | 西南 `to_zhulin↔竹林.to_shanjing`；东南 `to_yueying↔越营.to_shanjing`，无硬锁 |
| `sc_00_yueying` | ✅ 20×18 / 261 / 260 | 西北返回山径；`camp_gate↔camp_gate_inner`；`gate_00_yueying_yingmen` 读取 `fl_00_baiyuan_merged`，C03 开始即可见范蠡；反向不锁，传功仍需双演示 |
| `sc_00_changbai_cave` | ✅ 10×8 / 70 / 42 | 雪崩单向进入；无 Door/战斗/拾取/轻功门；`wake_to_baima` binding 需 `fl_00_first_sleep_committed` 且尚未醒转（运行时保障见下） |

- ✅ 安全锚：`safe_bookfall`、`safe_from_zhulin`、`safe_from_shanjing`、`safe_snowfall_entry`；每图唯一安全出生 `bookfall/from_zhulin/from_shanjing/snowfall_entry`。
- ✅ 战场/交 CONTENT-ch00c：`arena_00_zhulin→enc_00_zhulin` 61 格/8×8，`arena_00_baiyuan→enc_00_baiyuan` 73 格/9×9，`arena_00_biandao→enc_00_biandao` 91 格/9×11；均连通、≤400、跨度≤20。
- ✅ 动作/奖励：7 个 `save/autosave`、7 个 `dialogue/start`，均精确匹配登记表；清除 14 个悬空 `eventId`。C01/C03 quest effects 唯一发奖；投桃 Ink 为 `party/takeItem item=it_tao count=1`；传功/配点/题卡均由 Ink 使用正确大小写及完整参数。
- ✅ NPC dialogue（均 `story_ch00_main`）：`npc_aqing_zhulin→aqing_first_meeting`、`npc_baiyuan_shanjing→baiyuan_choice`、`npc_fanli_yueying→fanli_request`、`npc_aqing_yueying→aqing_first_layer`，4/4 登记。
- ✅ Trigger dialogue（同一 story）：`pickup_bamboo_staff/pickup_tao→aqing_first_meeting`、`offer_tao→baiyuan_choice`、`interact_qingcha→fanli_request`、`transmission_inkpoint→aqing_first_layer`、`first_sleep_allocation→first_sleep_allocation`、`wake_to_baima→wake_to_baima`；均 `once:false`，登记完成旗标条件供执行端防重复。
- ✅ 2 gate+11 dialogue 均发布（越地 11 条、东北 2 条），地图/门禁共 21 处文本在简体源及重编译文本中可解析；⚠️ core 尚未消费 Trigger dialogue、dialogue `condition` 及 gate `lockedTextKey`，交 ENG-20/剧情/UI，运行时流程（待实测）。实际对象类为 PlayerSpawn/Door/Trigger/NpcSpawn/EnemyZone/BattleArena/QinggongGate/CameraHint。
- ✅ 本轮五条原命令全部退出 0：冻结安装；`content:build` 1189 对象/15 章；`content:validate` 1196 文件/1127 对象/2 Ink/65 图；`pnpm check` 163 文件/1189 测试及体积门通过；strict ID 新增失败 0。⚠️ 构建仍报既有缺素材/分块警告。
- ✅ Tiled 属性、出口配对、战场及 `git diff --check` 通过；静态 qg0 路径：关门可到白猿/营外→汇合开门→范蠡→边道→双演示→传功，无前置循环；四图几何指纹、12 个未改 binding 及雪穴预览 SHA-256 不变；本轮只改四图文本、营门 binding 与报告。**需作者确认（附默认）：无新增。**
