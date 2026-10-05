# 本任务：工具 · 物品名录九列格式：校验器与生成器跟上 design/10 §4.10.5（七列 / 九列过渡期都认）

本任务改工具。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读：
- `docs/design/10-items-and-equipment.md`：
  - v1.7 变更摘要，第 13 行一带；
  - §4.10.5 名录九列格式与机器行语法；
  - §4.10.6、§4.10.7；
  - 第 96 行与第 2516、2562 行的投影说明；
- `tools/lint/check_item_catalog.py`、`tools/content/items_from_catalog.py`、`tools/content/test_items_from_catalog.py`；
- 设计报告 `tools/agents/reports/DES-items-attrs-spec.md`。

## 为什么做

DES-items-attrs-spec（d8a6ca9c）已把十一份 `catalog/items-*.md` 的规范表头从七列升到九列：
- 新增「说明」，映射 `text.lore`；
- 新增「属性投影」；
- 旧「效果字段」原样保留。

des34 的 8 个 DES-items-lore-* 任务正在逐份名录改成九列，但两个工具还只认七列：
- 校验器 `tools/lint/check_item_catalog.py` 只认七列，DES-items-lore-8 在 10-03 00:34 因此被拦：「应为七列，实际 9 列」。其余 7 个 lore 任务也会同样被拦。
- 生成器 `tools/content/items_from_catalog.py` 只解析七列。名录升级后，TOOL-items-catalog 重新生成时会失败。

过渡期内，有的名录是七列、有的已是九列，两种都得认。

## 规格（照这些写，不自创）

- `docs/design/10-items-and-equipment.md` §4.10.5：
  - 九列表头与列序；
  - 「说明」：60–120 个 Unicode 码点，标点计入，Markdown 标记不计；
  - 「属性投影」：只有一个反引号代码跨度；语法 `key=value; key=value`，分号后恰一个空格；键小写驼峰、不重复；值为整数，不带 `%`、小数、千分位或单位；无属性写 `` `—` ``；`qiEffect` 的「（原创扩展：一句话）」占位构建不通过；
  - 各类别的规范键顺序；
  - 双写一致性：按规范化后相等校验，由旧「效果字段」复算。
- §4.10.6：键白名单与消费点；§4.10.7：典型值带。只用于报警告，不作硬失败，除非 §4.10.5 写明构建失败。

## 要做的事

1. **校验器** `tools/lint/check_item_catalog.py`：
   - 按每个文件的表头识别七列（旧）或九列（新）；
   - 七列照旧检查；
   - 九列加查：
     - 列数恰为 9；
     - 「说明」长度 60–120；
     - 「属性投影」语法：键白名单、按类别的键顺序、不重复、只能整数；
     - `qiEffect` 的作者阶段占位报失败；
     - 双写一致性：能由旧列复算的键，按 §4.10.5 的公式逐条比对，不一致报失败；
   - 同一文件内七列、九列混用报失败；
   - 输出格式与现有一致：行号、ID、原因。
2. **生成器** `tools/content/items_from_catalog.py`：
   - 两种表头都能解析；
   - 九列时：「说明」写入 `text.lore`；「属性投影」解析后写入 `extension.value.attributes`（`version: 2` 加合法键），位置照 §4.10.5「内容投影目标」；
   - 旧「效果字段」的映射不变；
   - 对现有名录全是七列的情况，`--check` 结果必须与当前 `content/items` 逐字节一致。本任务不重新生成、不提交 `content/items/**`。
3. **测试**：
   - 新增 `tools/lint/test_check_item_catalog.py`：七列合法 / 非法、九列合法、长度越界、单位与小数、重复键、白名单外的键、占位、双写不一致、七九列混用，用合法例与非法例各至少一条；
   - 扩展 `tools/content/test_items_from_catalog.py`：九列行生成 `text.lore` 与 `extension.value.attributes`；七列行输出不变。

## 约束

- 写集：`tools/lint/check_item_catalog.py`、`tools/lint/test_check_item_catalog.py`、`tools/content/items_from_catalog.py`、`tools/content/test_items_from_catalog.py`。写集外的改动在提交时会被丢弃。
- 不改 `docs/**`（名录与规格都不动）、`content/**`、`packages/**`。
- 只用 Python 标准库；每次写入 ≤ 150 行。
- 不得放宽现有七列检查。

检查：以下命令必须全部通过。
- `python3 -m unittest discover -s tools -p "test_*.py"`
- `python3 tools/content/items_from_catalog.py --check`
- `python3 tools/lint/check_ids.py --strict`
- 对 `docs/design/catalog/` 下每一份 `items-*.md` 运行 `python3 tools/lint/check_item_catalog.py <文件>`，全部通过。报告列出每份文件识别出的列数。

## 报告

第 3 节写：
- 九列规则对照（§4.10.5 条目 → 代码位置）；
- 双写一致性实现了哪些键、哪些只报警告；
- 七列输出逐字节不变的证据。

第 7 节写交接：
- 交 des34 的 lore 任务：它们复验时要注意什么；
- 交 TOOL-items-catalog：重新生成时会多出的字段。

报告 ≤ 50 行。
