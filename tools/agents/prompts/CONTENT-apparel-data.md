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
3. **出图提示词**：
   - 用 `python3 tools/agents/extract_item_prompts.py --cat <类>` 生成本批各件的提示词文件，status 为 draft；
   - 逐件核对朝代形制、颜色和品阶画面语言，按 `item.md` §8 补足；
   - 只新增本批的文件。脚本若改动了已有提示词，把那些改动还原；
   - 总索引 `assets/default/prompts/INDEX.md` 不在本任务重建：合入后由开发监督在全量检出里重建，本批各件随之进「待出图」队列。图由 Gemini 出图员出（AR-31），本任务不出图。
4. **过程文件不进 assets/**：脚本、日志、临时文件放 `/private/tmp` 或 `.agents/`；`assets/` 下只新增本批提示词 `.md`。
5. 其他批次的条目不动。发现总表本身有错，照总表落，在报告里列出交协调者。

## 约束

- 写集：
  - `docs/design/catalog/` 下的 `items-clothing.md`、`items-armor.md`、`items-innerarmor.md`、`items-accessories.md`、`items-belts.md`、`items-shoes.md`：只追加本批的行；
  - `content/items/**`：只由生成器写；
  - `assets/default/prompts/items/**`：只新增本批提示词；
  - 写集外的改动在提交时会被丢弃。
- 不改总表与设计文档，不改生成器与校验脚本。
- 每次写入 ≤ 150 行；不得在 `/private/tmp` 做整仓检出（_common 规则 12）。

检查：以下命令必须全部通过。
- `python3 tools/agents/check_apparel_catalog.py docs/design/catalog/apparel-master.yaml --landed {{batch}}`
- 六份名录各自过 `python3 tools/lint/check_item_catalog.py`
- `python3 tools/content/items_from_catalog.py --check`
- `pnpm install --frozen-lockfile` 与 `pnpm content:validate`
- `python3 tools/agents/build_image_index.py --check` 的输出里，本批 ID 没有一条 ✘（别处已有的问题不算）
- `assets/default/prompts/items/` 下没有改动已有文件，新增文件只有本批 ID 的提示词
- `python3 tools/lint/check_ids.py --strict`

## 报告

≤ 30 行，写清：
- 本批件数，按类与朝代；
- 名录与内容数据的落点；
- 提示词件数；
- 总表的问题与待考项（附默认值）。
