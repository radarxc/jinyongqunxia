# DES-items-lore-5 报告 · 物品说明与属性投影 5（食品）· 逐件写短文并填属性投影（作者 10-02 晚）

## 1. 摘要（3–6 行）

- 已把食品名录 174 行由七列升级为九列，逐件补齐 60–120 字说明与 v2 属性投影。
- 原 174 个 ID、名称、分类、品阶、出处、效果字段及外观列逐字保留；未新建、改名或删除 ID。
- 89 个普通食材无即时效用，投影为 `—`；85 个食品均给 `stamina`，其中 7 件依明确的调伤叙事再给一项内伤或外伤治疗。
- 本轮返修补明百花糕外伤调养依据、清理腊八粥过时待确认措辞，并显式登记叫化鸡兼容问题；两条规定检查均通过。

## 2. 产出（文件、行数、主要章节）

- `docs/design/catalog/items-food.md`：259 行；九列名录、史实依据、术语、校验规则、待决追溯。
- `tools/agents/reports/DES-items-lore-5.md`：本报告；完成量、核算、开放问题、同步项与自检。

## 3. 关键结论与数值

- 完成 174/174 行：食材 89、食品 85；说明按去除 Markdown 标记后的 Unicode 码点计为 60–77 字。
- 取值例 1 `it_guisugao`：黄上 grade 3，体力典型式 `roundHalfUp(10×G(3))=roundHalfUp(10×1.20)=12`；得 `stamina=12`，与旧 `staPct=12%` 一致。
- 取值例 2 `it_tianxiangyulu`：天下 grade 10，`roundHalfUp(10×G(10))=28`，得 `stamina=28`；回内伤依“经络渐舒”取天阶带 0–10 内 `healInner=6`，共两项，旧 `staPct=28%` 一致。
- 特殊核对 `it_labazhou`：地上 grade 9，`qiCultivation=roundHalfUp(10000×0.35)=3500`，与旧 `sxpGrant=0.35` 双写一致；另取 `stamina=24`。
- `staPct=15.5%` 一律依 v2 `roundHalfUp` 投影为 `stamina=16`；运行仍保留旧字段的 15.5% 精度。

## 4. 开放问题（附默认值）

- `it_jiaohuaji` 的旧 `sta=full` 没有 v2 等价键；默认旧字段为唯一运行真值，`stamina=20` 仅作玄阶带上限摘要，不另结算。
- 已解决：`it_labazhou` 按食品特例投影 `qiCultivation=3500`（协调者 10-03 裁定，608aa8aa）；与旧 `sxpGrant=0.35` 按 §4.10.5 双写复算，运行时只生成一个 op。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无 / 不修改 `docs/00-canon.md` / `it_jiaohuaji` 的 `sta=full` 属 `design/10` 子规格问题，已列入第 6 节。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `design/10` / §4.10.4–§4.10.6 / 仅待澄清 `it_jiaohuaji` 的 `sta=full` 兼容规则；`it_labazhou` 的食品 `qiCultivation` 特例已经裁定并合入。
- 下游 ENG / 食品投影字段 / 常规只接 `stamina`、`healInner`、`healOuter`；旧字段含 `sxpGrant` 或 `perm.mpMaxPct` 的名菜／药膳可按食品特例读 `qiCultivation`，且不得重复结算；`it_jiaohuaji` 的 `sta=full` 仍以旧字段为运行真值。
- `design/06` / 无 / 本批没有 `qiEffect`，无需登记新 Buff 或效果 ID。
- 原著考据 / 名录 23 个带 **（待考）** 条目 / 按三联／广州修订版核人物、食物、情节及史籍具体名目后方可去标。
- 名录错漏 / 腊八粥已按食品特例补 `qiCultivation=3500` 双写并通过校验；未发现其他 ID 或旧列错漏。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 仅改负责的名录与报告；未改 ID、旧列、提示词或其他文档，未执行改变仓库状态的 git 命令。
- ✅ 174 行均为九列；每件说明 60–120 字，结合出处、外观提示与时令；百花糕的 `healOuter=7` 已有轻微皮肉伤叙事依据。
- ✅ 已解决：腊八粥按食品特例投影（协调者 10-03 裁定，608aa8aa），`sxpGrant=0.35` 与 `qiCultivation=3500` 双写一致且不重复结算。
- ✅ 下游 ENG 字段清单：常规食品只接 `stamina/healInner/healOuter`；腊八粥按条件特例另读 `qiCultivation` 但不得重复结算，叫化鸡 `sta=full` 仍读旧字段。
- ⚠️ 需作者确认（附默认）：`it_jiaohuaji` 的 `sta=full` 是否需在属性投影 v2 增加无损表示；当前默认旧 `sta=full` 为唯一运行真值，`stamina=20` 只作展示摘要，不重复结算。
- ✅ `python3 tools/lint/check_item_catalog.py docs/design/catalog/items-food.md`：通过，无错误、无警告。
- ✅ `python3 tools/lint/check_ids.py --strict`：通过；`git diff --check` 与自定义九列／字数／投影校验通过。
