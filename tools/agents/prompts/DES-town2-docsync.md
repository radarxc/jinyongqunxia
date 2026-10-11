# 本任务：城镇探索 v2 · 文档同步——把 AR-114 与 tech/14–16 定下的口径落进各归属文档

**第一个动作**：通读 `docs/tech/14-town-explore-v2.md`（尤其 §3 决定表与文首"本文取代"一段），再按下面清单逐个打开目标文档的对应章节动手改；不要先写计划。

本任务只改文档。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

## 背景
作者 AR-114（2026-10-10 / 10-11，见 `docs/decisions/author-requirements.md` 末条）把城镇探索全面升级：代码生成 3D 古建、原地进屋、店主对话采买、右上小地图跟镜头转且点击寻路、缩放快捷键、人物按身高、3D 人物。方案与契约已写在 `docs/tech/14-town-explore-v2.md`、`15-town-explore-v2-spec.md`、`16-town-3d-spec.md`（这三份**不改**）。各归属文档里还留着被取代的旧口径，会误导后续执行器。本任务把它们改成与 tech/14–16 一致，并在每处注明依据（「见 tech/14 §3 D7 / AR-114」这类引用），不在归属文档里重复定义 tech/15 / 16 的契约细节。

## 要改的地方（每处改完在报告第 2 节列"文件 / 节 / 改了什么"）
1. **`docs/design/26-immersive-ui.md`**：
   - 键位表（约 L171–179）：城镇 WASD / 方向键 = 按住走（屏幕相对），Q / E = 转镜头（四个 90° 预设），`=`/`+`、`-`、`0` = 缩放 / 复位，F / 空格 / 回车 = 交互，M = 全城图；删去「城镇 WASD / QE 为现有六向移动」。
   - 小地图（L134 一带与 §4.7 L284–296）：右上小地图跟镜头转、指北针、设置可改上北下南；点击即自动寻路——这条**覆盖** L173「打开总图不直接旅行」对区域图 / 城镇图的限制（大地图不变）；HUD 布局按 tech/15 §7.1（银两挪顶栏中部、右下交互条 ≤ 3 个文字动词）。
   - 店铺：采买在屋里——点店主 → 设施对话 →「看看货」→ 店铺界面；「与同行交谈」移到队伍功能。
2. **`docs/design/22-town-layout-and-generation.md`**：
   - L41 一带「PNG 与 GLB 同占地同锚点同 ID」改为：运行时建筑由代码按布局占地 / 类型 / 年代参数生成（tech/16），45° 手绘建筑图退出城镇运行时，留作造型参考与大地图缩略图；PNG 的锚点 / 占地仍是离线预览与对照的依据。
   - §0.2 / §1.3 关于大城拆街区：改为每城一个区域场景（≤ 256² 槽，tech/15 §2）；L85「生成 runtime_hex_walkable 与 RegionMap」补一句：由编译器 v2（`packages/data/src/build/town/**`）在内容构建期完成，室内 / 门格可走按 C6（tech/15 §2.4），不用六顶点法。
   - 开放问题 O1（L1004–1011）记为已解决：运行时 = 代码生成 3D（AR-114），PNG 只作预览 / 对照。
3. **`docs/design/11-open-world.md`**：§1.3 场景尺寸口径对城镇改为「每城一个场景，有效格 ≤ 25,600 且包围盒 ≤ 256²」；场景 ID 规则补 `sc_<NN>_town_<city>`；L498 自动寻路边界补「城内全图可见，小地图点击可直接寻路」；L1081 打坐与 AR-19 的冲突记为已解决：只在客栈房间、寺庙、僻静院落的打坐点（tech/14 D10）。
4. **`docs/tech/01-architecture.md`** §6.5：输入层落地为 `@tianshu/platform/input` + `apps/game/src/input/action-map.ts` 上下文栈（modal > dialogue > areaMap > explore > worldmap > global）；表中 `pan` 的 WASD 改为探索中「按住走」，平移改为拖动 / 边缘滚动；`zoom` 键改为 `=`/`+`、`-`、`0`。
5. **`docs/tech/02-rendering.md`**：§1.1 L182 一行注明「城镇视觉不再压缩：门净高 ≥ 2.1 m、檐 ≈ 2.9–3.3 m（tech/16 §3）；战斗高度级规则不变」；§1.4 注明城镇室内缺省档 96；§1.5 注明城镇改为可旋转（3D 建筑）；§3.5 注明城镇剖切三态与"朝镜头立面逐片元判"（tech/16 §6.4）；§5 注明城镇例外——不描边、不分阶（STYLE「写实古风」、design/22 L602）；Q11（约 L2035）记为已解决：小地图跟镜头转，设置可改上北下南（AR-114）。
6. **`docs/tech/03-mobile-performance.md`**：在包体预算处登记新块与预算（`render` 拆后 170、`render-explore` 32、`render-town-legacy` 14、`render-buildgen` 40 / Worker 24、`render-actor3d` 16、`render-meshopt` 8、`explore-ui` 45、`core-explore` 24、`core-shop` 8、路由 `webglExploreRoute` 420），注明依据 tech/15 §10。
7. **`docs/tech/05-gameplay-engine.md`**：§5.7 / §6.3（行走与 A*）补：探索行走改为 core 按 10 Hz tick 推进（`world/travelTo | steer | stop`）、二叉堆 A* 每命令只搜一次、旧 `world/walkTo` 退役前保留（tech/15 §4.1–4.2）。
8. **`docs/design/chapters/01-tianlong.md`、`docs/design/chapters/10-baima.md`**：登记试点场景 ID `sc_01_town_dali`（ch01 大理）、`sc_10_town_dali`、`sc_10_town_turpan`（ch10，唐西州 702，唐代佛教土坯风格，tech/14 D13），各一行，放在章节文档已有的场景 / 地点清单处。

## 约束
- 只改上面列出的文件；不改 tech/14–16、`author-requirements.md`、`00-canon.md`。需要改基准（canon §19 L888–889 的"固定斜 45° / 精灵建筑"表述）的，写进报告第 5 节「对基准的修改提案」，不要直接改。
- 改动都是增补或替换原句，保留被取代口径的痕迹（如「~~旧~~ → 新（AR-114）」或「（AR-114 起改为……）」），便于追溯；不删"待决事项"条目，已解决的改写为「已解决：……（见 X §Y）」。
- 每次写入 ≤ 150 行；结束前通读改过的段落，确认没有截断和断链。

检查：
- `python3 tools/lint/check_ids.py --strict`

## 报告
`tools/agents/reports/DES-town2-docsync.md`（≤ 60 行）：第 2 节逐条列改动；第 5 节写对 canon 的修改提案；第 6 节写仍需同步但不在本任务范围内的文档。
