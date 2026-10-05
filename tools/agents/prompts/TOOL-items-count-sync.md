# 本任务：工具 · 小修：物品名录件数快照用例跟上 AR-77 衣物与护甲 1–7 批（集成分支 `unittest discover -s tools` 红：1045 != 1540）

本任务只改一个测试文件。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。不要调用任何技能；不改 node_modules。**直接动手，不要只写计划就结束。**

## 为什么做

- `tools/content/test_items_from_catalog.py` 的 `test_repository_catalog_counts_match_expanded_sources`（第 85–97 行）把各名录件数写死了，例如 items-clothing.md 30、items-accessories.md 48。
- AR-77 衣物与护甲第 1–7 批往名录里加了约 495 行，用例没跟着改。apparel 任务的校验不跑 tools 单测，一路都过了；现在集成分支单跑这个用例失败：`1045 != 1540`。
- 影响：之后所有带 `python -m unittest discover -s tools` 的 TOOL 任务都会栽在这里，例如 rig-std-parts、map-compose。

## 要做的事

1. **先核实**这 1540 行确实都是有效名录行，没有误解析：
   - 逐份名录比对「`items_from_catalog.rows()` 解析出的行数」和「名录里以 `eq_` / `it_` 开头的表格行数」；
   - 各名录过 `python3 tools/lint/check_item_catalog.py <名录>`；
   - 新增行的 ID 都能在 `docs/design/catalog/apparel-master.yaml` 里找到。
   - 有误解析就停下写进报告，不要改数字掩盖。
2. 核实无误后，把用例里各名录的预期件数改成当前实际解析出的行数。只改数字，不改用例逻辑、不放宽断言。
3. 报告列出每份名录改前、改后的件数，以及核实方法。

## 约束

- 写集：`tools/content/test_items_from_catalog.py`。写集外的改动在提交时会被丢弃。
- 每次写入 ≤ 150 行。

检查：以下命令必须全部通过。
- `python3 -m unittest tools.content.test_items_from_catalog`
- `python3 tools/content/items_from_catalog.py --check`
- `python3 -m unittest discover -s tools -p 'test_*.py'`
- `python3 tools/lint/check_ids.py --strict`

## 报告

≤ 15 行，写清：各名录件数改前改后、核实方法与结论。
