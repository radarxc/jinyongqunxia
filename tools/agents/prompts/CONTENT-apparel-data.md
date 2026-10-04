# 本任务：内容 · 衣物与护甲扩充落数据（作者 AR-77）第 {{batch}} 批：把总表第 {{batch}} 批落进物品名录与内容数据，逐件写出图提示词

本任务写内容数据。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开 pnpm store 写入。

先读：
- `docs/decisions/author-requirements.md` 的 AR-77；
- DES-apparel-catalog 的产出：`docs/design/27-apparel-by-dynasty.md` 与总表 `docs/design/catalog/apparel-master.yaml`。本任务只落 `batch: {{batch}}` 的条目；
- `docs/design/10-items-and-equipment.md` §2.2–§2.4、§3.1、§3.4、§4.1–§4.4：数值规则；
- 现有名录：`docs/design/catalog/items-*.md`。9 列：ID | 名称 | 子类 | 品阶 | 出处 | 说明 | 效果字段 | 属性投影 | 外观要点。格式校验是 `tools/lint/check_item_catalog.py`；
- 生成链：
  - `tools/content/items_from_catalog.py`：名录 → `content/items/**`，`--check` 核对两边一致；
  - `tools/agents/extract_item_prompts.py`：名录 → 逐件出图提示词 `assets/default/prompts/items/<类>/<ID>.md`；
- 出图规程：`assets/default/prompts/items/GUIDE.md`、`assets/default/prompts/item.md` §8。

## 要做的事

1. **落名录**：第 {{batch}} 批每件按总表的 `catalog` 追加到对应名录，9 列写全。
   - 品阶、效果字段、属性投影按 design/10 的公式和该件 `values` 的区间取值，口径与名录里同类条目一致（AR-25）；
   - 出处照总表：原著有出处的写书名与情节，没有的标「（原创扩展）」；
   - 说明、外观要点写清朝代形制与颜色，外观要点要能直接用来出图；
   - 头饰、披风进 `items-accessories.md`，子类分别以「头饰·」「披风·」开头，生成器按子类定槽位。
2. **生成内容数据**：跑 `python3 tools/content/items_from_catalog.py` 生成 `content/items/<ID>.yaml`。不手写、不手改生成结果。
   - 同步 `tools/content/test_items_from_catalog.py` 里 `test_repository_catalog_counts_match_expanded_sources` 的各名录件数，改成落完本批后的实际件数（协调者 10-04 05:5x：前几批落数据后这条仓库快照用例没跟着改，集成分支 `unittest discover -s tools` 红了）。只改那几个数字，不改用例逻辑。
3. **登记 ID**：本批新 ID 要在 `docs/design/10-items-and-equipment.md` §14.2「ID 清单」表里登记，`check_ids --strict` 才认它们是已定义的物品 ID（`eq_` / `it_` 的归属文档是 design/10）。
   - 在表末加一行：类别写「AR-77 衣物与护甲扩充 · 第 {{batch}} 批（件数）」，ID 列按名录顺序列出本批全部新 ID，格式同「AR-25 衣物扩张（18）」那一行；
   - 只加这一行，design/10 其余内容不动。
4. **出图提示词**：
   - 用 `python3 tools/agents/extract_item_prompts.py --cat <类>` 生成本批各件的提示词文件，status 为 draft；
   - 逐件核对朝代形制、颜色和品阶画面语言，按 `item.md` §8 补足；
   - 只新增本批的文件。脚本若改动了已有提示词，把那些改动还原；
   - **同款换色**（协调者 10-03 23:4x 定）：男装、女装按「同一朝代、同一性别、同一档」成组。
     - 每组选一件作底图，默认是该朝代偏好色那件。底图的提示词照常写全款式，先出。
     - 组内其他颜色是换色件：frontmatter 加 `edit_from: <底图 ID>`；`references` 第一条放底图的 `output` 路径，用途写「底图：只改主色」，后面再放两张画风基线。
     - 换色件的 `## 提示词` 写成编辑指令：以底图为底，只把主色改为「某色」，款式、剪裁、纹样、刺绣、配件、褶皱、材质、构图、光影、背景完全不变；不另写款式。
     - 出图照 `.claude/skills/gemini-imagegen/SKILL.md` §4「上传参考图（秘籍改题签）」的流程：`claudeGemOpts` 登记 `{template: '', refs: [底图路径]}`，不套模板。
     - 不许用代码改色相，也不许每种颜色各出一张款式不同的图。
     - `assets/default/prompts/items/GUIDE.md` 末尾追加一节「同款换色」，写明上面的出法和顺序（底图先出，换色件后出）。只追加，不改原有段落；已经有这一节的批次不再加。
   - 总索引 `assets/default/prompts/INDEX.md` 不在本任务重建：合入后由开发监督在全量检出里重建，本批各件随之进「待出图」队列。图由 Gemini 出图员出（AR-31），本任务不出图。
5. **过程文件不进 assets/**：脚本、日志、临时文件放 `/private/tmp` 或 `.agents/`；`assets/` 下只新增本批提示词 `.md`。
6. 其他批次的条目不动。发现总表本身有错，照总表落，在报告里列出交协调者。

## 约束

- 写集：
  - `docs/design/catalog/` 下的 `items-clothing.md`、`items-armor.md`、`items-innerarmor.md`、`items-accessories.md`、`items-belts.md`、`items-shoes.md`：只追加本批的行；
  - `content/items/**`：只由生成器写；
  - `tools/content/test_items_from_catalog.py`：只改名录件数快照；
  - `docs/design/10-items-and-equipment.md`：只在 §14.2 ID 清单表末加本批一行；
  - `assets/default/prompts/items/**`：只新增本批提示词，`GUIDE.md` 只在末尾追加「同款换色」一节；
  - 写集外的改动在提交时会被丢弃。
- 不改总表与 design/27，不改生成器与校验脚本；design/10 只加 §14.2 那一行。
- 每次写入 ≤ 150 行；不得在 `/private/tmp` 做整仓检出（_common 规则 12）。

检查：以下命令必须全部通过。
- `python3 tools/agents/check_apparel_catalog.py docs/design/catalog/apparel-master.yaml --landed {{batch}}`：同时查同款换色的分组（每组恰一件底图，换色件的 `edit_from` 和第一张参考图都指向它）
- 六份名录各自过 `python3 tools/lint/check_item_catalog.py`
- `python3 tools/content/items_from_catalog.py --check`
- `pnpm install --frozen-lockfile` 与 `pnpm content:validate`
- `python3 tools/agents/build_image_index.py --check` 的输出里，本批 ID 没有一条 ✘（别处已有的问题不算）
- `assets/default/prompts/items/` 下除 `GUIDE.md` 末尾追加外，没有改动已有文件；新增文件只有本批 ID 的提示词
- `python3 tools/lint/check_ids.py --strict`

## 报告

≤ 30 行，写清：
- 本批件数，按类与朝代；
- 名录与内容数据的落点；
- 提示词件数；
- 总表的问题与待考项（附默认值）。
- 第 6、7 节写引擎交接（第 1 批审核口径，协调者 10-04 01:5x）：接收任务 ENG-27a；列出消费的字段（`slot`、`armorWeight`、`attributes`，以及 `text.desc` / `runtimeProjection` 里保留的防御系数、气血系数、闪避、轻功、`wearer`）；下游怎样接入已有的 `EquipmentRule`、合入后要补测哪些数值与适用性检查；第 7 节写「需作者确认（附默认）」，没有新增就写「无新增，沿用第 4 节默认值」。
