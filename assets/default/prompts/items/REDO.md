# 物品图 · 要重出的 ID（作者 / 协调者填写）

一行一个物品 ID（`it_…` / `eq_…`），可在后面写原因。写进来的 ID 会在重建索引后进入待出图队列（`python3 tools/agents/build_image_index.py`），出图 agent 重出后覆盖同名 PNG 并更新 manifest 条目。
以 `#` 开头的行是注释。

# 示例：
# - `it_ershisiqiaomingyueye` 豆腐球数量不足 24 枚
