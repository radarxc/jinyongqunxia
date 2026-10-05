# TOOL-items-count-sync 报告 · 工具 · 小修：物品名录件数快照用例跟上 AR-77 衣物与护甲 1–7 批（先核实 1540 行无误解析，再改预期件数；集成分支 unittest discover -s tools 红）
## 1. 摘要（3–6 行）
已先核实 1540 行均为有效名录行，再更新快照；未改用例逻辑或放宽断言。
12 份名录逐份比较 `rows()` 与严格 `eq_` / `it_` 表格行，计数及 ID 顺序均一致；逐份 lint 全部 exit 0。
以 AR-77 第 1 批父提交为基线，新增 495、删除 0；新增 ID 与 `apparel-master.yaml` 的 batch 1–7 集合完全相等。
## 2. 产出（文件、行数、主要章节）
`tools/content/test_items_from_catalog.py` 295 行，仅改 5 个预期数；本报告 15 行、7 节。
## 3. 关键结论与数值
`items-accessories.md` 48→155；`items-armor.md` 8→15；`items-belts.md` 26→110；`items-clothing.md` 30→243；`items-collectibles.md` 151→151；`items-food.md` 174→174；`items-hidden-weapons.md` 51→51；`items-innerarmor.md` 8→8；`items-manuals.md` 180→180；`items-medicine.md` 96→96；`items-shoes.md` 26→110；`items-weapons.md` 247→247；合计 1045→1540。
## 4. 开放问题（附默认值）：无；默认继续保持逐名录精确快照。
## 5. 对基准的修改提案（编号 / 提案 / 理由）：无。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）：无。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
✅ `python3 -m unittest tools.content.test_items_from_catalog` 与 `python3 tools/content/items_from_catalog.py --check` 均 exit 0。
✅ `python3 -m unittest discover -s tools -p 'test_*.py'`：679 项通过；`python3 tools/lint/check_ids.py --strict`：exit 0、新增严格失败 0。
