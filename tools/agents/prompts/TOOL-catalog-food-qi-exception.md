# 本任务：工具 · 物品名录校验器的食品特例——描述含内力增益的名菜 / 药膳（如腊八粥）允许双写 `qiCultivation`

本任务改工具与一行规格。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读：
- `docs/design/10-items-and-equipment.md` §4.10.4（第 842–860 行一带：药品 / 食品字段）、§4.10.5（双写一致性与 `sxpGrant → qiCultivation` 公式）、§4.10.6（键白名单）；
- `tools/lint/check_item_catalog.py`（第 57 行 `"food": {"healInner","healOuter","stamina"}` 白名单；`check_nine()` 的双写检查）、`tools/lint/test_check_item_catalog.py`；
- `docs/design/catalog/items-food.md` 第 34 行 `it_labazhou` 腊八粥：旧效果 `grade=9; perm.mpMaxPct=2%; sxpGrant=0.35`（侠客岛腊八粥，原著即增内力）；
- 作者分类原话（`docs/decisions/author-requirements.md` AR-36 物品说明一段）：食品 = 补充体力 / 治疗内伤 / 治疗外伤，「其他 - 根据描述设计」。

## 问题

§4.10.4 规定食品只用 `stamina / healInner / healOuter`，白名单也只放这三个；但 §4.10.5 的双写规则要求旧字段有 `sxpGrant` 的行必须投影 `qiCultivation` 并相等（TOOL-catalog-9col 已把缺键判失败）。腊八粥同时触发两条，名录任务 DES-items-lore-5 无法通过校验。协调者 10-03 06:05 裁定：按作者「其他 - 根据描述设计」的口径，**描述含内力增益的名菜 / 药膳是食品的特例**，允许按 §4.10.5 双写 `qiCultivation`；普通食品仍不得带。

## 要做的事

1. `check_item_catalog.py`：食品类（`items-food.md`）的行，**仅当**旧「效果字段」含 `sxpGrant`（或 `perm.mpMaxPct`）时，白名单额外允许 `qiCultivation`（以及规格里与 `perm.mpMaxPct` 对应的永久键——若 §4.10.5 没有定义对应键，就只校验 `qiCultivation`，`mpMaxPct` 继续以旧字段为真值，并在报告 §6 写明需要规格补键）；没有这些旧字段的食品行若带 `qiCultivation` 仍判失败。双写公式沿用 §4.10.5。
2. `docs/design/10-items-and-equipment.md` §4.10.4 食品一句后加一句特例说明（引用协调者 10-03 裁定与腊八粥例子），§4.10.6 白名单表相应加注；不改其他章节。
3. 测试：`test_check_item_catalog.py` 补三条——腊八粥式行（`sxpGrant=0.35` + 投影 `qiCultivation=3500`）通过；普通食品带 `qiCultivation` 失败；腊八粥式行投影 `—` 失败并指出缺 `qiCultivation`。`python3 -m unittest discover -s tools -p "test_*.py"` 全过；`python3 tools/lint/check_item_catalog.py docs/design/catalog/items-food.md` 通过（名录本身不改）。

## 约束

- 只改：`tools/lint/check_item_catalog.py`、`tools/lint/test_check_item_catalog.py`、`docs/design/10-items-and-equipment.md`（只动 §4.10.4 / §4.10.6 的那两处），以及报告。不改名录、`content/**`、生成器。

## 报告

`tools/agents/reports/TOOL-catalog-food-qi-exception.md`，按 `_common.md` 的格式，≤ 40 行；§7 逐条对照第 1–3 条。
