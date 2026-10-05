# 本任务：工具 · 物品名录校验器与生成器认收藏品 / 礼品名录 `items-collectibles.md`（AR-40；九列、七个子类、`giftValue/giftTo/eraRange/provenance/study/appraise` 机器行、`kind: collectible` 投影）

本任务改工具。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读：
- `docs/design/10-items-and-equipment.md` §11.5（v1.8，AR-40）：§11.5.1 七个子类（`porcelain / jade / bronze / qin / calligraphy / stationery / antique`，中文子类名以 §11.5.1 为准）、§11.5.3 字段表与机器行规范（`giftValue` 0–4、`giftTo={preferred:[…],disliked:[…],taboo:[…],sectRefs,npcOverrides}` 闭集标签、`eraRange=[…]` 年代带、`provenance=book|history|expanded`、`study={art,delta,once:true}|none`、`appraise={art:art,dc}`，`dc=8g−4`）、礼值按品阶带的默认映射、§11.5.5 年代带枚举；§4.10.5 / §4.10.6（九列通用规则与白名单：收藏品六个键 + 可选 `luck`）；
- `tools/lint/check_item_catalog.py`（第 18–68 行按文件名的子类白名单与类别键表；第 137–160 行按文件名分类；`check_nine()`）、`tools/lint/test_check_item_catalog.py`；
- `tools/content/items_from_catalog.py`（第 221 行 `rows()`、第 322 行一带的名录文件清单、`extension` 投影）与 `tools/content/test_items_from_catalog.py`；
- `packages/data/src/schemas/item.ts`（`kind: 'collectible'` 已在枚举，第 118 行 `CollectibleExtensionSchema`、第 126–133 行 kind → extension 的对应）；
- 实例：ART-items-gifts-catalog 工作区里的 `docs/design/catalog/items-collectibles.md`（377 行、151 件，按年代分成多张九列表；绝对路径 `/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-items-gifts-catalog/docs/design/catalog/items-collectibles.md`，只读；若该工作区已不在，以 `docs/design/catalog/items-collectibles.md` 为准）。

## 问题

ART-items-gifts-catalog 写出的 `items-collectibles.md` 是九列，但 `check_item_catalog.py` 不认识这个文件名，按七列判「应为七列，实际 9 列」（151 行全错）；`items_from_catalog.py` 的名录清单也没有它，`content/items` 不会生成收藏品。

## 追踪者在副本上复现的两条事实（直接当验收点）

1. **表头**：实例文件严格按 design/10 §11.5.3 的 AR-40 列序写：`| ID | 名称 | 子类 | 品阶 | 出处 | 效果字段 | 外观要点 | 说明 | 属性投影 |`。校验器现有的 `HEADER9` 是另一种顺序且列名带后缀（「出处（书名 / 原创扩展）| 说明 | 效果字段 | 属性投影 | 外观要点（供出图）」），对不上就按七列处理，于是 151 行全报「应为七列，实际 9 列」。校验器与生成器都要**按列名取字段**并认 AR-40 这个列序（只对 `items-collectibles.md`；既有十一份名录的 `HEADER9` 不动）。
2. **白名单**：把列序临时换成 `HEADER9` 后再跑，剩下 906 个问题全是「属性键不在白名单」，只涉及 `giftValue / giftTo / eraRange / provenance / study / appraise` 六个键；子类白名单也要给 `items-collectibles.md` 加上。名录本身没有别的问题。

## 要做的事

1. **校验器**：登记 `items-collectibles.md`——子类白名单（§11.5.1 七个子类，表里「子类」列写的是英文代码还是中文以实例文件为准，两者都要能对上）、九列识别（表头顺序按 §11.5.3）、类别键表 `("giftValue","giftTo","eraRange","provenance","study","appraise")` + 可选 `luck`；按 §11.5.3 校验：`giftValue` 整数 0–4 且与品阶带默认映射一致（偏离要在说明里有依据，否则报失败）、`giftTo` 标签只能来自闭集、`eraRange` 只能是 §11.5.5 的年代带、`provenance` 三选一、`study` / `appraise` 的对象语法与 `dc=8g−4`；「说明」60–120 码点；「属性投影」里对象 / 数组值的语法按 §11.5.3（现有九列规则只许整数值——给收藏品开专门分支，不放宽其他名录）；双写：效果字段里的 `giftValue/giftTo/eraRange/provenance/study/appraise` 与投影一致。
2. **生成器**：名录清单加 `items-collectibles.md`；行投影成 `kind: collectible`、`sub` 为子类代码、`extension: {type: 'collectible', value: …}` 按 `CollectibleExtensionSchema`（字段名以 schema 为准，不改 schema；对不上就在报告 §6 写明并只生成 schema 认的字段）；`text.lore` 来自「说明」。`--check` 对现有十一份名录输出必须逐字节不变（收藏品是新增文件，不影响旧输出）。
3. **测试**：`tools/lint/test_check_item_catalog.py` 补收藏品合法行、`giftTo` 非闭集标签、`giftValue` 越界、`eraRange` 非法、九列顺序错各一条；`tools/content/test_items_from_catalog.py` 补收藏品行生成 `kind: collectible` + extension 的用例。用 `python3 -m unittest discover -s tools/lint -t tools/lint` 与 `-s tools/content -t tools/content` 各自跑（`discover -s tools` 目前跑不到这两目录，TOOL-tests-discover 在修）。
4. 对实例文件跑 `python3 tools/lint/check_item_catalog.py <items-collectibles.md>`，把结果（通过 / 哪些行真有问题）写进报告 §3——真有问题的行不改名录（不在写集），列出来交 ART-items-gifts-catalog 返修。

## 约束

- 只改：`tools/lint/check_item_catalog.py`、`tools/lint/test_check_item_catalog.py`、`tools/content/items_from_catalog.py`、`tools/content/test_items_from_catalog.py`、`tools/content/README.md`（若有），以及报告。不改 `packages/**`、`docs/**`、`content/**`、名录。
- 不放宽既有十一份名录的任何规则。

## 报告

`tools/agents/reports/TOOL-catalog-collectibles.md`，≤ 50 行，按 `_common.md` 的格式；§3 写实例文件的校验结果与问题行；§6 写 schema 字段对不上的地方；§7 逐条对照第 1–4 条。
