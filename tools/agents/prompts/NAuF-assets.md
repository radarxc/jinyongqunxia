# 本任务：终审拆分 · 素材管线的作者决定同步（author-requirements、author-decisions、design/11、19、map、tech/02、06、07）

你负责"经脉系统落地最终核对"（原 NAu-final）按写集拆出来的一个并行子任务。终审拆成多个任务同时运行，**只改本任务写集内的文件**；写集外发现的问题写进报告第 6 节与第 7 节"交其他任务"，由最后的收口任务 NAu-final 统一处理。注意：上面通用规则里"不改作者决定 / 作者需求文件"对本任务不适用——这两份文件在本任务写集内，但只许**照录作者原话并登记落实位置**，不得改写、概括或替作者做决定。

背景：2026-09-29 起作者对素材线连续作了决定，原话照录在 `assets/default/STYLE.md` 文首"作者原文"；协调记录在 `tools/agents/HANDOFF.md` §2 与 §9。这些决定还没有同步进决策记录与技术 / 策划文档。相关设计文档已合入：`docs/design/22-town-layout-and-generation.md` 与 `docs/design/town/`（城镇程序化生成，TOWN-design）、`docs/design/23-projection-vfx-pipeline.md` 与 `docs/design/vfx/`（外放招式两段式管线，VFX-design）；它们的报告（`tools/agents/reports/TOWN-design.md`、`VFX-design.md`）第 6 节列了"需同步到其他文档"。已作废的纯生图任务 ART-B-town、ART-B-bldmap 的报告没有入库，只在工作区里可读：`/Users/bytedance/Projects/jinyongqunxia/.agents/wt/ART-B-town/tools/agents/reports/ART-B-town.md`、`/Users/bytedance/Projects/jinyongqunxia/.agents/wt/ART-B-bldmap/tools/agents/reports/ART-B-bldmap.md`（若存在，只读其"需同步到其他文档"一节）。

本任务的文件（只改这些）：

- `docs/decisions/author-requirements.md`、`docs/decisions/author-decisions.md`
- `docs/design/11-open-world.md`、`docs/design/19-world-map.md`、`docs/design/map/**`
- `docs/tech/02-rendering.md`、`docs/tech/06-asset-storage.md`、`docs/tech/07-asset-generation.md`

## 要做的事

1. **照录作者决定**：在 `docs/decisions/author-requirements.md` 新增作者需求条目（编号接续现有 AR-18 之后，可按主题合并成一到三条），把 `assets/default/STYLE.md` 文首"作者原文"逐字照录，每条写明落实位置。至少覆盖：
   - 素材按统一风格创建、风格包即 mod；默认风格按类别（地图古风水墨、城镇与建筑写实古风按年代、人物武侠、招式水墨意境、物品武侠、经脉图等写实）；先出基线、作者审批、再批量；后续生成输入基线参考与描述，人物可再加知名作品的角色画像（来源与授权待作者确认）。
   - 二进制素材入库 `assets/<style>/`；出图用本机 GPT CLI。
   - 「城市图要45度视角（主角要能在城市地图上移动）」。
   - 「建筑分两种， 一种是类似立绘，另一种是要拼到城市地图上，第二种要45度」。
   - 六脉神剑类是气剑的那段原话，以及随后的"线性的、持续的"要求。
   - 城镇改程序化生成的那段原话（参考年代平面图生成坐标 → 分区 → 填功能建筑 → 贴片渲染底图 → 贴建筑）。
   - 外放招式分两部分做的那段原话（白底效果多帧图 + 发出方图，程序按方向叠加、多帧过渡成动效）。
   - 2026-09-30：「你负责规划、拆解和准出，任务的执行/图像生成/多模态校验调用gpt cli(gpt 6 astra ultra 和 extra high）来完成。」「调用gpt，不要调用traex cli，我有gpt」。
   STYLE.md 里没有逐字原文的，不要自己补写"原话"，写"见 `tools/agents/HANDOFF.md` §2 协调记录"。
2. **`docs/decisions/author-decisions.md`**：P02（出图入口）按现状更新——出图、执行与审核都用本机 GPT CLI（Codex，gpt-6-astra，推理强度 ultra / xhigh），审核工具 `tools/agents/gpt_review.py`；traex 与 Gemini 网页版不再是入口。只更新事实与落实位置，不改其他已定项。
3. **`docs/tech/07-asset-generation.md`**：§2（美术圣经）写明按类别的默认风格，与原"工笔为骨、水墨为气"的并存关系写清；城镇行与建筑行按作者原话改（建筑拆成"立绘式"与"地图拼接（45 度）"两类，同步素材类别、ID 规则、规格：占地格、锚点、透明底、与城镇图一致的投影与光源）；招式行写明气剑类例外，并登记哪些武学属于"气剑类"（默认：以内力凝成剑形外放的指 / 剑类武学，如六脉神剑；列入"需作者确认"）；§4 / §6.1–§6.2 生成入口改为本机 GPT CLI 的 `image_gen`，二进制素材入库 `assets/<style>/`、风格包即 mod；§5 把城镇程序化管线（design/22）与外放招式两段式管线（design/23）登记为正式管线并引用，不重定义；§9.2 同步。
4. **`docs/tech/06-asset-storage.md`** §0 D1 与 §2.1–§2.2：二进制素材入库的口径（与原"三层存储"方案的关系：基线与风格包入库，运行时分发方案不变或如何调整，写清楚）。
5. **城市场景口径**：先全仓检索现有"城市 / 城镇 / 场景地图 / 俯视 / 视角 / 相机"口径，与作者原话冲突的以原话为准。`docs/design/19-world-map.md` 与 `docs/design/map/`：城市地图是主角可行走的 45 度场景，与水墨大地图的关系、进出方式；`docs/design/11-open-world.md`：城市场景规格与 design/22 的衔接（场景尺寸、街区拆分 `sc_<NN>_<拼音>`、营生场所落点）；`docs/tech/02-rendering.md`：涉及场景 / 相机 / 角色移动 / 特效层的章节与 design/22、design/23 对齐（引用，不重定义）。投影方式、格子尺寸等以 design/22 为准。
6. **TOWN-design、VFX-design 报告第 6 节**交给本写集文档的同步条目逐条处理；ART-B-town、ART-B-bldmap 报告交来的条目若仍适用，一并处理。
7. **指名条目**：`docs/design/11-open-world.md` 倚天规模行"主线 10"改为"每路线 14 幕"（D04-B07）。
8. **不做的事**：不改 `assets/`、不改 design/22、23 与 `docs/design/town/`、`docs/design/vfx/`；不刷新文首引用的基准版本号（收口任务统一刷）；`TODO.md` 由收口任务更新。
9. 每次写入不超过约 150 行；只改相关段落，不删无关内容；改动的文档版本行 / 变更记录追加"素材管线决定同步（{{date}}）"。

检查：以下命令必须全部通过。
- `python3 tools/lint/check_ids.py --strict`
- `python3 -m unittest discover -s tools/lint -p "test_*.py"`
- `python3 tools/map/render_map.py --check`

## 报告

第 7 节写：作者原话照录清单（每条原话 / 落在 author-requirements 的哪一条 / 落实位置）；逐文档处理表（位置 / 改前 → 改后）；与 design/22、23 的对齐结论；需作者确认的事项（逐条附默认值，至少含：气剑类武学清单、人物参考用知名作品画像的来源与授权、TOWN-design 的 O1–O6、1093 年大理是否保留三塔整体意象）；交其他任务的条目。
