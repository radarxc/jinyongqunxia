# DES-town2-pilot-content 报告 · 城镇探索 v2 · 试点内容（价目表、6 类店铺货单、三城设施绑定与店名、设施对话 Ink）
## 1. 摘要（3–6 行）
- 已交付 `price-table.v1`、6 类店铺的 7 份年代模板、三座试点城各 7 个设施、21 个原创店名与两章 14 个设施对话入口。
- 北宋大理与 702 年 ch10 已拆用 `shop_tpl_tiejiang` / `shop_tpl_tiejiang_tang`；21 个建筑引用均闭合且同城不重复。
- 马市、成衣、杂货与食摊对白已收敛到真实货单；杂货供货行 `priceBp` 均恢复 10000。
- 六项指定检查全部实际退出 0；内容校验为 1793 文件、1720 对象、4 个 Ink story。

## 2. 产出（文件、行数、主要章节）
- `content/common/economy/price-table.yaml`（54 行）：12 类 × 12 品阶参考价、24 种 ItemKind 映射。
- `content/shops/shop_tpl_*.yaml`（7 文件，89 行）：药铺、杂货、北宋 / 唐代铁匠、成衣、马市、食摊货单。
- `content/town/facilities/*.yaml`（3 文件，160 行）：21 个设施的建筑、店铺模板与角色槽绑定。
- `content/locales/zh-Hans/town-facilities.yaml`（62 行）：7 个模板名与 21 个设施名，均注释（原创扩展）。
- `content/town/facility-dialogues.yaml`（19 行）及两章 `story_ch*_facility.*`（299 行）：16 条四元组绑定、14 个入口 knot。

## 3. 关键结论与数值
| 城 / 设施 key | 建筑 id | 布局类型 | 店名 |
|---|---|---|---|
| 大理 ch01 / yaopu_01 | bi_0023 | shop | 苍山药肆 |
| 大理 ch01 / zahuo_01 | bi_0024 | shop | 南门杂货 |
| 大理 ch01 / kedian_01 | bi_0021 | inn | 洱风客舍 |
| 大理 ch01 / tiejiang_01 | bi_0025 | shop | 太和铁作 |
| 大理 ch01 / chengyi_01 | bi_0026 | shop | 白布衣肆 |
| 大理 ch01 / mashi_01；shitan_01 | bi_0010；bi_0011 | market_stall | 苍洱马市；南市食案 |
| 大理 ch10 / yaopu_01；zahuo_01；kedian_01 | bi_0010；bi_0011；bi_0005 | shop；shop；inn | 山南药行；洱岸货摊；洱岸逆旅 |
| 大理 ch10 / tiejiang_01；chengyi_01 | bi_0006；bi_0007 | market_stall | 横街铁作；青布衣摊 |
| 大理 ch10 / mashi_01；shitan_01 | bi_0008；bi_0009 | market_stall | 山口马集；洱岸饼案 |
| 吐鲁番 ch10 / yaopu_01；zahuo_01；kedian_01 | bi_0018；bi_0019；bi_0007 | shop；shop；inn | 西州药行；胡商货栈；高昌逆旅 |
| 吐鲁番 ch10 / tiejiang_01；chengyi_01 | bi_0020；bi_0021 | shop | 东市铁作；西市衣肆 |
| 吐鲁番 ch10 / mashi_01；shitan_01 | bi_0008；bi_0009 | market_stall | 驼马行；胡饼案 |
- 价目依据：照录 `design/10` §13.2；`P(cat,g)=P0(cat)×2.2^(g−1)`，按 `1 两=1000 文` 换算，0 表示不可交易。
- 货品数：药铺 8、杂货 9、铁匠北宋 6 / 唐代 6、成衣 1、马市 4、食摊 6，共 40 行；普通店均三日补货【建议值】。

## 4. 开放问题（附默认值）
- （原创扩展）：21 个设施名、建筑配对、无名店主对白与地方风物；默认保留为试点内容，不作原著或历史地籍断言。
- （原创扩展）：702 年大理采用中性洱岸聚落店名；默认不写未获上游确认的族属 / 政区称谓。
- （待考）：唐西州“药行、货栈、逆旅、衣肆、食案”等称谓及唐军器普及度仍待历史语言校审；默认沿用物品库待考状态。
- 库中无普通坐骑物品；默认马市只卖大豆、小米、盐、红枣，并在对白明示牲口交易未开放。
- 成衣库内只找到合适的 `eq_caoxie`，默认保留 1 行；`price-table.v1` 暂以 `armor→clothing`，尚不能按 slot 区分鞋类价格。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
- PT-01 / 允许价目表按 `kind + sub/slot` 覆写分类 / 否则 `armor` 无法落实 §13.2 的衣身与头手腰鞋两列。
- PT-02 / 增加普通马、驼的正式 `kind: mount` 物品 / 当前马市无法覆盖坐骑买卖流程。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `packages/core` 店铺设施接线：按设施 `sub` 为杂货注入买入 `shopBp=10500`、卖出 `outletBp=8000`；不得用供货行 `priceBp` 同时污染买卖价。
- `packages/data` / `PriceTableSchema`：若采纳 PT-01，增加 sub / slot 覆写，并明确 core 解析优先级。
- `design/10` 与物品目录：若采纳 PT-02，补低阶普通马 / 驼 ID、年代准入和马市供货。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ `pnpm install --frozen-lockfile` 退出 0（lockfile 最新、依赖已齐）。
- ✅ `pnpm content:build` 退出 0：1782 对象、15 章；`pnpm content:validate` 退出 0：1793 文件、1720 对象、4 Ink、65 地图。
- ✅ `pnpm content:compile-story` 退出 0：2 章 3 条 story line；`pnpm content:test-compile-story` 退出 0：4 tests。
- ✅ `python3 tools/lint/check_ids.py --strict` 退出 0：扫描 372 文件 / 76109 occurrences；5 个基线未定义项，本任务新增失败 0。
- ✅ 额外静态闭合：7 模板 / 40 供货行、21 建筑、16 个四元组绑定与 14 个 Ink 入口全部闭合；YAML 可解析，尾随空白扫描通过。
- ✅ 买价向量：`city_turpan__ch10/tiejiang_01` 的 `eq_tanghengdao`，V=4500、cha=50、speech=40、专营倍率 1、供货 10000：`4500×1.00×0.96=4320` 文。
- ✅ 卖价向量：同物 `4500×0.425×1.00=1912.5`，core 文取整期望 1913 文。杂货 `it_yan`（V=200）须由接口注入 `shopBp=10500/outletBp=8000`：买 `200×0.96×1.05=201.6→202` 文，卖 `200×0.425×0.80=68` 文；断言不等于供货行误乘 1.05 的 71 文。
