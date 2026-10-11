# TODO：天书录（2026-10-04 09:00 起）

旧版 TODO 归档在 `docs/archive/TODO-2026-10-04.md`。启动方式和 skills 入口见 `AGENTS.md`，AR 完成状态见 `docs/decisions/author-requirements.md` 开头。

## 0. 现状
- **M1**（开局 → 序章 → 初眠 → 白马第一段）：只差 `ENG-ch00-encounter-wiring`，其余都已合入。
  - wiring 第 3 轮审核没过，执行次数用完，停在 HOLD-RUNS。还要再起一轮返修，命令见 §5。
  - wiring 合入后，在浏览器里实走一遍 M1，照 wiring 报告里的「序章三战手动实走步骤」走。
- **额度**：开发监督（Claude）10-04 约 07:20 用完周额度，10-09 12:00 重置，现在改用 credit，要省。
  - 不开监视，不开开发监督。
  - 驱动、运维守护进程、城图调度都还在自己跑，这些不耗 Claude 额度。
- **主干**：全绿。首次会话 94.9 KiB，目标 ≤ 92；render 179.42 KiB，门值 180，余量只剩 0.58 KiB。

## 1. 等作者 / 进行中（AR-91，10-04 09:10）
1. **已定，正在执行**：两个 GPT 会话 09:10 起跑，进度看各自收件箱，完成时会写「【完成】」。
   - 霍青桐用 E：会话 `huoqingtong-final`，出图器 w31，收件箱 `.agents/coord/_inbox/huoqingtong-final.md`；
   - 历史人物第二批 21 人原样入库并对齐：会话 `hist-ingest2`，出图器 w34，收件箱 `.agents/coord/_inbox/hist-ingest2.md`。
2. **已定，不用 Next.js**：AR-21 作废，沿用 Vite + Vue。
3. **待作者过目**：
   - 小镜湖 r5「遗憾的笑」；
   - 绿柳庄照剧照重画；
   - 江湖归去远景；
   - 襄阳献礼；
   - 郭靖 B 全量；
   - 四位女主；
   - 索菲娅身材；
   - 张无忌 F。

## 2. 工程
- **HOLD-RUNS**：`ENG-ch00-encounter-wiring`（M1），再起一轮返修，见 §5。
- **READY（合入时冲突，要挪基点、解冲突）**：
  - `ENG-move-onhit-effects`；
  - `DES-prologue-ch00`，10-01 的旧件，先判断还要不要。
- **在跑**：`ENG-dialogue-runtime-lazy`，把对话意图执行器拆出首屏，验收要求首次会话 < 92。
- **已登记待起**：
  - `ENG-render-diet`：render < 170，挪出去的分块必须有预算；
  - `ENG-27a/b/c`、`ENG-28a/b`：依赖的 18c 已合入；
  - `ENG-12d`、`TOOL-town-gaps-1`；
  - `TOOL-step-lazy-worktree`：磁盘 ≥ 8 GiB 再起。
- **旧件，要人看过再定**：
  - HOLD-VALIDATE：`ART-rig-parts-female/male`、`VFX-sk_dugu9`；
  - HOLD-REVIEWS：`ART-item-armor`、`VFX-sk_hama`；
  - ERROR：`ART-item-hidden-weapons`。

## 3. 素材
- **大地图**（AR-111，10-10 起，取代 AR-83 的程序拼图路线）：整张水墨底图 + 2D 叠路径 / 城镇坐标，契约 `docs/tech/13-worldmap-painted.md`。
  - 运行时 `ENG-worldmap-painted-2d`：**10-10 23:25 完成**，GPT-5.6-Sol 审核 PASS，协调者无头 Chrome 实测通过（夹边、缩放、点城出发、空闲 0 rAF）。改动在主检出工作区、与他人未提交改动交织，未提交；改前 `refs/backup/main-wip-20261010-ar111`，改后（含新文件）`refs/backup/main-wip-20261010-ar111-2d`。报告 `tools/agents/reports/ENG-worldmap-painted-2d.md`。`packages/render/src/worldmap/**` 已不被页面使用，待清理任务删除并改 render CLAUDE.md 的 ENG-08 段。
  - 底图 `ART-worldmap-painted`：**10-11 00:15 交付**（ace71dd37）——GIS + 仓库水墨贴图确定性合成 4096×3072，`tools/map/paint/compose_world.py --deliver` 可逐字节复现；审样两轮（山件 1234→618、平原留白、大河加宽）。待作者过目；已知瑕疵见 manifest notes（窄岛山小、平原无田畴、渭河 / 汾河 scalerank 超阈值未画）。
  - 海口、崖州坐标：主检出未提交改动曾把两城挪到吕宋岛并配两条跨海路；10-11 协调者改回海南（[304,332] / [299,346]），两条路改走雷州半岛与海南东线，14 章 map.yaml 都改了（仍未提交，备份 `refs/backup/main-wip-20261011-ar111-hainan`）。这两条路不在 `worldmap_from_towns.py` 的生成源里，重跑生成器会丢，需补进 routes.yaml。
  - `TOOL-map-compose`（AR-83）样区画风未过，停用，工具保留备查。
  - **AR-113 第二轮（10-11 01:00 起）**：
    - 状态栏左下去立绘、图例挪右下：协调者已改（主检出工作区，未提交）。
    - 补渭河汾河等 + 道路真实走向：**已交付并提交**（c27c2e77b）；山件收在起伏带内（618→745），青藏腹地偏空待作者看。
    - `ENG-worldmap-tiers-paths`：traex 因内网域名解析失败（GPT 两个模型都连不上）未能运行，**按 AR-110 由协调者直接实现**：schema / enrich 已提交（c27c2e77b）；页面（曲线道路、主角沿路插值、kit 图集分档图标、名城小景地图平面绘制、字号分档）与构建（markers / landmark 发布、`landmark/index.json`）在主检出工作区，备份 `refs/backup/main-wip-20261011-ar113`。**网络恢复后补 GPT 审核**。
    - `CONTENT-tang-placenames`（Opus 子代理，作者 10-11「历史朝代地名要做起来」）：ch10 唐 702 地名 / 地位 / 开放、修生成器（按书界名取年份、输出规范 pretty JSON）、14 章重出 + enrich；进度 `.agents/coord/CONTENT-tang-placenames/STATUS.md`。
    - `ART-worldmap-landmarks`（新 Opus 子代理）：分档图集（kit 缩成 128 格）+ 名城小景首批（北京、长安 / 西安各年代），程序按史料版式 + 年代建筑套件上墨，缺件才出单体建筑图。
    - 待办：ch10 按 AR-26 是唐 702，但大地图仍是清初年份与地名（「西安府」应为「长安」都城），要补唐代一档城市名称与地位（内容任务）；`tools/content/worldmap_from_towns.py --check` 已坏（design/02 时间表改过），重跑生成器前先修，且生成后要再跑 `worldmap_enrich.py`。
- **城图**：202 / 1172，city_scheduler 自己在推；`CITY-layouts-ch01-b` 审核没过，正在返修。
- **插图**：26 份提示词还没出图，清单在 `.agents/coord/_lines/title-audit/missing_plates.tsv`。
- **衣物与护甲出图**（AR-77 / AR-91 记入 TODO）：数据 8 批已合入，565 件待 Gemini 出图。作者方便时，先开两个 Gemini 标签页（窗口要在前台），出一组样图给作者看，再批量出。同款先出底图，其他颜色上传底图只改主色（换色件带 `edit_from`），入口见 AGENTS.md §3。
- **礼品**：还差 `it_yuanqinshufang`（七弦琴），要配参考照。
- **人物立绘派生**：base 改过一大批，`portrait_stage_runner` 派生和素材审核页（artifact 7H7nYXyBSRJJSNFBwsDGjM）还没重跑。

## 4. 3D（AR-85 搁置，M1 跑通后再排）
- 待办：
  - AR-79 全量重做：新比例、脸部还原、贴图严查、按原著身高；
  - 郭靖金刀驸马装；
  - 换过脸的主角重做；
  - 通用模型的小瑕疵：男模瞳色偏灰蓝，女模鬓边碎发贴成了肤色。
- 参考资料：
  - 体检 `.agents/coord/ART-3d-tripo-web/audit_ar79.md`；
  - 比例样张 `_lines/apose-ar79/apose_samples.jpg`；
  - 身高表 `_lines/apose-ar79/heights.csv`；
  - 各会话的 `todo_3d.md`；
  - Tripo 会把头放大 4–6%，送图前要拉长（女模 ×1.1644）；
  - 走路速度约 0.6、跑步约 2.1 模型单位 / 秒。

## 5. 恢复命令（在 `.agents/wt/_prod` 下）
- wiring 再起一轮返修（审核意见会自动附上）：
  ```bash
  python3 .agents/coord/_handoff/detach_launch.py .agents/coord/ENG-ch00-encounter-wiring/supervise.out "$PWD" -- python3 -u tools/agents/supervise.py ENG-ch00-encounter-wiring --max-reviews 1 --max-runs 1 --auto-merge --worker --model GPT-5.6-Sol --effort max --checks .agents/coord/PROD/review_checks_eng.md --from start
  ```
- 其余见 `AGENTS.md` §2。
