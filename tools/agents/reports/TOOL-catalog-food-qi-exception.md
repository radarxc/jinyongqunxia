# TOOL-catalog-food-qi-exception 报告 · 工具 · 物品名录校验器食品特例：描述含内力增益的名菜 / 药膳（腊八粥）允许双写 qiCultivation（协调者 10-03 裁定），design/10 §4.10.4 / §4.10.6 加注
## 1. 摘要（3–6 行）
食品名录现仅在旧“效果字段”含 `sxpGrant` 或 `perm.mpMaxPct` 时允许 `qiCultivation`。
含 `sxpGrant` 的特例继续强制按 §4.10.5 双写，普通食品越权填写改为硬失败。
design/10 §4.10.4 与 §4.10.6 已同步协调者 2026-10-03 06:05 裁定及腊八粥算例。
新增 3 条回归用例；全量 33 tests 与现有食品名录 174 行均通过。

## 2. 产出（文件、行数、主要章节）
- `tools/lint/check_item_catalog.py`（471 行）：`check_nine()` 食品条件白名单与普通食品硬失败。
- `tools/lint/test_check_item_catalog.py`（327 行）：特例通过、普通食品拒绝、特例缺双写三条用例。
- `docs/design/10-items-and-equipment.md`（2841 行）：仅修改 §4.10.4 与 §4.10.6 两处说明。
- `tools/agents/reports/TOOL-catalog-food-qi-exception.md`（本报告）：裁定、验证与后续同步。

## 3. 关键结论与数值
- 条件准入：`items-food.md` 行须含 `sxpGrant` 或 `perm.mpMaxPct`，才可投影 `qiCultivation`；普通食品携带即失败。
- 双写沿用既有公式：`roundHalfUp(0.35 × 10000) = 3500`；缺键时报“缺少 `qiCultivation=3500`”。
- §4.10.5 未定义 `perm.mpMaxPct` 对应投影键；本轮不臆造，`mpMaxPct` 继续以旧字段为真值。

## 4. 开放问题（附默认值）
- 是否新增永久内力上限投影键待后续规格任务决定；默认继续只消费旧 `perm.mpMaxPct`，不从 `qiCultivation` 推导。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；本轮落实协调者裁定，不修改 `docs/00-canon.md`。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- 后续属性投影规格／schema／生成器任务：为 `perm.mpMaxPct` 定义正式永久键后，同步 design/10 §4.10.5、校验器与生成器；此前保留旧字段真值。
- `docs/design/catalog/items-food.md` / DES-items-lore-5：迁移腊八粥九列时写 `qiCultivation=3500`；本任务按约束未改名录。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 第 1 条：条件放行两种旧字段；普通食品 `qiCultivation` 硬失败；`sxpGrant` 公式未改。
- ✅ 第 2 条：只在 design/10 §4.10.4、§4.10.6 各加一处裁定说明，未改其他章节。
- ✅ 第 3 条：三条指定回归均通过；`python3 -m unittest discover -s tools -p "test_*.py"` 为 33 tests、OK；食品名录校验为 174 行通过。
- ✅ 写集：仅四个授权路径有改动；未改名录、`content/**`、生成器或 `TODO.md`。
