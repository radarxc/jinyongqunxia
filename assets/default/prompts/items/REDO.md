# 物品图 · 要重出的 ID（作者 / 协调者填写）

一行一个物品 ID（`it_…` / `eq_…`），可在后面写原因。写进来的 ID 会在重建索引后进入待出图队列（`python3 tools/agents/build_image_index.py`），出图 agent 重出后覆盖同名 PNG 并更新 manifest 条目。
以 `#` 开头的行是注释。

# 示例：
# - `it_ershisiqiaomingyueye` 豆腐球数量不足 24 枚

# 作者 2026-10-01：「盔甲要突出年代特色（包括制式、颜色）」—— 制式盔甲 8 件全部重出
- `eq_songxunyijia` 宋制巡役甲：突出北宋地方巡役的制式与配色
- `eq_qingzaolijia` 清制皂隶衣甲：清代皂隶号衣制式与颜色
- `eq_yuanqibingjia` 元制骑兵札甲：蒙元骑兵札甲形制与皮革 / 铁色
- `eq_mingweisuojia` 明制卫所甲：明代卫所布面甲制式（红黑布面、铜钉）
- `eq_songjinjunburenjia` 宋制禁军步人甲：北宋步人甲札片、朱漆与披膊制式
- `eq_mingjinyiweijia` 明制锦衣卫甲：明锦衣卫甲胄制式与配色
- `eq_yuansuweiqiejia` 元宿卫怯薛甲：怯薛宿卫甲制式与贵重材质
- `eq_qingyulinjia` 清制御前侍卫甲：清御前侍卫棉甲 / 明甲制式与八旗色
