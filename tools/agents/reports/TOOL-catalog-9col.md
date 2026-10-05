# TOOL-catalog-9col 报告 · 工具 · 物品名录九列格式：校验器与生成器跟上 design/10 §4.10.5（七列 / 九列过渡期都认）
## 1. 摘要（3–6 行）
校验器与生成器现按规范表头识别七列或九列，并拒绝同一文件混用。
九列新增说明、属性投影、双写一致性与告警检查；本轮堵住可复算键缺失绕过，并补齐类别必填键。
七列既有校验未放宽，889 份由七列名录生成的文件均与 `content/items` 逐字节相同。
指定全量单测、生成器检查、严格 ID 检查及 11 份名录逐份校验均通过。

## 2. 产出（文件、行数、主要章节）
- `tools/lint/check_item_catalog.py`（459 行）：双表头、九列语法/语义/双写/必填/告警、文件级混用检查。
- `tools/lint/test_check_item_catalog.py`（296 行）：七列回归及九列合法、边界、语法、引用、双写、必填、混用用例。
- `tools/content/items_from_catalog.py`（747 行）：双格式解析及 lore/attributes 内容投影。
- `tools/content/test_items_from_catalog.py`（201 行）：九列投影、空投影、混用拒绝、七列逐字节回归。
- `tools/agents/reports/TOOL-catalog-9col.md`（41 行）：规则映射、实测证据与后续交接。

## 3. 关键结论与数值
- §4.10.5 表头/列序与混用：校验器 22–25、366–435 行；生成器 41–49、174–218 行。
- 说明 60–120 码点（Markdown 标记不计）：校验器 102–107、315–317 行；单代码跨度、`—`、分隔、白名单、顺序、去重、整数/正式引用 ID：168–209 行。
- `qiEffect` 作者占位硬失败：322–323 行；品阶一致性及典型值带：324–346、423–428 行；类别适用性与 §4.10.7 值带只报警告：341–346、357–361 行。
- 双写（236–306、331–341 行）：硬校验 `atk/def/reflect/antiPoison/restoreQi/qiCultivation/con/healOuter/stamina`，以及旧列同名整数、`skill→skillRef`、`maxLayer`；能复算却缺键时报“缺少 `key=value`”，值异则报期望/实际。无法数值化的普通公式与非整数抗毒旧值只报警告；`sxpGrant` 对象在投影声明 `qiCultivation` 时硬查 mode/value。
- 类别必填（61–70、157–165、347–356 行）：武器 `atk/hardness/qiAffinity`；衣甲内甲 `def`；鞋 `def/agi`；秘籍 `skillRef/maxLayer`；护肩披风头饰 `def`、护腕护手另加 `block`；腰带等其他装备至少一项适用键；食品 `stamina`、药物/补品至少一项效用；普通食材与药材可为 `—`。
- §4.10.6 类别消费点与 §4.10.7 典型值带均只报警告；语法、白名单、键序、重复、非整数、占位及可复算不一致为失败。
- 内容目标：生成器 583–588 行写 `text.lore` 与 `extension.value.attributes`；`—` 写为 `{version: 2}`。
- 七列证据：单测 170–179 行逐个 `read_bytes()` 比较 889 个生成文件；`--check` 报 894 current / 889 generated / 5 bootstrap，退出码 0。
- 当前名录识别：accessories 七列 48；armor 七列 8；belts 七列 26；clothing 七列 30；food 七列 174；hidden-weapons 七列 51。
- 当前名录识别：innerarmor 七列 8；manuals 七列 180；medicine 七列 96；shoes 七列 26；weapons 七列 247。

## 4. 开放问题（附默认值）
- TOOL-items-catalog 需在其写集内确认 strict schema 接纳 `extension.value.attributes` 后重生成；默认保留本任务输出结构，本任务不改 `packages/**`、`content/**`。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；实现直接遵循 design/10 §4.10.5–§4.10.7。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- des34 各 lore 名录 / 九列机器行 / 复验须保证类别必填键齐全，且旧字段可复算键不得省略；已迁移工作副本会分别揪出 `it_labazhou` 缺 `qiCultivation=3500`、`eq_feiyuxue` 缺 `stamina=3`、`eq_kongqueling` 缺 `skillRef=sk_kongquelingfa`，由对应 lore 任务判断并修正旧列或投影。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 全仓 discover：33 tests，OK；另显式运行校验器 26 项、生成器 10 项，均 OK；前者含可复算键缺失、各类别必填与合法对照、普通食材空投影及 `sxpGrant` 对象/标量场景。
- ✅ `items_from_catalog.py --check`、`check_ids.py --strict` 均成功；后者 strict failure count 0（保留既有未定义 `sk_babuganchan` 提示）。
- ✅ 11 份 `items-*.md` 逐份通过，识别列数与行数见第 3 节；仅 5 个允许路径有改动，`git diff --check` 通过。
- ✅ 七列检查保持原约束；九列合法/非法用例覆盖长度、单位、小数、重复、未知键、占位、双写及混用。
- ✅ 交 des34：复验重点见第 6 节；交 TOOL-items-catalog：重生成将新增 `text.lore` 与带 `version: 2` 的 attributes。
